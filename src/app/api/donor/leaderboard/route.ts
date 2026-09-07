import { NextResponse } from 'next/server';

export async function GET() {
    const data = [
        {
            id: '1',
            rank: 1,
            name: 'Priya Sharma',
            category: 'Most Diverse SDG Portfolio',
            metric: '14 SDGs Funded',
            trend: 'up',
            avatarSeed: 'priya123',
            isSelf: true
        },
        {
            id: '2',
            rank: 2,
            name: 'Rahul Desai',
            category: 'Most Diverse SDG Portfolio',
            metric: '12 SDGs Funded',
            trend: 'neutral',
            avatarSeed: 'rahul'
        },
        {
            id: '3',
            rank: 1,
            name: 'Sanjay Gupta',
            category: 'Most Active Volunteer',
            metric: '45 Hours Logged',
            trend: 'up',
            avatarSeed: 'sanjay'
        },
        {
            id: '4',
            rank: 1,
            name: 'Vikram Patel',
            category: 'Longest Giving Streak',
            metric: '24 Months',
            trend: 'up',
            avatarSeed: 'vikram'
        },
        {
            id: '5',
            rank: 5,
            name: 'Priya Sharma',
            category: 'Longest Giving Streak',
            metric: '5 Months',
            trend: 'up',
            avatarSeed: 'priya123',
            isSelf: true
        }
    ];

    return NextResponse.json({ success: true, data });
}
