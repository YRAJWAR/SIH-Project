import prisma from '@/lib/prisma';
import { getRecommendedNGOs } from './smartMatchingService';
import { Prisma } from '@prisma/client';

export const donorDashboardService = {

    // 1. Personal Impact Summary & Reputation Tier
    async getPersonalImpact(donor_id: string) {
        const summary = await prisma.donorImpactSummary.findUnique({
            where: { donor_id }
        });

        if (!summary) {
            return {
                total_donated: 0,
                beneficiaries_impacted: 0,
                projects_supported: 0,
                sdgs_supported: 0,
                impact_per_rupee: 0,
                reputation_tier: 'Bronze Donor'
            };
        }

        const total_donated = Number(summary.total_donated);
        const beneficiaries = summary.beneficiaries_impacted;

        // Reputation Engine Logic
        let reputation_tier = 'Bronze Donor';
        if (total_donated > 100000 && beneficiaries > 500) reputation_tier = 'Silver Donor';
        if (total_donated > 500000 && beneficiaries > 2000) reputation_tier = 'Gold Donor';
        if (total_donated > 1000000 && summary.sdgs_supported >= 5) reputation_tier = 'Impact Champion';

        return {
            total_donated,
            beneficiaries_impacted: beneficiaries,
            projects_supported: summary.projects_supported,
            sdgs_supported: summary.sdgs_supported,
            impact_per_rupee: Number(summary.impact_per_rupee),
            reputation_tier
        };
    },

    // 2. Donation History
    async getDonationHistory(donor_id: string, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const donations = await prisma.donation.findMany({
            where: { donor_id },
            orderBy: { created_at: 'desc' },
            skip: offset,
            take: limit,
            include: {
                project: {
                    include: {
                        organization: { select: { name: true } },
                        sdg_tags: { select: { sdg_id: true } }
                    }
                }
            }
        });

        const totalDonations = await prisma.donation.count({ where: { donor_id } });

        const formatted = donations.map((d: any) => ({
            id: d.id,
            project_id: d.project_id,
            project_title: d.project.title,
            ngo_name: d.project.organization.name,
            amount: Number(d.amount),
            sdg_tags: d.project.sdg_tags.map((t: any) => t.sdg_id),
            // Mock individual impact. Real system needs relational table for exact attribution per donation
            beneficiaries_impacted: Math.round((Number(d.amount) / Number(d.project.budget_allocated || 1)) * d.project.beneficiaries_count),
            donation_date: d.created_at
        }));

        return {
            donations: formatted,
            pagination: {
                total: totalDonations,
                page,
                limit,
                total_pages: Math.ceil(totalDonations / limit)
            }
        };
    },

    // 3. Impact Portfolio
    async getImpactPortfolio(donor_id: string) {
        const portfolio = await prisma.donorSDGPortfolio.findMany({
            where: { donor_id },
            include: { sdg: { select: { name: true } } }
        });

        return portfolio.map((p: any) => ({
            sdg_id: p.sdg_id,
            sdg_name: p.sdg.name,
            total_donated: Number(p.total_donated),
            beneficiaries: p.beneficiaries_impacted
        }));
    },

    // 4. Impact ROI
    async getImpactROI(donor_id: string) {
        const summary = await prisma.donorImpactSummary.findUnique({
            where: { donor_id }
        });

        if (!summary || Number(summary.total_donated) === 0) {
            return {
                cost_per_beneficiary: 0,
                impact_per_rupee: 0,
                platform_avg_cost: 1500 // Mock platform baseline metric
            };
        }

        const total_donated = Number(summary.total_donated);
        const beneficiaries = summary.beneficiaries_impacted || 1;

        const cost_per_beneficiary = total_donated / beneficiaries;
        const impact_per_rupee = beneficiaries / total_donated;

        return {
            cost_per_beneficiary,
            impact_per_rupee: Number(impact_per_rupee.toFixed(4)),
            platform_avg_cost: 1500
        };
    },

    // 5. Recommended Projects Discovery 
    // Adapting the existing smart proxy for now
    async getRecommendedProjects(donor_id: string) {
        const portfolio = await prisma.donorSDGPortfolio.findMany({
            where: { donor_id },
            orderBy: { total_donated: 'desc' },
            take: 3
        });

        const preferredSdgs = portfolio.map((p: any) => p.sdg_id);

        const projects = await prisma.project.findMany({
            where: {
                status: 'ACTIVE',
                ...(preferredSdgs.length > 0 && {
                    sdg_tags: { some: { sdg_id: { in: preferredSdgs } } }
                })
            },
            include: {
                organization: {
                    select: {
                        name: true,
                        impact_scores: { orderBy: { calculated_at: 'desc' }, take: 1 },
                        transparency_metrics: true
                    }
                }
            },
            take: 10
        });

        return projects.map((p: any) => {
            const org = p.organization;
            const funding_required = Number(p.budget_allocated) - Number(p.budget_utilized);
            return {
                project_id: p.id,
                title: p.title,
                ngo_name: org.name,
                impact_score: org.impact_scores[0] ? Number(org.impact_scores[0].final_score) : 0,
                transparency_score: org.transparency_metrics ? Number(org.transparency_metrics.transparency_score) : 0,
                beneficiaries_reached: p.beneficiaries_count,
                funding_required: funding_required > 0 ? funding_required : 0
            };
        });
    },

    // 6. Transparency Details
    async getTransparencyDetails(project_id: string) {
        const project = await prisma.project.findUnique({
            where: { id: project_id },
            include: {
                activities: true,
                organization: {
                    include: { transparency_metrics: true }
                }
            }
        });

        if (!project) throw new Error('Project not found');

        const geoTagged = project.activities.filter((a: any) => a.latitude !== null).length;
        const proofUploads = project.activities.filter((a: any) => a.proof_url !== null).length;

        return {
            project_id: project.id,
            total_activities: project.activities.length,
            verified_activities: project.activities.length, // Simplified mock definition
            proof_uploads: proofUploads,
            geo_tagged_activities: geoTagged,
            transparency_score: project.organization.transparency_metrics
                ? Number(project.organization.transparency_metrics.transparency_score)
                : 0
        };
    },

    // 7. Donor Goals
    async getDonationGoals(donor_id: string) {
        const goals = await prisma.donorGoals.findMany({
            where: { donor_id }
        });

        return goals.map((g: any) => ({
            id: g.id,
            goal_type: g.goal_type,
            target_value: Number(g.target_value),
            current_value: Number(g.current_value),
            progress_percentage: Math.min(100, Math.round((Number(g.current_value) / Number(g.target_value)) * 100))
        }));
    },

    // 8. Create Goal
    async createDonorGoal(donor_id: string, goal_type: 'BENEFICIARIES' | 'DONATION_AMOUNT', target_value: number) {
        const summary = await prisma.donorImpactSummary.findUnique({ where: { donor_id } });
        const currentValue = goal_type === 'BENEFICIARIES'
            ? (summary?.beneficiaries_impacted || 0)
            : Number(summary?.total_donated || 0);

        const goal = await prisma.donorGoals.create({
            data: {
                donor_id,
                goal_type,
                target_value,
                current_value: currentValue
            }
        });

        return goal;
    },

    // 9. Impact Timeline
    async getDonorImpactTimeline(donor_id: string) {
        const donations = await prisma.donation.findMany({
            where: { donor_id },
            include: { project: true },
            orderBy: { created_at: 'asc' }
        });

        const timelineMap = new Map<string, { donations: number; beneficiaries: number }>();

        donations.forEach((d: any) => {
            const month = d.created_at.toISOString().slice(0, 7); // YYYY-MM
            if (!timelineMap.has(month)) {
                timelineMap.set(month, { donations: 0, beneficiaries: 0 });
            }
            const current = timelineMap.get(month)!;
            current.donations += Number(d.amount);
            // approximate
            current.beneficiaries += Math.round((Number(d.amount) / Number(d.project.budget_allocated || 1)) * d.project.beneficiaries_count);
        });

        return Array.from(timelineMap.entries()).map(([month, data]) => ({
            month,
            donations: data.donations,
            beneficiaries_impacted: data.beneficiaries
        }));
    },

    // 10. Donation Impact Simulator
    async simulateDonationImpact(donation_amount: number, project_id: string) {
        const project = await prisma.project.findUnique({
            where: { id: project_id },
            include: {
                organization: {
                    include: { impact_scores: { orderBy: { calculated_at: 'desc' }, take: 1 } }
                }
            }
        });

        if (!project) throw new Error('Project not found');

        const orgScore = project.organization.impact_scores[0];
        const efficiencyFactor = orgScore ? Number(orgScore.efficiency_score) / 100 : 0.5;

        // Arbitrary baseline: 1500 INR = 1 beneficiary -> modified by org efficiency
        const avgCost = 1500 * (1 - (efficiencyFactor * 0.5)); // higher efficiency = lower cost

        const estimated_beneficiaries = Math.round(donation_amount / avgCost);

        // Minor incremental expected score gain (theoretical)
        const expected_impact_score = orgScore ? Math.min(Number(orgScore.final_score) + (estimated_beneficiaries * 0.01), 1000) : 500;

        return {
            estimated_beneficiaries,
            expected_impact_score,
            efficiency_percentile: orgScore ? Number(orgScore.efficiency_score) : 50
        };
    },

    // 11. Get Volunteer Opportunities
    async getVolunteerOpportunities() {
        const opportunities = await prisma.volunteerOpportunity.findMany({
            where: {
                date: {
                    gt: new Date() // Only upcoming
                }
            },
            include: {
                organization: {
                    select: { name: true, logo_url: true }
                }
            },
            orderBy: { date: 'asc' }
        });

        return opportunities.map((opp) => ({
            id: opp.id,
            title: opp.title,
            description: opp.description,
            date: opp.date,
            start_time: opp.start_time,
            end_time: opp.end_time,
            location: opp.location,
            required_volunteers: opp.required_volunteers,
            filled_volunteers: opp.filled_volunteers,
            ngo_name: opp.organization.name,
            ngo_logo: opp.organization.logo_url
        }));
    },

    // 12. Apply for Volunteer Opportunity
    async applyForVolunteerOpportunity(donor_id: string, opportunity_id: string) {
        // Prevent duplicate applications
        const existing = await prisma.volunteerApplication.findFirst({
            where: { user_id: donor_id, opportunity_id }
        });

        if (existing) {
            throw new Error('Already applied to this opportunity.');
        }

        const application = await prisma.volunteerApplication.create({
            data: {
                user_id: donor_id,
                opportunity_id: opportunity_id,
                status: 'PENDING'
            }
        });

        return application;
    }
};
