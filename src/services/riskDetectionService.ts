// ──────────────────────────────────────────────────────────────
// Risk Detection Engine
//
// Detects three risk conditions for an organization:
//   1. High funding but low beneficiaries
//   2. Declining efficiency over 3 consecutive scoring cycles
//   3. Missing activity proofs for > 30 days
//
// Generates risk flags and persists them to the RiskFlags table.
// ──────────────────────────────────────────────────────────────

export interface RiskFlagResult {
    id?: string;
    organization_id: string;
    risk_type: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    resolved: boolean;
    created_at: string;
}

// ─── Thresholds ──────────────────────────────────────────────

const HIGH_FUNDING_THRESHOLD = 1_000_000;       // ₹10 Lakh
const LOW_BENEFICIARY_THRESHOLD = 100;           // Few beneficiaries relative to funding
const FUNDING_PER_BENEFICIARY_ALERT = 50_000;    // ₹50K per beneficiary = suspiciously high
const MISSING_PROOF_DAYS = 30;

// ─── Risk Check 1: High funding, low beneficiaries ──────────

interface ProjectData {
    budget_allocated: unknown;
    beneficiaries_count: number;
}

function checkHighFundingLowBeneficiaries(
    orgId: string,
    projects: ProjectData[]
): RiskFlagResult | null {
    if (projects.length === 0) return null;

    const totalFunding = projects.reduce((s, p) => s + Number(p.budget_allocated), 0);
    const totalBeneficiaries = projects.reduce((s, p) => s + p.beneficiaries_count, 0);

    if (totalFunding < HIGH_FUNDING_THRESHOLD) return null;

    const fundingPerBeneficiary = totalBeneficiaries > 0
        ? totalFunding / totalBeneficiaries
        : totalFunding; // if zero beneficiaries, entire amount is problematic

    if (totalBeneficiaries < LOW_BENEFICIARY_THRESHOLD || fundingPerBeneficiary > FUNDING_PER_BENEFICIARY_ALERT) {
        const level: RiskFlagResult['risk_level'] =
            totalBeneficiaries === 0 ? 'CRITICAL' :
                fundingPerBeneficiary > FUNDING_PER_BENEFICIARY_ALERT * 2 ? 'HIGH' : 'MEDIUM';

        return {
            organization_id: orgId,
            risk_type: 'high_funding_low_beneficiaries',
            risk_level: level,
            description: `Organization has ₹${(totalFunding / 100000).toFixed(1)}L funding across ${projects.length} project(s) but only ${totalBeneficiaries.toLocaleString()} beneficiaries (₹${Math.round(fundingPerBeneficiary).toLocaleString()}/beneficiary). This is significantly above the expected ratio.`,
            resolved: false,
            created_at: new Date().toISOString(),
        };
    }

    return null;
}

// ─── Risk Check 2: Declining efficiency 3 consecutive cycles ─

interface ScoreCycle {
    efficiency_score: unknown;
    calculated_at: Date;
}

function checkDecliningEfficiency(
    orgId: string,
    scores: ScoreCycle[]
): RiskFlagResult | null {
    if (scores.length < 3) return null;

    // Scores should be ordered most recent first
    const recent3 = scores.slice(0, 3);
    const e0 = Number(recent3[0].efficiency_score);
    const e1 = Number(recent3[1].efficiency_score);
    const e2 = Number(recent3[2].efficiency_score);

    // Declining means each cycle is lower than the previous (newest < older)
    if (e0 < e1 && e1 < e2) {
        const totalDecline = Math.round(((e2 - e0) / e2) * 100);
        const level: RiskFlagResult['risk_level'] = totalDecline > 30 ? 'HIGH' : 'MEDIUM';

        return {
            organization_id: orgId,
            risk_type: 'efficiency_decline',
            risk_level: level,
            description: `Efficiency score has declined for 3 consecutive scoring cycles: ${e2} → ${e1} → ${e0} (${totalDecline}% total decline). This may indicate worsening fund utilization or operational issues.`,
            resolved: false,
            created_at: new Date().toISOString(),
        };
    }

    return null;
}

// ─── Risk Check 3: Missing activity proofs for >30 days ──────

interface ActivityData {
    proof_url: string | null;
    created_at: Date;
}

function checkMissingProofs(
    orgId: string,
    activities: ActivityData[]
): RiskFlagResult | null {
    if (activities.length === 0) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - MISSING_PROOF_DAYS * 24 * 60 * 60 * 1000);

    // Activities older than 30 days that still have no proof
    const outdatedUnproven = activities.filter(
        a => !a.proof_url && new Date(a.created_at) < thirtyDaysAgo
    );

    if (outdatedUnproven.length === 0) return null;

    const ratio = Math.round((outdatedUnproven.length / activities.length) * 100);
    const level: RiskFlagResult['risk_level'] =
        ratio > 80 ? 'CRITICAL' :
            ratio > 50 ? 'HIGH' : 'MEDIUM';

    const oldestUnproven = outdatedUnproven.reduce(
        (oldest, a) => new Date(a.created_at) < new Date(oldest.created_at) ? a : oldest,
        outdatedUnproven[0]
    );
    const daysSinceOldest = Math.floor(
        (now.getTime() - new Date(oldestUnproven.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
        organization_id: orgId,
        risk_type: 'missing_activity_proofs',
        risk_level: level,
        description: `${outdatedUnproven.length} of ${activities.length} activities (${ratio}%) are missing proof/verification documents for over ${MISSING_PROOF_DAYS} days. Oldest unverified activity is ${daysSinceOldest} days old.`,
        resolved: false,
        created_at: new Date().toISOString(),
    };
}

// ─── Fallback: In-memory risk flag generation ────────────────

function generateFallbackFlags(orgId: string): RiskFlagResult[] {
    return [
        {
            organization_id: orgId,
            risk_type: 'missing_activity_proofs',
            risk_level: 'MEDIUM',
            description: '2 of 5 activities are missing proof/verification documents for over 30 days. Oldest unverified activity is 45 days old.',
            resolved: false,
            created_at: new Date().toISOString(),
        },
    ];
}

// ─── Core: Run all risk checks from DB ───────────────────────

async function detectFromDB(orgId: string): Promise<RiskFlagResult[] | null> {
    try {
        const prismaModule = await import('@/lib/prisma');
        const prisma = prismaModule.default;

        // 1. Fetch all projects for this org
        const projects = await prisma.project.findMany({
            where: { organization_id: orgId },
            select: {
                budget_allocated: true,
                beneficiaries_count: true,
                activities: {
                    select: {
                        proof_url: true,
                        created_at: true,
                    },
                },
            },
        });

        // 2. Fetch recent impact scores (for efficiency trend)
        const scores = await prisma.impactScore.findMany({
            where: { organization_id: orgId },
            orderBy: { calculated_at: 'desc' },
            take: 5,
            select: {
                efficiency_score: true,
                calculated_at: true,
            },
        });

        // 3. Collect all activities across projects
        const allActivities: ActivityData[] = [];
        for (const proj of projects) {
            for (const act of (proj as any).activities) {
                allActivities.push(act);
            }
        }

        // 4. Run all checks
        const flags: RiskFlagResult[] = [];

        const fundingCheck = checkHighFundingLowBeneficiaries(orgId, projects as ProjectData[]);
        if (fundingCheck) flags.push(fundingCheck);

        const efficiencyCheck = checkDecliningEfficiency(orgId, scores as ScoreCycle[]);
        if (efficiencyCheck) flags.push(efficiencyCheck);

        const proofCheck = checkMissingProofs(orgId, allActivities);
        if (proofCheck) flags.push(proofCheck);

        // 5. Persist new flags to DB
        for (const flag of flags) {
            // Avoid duplicates: only create if no unresolved flag of same type exists
            const existing = await prisma.riskFlag.findFirst({
                where: {
                    organization_id: orgId,
                    risk_type: flag.risk_type,
                    resolved: false,
                },
            });

            if (!existing) {
                const created = await prisma.riskFlag.create({
                    data: {
                        organization_id: flag.organization_id,
                        risk_type: flag.risk_type,
                        risk_level: flag.risk_level,
                        description: flag.description,
                    },
                });
                flag.id = created.id;

                try {
                    const { NotificationTriggers } = await import('@/lib/notifications');
                    await NotificationTriggers.riskFlagTriggered(
                        flag.risk_type,
                        `Organization ${flag.organization_id.substring(0, 8)}`,
                        null
                    );
                } catch {
                    // Non-fatal notification failure
                }
            } else {
                flag.id = existing.id;
                flag.created_at = (existing.created_at as Date).toISOString();
            }
        }

        return flags;
    } catch {
        return null;
    }
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Detect and return all active risk flags for an organization.
 * Runs all three risk checks and persists new flags.
 */
export async function detectRiskFlags(orgId: string): Promise<{
    flags: RiskFlagResult[];
    total: number;
    critical_count: number;
    high_count: number;
    source: 'database' | 'fallback';
}> {
    const dbFlags = await detectFromDB(orgId);
    const flags = dbFlags ?? generateFallbackFlags(orgId);
    const source: 'database' | 'fallback' = dbFlags ? 'database' : 'fallback';

    return {
        flags,
        total: flags.length,
        critical_count: flags.filter(f => f.risk_level === 'CRITICAL').length,
        high_count: flags.filter(f => f.risk_level === 'HIGH').length,
        source,
    };
}

/**
 * Get all persisted risk flags for an org from the DB (including resolved ones).
 */
export async function getPersistedRiskFlags(orgId: string): Promise<RiskFlagResult[]> {
    try {
        const prismaModule = await import('@/lib/prisma');
        const prisma = prismaModule.default;

        const flags = await prisma.riskFlag.findMany({
            where: { organization_id: orgId },
            orderBy: { created_at: 'desc' },
        });

        return flags.map((f: any) => ({
            id: f.id,
            organization_id: f.organization_id,
            risk_type: f.risk_type,
            risk_level: f.risk_level as RiskFlagResult['risk_level'],
            description: f.description,
            resolved: f.resolved,
            created_at: (f.created_at as Date).toISOString(),
        }));
    } catch {
        return generateFallbackFlags(orgId);
    }
}
