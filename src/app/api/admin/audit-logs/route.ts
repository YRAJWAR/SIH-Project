import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/server/middleware/auth';
import { handleApiError, AppError } from '@/server/middleware/errorHandler';
import { successResponse, parsePagination, buildPaginationMeta } from '@/server/utils';

// ──────────────────────────────────────────────────────────────
// GET /api/admin/audit-logs — Query audit trail
//
// Admin-only. Supports filtering by entity_type, action, actor_id.
// Paginated.
// ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    try {
        const user = await authenticateRequest(request);
        requireRole(user, 'ADMIN');

        const { searchParams } = new URL(request.url);
        const { page, pageSize } = parsePagination(searchParams);
        const entityType = searchParams.get('entity_type') || undefined;
        const action = searchParams.get('action') || undefined;
        const actorId = searchParams.get('actor_id') || undefined;

        try {
            const prismaModule = await import('@/lib/prisma');
            const prisma = prismaModule.default;

            const where: Record<string, unknown> = {};
            if (entityType) where.entity_type = entityType;
            if (action) where.action = action;
            if (actorId) where.actor_id = actorId;

            const [items, total] = await Promise.all([
                prisma.auditLog.findMany({
                    where,
                    orderBy: { created_at: 'desc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                prisma.auditLog.count({ where }),
            ]);

            return NextResponse.json(successResponse(
                items,
                buildPaginationMeta(page, pageSize, total)
            ));
        } catch {
            throw AppError.internal('Database unavailable for audit logs');
        }
    } catch (error) {
        return handleApiError(error);
    }
}
