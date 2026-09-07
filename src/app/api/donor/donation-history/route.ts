import { NextResponse } from 'next/server';
import { donorDashboardService } from '@/services/donorDashboardService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);

        const donor_id = 'mock-donor-id-123';

        const data = await donorDashboardService.getDonationHistory(donor_id, page);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching donor donation history:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch donation history.' },
            { status: 500 }
        );
    }
}
