import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Project, ImpactScore } from '@/data/mockData';
import { SDG_INFO } from '@/data/mockData';


interface ReportData {
    title: string;
    organizationName: string;
    date: string;
    summaryMetrics: { label: string; value: string | number }[];
    tableData: { head: string[]; body: (string | number)[][] };
}

/**
 * SDG Nexus — PDF Report Generator
 * Generates beautiful, board-ready executive reports client-side.
 */
export const generateExecutiveReport = (data: ReportData) => {
    // 1. Initialize Document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Outer Official Border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(margin - 5, margin - 5, pageWidth - (margin * 2) + 10, pageHeight - (margin * 2) + 10);

    // 2. Add Formal Letterhead
    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('SDG NEXUS PLATFORM', pageWidth / 2, margin + 10, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    // Subtle separator line
    doc.line(margin + 20, margin + 15, pageWidth - margin - 20, margin + 15);

    doc.text('OFFICIAL IMPACT & COMPLIANCE REPORT', pageWidth / 2, margin + 22, { align: 'center' });
    doc.text('Generated via Automated Intelligence Node', pageWidth / 2, margin + 27, { align: 'center' });

    // 3. Document Title & Metadata fields
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text(data.title.toUpperCase(), margin, margin + 45);

    doc.setFontSize(11);
    doc.setFont('times', 'normal');

    // Grid for metadata
    doc.text(`ISSUED TO:`, margin, margin + 55);
    doc.setFont('times', 'bold');
    doc.text(data.organizationName.toUpperCase(), margin + 30, margin + 55);

    doc.setFont('times', 'normal');
    doc.text(`DATE OF ISSUE:`, pageWidth / 2 + 10, margin + 55);
    doc.setFont('times', 'bold');
    doc.text(data.date, pageWidth / 2 + 45, margin + 55);

    doc.setFont('times', 'normal');
    doc.text(`REFERENCE NO:`, margin, margin + 62);
    const refNo = `SDG-NX-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    doc.setFont('times', 'bold');
    doc.text(refNo, margin + 35, margin + 62);

    doc.setDrawColor(150, 150, 150);
    doc.line(margin, margin + 70, pageWidth - margin, margin + 70);

    // 4. Executive Summary Metrics (Grid Layout)
    let yPos = margin + 85;
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('1. EXECUTIVE SUMMARY & ATTESTATION', margin, yPos);

    yPos += 10;

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const formalText = `This document serves as the official record of impact operations and compliance metrics for ${data.organizationName}. The data contained herein is dynamically verified by the SDG Nexus ledger system.`;
    const splitText = doc.splitTextToSize(formalText, pageWidth - (margin * 2));
    doc.text(splitText, margin, yPos);

    yPos += 15;

    const boxWidth = (pageWidth - (margin * 2) - 10) / 2;
    data.summaryMetrics.forEach((metric, index) => {
        const xOffset = index % 2 === 0 ? margin : margin + boxWidth + 10;
        const currentY = yPos + (Math.floor(index / 2) * 20);

        // Box
        doc.setFillColor(250, 250, 250);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.rect(xOffset, currentY, boxWidth, 15, 'FD');

        // Metric Label
        doc.setFontSize(8);
        doc.setFont('times', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text(metric.label.toUpperCase(), xOffset + 5, currentY + 6);

        // Metric Value
        doc.setFontSize(11);
        doc.setFont('times', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(metric.value.toString(), xOffset + 5, currentY + 12);
    });

    yPos += (Math.ceil(data.summaryMetrics.length / 2) * 20) + 15;

    // 5. Detailed Data Table (AutoTable)
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('2. DETAILED METRICS SCHEDULE', margin, yPos);
    yPos += 5;

    autoTable(doc, {
        startY: yPos,
        head: [data.tableData.head],
        body: data.tableData.body,
        theme: 'plain', // Very formal, no stripes
        headStyles: {
            fillColor: [240, 240, 240], // Light grey header
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 0.5,
            lineColor: [0, 0, 0],
            font: 'times'
        },
        bodyStyles: {
            textColor: [0, 0, 0],
            lineWidth: 0.1,
            lineColor: [100, 100, 100],
            font: 'times'
        },
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 9,
            cellPadding: 4
        }
    });

    // 6. Signature Block
    const finalY = (doc as any).lastAutoTable.finalY + 30;

    if (finalY < pageHeight - 50) {
        doc.setDrawColor(0, 0, 0);
        doc.line(pageWidth - margin - 50, finalY, pageWidth - margin, finalY);
        doc.setFontSize(9);
        doc.setFont('times', 'italic');
        doc.text('AUTHORIZED SIGNATORY', pageWidth - margin - 45, finalY + 5);
        doc.text('SDG NEXUS COMPLIANCE BOARD', pageWidth - margin - 50, finalY + 10);
    }

    // 7. Footer (Page Numbers)
    const pageCount = doc.internal.pages.length - 1; // -1 because jspdf includes an empty page placeholder
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('times', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(
            `Page ${i} of ${pageCount} — Official Confidential Record — Ref: ${refNo}`,
            pageWidth / 2,
            pageHeight - margin + 8,
            { align: 'center' }
        );
    }

    // 8. Save Document
    const filename = `${data.organizationName.replace(/\s+/g, '_')}_Official_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
};


export interface ImpactReportData {
    organizationName: string;
    role: string;
    projects: Project[];
    impactScore?: ImpactScore;
    totalBeneficiaries: number;
    totalBudget: number;
    totalSpent: number;
}

/**
 * ─── Impact Report Generator (Light Theme) ───
 * Generates a professional PDF assessment matching the ImpactBridge brand.
 */
export function generateImpactReport(data: ImpactReportData): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand Colors (Typed as Tuples for jsPDF)
    const primaryBlue: [number, number, number] = [59, 130, 246]; // #3b82f6
    const darkSlate: [number, number, number] = [15, 23, 42]; // #0f172a
    const lightSlate: [number, number, number] = [100, 116, 139]; // #64748b
    const muttedSlate: [number, number, number] = [148, 163, 184]; // #94a3b8
    const surfaceGray: [number, number, number] = [241, 245, 249]; // #f1f5f9

    // Header (Light Surface with Blue Accents)
    doc.setFillColor(...surfaceGray);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setDrawColor(...primaryBlue);
    doc.setLineWidth(1.5);
    doc.line(15, 40, pageWidth - 15, 40);

    doc.setTextColor(...primaryBlue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('SDG Nexus', 15, 22);

    doc.setFontSize(10);
    doc.setTextColor(...lightSlate);
    doc.setFont('helvetica', 'normal');
    doc.text('Impact Assessment & SDG Intelligence Report', 15, 30);
    doc.setFontSize(8);
    doc.text(`ID: NEX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 15, 36);

    // Org Info
    doc.setTextColor(...darkSlate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(data.organizationName, pageWidth - 15, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(...primaryBlue);
    doc.text(data.role.toUpperCase() + ' PORTFOLIO', pageWidth - 15, 30, { align: 'right' });
    doc.setFontSize(8);
    doc.setTextColor(...muttedSlate);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 15, 36, { align: 'right' });

    // Summary Section
    let y = 60;
    doc.setTextColor(...darkSlate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Executive Impact Summary', 15, y);
    y += 10;

    const summaryData = [
        ['Total Projects Managed', data.projects.length.toString()],
        ['Total Lives Impacted', data.totalBeneficiaries.toLocaleString()],
        ['Total Capital Allocated', `₹${(data.totalBudget / 100000).toFixed(1)} Lakhs`],
        ['Total Capital Utilized', `₹${(data.totalSpent / 100000).toFixed(1)} Lakhs`],
        ['Utilization Efficiency', `${data.totalBudget > 0 ? ((data.totalSpent / data.totalBudget) * 100).toFixed(1) : 0}%`],
        ['Portfolio Health', data.projects.every(p => p.status === 'completed' || p.status === 'active') ? 'OPTIMAL' : 'REQUIRES ATTENTION'],
    ];

    autoTable(doc, {
        startY: y,
        head: [['Strategic Metric', 'Certified Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { textColor: darkSlate, fontSize: 10 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        styles: { cellPadding: 5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 100 } },
        margin: { left: 15, right: 15 },
    });

    // Impact Score Breakdown
    y = (doc as any).lastAutoTable.finalY + 18;
    if (data.impactScore) {
        if (y > 240) { doc.addPage(); y = 20; }

        doc.setTextColor(...darkSlate);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Verified Impact Performance', 15, y);
        y += 10;

        const scoreData = [
            ['Overall Final Score', `${data.impactScore.overall_score} / 1000`],
            ['Beneficiary Reach Scale', `${data.impactScore.beneficiary_scale}%`],
            ['Outcome Verification', `${data.impactScore.outcome_score}%`],
            ['Geographic Need Index', `${data.impactScore.geographic_need}%`],
            ['Capital Deployment Efficiency', `${data.impactScore.funding_efficiency}%`],
            ['Data Integrity & Transparency', `${data.impactScore.verification_score}%`],
        ];

        autoTable(doc, {
            startY: y,
            head: [['Performance Component', 'Assessment Score']],
            body: scoreData,
            theme: 'grid',
            headStyles: { fillColor: darkSlate, textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { textColor: darkSlate, fontSize: 9 },
            styles: { cellPadding: 5 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 110 } },
            margin: { left: 15, right: 15 },
        });
    }

    // SDG Breakdown
    y = (doc as any).lastAutoTable.finalY + 18;
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setTextColor(...darkSlate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SDG Multi-Stakeholder Alignment', 15, y);
    y += 10;

    const allSDGs = new Set<number>();
    data.projects.forEach(p => p.sdg_tags.forEach(s => allSDGs.add(s)));
    const sdgRows = Array.from(allSDGs).sort((a, b) => a - b).map(sdg => {
        const info = SDG_INFO.find(s => s.id === sdg);
        const projectCount = data.projects.filter(p => (p.sdg_tags as number[]).includes(sdg)).length;
        return [`SDG ${sdg}: ${info?.name || ''}`, projectCount.toString(), `${((projectCount / data.projects.length) * 100).toFixed(0)}%`];
    });

    autoTable(doc, {
        startY: y,
        head: [['Sustainable Development Goal', 'Project Count', 'Portfolio Weight']],
        body: sdgRows,
        theme: 'striped',
        headStyles: { fillColor: primaryBlue, textColor: [255, 255, 255], fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 110 } },
        margin: { left: 15, right: 15 },
    });

    // Project Details (Large Table)
    doc.addPage();
    y = 20;

    doc.setTextColor(...primaryBlue);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Detailed Project Inventory', 15, y);
    y += 12;

    const projectRows = data.projects.map(p => [
        p.title,
        p.sdg_tags.map(s => `SDG ${s}`).join(', '),
        p.beneficiary_count.toLocaleString(),
        `₹${(p.budget / 100000).toFixed(1)}L`,
        `${p.budget > 0 ? ((p.spent / p.budget) * 100).toFixed(0) : 0}%`,
        p.status.toUpperCase(),
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Project Name', 'Target SDGs', 'Reach', 'Budget', 'Utilization', 'Status']],
        body: projectRows,
        theme: 'grid',
        headStyles: { fillColor: darkSlate, textColor: [255, 255, 255], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
        margin: { left: 15, right: 15 },
    });

    // Footer & Certification
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...muttedSlate);

        // Horizontal footer line
        doc.setDrawColor(...surfaceGray);
        doc.setLineWidth(0.5);
        doc.line(15, doc.internal.pageSize.getHeight() - 15, pageWidth - 15, doc.internal.pageSize.getHeight() - 15);

        doc.text(`SDG Nexus IMPACT_CERTIFICATE_V1 • Page ${i} of ${pageCount}`, 15, doc.internal.pageSize.getHeight() - 10);
        doc.text('© 2026 SDG Nexus Blockchain Ledger - Verified Immutable Record', pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }

    doc.save(`Impact_Report_${data.organizationName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
}
