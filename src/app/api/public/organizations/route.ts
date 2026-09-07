import { NextResponse } from 'next/server';
import { handleApiError } from '@/server/middleware/errorHandler';
import { successResponse } from '@/server/utils';

// ──────────────────────────────────────────────────────────────
// GET /api/public/organizations
// Public read-only listing of verified organizations.
// Sensitive financial details excluded.
// ──────────────────────────────────────────────────────────────

const FALLBACK_ORGS = [
    { id: 'u1', name: 'GreenFuture Foundation', type: 'NGO', state: 'Maharashtra', district: 'Mumbai', verification_status: 'VERIFIED', project_count: 3, total_beneficiaries: 80000, impact_score: 847, sdg_focus: [6, 3, 7, 4] },
    { id: 'org2', name: 'EcoIndia Trust', type: 'NGO', state: 'Karnataka', district: 'Bengaluru', verification_status: 'VERIFIED', project_count: 1, total_beneficiaries: 120000, impact_score: 890, sdg_focus: [11, 12, 13] },
    { id: 'org3', name: 'HealthBridge India', type: 'NGO', state: 'Odisha', district: 'Koraput', verification_status: 'VERIFIED', project_count: 1, total_beneficiaries: 35000, impact_score: 935, sdg_focus: [3, 1, 10] },
    { id: 'org4', name: 'BlueOcean NGO', type: 'NGO', state: 'Kerala', district: 'Kochi', verification_status: 'VERIFIED', project_count: 1, total_beneficiaries: 15000, impact_score: 802, sdg_focus: [14, 12, 13] },
    { id: 'org5', name: 'EduRise Foundation', type: 'NGO', state: 'Delhi', district: null, verification_status: 'VERIFIED', project_count: 2, total_beneficiaries: 20000, impact_score: 768, sdg_focus: [4, 5, 8] },
    { id: 'org6', name: 'AgroSustain India', type: 'NGO', state: 'Madhya Pradesh', district: 'Bhopal', verification_status: 'VERIFIED', project_count: 2, total_beneficiaries: 45000, impact_score: 812, sdg_focus: [2, 1, 15] },
];

export async function GET() {
    try {
        try {
            const prismaModule = await import('@/lib/prisma');
            const prisma = prismaModule.default;

            const orgs = await prisma.organization.findMany({
                where: { verification_status: 'VERIFIED' },
                select: {
                    id: true, name: true, type: true, state: true, district: true,
                    verification_status: true,
                    projects: {
                        select: {
                            beneficiaries_count: true,
                            sdg_tags: { select: { sdg_id: true } },
                        },
                    },
                },
                orderBy: { name: 'asc' },
            });

            if (orgs.length === 0) {
                return NextResponse.json(successResponse(
                    { organizations: FALLBACK_ORGS },
                    { source: 'fallback' }
                ));
            }

            const orgIds = orgs.map((o: any) => o.id);
            const scores = await prisma.impactScore.findMany({
                where: { organization_id: { in: orgIds } },
                orderBy: { calculated_at: 'desc' },
                distinct: ['organization_id'],
                select: { organization_id: true, final_score: true },
            });
            const scoreMap = new Map<string, number>();
            for (const s of scores) scoreMap.set(s.organization_id, Number(s.final_score));

            const result = orgs.map((o: any) => ({
                id: o.id, name: o.name, type: o.type, state: o.state, district: o.district,
                verification_status: o.verification_status,
                project_count: o.projects.length,
                total_beneficiaries: o.projects.reduce((s: number, p: any) => s + p.beneficiaries_count, 0),
                impact_score: scoreMap.get(o.id) ?? 0,
                sdg_focus: [...new Set(o.projects.flatMap((p: any) => p.sdg_tags.map((t: any) => t.sdg_id)))],
            }));

            return NextResponse.json(successResponse(
                { organizations: result },
                { source: 'database' }
            ));
        } catch {
            // DB unavailable
        }

        return NextResponse.json(successResponse(
            { organizations: FALLBACK_ORGS },
            { source: 'fallback' }
        ));
    } catch (error) {
        return handleApiError(error);
    }
}
