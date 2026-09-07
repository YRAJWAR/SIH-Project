import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const governmentAnalyticsService = {

    // A. National SDG Progress Engine
    async getNationalSDGProgress() {
        const [ngoCount, csrFundsRaw, beneficiariesRaw, sdgCoverage] = await Promise.all([
            prisma.organization.count({ where: { type: 'NGO', verification_status: 'VERIFIED' } }),
            prisma.corporateImpactPortfolio.aggregate({ _sum: { total_funding_deployed: true } }),
            prisma.project.aggregate({ _sum: { beneficiaries_count: true }, where: { status: 'ACTIVE' } }),
            prisma.geoImpactSummary.groupBy({ by: ['sdg_id'], _count: { sdg_id: true } })
        ]);

        return {
            total_ngos_verified: ngoCount,
            total_csr_funds_deployed: Number(csrFundsRaw._sum.total_funding_deployed || 0),
            total_beneficiaries_impacted: beneficiariesRaw._sum.beneficiaries_count || 0,
            active_sdgs_count: sdgCoverage.length,
            sdg_coverage_percentage: Math.round((sdgCoverage.length / 17) * 100)
        };
    },

    // B. Regional Impact Intelligence
    async getRegionalIntelligence(state?: string) {
        const whereClause = state ? { state } : {};

        const regions = await prisma.geoImpactSummary.groupBy({
            by: ['district', 'state'],
            _sum: {
                total_funding: true,
                total_beneficiaries: true,
            },
            _avg: {
                avg_impact_score: true
            },
            where: whereClause
        });

        // Add NGO density mockup (would normally require a complex spatial join or distinct count)
        const enriched = await Promise.all(regions.map(async (r: any) => {
            const orgCount = await prisma.organization.count({
                where: { type: 'NGO', district: r.district, state: r.state }
            });
            const pop_proxy = 1000000; // Mock population per district for calculating per capita
            const funding = Number(r._sum.total_funding || 0);

            return {
                district: r.district,
                state: r.state,
                ngo_density: orgCount,
                total_beneficiaries: r._sum.total_beneficiaries || 0,
                total_funding: funding,
                funding_per_capita: Number((funding / pop_proxy).toFixed(2)),
                average_impact_score: Number(r._avg.avg_impact_score || 0).toFixed(2)
            };
        }));

        return enriched;
    },

    // C. NGO Performance Intelligence
    async getNGOPerformanceRegistry(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const ngos = await prisma.organization.findMany({
            where: { type: 'NGO' },
            include: {
                impact_scores: { orderBy: { calculated_at: 'desc' }, take: 1 },
                transparency_metrics: true,
                risk_flags: { where: { resolved: false } }
            },
            skip: offset,
            take: limit
        });

        const total = await prisma.organization.count({ where: { type: 'NGO' } });

        const data = ngos.map((ngo: any) => {
            const currentScore = ngo.impact_scores[0];
            return {
                id: ngo.id,
                name: ngo.name,
                verification_status: ngo.verification_status,
                impact_score: currentScore ? Number(currentScore.final_score) : null,
                efficiency_percentile: currentScore ? Number(currentScore.efficiency_score) : null,
                transparency_score: ngo.transparency_metrics ? Number(ngo.transparency_metrics.transparency_score) : null,
                active_risks_count: ngo.risk_flags.length,
            };
        });

        return {
            ngos: data,
            pagination: { total, page, limit, total_pages: Math.ceil(total / limit) }
        };
    },

    // D. Corporate CSR Monitoring
    async getCorporateCSRMonitoring() {
        // Find latest financial year records
        const reports = await prisma.corporateCSRCompliance.findMany({
            include: { organization: { select: { name: true } } },
            orderBy: { created_at: 'desc' },
            distinct: ['organization_id']
        });

        const statusCounts = { COMPLIANT: 0, NEAR_DEADLINE: 0, NON_COMPLIANT: 0 };
        const data = reports.map((r: any) => {
            statusCounts[r.compliance_status as keyof typeof statusCounts]++;
            return {
                corporate_name: r.organization.name,
                financial_year: r.financial_year,
                required_csr_spend: Number(r.required_csr_spend),
                csr_committed: Number(r.csr_committed),
                csr_disbursed: Number(r.csr_disbursed),
                compliance_percentage: Number(r.compliance_percentage),
                compliance_status: r.compliance_status
            };
        });

        return { overview: statusCounts, details: data };
    },

    // E. Risk Monitoring Dashboard
    async getRiskOverview() {
        const activeRisks = await prisma.riskFlag.findMany({
            where: { resolved: false },
            include: { organization: { select: { name: true, state: true, district: true } } }
        });

        const by_level = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
        const by_region: Record<string, number> = {};
        const high_risk_orgs: any[] = [];

        activeRisks.forEach((r: any) => {
            by_level[r.risk_level as keyof typeof by_level]++;

            const regionKey = r.organization.state;
            by_region[regionKey] = (by_region[regionKey] || 0) + 1;

            if (r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL') {
                high_risk_orgs.push({
                    org_name: r.organization.name,
                    risk_type: r.risk_type,
                    level: r.risk_level,
                    description: r.description
                });
            }
        });

        return { distribution_by_level: by_level, distribution_by_state: by_region, high_risk_orgs };
    },

    // F. Organization Audit Intelligence
    async getOrganizationAuditProfile(org_id: string) {
        const org = await prisma.organization.findUnique({
            where: { id: org_id },
            include: {
                projects: { select: { id: true, title: true, status: true, budget_utilized: true, beneficiaries_count: true } },
                financial_summary: true,
                impact_scores: { orderBy: { calculated_at: 'desc' }, take: 5 },
                transparency_metrics: true,
                risk_flags: { orderBy: { created_at: 'desc' } },
                audit_flags: { orderBy: { created_at: 'desc' } }
            }
        });

        if (!org) throw new Error('Organization not found');

        return {
            profile: {
                name: org.name,
                type: org.type,
                status: org.verification_status,
                location: `${org.district}, ${org.state}`
            },
            financial_summary: org.financial_summary,
            transparency: org.transparency_metrics,
            impact_history: org.impact_scores.map((s: any) => ({ score: Number(s.final_score), date: s.calculated_at })),
            active_projects: org.projects.filter((p: any) => p.status === 'ACTIVE').length,
            risk_history: org.risk_flags,
            government_audit_flags: org.audit_flags
        };
    },

    // G. Government Alert Engine
    async getAlerts() {
        return prisma.governmentAlerts.findMany({
            where: { is_resolved: false },
            orderBy: { created_at: 'desc' },
            take: 50
        });
    },

    async _generateAlertsMockTask() {
        // This is a placeholder for a scheduled background job, manually called to simulate engine task 
        // E.g., Checks if any CSR is non compliant
        const nonCompliant = await prisma.corporateCSRCompliance.findFirst({ where: { compliance_status: 'NON_COMPLIANT' } });
        if (nonCompliant) {
            await prisma.governmentAlerts.create({
                data: {
                    alert_type: 'CSR_NON_COMPLIANCE',
                    message: `Corporate entity has failed to meet CSR requirements.`,
                    severity: 'CRITICAL',
                    related_entity_id: nonCompliant.organization_id,
                    related_entity_type: 'Organization'
                }
            });
        }
    },

    // H. SDG Forecasting
    async getSDGForecasts(sdg_id: number) {
        // Uses simple linear projection moving average mock based on past geo impact
        const historical = await prisma.geoImpactSummary.aggregate({
            _avg: { total_funding: true, avg_impact_score: true },
            where: { sdg_id }
        });

        const currentFunding = Number(historical._avg.total_funding || 0);
        const currentScore = Number(historical._avg.avg_impact_score || 0);

        // Simple mock projection
        return {
            sdg_id,
            current_annual_funding: currentFunding,
            projected_funding_next_year: currentFunding * 1.15, // 15% growth assumption
            current_impact_score_avg: currentScore,
            projected_impact_score_avg: Math.min(currentScore * 1.05, 100), // 5% score improvement
            confidence_interval: "85%"
        };
    },

    // I. Budget Allocation Simulator
    async simulateBudgetAllocation(funding_amount: number, sdg_id: number, state: string) {
        // Estimates based on regional averages
        const regionStats = await prisma.geoImpactSummary.aggregate({
            _avg: { total_beneficiaries: true, total_funding: true },
            where: { state, sdg_id }
        });

        const avgFunding = Number(regionStats._avg.total_funding || 1000000);
        const avgBeneficiaries = Number(regionStats._avg.total_beneficiaries || 1000);

        let costPerBeneficiary = avgFunding / avgBeneficiaries;
        if (costPerBeneficiary === 0 || !isFinite(costPerBeneficiary)) costPerBeneficiary = 1500; // national fallback default

        const estimated_beneficiaries = Math.round(funding_amount / costPerBeneficiary);

        return {
            funding_amount,
            target_sdg: sdg_id,
            target_region: state,
            estimated_beneficiaries,
            estimated_cost_per_beneficiary: Number(costPerBeneficiary.toFixed(2)),
            expected_impact_score_improvement: 2.5 // Mock percentage points
        };
    },

    // J. Policy Insight Generator
    async getPolicyInsights() {
        return prisma.governmentInsights.findMany({
            orderBy: { created_at: 'desc' },
            take: 20
        });
    },

    async _generatePolicyInsightsMockTask() {
        // Placeholder for background AI analyzer
        await prisma.governmentInsights.create({
            data: {
                insight_type: 'FUNDING_GAP',
                message: 'Severe funding gap detected for SDG 6 (Clean Water) in tribal districts of Jharkhand.',
                related_sdg_id: 6,
                related_region: 'Jharkhand'
            }
        });
    }

};
