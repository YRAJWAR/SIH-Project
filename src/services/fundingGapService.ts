// ──────────────────────────────────────────────────────────────
// Funding Gap Intelligence Service
//
// 1. Aggregates projects by district + SDG
// 2. Calculates funding per capita
// 3. Compares funding distribution across districts
// 4. Flags districts with funding below national average
// ──────────────────────────────────────────────────────────────

export interface DistrictFundingSummary {
    district: string;
    state: string;
    sdg_id: number;
    sdg_name: string;
    total_funding: number;
    total_beneficiaries: number;
    avg_impact_score: number;
    funding_per_capita: number;
    project_count: number;
}

export interface FundingGapResult {
    district: string;
    state: string;
    sdg_id: number;
    sdg_name: string;
    funding_gap_percentage: number;
    severity_level: 'low' | 'medium' | 'high' | 'critical';
    total_funding: number;
    national_avg_funding: number;
    funding_per_capita: number;
    national_avg_per_capita: number;
    total_beneficiaries: number;
}

// ─── Fallback demo data (used when DB is unavailable) ────────

const FALLBACK_SUMMARIES: DistrictFundingSummary[] = [
    { district: 'Ranchi', state: 'Jharkhand', sdg_id: 4, sdg_name: 'Quality Education', total_funding: 3500000, total_beneficiaries: 12000, avg_impact_score: 780, funding_per_capita: 291.67, project_count: 3 },
    { district: 'Patna', state: 'Bihar', sdg_id: 3, sdg_name: 'Good Health and Well-Being', total_funding: 5200000, total_beneficiaries: 25000, avg_impact_score: 834, funding_per_capita: 208.00, project_count: 5 },
    { district: 'Bhubaneswar', state: 'Odisha', sdg_id: 6, sdg_name: 'Clean Water and Sanitation', total_funding: 2800000, total_beneficiaries: 18000, avg_impact_score: 720, funding_per_capita: 155.56, project_count: 2 },
    { district: 'Jaipur', state: 'Rajasthan', sdg_id: 7, sdg_name: 'Affordable and Clean Energy', total_funding: 4100000, total_beneficiaries: 15000, avg_impact_score: 756, funding_per_capita: 273.33, project_count: 4 },
    { district: 'Lucknow', state: 'Uttar Pradesh', sdg_id: 1, sdg_name: 'No Poverty', total_funding: 3000000, total_beneficiaries: 20000, avg_impact_score: 690, funding_per_capita: 150.00, project_count: 3 },
    { district: 'Chennai', state: 'Tamil Nadu', sdg_id: 9, sdg_name: 'Industry, Innovation and Infrastructure', total_funding: 6500000, total_beneficiaries: 8000, avg_impact_score: 810, funding_per_capita: 812.50, project_count: 2 },
    { district: 'Pune', state: 'Maharashtra', sdg_id: 5, sdg_name: 'Gender Equality', total_funding: 2200000, total_beneficiaries: 9500, avg_impact_score: 745, funding_per_capita: 231.58, project_count: 3 },
    { district: 'Guwahati', state: 'Assam', sdg_id: 2, sdg_name: 'Zero Hunger', total_funding: 1800000, total_beneficiaries: 14000, avg_impact_score: 670, funding_per_capita: 128.57, project_count: 2 },
    { district: 'Bengaluru', state: 'Karnataka', sdg_id: 13, sdg_name: 'Climate Action', total_funding: 7200000, total_beneficiaries: 5000, avg_impact_score: 860, funding_per_capita: 1440.00, project_count: 4 },
    { district: 'Hyderabad', state: 'Telangana', sdg_id: 8, sdg_name: 'Decent Work and Economic Growth', total_funding: 4800000, total_beneficiaries: 11000, avg_impact_score: 795, funding_per_capita: 436.36, project_count: 3 },
];

// ─── Step 1: Aggregate projects by district and SDG ──────────

async function aggregateFromDB(): Promise<DistrictFundingSummary[] | null> {
    try {
        const prismaModule = await import('@/lib/prisma');
        const prisma = prismaModule.default;

        const projects = await prisma.project.findMany({
            where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
            select: {
                budget_allocated: true,
                beneficiaries_count: true,
                organization: {
                    select: {
                        id: true,
                        state: true,
                        district: true,
                    },
                },
                sdg_tags: {
                    select: {
                        sdg_id: true,
                        sdg: { select: { name: true } },
                    },
                },
            },
        });

        if (projects.length === 0) return null;

        // Fetch latest impact scores per org
        const orgIds = [...new Set(projects.map((p: { organization: { id: string } }) => p.organization.id))];
        const latestScores = await prisma.impactScore.findMany({
            where: { organization_id: { in: orgIds } },
            orderBy: { calculated_at: 'desc' },
            distinct: ['organization_id'],
            select: { organization_id: true, final_score: true },
        });
        const scoreMap = new Map<string, number>();
        for (const s of latestScores) {
            scoreMap.set(s.organization_id, Number(s.final_score));
        }

        // Group by (district, sdg_id)
        const clusterMap = new Map<string, {
            district: string;
            state: string;
            sdg_id: number;
            sdg_name: string;
            total_funding: number;
            total_beneficiaries: number;
            score_sum: number;
            score_count: number;
            project_count: number;
        }>();

        for (const proj of projects) {
            const district = (proj as any).organization.district || (proj as any).organization.state;
            const state = (proj as any).organization.state;
            const orgId = (proj as any).organization.id;
            const orgScore = scoreMap.get(orgId) ?? 0;

            for (const tag of (proj as any).sdg_tags) {
                const key = `${district}__${state}__${tag.sdg_id}`;
                const existing = clusterMap.get(key);

                if (existing) {
                    existing.total_funding += Number(proj.budget_allocated);
                    existing.total_beneficiaries += proj.beneficiaries_count;
                    existing.score_sum += orgScore;
                    existing.score_count += 1;
                    existing.project_count += 1;
                } else {
                    clusterMap.set(key, {
                        district,
                        state,
                        sdg_id: tag.sdg_id,
                        sdg_name: tag.sdg.name,
                        total_funding: Number(proj.budget_allocated),
                        total_beneficiaries: proj.beneficiaries_count,
                        score_sum: orgScore,
                        score_count: 1,
                        project_count: 1,
                    });
                }
            }
        }

        const summaries: DistrictFundingSummary[] = Array.from(clusterMap.values()).map(c => ({
            district: c.district,
            state: c.state,
            sdg_id: c.sdg_id,
            sdg_name: c.sdg_name,
            total_funding: Math.round(c.total_funding),
            total_beneficiaries: c.total_beneficiaries,
            avg_impact_score: c.score_count > 0 ? Math.round(c.score_sum / c.score_count) : 0,
            funding_per_capita: c.total_beneficiaries > 0
                ? Math.round((c.total_funding / c.total_beneficiaries) * 100) / 100
                : 0,
            project_count: c.project_count,
        }));

        // Persist aggregates into GeoImpactSummary table
        for (const s of summaries) {
            await prisma.geoImpactSummary.upsert({
                where: {
                    district_state_sdg_id: {
                        district: s.district,
                        state: s.state,
                        sdg_id: s.sdg_id,
                    },
                },
                update: {
                    total_funding: s.total_funding,
                    total_beneficiaries: s.total_beneficiaries,
                    avg_impact_score: s.avg_impact_score,
                    last_updated: new Date(),
                },
                create: {
                    district: s.district,
                    state: s.state,
                    sdg_id: s.sdg_id,
                    total_funding: s.total_funding,
                    total_beneficiaries: s.total_beneficiaries,
                    avg_impact_score: s.avg_impact_score,
                },
            });
        }

        return summaries;
    } catch {
        return null;
    }
}

// ─── Step 2 & 3: Calculate funding per capita & compare ──────

function calculateFundingGaps(summaries: DistrictFundingSummary[]): FundingGapResult[] {
    if (summaries.length === 0) return [];

    // National average funding per district-SDG combo
    const totalFundingSum = summaries.reduce((s, d) => s + d.total_funding, 0);
    const nationalAvgFunding = totalFundingSum / summaries.length;

    // National average funding per capita
    const totalBeneficiaries = summaries.reduce((s, d) => s + d.total_beneficiaries, 0);
    const nationalAvgPerCapita = totalBeneficiaries > 0 ? totalFundingSum / totalBeneficiaries : 0;

    return summaries.map(s => {
        // Step 4: Funding gap = how far below (or above) national average
        const gapPercentage = nationalAvgFunding > 0
            ? Math.round(((nationalAvgFunding - s.total_funding) / nationalAvgFunding) * 10000) / 100
            : 0;

        // Determine severity based on gap percentage
        let severity_level: FundingGapResult['severity_level'];
        if (gapPercentage >= 60) severity_level = 'critical';
        else if (gapPercentage >= 35) severity_level = 'high';
        else if (gapPercentage >= 10) severity_level = 'medium';
        else severity_level = 'low';

        return {
            district: s.district,
            state: s.state,
            sdg_id: s.sdg_id,
            sdg_name: s.sdg_name,
            funding_gap_percentage: gapPercentage,
            severity_level,
            total_funding: s.total_funding,
            national_avg_funding: Math.round(nationalAvgFunding),
            funding_per_capita: s.funding_per_capita,
            national_avg_per_capita: Math.round(nationalAvgPerCapita * 100) / 100,
            total_beneficiaries: s.total_beneficiaries,
        };
    })
        // Sort by severity: most critical first
        .sort((a, b) => b.funding_gap_percentage - a.funding_gap_percentage);
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Aggregate projects by district/SDG, calculate funding gaps,
 * and flag districts below the national average.
 */
export async function getFundingGaps(): Promise<{
    gaps: FundingGapResult[];
    national_avg_funding: number;
    national_avg_per_capita: number;
    total_districts: number;
    flagged_districts: number;
    source: 'database' | 'fallback';
}> {
    // Try DB first
    const dbSummaries = await aggregateFromDB();
    const summaries = dbSummaries || FALLBACK_SUMMARIES;
    const source: 'database' | 'fallback' = dbSummaries ? 'database' : 'fallback';

    const gaps = calculateFundingGaps(summaries);

    const totalFundingSum = summaries.reduce((s, d) => s + d.total_funding, 0);
    const nationalAvgFunding = summaries.length > 0 ? Math.round(totalFundingSum / summaries.length) : 0;

    const totalBeneficiaries = summaries.reduce((s, d) => s + d.total_beneficiaries, 0);
    const nationalAvgPerCapita = totalBeneficiaries > 0
        ? Math.round((totalFundingSum / totalBeneficiaries) * 100) / 100
        : 0;

    // Districts with positive gap (below national average) are flagged
    const flaggedDistricts = gaps.filter(g => g.funding_gap_percentage > 0).length;

    return {
        gaps,
        national_avg_funding: nationalAvgFunding,
        national_avg_per_capita: nationalAvgPerCapita,
        total_districts: gaps.length,
        flagged_districts: flaggedDistricts,
        source,
    };
}
