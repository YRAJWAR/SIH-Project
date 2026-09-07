import { NextRequest, NextResponse } from 'next/server';

// Razorpay Order Creation API
// In production, use real Razorpay SDK with secret keys
// For demo/hackathon, we simulate order creation and use Razorpay TEST mode on the frontend

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, project_id, project_title, donor_name, donor_email } = body;

        if (!amount || amount < 1) {
            return NextResponse.json({ error: 'Amount must be at least ₹1' }, { status: 400 });
        }

        // In production, you would create a real Razorpay order here:
        // const Razorpay = require('razorpay');
        // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
        // const order = await instance.orders.create({ amount: amount * 100, currency: 'INR', receipt: `receipt_${Date.now()}` });

        // For hackathon demo, we simulate the order response
        const order = {
            id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount: amount * 100, // Razorpay expects paise
            currency: 'INR',
            receipt: `rcpt_${project_id}_${Date.now()}`,
            status: 'created',
            project_id,
            project_title,
            donor_name,
            donor_email,
        };

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error('Order creation failed:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
