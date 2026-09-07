import { NextResponse } from 'next/server';
import { handleApiError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { getFundingGaps } from '@/services/fundingGapService';

// ──────────────────────────────────────────────────────────────
// GET /api/funding-gap
// ──────────────────────────────────────────────────────────────
// Enterprise-grade:
// ✓ Pre-computed data from GeoImpactSummary (background job)
// ✓ Fallback to on-demand calculation
// ✓ Structured responses
// ✓ Centralized error handling
// ──────────────────────────────────────────────────────────────

export async function GET() {
    try {
        const result = await getFundingGaps();
        return NextResponse.json(successResponse(result));
    } catch (error) {
        return handleApiError(error);
    }
}
