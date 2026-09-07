import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sdg = searchParams.get('sdg');
        const location = searchParams.get('location');
        const min_impact = searchParams.get('min_impact');

        const whereClause: any = { status: 'ACTIVE' };

        if (sdg) {
            whereClause.sdg_tags = { some: { sdg_id: parseInt(sdg, 10) } };
        }
        if (location) {
            whereClause.location = { contains: location, mode: 'insensitive' };
        }

        const projects = await prisma.project.findMany({
            where: whereClause,
            include: {
                organization: {
                    select: {
                        name: true,
                        impact_scores: { orderBy: { calculated_at: 'desc' }, take: 1 },
                        transparency_metrics: true
                    }
                }
            },
            take: 20
        });

        let filtered = projects.map((p: any) => {
            const org = p.organization;
            const impact_score = org.impact_scores[0] ? Number(org.impact_scores[0].final_score) : 0;
            const funding_required = Number(p.budget_allocated) - Number(p.budget_utilized);

            return {
                project_id: p.id,
                title: p.title,
                ngo_name: org.name,
                impact_score,
                transparency_score: org.transparency_metrics ? Number(org.transparency_metrics.transparency_score) : 0,
                beneficiaries_reached: p.beneficiaries_count,
                funding_required: funding_required > 0 ? funding_required : 0
            };
        });

        if (min_impact) {
            const min = parseInt(min_impact, 10);
            filtered = filtered.filter((p: any) => p.impact_score >= min);
        }

        return NextResponse.json({
            success: true,
            data: filtered,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching projects discovery:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch projects.' },
            { status: 500 }
        );
    }
}
