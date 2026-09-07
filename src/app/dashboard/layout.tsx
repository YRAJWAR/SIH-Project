'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                <div className="text-center">
                    <Image src="/logo.png" alt="SDG Nexus" width={48} height={48}
                        className="rounded-xl mx-auto mb-4 animate-pulse" style={{ objectFit: 'contain' }} />
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Loading SDG Nexus...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
            {/* Mobile Top Header Bar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 shadow-xs">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <Link href="/" className="flex items-center gap-2 no-underline">
                        <div className="w-7 h-7 rounded-lg bg-[#0f172a] p-1 flex items-center justify-center">
                            <Image src="/logo.png" alt="SDG Nexus" width={22} height={22} style={{ objectFit: 'contain' }} />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">SDG Nexus</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {user.role}
                    </span>
                </div>
            </header>

            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <main className="lg:ml-[260px] p-4 sm:p-6 min-h-screen pt-18 lg:pt-6">
                {children}
            </main>
        </div>
    );
}
