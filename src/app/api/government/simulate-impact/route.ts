import { NextResponse } from 'next/server';
import { governmentAnalyticsService } from '@/services/governmentAnalyticsService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { funding_amount, sdg_id, region_state } = body;

        if (!funding_amount || !sdg_id || !region_state) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameters: funding_amount, sdg_id, region_state' },
                { status: 400 }
            );
        }

        const data = await governmentAnalyticsService.simulateBudgetAllocation(
            Number(funding_amount),
            Number(sdg_id),
            region_state
        );

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error simulating budget impact:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to run impact simulation.' },
            { status: 500 }
        );
    }
}
