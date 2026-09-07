// ──────────────────────────────────────────────────────────────
// SDG Nexus — Background Job Runner
// Async processing for heavy tasks (risk scan, funding gap recalc)
// ──────────────────────────────────────────────────────────────

import config from '@/server/config';

type JobFn = () => Promise<void>;

interface JobDefinition {
    name: string;
    fn: JobFn;
    intervalMs: number;
    lastRun?: number;
    running: boolean;
}

const jobs: JobDefinition[] = [];
let initialized = false;

/**
 * Register a background job.
 */
export function registerJob(name: string, fn: JobFn, intervalMs: number) {
    jobs.push({ name, fn, intervalMs, running: false });
}

/**
 * Run a single job (with error isolation).
 */
async function runJob(job: JobDefinition) {
    if (job.running) {
        console.log(`[Jobs] Skipping ${job.name} — already running`);
        return;
    }

    job.running = true;
    const start = Date.now();

    try {
        await job.fn();
        job.lastRun = Date.now();
        console.log(`[Jobs] ✓ ${job.name} completed in ${Date.now() - start}ms`);
    } catch (error) {
        console.error(`[Jobs] ✗ ${job.name} failed:`, error instanceof Error ? error.message : error);
    } finally {
        job.running = false;
    }
}

/**
 * Initialize all background jobs.
 * Each job runs on its own interval.
 * Safe to call multiple times (idempotent).
 */
export function initializeJobs() {
    if (initialized) return;
    initialized = true;

    // Only start background jobs in server environment
    if (typeof globalThis.setInterval !== 'function') return;

    console.log(`[Jobs] Initializing ${jobs.length} background jobs...`);

    for (const job of jobs) {
        // Run once after a short delay
        setTimeout(() => runJob(job), 5000);

        // Then on interval
        setInterval(() => runJob(job), job.intervalMs);

        console.log(`[Jobs] Registered: ${job.name} (every ${Math.round(job.intervalMs / 60000)}min)`);
    }
}

/**
 * Manually trigger a job by name (for admin endpoints).
 */
export async function triggerJob(name: string): Promise<{ success: boolean; message: string }> {
    const job = jobs.find(j => j.name === name);
    if (!job) return { success: false, message: `Job '${name}' not found` };
    if (job.running) return { success: false, message: `Job '${name}' is already running` };

    await runJob(job);
    return { success: true, message: `Job '${name}' completed` };
}

// ─── Job Logic (Exported for Cron) ───────────────────────────

export const runRiskScan = async () => {
    const { detectRiskFlags } = await import('@/services/riskDetectionService');
    const { impactScoreRepo } = await import('@/server/repositories');

    try {
        const orgIds = await impactScoreRepo.getAllOrgIds();
        for (const orgId of orgIds) {
            await detectRiskFlags(orgId);
        }
    } catch (error) {
        console.error('[Jobs] Risk scan DB error, skipping:', error instanceof Error ? error.message : error);
    }
};

export const runFundingGapRecalc = async () => {
    const { getFundingGaps } = await import('@/services/fundingGapService');
    await getFundingGaps(); // This already aggregates and persists to GeoImpactSummary
};

export const runScoreRecalc = async () => {
    const { recalculateOrgScore } = await import('@/services/impactScoringService');
    const { impactScoreRepo } = await import('@/server/repositories');

    try {
        const orgIds = await impactScoreRepo.getAllOrgIds();
        for (const orgId of orgIds) {
            await recalculateOrgScore(orgId);
        }
    } catch (error) {
        console.error('[Jobs] Score recalc DB error, skipping:', error instanceof Error ? error.message : error);
    }
};

export const runNGOPcompute = async () => {
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;
    const { recalculateOrgScore } = await import('@/services/impactScoringService');
    const { ScoreImprovementService } = await import('@/services/scoreImprovementService');

    try {
        const orgs = await prisma.organization.findMany({
            where: { type: 'NGO' },
            select: { id: true }
        });

        for (const org of orgs) {
            await recalculateOrgScore(org.id);
            await ScoreImprovementService.generateInsights(org.id);
        }
    } catch (error) {
        console.error('[Jobs] NGO precompute error, skipping:', error instanceof Error ? error.message : error);
    }
};

// ─── Register default jobs ───────────────────────────────────

registerJob('risk-scan', runRiskScan, config.riskScanIntervalMs);
registerJob('funding-gap-recalc', runFundingGapRecalc, config.fundingGapRecalcIntervalMs);
registerJob('score-recalc', runScoreRecalc, 86400000); // Daily
registerJob('ngo-dashboard-precompute', runNGOPcompute, 21600000); // Every 6 hours
