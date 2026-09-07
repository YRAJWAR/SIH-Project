import { NextResponse } from 'next/server';
import { successResponse } from '@/server/utils';

// ──────────────────────────────────────────────────────────────
// GET /api/docs — API Documentation
// Swagger-compatible annotations & route descriptions
// ──────────────────────────────────────────────────────────────

const API_DOCUMENTATION = {
    title: 'SDG Nexus API',
    version: '2.0.0',
    description: 'Enterprise-grade API for SDG Impact Intelligence Platform',
    base_url: '/api',
    architecture: {
        layers: ['controllers (API routes)', 'services (business logic)', 'repositories (DB access)', 'middleware (auth, validation, error)', 'validators (input schemas)', 'utils (helpers)'],
        database: 'PostgreSQL via Prisma ORM',
        auth: 'JWT Bearer tokens',
        response_format: '{ success, data, meta, error, timestamp }',
    },
    endpoints: {
        // ─── Public (no auth required) ───────────────────────
        public: [
            {
                method: 'GET', path: '/api/public/organizations',
                description: 'List all verified organizations (read-only, no financial data)',
                auth: 'None', response: 'Organization[]',
            },
            {
                method: 'GET', path: '/api/public/organizations/:id',
                description: 'Get public profile of an organization (impact, SDGs, transparency, geo — no financials)',
                auth: 'None', params: { id: 'Organization UUID' }, response: 'OrganizationProfile',
            },
            {
                method: 'GET', path: '/api/leaderboard',
                description: 'Paginated leaderboard of organizations by impact score',
                auth: 'None', query: { page: 'number', page_size: 'number' },
                response: '{ leaderboard: LeaderboardEntry[] }',
            },
            {
                method: 'GET', path: '/api/geo-impact-summary',
                description: 'Aggregated geo clusters for heatmap visualization',
                auth: 'None', response: '{ clusters: GeoCluster[] }',
            },
        ],

        // ─── Authenticated ───────────────────────────────────
        authenticated: [
            {
                method: 'POST', path: '/api/projects',
                description: 'Create project with AI SDG classification (transaction-safe)',
                auth: 'Bearer token', body: 'ProjectCreateInput',
                notes: 'Validates input, classifies SDGs, creates project + SDG mappings + activity in single transaction, recalculates org score, audit-logged',
            },
            {
                method: 'GET', path: '/api/projects',
                description: 'List projects with pagination and filters',
                auth: 'Bearer token',
                query: { page: 'number', page_size: 'number', status: 'DRAFT|ACTIVE|COMPLETED|SUSPENDED', org_id: 'UUID' },
            },
            {
                method: 'POST', path: '/api/activities',
                description: 'Log project activity with SHA-256 hash (triggers score recalc)',
                auth: 'Bearer token', body: 'ActivityCreateInput',
            },
            {
                method: 'POST', path: '/api/donations',
                description: 'Record donation (transaction: donation + budget update, triggers score recalc)',
                auth: 'Bearer token', body: 'DonationCreateInput',
            },
            {
                method: 'POST', path: '/api/impact-score',
                description: 'Calculate impact score without persisting',
                auth: 'Bearer token', body: 'ImpactScoreInput',
            },
            {
                method: 'GET', path: '/api/organizations/:id/impact-breakdown',
                description: 'Detailed impact score breakdown for an organization',
                auth: 'Bearer token', params: { id: 'Organization UUID' },
            },
            {
                method: 'GET', path: '/api/organizations/:id/risk-flags',
                description: 'Get risk flags for an organization',
                auth: 'Bearer token', params: { id: 'Organization UUID' },
            },
            {
                method: 'GET', path: '/api/corporate/:id/recommended-ngos',
                description: 'Smart matching: top 5 NGO recommendations for a corporate',
                auth: 'Bearer token', params: { id: 'Corporate Org UUID' },
            },
            {
                method: 'GET', path: '/api/funding-gap',
                description: 'Funding gap analysis across districts and SDGs',
                auth: 'Bearer token',
            },
            {
                method: 'POST', path: '/api/classify-sdg',
                description: 'AI-powered SDG classification for a project description',
                auth: 'Bearer token', body: '{ description: string }',
            },
        ],

        // ─── Admin Only ──────────────────────────────────────
        admin: [
            {
                method: 'POST', path: '/api/admin/recalculate-scores',
                description: 'Batch recalculate all organization impact scores',
                auth: 'Bearer token (ADMIN role)', rate_limited: true,
                notes: 'Rate-limited to 10 calls per 15 minutes. Audit-logged.',
            },
            {
                method: 'POST', path: '/api/admin/trigger-job',
                description: 'Manually trigger a background job',
                auth: 'Bearer token (ADMIN role)',
                body: '{ job_name: "risk-scan" | "funding-gap-recalc" | "score-recalc" }',
            },
            {
                method: 'GET', path: '/api/admin/audit-logs',
                description: 'Query audit trail with filters and pagination',
                auth: 'Bearer token (ADMIN role)',
                query: { page: 'number', page_size: 'number', entity_type: 'string', action: 'string', actor_id: 'string' },
            },
        ],

        // ─── Explorer (public frontend routes) ───────────────
        frontend: [
            { path: '/explore', description: 'Public organization explorer page' },
            { path: '/explore/organization/:id', description: 'Public organization detail profile' },
        ],
    },

    models: {
        ProjectCreateInput: {
            title: 'string (min 3 chars)', description: 'string (min 10 chars)',
            organization_id: 'UUID', budget_allocated: 'number (positive)',
            beneficiaries_count: 'number (non-negative)', budget_utilized: 'number? (optional)',
            outcome_metric_value: 'number? (0-100)', latitude: 'number? (-90 to 90)',
            longitude: 'number? (-180 to 180)', location_name: 'string? (optional)',
        },
        ActivityCreateInput: {
            project_id: 'UUID', activity_title: 'string (min 3 chars)',
            description: 'string (min 5 chars)', latitude: 'number? (optional)',
            longitude: 'number? (optional)', proof_url: 'string? (max 500 chars)',
        },
        DonationCreateInput: {
            project_id: 'UUID', donor_id: 'UUID', amount: 'number (positive, max 1B)',
        },
        CSRAllocationInput: {
            corporate_org_id: 'UUID', project_id: 'UUID',
            amount_committed: 'number (positive)', amount_disbursed: 'number? (non-negative)',
            financial_year: 'string (YYYY-YYYY format)',
        },
    },

    error_codes: {
        AUTH_REQUIRED: '401 — Missing or invalid auth token',
        AUTH_EXPIRED_TOKEN: '401 — JWT has expired',
        AUTH_INSUFFICIENT_ROLE: '403 — User does not have required role',
        VALIDATION_FAILED: '400 — Input validation failed',
        NOT_FOUND: '404 — Resource not found',
        DUPLICATE_ENTRY: '409 — Unique constraint violated',
        RATE_LIMIT_EXCEEDED: '429 — Too many requests',
        ACCESS_DENIED: '403 — IDOR protection triggered',
        INTERNAL_ERROR: '500 — Internal server error',
        DB_UNAVAILABLE: '503 — Database connection failed',
    },

    security: {
        authentication: 'JWT Bearer tokens via Authorization header',
        authorization: 'Role-based: NGO, CORPORATE, GOVERNMENT, DONOR, ADMIN',
        rate_limiting: 'General: 100/15min, Sensitive: 10/15min',
        input_validation: 'All payloads validated before processing',
        input_sanitization: 'XSS prevention on all string inputs',
        idor_protection: 'Resource ownership verification on org-scoped endpoints',
        password_hashing: 'bcrypt with 12 salt rounds',
        transaction_safety: 'Multi-step operations wrapped in DB transactions',
        audit_trail: 'All critical actions logged to AuditLog table',
    },

    background_jobs: [
        { name: 'risk-scan', interval: '24 hours', description: 'Scans all organizations for risk flags' },
        { name: 'funding-gap-recalc', interval: '24 hours', description: 'Recalculates funding gap per district/SDG' },
        { name: 'score-recalc', interval: '24 hours', description: 'Recalculates all organization impact scores' },
    ],
};

export async function GET() {
    return NextResponse.json(successResponse(API_DOCUMENTATION));
}
