import { NextResponse } from 'next/server';
import { corporateDashboardService } from '@/services/corporateDashboardService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = {
            sdg: searchParams.get('sdg') || undefined,
            state: searchParams.get('state') || undefined,
            district: searchParams.get('district') || undefined,
            min_impact: searchParams.get('min_impact') || undefined,
            min_transparency: searchParams.get('min_transparency') || undefined,
            risk: searchParams.get('risk') || undefined,
        };

        const data = await corporateDashboardService.getNGODiscovery(filters);

        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching NGO discovery:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch NGOs.' },
            { status: 500 }
        );
    }
}
