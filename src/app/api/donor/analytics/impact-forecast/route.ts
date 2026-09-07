import { NextResponse } from 'next/server';

// 12-month impact score actuals + 6-month AI-forecast for donor u4
const FORECAST_DATA = [
    { month: 'Apr', actualScore: 0, predictedScore: 0 },
    { month: 'May', actualScore: 0, predictedScore: 0 },
    { month: 'Jun', actualScore: 42, predictedScore: 40 },
    { month: 'Jul', actualScore: 44, predictedScore: 43 },
    { month: 'Aug', actualScore: 58, predictedScore: 55 },
    { month: 'Sep', actualScore: 60, predictedScore: 58 },
    { month: 'Oct', actualScore: 68, predictedScore: 64 },
    { month: 'Nov', actualScore: 72, predictedScore: 70 },
    { month: 'Dec', actualScore: 74, predictedScore: 73 },
    { month: 'Jan', actualScore: 78, predictedScore: 76 },
    // Future (predicted only)
    { month: 'Feb', actualScore: 0, predictedScore: 80 },
    { month: 'Mar', actualScore: 0, predictedScore: 83 },
    { month: 'Apr\'', actualScore: 0, predictedScore: 86 },
    { month: 'May\'', actualScore: 0, predictedScore: 88 },
    { month: 'Jun\'', actualScore: 0, predictedScore: 91 },
    { month: 'Jul\'', actualScore: 0, predictedScore: 93 },
];

export async function GET() {
    return NextResponse.json({
        success: true,
        data: FORECAST_DATA,
        current_score: 78,
        predicted_6m: 93,
        growth_pct: 19.2,
    });
}
