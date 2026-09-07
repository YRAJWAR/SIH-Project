import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/server/middleware/auth';
import { handleApiError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────
// GET /api/government/organizations
//
// Government-only endpoint to list organizations with advanced
// filtering for regulatory intelligence.
// ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    try {
        // Authenticate and authorize
        const user = await authenticateRequest(request);
        requireRole(user, 'GOVERNMENT', 'ADMIN');

        const { searchParams } = new URL(request.url);

        // Filters
        const type = searchParams.get('type');
        const district = searchParams.get('district');
        const state = searchParams.get('state');
        const sdg_id = searchParams.get('sdg_id');
        const min_funding = searchParams.get('min_funding');
        const max_funding = searchParams.get('max_funding');
        const risk_level = searchParams.get('risk_level');
        const verification_status = searchParams.get('verification_status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};
        if (type) where.type = type;
        if (district) where.district = district;
        if (state) where.state = state;
        if (verification_status) where.verification_status = verification_status;

        // SDG Filter
        if (sdg_id) {
            where.projects = {
                some: {
                    sdg_tags: {
                        some: { sdg_id: parseInt(sdg_id) }
                    }
                }
            };
        }

        // Risk level filter
        if (risk_level) {
            where.risk_flags = {
                some: { risk_level, resolved: false }
            };
        }

        // Funding filters using the new OrganizationFinancialSummary
        if (min_funding || max_funding) {
            where.financial_summary = {
                isNot: null,
                ...((min_funding || max_funding) && {
                    total_csr_received: {
                        ...(min_funding && { gte: parseFloat(min_funding) }),
                        ...(max_funding && { lte: parseFloat(max_funding) }),
                    }
                })
            };
        }

        // Fetch Data
        const [organizations, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip,
                take: limit,
                include: {
                    financial_summary: true,
                    impact_scores: {
                        orderBy: { calculated_at: 'desc' },
                        take: 1
                    },
                    risk_flags: {
                        where: { resolved: false }
                    },
                    audit_flags: {
                        where: { status: { not: 'RESOLVED' } }
                    },
                    _count: {
                        select: { projects: { where: { status: 'ACTIVE' } } }
                    }
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.organization.count({ where })
        ]);

        const mappedOrganizations = organizations.map(org => ({
            id: org.id,
            name: org.name,
            type: org.type,
            state: org.state,
            district: org.district,
            verification_status: org.verification_status,
            impact_score: org.impact_scores[0]?.final_score || 0,
            transparency_score: org.impact_scores[0]?.transparency_score || 0,
            financial_summary: org.financial_summary || { total_csr_received: 0, total_budget_utilized: 0 },
            active_projects_count: org._count.projects,
            risk_flags_count: org.risk_flags.length,
            audit_flags_count: org.audit_flags.length
        }));

        return NextResponse.json(successResponse({
            data: mappedOrganizations,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        }));
    } catch (error) {
        return handleApiError(error);
    }
}
