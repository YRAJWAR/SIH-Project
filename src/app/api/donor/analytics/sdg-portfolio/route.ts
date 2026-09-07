import { NextResponse } from 'next/server';

// SDG-wise allocation of donor u4's total ₹3.9L across their 7 donations
const SDG_PORTFOLIO = [
    { sdg_id: 6, sdg_name: 'Clean Water & Sanitation', amount: 50000, pct: 12.8, color: '#26bde2', beneficiaries: 1200 },
    { sdg_id: 7, sdg_name: 'Affordable Clean Energy', amount: 100000, pct: 25.6, color: '#fcc30b', beneficiaries: 3100 },
    { sdg_id: 3, sdg_name: 'Good Health & Well-being', amount: 75000, pct: 19.2, color: '#4c9f38', beneficiaries: 2400 },
    { sdg_id: 5, sdg_name: 'Gender Equality', amount: 25000, pct: 6.4, color: '#ff3a21', beneficiaries: 850 },
    { sdg_id: 8, sdg_name: 'Decent Work & Econ. Growth', amount: 25000, pct: 6.4, color: '#a21949', beneficiaries: 850 },
    { sdg_id: 4, sdg_name: 'Quality Education', amount: 80000, pct: 20.5, color: '#c5192d', beneficiaries: 2600 },
    { sdg_id: 10, sdg_name: 'Reduced Inequalities', amount: 35000, pct: 9.0, color: '#dd1367', beneficiaries: 1100 },
];

export async function GET() {
    const top_sdg = SDG_PORTFOLIO.reduce((a, b) => (a.amount > b.amount ? a : b));
    return NextResponse.json({
        success: true,
        data: SDG_PORTFOLIO,
        top_sdg: top_sdg.sdg_id,
        total: SDG_PORTFOLIO.reduce((s, d) => s + d.amount, 0),
        sdg_count: SDG_PORTFOLIO.length,
    });
}
