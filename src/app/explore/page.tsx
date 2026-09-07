'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SDG_INFO } from '@/data/mockData';

interface PublicOrg {
    id: string;
    name: string;
    type: string;
    state: string;
    district: string | null;
    verification_status: string;
    project_count: number;
    total_beneficiaries: number;
    impact_score: number;
    sdg_focus: number[];
}

const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
});

function getScoreColor(score: number) {
    if (score >= 850) return '#10b981';
    if (score >= 700) return '#06b6d4';
    if (score >= 500) return '#f59e0b';
    return '#f43f5e';
}

export default function ExplorePage() {
    const [orgs, setOrgs] = useState<PublicOrg[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sdgFilter, setSdgFilter] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/public/organizations')
            .then(r => r.json())
            .then(json => {
                const payload = json.data || json;
                setOrgs(payload.organizations || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = orgs.filter(o => {
        const matchesSearch = !search ||
            o.name.toLowerCase().includes(search.toLowerCase()) ||
            o.state.toLowerCase().includes(search.toLowerCase());
        const matchesSDG = !sdgFilter || o.sdg_focus.includes(sdgFilter);
        return matchesSearch && matchesSDG;
    });

    return (
        <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4"
                style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 no-underline">
                        <Image src="/logo.png" alt="SDG Nexus" width={36} height={36}
                            className="rounded-xl" style={{ objectFit: 'contain' }} />
                        <span className="text-xl font-bold gradient-text">SDG Nexus</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/explore" className="text-sm font-medium text-cyan-400 no-underline">Explorer</Link>
                        <Link href="/login"
                            className="px-5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition no-underline"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-28 pb-10 px-6 text-center relative overflow-hidden">
                <div className="absolute top-10 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
                <motion.div {...fadeIn(0)} className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider"
                        style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#06b6d4' }}>
                        🔍 PUBLIC EXPLORER
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        <span className="text-white">Discover </span>
                        <span className="gradient-text-cyan">Verified Organizations</span>
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto mb-8">
                        Explore impact data, SDG alignment, and transparency scores for all verified organizations on the platform. No login required.
                    </p>
                </motion.div>
            </section>

            {/* Filters */}
            <section className="px-6 pb-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div {...fadeIn(0.1)} className="flex flex-wrap gap-3 mb-6">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or state..."
                            className="flex-1 min-w-64 px-4 py-3 rounded-xl text-sm outline-none"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                        <select
                            value={sdgFilter || ''}
                            onChange={e => setSdgFilter(e.target.value ? parseInt(e.target.value) : null)}
                            className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
                        >
                            <option value="">All SDGs</option>
                            {SDG_INFO.map(s => <option key={s.id} value={s.id}>SDG {s.id}: {s.name}</option>)}
                        </select>
                    </motion.div>

                    {/* Results count */}
                    <motion.p {...fadeIn(0.15)} className="text-xs text-gray-500 mb-4">
                        {loading ? 'Loading...' : `${filtered.length} organization${filtered.length !== 1 ? 's' : ''} found`}
                    </motion.p>

                    {/* Org Cards Grid */}
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">
                            <Image src="/logo.png" alt="Loading" width={48} height={48} className="animate-pulse mx-auto mb-4" />
                            <p>Loading organizations...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((org, i) => (
                                <motion.div
                                    key={org.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                >
                                    <Link href={`/explore/organization/${org.id}`} className="no-underline block">
                                        <div
                                            className="p-6 rounded-2xl transition-all cursor-pointer group"
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)';
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                                        {org.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{org.name}</p>
                                                        <p className="text-xs text-gray-500">{org.district ? `${org.district}, ` : ''}{org.state}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold" style={{ color: getScoreColor(org.impact_score) }}>{org.impact_score}</div>
                                                    <div className="text-[10px] text-gray-500">Impact</div>
                                                </div>
                                            </div>

                                            {/* SDG Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {org.sdg_focus.slice(0, 5).map(s => (
                                                    <span key={s} className={`sdg-${s} text-[10px] px-2 py-0.5 rounded-md font-medium`}>
                                                        SDG {s}
                                                    </span>
                                                ))}
                                                {org.sdg_focus.length > 5 && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-md text-gray-500"
                                                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                        +{org.sdg_focus.length - 5}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Stats Row */}
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                    <p className="text-xs font-bold text-white">{org.project_count}</p>
                                                    <p className="text-[10px] text-gray-500">Projects</p>
                                                </div>
                                                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                    <p className="text-xs font-bold text-white">{(org.total_beneficiaries / 1000).toFixed(0)}K</p>
                                                    <p className="text-[10px] text-gray-500">Reach</p>
                                                </div>
                                                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                                    <p className="text-xs font-bold text-emerald-400">✓ Verified</p>
                                                    <p className="text-[10px] text-gray-500">Status</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-gray-400 text-lg font-medium">No organizations found</p>
                            <p className="text-gray-600 text-sm mt-2">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5 text-center text-xs text-gray-600 mt-10">
                © 2025 SDG Nexus. Public Explorer — Open access impact transparency.
            </footer>
        </div>
    );
}
