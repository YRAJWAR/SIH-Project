import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { application_id, ngo_id, rating, feedback_text } = body;

        if (!application_id || !ngo_id || !rating || !feedback_text) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: application_id, ngo_id, rating, feedback_text' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5.' }, { status: 400 });
        }

        // In production: save to DB (VolunteerFeedback model)
        // Here we simulate a successful save
        await new Promise(r => setTimeout(r, 400));

        return NextResponse.json({
            success: true,
            message: 'Thank you for your feedback! Your review helps improve NGO accountability.',
            feedback_id: `fb_${Date.now()}`,
        });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to submit feedback.' }, { status: 500 });
    }
}
