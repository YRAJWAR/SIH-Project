import { NextRequest, NextResponse } from 'next/server';
import { NGODashboardService } from '@/services/ngoDashboardService';
import { successResponse } from '@/server/utils';
import { handleApiError } from '@/server/middleware/errorHandler';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        const data = await NGODashboardService.getOutcomeTracking(projectId);
        return NextResponse.json(successResponse(data));
    } catch (error) {
        return handleApiError(error);
    }
}
