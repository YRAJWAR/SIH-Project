// ──────────────────────────────────────────────────────────────
// SDG Nexus — Utility Functions
// Hashing, calculations, sanitization
// ──────────────────────────────────────────────────────────────

/**
 * Generate SHA-256 hash from content string.
 */
export async function sha256(content: string): Promise<string> {
    const buffer = new TextEncoder().encode(content);
    const hashArray = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashArray))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Sanitize a string by removing potentially dangerous characters.
 * Prevents XSS through stored data.
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/[<>]/g, '')       // strip angle brackets
        .replace(/javascript:/gi, '') // strip js protocol
        .replace(/on\w+\s*=/gi, '')  // strip inline event handlers
        .trim();
}

/**
 * Logarithmic scale normalization (prevents linear gaming).
 * Maps raw value to 0–100 with diminishing returns at high values.
 */
export function logNormalize(value: number, median: number, maxScore = 100): number {
    if (value <= 0) return 0;
    const normalized = (Math.log10(value + 1) / Math.log10(median + 1)) * (maxScore / 2);
    return Math.min(Math.round(normalized * 100) / 100, maxScore);
}

/**
 * Cap a score to prevent gaming.
 */
export function capScore(score: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, Math.round(score * 100) / 100));
}

/**
 * Parse pagination params from URL search params.
 */
export function parsePagination(searchParams: URLSearchParams, defaults = { page: 1, pageSize: 20, maxPageSize: 100 }) {
    const page = Math.max(1, parseInt(searchParams.get('page') || `${defaults.page}`, 10));
    const pageSize = Math.min(
        defaults.maxPageSize,
        Math.max(1, parseInt(searchParams.get('page_size') || `${defaults.pageSize}`, 10))
    );
    return { page, pageSize, skip: (page - 1) * pageSize };
}

/**
 * Build pagination meta object.
 */
export function buildPaginationMeta(page: number, pageSize: number, total: number) {
    const totalPages = Math.ceil(total / pageSize);
    return {
        page,
        page_size: pageSize,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
    };
}

/**
 * Standard success response.
 */
export function successResponse<T>(data: T, meta?: Record<string, unknown>) {
    return {
        success: true as const,
        data,
        meta,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Standard error response.
 */
export function errorResponse(message: string, errorCode: string, details?: string[] | Record<string, string[]>) {
    return {
        success: false as const,
        error: {
            message,
            error_code: errorCode,
            details,
        },
        timestamp: new Date().toISOString(),
    };
}
