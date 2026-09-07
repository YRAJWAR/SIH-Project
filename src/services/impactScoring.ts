// ============================================================
// Impact Scoring Engine — Enhanced
// Formula: (Scale × 0.30) + (Outcome × 0.25) + (Efficiency × 0.20) + (Geographic Need × 0.15) + (Transparency × 0.10)
// ============================================================

import { getPovertyScore } from '@/data/povertyIndex';

export interface ScoreInput {
    beneficiaryCount: number;
    budgetAllocated: number;
    budgetUtilized: number;
    outcomeMetricValue: number; // 0-100 improvement percentage
    activitiesCount: number;
    verifiedActivities: number;
    hasGeoTag: boolean;
    hasProofUploads: boolean;
    locationName: string;
    projectStatus: string;
}

export interface DetailedScore {
    scaleScore: number;          // 0-300
    outcomeScore: number;        // 0-250
    efficiencyScore: number;     // 0-200
    geographicNeedScore: number; // 0-150
    transparencyScore: number;   // 0-100
    finalScore: number;          // 0-1000
    rawScaleValue: number;
    rawOutcomeValue: number;
    rawEfficiencyValue: number;
    rawGeoValue: number;
    rawTransparencyValue: number;
}

// Sector medians for normalization
const SECTOR_MEDIAN_BENEFICIARIES = 20000;
const SECTOR_MEDIAN_COST_PER_BENEFICIARY = 500; // ₹500 per beneficiary

// Scale Score (0-300): (Beneficiaries / Sector Median) normalized and capped
function calculateScaleScore(beneficiaryCount: number): number {
    const ratio = beneficiaryCount / SECTOR_MEDIAN_BENEFICIARIES;
    const normalized = Math.min(ratio, 1.5); // Cap at 1.5x median
    return Math.round((normalized / 1.5) * 300);
}

// Outcome Score (0-250): Normalized outcome improvement %
function calculateOutcomeScore(outcomeMetric: number, activitiesCount: number, status: string): number {
    let base = outcomeMetric * 2; // 0-200 from outcome metric
    if (activitiesCount > 0) base += Math.min(activitiesCount * 5, 30); // bonus for activities
    if (status === 'completed') base += 20;
    return Math.min(Math.round(base), 250);
}

// Efficiency Score (0-200): (Beneficiaries / Budget) compared to sector median
function calculateEfficiencyScore(budgetUtilized: number, budgetAllocated: number, beneficiaries: number): number {
    if (budgetAllocated === 0 || beneficiaries === 0) return 100;

    const costPerBeneficiary = budgetUtilized / beneficiaries;
    const efficiencyRatio = SECTOR_MEDIAN_COST_PER_BENEFICIARY / costPerBeneficiary;
    const normalized = Math.min(efficiencyRatio, 2.0); // Cap at 2x efficiency
    let score = Math.round((normalized / 2.0) * 160);

    // Budget utilization bonus (good if between 50-95%)
    const utilization = budgetUtilized / budgetAllocated;
    if (utilization >= 0.5 && utilization <= 0.95) score += 40;
    else if (utilization > 0.95) score += 20;

    return Math.min(score, 200);
}

// Geographic Need Score (0-150): Higher weight if poverty index is high
function calculateGeographicNeedScore(locationName: string): number {
    const povertyScore = getPovertyScore(locationName);
    return Math.round((povertyScore / 100) * 150);
}

// Transparency Score (0-100): Based on verified activities, geo-tags, proof uploads
function calculateTransparencyScore(
    verifiedActivities: number,
    totalActivities: number,
    hasGeoTag: boolean,
    hasProofUploads: boolean
): number {
    let score = 0;

    // Verified activities component (0-60)
    if (totalActivities > 0) {
        score += Math.round((verifiedActivities / totalActivities) * 60);
    } else {
        score += 30; // base score if no activities yet
    }

    // Geo-tag presence (0-20)
    if (hasGeoTag) score += 20;

    // Proof uploads (0-20)
    if (hasProofUploads) score += 20;

    return Math.min(score, 100);
}

export function calculateDetailedScore(input: ScoreInput): DetailedScore {
    const scaleScore = calculateScaleScore(input.beneficiaryCount);
    const outcomeScore = calculateOutcomeScore(input.outcomeMetricValue, input.activitiesCount, input.projectStatus);
    const efficiencyScore = calculateEfficiencyScore(input.budgetUtilized, input.budgetAllocated, input.beneficiaryCount);
    const geographicNeedScore = calculateGeographicNeedScore(input.locationName);
    const transparencyScore = calculateTransparencyScore(
        input.verifiedActivities, input.activitiesCount,
        input.hasGeoTag, input.hasProofUploads
    );

    const finalScore = Math.round(
        (scaleScore * 0.30) +
        (outcomeScore * 0.25) +
        (efficiencyScore * 0.20) +
        (geographicNeedScore * 0.15) +
        (transparencyScore * 0.10)
    );

    const rawScaleValue = input.beneficiaryCount;
    const rawOutcomeValue = input.outcomeMetricValue;
    const rawEfficiencyValue = input.beneficiaryCount > 0 ? input.budgetUtilized / input.beneficiaryCount : 0;
    const rawGeoValue = getPovertyScore(input.locationName);
    const rawTransparencyValue = input.activitiesCount > 0 ? (input.verifiedActivities / input.activitiesCount) * 100 : 0;

    return { scaleScore, outcomeScore, efficiencyScore, geographicNeedScore, transparencyScore, finalScore, rawScaleValue, rawOutcomeValue, rawEfficiencyValue, rawGeoValue, rawTransparencyValue };
}

export function calculateImpactScore(input: ScoreInput): number {
    return calculateDetailedScore(input).finalScore;
}

// Quick score from project data (backward compatible)
export function calculateProjectScore(
    beneficiaryCount: number,
    budgetAllocated: number,
    budgetUtilized: number,
    locationName: string,
    activitiesCount: number,
    verifiedActivities: number,
    status: string
): number {
    return calculateImpactScore({
        beneficiaryCount,
        budgetAllocated,
        budgetUtilized,
        outcomeMetricValue: status === 'completed' ? 75 : 50,
        activitiesCount,
        verifiedActivities,
        hasGeoTag: true,
        hasProofUploads: verifiedActivities > 0,
        locationName,
        projectStatus: status,
    });
}

export function calculateOrgImpactScore(projectScores: number[]): number {
    if (projectScores.length === 0) return 0;
    return Math.round(projectScores.reduce((sum, s) => sum + s, 0) / projectScores.length);
}

export function getImpactPerRupee(totalBudget: number, beneficiaries: number): number {
    if (totalBudget === 0) return 0;
    return Math.round(beneficiaries / (totalBudget / 100000)); // Lives per ₹1 lakh
}

// Mock trend data for charts
export function getScoreTrend(orgId: string): { month: string; score: number; efficiency: number }[] {
    // Generate realistic trend data
    const baseScores: Record<string, number> = { 'u1': 780, 'org2': 830, 'org3': 870, 'org4': 750, 'org5': 700, 'org6': 760 };
    const base = baseScores[orgId] || 700;
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

    return months.map((month, i) => ({
        month,
        score: Math.round(base + (i * 12) + (Math.random() * 30 - 15)),
        efficiency: Math.round(60 + (i * 3) + (Math.random() * 10 - 5)),
    }));
}

// Risk detection
export interface RiskAssessment {
    isAtRisk: boolean;
    riskType: 'none' | 'efficiency_decline' | 'funding_decline' | 'both';
    riskLevel: 'low' | 'medium' | 'high';
    message: string;
}

export function assessRisk(trend: { month: string; score: number; efficiency: number }[]): RiskAssessment {
    if (trend.length < 3) return { isAtRisk: false, riskType: 'none', riskLevel: 'low', message: 'Insufficient data' };

    const recent3 = trend.slice(-3);
    const efficiencyDeclining = recent3[0].efficiency > recent3[1].efficiency && recent3[1].efficiency > recent3[2].efficiency;
    const scoreDeclining = recent3[0].score > recent3[1].score && recent3[1].score > recent3[2].score;

    if (efficiencyDeclining && scoreDeclining) {
        return { isAtRisk: true, riskType: 'both', riskLevel: 'high', message: 'Efficiency and performance declining over 3 consecutive periods' };
    }
    if (efficiencyDeclining) {
        return { isAtRisk: true, riskType: 'efficiency_decline', riskLevel: 'medium', message: 'Efficiency declining over 3 consecutive periods' };
    }
    if (scoreDeclining) {
        return { isAtRisk: true, riskType: 'funding_decline', riskLevel: 'medium', message: 'Performance declining over 3 consecutive periods' };
    }

    return { isAtRisk: false, riskType: 'none', riskLevel: 'low', message: 'Performance stable' };
}
