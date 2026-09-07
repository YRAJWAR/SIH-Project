// ──────────────────────────────────────────────────────────────
// SDG Nexus — Database Repository Layer
// All Prisma database access goes through here.
// Services NEVER call Prisma directly.
// ──────────────────────────────────────────────────────────────

import type { PaginationInput } from '@/server/types';

// Helper to get Prisma instance safely
async function getPrisma() {
    const mod = await import('@/lib/prisma');
    return mod.default;
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION REPOSITORY
// ═══════════════════════════════════════════════════════════════

export const organizationRepo = {
    async findById(id: string) {
        const prisma = await getPrisma();
        return prisma.organization.findUnique({ where: { id } });
    },

    async findAll(pagination: PaginationInput, filters?: { type?: string; state?: string; status?: string }) {
        const prisma = await getPrisma();
        const where: Record<string, unknown> = {};
        if (filters?.type) where.type = filters.type;
        if (filters?.state) where.state = filters.state;
        if (filters?.status) where.verification_status = filters.status;

        const [items, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip: (pagination.page - 1) * pagination.page_size,
                take: pagination.page_size,
                orderBy: { name: 'asc' },
            }),
            prisma.organization.count({ where }),
        ]);
        return { items, total };
    },

    async create(data: {
        name: string; type: string; registration_number?: string;
        state: string; district?: string; country?: string;
    }) {
        const prisma = await getPrisma();
        return prisma.organization.create({ data: data as any });
    },

    async updateVerificationStatus(id: string, status: string) {
        const prisma = await getPrisma();
        return prisma.organization.update({
            where: { id },
            data: { verification_status: status as any },
        });
    },
};

// ═══════════════════════════════════════════════════════════════
// PROJECT REPOSITORY
// ═══════════════════════════════════════════════════════════════

export const projectRepo = {
    async findById(id: string) {
        const prisma = await getPrisma();
        return prisma.project.findUnique({
            where: { id },
            include: {
                sdg_tags: { include: { sdg: true } },
                organization: { select: { id: true, name: true, state: true, district: true } },
            },
        });
    },

    async findByOrgId(orgId: string) {
        const prisma = await getPrisma();
        return prisma.project.findMany({
            where: { organization_id: orgId },
            include: {
                sdg_tags: { select: { sdg_id: true } },
                activities: { select: { id: true, proof_url: true, created_at: true } },
            },
        });
    },

    async findAll(pagination: PaginationInput, filters?: { status?: string; org_id?: string }) {
        const prisma = await getPrisma();
        const where: Record<string, unknown> = {};
        if (filters?.status) where.status = filters.status;
        if (filters?.org_id) where.organization_id = filters.org_id;

        const [items, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip: (pagination.page - 1) * pagination.page_size,
                take: pagination.page_size,
                orderBy: { created_at: 'desc' },
                include: { sdg_tags: { select: { sdg_id: true } } },
            }),
            prisma.project.count({ where }),
        ]);
        return { items, total };
    },

    /**
     * Create project with SDG tags and initial activity in a single transaction.
     */
    async createWithTransaction(data: {
        id: string;
        organization_id: string;
        title: string;
        description: string;
        budget_allocated: number;
        budget_utilized: number;
        beneficiaries_count: number;
        outcome_metric_value?: number | null;
        latitude?: number | null;
        longitude?: number | null;
        sdg_classifications: Array<{ sdg_id: number; confidence: number }>;
        activity_description: string;
        activity_hash: string;
    }) {
        const prisma = await getPrisma();

        return prisma.$transaction(async (tx: any) => {
            // 1. Create project
            const project = await tx.project.create({
                data: {
                    id: data.id,
                    organization_id: data.organization_id,
                    title: data.title,
                    description: data.description,
                    budget_allocated: data.budget_allocated,
                    budget_utilized: data.budget_utilized,
                    beneficiaries_count: data.beneficiaries_count,
                    outcome_metric_value: data.outcome_metric_value ?? null,
                    latitude: data.latitude ?? null,
                    longitude: data.longitude ?? null,
                    status: 'ACTIVE',
                },
            });

            // 2. Create SDG mappings
            for (const cls of data.sdg_classifications) {
                await tx.projectSDG.create({
                    data: {
                        project_id: project.id,
                        sdg_id: cls.sdg_id,
                        ai_confidence_score: cls.confidence,
                    },
                });
            }

            // 3. Create initial activity log
            await tx.projectActivity.create({
                data: {
                    project_id: project.id,
                    activity_title: 'Project Created',
                    description: data.activity_description,
                    latitude: data.latitude ?? null,
                    longitude: data.longitude ?? null,
                    hash_value: data.activity_hash,
                },
            });

            return project;
        });
    },
};

// ═══════════════════════════════════════════════════════════════
// IMPACT SCORE REPOSITORY
// ═══════════════════════════════════════════════════════════════

export const impactScoreRepo = {
    async findLatestByOrgId(orgId: string) {
        const prisma = await getPrisma();
        return prisma.impactScore.findFirst({
            where: { organization_id: orgId },
            orderBy: { calculated_at: 'desc' },
        });
    },

    async findHistoryByOrgId(orgId: string, limit = 10) {
        const prisma = await getPrisma();
        return prisma.impactScore.findMany({
            where: { organization_id: orgId },
            orderBy: { calculated_at: 'desc' },
            take: limit,
        });
    },

    async create(data: Record<string, unknown>) {
        const prisma = await getPrisma();
        return prisma.impactScore.create({ data: data as any });
    },

    async getLeaderboard(limit = 20) {
        const prisma = await getPrisma();
        const orgs = await prisma.organization.findMany({
            select: {
                id: true, name: true, type: true,
                impact_scores: {
                    orderBy: { calculated_at: 'desc' },
                    take: 1,
                    select: { final_score: true, transparency_score: true, efficiency_score: true, calculated_at: true },
                },
            },
        });
        return (orgs as any[])
            .filter(o => o.impact_scores.length > 0)
            .map(o => ({
                organization_id: o.id,
                organization_name: o.name,
                organization_type: o.type,
                final_score: Number(o.impact_scores[0].final_score),
                transparency_score: Number(o.impact_scores[0].transparency_score),
                efficiency_score: Number(o.impact_scores[0].efficiency_score),
                calculated_at: o.impact_scores[0].calculated_at,
            }))
            .sort((a, b) => b.final_score - a.final_score)
            .slice(0, limit);
    },

    async getAllOrgIds() {
        const prisma = await getPrisma();
        const orgs = await prisma.organization.findMany({ select: { id: true } });
        return orgs.map((o: { id: string }) => o.id);
    },
};

// ═══════════════════════════════════════════════════════════════
// DONATION REPOSITORY
// ═══════════════════════════════════════════════════════════════

export const donationRepo = {
    /**
     * Create donation + update project budget in a transaction.
     */
    async createWithTransaction(data: {
        project_id: string;
        donor_id: string;
        amount: number;
    }) {
        const prisma = await getPrisma();

        return prisma.$transaction(async (tx: any) => {
            const project = await tx.project.findUnique({
                where: { id: data.project_id },
                select: { id: true, organization_id: true, budget_utilized: true },
            });

            if (!project) throw new Error('PROJECT_NOT_FOUND');

            const donation = await tx.donation.create({
                data: {
                    project_id: data.project_id,
                    donor_id: data.donor_id,
                    amount: data.amount,
                },
            });

            await tx.project.update({
                where: { id: data.project_id },
                data: { budget_utilized: Number(project.budget_utilized) + data.amount },
            });

            return { donation, organizationId: project.organization_id };
        });
    },
};

// ═══════════════════════════════════════════════════════════════
// ACTIVITY REPOSITORY
// ═══════════════════════════════════════════════════════════════

export const activityRepo = {
    async create(data: {
        project_id: string;
        activity_title: string;
        description: string;
        latitude?: number | null;
        longitude?: number | null;
        proof_url?: string | null;
        hash_value: string;
    }) {
        const prisma = await getPrisma();
        return prisma.projectActivity.create({ data: data as any });
    },

    async findByProjectId(projectId: string) {
        const prisma = await getPrisma();
        return prisma.projectActivity.findMany({
            where: { project_id: projectId },
            orderBy: { created_at: 'desc' },
        });
    },

    async getProjectOrgId(projectId: string): Promise<string | null> {
        const prisma = await getPrisma();
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { organization_id: true },
        });
        return project?.organization_id ?? null;
    },
};

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG REPOSITORY
// ═══════════════════════════════════════════════════════════════

export const auditLogRepo = {
    async create(entry: {
        actor_id: string;
        actor_role: string;
        action: string;
        entity_type: string;
        entity_id: string;
        previous_value?: unknown;
        new_value?: unknown;
        ip_address?: string;
    }) {
        try {
            const prisma = await getPrisma();
            return await prisma.auditLog.create({
                data: {
                    actor_id: entry.actor_id,
                    actor_role: entry.actor_role,
                    action: entry.action,
                    entity_type: entry.entity_type,
                    entity_id: entry.entity_id,
                    previous_value: entry.previous_value ? JSON.stringify(entry.previous_value) : null,
                    new_value: entry.new_value ? JSON.stringify(entry.new_value) : null,
                    ip_address: entry.ip_address ?? null,
                },
            });
        } catch {
            // Audit logging should never break the main flow
            console.warn('[Audit] Failed to log:', entry.action, entry.entity_type, entry.entity_id);
            return null;
        }
    },

    async findByEntity(entityType: string, entityId: string) {
        try {
            const prisma = await getPrisma();
            return await prisma.auditLog.findMany({
                where: { entity_type: entityType, entity_id: entityId },
                orderBy: { created_at: 'desc' },
                take: 50,
            });
        } catch {
            return [];
        }
    },
};

// ═══════════════════════════════════════════════════════════════
// RISK FLAG REPOSITORY
// ═══════════════════════════════════════════════════════════════

export const riskFlagRepo = {
    async findByOrgId(orgId: string) {
        const prisma = await getPrisma();
        return prisma.riskFlag.findMany({
            where: { organization_id: orgId },
            orderBy: { created_at: 'desc' },
        });
    },

    async findUnresolved(orgId: string, riskType: string) {
        const prisma = await getPrisma();
        return prisma.riskFlag.findFirst({
            where: { organization_id: orgId, risk_type: riskType, resolved: false },
        });
    },

    async create(data: { organization_id: string; risk_type: string; risk_level: string; description: string }) {
        const prisma = await getPrisma();
        return prisma.riskFlag.create({ data: data as any });
    },

    async resolve(id: string) {
        const prisma = await getPrisma();
        return prisma.riskFlag.update({ where: { id }, data: { resolved: true } });
    },
};
