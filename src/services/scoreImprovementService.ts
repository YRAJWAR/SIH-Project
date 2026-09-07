import prisma from '@/lib/prisma';

export interface ScoreSuggestion {
    recommendation_type: string;
    message: string;
    potential_score_gain: number;
}

export class ScoreImprovementService {
    static async generateInsights(orgId: string): Promise<ScoreSuggestion[]> {
        const orgInfo = await prisma.organization.findUnique({
            where: { id: orgId },
            include: { projects: { include: { activities: true } }, transparency_metrics: true }
        });

        if (!orgInfo) return [];

        const suggestions: ScoreSuggestion[] = [];

        // 1. Transparency Checks
        if (!orgInfo.transparency_metrics || Number(orgInfo.transparency_metrics.proof_upload_ratio) < 0.7) {
            suggestions.push({
                recommendation_type: 'transparency',
                message: 'Upload verifiable proof (images/documents) for your recent project activities to boost your Transparency Score.',
                potential_score_gain: 15
            });
        }

        // New logic starts here
        const completedProjects = orgInfo.projects.filter((p: any) => p.status === 'COMPLETED');

        if (completedProjects.some((p: any) => p.activities.length === 0)) {
            suggestions.push({
                recommendation_type: 'PROOF_UPLOAD_MISSING',
                message: 'Some of your completed projects have no activity proofs uploaded. Providing proof significantly boosts your Transparency Score.',
                potential_score_gain: 15.00
            });
        }

        const latestProjects = await prisma.project.findMany({
            where: { organization_id: orgId, status: 'ACTIVE' },
            orderBy: { created_at: 'desc' },
            take: 3,
            include: { activities: { orderBy: { created_at: 'desc' }, take: 1 } }
        });

        const staleProject = latestProjects.find((p: any) => {
            if (p.activities.length === 0) return true;
            const latest: any = p.activities[0];
            const daysSinceUpdate = (new Date().getTime() - latest.created_at.getTime()) / (1000 * 3600 * 24);
            return daysSinceUpdate > 30;
        });

        if (staleProject) {
            suggestions.push({
                recommendation_type: 'PROJECT_UPDATE_REQUIRED',
                message: `Your active project "${staleProject.title}" hasn't been updated in over 30 days. Regular updates increase trust and score.`,
                potential_score_gain: 5.00
            });
        }

        // 4. Activity Geo-Tagging Issue
        const allActivities = latestProjects.flatMap((p: any) => p.activities);
        const unGeoTagged = allActivities.filter((act: any) => !act.latitude || !act.longitude).length;
        // New logic ends here

        // Persist insights
        for (const sug of suggestions) {
            await prisma.organizationInsights.create({
                data: {
                    organization_id: orgId,
                    recommendation_type: sug.recommendation_type,
                    message: sug.message,
                    potential_score_gain: sug.potential_score_gain
                }
            });
        }

        return suggestions;
    }
}
