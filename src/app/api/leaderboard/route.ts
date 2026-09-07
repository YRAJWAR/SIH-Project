import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/server/middleware/errorHandler';
import { impactScoreRepo } from '@/server/repositories';
import { successResponse, parsePagination, buildPaginationMeta } from '@/server/utils';

// ──────────────────────────────────────────────────────────────
// GET /api/leaderboard — Paginated leaderboard
// ──────────────────────────────────────────────────────────────
// Enterprise-grade:
// ✓ Pagination support (?page=1&page_size=20)
// ✓ Repository pattern (no direct Prisma)
// ✓ Structured responses
// ✓ Fallback data
// ──────────────────────────────────────────────────────────────

interface LeaderboardEntry {
    rank: number;
    organization_id: string;
    organization_name: string;
    organization_type: string;
    final_score: number;
    transparency_score: number;
    efficiency_score: number;
    calculated_at: string;
}

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, organization_id: 'org3', organization_name: 'Rural Health Foundation', organization_type: 'NGO', final_score: 872, transparency_score: 95, efficiency_score: 180, calculated_at: new Date().toISOString() },
    { rank: 2, organization_id: 'org2', organization_name: 'EduReach India', organization_type: 'NGO', final_score: 834, transparency_score: 88, efficiency_score: 170, calculated_at: new Date().toISOString() },
    { rank: 3, organization_id: 'org1', organization_name: 'Swachh Bharat Initiative', organization_type: 'NGO', final_score: 780, transparency_score: 80, efficiency_score: 160, calculated_at: new Date().toISOString() },
    { rank: 4, organization_id: 'org5', organization_name: 'Infosys Foundation', organization_type: 'CORPORATE', final_score: 756, transparency_score: 75, efficiency_score: 155, calculated_at: new Date().toISOString() },
    { rank: 5, organization_id: 'org4', organization_name: 'AgroTech Solutions', organization_type: 'NGO', final_score: 745, transparency_score: 70, efficiency_score: 150, calculated_at: new Date().toISOString() },
    { rank: 6, organization_id: 'org6', organization_name: 'NITI Aayog SDG Cell', organization_type: 'GOVERNMENT', final_score: 720, transparency_score: 85, efficiency_score: 140, calculated_at: new Date().toISOString() },
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, pageSize } = parsePagination(searchParams);

        try {
            const allRanked = await impactScoreRepo.getLeaderboard(100);

            if (allRanked.length > 0) {
                const total = allRanked.length;
                const start = (page - 1) * pageSize;
                const paged = allRanked.slice(start, start + pageSize).map((entry, i) => ({
                    rank: start + i + 1,
                    ...entry,
                    calculated_at: entry.calculated_at instanceof Date
                        ? entry.calculated_at.toISOString()
                        : String(entry.calculated_at),
                }));

                return NextResponse.json(successResponse(
                    { leaderboard: paged },
                    { source: 'database', ...buildPaginationMeta(page, pageSize, total) }
                ));
            }
        } catch {
            // DB not available — fall through
        }

        // Paginated fallback
        const total = FALLBACK_LEADERBOARD.length;
        const start = (page - 1) * pageSize;
        const paged = FALLBACK_LEADERBOARD.slice(start, start + pageSize);

        return NextResponse.json(successResponse(
            { leaderboard: paged },
            { source: 'fallback', ...buildPaginationMeta(page, pageSize, total) }
        ));
    } catch (error) {
        return handleApiError(error);
    }
}
