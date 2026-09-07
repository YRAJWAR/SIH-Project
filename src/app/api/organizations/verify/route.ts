import { NextRequest, NextResponse } from 'next/server';
import { IdentityVerificationService } from '@/services/verificationService';
import { handleApiError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';

/**
 * POST /api/organizations/verify
 * Triggers official KYC/KYB legal verification for an organization.
 */
export async function POST(req: NextRequest) {
    try {
        const { orgId } = await req.json();

        if (!orgId) {
            const { AppError } = await import('@/server/middleware/errorHandler');
            throw AppError.badRequest('Missing organization ID');
        }

        const result = await IdentityVerificationService.verifyOrganization(orgId);

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: result.error
            }, { status: 422 });
        }

        return NextResponse.json(successResponse({
            message: 'Organization verification successful',
            details: result.details
        }));
    } catch (error) {
        return handleApiError(error);
    }
}
