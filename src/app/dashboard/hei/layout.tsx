'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import NotificationBell from '@/components/ui/NotificationBell';
import {
    Inbox,
    Users,
    FileText,
    Target,
    Award,
    Sparkles,
    Building2,
    GraduationCap,
} from 'lucide-react';

const HEI_TABS = [
    { label: 'Challenge Inbox', href: '/dashboard/hei', icon: Inbox },
    { label: 'Team Formation', href: '/dashboard/hei/team-formation', icon: Users },
    { label: 'Proposal Builder', href: '/dashboard/hei/proposals', icon: FileText, badge: 'P8' },
    { label: 'Milestone Tracker', href: '/dashboard/hei/milestones', icon: Target, badge: 'P8' },
    { label: 'Student Credentials', href: '/dashboard/hei/credentials', icon: Award, badge: 'NEP 2020' },
];

export default function HEILayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            {/* Top Bar with Institution Context and Notification Bell */}
            <header className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                {user?.organization_name || 'National Institute of Technology Jamshedpur'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                UGC & NAAC A Accredited
                            </span>
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
                            Triple-Helix University R&D Cell
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Faculty profile chip */}
                    <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                            {user?.name ? user.name.charAt(0) : 'F'}
                        </div>
                        <div>
                            <span className="font-semibold text-slate-800 block leading-tight">
                                {user?.name || 'Prof. Anjali Sharma'}
                            </span>
                            <span className="text-[10px] text-slate-500 block leading-tight">
                                {user?.email || 'faculty@nitjsr.ac.in'}
                            </span>
                        </div>
                    </div>

                    {/* Notification Bell Component */}
                    <NotificationBell />
                </div>
            </header>

            {/* Quick sub-nav tabs */}
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/80 scrollbar-none">
                {HEI_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive =
                        tab.href === '/dashboard/hei'
                            ? pathname === '/dashboard/hei'
                            : pathname?.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span
                                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                        isActive ? 'bg-indigo-700/60 text-indigo-100' : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Content Area */}
            <main>{children}</main>
        </div>
    );
}
