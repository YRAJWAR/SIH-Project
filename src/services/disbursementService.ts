import prisma from '@/lib/prisma';
import { auditLogRepo } from '@/server/repositories';

/**
 * SDG Nexus — Smart Disbursement Service (Milestone Escrow)
 * Automates CSR fund releases based on verified physical progress.
 * Transitioning from "lump-sum" transfers to "performance-linked" funding.
 */
export class DisbursementService {
    /**
     * Checks project activity and triggers fund release if milestones are met.
     */
    static async processMilestoneDisbursement(projectId: string): Promise<{
        disbursed: boolean;
        amount?: number;
        milestone?: string;
    }> {
        // Check if there are any milestones hit

        // 1. Fetch Project and CSR Allocations
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                activities: true,
                csr_allocations: true
            }
        });

        if (!project || project.csr_allocations.length === 0) {
            return { disbursed: false };
        }

        // 2. Logic: Release 25% for every 2 verified activities (Simulated milestone)
        const activityCount = project.activities.length;
        const totalCommitted = project.csr_allocations.reduce((sum: number, acc: any) => sum + Number(acc.amount_committed), 0);
        const totalDisbursed = project.csr_allocations.reduce((sum: number, acc: any) => sum + Number(acc.amount_disbursed), 0);

        // Calculate expected disbursement based on current milestone (2 activities = 25%)
        let targetDisbursementRatio = 0;
        if (activityCount >= 8) targetDisbursementRatio = 1.0;      // 100%
        else if (activityCount >= 6) targetDisbursementRatio = 0.75; // 75%
        else if (activityCount >= 4) targetDisbursementRatio = 0.50; // 50%
        else if (activityCount >= 2) targetDisbursementRatio = 0.25; // 25%

        const targetAmount = totalCommitted * targetDisbursementRatio;
        const remainingToDisburse = targetAmount - totalDisbursed;

        if (remainingToDisburse > 0) {

            // Update CSR Allocations (distributed proportionally if multiple)
            for (const allocation of project.csr_allocations) {
                const proportion = Number(allocation.amount_committed) / totalCommitted;
                const releaseAmount = remainingToDisburse * proportion;

                await prisma.cSRAllocation.update({
                    where: { id: allocation.id },
                    data: { amount_disbursed: { increment: releaseAmount } }
                });

                // Audit Log
                await auditLogRepo.create({
                    actor_id: 'SMART_CONTRACT_ENGINE',
                    actor_role: 'SYSTEM',
                    action: 'FUNDS_DISBURSED',
                    entity_type: 'CSRAllocation',
                    entity_id: allocation.id,
                    new_value: {
                        milestone_ratio: targetDisbursementRatio,
                        amount: releaseAmount,
                        project_id: projectId
                    }
                });
            }

            return {
                disbursed: true,
                amount: remainingToDisburse,
                milestone: `${targetDisbursementRatio * 100}% Progress`
            };
        }

        return { disbursed: false };
    }
}
