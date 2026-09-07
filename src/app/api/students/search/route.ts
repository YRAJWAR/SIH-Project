import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/server/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q')?.trim().toLowerCase() || '';
        const heiIdParam = searchParams.get('heiId')?.trim();

        // Optional authentication check
        try {
            const authHeader = request.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ') && !authHeader.includes('mock_jwt_')) {
                await authenticateRequest(request);
            }
        } catch {
            // Allow demo retrieval
        }

        // Query students with related user
        const whereClause: any = {};
        if (heiIdParam) {
            whereClause.user = { heiId: heiIdParam };
        }

        const studentProfiles = await prisma.studentProfile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        heiId: true,
                    },
                },
            },
            take: 25,
        });

        // In-memory filter for flexible query matching (name, branch, skills, year)
        const filtered = studentProfiles.filter((sp: any) => {
            if (!query) return true;
            const name = sp.user?.full_name?.toLowerCase() || '';
            const email = sp.user?.email?.toLowerCase() || '';
            const branch = sp.branch.toLowerCase();
            const year = sp.year.toString();
            const skills = sp.skills.map((s: string) => s.toLowerCase());

            return (
                name.includes(query) ||
                email.includes(query) ||
                branch.includes(query) ||
                year.includes(query) ||
                skills.some((s: string) => s.includes(query))
            );
        });

        // Fallback demo students if database has not yet been populated
        let results = filtered.map((sp: any) => ({
            id: sp.id,
            userId: sp.userId,
            name: sp.user?.full_name || 'Student Researcher',
            email: sp.user?.email || 'student@nitjsr.ac.in',
            branch: sp.branch,
            year: sp.year,
            skills: sp.skills.slice(0, 4),
            rating: sp.rating || 4.5,
            credits: sp.credits || 12,
        }));

        if (results.length === 0 && !query) {
            results = [
                {
                    id: 'std-arjun',
                    userId: 'u-arjun',
                    name: 'Arjun Mahato',
                    email: 'student@nitjsr.ac.in',
                    branch: 'Civil & Environmental Engineering',
                    year: 3,
                    skills: ['Water Quality Testing', 'Field Research', 'GIS Mapping', 'AutoCAD'],
                    rating: 4.8,
                    credits: 18,
                },
                {
                    id: 'std-sneha',
                    userId: 'u-sneha',
                    name: 'Sneha Kumari',
                    email: 'sneha@nitjsr.ac.in',
                    branch: 'Environmental Engineering',
                    year: 3,
                    skills: ['Water Analysis', 'Community Survey', 'Laboratory Protocols'],
                    rating: 4.6,
                    credits: 14,
                },
                {
                    id: 'std-vikash',
                    userId: 'u-vikash',
                    name: 'Vikash Tirkey',
                    email: 'vikash@nitjsr.ac.in',
                    branch: 'Civil Engineering',
                    year: 4,
                    skills: ['Structural Design', 'Rapid Prototyping', 'Cost Estimation'],
                    rating: 4.5,
                    credits: 22,
                },
                {
                    id: 'std-priya',
                    userId: 'u-priya',
                    name: 'Priya Munda',
                    email: 'priya.m@nitjsr.ac.in',
                    branch: 'Computer Science & Engineering',
                    year: 2,
                    skills: ['Python', 'IoT Sensors', 'Data Analytics', 'Mobile App'],
                    rating: 4.7,
                    credits: 10,
                },
            ];
        }

        return NextResponse.json({
            success: true,
            data: results,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Student search error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to search students',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
