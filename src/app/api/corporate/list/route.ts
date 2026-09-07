import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Fallback CSR corporate partners for Jharkhand in case of DB disconnect or demo mode
const FALLBACK_CSR_LIST = [
    {
        id: 'corp-tata-steel-csr',
        name: 'Tata Steel CSR Foundation',
        registration_number: 'CORP-JH-TATA-2001',
        state: 'Jharkhand',
        district: 'East Singhbhum',
        industry: 'Mining & Steel',
    },
    {
        id: 'corp-sail-csr',
        name: 'SAIL CSR Wing',
        registration_number: 'CORP-JH-SAIL-2003',
        state: 'Jharkhand',
        district: 'Bokaro',
        industry: 'Steel & Manufacturing',
    },
    {
        id: 'corp-ccl-csr',
        name: 'Central Coalfields Limited (CCL) CSR',
        registration_number: 'CORP-JH-CCL-1975',
        state: 'Jharkhand',
        district: 'Ranchi',
        industry: 'Energy & Mining',
    },
    {
        id: 'corp-vedanta-csr',
        name: 'Vedanta Foundation Jharkhand',
        registration_number: 'CORP-IND-VED-2004',
        state: 'Jharkhand',
        district: 'Ranchi',
        industry: 'Natural Resources',
    },
    {
        id: 'corp-techcorp',
        name: 'TechCorp India Pvt. Ltd.',
        registration_number: 'CORP-IND-TCI-1999',
        state: 'Delhi',
        district: 'New Delhi',
        industry: 'Information Technology',
    },
    {
        id: 'corp-global-finance',
        name: 'Global Finance & Analytics Ltd.',
        registration_number: 'CORP-IND-GFA-2005',
        state: 'Maharashtra',
        district: 'Mumbai',
        industry: 'Banking & Financial Services',
    },
];

export async function GET() {
    try {
        let corporateList: any[] = [];

        try {
            const orgs = await prisma.organization.findMany({
                where: { type: 'CORPORATE' },
                select: {
                    id: true,
                    name: true,
                    registration_number: true,
                    state: true,
                    district: true,
                },
                orderBy: { name: 'asc' },
            });

            if (orgs && orgs.length > 0) {
                corporateList = orgs.map((org) => ({
                    id: org.id,
                    name: org.name,
                    registration_number: org.registration_number,
                    state: org.state,
                    district: org.district,
                    industry: org.name.includes('Steel')
                        ? 'Steel & Heavy Industry'
                        : org.name.includes('Coal')
                        ? 'Energy & Mining'
                        : org.name.includes('Tech')
                        ? 'Information Technology'
                        : 'Corporate Sector',
                }));
            }
        } catch (dbErr) {
            console.warn('Prisma query failed in /api/corporate/list, using fallback list:', dbErr);
        }

        // If DB returned nothing or failed, use rich fallback
        if (corporateList.length === 0) {
            corporateList = FALLBACK_CSR_LIST;
        }

        return NextResponse.json({
            success: true,
            data: corporateList,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error in /api/corporate/list:', error);
        return NextResponse.json(
            {
                success: true,
                data: FALLBACK_CSR_LIST,
                error: error.message || 'Failed to retrieve corporate list',
                timestamp: new Date().toISOString(),
            },
            { status: 200 }
        );
    }
}
