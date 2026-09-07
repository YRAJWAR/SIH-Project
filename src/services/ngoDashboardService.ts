import { recalculateOrgScore, getOrgScoreHistory, type OrgScoreResult } from '@/services/impactScoringService';
import { getRecommendedNGOs } from '@/services/smartMatchingService';
import prisma from '@/lib/prisma';

export interface ImpactOverview {
    final_score: number;
    component_breakdown: {
        scale: number;
        outcome: number;
        efficiency: number;
        geo_need: number;
        transparency: number;
    };
    impact_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    total_beneficiaries: number;
    total_funding_utilized: number;
    impact_per_rupee: number;
}

export interface ProjectHealth {
    project_id: string;
    title: string;
    health_score: number;
    status: 'Healthy' | 'Warning' | 'At Risk';
}

export interface TransparencyBreakdown {
    geo_tag_ratio: number;
    proof_ratio: number;
    update_timeliness_score: number;
    transparency_score: number;
    suggestions: string[];
}

export interface FundingSummary {
    csr_received: number;
    donations_received: number;
    total_budget_utilized: number;
    funding_remaining: number;
    monthly_funding_trend: { month: string; amount: number }[];
}

export class NGODashboardService {
    static async getImpactOverview(orgId: string): Promise<ImpactOverview> {
        const scoreData = await recalculateOrgScore(orgId);

        let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
        if (scoreData.final_score >= 800) tier = 'Platinum';
        else if (scoreData.final_score >= 600) tier = 'Gold';
        else if (scoreData.final_score >= 400) tier = 'Silver';

        const impactPerRupee = scoreData.total_spent > 0
            ? scoreData.total_beneficiaries / scoreData.total_spent
            : 0;

        return {
            final_score: scoreData.final_score,
            component_breakdown: {
                scale: scoreData.scale_score,
                outcome: scoreData.outcome_score,
                efficiency: scoreData.efficiency_score,
                geo_need: scoreData.geographic_need_score,
                transparency: scoreData.transparency_score,
            },
            impact_tier: tier,
            total_beneficiaries: scoreData.total_beneficiaries,
            total_funding_utilized: scoreData.total_spent,
            impact_per_rupee: Number(impactPerRupee.toFixed(4)),
        };
    }

    static async getProjectsHealth(orgId: string): Promise<ProjectHealth[]> {
        const projects = await prisma.project.findMany({
            where: { organization_id: orgId },
            include: { activities: true }
        });

        return projects.map((proj: any) => {
            // Simplified health score calculation
            const beneficiaryProgress = 0.8; // Mocked for now
            const activityFreq = proj.activities.length > 0 ? Math.min(proj.activities.length / 5, 1) : 0;
            const budgetUtil = Number(proj.budget_allocated) > 0
                ? Number(proj.budget_utilized) / Number(proj.budget_allocated)
                : 0;
            const budgetUtilBalance = budgetUtil > 0.1 && budgetUtil < 0.9 ? 1 : 0.5;

            const healthScore = (beneficiaryProgress * 40) + (activityFreq * 30) + (budgetUtilBalance * 30);

            let status: 'Healthy' | 'Warning' | 'At Risk' = 'Healthy';
            if (healthScore < 40) status = 'At Risk';
            else if (healthScore < 70) status = 'Warning';

            return {
                project_id: proj.id,
                title: proj.title,
                health_score: Math.round(healthScore),
                status
            };
        });
    }

    static async getTransparencyBreakdown(orgId: string): Promise<TransparencyBreakdown> {
        // Fetch from new TransparencyMetrics table or calculate on fly
        const metrics = await prisma.transparencyMetrics.findUnique({
            where: { organization_id: orgId }
        });

        if (!metrics) {
            return {
                geo_tag_ratio: 0,
                proof_ratio: 0,
                update_timeliness_score: 0,
                transparency_score: 0,
                suggestions: ['Start uploading activity proofs to establish transparency.']
            };
        }

        return {
            geo_tag_ratio: Number(metrics.geo_tag_ratio),
            proof_ratio: Number(metrics.proof_upload_ratio),
            update_timeliness_score: 100 - (metrics.update_frequency * 2), // Mock logic
            transparency_score: Number(metrics.transparency_score),
            suggestions: []
        };
    }

    static async getFundingSummary(orgId: string): Promise<FundingSummary> {
        const summary = await prisma.organizationFinancialSummary.findUnique({
            where: { organization_id: orgId }
        });

        const csrReceived = Number(summary?.total_csr_received || 0);
        const donationsReceived = Number(summary?.total_donations_received || 0);
        const totalUtilized = Number(summary?.total_budget_utilized || 0);

        return {
            csr_received: csrReceived,
            donations_received: donationsReceived,
            total_budget_utilized: totalUtilized,
            funding_remaining: (csrReceived + donationsReceived) - totalUtilized,
            monthly_funding_trend: [
                { month: 'Jan', amount: 450000 },
                { month: 'Feb', amount: 520000 },
                { month: 'Mar', amount: 480000 },
            ]
        };
    }

    static async getCorporateMatches(orgId: string) {
        // Reuse existing smartMatchingService
        // Note: smartMatchingService usually recommends NGOs to Corporates.
        // We'll return top 5 recommended corporates for this NGO.
        const result = await getRecommendedNGOs(orgId);
        return result.recommendations.slice(0, 5);
    }

    static async getOutcomeTracking(projectId: string) {
        const metrics = await prisma.projectOutcomeMetrics.findMany({
            where: { project_id: projectId }
        });

        return metrics.map((m: any) => ({
            metric_name: m.metric_name,
            baseline_value: Number(m.baseline_value),
            current_value: Number(m.current_value),
            target_value: Number(m.target_value),
            progress_percentage: Number(((Number(m.current_value) - Number(m.baseline_value)) / (Number(m.target_value) - Number(m.baseline_value)) * 100).toFixed(2)),
            last_updated: m.last_updated
        }));
    }

    static async getScoreImprovementTips(orgId: string) {
        return prisma.organizationInsights.findMany({
            where: { organization_id: orgId },
            orderBy: { potential_score_gain: 'desc' }
        });
    }

    static async getRiskAlerts(orgId: string) {
        return prisma.riskFlag.findMany({
            where: { organization_id: orgId, resolved: false },
            orderBy: { risk_level: 'desc' }
        });
    }

    // ─── Analytics ──────────────────────────────────────────────

    static async getImpactTrend(orgId: string) {
        const history = await prisma.impactScoreHistory.findMany({
            where: { organization_id: orgId },
            orderBy: { recorded_at: 'asc' },
            take: 12
        });

        return history.map((h: any) => ({
            month: h.recorded_at.toLocaleString('default', { month: 'short' }),
            score: Number(h.final_score)
        }));
    }

    static async getFundingTrend(orgId: string) {
        await prisma.donation.findMany({
            where: { project: { organization_id: orgId } },
            orderBy: { created_at: 'asc' }
        });

        // Group by month logic (simplified for placeholder)
        return [
            { month: 'Jan', funding_received: 250000 },
            { month: 'Feb', funding_received: 420000 },
            { month: 'Mar', funding_received: 150000 }
        ];
    }

    static async getBeneficiariesBySDG(orgId: string) {
        const projects = await prisma.project.findMany({
            where: { organization_id: orgId },
            include: { sdg_tags: true }
        });

        const sdgMap: Record<number, number> = {};
        for (const p of projects) {
            for (const tag of p.sdg_tags) {
                sdgMap[tag.sdg_id] = (sdgMap[tag.sdg_id] || 0) + p.beneficiaries_count;
            }
        }

        return Object.entries(sdgMap).map(([id, count]) => ({
            sdg_id: parseInt(id),
            beneficiaries: count
        }));
    }

    static async getImpactPerProject(orgId: string) {
        const projects = await prisma.project.findMany({
            where: { organization_id: orgId },
            select: { id: true, title: true, budget_allocated: true, beneficiaries_count: true }
        });

        return projects.map((p: any) => ({
            project_id: p.id,
            title: p.title,
            impact_score: Math.round(Math.random() * 1000) // Placeholder logic for now
        }));
    }
}
