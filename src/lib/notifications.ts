import prisma from '@/lib/prisma';

export interface CreateNotificationParams {
    userId: string;
    message: string;
    entityType: string;
    entityId: string;
    priority?: string;
    challengeId?: string | null;
}

/**
 * Standard notification creator wrapping prisma.notification.create
 */
export async function createNotification(
    userIdOrParams: string | CreateNotificationParams,
    message?: string,
    entityType?: string,
    entityId?: string,
    priority: string = 'P2',
    challengeId?: string | null
) {
    try {
        let params: CreateNotificationParams;
        if (typeof userIdOrParams === 'object') {
            params = userIdOrParams;
        } else {
            params = {
                userId: userIdOrParams,
                message: message || '',
                entityType: entityType || 'GENERAL',
                entityId: entityId || '',
                priority: priority || 'P2',
                challengeId: challengeId || null,
            };
        }

        return await prisma.notification.create({
            data: {
                userId: params.userId,
                message: params.message,
                entityType: params.entityType,
                entityId: params.entityId,
                priority: params.priority || 'P2',
                challengeId: params.challengeId || null,
                read: false,
            },
        });
    } catch (err) {
        console.warn('Notification create failed (non-fatal):', err);
        return null;
    }
}

/**
 * Notify all users with the specified role(s)
 */
export async function notifyUsersByRole(
    roles: string | string[],
    message: string,
    entityType: string,
    entityId: string,
    priority: string = 'P2',
    challengeId?: string | null
) {
    try {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        const normalizedRoles = Array.from(
            new Set(roleArray.flatMap((r) => [r.toUpperCase(), r.toLowerCase()]))
        );

        const users = await prisma.user.findMany({
            where: {
                role: { in: normalizedRoles },
            },
            select: { id: true },
            take: 25,
        });

        if (users.length === 0) return [];

        const created = await prisma.notification.createMany({
            data: users.map((u) => ({
                userId: u.id,
                message,
                entityType,
                entityId,
                priority,
                challengeId: challengeId || null,
                read: false,
            })),
        });

        return created;
    } catch (err) {
        console.warn('notifyUsersByRole failed (non-fatal):', err);
        return [];
    }
}

/**
 * Notify a specific list of user IDs
 */
export async function notifyUsers(
    userIds: string[],
    message: string,
    entityType: string,
    entityId: string,
    priority: string = 'P2',
    challengeId?: string | null
) {
    try {
        if (!userIds || userIds.length === 0) return [];

        return await prisma.notification.createMany({
            data: userIds.map((userId) => ({
                userId,
                message,
                entityType,
                entityId,
                priority,
                challengeId: challengeId || null,
                read: false,
            })),
        });
    } catch (err) {
        console.warn('notifyUsers failed (non-fatal):', err);
        return [];
    }
}

/**
 * High-level helper dispatchers for the 10 platform notification triggers
 */
export const NotificationTriggers = {
    // 1. Challenge submitted -> P2 for GOV
    async challengeSubmitted(challenge: { id: string; title: string; district: string }) {
        const msg = `New challenge submitted: '${challenge.title}' in ${challenge.district}`;
        return notifyUsersByRole(['GOVERNMENT', 'GOV'], msg, 'CHALLENGE', challenge.id, 'P2', challenge.id);
    },

    // 2. Challenge VALIDATED -> P2 for submitter + P2 for HEI users
    async challengeValidated(challenge: { id: string; title: string; submitterId?: string | null }) {
        const msg = `Challenge '${challenge.title}' has been validated by the government`;
        if (challenge.submitterId) {
            await createNotification(challenge.submitterId, msg, 'CHALLENGE', challenge.id, 'P2', challenge.id);
        }
        return notifyUsersByRole(['HEI'], msg, 'CHALLENGE', challenge.id, 'P2', challenge.id);
    },

    // 3. HEI accepts challenge (TEAM_FORMED) -> P2 for GOV
    async teamFormed(challenge: { id: string; title: string }, heiName: string = 'NIT Jamshedpur') {
        const msg = `${heiName} has formed a team for '${challenge.title}'`;
        return notifyUsersByRole(['GOVERNMENT', 'GOV'], msg, 'CHALLENGE', challenge.id, 'P2', challenge.id);
    },

    // 4. Proposal SUBMITTED -> P2 for GOV + P2 for matching CSR users
    async proposalSubmitted(proposal: { id: string; challengeId: string; challengeTitle: string }) {
        const msg = `New proposal submitted for '${proposal.challengeTitle}' — funding opportunity`;
        await notifyUsersByRole(['GOVERNMENT', 'GOV'], msg, 'PROPOSAL', proposal.id, 'P2', proposal.challengeId);
        return notifyUsersByRole(['CORPORATE', 'CSR'], msg, 'PROPOSAL', proposal.id, 'P2', proposal.challengeId);
    },

    // 5. Proposal ACCEPTED -> P1 for HEI + P1 for CSR company
    async proposalAccepted(
        proposal: { id: string; challengeId: string; challengeTitle: string },
        heiUserId?: string | null,
        csrUserId?: string | null
    ) {
        const msg = `Your proposal for '${proposal.challengeTitle}' has been accepted! Project begins now.`;
        if (heiUserId) {
            await createNotification(heiUserId, msg, 'PROPOSAL', proposal.id, 'P1', proposal.challengeId);
        } else {
            await notifyUsersByRole(['HEI'], msg, 'PROPOSAL', proposal.id, 'P1', proposal.challengeId);
        }

        if (csrUserId) {
            await createNotification(csrUserId, msg, 'PROPOSAL', proposal.id, 'P1', proposal.challengeId);
        } else {
            await notifyUsersByRole(['CORPORATE', 'CSR'], msg, 'PROPOSAL', proposal.id, 'P1', proposal.challengeId);
        }
    },

    // 6. Milestone SUBMITTED -> P2 for GOV + P2 for CSR funder
    async milestoneSubmitted(
        milestone: { id: string; title: string; challengeId?: string | null },
        csrUserId?: string | null
    ) {
        const msg = `Milestone '${milestone.title}' submitted for verification`;
        await notifyUsersByRole(['GOVERNMENT', 'GOV'], msg, 'MILESTONE', milestone.id, 'P2', milestone.challengeId);
        if (csrUserId) {
            await createNotification(csrUserId, msg, 'MILESTONE', milestone.id, 'P2', milestone.challengeId);
        } else {
            await notifyUsersByRole(['CORPORATE', 'CSR'], msg, 'MILESTONE', milestone.id, 'P2', milestone.challengeId);
        }
    },

    // 7. Milestone GP_VERIFIED -> P2 for HEI + P2 for student
    async milestoneVerified(
        milestone: { id: string; title: string; challengeId?: string | null },
        heiUserIds: string[] = [],
        studentUserIds: string[] = []
    ) {
        const msg = `Your milestone '${milestone.title}' is verified on-site by the Gram Panchayat`;
        if (heiUserIds.length > 0) {
            await notifyUsers(heiUserIds, msg, 'MILESTONE', milestone.id, 'P2', milestone.challengeId);
        } else {
            await notifyUsersByRole(['HEI'], msg, 'MILESTONE', milestone.id, 'P2', milestone.challengeId);
        }

        if (studentUserIds.length > 0) {
            await notifyUsers(studentUserIds, msg, 'MILESTONE', milestone.id, 'P2', milestone.challengeId);
        }
    },

    // 8. Fund release authorized (CSR_APPROVED) -> P1 for NGO + P1 for HEI
    async fundReleased(
        milestone: { id: string; title: string; challengeId?: string | null },
        amount: number,
        ngoUserId?: string | null,
        heiUserId?: string | null
    ) {
        const msg = `Tranche released: ₹${amount.toLocaleString('en-IN')} for milestone '${milestone.title}'`;
        if (ngoUserId) {
            await createNotification(ngoUserId, msg, 'MILESTONE', milestone.id, 'P1', milestone.challengeId);
        } else {
            await notifyUsersByRole(['NGO'], msg, 'MILESTONE', milestone.id, 'P1', milestone.challengeId);
        }

        if (heiUserId) {
            await createNotification(heiUserId, msg, 'MILESTONE', milestone.id, 'P1', milestone.challengeId);
        } else {
            await notifyUsersByRole(['HEI'], msg, 'MILESTONE', milestone.id, 'P1', milestone.challengeId);
        }
    },

    // 9. Challenge DEPLOYED -> P1 for challenge submitter + P2 for all stakeholders
    async challengeDeployed(
        challenge: { id: string; title: string; district: string; submitterId?: string | null },
        familiesHelped: number = 500
    ) {
        const msg = `Challenge '${challenge.title}' is now DEPLOYED! ${familiesHelped} families helped in ${challenge.district}.`;
        if (challenge.submitterId) {
            await createNotification(challenge.submitterId, msg, 'CHALLENGE', challenge.id, 'P1', challenge.id);
        }
        await notifyUsersByRole(['GOVERNMENT', 'GOV', 'HEI', 'CORPORATE', 'CSR', 'NGO'], msg, 'CHALLENGE', challenge.id, 'P2', challenge.id);
    },

    // 10. Risk flag triggered -> P1 for GOV + P1 for CSR funder
    async riskFlagTriggered(
        flagType: string,
        projectOrChallengeTitle: string,
        challengeId?: string | null,
        csrUserId?: string | null
    ) {
        const msg = `⚠ Risk flag: ${flagType} on project '${projectOrChallengeTitle}' — review required`;
        await notifyUsersByRole(['GOVERNMENT', 'GOV'], msg, 'RISK_FLAG', challengeId || 'risk', 'P1', challengeId);
        if (csrUserId) {
            await createNotification(csrUserId, msg, 'RISK_FLAG', challengeId || 'risk', 'P1', challengeId);
        } else {
            await notifyUsersByRole(['CORPORATE', 'CSR'], msg, 'RISK_FLAG', challengeId || 'risk', 'P1', challengeId);
        }
    },
};
