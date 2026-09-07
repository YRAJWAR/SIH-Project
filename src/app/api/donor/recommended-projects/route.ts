import { NextResponse } from 'next/server';
import { donorDashboardService } from '@/services/donorDashboardService';

export async function GET(request: Request) {
    try {
        const donor_id = 'mock-donor-id-123';

        const data = await donorDashboardService.getRecommendedProjects(donor_id);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching donor recommended projects:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recommended projects.' },
            { status: 500 }
        );
    }
}
