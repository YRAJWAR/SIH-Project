import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/server/middleware/auth';
import { rateLimitSensitive } from '@/server/middleware/rateLimit';
import { handleApiError, AppError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { auditLogRepo, impactScoreRepo } from '@/server/repositories';

// ──────────────────────────────────────────────────────────────
// POST /api/admin/recalculate-scores
//
// Admin-only endpoint to trigger batch recalculation of all
// organization impact scores regardless of schedule.
//
// Protected: ADMIN role required
// Rate-limited: Sensitive endpoint (max 10/15min)
// Audit-logged: Every invocation is recorded
// ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // Security: rate limit + auth + role check
        rateLimitSensitive(request);
        const user = await authenticateRequest(request);
        requireRole(user, 'ADMIN');

        const { recalculateOrgScore } = await import('@/services/impactScoringService');

        // Get all org IDs
        let orgIds: string[];
        try {
            orgIds = await impactScoreRepo.getAllOrgIds();
        } catch {
            throw AppError.internal('Database unavailable for score recalculation');
        }

        if (orgIds.length === 0) {
            return NextResponse.json(successResponse({
                recalculated: 0,
                message: 'No organizations found',
            }));
        }

        // Recalculate in batches
        const results: { org_id: string; final_score: number; status: string }[] = [];
        let failures = 0;

        for (const orgId of orgIds) {
            try {
                const score = await recalculateOrgScore(orgId);
                results.push({ org_id: orgId, final_score: score.final_score, status: 'success' });
            } catch {
                results.push({ org_id: orgId, final_score: 0, status: 'failed' });
                failures++;
            }
        }

        // Audit log
        await auditLogRepo.create({
            actor_id: user.userId,
            actor_role: user.role,
            action: 'BATCH_SCORE_RECALCULATION',
            entity_type: 'ImpactScore',
            entity_id: 'ALL',
            new_value: { total: orgIds.length, succeeded: orgIds.length - failures, failed: failures },
            ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
        });

        return NextResponse.json(successResponse({
            recalculated: orgIds.length - failures,
            failed: failures,
            total: orgIds.length,
            results,
        }));
    } catch (error) {
        return handleApiError(error);
    }
}
