import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CheckResult {
    item: number;
    title: string;
    passed: boolean;
    details: any;
}

async function verifyDatabaseState() {
    console.log('====================================================');
    console.log('SDG NEXUS — FINAL DATABASE STATE VERIFICATION');
    console.log('====================================================\n');

    const results: CheckResult[] = [];

    // ─────────────────────────────────────────────────────────
    // Check 1: Challenge counts by status
    // Target: SUBMITTED: 3, AI_PROCESSED: 0, VALIDATED: 2, UNIVERSITY_ASSIGNED: 1,
    //         TEAM_FORMED: 2, IN_PROGRESS: 3, COMPLETED: 0, DEPLOYED: 1
    // ─────────────────────────────────────────────────────────
    try {
        const challenges = await prisma.challenge.findMany();
        const counts: Record<string, number> = {
            SUBMITTED: 0,
            AI_PROCESSED: 0,
            VALIDATED: 0,
            UNIVERSITY_ASSIGNED: 0,
            TEAM_FORMED: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0,
            DEPLOYED: 0,
        };

        for (const c of challenges) {
            counts[c.status] = (counts[c.status] || 0) + 1;
        }

        const expectedCounts = {
            SUBMITTED: 3,
            AI_PROCESSED: 0,
            VALIDATED: 2,
            UNIVERSITY_ASSIGNED: 1,
            TEAM_FORMED: 2,
            IN_PROGRESS: 3,
            COMPLETED: 0,
            DEPLOYED: 1,
        };

        const passed = Object.entries(expectedCounts).every(
            ([status, expected]) => (counts[status] || 0) === expected
        );

        results.push({
            item: 1,
            title: 'Challenge counts by status',
            passed,
            details: { actual: counts, expected: expectedCounts },
        });
    } catch (err: any) {
        results.push({ item: 1, title: 'Challenge counts by status', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // Check 2: Hero challenge (title contains "Amrapara" OR "groundwater") → status must be DEPLOYED
    // ─────────────────────────────────────────────────────────
    try {
        const heroChallenge = await prisma.challenge.findFirst({
            where: {
                OR: [
                    { title: { contains: 'Amrapara', mode: 'insensitive' } },
                    { title: { contains: 'groundwater', mode: 'insensitive' } },
                    { title: { contains: 'ground drinking water', mode: 'insensitive' } },
                ],
            },
        });

        const passed = !!heroChallenge && heroChallenge.status === 'DEPLOYED';
        results.push({
            item: 2,
            title: 'Hero challenge status must be DEPLOYED',
            passed,
            details: heroChallenge ? { id: heroChallenge.id, title: heroChallenge.title, status: heroChallenge.status } : 'Not found',
        });
    } catch (err: any) {
        results.push({ item: 2, title: 'Hero challenge status must be DEPLOYED', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // Check 3: ProjectTeam for hero challenge → facultyName: "Prof. Anjali Sharma", >=2 TeamMember records, 3 Milestone records
    // ─────────────────────────────────────────────────────────
    try {
        const heroChallenge = await prisma.challenge.findFirst({
            where: {
                OR: [
                    { title: { contains: 'Amrapara', mode: 'insensitive' } },
                    { title: { contains: 'groundwater', mode: 'insensitive' } },
                    { title: { contains: 'ground drinking water', mode: 'insensitive' } },
                ],
            },
            include: {
                proposals: {
                    include: {
                        team: {
                            include: {
                                members: true,
                                milestones: true,
                            },
                        },
                    },
                },
            },
        });

        const proposal = heroChallenge?.proposals?.[0];
        const team = proposal?.team;
        const facultyOk = team?.facultyName === 'Prof. Anjali Sharma';
        const membersCount = team?.members?.length || 0;
        const milestonesCount = team?.milestones?.length || 0;

        const passed = facultyOk && membersCount >= 2 && milestonesCount === 3;
        results.push({
            item: 3,
            title: 'ProjectTeam for hero challenge (facultyName, members >= 2, milestones = 3)',
            passed,
            details: {
                facultyName: team?.facultyName,
                facultyOk,
                teamMembersCount: membersCount,
                milestonesCount,
            },
        });
    } catch (err: any) {
        results.push({ item: 3, title: 'ProjectTeam for hero challenge', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // Check 4: All 3 milestones for hero project → non-null hashValue
    // ─────────────────────────────────────────────────────────
    try {
        const milestones = await prisma.milestone.findMany({
            include: {
                team: {
                    include: {
                        proposal: {
                            include: {
                                challenge: true,
                            },
                        },
                    },
                },
            },
        });

        const heroMilestones = milestones.filter((m) => {
            const title = m.team?.proposal?.challenge?.title?.toLowerCase() || '';
            return title.includes('amrapara') || title.includes('groundwater') || title.includes('pakur') || title.includes('water');
        });

        const allHaveHash = heroMilestones.length === 3 && heroMilestones.every((m) => !!m.hashValue && m.hashValue.length > 10);
        results.push({
            item: 4,
            title: 'All 3 milestones for hero project have non-null hashValue',
            passed: allHaveHash,
            details: heroMilestones.map((m) => ({
                id: m.id,
                title: m.title,
                status: m.status,
                hashValue: m.hashValue,
            })),
        });
    } catch (err: any) {
        results.push({ item: 4, title: 'All 3 milestones for hero project have non-null hashValue', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // Check 5: StudentCredential for student@nitjsr.ac.in user → must exist with non-null hashValue
    // ─────────────────────────────────────────────────────────
    try {
        const studentUser = await prisma.user.findUnique({
            where: { email: 'student@nitjsr.ac.in' },
            include: {
                studentProfile: {
                    include: {
                        credentials: true,
                    },
                },
            },
        });

        const credentials = studentUser?.studentProfile?.credentials || [];
        const credWithHash = credentials.find((c) => !!c.hashValue && c.hashValue.length > 10);

        results.push({
            item: 5,
            title: 'StudentCredential for student@nitjsr.ac.in exists with non-null hashValue',
            passed: !!credWithHash,
            details: credWithHash
                ? {
                      id: credWithHash.id,
                      challengeTitle: credWithHash.challengeTitle,
                      hashValue: credWithHash.hashValue,
                      creditPoints: credWithHash.creditPoints,
                      nepCompliant: credWithHash.nepCompliant,
                  }
                : 'Not found',
        });
    } catch (err: any) {
        results.push({ item: 5, title: 'StudentCredential for student@nitjsr.ac.in exists', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // Check 6: All 6 User records → must have hashed passwords (field not null)
    // ─────────────────────────────────────────────────────────
    try {
        const demoEmails = [
            'citizen@jharkhand.gov.in',
            'collector@jharkhand.gov.in',
            'faculty@nitjsr.ac.in',
            'csr@tatasteel.com',
            'admin@pradan.net',
            'student@nitjsr.ac.in',
        ];

        const users = await prisma.user.findMany({
            where: { email: { in: demoEmails } },
        });

        const allExist = users.length === 6;
        const allHashed = allExist && users.every((u) => !!u.password_hash && u.password_hash.startsWith('$2'));

        results.push({
            item: 6,
            title: 'All 6 User records exist and have hashed passwords',
            passed: allHashed,
            details: users.map((u) => ({
                email: u.email,
                role: u.role,
                hasPasswordHash: !!u.password_hash,
                isBcrypt: u.password_hash?.startsWith('$2'),
            })),
        });
    } catch (err: any) {
        results.push({ item: 6, title: 'All 6 User records have hashed passwords', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // Check 7: All 4 HEI records → must exist with sdgExpertise arrays populated
    // ─────────────────────────────────────────────────────────
    try {
        const heis = await prisma.hEI.findMany();
        const passed = heis.length >= 4 && heis.every((h) => Array.isArray(h.sdgExpertise) && h.sdgExpertise.length > 0);

        results.push({
            item: 7,
            title: 'All 4 HEI records exist with sdgExpertise arrays populated',
            passed,
            details: heis.map((h) => ({
                id: h.id,
                name: h.name,
                district: h.district,
                sdgExpertise: h.sdgExpertise,
            })),
        });
    } catch (err: any) {
        results.push({ item: 7, title: 'All 4 HEI records exist with sdgExpertise', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // Check 8: GeoImpactSummary or equivalent → must have entries for all 24 districts
    // ─────────────────────────────────────────────────────────
    try {
        const geoSummaries = await prisma.geoImpactSummary.findMany();
        const districtsInDb = new Set(geoSummaries.map((g) => g.district));

        const JHARKHAND_24 = [
            'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka',
            'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla',
            'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar',
            'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi',
            'Sahibganj', 'Saraikela Kharsawan', 'Simdega', 'West Singhbhum',
        ];

        const missing = JHARKHAND_24.filter((d) => !districtsInDb.has(d));
        const passed = districtsInDb.size >= 24 && missing.length === 0;

        results.push({
            item: 8,
            title: 'GeoImpactSummary has entries for all 24 districts',
            passed,
            details: {
                totalDistrictsCovered: districtsInDb.size,
                missingDistricts: missing,
                totalRecords: geoSummaries.length,
            },
        });
    } catch (err: any) {
        results.push({ item: 8, title: 'GeoImpactSummary has entries for all 24 districts', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // Check 9: Notification records → must have at least 5 records (from hero demo journey)
    // ─────────────────────────────────────────────────────────
    try {
        const notifications = await prisma.notification.findMany();
        const passed = notifications.length >= 5;

        results.push({
            item: 9,
            title: 'Notification records have at least 5 records',
            passed,
            details: {
                count: notifications.length,
                sample: notifications.slice(0, 3).map((n) => ({ id: n.id, message: n.message, priority: n.priority })),
            },
        });
    } catch (err: any) {
        results.push({ item: 9, title: 'Notification records count check', passed: false, details: err.message });
    }

    // ─────────────────────────────────────────────────────────
    // PRINT REPORT
    // ─────────────────────────────────────────────────────────
    console.log('--- VERIFICATION RESULTS SUMMARY ---\n');
    let allPassed = true;
    for (const r of results) {
        const mark = r.passed ? '✅' : '❌';
        if (!r.passed) allPassed = false;
        console.log(`${mark} Item ${r.item}: ${r.title}`);
        console.log('   Details:', JSON.stringify(r.details, null, 2));
    }

    console.log('\n====================================================');
    if (allPassed) {
        console.log('🎉 ALL 9 VERIFICATION CHECKS PASSED PERFECTLY!');
    } else {
        console.log('⚠️ SOME CHECKS FAILED. PLEASE REVIEW DETAILS ABOVE.');
    }
    console.log('====================================================\n');

    await prisma.$disconnect();
    process.exit(allPassed ? 0 : 1);
}

verifyDatabaseState();
