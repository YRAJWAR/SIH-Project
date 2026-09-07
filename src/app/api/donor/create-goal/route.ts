import { NextResponse } from 'next/server';
import { donorDashboardService } from '@/services/donorDashboardService';

export async function POST(request: Request) {
    try {
        const donor_id = 'mock-donor-id-123';
        const body = await request.json();
        const { goal_type, target_value } = body;

        if (!goal_type || !target_value) {
            return NextResponse.json({ success: false, error: 'Missing target goal details.' }, { status: 400 });
        }

        const data = await donorDashboardService.createDonorGoal(donor_id, goal_type, target_value);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error creating donor goal:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create goal.' },
            { status: 500 }
        );
    }
}
