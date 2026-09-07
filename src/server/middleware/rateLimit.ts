// ──────────────────────────────────────────────────────────────
// SDG Nexus — Rate Limiting Middleware
// In-memory rate limiter (production should use Redis)
// ──────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server';
import { AppError } from './errorHandler';
import config from '@/server/config';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store (for production, use Redis/Upstash)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (entry.resetAt < now) rateLimitStore.delete(key);
    }
}, 60_000); // every minute

/**
 * Extract client identifier for rate limiting.
 */
function getClientId(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    return ip;
}

/**
 * Standard rate limiter for general API routes.
 */
export function rateLimit(request: NextRequest): void {
    checkLimit(request, config.rateLimitMaxRequests, config.rateLimitWindow, 'general');
}

/**
 * Stricter rate limiter for sensitive endpoints (login, score recalc, etc.)
 */
export function rateLimitSensitive(request: NextRequest): void {
    checkLimit(request, config.rateLimitSensitiveMax, config.rateLimitWindow, 'sensitive');
}

function checkLimit(request: NextRequest, maxRequests: number, windowMs: number, prefix: string): void {
    const clientId = getClientId(request);
    const key = `${prefix}:${clientId}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
        throw AppError.rateLimited();
    }
}
