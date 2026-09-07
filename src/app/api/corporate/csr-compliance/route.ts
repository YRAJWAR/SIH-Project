import { NextResponse } from 'next/server';
import { corporateDashboardService } from '@/services/corporateDashboardService';

export async function GET(request: Request) {
    try {
        // Basic Mock Auth since we don't have the full auth setup in this context.
        const organization_id = 'mock-corp-id-123'; // Replace with real session extraction

        const data = await corporateDashboardService.getCSRCompliance(organization_id);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching CSR compliance:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch CSR compliance.' },
            { status: 500 }
        );
    }
}
