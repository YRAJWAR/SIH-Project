import { NextResponse } from 'next/server';
import { governmentAnalyticsService } from '@/services/governmentAnalyticsService';

export async function GET(request: Request) {
    try {
        const data = await governmentAnalyticsService.getRiskOverview();

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching risk dashboard overview:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch risk overview.' },
            { status: 500 }
        );
    }
}
