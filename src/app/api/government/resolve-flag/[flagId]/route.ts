import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/server/middleware/auth';
import { handleApiError, AppError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { PrismaClient } from '@prisma/client';
import { auditLogRepo } from '@/server/repositories';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────
// PATCH /api/government/resolve-flag/[flagId]
//
// Resolves a previously opened regulatory flag.
// ──────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ flagId: string }> }) {
    try {
        const user = await authenticateRequest(request);
        requireRole(user, 'GOVERNMENT', 'ADMIN');

        const { flagId } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !['OPEN', 'UNDER_REVIEW', 'RESOLVED'].includes(status)) {
            throw AppError.badRequest('Valid status is required (OPEN, UNDER_REVIEW, RESOLVED)');
        }

        const flag = await prisma.governmentAuditFlag.findUnique({
            where: { id: flagId }
        });

        if (!flag) {
            throw AppError.notFound('Audit flag not found');
        }

        const updatedFlag = await prisma.governmentAuditFlag.update({
            where: { id: flagId },
            data: {
                status,
                resolved_at: status === 'RESOLVED' ? new Date() : null
            }
        });

        // Audit Logging
        await auditLogRepo.create({
            actor_id: user.userId,
            actor_role: user.role,
            action: 'GOVERNMENT_FLAG_STATUS_UPDATED',
            entity_type: 'GovernmentAuditFlag',
            entity_id: flag.id,
            previous_value: { status: flag.status },
            new_value: { status: updatedFlag.status },
            ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
        });

        return NextResponse.json(successResponse({ flag: updatedFlag }));
    } catch (error) {
        return handleApiError(error);
    }
}
