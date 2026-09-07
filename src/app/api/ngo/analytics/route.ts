import { NextRequest, NextResponse } from 'next/server';
import { NGODashboardService } from '@/services/ngoDashboardService';
import { successResponse } from '@/server/utils';
import { handleApiError } from '@/server/middleware/errorHandler';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get('org_id');
        if (!orgId) return NextResponse.json({ success: false, message: 'org_id required' }, { status: 400 });

        const [impactTrend, fundingTrend, beneficiariesBySDG, impactPerProject] = await Promise.all([
            NGODashboardService.getImpactTrend(orgId),
            NGODashboardService.getFundingTrend(orgId),
            NGODashboardService.getBeneficiariesBySDG(orgId),
            NGODashboardService.getImpactPerProject(orgId),
        ]);

        return NextResponse.json(successResponse({
            impactTrend,
            fundingTrend,
            beneficiariesBySDG,
            impactPerProject
        }), {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
