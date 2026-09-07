import { NextRequest, NextResponse } from 'next/server';
import * as jobs from '@/server/jobs';

/**
 * SDG Nexus — Cron Job Trigger Endpoint
 * Transitioned from internal setInterval for enterprise scalability.
 * 
 * Usage: GET /api/cron?job=risk-scan&secret=YOUR_TOKEN
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const jobName = searchParams.get('job');
    const secret = searchParams.get('secret');

    // Basic security layer
    if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!jobName) {
        return NextResponse.json({ error: 'Missing job parameter' }, { status: 400 });
    }

    console.log(`[Cron] Manually triggering job: ${jobName}`);

    try {
        switch (jobName) {
            case 'risk-scan':
                await jobs.runRiskScan();
                break;
            case 'funding-gap-recalc':
                await jobs.runFundingGapRecalc();
                break;
            case 'score-recalc':
                await jobs.runScoreRecalc();
                break;
            case 'ngo-dashboard-precompute':
                await jobs.runNGOPcompute();
                break;
            default:
                return NextResponse.json({ error: `Unknown job: ${jobName}` }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `Job '${jobName}' executed successfully`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`[Cron] Job '${jobName}' failed:`, error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
