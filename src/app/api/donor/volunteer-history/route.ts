import { NextResponse } from 'next/server';

// Mock volunteer history data — rich & realistic
const MOCK_VOLUNTEER_HISTORY = [
    {
        id: 'va1',
        opportunity_id: 'vo_past1',
        opportunity_title: 'Coastal Cleanup Drive — Versova Beach',
        ngo_name: 'BlueOcean NGO',
        ngo_id: 'org4',
        date: '2025-01-12',
        hours_contributed: 5,
        location: 'Versova Beach, Mumbai',
        status: 'COMPLETED',
        certificate_id: 'CERT-BO-2025-0112',
        sdg_tags: [14, 12, 13],
        impact_statement: 'Helped remove 480 kg of plastic waste from Versova coastline, contributing to marine ecosystem restoration.',
        feedback_submitted: false,
        ngo_rating: null,
        feedback_text: null,
    },
    {
        id: 'va2',
        opportunity_id: 'vo_past2',
        opportunity_title: 'Digital Literacy Training for Rural Youth',
        ngo_name: 'RuralTech Connect',
        ngo_id: 'ngo8',
        date: '2024-11-08',
        hours_contributed: 6,
        location: 'Coimbatore, Tamil Nadu',
        status: 'COMPLETED',
        certificate_id: 'CERT-RT-2024-1108',
        sdg_tags: [4, 8, 9],
        impact_statement: 'Trained 35 rural youth in basic coding and internet skills as part of the Digital India initiative.',
        feedback_submitted: true,
        ngo_rating: 5,
        feedback_text: 'Exceptional organization. The team was professional, the sessions were well-structured, and the impact was immediately visible. Highly authentic work.',
    },
    {
        id: 'va3',
        opportunity_id: 'vo_past3',
        opportunity_title: 'Tree Plantation Drive — Aravalli Greening',
        ngo_name: 'EcoIndia Trust',
        ngo_id: 'org2',
        date: '2024-09-22',
        hours_contributed: 4,
        location: 'Gurgaon, Haryana',
        status: 'COMPLETED',
        certificate_id: 'CERT-EI-2024-0922',
        sdg_tags: [13, 15, 11],
        impact_statement: 'Planted 120 native saplings in the Aravalli biodiversity zone, contributing to urban forest restoration.',
        feedback_submitted: true,
        ngo_rating: 4,
        feedback_text: 'Great experience. Well-organized event with clear instructions. Would have loved more follow-up on how the saplings are doing after a few months.',
    },
];

export async function GET() {
    try {
        // Simulate a slight delay
        await new Promise(r => setTimeout(r, 300));

        return NextResponse.json({
            success: true,
            data: MOCK_VOLUNTEER_HISTORY,
            total_hours: MOCK_VOLUNTEER_HISTORY.reduce((s, v) => s + v.hours_contributed, 0),
            completed_count: MOCK_VOLUNTEER_HISTORY.filter(v => v.status === 'COMPLETED').length,
        });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to load volunteer history.' }, { status: 500 });
    }
}
