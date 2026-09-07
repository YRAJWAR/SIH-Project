import prisma from '@/lib/prisma';
import { getRecommendedNGOs } from './smartMatchingService';

export const corporateDashboardService = {

    // 1. CSR Compliance
    async getCSRCompliance(organization_id: string) {
        const compliance = await prisma.corporateCSRCompliance.findFirst({
            where: { organization_id },
            orderBy: { financial_year: 'desc' }
        });

        if (!compliance) {
            // Fallback if not generated yet, calculate from generic org details or return mock structure
            return {
                required_csr_spend: 0,
                csr_committed: 0,
                csr_disbursed: 0,
                remaining_csr_obligation: 0,
                compliance_percentage: 0,
                compliance_status: 'COMPLIANT'
            };
        }

        const remaining_csr_obligation = Number(compliance.required_csr_spend) - Number(compliance.csr_disbursed);

        return {
            required_csr_spend: Number(compliance.required_csr_spend),
            csr_committed: Number(compliance.csr_committed),
            csr_disbursed: Number(compliance.csr_disbursed),
            remaining_csr_obligation: remaining_csr_obligation > 0 ? remaining_csr_obligation : 0,
            compliance_percentage: Number(compliance.compliance_percentage),
            compliance_status: compliance.compliance_status
        };
    },

    // 2. Portfolio Impact
    async getPortfolioImpact(organization_id: string) {
        const profile = await prisma.corporateImpactPortfolio.findUnique({
            where: { organization_id }
        });

        const sdgs = await prisma.corporateSDGDistribution.findMany({
            where: { organization_id },
            include: { sdg: true }
        });

        const sdg_impact_distribution = sdgs.map((s: any) => ({
            sdg_id: s.sdg_id,
            sdg_name: s.sdg.name,
            total_funding: Number(s.total_funding),
            beneficiaries: s.beneficiaries
        }));

        if (!profile) {
            return {
                total_funding_deployed: 0,
                beneficiaries_reached: 0,
                average_cost_per_beneficiary: 0,
                portfolio_impact_score: 0,
                sdg_impact_distribution
            };
        }

        return {
            total_funding_deployed: Number(profile.total_funding_deployed),
            beneficiaries_reached: profile.total_beneficiaries,
            average_cost_per_beneficiary: Number(profile.average_cost_per_beneficiary),
            portfolio_impact_score: Number(profile.portfolio_impact_score),
            sdg_impact_distribution
        };
    },

    // 3. NGO Discovery
    async getNGODiscovery(filters: { sdg?: string; state?: string; district?: string; min_impact?: string; min_transparency?: string; risk?: string }) {

        // Prisma query builder
        const where: any = { type: 'NGO' };

        if (filters.state) where.state = { equals: filters.state, mode: 'insensitive' };
        if (filters.district) where.district = { equals: filters.district, mode: 'insensitive' };

        // We would map other filters through includes or distinct queries.
        // For simplicity, returning a broad list. In a full implementation, you'd join with ImpactScore and RiskFlag tables.
        const ngos = await prisma.organization.findMany({
            where,
            include: {
                impact_scores: { orderBy: { calculated_at: 'desc' }, take: 1 },
                transparency_metrics: true,
                projects: { where: { status: 'COMPLETED' } }
            },
            take: 20
        });

        return ngos.map((ngo: any) => {
            const impactDb = ngo.impact_scores[0];
            const transparencyDb = ngo.transparency_metrics;
            return {
                organization_profile: {
                    id: ngo.id,
                    name: ngo.name,
                    state: ngo.state,
                    district: ngo.district,
                    logo_url: ngo.logo_url
                },
                impact_score: impactDb ? Number(impactDb.final_score) : 0,
                transparency_score: transparencyDb ? Number(transparencyDb.transparency_score) : 0,
                beneficiaries_reached: ngo.projects.reduce((sum: number, p: any) => sum + p.beneficiaries_count, 0),
                projects_completed: ngo.projects.length
            };
        });
    },

    // 4. Smart Matches
    async getSmartMatches(organization_id: string) {
        const data = await getRecommendedNGOs(organization_id);
        return data.recommendations;
    },

    // 5. CSR Portfolio Risk
    async getCSRPortfolioRisk(organization_id: string) {
        // Get NGOs funded by this corporate
        const allocations = await prisma.cSRAllocation.findMany({
            where: { corporate_org_id: organization_id },
            include: { project: { select: { organization_id: true } } }
        });

        const fundedNgoIds = Array.from(new Set(allocations.map((a: any) => a.project.organization_id)));

        if (fundedNgoIds.length === 0) return [];

        const risks = await prisma.riskFlag.findMany({
            where: {
                organization_id: { in: fundedNgoIds },
                resolved: false
            },
            include: { organization: { select: { name: true } } }
        });

        const auditFlags = await prisma.governmentAuditFlag.findMany({
            where: {
                organization_id: { in: fundedNgoIds },
                status: { in: ['OPEN', 'UNDER_REVIEW'] }
            },
            include: { organization: { select: { name: true } } }
        });

        const riskAlerts = risks.map((r: any) => ({
            ngo_id: r.organization_id,
            ngo_name: r.organization.name,
            risk_type: r.risk_type,
            risk_level: r.risk_level,
            description: r.description
        }));

        const auditAlerts = auditFlags.map((a: any) => ({
            ngo_id: a.organization_id,
            ngo_name: a.organization.name,
            risk_type: 'government_audit_flag',
            risk_level: a.severity === 'HIGH' ? 'CRITICAL' : a.severity,
            description: a.reason
        }));

        return [...riskAlerts, ...auditAlerts];
    },

    // 6. Impact ROI
    async getImpactROI(organization_id: string) {
        const portfolio = await prisma.corporateImpactPortfolio.findUnique({
            where: { organization_id }
        });

        if (!portfolio || Number(portfolio.total_funding_deployed) === 0) {
            return {
                cost_per_beneficiary: 0,
                impact_per_rupee: 0,
                efficiency_percentile: 0
            };
        }

        const total_funding = Number(portfolio.total_funding_deployed);
        const cost_per_beneficiary = total_funding / (portfolio.total_beneficiaries || 1);
        const impact_per_rupee = Number(portfolio.portfolio_impact_score) / total_funding;

        // We can assume an arbitrary median efficiency for sector.
        const efficiency_percentile = 75; // Mock data since real percentile calculation involves querying whole DB

        return {
            cost_per_beneficiary,
            impact_per_rupee,
            efficiency_percentile
        };
    },

    // 7. SDG Portfolio Balance
    async getSDGPortfolioBalance(organization_id: string) {
        const sdgs = await prisma.corporateSDGDistribution.findMany({
            where: { organization_id }
        });

        const unique_sdgs_funded = sdgs.length;
        const coverage_score = unique_sdgs_funded / 17;

        const fundedIds = sdgs.map((s: any) => s.sdg_id);
        const allIds = Array.from({ length: 17 }, (_, i) => i + 1);
        const underfunded_sdgs = allIds.filter(id => !fundedIds.includes(id));

        return {
            coverage_score,
            funded_sdgs: sdgs.map((s: any) => s.sdg_id),
            underfunded_sdgs
        };
    },

    // 8. Regional Impact
    async getRegionalImpact(organization_id: string) {
        const allocations = await prisma.cSRAllocation.findMany({
            where: { corporate_org_id: organization_id },
            include: { project: { include: { organization: true } } }
        });

        const regionMap = new Map<string, { beneficiaries: number; impact_sum: number; count: number }>();

        allocations.forEach((a: any) => {
            const p = a.project;
            const region = p.organization.state || 'Unknown';
            if (!regionMap.has(region)) {
                regionMap.set(region, { beneficiaries: 0, impact_sum: 0, count: 0 });
            }

            const r = regionMap.get(region)!;
            r.beneficiaries += p.beneficiaries_count;
            r.impact_sum += Number(p.outcome_metric_value || 0); // approx impact for project
            r.count += 1;
        });

        const regions = Array.from(regionMap.entries()).map(([district, data]) => ({
            district,
            beneficiaries: data.beneficiaries,
            impact_score: data.count > 0 ? data.impact_sum / data.count : 0
        }));

        return {
            districts_funded: regions.map(r => r.district),
            regions
        };
    },

    // 9. Strategy Insights
    async getStrategyInsights(organization_id: string) {
        // Generate new insights if there hasn't been one recently (simplified pattern)
        // Normally you'd trigger this on a cron or event
        await this.generateStrategyInsights(organization_id);

        const insights = await prisma.corporateStrategyInsights.findMany({
            where: { organization_id },
            orderBy: { created_at: 'desc' },
            take: 10
        });

        return insights.map((i: any) => ({
            id: i.id,
            recommendation_type: i.recommendation_type,
            message: i.message,
            suggested_sdg: i.suggested_sdg,
            suggested_region: i.suggested_region,
            created_at: i.created_at
        }));
    },

    // 10. Impact Simulator (New Feature)
    async simulateImpact(funding_amount: number, sdg_id: number, region?: string) {
        // Historical base averages (Mock predictive model logic)
        // Real implementation would aggregate past project outcomes

        // Average $10 = 1 beneficiary -> arbitrary mock multiplier
        const avgFundingPerBeneficiary = 1200; // e.g. 1200 INR per beneficiary depending on SDG

        // SDG specificity mock multipliers
        let sdgMultiplier = 1.0;
        if (sdg_id === 4) sdgMultiplier = 1.2; // Education might be cheaper per benficiary
        if (sdg_id === 6) sdgMultiplier = 0.8; // Water infra more expensive

        const estimated_beneficiaries = Math.round((funding_amount / avgFundingPerBeneficiary) * sdgMultiplier);

        // Diminishing returns mock formula for impact score
        const estimated_impact_score = Math.min(estimated_beneficiaries * 0.05, 100);

        // Efficiency compares to theoretical optimum
        const estimated_efficiency = Math.min(80 + (sdgMultiplier * 10), 99);

        return {
            estimated_beneficiaries,
            estimated_impact_score,
            estimated_efficiency
        };
    },

    // 11. Insight Engine Generator (New Feature)
    async generateStrategyInsights(organization_id: string) {
        const sdgBalance = await this.getSDGPortfolioBalance(organization_id);
        const regionalImpact = await this.getRegionalImpact(organization_id);

        const newInsights = [];

        // SDG concentration warning
        if (sdgBalance.funded_sdgs.length > 0 && sdgBalance.funded_sdgs.length <= 2) {
            newInsights.push({
                organization_id,
                recommendation_type: 'DIVERSIFY_SDG',
                message: `Your CSR spending is highly concentrated in SDGs: ${sdgBalance.funded_sdgs.join(', ')}. Consider diversifying into underfunded SDGs like ${sdgBalance.underfunded_sdgs.slice(0, 2).join(', ')}.`,
                suggested_sdg: sdgBalance.underfunded_sdgs[0] || null,
                suggested_region: null
            });
        }

        // Regional insight mock
        if (regionalImpact.regions.length > 0) {
            const topRegion = regionalImpact.regions.sort((a, b) => b.beneficiaries - a.beneficiaries)[0];
            newInsights.push({
                organization_id,
                recommendation_type: 'REGIONAL_EXPANSION',
                message: `Most of your impact is concentrated in ${topRegion.district}. Consider investing in emerging districts like Jharkhand which shows a high funding gap.`,
                suggested_sdg: null,
                suggested_region: 'Jharkhand'
            });
        }

        // Match suggestion
        const topMatch = await getRecommendedNGOs(organization_id);
        if (topMatch.recommendations.length > 0) {
            newInsights.push({
                organization_id,
                recommendation_type: 'PARTNERSHIP',
                message: `Partner with verified NGO ${topMatch.recommendations[0].name} to improve your portfolio efficiency structure.`,
                suggested_sdg: topMatch.recommendations[0].sdg_focus[0] || null,
                suggested_region: topMatch.recommendations[0].state
            });
        }

        if (newInsights.length > 0) {
            // Just overriding/inserting without complex dedup for demonstration
            await prisma.corporateStrategyInsights.createMany({
                data: newInsights
            });
        }
    }
};
