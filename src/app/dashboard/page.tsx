'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardRedirect() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            const rolePaths: Record<string, string> = {
                ngo: '/dashboard/ngo',
                government: '/dashboard/government',
                gov: '/dashboard/government',
                corporate: '/dashboard/corporate',
                corp: '/dashboard/corporate',
                donor: '/dashboard/donor',
                hei: '/dashboard/hei',
                citizen: '/citizen/submit',
                student: '/dashboard/hei',
            };
            router.push(rolePaths[user.role] || '/dashboard/ngo');
        }
    }, [user, router]);

    return null;
}
