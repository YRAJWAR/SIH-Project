// ──────────────────────────────────────────────────────────────
// SDG Nexus — Centralized Error Handling
// AppError class + error middleware + structured error responses
// ──────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import config from '@/server/config';
import { errorResponse } from '@/server/utils';
import { ERROR_CODES } from '@/server/types';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly details?: string[];
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, errorCode: string, details?: string[]) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true;
        Object.setPrototypeOf(this, AppError.prototype);
    }

    static badRequest(message: string, details?: string[]) {
        return new AppError(message, 400, ERROR_CODES.VALIDATION_FAILED, details);
    }

    static unauthorized(message = 'Authentication required') {
        return new AppError(message, 401, ERROR_CODES.AUTH_REQUIRED);
    }

    static forbidden(message = 'Insufficient permissions') {
        return new AppError(message, 403, ERROR_CODES.AUTH_INSUFFICIENT_ROLE);
    }

    static notFound(entity: string) {
        return new AppError(`${entity} not found`, 404, ERROR_CODES.NOT_FOUND);
    }

    static conflict(message: string) {
        return new AppError(message, 409, ERROR_CODES.DUPLICATE_ENTRY);
    }

    static rateLimited() {
        return new AppError('Rate limit exceeded. Try again later.', 429, ERROR_CODES.RATE_LIMIT_EXCEEDED);
    }

    static internal(message = 'Internal server error') {
        return new AppError(message, 500, ERROR_CODES.INTERNAL_ERROR);
    }
}

/**
 * Central error handler for API routes.
 * Never exposes stack traces in production.
 */
export function handleApiError(error: unknown): NextResponse {
    // Known operational error
    if (error instanceof AppError) {
        return NextResponse.json(
            errorResponse(error.message, error.errorCode, error.details),
            { status: error.statusCode }
        );
    }

    // Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as { code: string; meta?: { target?: string[] } };

        if (prismaError.code === 'P2002') {
            return NextResponse.json(
                errorResponse('Duplicate entry', ERROR_CODES.DUPLICATE_ENTRY,
                    prismaError.meta?.target ? [`Unique constraint failed on: ${prismaError.meta.target.join(', ')}`] : undefined),
                { status: 409 }
            );
        }
        if (prismaError.code === 'P2025') {
            return NextResponse.json(
                errorResponse('Record not found', ERROR_CODES.NOT_FOUND),
                { status: 404 }
            );
        }
    }

    // Unknown error
    const message = config.isProduction ? 'Internal server error' : (error instanceof Error ? error.message : 'Unknown error');
    if (!config.isProduction) {
        console.error('[SDG Nexus Error]', error);
    }

    return NextResponse.json(
        errorResponse(message, ERROR_CODES.INTERNAL_ERROR),
        { status: 500 }
    );
}
