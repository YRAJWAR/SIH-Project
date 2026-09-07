// Smart Matching Engine
// Match Score = SDG Overlap(40%) + Location Proximity(30%) + Performance Rating(30%)

import { PartnerNGO, SDG_INFO } from '@/data/mockData';

interface MatchFilters {
    sdg_focus?: number[];
    state?: string;
    min_score?: number;
    max_funding?: number;
}

interface MatchResult {
    ngo: PartnerNGO;
    match_score: number;
    sdg_overlap_pct: number;
    reasons: string[];
}

function sdgOverlap(ngoSDGs: number[], targetSDGs: number[]): number {
    if (targetSDGs.length === 0) return 50;
    const overlap = ngoSDGs.filter(s => targetSDGs.includes(s)).length;
    return Math.round((overlap / Math.max(targetSDGs.length, 1)) * 100);
}

function locationProximity(ngoState: string, targetState?: string): number {
    if (!targetState) return 50;
    return ngoState.toLowerCase() === targetState.toLowerCase() ? 100 : 30;
}

function performanceRating(impactScore: number): number {
    return Math.round((impactScore / 1000) * 100);
}

export function findMatches(
    ngos: PartnerNGO[],
    filters: MatchFilters,
    corporateSDGs: number[] = [3, 4, 6, 7, 11]
): MatchResult[] {
    let filtered = [...ngos];

    if (filters.state) {
        filtered = filtered.filter(n => n.location.state.toLowerCase().includes(filters.state!.toLowerCase()));
    }
    if (filters.min_score) {
        filtered = filtered.filter(n => n.impact_score >= filters.min_score!);
    }
    if (filters.max_funding) {
        filtered = filtered.filter(n => n.funding_need <= filters.max_funding!);
    }

    const targetSDGs = filters.sdg_focus || corporateSDGs;

    return filtered.map(ngo => {
        const overlap = sdgOverlap(ngo.sdg_focus, targetSDGs);
        const proximity = locationProximity(ngo.location.state, filters.state);
        const perf = performanceRating(ngo.impact_score);
        const matchScore = Math.round((0.4 * overlap) + (0.3 * proximity) + (0.3 * perf));

        const reasons: string[] = [];
        const overlapSDGs = ngo.sdg_focus.filter(s => targetSDGs.includes(s));
        if (overlapSDGs.length > 0) {
            reasons.push(`Shares focus on ${overlapSDGs.map(s => SDG_INFO.find(i => i.id === s)?.name).join(', ')}`);
        }
        if (ngo.impact_score >= 850) reasons.push('High-impact performer');
        if (ngo.verified) reasons.push('Verified organization');

        return { ngo, match_score: matchScore, sdg_overlap_pct: overlap, reasons };
    }).sort((a, b) => b.match_score - a.match_score);
}
