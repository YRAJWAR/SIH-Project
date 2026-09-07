import jsPDF from 'jspdf';
import { SDG_INFO } from '@/data/mockData';

export interface CredentialPDFData {
    credentialId: string;
    studentName: string;
    branch: string;
    year: number | string;
    universityName: string;
    challengeTitle: string;
    district: string;
    sdgTags: number[];
    durationWeeks: number;
    hoursContributed: number;
    creditPoints: number;
    facultyName: string;
    submitterName?: string;
    beneficiariesCount?: number;
    challengeStatus?: string;
    hashValue: string;
    issuedAt: string | Date;
    appUrl?: string;
}

/**
 * Builds a professional NEP 2020 Student Achievement Certificate PDF
 * matching Government of Jharkhand & SIH26043 specifications.
 */
export function buildStudentCredentialPDF(data: CredentialPDFData): jsPDF {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    const issuedDateStr = typeof data.issuedAt === 'string'
        ? new Date(data.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
        : data.issuedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const baseUrl = data.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://sdgnexus.jharkhand.gov.in';
    const verifyUrl = `${baseUrl}/verify/credential/${data.credentialId}`;

    // 1. Background styling
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative outer double border (Navy & Gold)
    doc.setDrawColor(30, 58, 138); // Navy
    doc.setLineWidth(1.2);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    doc.setDrawColor(217, 119, 6); // Gold / Amber
    doc.setLineWidth(0.4);
    doc.rect(margin + 2.5, margin + 2.5, pageWidth - (margin + 2.5) * 2, pageHeight - (margin + 2.5) * 2);

    // Corner ornaments
    const drawCorner = (x: number, y: number, angle: number) => {
        doc.setFillColor(217, 119, 6);
        doc.circle(x, y, 1.5, 'F');
    };
    drawCorner(margin + 2.5, margin + 2.5, 0);
    drawCorner(pageWidth - (margin + 2.5), margin + 2.5, 0);
    drawCorner(margin + 2.5, pageHeight - (margin + 2.5), 0);
    drawCorner(pageWidth - (margin + 2.5), pageHeight - (margin + 2.5), 0);

    // 2. Top Header Banner
    doc.setFillColor(30, 58, 138); // Deep Royal Blue
    doc.rect(margin + 3, margin + 3, pageWidth - (margin + 3) * 2, 26, 'F');

    // Jharkhand Govt Seal Placeholder (Left emblem)
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 16, margin + 16, 9.5, 'F');
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.6);
    doc.circle(margin + 16, margin + 16, 9.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text('GOJ', margin + 16, margin + 14.5, { align: 'center' });
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text('JHARKHAND', margin + 16, margin + 18, { align: 'center' });

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('SDG NEXUS — GOVERNMENT OF JHARKHAND', margin + 32, margin + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(224, 231, 255);
    doc.text('State Collaborative Innovation Mission • Higher Education Department', margin + 32, margin + 18.5);
    doc.text('Smart India Hackathon 2026 • Problem Statement SIH26043', margin + 32, margin + 23);

    // 3. Certificate Title
    let y = margin + 37;
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text('NEP 2020 Student Achievement Certificate', pageWidth / 2, y, { align: 'center' });

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('National Education Policy 2020 • Community Engagement & Experiential Learning Framework', pageWidth / 2, y, { align: 'center' });

    // 4. Certifies That
    y += 10;
    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('This is to certify that', pageWidth / 2, y, { align: 'center' });

    // Student Name
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(data.studentName.toUpperCase(), pageWidth / 2, y, { align: 'center' });

    // Academic details
    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    const branchYearText = `${data.branch} • Year ${data.year}`;
    doc.text(branchYearText, pageWidth / 2, y, { align: 'center' });

    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(data.universityName, pageWidth / 2, y, { align: 'center' });

    // 5. Societal Challenge Resolution Description
    y += 8;
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text('has successfully contributed to the resolution of a documented societal challenge:', pageWidth / 2, y, { align: 'center' });

    // Challenge Box
    y += 4;
    const boxX = margin + 8;
    const boxW = pageWidth - (margin + 8) * 2;
    const boxH = 46;

    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'FD');

    let boxY = y + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const splitTitle = doc.splitTextToSize(`Challenge: ${data.challengeTitle}`, boxW - 12);
    doc.text(splitTitle, boxX + 6, boxY);
    boxY += (splitTitle.length * 4.5) + 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`District: ${data.district}, Jharkhand`, boxX + 6, boxY);

    // Format SDGs
    const sdgNames = data.sdgTags.map((tag) => {
        const found = SDG_INFO.find((s) => s.id === tag);
        return `SDG ${tag}${found ? ` (${found.name})` : ''}`;
    }).join(' • ');
    boxY += 4.5;
    doc.text(`SDGs Addressed: ${sdgNames}`, boxX + 6, boxY);

    // Key metrics grid inside box
    boxY += 5.5;
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.roundedRect(boxX + 5, boxY, boxW - 10, 16, 1.5, 1.5, 'F');

    const colW = (boxW - 10) / 3;
    const metricY = boxY + 5;

    // Col 1: Duration
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text(`${data.durationWeeks} Weeks`, boxX + 5 + colW * 0.5, metricY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('PROJECT DURATION', boxX + 5 + colW * 0.5, metricY + 4.5, { align: 'center' });

    // Col 2: Field Hours
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text(`${data.hoursContributed} Hours`, boxX + 5 + colW * 1.5, metricY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('FIELD CONTRIBUTION', boxX + 5 + colW * 1.5, metricY + 4.5, { align: 'center' });

    // Col 3: Academic Credits
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`${data.creditPoints} Credits`, boxX + 5 + colW * 2.5, metricY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('NEP 2020 ACCREDITED', boxX + 5 + colW * 2.5, metricY + 4.5, { align: 'center' });

    // 6. Stakeholder & Impact Summary Section
    y += boxH + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('STAKEHOLDER ATTESTATION & CITIZEN IMPACT', boxX, y);

    y += 3;
    const attBoxW = (boxW - 6) / 2;
    const attBoxH = 22;

    // Left sub-box: Stakeholders
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(boxX, y, attBoxW, attBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Faculty Mentor:', boxX + 4, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(data.facultyName, boxX + 4, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Challenge Submitter:', boxX + 4, y + 14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(data.submitterName || 'Community Member (Panchayat Node)', boxX + 4, y + 18);

    // Right sub-box: Impact Summary
    const rightBoxX = boxX + attBoxW + 6;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(rightBoxX, y, attBoxW, attBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Direct Beneficiaries Reached:', rightBoxX + 4, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(data.beneficiariesCount ? `${data.beneficiariesCount.toLocaleString('en-IN')} Citizens` : '15,000+ Citizens Documented', rightBoxX + 4, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Challenge Implementation Status:', rightBoxX + 4, y + 14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(data.challengeStatus || 'DEPLOYED & VALIDATED', rightBoxX + 4, y + 18);

    // 7. Cryptographic Verification & Tamper-Evident Footer Box
    y += attBoxH + 5;
    const cryptoBoxH = 34;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(boxX, y, boxW, cryptoBoxH, 2, 2, 'FD');

    let cY = y + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('CRYPTOGRAPHIC IMMUTABILITY ATTESTATION', boxX + 5, cY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('This credential was sealed at the moment of issuance into the SDG Nexus ledger.', boxX + 5, cY + 3.8);

    cY += 8.5;
    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 58, 138);
    doc.text(`SHA-256: ${data.hashValue}`, boxX + 5, cY);

    cY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`Verify Online: ${verifyUrl}`, boxX + 5, cY);

    cY += 4.5;
    doc.text(`Issued On: ${issuedDateStr} • Platform: SDG Nexus | SIH26043 | Government of Jharkhand`, boxX + 5, cY);

    // QR Code Placeholder Box on Right of Crypto Box
    const qrSize = 22;
    const qrX = boxX + boxW - qrSize - 5;
    const qrY = y + 5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(qrX, qrY, qrSize, qrSize, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 58, 138);
    doc.text('SCAN QR', qrX + qrSize / 2, qrY + 6, { align: 'center' });

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.3);
    doc.rect(qrX + 3.5, qrY + 8, qrSize - 7, qrSize - 11.5);

    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('VERIFY', qrX + qrSize / 2, qrY + 14.5, { align: 'center' });
    doc.text('INTEGRITY', qrX + qrSize / 2, qrY + 17.5, { align: 'center' });

    // 8. Signatures Section
    y += cryptoBoxH + 11;
    const sigLineW = 55;
    const sigLeftX = boxX + 10;
    const sigRightX = boxX + boxW - sigLineW - 10;

    // Faculty Mentor Signature
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.4);
    doc.line(sigLeftX, y, sigLeftX + sigLineW, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.facultyName, sigLeftX + sigLineW / 2, y + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Faculty Mentor • Project Supervisor', sigLeftX + sigLineW / 2, y + 7.5, { align: 'center' });

    // State Mission / Academic Dean Signature
    doc.line(sigRightX, y, sigRightX + sigLineW, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('State Innovation Director', sigRightX + sigLineW / 2, y + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Government of Jharkhand • SIH 2026', sigRightX + sigLineW / 2, y + 7.5, { align: 'center' });

    return doc;
}
