import { NextResponse } from 'next/server';
import { governmentAnalyticsService } from '@/services/governmentAnalyticsService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await governmentAnalyticsService.getOrganizationAuditProfile(id);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error fetching audit profile:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch audit profile.' },
            { status: 500 }
        );
    }
}
