import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface ScorePreviewRequest {
    challengeId?: string;
    approach?: string;
    timelineWeeks?: number;
    budgetRequested?: number;
    csrPartner?: string;
    ipDeclaration?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: ScorePreviewRequest = await request.json();
        const {
            challengeId,
            approach = '',
            timelineWeeks = 16,
            budgetRequested = 450000,
        } = body;

        // Fetch challenge details if challengeId provided
        let challenge: any = null;
        if (challengeId) {
            try {
                challenge = await prisma.challenge.findUnique({
                    where: { id: challengeId },
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        district: true,
                        sdgTags: true,
                    },
                });
            } catch (err) {
                console.warn('Could not fetch challenge in score-preview, using heuristic:', err);
            }
        }

        // 1. Approach Completeness (Word Count based)
        // word count > 150 = 100, < 50 = 0, linear in-between
        const cleanApproach = approach.trim();
        const words = cleanApproach.length > 0 ? cleanApproach.split(/\s+/).filter(Boolean) : [];
        const wordCount = words.length;

        let approachCompleteness = 0;
        let approachFeedback = '';
        if (wordCount >= 150) {
            approachCompleteness = 100;
            approachFeedback = `Excellent depth (${wordCount} words). Clearly articulates methodology, engineering deliverables, and village-level handover.`;
        } else if (wordCount <= 50) {
            approachCompleteness = 0;
            approachFeedback = `Insufficient detail (${wordCount} words). Add methodology, deliverables, and validation protocols (aim for >150 words).`;
        } else {
            // Linear scale between 50 and 150
            approachCompleteness = Math.round(((wordCount - 50) / 100) * 100);
            approachFeedback = `Moderate detail (${wordCount} words). Expanding on deployment risks and maintenance protocols will boost confidence.`;
        }

        // 2. Feasibility (Timeline vs Challenge Complexity)
        // Academic R&D community deployments: 12-24 weeks is the sweet spot.
        // < 8 weeks: rushed; > 40 weeks: prolonged without fast feedback.
        let feasibility = 70;
        let feasibilityFeedback = '';
        const weeks = Number(timelineWeeks);

        if (weeks >= 12 && weeks <= 24) {
            feasibility = 95;
            feasibilityFeedback = `${weeks}-week timeline is optimal for rapid iterative prototyping, pilot fabrication, and community field trials.`;
        } else if (weeks >= 8 && weeks < 12) {
            feasibility = 80;
            feasibilityFeedback = `${weeks} weeks is aggressive. High feasibility if existing laboratory equipment is already mobilized.`;
        } else if (weeks > 24 && weeks <= 36) {
            feasibility = 85;
            feasibilityFeedback = `${weeks} weeks provides thorough seasonal testing, but consider milestone tranche gates every 8 weeks.`;
        } else if (weeks < 8) {
            feasibility = 45;
            feasibilityFeedback = `${weeks} weeks is likely too brief for hardware validation, community onboarding, and Gram Panchayat sign-off.`;
        } else {
            feasibility = 60;
            feasibilityFeedback = `${weeks} weeks is lengthy. High risk of student turnover and delayed community relief.`;
        }

        // 3. Budget Reasonableness
        // Typical rural tech intervention average budget: ₹3,50,000 to ₹6,00,000
        const budget = Number(budgetRequested);
        let budgetReasonableness = 70;
        let budgetFeedback = '';

        if (budget >= 250000 && budget <= 600000) {
            budgetReasonableness = 94;
            budgetFeedback = `₹${budget.toLocaleString('en-IN')} aligns closely with state CSR benchmark averages for pilot hardware deployment.`;
        } else if (budget > 600000 && budget <= 1000000) {
            budgetReasonableness = 82;
            budgetFeedback = `₹${budget.toLocaleString('en-IN')} is slightly above median. Acceptable if significant sensor/IoT or advanced filtration materials are budgeted.`;
        } else if (budget >= 100000 && budget < 250000) {
            budgetReasonableness = 85;
            budgetFeedback = `₹${budget.toLocaleString('en-IN')} is lean and cost-effective. Ensure contingencies for field travel to remote blocks are covered.`;
        } else if (budget < 100000) {
            budgetReasonableness = 50;
            budgetFeedback = `₹${budget.toLocaleString('en-IN')} may be under-resourced for durable village-scale hardware and safety components.`;
        } else {
            budgetReasonableness = 60;
            budgetFeedback = `₹${budget.toLocaleString('en-IN')} exceeds standard university grant tranches. CSR partners may request itemized bill of materials.`;
        }

        // 4. Team-Domain Alignment
        // Check alignment between engineering faculty/students and challenge category keywords
        let teamDomainAlignment = 88;
        let alignmentFeedback = 'Strong institutional alignment: NIT Jamshedpur engineering faculty and lab resources match technical requirements.';

        if (challenge?.category) {
            const cat = challenge.category.toLowerCase();
            const text = (approach + ' ' + (challenge.title || '')).toLowerCase();

            if (cat.includes('water') && (text.includes('filter') || text.includes('arsenic') || text.includes('sensor') || text.includes('purif') || text.includes('test'))) {
                teamDomainAlignment = 96;
                alignmentFeedback = 'Direct alignment: Environmental engineering and chemical testing skills directly solve the water quality specifications.';
            } else if (cat.includes('sanitation') && (text.includes('toilet') || text.includes('waste') || text.includes('bio') || text.includes('recycl'))) {
                teamDomainAlignment = 94;
                alignmentFeedback = 'High alignment: Civil and bio-waste engineering capabilities match village sanitation requirements.';
            } else if (cat.includes('solar') || cat.includes('energy')) {
                teamDomainAlignment = 92;
                alignmentFeedback = 'High alignment: Electrical and renewable energy systems expertise present in student R&D roster.';
            } else {
                teamDomainAlignment = 88;
                alignmentFeedback = 'Good interdisciplinary alignment between HEI faculty supervisor and community challenge domain.';
            }
        }

        // Weighted Overall Score
        // 30% approach completeness + 25% feasibility + 25% budget reasonableness + 20% team-domain alignment
        const overallScore = Math.min(
            100,
            Math.max(
                0,
                Math.round(
                    approachCompleteness * 0.3 +
                    feasibility * 0.25 +
                    budgetReasonableness * 0.25 +
                    teamDomainAlignment * 0.2
                )
            )
        );

        // Actionable Recommendations
        const recommendations: string[] = [];
        if (approachCompleteness < 75) {
            recommendations.push('Include a 1-paragraph community handover and training protocol for local operators.');
        }
        if (feasibility < 80) {
            recommendations.push('Calibrate timeline between 12 and 20 weeks for faster CSR milestone approvals.');
        }
        if (budgetReasonableness < 80) {
            recommendations.push('Attach an itemized hardware bill-of-materials to justify requested grant allocations.');
        }
        if (recommendations.length === 0) {
            recommendations.push('Proposal is well-balanced. Ready for CSR matching and Government R&D sanction review.');
            recommendations.push('Consider adding 1 Gram Panchayat liaison student to accelerate field deployment.');
        }

        return NextResponse.json({
            success: true,
            data: {
                overallScore,
                components: {
                    feasibility: {
                        score: feasibility,
                        label: 'Feasibility',
                        feedback: feasibilityFeedback,
                    },
                    budgetReasonableness: {
                        score: budgetReasonableness,
                        label: 'Budget Reasonableness',
                        feedback: budgetFeedback,
                    },
                    teamDomainAlignment: {
                        score: teamDomainAlignment,
                        label: 'Team-Domain Alignment',
                        feedback: alignmentFeedback,
                    },
                    approachCompleteness: {
                        score: approachCompleteness,
                        label: 'Approach Completeness',
                        feedback: approachFeedback,
                    },
                },
                wordCount,
                recommendations,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error in /api/hei/proposals/score-preview:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to preview proposal quality score',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
