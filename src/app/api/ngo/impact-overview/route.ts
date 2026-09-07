import { NextRequest, NextResponse } from 'next/server';
import { NGODashboardService } from '@/services/ngoDashboardService';
import { successResponse } from '@/server/utils';
import { handleApiError } from '@/server/middleware/errorHandler';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get('org_id');
        if (!orgId) return NextResponse.json({ success: false, message: 'org_id required' }, { status: 400 });

        const data = await NGODashboardService.getImpactOverview(orgId);
        return NextResponse.json(successResponse(data), {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
