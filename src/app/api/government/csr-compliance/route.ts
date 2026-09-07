import { NextResponse } from 'next/server';
import { governmentAnalyticsService } from '@/services/governmentAnalyticsService';

export async function GET(request: Request) {
    try {
        const data = await governmentAnalyticsService.getCorporateCSRMonitoring();

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching corporate CSR monitoring:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch CSR compliance telemetry.' },
            { status: 500 }
        );
    }
}
