import { NextResponse } from 'next/server';

// Geographic distribution of donor u4's impact across Indian states
const GEO_IMPACT = [
    { state: 'Maharashtra', total_funding: 50000, avg_score: 82, projects: 1, beneficiaries: 1200 },
    { state: 'Rajasthan', total_funding: 100000, avg_score: 91, projects: 1, beneficiaries: 3100 },
    { state: 'Odisha', total_funding: 75000, avg_score: 78, projects: 1, beneficiaries: 2400 },
    { state: 'Bihar', total_funding: 25000, avg_score: 74, projects: 1, beneficiaries: 850 },
    { state: 'Madhya Pradesh', total_funding: 25000, avg_score: 70, projects: 1, beneficiaries: 850 },
    { state: 'Delhi', total_funding: 80000, avg_score: 88, projects: 1, beneficiaries: 2600 },
    { state: 'Karnataka', total_funding: 35000, avg_score: 76, projects: 1, beneficiaries: 1100 },
];

export async function GET() {
    return NextResponse.json({
        success: true,
        data: GEO_IMPACT,
        total_states: GEO_IMPACT.length,
        total_funding: GEO_IMPACT.reduce((s, g) => s + g.total_funding, 0),
    });
}
