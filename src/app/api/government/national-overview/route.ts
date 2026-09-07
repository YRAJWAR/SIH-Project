import { NextResponse } from 'next/server';
import { governmentAnalyticsService } from '@/services/governmentAnalyticsService';

export async function GET(request: Request) {
    try {
        const data = await governmentAnalyticsService.getNationalSDGProgress();

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching national SDG progress:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch national overview.' },
            { status: 500 }
        );
    }
}
