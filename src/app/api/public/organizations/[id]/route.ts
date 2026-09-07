import { NextResponse } from 'next/server';

// ──────────────────────────────────────────────────────────────
// GET /api/public/organizations/:id
//
// Public read-only profile of a single organization.
// Returns: profile, impact score breakdown, SDG tags, transparency
//          level, geo impact data, project summaries (no financials).
// ──────────────────────────────────────────────────────────────

const FALLBACK_ORG = {
    id: 'u1', name: 'GreenFuture Foundation', type: 'NGO', state: 'Maharashtra', district: 'Mumbai',
    verification_status: 'VERIFIED',
    impact: { scale_score: 88, outcome_score: 85, efficiency_score: 79, geographic_need_score: 82, transparency_score: 92, final_score: 847, calculation_version: '2.0' },
    sdg_focus: [6, 3, 7, 4],
    transparency: { total_activities: 7, verified_activities: 5, verification_rate: 71, has_geo_tags: true, has_proof_uploads: true, level: 'High' },
    projects: [
        { id: 'p1', title: 'Clean Water for Rural Maharashtra', status: 'ACTIVE', beneficiaries: 25000, sdg_tags: [6, 3, 1], location: 'Maharashtra' },
        { id: 'p2', title: 'Solar Schools Initiative', status: 'ACTIVE', beneficiaries: 50000, sdg_tags: [7, 4, 13], location: 'Rajasthan' },
        { id: 'p3', title: 'Women Skill Development Program', status: 'ACTIVE', beneficiaries: 5000, sdg_tags: [5, 8, 4], location: 'Bihar' },
    ],
    geo_impact: [
        { district: 'Mumbai', state: 'Maharashtra', sdg_id: 6, total_beneficiaries: 25000 },
        { district: 'Jaipur', state: 'Rajasthan', sdg_id: 7, total_beneficiaries: 50000 },
        { district: 'Patna', state: 'Bihar', sdg_id: 5, total_beneficiaries: 5000 },
    ],
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        try {
            const prismaModule = await import('@/lib/prisma');
            const prisma = prismaModule.default;

            const org = await prisma.organization.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    state: true,
                    district: true,
                    verification_status: true,
                    projects: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            beneficiaries_count: true,
                            latitude: true,
                            longitude: true,
                            sdg_tags: { select: { sdg_id: true } },
                            activities: {
                                select: {
                                    proof_url: true,
                                    latitude: true,
                                    longitude: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!org) {
                return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
            }

            // Impact score
            const score = await prisma.impactScore.findFirst({
                where: { organization_id: id },
                orderBy: { calculated_at: 'desc' },
            });

            // Transparency calculation
            let totalActivities = 0;
            let verifiedActivities = 0;
            let hasGeo = false;
            let hasProof = false;
            for (const proj of (org as any).projects) {
                for (const act of proj.activities) {
                    totalActivities++;
                    if (act.proof_url) { verifiedActivities++; hasProof = true; }
                    if (act.latitude && act.longitude) hasGeo = true;
                }
                if (proj.latitude && proj.longitude) hasGeo = true;
            }
            const verificationRate = totalActivities > 0 ? Math.round((verifiedActivities / totalActivities) * 100) : 0;
            const transparencyLevel = verificationRate >= 80 ? 'Very High' : verificationRate >= 60 ? 'High' : verificationRate >= 40 ? 'Medium' : 'Low';

            // Build SDG focus
            const allSDGs = [...new Set((org as any).projects.flatMap((p: any) => p.sdg_tags.map((t: any) => t.sdg_id)))];

            // Geo impact
            const geoImpact = (org as any).projects.map((p: any) => ({
                project_title: p.title,
                status: p.status,
                beneficiaries: p.beneficiaries_count,
                sdg_tags: p.sdg_tags.map((t: any) => t.sdg_id),
                latitude: p.latitude ? Number(p.latitude) : null,
                longitude: p.longitude ? Number(p.longitude) : null,
            }));

            // Project summaries (NO financials — budget/spent excluded)
            const projects = (org as any).projects.map((p: any) => ({
                id: p.id,
                title: p.title,
                status: p.status,
                beneficiaries: p.beneficiaries_count,
                sdg_tags: p.sdg_tags.map((t: any) => t.sdg_id),
            }));

            return NextResponse.json({
                id: org.id,
                name: org.name,
                type: org.type,
                state: org.state,
                district: org.district,
                verification_status: org.verification_status,
                impact: score ? {
                    scale_score: Number(score.scale_score),
                    outcome_score: Number(score.outcome_score),
                    efficiency_score: Number(score.efficiency_score),
                    geographic_need_score: Number(score.geographic_need_score),
                    transparency_score: Number(score.transparency_score),
                    final_score: Number(score.final_score),
                    calculation_version: score.calculation_version || '1.0',
                } : null,
                sdg_focus: allSDGs,
                transparency: {
                    total_activities: totalActivities,
                    verified_activities: verifiedActivities,
                    verification_rate: verificationRate,
                    has_geo_tags: hasGeo,
                    has_proof_uploads: hasProof,
                    level: transparencyLevel,
                },
                projects,
                geo_impact: geoImpact,
                source: 'database',
            });
        } catch {
            // DB unavailable
        }

        return NextResponse.json({ ...FALLBACK_ORG, source: 'fallback' });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
    }
}
