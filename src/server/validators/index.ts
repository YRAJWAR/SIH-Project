// ──────────────────────────────────────────────────────────────
// SDG Nexus — Zod Validation Schemas
// All input validation for API payloads
// ──────────────────────────────────────────────────────────────

// Using a lightweight validation approach compatible with any runtime
// (Zod-like schema validation without the dependency)

type ValidationResult<T> = { success: true; data: T } | { success: false; errors: string[] };

// ─── Project Creation ────────────────────────────────────────

export interface ProjectCreateInput {
    title: string;
    description: string;
    organization_id: string;
    budget_allocated: number;
    budget_utilized?: number;
    beneficiaries_count: number;
    outcome_metric_value?: number;
    latitude?: number;
    longitude?: number;
    location_name?: string;
    start_date?: string;
    end_date?: string;
}

export function validateProjectCreate(data: unknown): ValidationResult<ProjectCreateInput> {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d || typeof d !== 'object') return { success: false, errors: ['Request body must be an object'] };

    if (!d.title || typeof d.title !== 'string' || d.title.trim().length < 3)
        errors.push('title: Required, minimum 3 characters');
    if (!d.description || typeof d.description !== 'string' || d.description.trim().length < 10)
        errors.push('description: Required, minimum 10 characters');
    if (!d.organization_id || typeof d.organization_id !== 'string' || d.organization_id.trim().length < 1)
        errors.push('organization_id: Required (UUID format)');
    if (d.budget_allocated == null || typeof d.budget_allocated !== 'number' || d.budget_allocated <= 0)
        errors.push('budget_allocated: Required, must be positive number');
    if (d.budget_utilized != null && (typeof d.budget_utilized !== 'number' || d.budget_utilized < 0))
        errors.push('budget_utilized: Must be non-negative number');
    if (d.beneficiaries_count == null || typeof d.beneficiaries_count !== 'number' || d.beneficiaries_count < 0)
        errors.push('beneficiaries_count: Required, must be non-negative');
    if (d.outcome_metric_value != null && (typeof d.outcome_metric_value !== 'number' || d.outcome_metric_value < 0 || d.outcome_metric_value > 100))
        errors.push('outcome_metric_value: Must be between 0 and 100');
    if (d.latitude != null && (typeof d.latitude !== 'number' || d.latitude < -90 || d.latitude > 90))
        errors.push('latitude: Must be between -90 and 90');
    if (d.longitude != null && (typeof d.longitude !== 'number' || d.longitude < -180 || d.longitude > 180))
        errors.push('longitude: Must be between -180 and 180');

    if (errors.length > 0) return { success: false, errors };
    return { success: true, data: d as unknown as ProjectCreateInput };
}

// ─── Activity Creation ───────────────────────────────────────

export interface ActivityCreateInput {
    project_id: string;
    activity_title: string;
    description: string;
    latitude?: number;
    longitude?: number;
    proof_url?: string;
}

export function validateActivityCreate(data: unknown): ValidationResult<ActivityCreateInput> {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d || typeof d !== 'object') return { success: false, errors: ['Request body must be an object'] };

    if (!d.project_id || typeof d.project_id !== 'string')
        errors.push('project_id: Required (UUID format)');
    if (!d.activity_title || typeof d.activity_title !== 'string' || (d.activity_title as string).trim().length < 3)
        errors.push('activity_title: Required, minimum 3 characters');
    if (!d.description || typeof d.description !== 'string' || (d.description as string).trim().length < 5)
        errors.push('description: Required, minimum 5 characters');
    if (d.proof_url != null && typeof d.proof_url === 'string' && d.proof_url.length > 500)
        errors.push('proof_url: Maximum 500 characters');

    if (errors.length > 0) return { success: false, errors };
    return { success: true, data: d as unknown as ActivityCreateInput };
}

// ─── Donation Creation ───────────────────────────────────────

export interface DonationCreateInput {
    project_id: string;
    donor_id: string;
    amount: number;
}

export function validateDonationCreate(data: unknown): ValidationResult<DonationCreateInput> {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d || typeof d !== 'object') return { success: false, errors: ['Request body must be an object'] };

    if (!d.project_id || typeof d.project_id !== 'string')
        errors.push('project_id: Required (UUID format)');
    if (!d.donor_id || typeof d.donor_id !== 'string')
        errors.push('donor_id: Required (UUID format)');
    if (d.amount == null || typeof d.amount !== 'number' || d.amount <= 0)
        errors.push('amount: Required, must be positive number');
    if (typeof d.amount === 'number' && d.amount > 1_000_000_000)
        errors.push('amount: Exceeds maximum allowed value');

    if (errors.length > 0) return { success: false, errors };
    return { success: true, data: d as unknown as DonationCreateInput };
}

// ─── Organization Creation ───────────────────────────────────

export interface OrganizationCreateInput {
    name: string;
    type: 'NGO' | 'CORPORATE' | 'GOVERNMENT';
    registration_number?: string;
    state: string;
    district?: string;
    country?: string;
}

export function validateOrganizationCreate(data: unknown): ValidationResult<OrganizationCreateInput> {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d || typeof d !== 'object') return { success: false, errors: ['Request body must be an object'] };

    if (!d.name || typeof d.name !== 'string' || (d.name as string).trim().length < 2)
        errors.push('name: Required, minimum 2 characters');
    if (!d.type || !['NGO', 'CORPORATE', 'GOVERNMENT'].includes(d.type as string))
        errors.push('type: Required, must be NGO, CORPORATE, or GOVERNMENT');
    if (!d.state || typeof d.state !== 'string')
        errors.push('state: Required');
    if (d.registration_number != null && typeof d.registration_number === 'string' && (d.registration_number as string).length > 100)
        errors.push('registration_number: Maximum 100 characters');

    if (errors.length > 0) return { success: false, errors };
    return { success: true, data: d as unknown as OrganizationCreateInput };
}

// ─── CSR Allocation ──────────────────────────────────────────

export interface CSRAllocationInput {
    corporate_org_id: string;
    project_id: string;
    amount_committed: number;
    amount_disbursed?: number;
    financial_year: string;
}

export function validateCSRAllocation(data: unknown): ValidationResult<CSRAllocationInput> {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d || typeof d !== 'object') return { success: false, errors: ['Request body must be an object'] };

    if (!d.corporate_org_id || typeof d.corporate_org_id !== 'string')
        errors.push('corporate_org_id: Required (UUID format)');
    if (!d.project_id || typeof d.project_id !== 'string')
        errors.push('project_id: Required (UUID format)');
    if (d.amount_committed == null || typeof d.amount_committed !== 'number' || d.amount_committed <= 0)
        errors.push('amount_committed: Required, must be positive number');
    if (d.amount_disbursed != null && (typeof d.amount_disbursed !== 'number' || d.amount_disbursed < 0))
        errors.push('amount_disbursed: Must be non-negative number');
    if (!d.financial_year || typeof d.financial_year !== 'string' || !/^\d{4}-\d{4}$/.test(d.financial_year as string))
        errors.push('financial_year: Required, format YYYY-YYYY');

    if (errors.length > 0) return { success: false, errors };
    return { success: true, data: d as unknown as CSRAllocationInput };
}

// ─── Impact Score Input ──────────────────────────────────────

export interface ImpactScoreInput {
    beneficiaries_count: number;
    budget_allocated: number;
    budget_utilized: number;
    location_name: string;
    outcome_metric?: number;
}

export function validateImpactScoreInput(data: unknown): ValidationResult<ImpactScoreInput> {
    const errors: string[] = [];
    const d = data as Record<string, unknown>;

    if (!d || typeof d !== 'object') return { success: false, errors: ['Request body must be an object'] };

    if (d.beneficiaries_count == null || typeof d.beneficiaries_count !== 'number' || d.beneficiaries_count < 0)
        errors.push('beneficiaries_count: Required, non-negative');
    if (d.budget_allocated == null || typeof d.budget_allocated !== 'number' || d.budget_allocated <= 0)
        errors.push('budget_allocated: Required, positive');
    if (d.budget_utilized == null || typeof d.budget_utilized !== 'number' || d.budget_utilized < 0)
        errors.push('budget_utilized: Required, non-negative');
    if (!d.location_name || typeof d.location_name !== 'string')
        errors.push('location_name: Required');

    if (errors.length > 0) return { success: false, errors };
    return { success: true, data: d as unknown as ImpactScoreInput };
}
