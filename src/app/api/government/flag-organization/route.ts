import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/server/middleware/auth';
import { handleApiError, AppError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { PrismaClient } from '@prisma/client';
import { auditLogRepo } from '@/server/repositories';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────
// POST /api/government/flag-organization
//
// Creates a regulatory flag for an organization.
// ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        requireRole(user, 'GOVERNMENT', 'ADMIN');

        const body = await request.json();
        const { organization_id, reason, severity } = body;

        if (!organization_id || !reason || !severity) {
            throw AppError.badRequest('organization_id, reason, and severity are required');
        }

        if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity)) {
            throw AppError.badRequest('Invalid severity level');
        }

        const org = await prisma.organization.findUnique({
            where: { id: organization_id }
        });

        if (!org) {
            throw AppError.notFound('Organization not found');
        }

        const flag = await prisma.governmentAuditFlag.create({
            data: {
                organization_id,
                flagged_by_user_id: user.userId,
                reason,
                severity,
                status: 'OPEN'
            }
        });

        // Audit Logging
        await auditLogRepo.create({
            actor_id: user.userId,
            actor_role: user.role,
            action: 'GOVERNMENT_FLAG_CREATED',
            entity_type: 'GovernmentAuditFlag',
            entity_id: flag.id,
            new_value: { organization_id, reason, severity },
            ip_address: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
        });

        // Trigger 10: Risk flag triggered -> create P1 for GOV + P1 for CSR funder
        try {
            const { NotificationTriggers } = await import('@/lib/notifications');
            await NotificationTriggers.riskFlagTriggered(
                severity,
                org.name,
                null
            );
        } catch (notifErr) {
            console.warn('Risk flag notification dispatch failed:', notifErr);
        }

        return NextResponse.json(successResponse({ flag }), { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
