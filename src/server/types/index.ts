// ──────────────────────────────────────────────────────────────
// SDG Nexus — Shared TypeScript Types
// Enterprise-grade type definitions
// ──────────────────────────────────────────────────────────────

// ─── Standard API Response ───────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    meta?: PaginationMeta;
    error?: ApiError;
    timestamp: string;
}

export interface ApiError {
    message: string;
    error_code: string;
    details?: string[] | Record<string, string[]>;
}

export interface PaginationMeta {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

// ─── Pagination Input ────────────────────────────────────────

export interface PaginationInput {
    page: number;
    page_size: number;
}

// ─── Auth Types ──────────────────────────────────────────────

export interface JWTPayload {
    userId: string;
    role: 'NGO' | 'CORPORATE' | 'GOVERNMENT' | 'DONOR' | 'ADMIN';
    email: string;
    iat?: number;
    exp?: number;
}

export type UserRole = 'NGO' | 'CORPORATE' | 'GOVERNMENT' | 'DONOR' | 'ADMIN';

// ─── Audit Types ─────────────────────────────────────────────

export interface AuditEntry {
    actor_id: string;
    actor_role: UserRole;
    action: string;
    entity_type: string;
    entity_id: string;
    previous_value?: Record<string, unknown>;
    new_value?: Record<string, unknown>;
    ip_address?: string;
}

// ─── Error Codes ─────────────────────────────────────────────

export const ERROR_CODES = {
    // Auth
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
    AUTH_EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
    AUTH_INSUFFICIENT_ROLE: 'AUTH_INSUFFICIENT_ROLE',

    // Validation
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    INVALID_INPUT: 'INVALID_INPUT',

    // Not Found
    NOT_FOUND: 'NOT_FOUND',
    ORG_NOT_FOUND: 'ORG_NOT_FOUND',
    PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',

    // Conflict
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

    // Business Logic
    SCORE_CALCULATION_FAILED: 'SCORE_CALCULATION_FAILED',
    RISK_DETECTION_FAILED: 'RISK_DETECTION_FAILED',
    FUNDING_GAP_FAILED: 'FUNDING_GAP_FAILED',

    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

    // IDOR
    ACCESS_DENIED: 'ACCESS_DENIED',

    // Internal
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DB_UNAVAILABLE: 'DB_UNAVAILABLE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
