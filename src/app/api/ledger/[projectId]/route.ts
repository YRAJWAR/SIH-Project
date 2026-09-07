import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { computeMilestoneHash, computeMerkleRoot } from '@/lib/merkle';

export const HERO_PAKUR_MILESTONES = [
    {
        id: 'ms-pakur-001',
        teamId: 'hero-team-pakur',
        title: 'Water testing kits deployed',
        description: 'Deployed 25 portable water testing kits across 12 villages in Amrapara block. Initial arsenic readings documented.',
        dueDate: '2026-07-15T00:00:00.000Z',
        status: 'CSR_APPROVED',
        proofUrls: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80'],
        proofVideoUrl: null,
        hashValue: computeMilestoneHash(
            'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
            '2026-07-12T10:00:00.000Z',
            24.6352,
            87.8448
        ),
        gpsLat: 24.6352,
        gpsLng: 87.8448,
        verifierCode: 'GP-AMR-991',
        fundReleased: 150000,
        createdAt: '2026-07-12T10:00:00.000Z',
        exifTimestamp: '2026-07-12T09:45:00.000Z', // 15 mins before upload -> normal
    },
    {
        id: 'ms-pakur-002',
        teamId: 'hero-team-pakur',
        title: 'Filter prototype installed',
        description: 'Community-scale filtration prototype installed at Amrapara primary school. Flow rate: 500L/hr, arsenic removal efficiency: 94%.',
        dueDate: '2026-08-15T00:00:00.000Z',
        status: 'GP_VERIFIED',
        proofUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
        proofVideoUrl: null,
        hashValue: computeMilestoneHash(
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            '2026-08-14T09:30:00.000Z',
            24.6352,
            87.8448
        ),
        gpsLat: 24.6352,
        gpsLng: 87.8448,
        verifierCode: '847291',
        fundReleased: 200000,
        createdAt: '2026-08-14T09:30:00.000Z',
        exifTimestamp: '2026-08-14T08:50:00.000Z', // 40 mins before upload -> normal
    },
    {
        id: 'ms-pakur-003',
        teamId: 'hero-team-pakur',
        title: 'Community validation complete',
        description: 'Community survey completed with 89% satisfaction. Local operators trained for filter maintenance. Project handed over to Gram Panchayat.',
        dueDate: '2026-09-01T00:00:00.000Z',
        status: 'CSR_APPROVED',
        proofUrls: ['https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80'],
        proofVideoUrl: null,
        hashValue: computeMilestoneHash(
            'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
            '2026-08-30T12:00:00.000Z',
            24.6352,
            87.8448
        ),
        gpsLat: 24.6352,
        gpsLng: 87.8448,
        verifierCode: 'CSR-TATA-742',
        fundReleased: 100000,
        createdAt: '2026-08-30T12:00:00.000Z',
        exifTimestamp: '2026-08-30T08:30:00.000Z', // 3.5 hrs before upload -> triggers capture/upload mismatch alert
    },
];

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await context.params;

        let projectInfo = {
            id: projectId,
            teamId: projectId,
            title: 'Community Drinking Water Contamination & Arsenic Filtration',
            district: 'Pakur',
            sdgTags: [6, 3, 11],
            status: 'IN_PROGRESS',
            universityName: 'National Institute of Technology Jamshedpur',
            facultyLead: 'Prof. Anjali Sharma',
        };

        let milestonesList: any[] = [];

        try {
            // Find team matching projectId as team.id, proposalId, or proposal.challengeId
            const team = await prisma.projectTeam.findFirst({
                where: {
                    OR: [
                        { id: projectId },
                        { proposalId: projectId },
                        { proposal: { challengeId: projectId } },
                    ],
                },
                include: {
                    hei: true,
                    proposal: {
                        include: {
                            challenge: true,
                        },
                    },
                    milestones: {
                        orderBy: { dueDate: 'asc' },
                    },
                },
            });

            if (team) {
                const ch = team.proposal?.challenge;
                projectInfo = {
                    id: team.id,
                    teamId: team.id,
                    title: ch?.title || projectInfo.title,
                    district: ch?.district || projectInfo.district,
                    sdgTags: ch?.sdgTags || projectInfo.sdgTags,
                    status: (ch?.status as string) || 'IN_PROGRESS',
                    universityName: team.hei?.name || projectInfo.universityName,
                    facultyLead: team.facultyName || projectInfo.facultyLead,
                };

                if (team.milestones && team.milestones.length > 0) {
                    milestonesList = team.milestones.map((m) => {
                        const proof = Array.isArray(m.proofUrls) && m.proofUrls.length > 0 ? m.proofUrls[0] : '';
                        const dateStr = m.createdAt.toISOString();
                        const lat = m.gpsLat ?? '';
                        const lng = m.gpsLng ?? '';
                        const validHash = m.hashValue || computeMilestoneHash(proof, dateStr, lat, lng);

                        return {
                            id: m.id,
                            teamId: m.teamId,
                            title: m.title,
                            description: m.description,
                            dueDate: m.dueDate.toISOString(),
                            status: m.status,
                            proofUrls: m.proofUrls,
                            proofVideoUrl: m.proofVideoUrl,
                            hashValue: validHash,
                            gpsLat: m.gpsLat,
                            gpsLng: m.gpsLng,
                            exifTimestamp: m.exifTimestamp ? m.exifTimestamp.toISOString() : null,
                            verifierCode: m.verifierCode,
                            fundReleased: m.fundReleased,
                            createdAt: dateStr,
                        };
                    });
                }
            }
        } catch (dbErr) {
            console.warn('Prisma lookup failed in ledger route, using demo hero project:', dbErr);
        }

        // Fallback for hero demo project
        if (milestonesList.length === 0) {
            milestonesList = HERO_PAKUR_MILESTONES;
        }

        const hashes = milestonesList.map((m) => m.hashValue).filter(Boolean);
        const merkleRoot = computeMerkleRoot(hashes);

        return NextResponse.json({
            success: true,
            data: {
                project: projectInfo,
                milestones: milestonesList,
                merkleRoot,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error fetching ledger for project:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch project ledger',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
