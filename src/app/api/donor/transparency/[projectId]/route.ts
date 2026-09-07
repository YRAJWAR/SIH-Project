import { NextResponse } from 'next/server';
import { donorDashboardService } from '@/services/donorDashboardService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const data = await donorDashboardService.getTransparencyDetails(projectId);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching transparency details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch transparency details.' },
            { status: 500 }
        );
    }
}
