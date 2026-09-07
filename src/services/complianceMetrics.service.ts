import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ComplianceMetricsService {
    /**
     * Calculates transparency and compliance metrics for an organization.
     * Useful for the detailed regulatory report.
     */
    static async getOrganizationComplianceMetrics(organizationId: string) {
        const activities = await prisma.projectActivity.findMany({
            where: {
                project: {
                    organization_id: organizationId
                }
            },
            orderBy: { created_at: 'desc' }
        });

        if (activities.length === 0) {
            return {
                last_activity_update_days: null,
                activity_update_frequency: 0,
                proof_upload_ratio: 0,
                geo_tag_ratio: 0
            };
        }

        // 1. Last Activity Update Days
        const lastActivity = activities[0];
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastActivity.created_at.getTime());
        const lastActivityUpdateDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // 2. Activity Update Frequency (per month approx)
        const firstActivity = activities[activities.length - 1];
        const firstActivityDate = firstActivity.created_at;
        const monthsDiff = Math.max(
            1,
            (today.getFullYear() - firstActivityDate.getFullYear()) * 12 +
            (today.getMonth() - firstActivityDate.getMonth())
        );
        const activityUpdateFrequency = activities.length / monthsDiff;

        // 3. Proof Upload Ratio
        const proofUploads = activities.filter(a => a.proof_url).length;
        const proofUploadRatio = (proofUploads / activities.length) * 100;

        // 4. Geo-Tag Ratio
        const geoTags = activities.filter(a => a.latitude !== null && a.longitude !== null).length;
        const geoTagRatio = (geoTags / activities.length) * 100;

        return {
            last_activity_update_days: lastActivityUpdateDays,
            activity_update_frequency: Number(activityUpdateFrequency.toFixed(2)),
            proof_upload_ratio: Number(proofUploadRatio.toFixed(2)),
            geo_tag_ratio: Number(geoTagRatio.toFixed(2))
        };
    }
}
