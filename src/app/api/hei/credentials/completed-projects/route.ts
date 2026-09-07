import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const HERO_COMPLETED_PROJECT = {
    id: 'hero-team-pakur',
    proposalId: 'hero-prop-pakur-01',
    challengeId: 'hero-challenge-pakur',
    challengeTitle: 'Arsenic Contamination in Drinking Water, Pakur',
    district: 'Pakur',
    category: 'Water & Sanitation',
    sdgTags: [6, 3],
    csrFunder: 'Tata Steel Foundation',
    timelineWeeks: 16,
    facultyName: 'Prof. Anjali Sharma',
    facultyEmail: 'faculty@nitjsr.ac.in',
    universityName: 'National Institute of Technology Jamshedpur',
    allMilestonesApproved: true,
    beneficiariesCount: 15400,
    teamMembers: [
        {
            studentProfileId: 'arjun-profile-hero',
            studentName: 'Arjun Sharma',
            email: 'arjun@nitjsr.ac.in',
            branch: 'Environmental Engineering',
            year: 3,
            role: 'Team Lead',
            skills: ['Water Treatment', 'Field Research', 'AutoCAD', 'Data Collection'],
            defaultHours: 120,
            defaultCredits: 4,
        },
        {
            studentProfileId: 'sneha-profile-hero',
            studentName: 'Sneha Kumari',
            email: 'sneha@nitjsr.ac.in',
            branch: 'Environmental Engineering',
            year: 3,
            role: 'Field Researcher',
            skills: ['GIS Mapping', 'Water Analysis'],
            defaultHours: 120,
            defaultCredits: 4,
        },
        {
            studentProfileId: 'vikash-profile-hero',
            studentName: 'Vikash Tirkey',
            email: 'vikash@nitjsr.ac.in',
            branch: 'Civil Engineering',
            year: 4,
            role: 'Data Analyst',
            skills: ['Structural Design', 'Survey'],
            defaultHours: 120,
            defaultCredits: 4,
        },
        {
            studentProfileId: 'priya-profile-hero',
            studentName: 'Priya Munda',
            email: 'priya.m@nitjsr.ac.in',
            branch: 'Computer Science',
            year: 2,
            role: 'Community Liaison',
            skills: ['Python', 'Data Visualization'],
            defaultHours: 120,
            defaultCredits: 4,
        },
    ],
};

export async function GET(request: NextRequest) {
    try {
        let completedProjects: any[] = [];

        try {
            // Find teams where proposal is ACCEPTED
            const teams = await prisma.projectTeam.findMany({
                where: {
                    proposal: {
                        status: 'ACCEPTED',
                    },
                },
                include: {
                    proposal: {
                        include: {
                            challenge: true,
                        },
                    },
                    hei: true,
                    members: {
                        include: {
                            student: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                    milestones: true,
                },
            });

            for (const t of teams) {
                // Check if all milestones are CSR_APPROVED or if no milestones yet (or hero demo)
                const milestones = t.milestones || [];
                const allApproved = milestones.length > 0
                    ? milestones.every((m) => m.status === 'CSR_APPROVED' || m.status === 'GP_VERIFIED')
                    : true;

                // Only include if milestones are approved/completed
                if (allApproved || t.id === 'hero-team-pakur') {
                    // Check for existing credentials
                    const studentProfileIds = t.members.map((m) => m.studentProfileId);
                    const existingCreds = await prisma.studentCredential.findMany({
                        where: {
                            studentProfileId: { in: studentProfileIds },
                            challengeTitle: t.proposal.challenge.title,
                        },
                    });

                    completedProjects.push({
                        id: t.id,
                        proposalId: t.proposalId,
                        challengeId: t.proposal.challengeId,
                        challengeTitle: t.proposal.challenge.title,
                        district: t.proposal.challenge.district,
                        category: t.proposal.challenge.category,
                        sdgTags: t.proposal.challenge.sdgTags || [6],
                        csrFunder: t.proposal.fundingSource || 'State CSR Escrow',
                        timelineWeeks: t.proposal.timelineWeeks || 16,
                        facultyName: t.facultyName,
                        facultyEmail: t.facultyEmail,
                        universityName: t.hei?.name || 'National Institute of Technology Jamshedpur',
                        allMilestonesApproved: true,
                        beneficiariesCount: 15400,
                        teamMembers: t.members.map((m) => ({
                            studentProfileId: m.studentProfileId,
                            studentName: m.student.user.full_name,
                            email: m.student.user.email,
                            branch: m.student.branch,
                            year: m.student.year,
                            role: m.role,
                            skills: m.student.skills,
                            defaultHours: (t.proposal.timelineWeeks || 16) * 10,
                            defaultCredits: Math.max(1, Math.round(((t.proposal.timelineWeeks || 16) * 10) / 30)),
                        })),
                        existingCredentials: existingCreds.map((c) => ({
                            id: c.id,
                            studentProfileId: c.studentProfileId,
                            hoursContributed: c.hoursContributed,
                            creditPoints: c.creditPoints,
                            hashValue: c.hashValue,
                            issuedAt: c.issuedAt.toISOString(),
                        })),
                    });
                }
            }
        } catch (dbErr) {
            console.warn('DB error fetching completed projects:', dbErr);
        }

        // Always ensure Hero Pakur project is available for hackathon demo
        if (completedProjects.length === 0) {
            completedProjects = [HERO_COMPLETED_PROJECT];
        }

        return NextResponse.json({
            success: true,
            data: completedProjects,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error in completed-projects route:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error', timestamp: new Date().toISOString() },
            { status: 500 }
        );
    }
}
