import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';

// ──────────────────────────────────────────────────────────────
// POST /api/impact-score — Calculate impact score
// ──────────────────────────────────────────────────────────────
// Enterprise-grade:
// ✓ Input validation
// ✓ Structured response
// ✓ Centralized error handling
// ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const { validateImpactScoreInput } = await import('@/server/validators');
        const body = await request.json();

        const validation = validateImpactScoreInput(body);
        if (!validation.success) {
            const { AppError } = await import('@/server/middleware/errorHandler');
            throw AppError.badRequest('Validation failed', validation.errors);
        }

        const { calculateDetailedScore } = await import('@/services/impactScoring');
        const result = calculateDetailedScore(body);

        return NextResponse.json(successResponse(result));
    } catch (error) {
        return handleApiError(error);
    }
}
