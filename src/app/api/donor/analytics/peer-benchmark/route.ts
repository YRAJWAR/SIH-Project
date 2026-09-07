import { NextResponse } from 'next/server';

// Peer benchmarking — donor u4 vs. anonymised platform averages
export async function GET() {
    const benchmark = {
        donor: {
            avg_monthly_donation: 55000,
            sdg_diversity: 8,
            volunteer_hours: 15,
            projects_supported: 7,
            cost_per_beneficiary: 31.2,
            giving_streak: 5,
            repeat_ngo_rate: 43, // % donations to same NGOs (loyalty)
        },
        platform_avg: {
            avg_monthly_donation: 28000,
            sdg_diversity: 3.2,
            volunteer_hours: 4.1,
            projects_supported: 3.8,
            cost_per_beneficiary: 48.5,
            giving_streak: 1.8,
            repeat_ngo_rate: 61,
        },
        top_10_pct: {
            avg_monthly_donation: 80000,
            sdg_diversity: 11,
            volunteer_hours: 28,
            projects_supported: 12,
            cost_per_beneficiary: 22,
            giving_streak: 9,
            repeat_ngo_rate: 38,
        },
        percentile: 92,
        insights: [
            { type: 'strength', text: 'Your cost-per-beneficiary (₹31) beats 78% of donors on the platform.' },
            { type: 'strength', text: 'You support 8 SDGs — 2.5× the platform average of 3.2.' },
            { type: 'opportunity', text: 'Increasing monthly donations by ₹25K would put you in the top 5%.' },
            { type: 'opportunity', text: 'Volunteering 13 more hours would match the top 10% of donors.' },
        ],
    };
    return NextResponse.json({ success: true, data: benchmark });
}
