import { NextResponse } from 'next/server';
import { handleApiError, AppError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { getRecommendedNGOs } from '@/services/smartMatchingService';

// ──────────────────────────────────────────────────────────────
// GET /api/corporate/:id/recommended-ngos
// ──────────────────────────────────────────────────────────────
// Enterprise-grade:
// ✓ Input validation
// ✓ Structured responses
// ✓ Centralized error handling
// ──────────────────────────────────────────────────────────────

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id || id.trim().length === 0) {
            throw AppError.badRequest('Corporate organization ID is required');
        }

        const result = await getRecommendedNGOs(id);

        return NextResponse.json(successResponse({
            corporate_id: id,
            recommendations: result.recommendations,
            total_matches: result.total_ngos_evaluated,
        }));
    } catch (error) {
        return handleApiError(error);
    }
}
