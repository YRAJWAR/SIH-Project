'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/lib/DataContext';
import { SDG_INFO } from '@/data/mockData';

type SortBy = 'impact' | 'efficiency' | 'transparency' | 'beneficiaries';

export default function LeaderboardPage() {
    const { organizations } = useData();
    const [sortBy, setSortBy] = useState<SortBy>('impact');
    const [sdgFilter, setSDGFilter] = useState<number | null>(null);
    const [regionFilter, setRegionFilter] = useState('');

    const medals = ['🥇', '🥈', '🥉'];

    const badges = useMemo(() => {
        const sorted = [...organizations].sort((a, b) => b.impact_score - a.impact_score);
        const top = sorted[0]?.id;
        const mostTransparent = [...organizations].sort((a, b) => b.projects_count - a.projects_count)[0]?.id;
        const highEff = [...organizations].sort((a, b) => (b.beneficiaries / (b.funding_need || 1)) - (a.beneficiaries / (a.funding_need || 1)))[0]?.id;
        return { topPerformer: top, mostTransparent, highestEfficiency: highEff };
    }, [organizations]);

    const filtered = useMemo(() => {
        let list = [...organizations];
        if (sdgFilter) list = list.filter(n => n.sdg_focus.includes(sdgFilter));
        if (regionFilter) list = list.filter(n => n.location.state.toLowerCase().includes(regionFilter.toLowerCase()));

        switch (sortBy) {
            case 'impact': list.sort((a, b) => b.impact_score - a.impact_score); break;
            case 'efficiency': list.sort((a, b) => (b.beneficiaries / (b.funding_need || 1)) - (a.beneficiaries / (a.funding_need || 1))); break;
            case 'transparency': list.sort((a, b) => b.projects_count - a.projects_count); break;
            case 'beneficiaries': list.sort((a, b) => b.beneficiaries - a.beneficiaries); break;
        }
        return list;
    }, [organizations, sortBy, sdgFilter, regionFilter]);

    const uniqueStates = [...new Set(organizations.map(o => o.location.state))].sort();

    function getBadges(id: string) {
        const b: string[] = [];
        if (badges.topPerformer === id) b.push('🏅 Top Performer');
        if (badges.mostTransparent === id) b.push('🔍 Most Transparent');
        if (badges.highestEfficiency === id) b.push('⚡ Highest Efficiency');
        return b;
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>🏆 SDG Impact Leaderboard</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Top SDG contributors ranked by impact score with badges and filters</p>
            </motion.div>

            {/* Filters & Sorting */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: '#64748b' }}>Sort By</label>
                        <div className="flex gap-2">
                            {([
                                { key: 'impact' as SortBy, label: '🎯 Innovation Outcome Score', color: '#3b82f6' },
                                { key: 'efficiency' as SortBy, label: '⚡ Efficiency', color: '#10b981' },
                                { key: 'transparency' as SortBy, label: '🔍 Transparency', color: '#8b5cf6' },
                                { key: 'beneficiaries' as SortBy, label: '👥 Beneficiaries', color: '#f59e0b' },
                            ] as const).map(opt => (
                                <button key={opt.key} onClick={() => setSortBy(opt.key)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                                    style={{
                                        background: sortBy === opt.key ? opt.color + '15' : '#f8fafc',
                                        color: sortBy === opt.key ? opt.color : '#94a3b8',
                                        border: `1.5px solid ${sortBy === opt.key ? opt.color + '40' : '#e2e8f0'}`,
                                    }}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: '#64748b' }}>SDG Filter</label>
                        <select value={sdgFilter || ''} onChange={e => setSDGFilter(e.target.value ? parseInt(e.target.value) : null)}
                            className="input-dark w-auto text-sm py-1.5">
                            <option value="">All SDGs</option>
                            {SDG_INFO.map(s => <option key={s.id} value={s.id}>{s.icon} SDG {s.id}: {s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium mb-1 block" style={{ color: '#64748b' }}>Region</label>
                        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
                            className="input-dark w-auto text-sm py-1.5">
                            <option value="">All Regions</option>
                            {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Top 3 Podium */}
            {filtered.length >= 3 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-4">
                    {filtered.slice(0, 3).map((ngo, i) => (
                        <div key={ngo.id} className="glass-card p-5 text-center"
                            style={i === 0 ? { border: '2px solid #3b82f6', boxShadow: '0 4px 16px rgba(59,130,246,0.1)' } : undefined}>
                            <span className="text-3xl">{medals[i]}</span>
                            <div className="w-14 h-14 rounded-full mx-auto mt-3 flex items-center justify-center text-xl font-bold text-slate-900"
                                style={{
                                    background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
                                        i === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
                                            'linear-gradient(135deg, #b45309, #a16207)',
                                }}>
                                {ngo.name.charAt(0)}
                            </div>
                            <h3 className="text-sm font-bold mt-3" style={{ color: '#0f172a' }}>{ngo.name}</h3>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>{ngo.location.state}</p>
                            <p className="text-2xl font-bold mt-2"
                                style={{ color: i === 0 ? '#3b82f6' : i === 1 ? '#64748b' : '#b45309' }}>
                                {ngo.impact_score}
                            </p>
                            <p className="text-[10px]" style={{ color: '#94a3b8' }}>Innovation Outcome Score</p>
                            <div className="flex flex-wrap justify-center gap-1 mt-2">
                                {getBadges(ngo.id).map(b => (
                                    <span key={b} className="text-[9px] px-1.5 py-0.5 rounded-full"
                                        style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>
                                        {b}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap justify-center gap-1 mt-2">
                                {ngo.sdg_focus.map(s => (
                                    <span key={s} className={`sdg-${s} text-[9px] px-1.5 py-0.5 rounded`}>SDG {s}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Full List */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold" style={{ color: '#0f172a' }}>All Organizations</h2>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{filtered.length} organizations</p>
                </div>
                <div className="space-y-3">
                    {filtered.map((ngo, i) => (
                        <motion.div
                            key={ngo.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.03 * i }}
                            className="flex items-center gap-4 p-4 rounded-xl transition-all"
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                            <span className="text-lg font-bold w-8 text-center" style={{ color: '#94a3b8' }}>
                                {i < 3 ? medals[i] : `#${i + 1}`}
                            </span>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-slate-900"
                                style={{ background: '#3b82f6' }}>
                                {ngo.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>{ngo.name}</p>
                                    {getBadges(ngo.id).map(b => (
                                        <span key={b} className="text-[8px] px-1.5 py-0.5 rounded-full whitespace-nowrap"
                                            style={{
                                                background: b.includes('Top') ? '#eff6ff' : b.includes('Transparent') ? '#f5f3ff' : '#ecfdf5',
                                                color: b.includes('Top') ? '#3b82f6' : b.includes('Transparent') ? '#8b5cf6' : '#10b981',
                                            }}>
                                            {b}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs" style={{ color: '#94a3b8' }}>{ngo.location.state} • {ngo.projects_count} projects • {ngo.beneficiaries.toLocaleString()} beneficiaries</p>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                                {ngo.sdg_focus.map(s => (
                                    <span key={s} className={`sdg-${s} text-[10px] px-1.5 py-0.5 rounded`}>{s}</span>
                                ))}
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                                <p className="text-lg font-bold" style={{ color: '#3b82f6' }}>{ngo.impact_score}</p>
                                <div className="w-20 h-1.5 rounded-full overflow-hidden mt-1" style={{ background: '#e2e8f0' }}>
                                    <div className="h-full rounded-full" style={{ width: `${(ngo.impact_score / 1000) * 100}%`, background: '#3b82f6' }} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <p className="text-sm text-center py-8" style={{ color: '#94a3b8' }}>No organizations match the selected filters</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
