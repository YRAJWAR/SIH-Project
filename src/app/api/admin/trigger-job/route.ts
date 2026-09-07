import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/server/middleware/auth';
import { handleApiError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { triggerJob } from '@/server/jobs';

// ──────────────────────────────────────────────────────────────
// POST /api/admin/trigger-job
//
// Admin-only: Manually trigger a background job.
// Body: { "job_name": "risk-scan" | "funding-gap-recalc" | "score-recalc" }
// ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        requireRole(user, 'ADMIN');

        const body = await request.json();
        const jobName = body?.job_name;

        if (!jobName || typeof jobName !== 'string') {
            return NextResponse.json(
                { success: false, error: { message: 'job_name is required', error_code: 'VALIDATION_FAILED' } },
                { status: 400 }
            );
        }

        const result = await triggerJob(jobName);

        return NextResponse.json(successResponse(result));
    } catch (error) {
        return handleApiError(error);
    }
}
