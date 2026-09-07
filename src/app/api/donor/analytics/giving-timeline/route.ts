import { NextResponse } from 'next/server';

// 12-month giving timeline for donor u4
const TIMELINE = [
    { month: 'Apr', amount: 0, projects: 0, beneficiaries: 0 },
    { month: 'May', amount: 0, projects: 0, beneficiaries: 0 },
    { month: 'Jun', amount: 50000, projects: 1, beneficiaries: 1200 },
    { month: 'Jul', amount: 0, projects: 0, beneficiaries: 0 },
    { month: 'Aug', amount: 100000, projects: 1, beneficiaries: 3100 },
    { month: 'Sep', amount: 0, projects: 0, beneficiaries: 0 },
    { month: 'Oct', amount: 75000, projects: 1, beneficiaries: 2400 },
    { month: 'Nov', amount: 80000, projects: 1, beneficiaries: 2600 },
    { month: 'Dec', amount: 25000, projects: 1, beneficiaries: 850 },
    { month: 'Jan', amount: 60000, projects: 1, beneficiaries: 1900 },
    { month: 'Feb', amount: 0, projects: 0, beneficiaries: 0 },
    { month: 'Mar', amount: 0, projects: 0, beneficiaries: 0 },
];

export async function GET() {
    const total = TIMELINE.reduce((s, m) => s + m.amount, 0);
    const activemonths = TIMELINE.filter(m => m.amount > 0).length;
    return NextResponse.json({
        success: true,
        data: TIMELINE,
        summary: { total_donated: total, active_months: activemonths, avg_per_active_month: Math.round(total / activemonths) },
    });
}
