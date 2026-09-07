import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // ── Clean up (reverse FK order) ──────────────────────────
    // New models first
    await prisma.studentCredential.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.projectTeam.deleteMany();
    await prisma.challengeProposal.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.hEI.deleteMany();
    // Existing models
    await prisma.governmentAuditFlag.deleteMany();
    await prisma.impactScoreHistory.deleteMany();
    await prisma.organizationFinancialSummary.deleteMany();
    await prisma.riskFlag.deleteMany();
    await prisma.cSRAllocation.deleteMany();
    await prisma.donation.deleteMany();
    await prisma.impactScore.deleteMany();
    await prisma.projectActivity.deleteMany();
    await prisma.projectSDG.deleteMany();
    await prisma.volunteerApplication.deleteMany();
    await prisma.volunteerOpportunity.deleteMany();
    await prisma.projectOutcomeMetrics.deleteMany();
    await prisma.project.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    await prisma.geoImpactSummary.deleteMany();
    await prisma.sDG.deleteMany();

    // ── 1. Seed SDGs (1-17) ──────────────────────────────────
    const sdgs = [
        { id: 1, name: 'No Poverty' },
        { id: 2, name: 'Zero Hunger' },
        { id: 3, name: 'Good Health and Well-being' },
        { id: 4, name: 'Quality Education' },
        { id: 5, name: 'Gender Equality' },
        { id: 6, name: 'Clean Water and Sanitation' },
        { id: 7, name: 'Affordable and Clean Energy' },
        { id: 8, name: 'Decent Work and Economic Growth' },
        { id: 9, name: 'Industry, Innovation and Infrastructure' },
        { id: 10, name: 'Reduced Inequality' },
        { id: 11, name: 'Sustainable Cities and Communities' },
        { id: 12, name: 'Responsible Consumption and Production' },
        { id: 13, name: 'Climate Action' },
        { id: 14, name: 'Life Below Water' },
        { id: 15, name: 'Life on Land' },
        { id: 16, name: 'Peace and Justice Strong Institutions' },
        { id: 17, name: 'Partnerships to achieve the Goal' }
    ];
    for (const sdg of sdgs) {
        await prisma.sDG.create({ data: sdg });
    }
    console.log('✓ 17 SDGs seeded');

    // ── Shared password hash ─────────────────────────────────
    const demoHash = await bcrypt.hash('Demo@1234', 10);
    const legacyHash = await bcrypt.hash('password123', 10);

    // ══════════════════════════════════════════════════════════
    // STEP 2 — HEI RECORDS (must exist before users that reference them)
    // ══════════════════════════════════════════════════════════

    const nitJsr = await prisma.hEI.create({
        data: {
            name: 'NIT Jamshedpur',
            ugcId: 'NIT-JSR-001',
            district: 'East Singhbhum',
            departments: ['Civil Engineering', 'Environmental Engineering', 'Computer Science', 'Electronics'],
            sdgExpertise: [6, 9, 11, 13],
            naacGrade: 'A',
            pastPerformanceScore: 0.87,
        }
    });

    const iitIsm = await prisma.hEI.create({
        data: {
            name: 'IIT (ISM) Dhanbad',
            ugcId: 'IIT-ISM-001',
            district: 'Dhanbad',
            departments: ['Mining Engineering', 'Petroleum Engineering', 'Environmental Science', 'Management'],
            sdgExpertise: [7, 8, 13, 15],
            naacGrade: 'A+',
            pastPerformanceScore: 0.91,
        }
    });

    const bitSindri = await prisma.hEI.create({
        data: {
            name: 'BIT Sindri',
            ugcId: 'BIT-SIN-001',
            district: 'Dhanbad',
            departments: ['Chemical Engineering', 'Mechanical Engineering', 'Civil Engineering'],
            sdgExpertise: [6, 7, 9, 11],
            naacGrade: 'A',
            pastPerformanceScore: 0.79,
        }
    });

    const ranchiUni = await prisma.hEI.create({
        data: {
            name: 'Ranchi University',
            ugcId: 'RU-RNC-001',
            district: 'Ranchi',
            departments: ['Social Work', 'Agriculture', 'Public Health', 'Education'],
            sdgExpertise: [1, 2, 3, 4],
            naacGrade: 'B+',
            pastPerformanceScore: 0.72,
        }
    });
    console.log('✓ 4 HEIs seeded');

    // ══════════════════════════════════════════════════════════
    // STEP 1 — DEMO USER ACCOUNTS
    // ══════════════════════════════════════════════════════════

    const citizenUser = await prisma.user.create({
        data: {
            full_name: 'Ramu Oraon',
            email: 'citizen@jharkhand.gov.in',
            password_hash: demoHash,
            role: 'CITIZEN',
        }
    });

    const collectorUser = await prisma.user.create({
        data: {
            full_name: 'District Collector — Ranchi',
            email: 'collector@jharkhand.gov.in',
            password_hash: demoHash,
            role: 'GOV',
        }
    });

    const facultyUser = await prisma.user.create({
        data: {
            full_name: 'Prof. Anjali Sharma',
            email: 'faculty@nitjsr.ac.in',
            password_hash: demoHash,
            role: 'HEI',
            heiId: nitJsr.id,
        }
    });

    const csrUser = await prisma.user.create({
        data: {
            full_name: 'Tata Steel CSR Foundation',
            email: 'csr@tatasteel.com',
            password_hash: demoHash,
            role: 'CORP',
        }
    });

    const ngoUser = await prisma.user.create({
        data: {
            full_name: 'PRADAN Jharkhand',
            email: 'admin@pradan.net',
            password_hash: demoHash,
            role: 'NGO',
        }
    });

    const studentUser = await prisma.user.create({
        data: {
            full_name: 'Arjun Mahato',
            email: 'student@nitjsr.ac.in',
            password_hash: demoHash,
            role: 'STUDENT',
            heiId: nitJsr.id,
        }
    });

    // Legacy users for existing dashboard demos
    const govUser = await prisma.user.create({
        data: {
            full_name: 'Dr. Ramesh Kumar, Ministry of Social Justice',
            email: 'gov@india.gov.in',
            password_hash: legacyHash,
            role: 'GOVERNMENT'
        }
    });

    const donorUser = await prisma.user.create({
        data: {
            full_name: 'Jane Doe',
            email: 'jane@example.com',
            password_hash: legacyHash,
            role: 'DONOR'
        }
    });
    console.log('✓ 8 Users seeded');

    // ══════════════════════════════════════════════════════════
    // STEP 3 & 4 — ORGANIZATIONS (CSR + NGO)
    // ══════════════════════════════════════════════════════════

    const tataCsr = await prisma.organization.create({
        data: {
            name: 'Tata Steel CSR Foundation',
            type: 'CORPORATE',
            registration_number: 'CORP-JH-TATA-2001',
            state: 'Jharkhand',
            district: 'East Singhbhum',
            verification_status: 'VERIFIED',
            financial_summary: {
                create: {
                    total_csr_received: 850000000,
                    total_csr_disbursed: 720000000,
                }
            }
        }
    });

    const sailCsr = await prisma.organization.create({
        data: {
            name: 'SAIL CSR Wing',
            type: 'CORPORATE',
            registration_number: 'CORP-JH-SAIL-2003',
            state: 'Jharkhand',
            district: 'Bokaro',
            verification_status: 'VERIFIED',
            financial_summary: {
                create: {
                    total_csr_received: 620000000,
                    total_csr_disbursed: 510000000,
                }
            }
        }
    });

    const pradanOrg = await prisma.organization.create({
        data: {
            name: 'PRADAN Jharkhand',
            type: 'NGO',
            registration_number: 'NGO-JH-PRADAN-2005',
            state: 'Jharkhand',
            district: 'Gumla',
            verification_status: 'VERIFIED',
            financial_summary: {
                create: {
                    total_donations_received: 35000000,
                    total_budget_utilized: 31000000,
                    active_projects_count: 5,
                }
            }
        }
    });

    // Legacy organizations
    const ngo1 = await prisma.organization.create({
        data: {
            name: 'Green Earth Foundation',
            type: 'NGO',
            registration_number: 'NGO-IND-GEF-2015',
            state: 'Maharashtra',
            district: 'Mumbai',
            verification_status: 'VERIFIED',
            financial_summary: {
                create: {
                    total_donations_received: 5000000,
                    total_budget_utilized: 4500000,
                    active_projects_count: 2
                }
            }
        }
    });

    const ngo2 = await prisma.organization.create({
        data: {
            name: 'Education for All Initiative',
            type: 'NGO',
            registration_number: 'NGO-IND-EFA-2018',
            state: 'Karnataka',
            district: 'Bengaluru',
            verification_status: 'PENDING',
            financial_summary: {
                create: {
                    total_donations_received: 2500000,
                    total_budget_utilized: 1500000,
                    active_projects_count: 1
                }
            }
        }
    });

    const ngo3 = await prisma.organization.create({
        data: {
            name: 'Water Conservation Society (WCS)',
            type: 'NGO',
            registration_number: 'NGO-IND-WCS-2010',
            state: 'Rajasthan',
            district: 'Jaipur',
            verification_status: 'VERIFIED',
            financial_summary: {
                create: {
                    total_donations_received: 12000000,
                    total_budget_utilized: 11500000,
                    active_projects_count: 4
                }
            }
        }
    });

    const corporate1 = await prisma.organization.create({
        data: {
            name: 'TechCorp India Pvt. Ltd.',
            type: 'CORPORATE',
            registration_number: 'CORP-IND-TCI-1999',
            state: 'Delhi',
            district: 'New Delhi',
            verification_status: 'VERIFIED',
            financial_summary: {
                create: { total_csr_disbursed: 15000000 }
            }
        }
    });

    const corporate2 = await prisma.organization.create({
        data: {
            name: 'Global Finance & Analytics Ltd.',
            type: 'CORPORATE',
            registration_number: 'CORP-IND-GFA-2005',
            state: 'Maharashtra',
            district: 'Mumbai',
            verification_status: 'VERIFIED',
            financial_summary: {
                create: { total_csr_disbursed: 8500000 }
            }
        }
    });
    console.log('✓ 8 Organizations seeded');

    // ══════════════════════════════════════════════════════════
    // STEP 5 — STUDENT PROFILE
    // ══════════════════════════════════════════════════════════

    const arjunProfile = await prisma.studentProfile.create({
        data: {
            userId: studentUser.id,
            branch: 'Civil Engineering',
            year: 3,
            skills: ['Water Treatment', 'Field Research', 'AutoCAD', 'Data Collection'],
            credits: 12,
            rating: 3.8,
        }
    });

    // Placeholder students for the hero team
    const placeholderStudents = [];
    const placeholderData = [
        { name: 'Sneha Kumari', email: 'sneha@nitjsr.ac.in', branch: 'Environmental Engineering', year: 3, skills: ['GIS Mapping', 'Water Analysis'] },
        { name: 'Vikash Tirkey', email: 'vikash@nitjsr.ac.in', branch: 'Civil Engineering', year: 4, skills: ['Structural Design', 'Survey'] },
        { name: 'Priya Munda', email: 'priya.m@nitjsr.ac.in', branch: 'Computer Science', year: 2, skills: ['Python', 'Data Visualization'] },
    ];
    for (const s of placeholderData) {
        const u = await prisma.user.create({
            data: {
                full_name: s.name,
                email: s.email,
                password_hash: demoHash,
                role: 'STUDENT',
                heiId: nitJsr.id,
            }
        });
        const sp = await prisma.studentProfile.create({
            data: {
                userId: u.id,
                branch: s.branch,
                year: s.year,
                skills: s.skills,
                credits: 0,
                rating: 0,
            }
        });
        placeholderStudents.push(sp);
    }
    console.log('✓ 4 StudentProfiles seeded');

    // ══════════════════════════════════════════════════════════
    // STEP 6 — 24 JHARKHAND DISTRICT GEO-ENTRIES
    // ══════════════════════════════════════════════════════════

    const districts: [string, number, number, number[]][] = [
        ['Ranchi', 23.3441, 85.3096, [4, 6, 3]],
        ['Dhanbad', 23.7957, 86.4304, [8, 11, 13]],
        ['Bokaro', 23.6693, 86.1511, [8, 9, 11]],
        ['East Singhbhum', 22.8046, 86.2029, [9, 11, 8]],
        ['Dumka', 24.2694, 87.2492, [1, 4, 6]],
        ['Palamu', 24.0291, 84.0678, [1, 2, 3]],
        ['Latehar', 23.7451, 84.4987, [1, 6, 15]],
        ['Gumla', 23.0441, 84.5354, [1, 3, 6]],
        ['Pakur', 24.6352, 87.8448, [6, 3, 4]],
        ['Garhwa', 24.1650, 83.8085, [2, 6, 15]],
        ['Simdega', 22.6113, 84.5027, [3, 6, 1]],
        ['Khunti', 23.0712, 85.2782, [1, 15, 6]],
        ['Lohardaga', 23.4372, 84.6831, [1, 2, 6]],
        ['Giridih', 24.1862, 86.3054, [4, 8, 1]],
        ['Godda', 24.8316, 87.2098, [3, 6, 4]],
        ['Sahibganj', 25.2442, 87.6365, [1, 6, 3]],
        ['Sahebganj', 25.2442, 87.6365, [1, 6, 3]],
        ['West Singhbhum', 22.6167, 85.8333, [1, 15, 6]],
        ['Saraikela Kharsawan', 22.5820, 85.9530, [8, 11, 1]],
        ['Seraikela', 22.5820, 85.9530, [8, 11, 1]],
        ['Chatra', 24.2011, 84.8722, [1, 4, 3]],
        ['Hazaribagh', 23.9925, 85.3637, [4, 8, 13]],
        ['Koderma', 24.4644, 85.5956, [4, 8, 6]],
        ['Jamtara', 23.9662, 86.8002, [4, 1, 6]],
        ['Deoghar', 24.4850, 86.6950, [3, 4, 11]],
        ['Ramgarh', 23.6289, 85.5178, [8, 11, 6]],
    ];

    let geoCount = 0;
    for (const [name, lat, lng, sdgPressure] of districts) {
        for (const sdgId of sdgPressure) {
            await prisma.geoImpactSummary.upsert({
                where: { district_state_sdg_id: { district: name, state: 'Jharkhand', sdg_id: sdgId } },
                update: {},
                create: {
                    district: name,
                    state: 'Jharkhand',
                    sdg_id: sdgId,
                    total_funding: 0,
                    total_beneficiaries: 0,
                    avg_impact_score: 0,
                }
            });
            geoCount++;
        }
    }
    console.log(`✓ ${geoCount} GeoImpactSummary entries seeded (24 districts × ~3 SDGs)`);

    // ══════════════════════════════════════════════════════════
    // STEP 7 — 12 SEEDED CHALLENGES
    // ══════════════════════════════════════════════════════════

    const challengeData: {
        title: string; district: string; category: string;
        sdgTags: number[]; status: 'SUBMITTED' | 'AI_PROCESSED' | 'VALIDATED' | 'UNIVERSITY_ASSIGNED' | 'TEAM_FORMED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEPLOYED';
        lat: number; lng: number;
    }[] = [
        { title: 'Severe groundwater contamination in Amrapara block', district: 'Pakur', category: 'Water', sdgTags: [6], status: 'DEPLOYED', lat: 24.6352, lng: 87.8448 },
        { title: 'High school dropout rate in Dumka tribal belt', district: 'Dumka', category: 'Education', sdgTags: [4, 10], status: 'IN_PROGRESS', lat: 24.2694, lng: 87.2492 },
        { title: 'Crop pest management for kharif season in Garhwa', district: 'Garhwa', category: 'Agriculture', sdgTags: [2, 15], status: 'TEAM_FORMED', lat: 24.1650, lng: 83.8085 },
        { title: 'Road connectivity to 8 villages in Latehar', district: 'Latehar', category: 'Infrastructure', sdgTags: [11], status: 'VALIDATED', lat: 23.7451, lng: 84.4987 },
        { title: 'Open defecation in Simdega tribal hamlets', district: 'Simdega', category: 'Sanitation', sdgTags: [6, 3], status: 'UNIVERSITY_ASSIGNED', lat: 22.6113, lng: 84.5027 },
        { title: 'Primary health centre equipment failure in Gumla', district: 'Gumla', category: 'Health', sdgTags: [3], status: 'IN_PROGRESS', lat: 23.0441, lng: 84.5354 },
        { title: 'Forest encroachment monitoring in Khunti', district: 'Khunti', category: 'Environment', sdgTags: [15], status: 'SUBMITTED', lat: 23.0712, lng: 85.2782 },
        { title: 'Lack of vocational training in Palamu block', district: 'Palamu', category: 'Livelihoods', sdgTags: [8, 1], status: 'VALIDATED', lat: 24.0291, lng: 84.0678 },
        { title: 'Solar power access for 12 off-grid villages in Latehar', district: 'Latehar', category: 'Infrastructure', sdgTags: [7, 1], status: 'TEAM_FORMED', lat: 23.7451, lng: 84.4987 },
        { title: 'Child malnutrition tracking in Bokaro anganwadis', district: 'Bokaro', category: 'Health', sdgTags: [3, 2], status: 'IN_PROGRESS', lat: 23.6693, lng: 86.1511 },
        { title: 'Digital literacy for Panchayat officials in Ranchi', district: 'Ranchi', category: 'Education', sdgTags: [4, 16], status: 'SUBMITTED', lat: 23.3441, lng: 85.3096 },
        { title: 'Erosion of agricultural land near Koel river, Lohardaga', district: 'Lohardaga', category: 'Agriculture', sdgTags: [15, 2], status: 'SUBMITTED', lat: 23.4372, lng: 84.6831 },
    ];

    const challenges = [];
    for (const c of challengeData) {
        const ch = await prisma.challenge.create({
            data: {
                title: c.title,
                description: `Community-reported challenge: ${c.title}`,
                district: c.district,
                gpsLat: c.lat,
                gpsLng: c.lng,
                category: c.category,
                photoUrls: [],
                videoUrls: [],
                status: c.status,
                sdgTags: c.sdgTags,
                aiConfidence: c.status === 'SUBMITTED' ? null : 0.85,
                submittedBy: citizenUser.id,
                submitterType: 'CITIZEN',
            }
        });
        challenges.push(ch);
    }
    console.log('✓ 12 Challenges seeded');

    // ══════════════════════════════════════════════════════════
    // STEP 8 — HERO DEMO FLOW (Challenge #1: Pakur water)
    // ══════════════════════════════════════════════════════════

    const heroChallenge = challenges[0];

    const heroProposal = await prisma.challengeProposal.create({
        data: {
            challengeId: heroChallenge.id,
            heiId: nitJsr.id,
            approach: 'Deploy portable water testing kits across Amrapara block, install community-scale arsenic/fluoride filtration units, and train local operators for long-term maintenance.',
            timelineWeeks: 16,
            budgetRequested: 450000,
            fundingSource: 'Tata Steel CSR',
            ipDeclaration: 'All IP developed under this project is open-source under MIT license for community benefit.',
            status: 'ACCEPTED',
            aiQualityScore: 0.88,
        }
    });

    const heroTeam = await prisma.projectTeam.create({
        data: {
            proposalId: heroProposal.id,
            heiId: nitJsr.id,
            facultyName: 'Prof. Anjali Sharma',
            facultyEmail: 'faculty@nitjsr.ac.in',
            backupLead: 'Dr. Sanjay Verma',
        }
    });

    // Team members: Arjun + 3 placeholders
    const allStudentProfiles = [arjunProfile, ...placeholderStudents];
    const memberRoles = ['Team Lead', 'Field Researcher', 'Data Analyst', 'Community Liaison'];
    for (let i = 0; i < allStudentProfiles.length; i++) {
        await prisma.teamMember.create({
            data: {
                teamId: heroTeam.id,
                studentProfileId: allStudentProfiles[i].id,
                role: memberRoles[i],
            }
        });
    }

    // Milestones with cryptographic SHA-256 hashes
    const m1Hash = CryptoJS.SHA256('milestone-1-pakur-water-2026-07-12T14:32:00Z-24.6352-87.8448').toString();
    const m2Hash = CryptoJS.SHA256('milestone-2-pakur-water-2026-08-15T11:00:00Z-24.6352-87.8448-847291').toString();
    const m3Hash = CryptoJS.SHA256('milestone-3-pakur-water-2026-09-01T09:15:00Z-24.6352-87.8448-validated').toString();

    await prisma.milestone.create({
        data: {
            teamId: heroTeam.id,
            title: 'Water testing kits deployed',
            description: 'Deployed 25 portable water testing kits across 12 villages in Amrapara block. Initial arsenic readings documented.',
            dueDate: new Date('2026-07-15'),
            status: 'CSR_APPROVED',
            proofUrls: [],
            hashValue: m1Hash,
            gpsLat: 24.6352,
            gpsLng: 87.8448,
        }
    });

    await prisma.milestone.create({
        data: {
            teamId: heroTeam.id,
            title: 'Filter prototype installed',
            description: 'Community-scale filtration prototype installed at Amrapara primary school. Flow rate: 500L/hr, arsenic removal efficiency: 94%.',
            dueDate: new Date('2026-08-15'),
            status: 'GP_VERIFIED',
            proofUrls: [],
            hashValue: m2Hash,
            verifierCode: '847291',
            gpsLat: 24.6352,
            gpsLng: 87.8448,
        }
    });

    await prisma.milestone.create({
        data: {
            teamId: heroTeam.id,
            title: 'Community validation complete',
            description: 'Community survey completed with 89% satisfaction. Local operators trained for filter maintenance. Project handed over to Gram Panchayat.',
            dueDate: new Date('2026-09-01'),
            status: 'CSR_APPROVED',
            proofUrls: [],
            hashValue: m3Hash,
            gpsLat: 24.6352,
            gpsLng: 87.8448,
        }
    });

    // Student Credential for Arjun
    const credHash = CryptoJS.SHA256(`credential-arjun-pakur-water-${arjunProfile.id}`).toString();
    await prisma.studentCredential.create({
        data: {
            studentProfileId: arjunProfile.id,
            challengeTitle: heroChallenge.title,
            challengeDistrict: heroChallenge.district,
            sdgTags: [6],
            hoursContributed: 240,
            creditPoints: 4,
            nepCompliant: true,
            hashValue: credHash,
        }
    });

    // Seed 5 demo journey notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: facultyUser.id,
                message: 'New Challenge Routed: Severe groundwater contamination in Amrapara block matched to NIT Jamshedpur (Score: 88%).',
                entityType: 'CHALLENGE',
                entityId: heroChallenge.id,
                challengeId: heroChallenge.id,
                priority: 'P1',
                read: false,
            },
            {
                userId: studentUser.id,
                message: 'You have been assigned to Project Team: Community Drinking Water Filtration (Pakur).',
                entityType: 'TEAM',
                entityId: heroTeam.id,
                challengeId: heroChallenge.id,
                priority: 'P2',
                read: false,
            },
            {
                userId: csrUser.id,
                message: 'Milestone 1 Approved: Tranche 1 released for Pakur Drinking Water Filtration initiative.',
                entityType: 'MILESTONE',
                entityId: heroTeam.id,
                challengeId: heroChallenge.id,
                priority: 'P2',
                read: true,
            },
            {
                userId: collectorUser.id,
                message: 'District Collector Validation: Amrapara block challenge routed to NIT Jamshedpur successfully.',
                entityType: 'GOVERNMENT',
                entityId: heroChallenge.id,
                challengeId: heroChallenge.id,
                priority: 'P2',
                read: true,
            },
            {
                userId: citizenUser.id,
                message: 'Your challenge report for Amrapara drinking water has reached DEPLOYED status. Final outcome verified.',
                entityType: 'CHALLENGE',
                entityId: heroChallenge.id,
                challengeId: heroChallenge.id,
                priority: 'P1',
                read: false,
            },
        ],
    });
    console.log('✓ Hero demo flow seeded (1 proposal, 1 team, 4 members, 3 milestones, 1 credential, 5 notifications)');

    // ══════════════════════════════════════════════════════════
    // LEGACY DATA (existing dashboards)
    // ══════════════════════════════════════════════════════════

    // Projects
    const project1 = await prisma.project.create({
        data: {
            organization_id: ngo1.id,
            title: 'Mumbai Coastal Mangrove Restoration',
            description: 'A dedicated initiative to restore 50 hectares of degraded mangrove forests along the Mumbai coastline, aiming to improve local marine biodiversity and provide coastal flood resilience.',
            budget_allocated: 6000000,
            budget_utilized: 4500000,
            beneficiaries_count: 15000,
            status: 'ACTIVE',
            sdg_tags: { create: [{ sdg_id: 13 }, { sdg_id: 14 }] }
        }
    });

    const project2 = await prisma.project.create({
        data: {
            organization_id: ngo2.id,
            title: 'Rural Digital Literacy Program - Phase 2',
            description: 'Equipping 50 rural government schools with high-speed internet, smartboards, and essential computer literacy training for marginalized youth.',
            budget_allocated: 5000000,
            budget_utilized: 1500000,
            beneficiaries_count: 3500,
            status: 'ACTIVE',
            sdg_tags: { create: [{ sdg_id: 4 }, { sdg_id: 10 }] }
        }
    });

    const project3 = await prisma.project.create({
        data: {
            organization_id: ngo3.id,
            title: 'Rajasthan Desert Aquifer Recharge',
            description: 'Building 120 rainwater harvesting structures and decentralized check dams across 10 drought-prone districts of Rajasthan to combat extreme water scarcity.',
            budget_allocated: 12000000,
            budget_utilized: 11500000,
            beneficiaries_count: 120000,
            status: 'COMPLETED',
            sdg_tags: { create: [{ sdg_id: 6 }, { sdg_id: 15 }] }
        }
    });

    // Volunteer Opportunities
    await prisma.volunteerOpportunity.create({
        data: {
            organization_id: ngo1.id,
            title: 'Mangrove Sapling Plantation Drive',
            description: 'We need eco-conscious individuals to help plant 5,000 mangrove saplings along the Versova coastal stretch.',
            date: new Date(Date.now() + 7 * 86400000),
            start_time: '08:00 AM',
            end_time: '01:00 PM',
            location: 'Versova Beach, Mumbai',
            required_volunteers: 150,
            filled_volunteers: 45
        }
    });

    await prisma.volunteerOpportunity.create({
        data: {
            organization_id: ngo2.id,
            title: 'Weekend Computer Literacy Teacher',
            description: 'Volunteer your technical skills by teaching basic computer operations to underprivileged students.',
            date: new Date(Date.now() + 3 * 86400000),
            start_time: '10:00 AM',
            end_time: '04:00 PM',
            location: 'Gov. Primary School, Sector 4, Bengaluru',
            required_volunteers: 20,
            filled_volunteers: 18
        }
    });

    await prisma.volunteerOpportunity.create({
        data: {
            organization_id: ngo3.id,
            title: 'Community Water Awareness Campaigner',
            description: 'Join our door-to-door awareness campaign on modern water conservation techniques.',
            date: new Date(Date.now() + 14 * 86400000),
            start_time: '09:00 AM',
            end_time: '05:00 PM',
            location: 'Central Plaza, Jaipur Main Market',
            required_volunteers: 50,
            filled_volunteers: 10
        }
    });

    // Donations
    await prisma.donation.create({
        data: { project_id: project1.id, donor_id: donorUser.id, amount: 50000 }
    });

    // CSR Allocations
    await prisma.cSRAllocation.create({
        data: {
            corporate_org_id: corporate1.id,
            project_id: project2.id,
            amount_committed: 5000000,
            amount_disbursed: 1500000,
            financial_year: '2024-2025'
        }
    });
    await prisma.cSRAllocation.create({
        data: {
            corporate_org_id: corporate2.id,
            project_id: project3.id,
            amount_committed: 8500000,
            amount_disbursed: 8500000,
            financial_year: '2023-2024'
        }
    });

    // Activities
    await prisma.projectActivity.create({
        data: {
            project_id: project3.id,
            activity_title: 'Completion of 120 Check Dams',
            description: 'Successfully finalized the construction phase of all 120 decentralised check dams.',
            hash_value: 'bc8f8c9b9ec8e7b1a6d4f6',
            proof_url: 'https://example.com/wcs_proof_dams.pdf'
        }
    });

    // Impact Scores
    await prisma.impactScore.create({
        data: { organization_id: ngo1.id, scale_score: 82, outcome_score: 88, efficiency_score: 91, geographic_need_score: 75, transparency_score: 96, final_score: 86.4 }
    });
    await prisma.impactScore.create({
        data: { organization_id: ngo2.id, scale_score: 55, outcome_score: 65, efficiency_score: 60, geographic_need_score: 85, transparency_score: 45, final_score: 62.0 }
    });
    await prisma.impactScore.create({
        data: { organization_id: ngo3.id, scale_score: 95, outcome_score: 98, efficiency_score: 92, geographic_need_score: 99, transparency_score: 90, final_score: 94.8 }
    });

    // Risk Flags
    await prisma.riskFlag.create({
        data: {
            organization_id: ngo2.id,
            risk_type: 'MISSING_COMPLIANCE_PROOFS',
            risk_level: 'HIGH',
            description: 'Organization has failed to upload mandatory FCRA renewal documents for the past 2 cycles.'
        }
    });

    // Government Audit Flags
    await prisma.governmentAuditFlag.create({
        data: {
            organization_id: corporate1.id,
            flagged_by_user_id: govUser.id,
            reason: 'Anomaly detected in CSR disbursement timeline against MCA guidelines.',
            severity: 'HIGH',
            status: 'OPEN'
        }
    });

    console.log('✓ Legacy demo data seeded');

    // ── Summary ──────────────────────────────────────────────
    console.log('\n═══ SEED SUMMARY ═══');
    console.log(`Users:              ${await prisma.user.count()}`);
    console.log(`HEIs:               ${await prisma.hEI.count()}`);
    console.log(`Organizations:      ${await prisma.organization.count()}`);
    console.log(`StudentProfiles:    ${await prisma.studentProfile.count()}`);
    console.log(`Challenges:         ${await prisma.challenge.count()}`);
    console.log(`Proposals:          ${await prisma.challengeProposal.count()}`);
    console.log(`ProjectTeams:       ${await prisma.projectTeam.count()}`);
    console.log(`TeamMembers:        ${await prisma.teamMember.count()}`);
    console.log(`Milestones:         ${await prisma.milestone.count()}`);
    console.log(`StudentCredentials: ${await prisma.studentCredential.count()}`);
    console.log(`GeoImpactSummary:   ${await prisma.geoImpactSummary.count()}`);
    console.log(`Projects:           ${await prisma.project.count()}`);
    console.log(`SDGs:               ${await prisma.sDG.count()}`);
    console.log('═══════════════════\n');
    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
