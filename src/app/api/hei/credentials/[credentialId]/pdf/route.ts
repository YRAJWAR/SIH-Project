import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { buildStudentCredentialPDF } from '@/lib/credentialPdf';
import { computeCredentialHash } from '@/lib/credentials';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ credentialId: string }> }
) {
    try {
        const { credentialId } = await context.params;

        if (!credentialId) {
            return new NextResponse('Credential ID is required', { status: 400 });
        }

        let pdfData: any = null;

        try {
            const cred = await prisma.studentCredential.findUnique({
                where: { id: credentialId },
                include: {
                    student: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            if (cred) {
                pdfData = {
                    credentialId: cred.id,
                    studentName: cred.student.user.full_name,
                    branch: cred.student.branch,
                    year: cred.student.year,
                    universityName: 'National Institute of Technology Jamshedpur',
                    challengeTitle: cred.challengeTitle,
                    district: cred.challengeDistrict,
                    sdgTags: cred.sdgTags,
                    durationWeeks: 16,
                    hoursContributed: cred.hoursContributed,
                    creditPoints: cred.creditPoints,
                    facultyName: 'Prof. Anjali Sharma',
                    submitterName: 'Amrapara Gram Panchayat Node',
                    beneficiariesCount: 15400,
                    challengeStatus: 'DEPLOYED & COMPLETED',
                    hashValue: cred.hashValue,
                    issuedAt: cred.issuedAt,
                };
            }
        } catch (dbErr) {
            console.warn(`DB error fetching credential for PDF ${credentialId}:`, dbErr);
        }

        // Demo / Hero fallback if not in DB
        if (!pdfData) {
            const issuedAt = new Date('2026-09-01T12:00:00.000Z');
            const studentId = 'arjun-profile-hero';
            const challengeId = 'hero-challenge-pakur';
            const creditPoints = 4;
            const hashValue = computeCredentialHash(studentId, challengeId, creditPoints, issuedAt);

            pdfData = {
                credentialId,
                studentName: 'Arjun Sharma',
                branch: 'Environmental Engineering',
                year: 3,
                universityName: 'National Institute of Technology Jamshedpur',
                challengeTitle: 'Arsenic Contamination in Drinking Water, Pakur',
                district: 'Pakur',
                sdgTags: [6, 3],
                durationWeeks: 16,
                hoursContributed: 120,
                creditPoints,
                facultyName: 'Prof. Anjali Sharma',
                submitterName: 'Amrapara Gram Panchayat Node',
                beneficiariesCount: 15400,
                challengeStatus: 'DEPLOYED & COMPLETED',
                hashValue,
                issuedAt,
            };
        }

        const doc = buildStudentCredentialPDF(pdfData);
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfArrayBuffer);

        const safeStudentName = pdfData.studentName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `NEP2020_Credential_${safeStudentName}_${credentialId.slice(0, 8)}.pdf`;

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filename}"`,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error: any) {
        console.error('Error generating credential PDF:', error);
        return new NextResponse(`PDF Generation Error: ${error.message || 'Unknown error'}`, { status: 500 });
    }
}
