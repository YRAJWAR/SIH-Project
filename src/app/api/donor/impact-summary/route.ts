import { NextResponse } from 'next/server';
import { donorDashboardService } from '@/services/donorDashboardService';

export async function GET(request: Request) {
    try {
        const donor_id = 'mock-donor-id-123';

        const data = await donorDashboardService.getPersonalImpact(donor_id);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching donor personal impact:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch personal impact.' },
            { status: 500 }
        );
    }
}
