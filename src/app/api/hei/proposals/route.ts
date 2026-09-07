import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const challengeId = searchParams.get('challengeId');

        // Identify HEI (NIT Jamshedpur default)
        let hei = await prisma.hEI.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Jamshedpur', mode: 'insensitive' } },
                    { ugcId: 'NIT-JSR-001' },
                ],
            },
        });

        if (!hei) {
            hei = await prisma.hEI.findFirst();
        }

        if (challengeId) {
            const proposal = await prisma.challengeProposal.findFirst({
                where: {
                    challengeId,
                    ...(hei ? { heiId: hei.id } : {}),
                },
                include: {
                    challenge: {
                        select: {
                            id: true,
                            title: true,
                            district: true,
                            sdgTags: true,
                            category: true,
                            status: true,
                        },
                    },
                    team: {
                        include: {
                            members: {
                                include: {
                                    student: {
                                        include: {
                                            user: {
                                                select: { full_name: true, email: true },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({
                success: true,
                data: proposal,
                timestamp: new Date().toISOString(),
            });
        }

        // Return all proposals for the HEI
        const proposals = await prisma.challengeProposal.findMany({
            where: hei ? { heiId: hei.id } : undefined,
            include: {
                challenge: {
                    select: {
                        id: true,
                        title: true,
                        district: true,
                        sdgTags: true,
                        category: true,
                        status: true,
                    },
                },
                team: {
                    select: {
                        id: true,
                        facultyName: true,
                        facultyEmail: true,
                        members: {
                            select: { id: true, role: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: proposals,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error fetching proposals:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch proposals',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            challengeId,
            approach,
            timelineWeeks,
            budgetRequested,
            csrPartner,
            ipDeclaration,
            termsAccepted,
            status = 'SUBMITTED', // 'DRAFT' or 'SUBMITTED'
            aiQualityScore,
        } = body;

        if (!challengeId) {
            return NextResponse.json(
                { success: false, error: 'Challenge ID is required', timestamp: new Date().toISOString() },
                { status: 400 }
            );
        }

        if (status === 'SUBMITTED') {
            if (!approach || typeof approach !== 'string' || approach.trim().length < 10) {
                return NextResponse.json(
                    { success: false, error: 'Please provide a detailed technical approach (at least 10 characters)', timestamp: new Date().toISOString() },
                    { status: 400 }
                );
            }

            if (!termsAccepted) {
                return NextResponse.json(
                    { success: false, error: 'Terms acceptance is required prior to submitting proposal', timestamp: new Date().toISOString() },
                    { status: 400 }
                );
            }
        }

        // Fetch challenge
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
        });

        if (!challenge) {
            return NextResponse.json(
                { success: false, error: 'Challenge not found', timestamp: new Date().toISOString() },
                { status: 404 }
            );
        }

        // Identify HEI
        let hei = await prisma.hEI.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Jamshedpur', mode: 'insensitive' } },
                    { ugcId: 'NIT-JSR-001' },
                ],
            },
        });

        if (!hei) {
            hei = await prisma.hEI.findFirst();
        }

        if (!hei) {
            hei = await prisma.hEI.create({
                data: {
                    name: 'NIT Jamshedpur',
                    ugcId: 'NIT-JSR-001',
                    district: 'East Singhbhum',
                    departments: ['Civil Engineering', 'Environmental Engineering', 'Computer Science'],
                    sdgExpertise: [6, 9, 11, 13],
                    naacGrade: 'A',
                    pastPerformanceScore: 0.87,
                },
            });
        }

        // Check if an existing proposal exists for this challenge & HEI
        const existingProposal = await prisma.challengeProposal.findFirst({
            where: {
                challengeId: challenge.id,
                heiId: hei.id,
            },
        });

        const proposalStatus = (status === 'DRAFT' || status === 'ACCEPTED') ? status : 'SUBMITTED';
        const parsedWeeks = Number(timelineWeeks) || 16;
        const parsedBudget = Number(budgetRequested) || 450000;
        const parsedScore = aiQualityScore ? Number(aiQualityScore) / 100 : null;

        let proposal;
        if (existingProposal) {
            proposal = await prisma.challengeProposal.update({
                where: { id: existingProposal.id },
                data: {
                    approach: approach || existingProposal.approach,
                    timelineWeeks: parsedWeeks,
                    budgetRequested: parsedBudget,
                    fundingSource: csrPartner || existingProposal.fundingSource,
                    ipDeclaration: ipDeclaration || existingProposal.ipDeclaration,
                    status: proposalStatus,
                    aiQualityScore: parsedScore ?? existingProposal.aiQualityScore,
                },
            });
        } else {
            proposal = await prisma.challengeProposal.create({
                data: {
                    challengeId: challenge.id,
                    heiId: hei.id,
                    approach: approach || 'Preliminary R&D framework formulated by university research team.',
                    timelineWeeks: parsedWeeks,
                    budgetRequested: parsedBudget,
                    fundingSource: csrPartner || 'Open to any partner',
                    ipDeclaration: ipDeclaration || 'Open Source — published under MIT/CC license',
                    status: proposalStatus,
                    aiQualityScore: parsedScore,
                },
            });
        }

        // If submitted, create P2 notifications for GOV and CSR roles (Trigger 4)
        if (proposalStatus === 'SUBMITTED') {
            try {
                const { NotificationTriggers } = await import('@/lib/notifications');
                await NotificationTriggers.proposalSubmitted({
                    id: proposal.id,
                    challengeId: challenge.id,
                    challengeTitle: challenge.title,
                });
            } catch (notifErr) {
                console.warn('Could not dispatch notifications for proposal submission:', notifErr);
            }
        } else if (proposalStatus === 'ACCEPTED') {
            try {
                const { NotificationTriggers } = await import('@/lib/notifications');
                await NotificationTriggers.proposalAccepted({
                    id: proposal.id,
                    challengeId: challenge.id,
                    challengeTitle: challenge.title,
                });
            } catch (notifErr) {
                console.warn('Could not dispatch notifications for proposal acceptance:', notifErr);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                id: proposal.id,
                challengeId: challenge.id,
                heiId: hei.id,
                status: proposal.status,
                approach: proposal.approach,
                timelineWeeks: proposal.timelineWeeks,
                budgetRequested: proposal.budgetRequested,
                fundingSource: proposal.fundingSource,
                ipDeclaration: proposal.ipDeclaration,
                aiQualityScore: proposal.aiQualityScore,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error in /api/hei/proposals:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to save proposal',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { proposalId, status, heiUserId, csrUserId } = body;

        if (!proposalId || !status) {
            return NextResponse.json(
                { success: false, error: 'Proposal ID and status are required', timestamp: new Date().toISOString() },
                { status: 400 }
            );
        }

        const proposal = await prisma.challengeProposal.findUnique({
            where: { id: proposalId },
            include: { challenge: true, hei: true },
        });

        if (!proposal) {
            return NextResponse.json(
                { success: false, error: 'Proposal not found', timestamp: new Date().toISOString() },
                { status: 404 }
            );
        }

        const updatedProposal = await prisma.challengeProposal.update({
            where: { id: proposalId },
            data: { status },
        });

        // Trigger 5: Proposal ACCEPTED -> P1 for HEI + P1 for CSR company
        if (status === 'ACCEPTED') {
            try {
                const { NotificationTriggers } = await import('@/lib/notifications');
                await NotificationTriggers.proposalAccepted(
                    {
                        id: updatedProposal.id,
                        challengeId: proposal.challengeId,
                        challengeTitle: proposal.challenge.title,
                    },
                    heiUserId || null,
                    csrUserId || null
                );
            } catch (notifErr) {
                console.warn('Could not dispatch notifications for proposal acceptance:', notifErr);
            }
        }

        return NextResponse.json({
            success: true,
            data: updatedProposal,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error updating proposal status:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to update proposal',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

