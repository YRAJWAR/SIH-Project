import { NextResponse } from 'next/server';
import { governmentAnalyticsService } from '@/services/governmentAnalyticsService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);

        const data = await governmentAnalyticsService.getNGOPerformanceRegistry(page);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching NGO performance registry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch NGO performance.' },
            { status: 500 }
        );
    }
}
