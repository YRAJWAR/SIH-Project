import { NextResponse } from 'next/server';

export async function GET() {
    const data = [
        {
            id: '1',
            date: '2026-03-10T10:00:00Z',
            project: 'Rural Education Initiative',
            ngo: 'Teach for India',
            type: 'milestone',
            amount: 5000,
            status: 'Project Completed',
            description: 'The school building renovation is officially finished! 200 students now have safe, well-lit classrooms.',
            image: '🏫',
            hash: '0xabc123...',
        },
        {
            id: '2',
            date: '2026-02-15T14:30:00Z',
            project: 'Clean Water for Maharashtra',
            ngo: 'WaterAid India',
            type: 'update',
            amount: 2500,
            status: 'Milestone 1 Reached',
            description: 'The first borewell has been successfully drilled. Water testing is currently underway.',
            image: '💧',
            hash: '0xdef456...',
        },
        {
            id: '3',
            date: '2026-01-05T09:15:00Z',
            project: 'Women Empowerment Workshops',
            ngo: 'SEWA Bharat',
            type: 'disbursement',
            amount: null,
            status: 'Funds Disbursed',
            description: 'Your contribution of ₹10,000 has been transferred to the NGO and verified on the blockchain.',
            image: '💸',
            hash: '0xghi789...',
        }
    ];

    return NextResponse.json({ success: true, data });
}
