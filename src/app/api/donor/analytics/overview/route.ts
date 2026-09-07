import { NextResponse } from 'next/server';

// Donor-specific analytics overview — all computed from donor u4's history
export async function GET() {
    const overview = {
        total_donated: 390000,
        total_donations: 7,
        beneficiaries_impacted: 12500,
        sdgs_supported: 8,
        projects_supported: 7,
        volunteer_hours: 15,
        volunteer_events: 3,
        impact_per_rupee: 0.032, // beneficiaries per rupee
        cost_per_beneficiary: 31.2,
        platform_avg_cost_per_beneficiary: 48.5,
        giving_streak_months: 5,
        reputation_tier: 'Gold Donor',
        tier_progress: 78, // % toward next tier (Impact Champion)
        next_tier: 'Impact Champion',
        next_tier_requirement: '₹10L donated + 5 SDGs',
        rank_percentile: 92, // top 8% on platform
        avg_donation_size: 55714,
        platform_avg_donation_size: 28000,
        yoy_growth: 34, // percent increase vs last year
        sdg_diversity_score: 8, // out of 17
        platform_avg_sdg_diversity: 3.2,
    };
    return NextResponse.json({ success: true, data: overview });
}
