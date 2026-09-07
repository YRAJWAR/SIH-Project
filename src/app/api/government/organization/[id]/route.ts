import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireRole } from '@/server/middleware/auth';
import { handleApiError, AppError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';
import { PrismaClient } from '@prisma/client';
import { ComplianceMetricsService } from '@/services/complianceMetrics.service';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────
// GET /api/government/organization/[id]
//
// Detailed regulatory report for a specific organization.
// ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await authenticateRequest(request);
        requireRole(user, 'GOVERNMENT', 'ADMIN');

        const { id } = await params;

        const org = await prisma.organization.findUnique({
            where: { id },
            include: {
                financial_summary: true,
                impact_scores: {
                    orderBy: { calculated_at: 'desc' },
                    take: 1
                },
                score_history: {
                    orderBy: { recorded_at: 'desc' },
                    take: 10
                },
                projects: {
                    where: { status: 'ACTIVE' },
                    select: {
                        id: true,
                        title: true,
                        budget_allocated: true,
                        budget_utilized: true,
                        status: true,
                        latitude: true,
                        longitude: true,
                    }
                },
                csr_allocations: {
                    include: {
                        project: { select: { title: true } }
                    }
                },
                risk_flags: true,
                audit_flags: true,
            }
        });

        if (!org) {
            throw AppError.notFound('Organization not found');
        }

        const compliance_metrics = await ComplianceMetricsService.getOrganizationComplianceMetrics(id);

        const project_count = await prisma.project.groupBy({
            by: ['status'],
            where: { organization_id: id },
            _count: { id: true }
        });

        const active_projects_count = project_count.find(p => p.status === 'ACTIVE')?._count.id || 0;
        const completed_projects_count = project_count.find(p => p.status === 'COMPLETED')?._count.id || 0;

        return NextResponse.json(successResponse({
            organization_profile: {
                id: org.id,
                name: org.name,
                type: org.type,
                registration_number: org.registration_number,
                country: org.country,
                state: org.state,
                district: org.district,
                verification_status: org.verification_status,
                created_at: org.created_at
            },
            financial_summary: org.financial_summary,
            impact_score_current: org.impact_scores[0] || null,
            impact_score_history: org.score_history,
            active_projects: org.projects,
            project_stats: {
                active: active_projects_count,
                completed: completed_projects_count
            },
            csr_allocations: org.csr_allocations,
            transparency_metrics: compliance_metrics,
            risk_flags: org.risk_flags,
            audit_flags: org.audit_flags,
            geo_distribution_of_projects: org.projects.map(p => ({ lat: p.latitude, lng: p.longitude, title: p.title }))
        }));
    } catch (error) {
        return handleApiError(error);
    }
}
