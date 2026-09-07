import { NextRequest, NextResponse } from 'next/server';
import { getOrgScore, getOrgScoreHistory, recalculateOrgScore } from '@/services/impactScoringService';
import { handleApiError, AppError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { auditLogRepo } from '@/server/repositories';

// ──────────────────────────────────────────────────────────────
// GET /api/organizations/:id/impact-score
// ──────────────────────────────────────────────────────────────
// Enterprise-grade:
// ✓ Structured responses
// ✓ Centralized error handling
// ✓ Audit logging for recalculations
// ──────────────────────────────────────────────────────────────

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orgId } = await params;

        if (!orgId) {
            throw AppError.badRequest('Organization ID is required');
        }

        const { searchParams } = new URL(request.url);
        const forceRecalc = searchParams.get('recalculate') === 'true';
        const includeHistory = searchParams.get('history') === 'true';

        // Get or recalculate score
        const score = forceRecalc
            ? await recalculateOrgScore(orgId)
            : await getOrgScore(orgId, false);

        // Audit log if recalculated
        if (forceRecalc) {
            await auditLogRepo.create({
                actor_id: 'API_CALLER',
                actor_role: 'SYSTEM',
                action: 'SCORE_RECALCULATED',
                entity_type: 'ImpactScore',
                entity_id: orgId,
                new_value: { final_score: score.final_score },
            });
        }

        const response: Record<string, unknown> = {
            organization_id: score.organization_id,
            score: {
                scale: { value: score.scale_score, weight: 0.30, max: 300, label: 'Beneficiary Scale' },
                outcome: { value: score.outcome_score, weight: 0.25, max: 250, label: 'Outcome Impact' },
                efficiency: { value: score.efficiency_score, weight: 0.20, max: 200, label: 'Funding Efficiency' },
                geographic_need: { value: score.geographic_need_score, weight: 0.15, max: 150, label: 'Geographic Need' },
                transparency: { value: score.transparency_score, weight: 0.10, max: 100, label: 'Transparency' },
            },
            final_score: score.final_score,
            calculated_at: score.calculated_at,
            metadata: {
                project_count: score.project_count,
                total_beneficiaries: score.total_beneficiaries,
                total_budget: score.total_budget,
                total_spent: score.total_spent,
                persisted: score.persisted,
            },
        };

        if (includeHistory) {
            const history = await getOrgScoreHistory(orgId);
            response.history = history.scores;
        }

        return NextResponse.json(successResponse(response));
    } catch (error) {
        return handleApiError(error);
    }
}
