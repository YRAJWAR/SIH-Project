import { NextRequest, NextResponse } from 'next/server';
import { DeduplicationService } from '@/services/deduplicationService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, district } = body;

        if (!title || !district) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Title and district are required to check for duplicate challenges.',
                    timestamp: new Date().toISOString(),
                },
                { status: 400 }
            );
        }

        const result = await DeduplicationService.checkDuplicate({
            title: String(title),
            description: String(description || ''),
            district: String(district),
        });

        return NextResponse.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Deduplication check error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to check challenge for duplicates',
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
