import { NextResponse } from 'next/server';
import { corporateDashboardService } from '@/services/corporateDashboardService';

export async function GET(request: Request) {
    try {
        const organization_id = 'mock-corp-id-123';

        const data = await corporateDashboardService.getSmartMatches(organization_id);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch smart matches.' },
            { status: 500 }
        );
    }
}
