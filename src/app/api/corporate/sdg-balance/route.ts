import { NextResponse } from 'next/server';
import { corporateDashboardService } from '@/services/corporateDashboardService';

export async function GET(request: Request) {
    try {
        const organization_id = 'mock-corp-id-123';

        const data = await corporateDashboardService.getSDGPortfolioBalance(organization_id);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching SDG portfolio balance:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch SDG balance.' },
            { status: 500 }
        );
    }
}
