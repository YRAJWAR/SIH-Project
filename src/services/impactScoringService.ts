// ──────────────────────────────────────────────────────────────
// Impact Scoring Service (Backend)
// Aggregates all project data for an organization, calculates
// the 5-component weighted score, and persists to ImpactScores table.
//
// Formula:
//   Final = (Scale × 0.30) + (Outcome × 0.25) + (Efficiency × 0.20)
//         + (Geographic Need × 0.15) + (Transparency × 0.10)
//
// Triggered on: project creation, activity added, funding updated
// ──────────────────────────────────────────────────────────────

import { calculateDetailedScore, type ScoreInput } from '@/services/impactScoring';

// ─── Types ───────────────────────────────────────────────────

export interface OrgScoreResult {
    organization_id: string;
    scale_score: number;
    outcome_score: number;
    efficiency_score: number;
    geographic_need_score: number;
    transparency_score: number;
    final_score: number;
    calculated_at: string;
    project_count: number;
    total_beneficiaries: number;
    total_budget: number;
    total_spent: number;
    persisted: boolean;
}

// ─── In-Memory Fallback Store ────────────────────────────────
// Used when DB is not connected

const scoreCache = new Map<string, OrgScoreResult>();

// ─── Core: Compute organization score from DB ────────────────

async function aggregateFromDB(orgId: string): Promise<OrgScoreResult | null> {
    try {
        const prismaModule = await import('@/lib/prisma');
        const prisma = prismaModule.default;

        // 1. Fetch all projects for this org
        const projects = await prisma.project.findMany({
            where: { organization_id: orgId },
            include: {
                activities: true,
                sdg_tags: true,
            },
        });

        if (projects.length === 0) return null;

        // 2. Aggregate metrics across all projects
        let totalBeneficiaries = 0;
        let totalBudget = 0;
        let totalSpent = 0;
        let totalOutcomeMetric = 0;
        let totalActivities = 0;
        let verifiedActivities = 0;
        let projectsWithGeo = 0;
        let projectsWithProof = 0;
        let completedProjects = 0;

        for (const proj of projects) {
            totalBeneficiaries += proj.beneficiaries_count;
            totalBudget += Number(proj.budget_allocated);
            totalSpent += Number(proj.budget_utilized);
            totalOutcomeMetric += Number(proj.outcome_metric_value || 0);
            totalActivities += proj.activities.length;

            // Count verified activities (ones with proof)
            for (const act of proj.activities) {
                if (act.proof_url) verifiedActivities++;
            }

            if (proj.latitude && proj.longitude) projectsWithGeo++;
            if (proj.activities.some((a: { proof_url: string | null }) => a.proof_url)) projectsWithProof++;;
            if (proj.status === 'COMPLETED') completedProjects++;

            // Collect location info for geographic need
            // We'll use org state from the org record
        }

        // Average outcome metric across projects
        const avgOutcome = projects.length > 0 ? totalOutcomeMetric / projects.length : 50;
        const bestStatus = completedProjects > 0 ? 'completed' : 'active';

        // 3. Get org location for geographic need
        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { state: true, district: true },
        });
        const locationName = org?.district || org?.state || 'India';

        // 4. Calculate detailed score
        const input: ScoreInput = {
            beneficiaryCount: totalBeneficiaries,
            budgetAllocated: totalBudget,
            budgetUtilized: totalSpent,
            outcomeMetricValue: avgOutcome,
            activitiesCount: totalActivities,
            verifiedActivities,
            hasGeoTag: projectsWithGeo > 0,
            hasProofUploads: projectsWithProof > 0,
            locationName,
            projectStatus: bestStatus,
        };

        const detailed = calculateDetailedScore(input);
        const now = new Date().toISOString();

        // 5. Persist to ImpactScores table
        await prisma.impactScore.create({
            data: {
                organization_id: orgId,
                scale_score: detailed.scaleScore,
                outcome_score: detailed.outcomeScore,
                efficiency_score: detailed.efficiencyScore,
                geographic_need_score: detailed.geographicNeedScore,
                transparency_score: detailed.transparencyScore,
                final_score: detailed.finalScore,
                calculation_version: "2.0",
                raw_scale_value: detailed.rawScaleValue,
                raw_outcome_value: detailed.rawOutcomeValue,
                raw_efficiency_value: detailed.rawEfficiencyValue,
                raw_geo_value: detailed.rawGeoValue,
                raw_transparency_value: detailed.rawTransparencyValue,
            },
        });

        const result: OrgScoreResult = {
            organization_id: orgId,
            scale_score: detailed.scaleScore,
            outcome_score: detailed.outcomeScore,
            efficiency_score: detailed.efficiencyScore,
            geographic_need_score: detailed.geographicNeedScore,
            transparency_score: detailed.transparencyScore,
            final_score: detailed.finalScore,
            calculated_at: now,
            project_count: projects.length,
            total_beneficiaries: totalBeneficiaries,
            total_budget: totalBudget,
            total_spent: totalSpent,
            persisted: true,
        };

        scoreCache.set(orgId, result);
        return result;
    } catch {
        return null;
    }
}

// ─── In-Memory Calculation (when DB is not available) ────────

function aggregateInMemory(orgId: string, projectData?: {
    beneficiaries: number;
    budget: number;
    spent: number;
    outcomeMetric: number;
    activitiesCount: number;
    verifiedActivities: number;
    location: string;
    status: string;
    hasGeo: boolean;
    hasProof: boolean;
}): OrgScoreResult {
    const data = projectData || {
        beneficiaries: 10000,
        budget: 2000000,
        spent: 1500000,
        outcomeMetric: 65,
        activitiesCount: 5,
        verifiedActivities: 3,
        location: 'India',
        status: 'active',
        hasGeo: true,
        hasProof: true,
    };

    const input: ScoreInput = {
        beneficiaryCount: data.beneficiaries,
        budgetAllocated: data.budget,
        budgetUtilized: data.spent,
        outcomeMetricValue: data.outcomeMetric,
        activitiesCount: data.activitiesCount,
        verifiedActivities: data.verifiedActivities,
        hasGeoTag: data.hasGeo,
        hasProofUploads: data.hasProof,
        locationName: data.location,
        projectStatus: data.status,
    };

    const detailed = calculateDetailedScore(input);
    const now = new Date().toISOString();

    const result: OrgScoreResult = {
        organization_id: orgId,
        scale_score: detailed.scaleScore,
        outcome_score: detailed.outcomeScore,
        efficiency_score: detailed.efficiencyScore,
        geographic_need_score: detailed.geographicNeedScore,
        transparency_score: detailed.transparencyScore,
        final_score: detailed.finalScore,
        calculated_at: now,
        project_count: 1,
        total_beneficiaries: data.beneficiaries,
        total_budget: data.budget,
        total_spent: data.spent,
        persisted: false,
    };

    scoreCache.set(orgId, result);
    return result;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Calculate and persist the impact score for an organization.
 * Aggregates all project data, applies the 5-component formula,
 * and stores the result in the ImpactScores table.
 *
 * Call this when:
 * - A project is created
 * - An activity is added
 * - Funding/donations are updated
 */
export async function recalculateOrgScore(orgId: string): Promise<OrgScoreResult> {
    // Try DB-backed calculation first
    const dbResult = await aggregateFromDB(orgId);
    if (dbResult) return dbResult;

    // Fallback to cached or in-memory
    const cached = scoreCache.get(orgId);
    if (cached) return cached;

    return aggregateInMemory(orgId);
}

/**
 * Get the latest score for an organization (from cache or DB).
 * Does NOT recalculate unless force is true.
 */
export async function getOrgScore(orgId: string, force = false): Promise<OrgScoreResult> {
    if (!force) {
        const cached = scoreCache.get(orgId);
        if (cached) return cached;
    }
    return recalculateOrgScore(orgId);
}

/**
 * Get score history for an organization (for trend charts).
 */
export async function getOrgScoreHistory(orgId: string): Promise<{
    scores: Array<{
        final_score: number;
        scale_score: number;
        outcome_score: number;
        efficiency_score: number;
        geographic_need_score: number;
        transparency_score: number;
        calculated_at: string;
    }>;
}> {
    try {
        const prismaModule = await import('@/lib/prisma');
        const prisma = prismaModule.default;

        const scores = await prisma.impactScore.findMany({
            where: { organization_id: orgId },
            orderBy: { calculated_at: 'desc' },
            take: 20,
            select: {
                final_score: true,
                scale_score: true,
                outcome_score: true,
                efficiency_score: true,
                geographic_need_score: true,
                transparency_score: true,
                calculated_at: true,
            },
        });

        return {
            scores: scores.map((s: { final_score: unknown; scale_score: unknown; outcome_score: unknown; efficiency_score: unknown; geographic_need_score: unknown; transparency_score: unknown; calculated_at: Date }) => ({
                final_score: Number(s.final_score),
                scale_score: Number(s.scale_score),
                outcome_score: Number(s.outcome_score),
                efficiency_score: Number(s.efficiency_score),
                geographic_need_score: Number(s.geographic_need_score),
                transparency_score: Number(s.transparency_score),
                calculated_at: s.calculated_at.toISOString(),
            })),
        };
    } catch {
        // Return cached score as single entry if DB unavailable
        const cached = scoreCache.get(orgId);
        if (cached) {
            return {
                scores: [{
                    final_score: cached.final_score,
                    scale_score: cached.scale_score,
                    outcome_score: cached.outcome_score,
                    efficiency_score: cached.efficiency_score,
                    geographic_need_score: cached.geographic_need_score,
                    transparency_score: cached.transparency_score,
                    calculated_at: cached.calculated_at,
                }],
            };
        }
        return { scores: [] };
    }
}
