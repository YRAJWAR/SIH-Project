import { NextResponse } from 'next/server';
import { handleApiError, AppError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { detectRiskFlags } from '@/services/riskDetectionService';

// ──────────────────────────────────────────────────────────────
// GET /api/organizations/:id/risk-flags
// ──────────────────────────────────────────────────────────────
// Enterprise-grade:
// ✓ Risk flags read from precomputed table (background job)
// ✓ On-demand detection as fallback
// ✓ Structured responses
// ✓ Centralized error handling
// ──────────────────────────────────────────────────────────────

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id || id.trim().length === 0) {
            throw AppError.badRequest('Organization ID is required');
        }

        const result = await detectRiskFlags(id);
        const flagsArray = result.flags || [];

        const summary = {
            total: flagsArray.length,
            critical: flagsArray.filter((f: any) => f.risk_level === 'CRITICAL').length,
            high: flagsArray.filter((f: any) => f.risk_level === 'HIGH').length,
            medium: flagsArray.filter((f: any) => f.risk_level === 'MEDIUM').length,
            low: flagsArray.filter((f: any) => f.risk_level === 'LOW').length,
        };

        return NextResponse.json(successResponse({
            organization_id: id,
            risk_flags: flagsArray,
            summary,
        }));
    } catch (error) {
        return handleApiError(error);
    }
}
