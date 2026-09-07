import { NextResponse } from 'next/server';
import { donorDashboardService } from '@/services/donorDashboardService';

export async function POST(request: Request) {
    try {
        const donor_id = 'mock-donor-id-123'; // Fixed mock ID as per existing donor logic
        const body = await request.json();
        const { opportunity_id } = body;

        if (!opportunity_id) {
            return NextResponse.json({ success: false, error: 'Missing opportunity ID.' }, { status: 400 });
        }

        const data = await donorDashboardService.applyForVolunteerOpportunity(donor_id, opportunity_id);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Error applying for volunteer opportunity:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to apply for volunteer opportunity.' },
            { status: 500 }
        );
    }
}
