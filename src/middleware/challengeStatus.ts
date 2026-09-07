// ──────────────────────────────────────────────────────────────
// SDG Nexus — Challenge Status Pipeline Enforcement Middleware
// Enforces Triple-Helix state transitions and RBAC permissions
// ──────────────────────────────────────────────────────────────

export type ChallengeStatusType =
    | 'SUBMITTED'
    | 'AI_PROCESSED'
    | 'VALIDATED'
    | 'UNIVERSITY_ASSIGNED'
    | 'TEAM_FORMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'DEPLOYED';

export type PipelineRole = 'SYSTEM' | 'GOV' | 'HEI' | 'CITIZEN' | 'ADMIN';

export const VALID_TRANSITIONS: Record<string, ChallengeStatusType[]> = {
    SUBMITTED: ['AI_PROCESSED'],
    AI_PROCESSED: ['VALIDATED'],
    VALIDATED: ['UNIVERSITY_ASSIGNED'],
    UNIVERSITY_ASSIGNED: ['TEAM_FORMED'],
    TEAM_FORMED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: ['DEPLOYED'],
};

export const WHO_CAN_TRANSITION: Record<string, string[]> = {
    SUBMITTED_to_AI_PROCESSED: ['SYSTEM'],
    AI_PROCESSED_to_VALIDATED: ['GOV'],
    VALIDATED_to_UNIVERSITY_ASSIGNED: ['GOV'],
    UNIVERSITY_ASSIGNED_to_TEAM_FORMED: ['HEI'],
    TEAM_FORMED_to_IN_PROGRESS: ['GOV'],
    IN_PROGRESS_to_COMPLETED: ['SYSTEM'], // all milestones verified
    COMPLETED_to_DEPLOYED: ['CITIZEN'], // citizen validation only
};

export interface TransitionCheckResult {
    allowed: boolean;
    reason?: string;
    normalizedRole?: string;
}

/**
 * Normalizes a user role from various string formats to pipeline roles
 */
export function normalizePipelineRole(role?: string): string {
    if (!role) return 'CITIZEN';
    const upper = role.toUpperCase().trim();
    if (upper === 'GOVERNMENT' || upper === 'GOV' || upper === 'COLLECTOR' || upper === 'ADMIN') {
        return 'GOV';
    }
    if (upper === 'HEI' || upper === 'FACULTY' || upper === 'UNIVERSITY') {
        return 'HEI';
    }
    if (upper === 'SYSTEM' || upper === 'CRON' || upper === 'WORKER') {
        return 'SYSTEM';
    }
    if (upper === 'CITIZEN' || upper === 'COMMUNITY') {
        return 'CITIZEN';
    }
    return upper;
}

/**
 * Validates whether a challenge can transition from currentStatus to newStatus,
 * and whether the requesting user's role has permission.
 */
export function canTransitionStatus(
    currentStatus: string,
    newStatus: string,
    userRole: string
): TransitionCheckResult {
    const cur = currentStatus as ChallengeStatusType;
    const next = newStatus as ChallengeStatusType;

    // 1. Validate status sequence
    const allowedTransitions = VALID_TRANSITIONS[cur];
    if (!allowedTransitions || !allowedTransitions.includes(next)) {
        return {
            allowed: false,
            reason: `Invalid status transition sequence: ${currentStatus} cannot transition directly to ${newStatus}. Allowed next states: ${
                allowedTransitions ? allowedTransitions.join(', ') : 'none'
            }`,
        };
    }

    // 2. Validate role authorization
    const transitionKey = `${cur}_to_${next}`;
    const authorizedRoles = WHO_CAN_TRANSITION[transitionKey] || [];
    const normalized = normalizePipelineRole(userRole);

    const isAuthorized =
        authorizedRoles.includes(normalized) ||
        normalized === 'SYSTEM' || // System automations can execute or override
        (normalized === 'GOV' && userRole.toUpperCase() === 'ADMIN'); // System admin has gov privileges

    if (!isAuthorized) {
        return {
            allowed: false,
            normalizedRole: normalized,
            reason: `Unauthorized status transition: Role '${userRole}' (${normalized}) is not authorized for transition '${transitionKey}'. Allowed role(s): ${authorizedRoles.join(
                ', '
            )}`,
        };
    }

    return {
        allowed: true,
        normalizedRole: normalized,
    };
}
