import { NextResponse } from 'next/server';
import { governmentAnalyticsService } from '@/services/governmentAnalyticsService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const state = searchParams.get('state') || undefined;

        const data = await governmentAnalyticsService.getRegionalIntelligence(state);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching regional intelligence:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch regional intelligence.' },
            { status: 500 }
        );
    }
}
