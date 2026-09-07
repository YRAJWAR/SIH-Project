'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';

const NAV_ITEMS: Record<string, { label: string; href: string; icon: string }[]> = {
    ngo: [
        { label: 'Dashboard', href: '/dashboard/ngo', icon: '📊' },
        { label: 'Submit a Societal Challenge', href: '/dashboard/ngo/create-project', icon: '➕' },
        { label: 'Heatmap', href: '/dashboard/heatmap', icon: '🗺️' },
        { label: 'Activity Ledger', href: '/dashboard/ledger', icon: '📋' },
        { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: '🏆' },
        { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
        { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
    ],
    government: [
        { label: 'District Command Center', href: '/dashboard/government', icon: '🏛️' },
        { label: 'Heatmap', href: '/dashboard/heatmap', icon: '🗺️' },
        { label: 'Activity Ledger', href: '/dashboard/ledger', icon: '📋' },
        { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: '🏆' },
        { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
        { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
    ],
    corporate: [
        { label: 'Industry & Funding Partner Dashboard', href: '/dashboard/corporate', icon: '🏢' },
        { label: 'Heatmap', href: '/dashboard/heatmap', icon: '🗺️' },
        { label: 'Activity Ledger', href: '/dashboard/ledger', icon: '📋' },
        { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: '🏆' },
        { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
        { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
    ],
    donor: [
        { label: 'Dashboard', href: '/dashboard/donor', icon: '💝' },
        { label: 'Analytics', href: '/dashboard/donor/analytics', icon: '📊' },
        { label: 'Impact Map', href: '/dashboard/donor/heatmap', icon: '🗺️' },
        { label: 'Impact Feed', href: '/dashboard/donor/ledger', icon: '📋' },
        { label: 'Hall of Fame', href: '/dashboard/donor/leaderboard', icon: '🏆' },
        { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
    ],
    citizen: [
        { label: 'Submit Challenge', href: '/citizen/submit', icon: '📢' },
        { label: 'Track Challenge', href: '/track', icon: '🔍' },
        { label: 'Impact Heatmap', href: '/dashboard/heatmap', icon: '🗺️' },
        { label: 'Activity Ledger', href: '/dashboard/ledger', icon: '📋' },
    ],
    hei: [
        { label: 'Challenge Inbox', href: '/dashboard/hei', icon: '📥' },
        { label: 'Team Formation', href: '/dashboard/hei/team-formation', icon: '👥' },
        { label: 'Proposal Builder', href: '/dashboard/hei/proposals', icon: '📝' },
        { label: 'Milestone Tracker', href: '/dashboard/hei/milestones', icon: '🎯' },
        { label: 'Student Credentials', href: '/dashboard/hei/credentials', icon: '🎓' },
        { label: 'Impact Heatmap', href: '/dashboard/heatmap', icon: '🗺️' },
        { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
    ],
};

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const role = user?.role || 'ngo';
    const items = NAV_ITEMS[role] || NAV_ITEMS.ngo;

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen w-[260px] flex flex-col z-50 bg-white border-r border-slate-200 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Logo */}
                <div className="p-6 pb-4 flex items-center justify-between">
                    <Link href="/" onClick={onClose} className="flex items-center gap-3 no-underline">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                            style={{ background: '#0f172a', padding: 2 }}>
                            <Image src="/logo.png" alt="SDG Nexus" width={36} height={36}
                                style={{ objectFit: 'contain' }} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold" style={{ color: '#0f172a' }}>SDG Nexus</h1>
                            <p className="text-[10px] tracking-wider uppercase" style={{ color: '#94a3b8' }}>Impact Intelligence</p>
                        </div>
                    </Link>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            ✕
                        </button>
                    )}
                </div>

            {/* Role Badge */}
            <div className="mx-4 mb-5 px-3 py-2 rounded-lg text-xs font-semibold text-center"
                style={{
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #dcfce7',
                }}>
                {role.toUpperCase()} DASHBOARD
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all no-underline ${role === 'donor' ? 'hidden' : ''}`}
                            style={{
                                background: isActive ? '#f0fdf4' : 'transparent',
                                color: isActive ? '#15803d' : '#64748b',
                                fontWeight: isActive ? 600 : 400,
                                borderLeft: isActive ? '3px solid #22c55e' : '3px solid transparent',
                            }}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                <div className="flex items-center gap-3 mb-4 relative">
                    <button className="relative p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center shrink-0">
                        <span className="text-lg">🔔</span>
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">3</span>
                    </button>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-200 overflow-hidden shrink-0 shadow-inner">
                        {user ? (
                            <img
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email || user.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                alt="Profile DP"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-bold text-slate-500">?</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-slate-900">{user?.name}</p>
                        <p className="text-[11px] truncate text-slate-500">{user?.organization_name}</p>
                    </div>
                </div>
                <button onClick={() => { onClose?.(); logout(); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                    style={{
                        color: '#ef4444',
                        background: '#fef2f2',
                        border: '1.5px solid #fecaca',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#fee2e2';
                        e.currentTarget.style.borderColor = '#fca5a5';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,68,68,0.15)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fecaca';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <span>🚪</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    </>
    );
}
