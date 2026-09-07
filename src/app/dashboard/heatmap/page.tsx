'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Info } from 'lucide-react';
import { SDG_INFO } from '@/data/mockData';
import { useData } from '@/lib/DataContext';
import type { ColorMode } from '@/components/Map';

const SDGHeatmap = dynamic(() => import('@/components/Map'), { ssr: false });

// ──────────────────────────────────────────────────────────────
// Color Mode definitions
// ──────────────────────────────────────────────────────────────

const COLOR_MODES: { key: ColorMode; label: string; icon: string; color: string; description: string }[] = [
    { key: 'composite', label: 'Composite', icon: '🔥', color: '#f59e0b', description: 'Multi-variable weighted density score' },
    { key: 'funding', label: 'Funding', icon: '💰', color: '#22c55e', description: 'Funding volume per region' },
    { key: 'beneficiaries', label: 'Beneficiaries', icon: '👥', color: '#06b6d4', description: 'Beneficiary reach per region' },
    { key: 'ngo_density', label: 'NGO Density', icon: '🏢', color: '#8b5cf6', description: 'Number of active NGOs' },
    { key: 'efficiency', label: 'Efficiency', icon: '⚡', color: '#3b82f6', description: 'Funding efficiency (₹ per beneficiary)' },
    { key: 'risk', label: 'Risk Level', icon: '⚠️', color: '#ef4444', description: 'Underfunding risk analysis' },
    { key: 'sdg', label: 'SDG Focus', icon: '🎯', color: '#a855f7', description: 'SDG project concentration' },
    { key: 'challenge_density', label: 'Challenge Density', icon: '📍', color: '#ec4899', description: 'Citizen-submitted innovation challenges per district' },
];

// ──────────────────────────────────────────────────────────────
// Compute Region Analytics (derived stats)
// ──────────────────────────────────────────────────────────────

function useRegionAnalytics(regions: any[]) {
    return useMemo(() => {
        const totalFunding = regions.reduce((s, r) => s + r.funding, 0);
        const totalBens = regions.reduce((s, r) => s + r.beneficiaries, 0);
        const totalNGOs = regions.reduce((s, r) => s + r.ngo_count, 0);
        const totalProjects = regions.reduce((s, r) => s + r.projects, 0);
        const avgEfficiency = totalBens > 0 ? totalFunding / totalBens : 0;

        // Top & bottom regions
        const sorted = [...regions].sort((a, b) => {
            const scoreA = (a.funding / totalFunding) * 0.2 + (a.beneficiaries / totalBens) * 0.3 + (a.ngo_count / totalNGOs) * 0.15 + (a.projects / totalProjects) * 0.15 + (1 - ((a.beneficiaries > 0 ? a.funding / a.beneficiaries : 0) / (avgEfficiency * 2))) * 0.2;
            const scoreB = (b.funding / totalFunding) * 0.2 + (b.beneficiaries / totalBens) * 0.3 + (b.ngo_count / totalNGOs) * 0.15 + (b.projects / totalProjects) * 0.15 + (1 - ((b.beneficiaries > 0 ? b.funding / b.beneficiaries : 0) / (avgEfficiency * 2))) * 0.2;
            return scoreB - scoreA;
        });

        const topRegions = sorted.slice(0, 3);
        const bottomRegions = sorted.slice(-3).reverse();

        // SDG coverage heatmap
        const sdgCoverage = new Map<number, number>();
        for (const r of regions) {
            for (const s of r.primary_sdgs) {
                sdgCoverage.set(s, (sdgCoverage.get(s) || 0) + 1);
            }
        }

        return { totalFunding, totalBens, totalNGOs, totalProjects, avgEfficiency, topRegions, bottomRegions, sdgCoverage };
    }, [regions]);
}

export default function HeatmapPage() {
    const { regions } = useData();
    const [colorBy, setColorBy] = useState<ColorMode>('composite');
    const [selectedSDG, setSelectedSDG] = useState<number | undefined>(undefined);
    const [intensityScale, setIntensityScale] = useState(1.0);

    const analytics = useRegionAnalytics(regions);

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    SDG Impact Heatmap
                    <span title="Geospatial density visualization identifying 'Impact Dark Zones' through real-time geospatial overlay mapping."><Info className="w-5 h-5 text-slate-400 hover:text-blue-500 cursor-help transition-colors" /></span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Multi-variable density visualization with composite scoring across {regions.length} regions
                </p>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-3"
            >
                {[
                    { label: 'Total Funding', value: `₹${(analytics.totalFunding / 10000000).toFixed(1)}Cr`, icon: '💰', color: '#22c55e', desc: 'Aggregated funding mapped to geospatial bounds.' },
                    { label: 'Beneficiaries', value: `${(analytics.totalBens / 1000).toFixed(0)}K`, icon: '👥', color: '#06b6d4', desc: 'Total verifiable lives impacted mapping.' },
                    { label: 'Active NGOs', value: String(analytics.totalNGOs), icon: '🏢', color: '#8b5cf6', desc: 'Organizations functionally distributing aid regionally.' },
                    { label: 'Projects', value: String(analytics.totalProjects), icon: '📁', color: '#f59e0b', desc: 'Current active and drafted projects.' },
                    { label: 'Avg ₹/Beneficiary', value: `₹${Math.round(analytics.avgEfficiency)}`, icon: '⚡', color: '#3b82f6', desc: 'Heatmap density scaling based on efficient distributions.' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="glass-card p-4 text-center group relative cursor-pointer"
                    >
                        <span title={stat.desc} className="absolute top-2 right-2"><Info className="w-3 h-3 text-slate-300 group-hover:text-blue-500" /></span>
                        <div className="text-lg mb-1">{stat.icon}</div>
                        <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5"
            >
                <div className="flex flex-wrap items-end gap-5">
                    {/* Color Mode */}
                    <div className="flex-1 min-w-[280px]">
                        <label className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1.5">
                            Visualization Mode
                            <span title="Switch the geospatial plotting algorithm base layers (e.g. Funding Density vs NGO Counts)."><Info className="w-3 h-3 text-slate-400 cursor-help" /></span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_MODES.map(opt => (
                                <button key={opt.key} onClick={() => setColorBy(opt.key)}
                                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                                    title={opt.description}
                                    style={{
                                        background: colorBy === opt.key ? opt.color + '18' : '#f8fafc',
                                        color: colorBy === opt.key ? opt.color : '#94a3b8',
                                        border: `1.5px solid ${colorBy === opt.key ? opt.color + '50' : '#e2e8f0'}`,
                                        boxShadow: colorBy === opt.key ? `0 2px 8px ${opt.color}20` : 'none',
                                    }}>
                                    {opt.icon} {opt.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">
                            {COLOR_MODES.find(m => m.key === colorBy)?.description}
                        </p>
                    </div>

                    {/* SDG Filter */}
                    <div>
                        <label className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1.5">
                            SDG Filter
                            <span title="Isolate heatmap points strictly to projects mapped to a specific UN Sustainable Development Goal."><Info className="w-3 h-3 text-slate-400 cursor-help" /></span>
                        </label>
                        <select value={selectedSDG || ''} onChange={e => setSelectedSDG(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="input-dark w-auto text-sm py-2 min-w-[180px]">
                            <option value="">All SDGs</option>
                            {SDG_INFO.map(s => <option key={s.id} value={s.id}>{s.icon} SDG {s.id}: {s.name}</option>)}
                        </select>
                    </div>

                    {/* Intensity Scale */}
                    <div>
                        <label className="text-xs text-slate-500 mb-2 block font-medium">Intensity Scale</label>
                        <div className="flex items-center gap-2">
                            <input type="range" min="0.5" max="1.5" step="0.1"
                                value={intensityScale}
                                onChange={e => setIntensityScale(parseFloat(e.target.value))}
                                className="w-24 accent-green-500"
                            />
                            <span className="text-xs text-slate-500 font-mono w-8">{intensityScale.toFixed(1)}x</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Map */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <SDGHeatmap
                    regions={regions}
                    colorBy={colorBy}
                    selectedSDG={selectedSDG}
                    intensityScale={intensityScale}
                />
            </motion.div>

            {/* Analytics Grid */}
            <div className="grid md:grid-cols-2 gap-5">
                {/* Top Performing Regions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-5"
                >
                    <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2 justify-between">
                        <span className="flex items-center gap-2">🏆 Highest Impact Regions</span>
                        <span title="Top-scoring regions calculated via a 3-tier composite matrix: Beneficiaries, SDG compliance, and Funding Volume."><Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help" /></span>
                    </h2>
                    <div className="space-y-3">
                        {analytics.topRegions.map((r: any, i: number) => (
                            <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                                    style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#cd7f32' }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                                    <p className="text-[10px] text-slate-500">
                                        ₹{(r.funding / 100000).toFixed(0)}L · {r.beneficiaries.toLocaleString()} beneficiaries · {r.ngo_count} NGOs
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {r.primary_sdgs.slice(0, 3).map((s: number) => (
                                        <span key={s} className={`sdg-${s} text-[9px] px-1.5 py-0.5 rounded`}>
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Underfunded Regions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="glass-card p-5"
                >
                    <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2 justify-between">
                        <span className="flex items-center gap-2">⚠️ Attention Needed</span>
                        <span title="Highlights regions facing systematic underfunding against their predicted need matrix. Government and CSR entities should monitor these closely."><Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help" /></span>
                    </h2>
                    <div className="space-y-3">
                        {analytics.bottomRegions.map((r: any, i: number) => {
                            const eff = r.beneficiaries > 0 ? r.funding / r.beneficiaries : 0;
                            const severity = eff > analytics.avgEfficiency ? 'High Cost' : 'Underfunded';
                            return (
                                <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: '#fca5a5' }}>
                                        {i === 0 ? '🔴' : i === 1 ? '🟠' : '🟡'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                                        <p className="text-[10px] text-slate-500">
                                            ₹{(r.funding / 100000).toFixed(0)}L · {r.beneficiaries.toLocaleString()} beneficiaries · ₹{Math.round(eff)}/person
                                        </p>
                                    </div>
                                    <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                                        style={{ background: '#fee2e2', color: '#dc2626' }}>
                                        {severity}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* SDG Coverage Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-5"
            >
                <h2 className="text-sm font-semibold text-slate-900 mb-3">🎯 SDG Coverage Across Regions</h2>
                <div className="flex flex-wrap gap-2">
                    {SDG_INFO.map(sdg => {
                        const count = analytics.sdgCoverage.get(sdg.id) || 0;
                        const maxCoverage = Math.max(...Array.from(analytics.sdgCoverage.values()));
                        const intensity = maxCoverage > 0 ? count / maxCoverage : 0;
                        return (
                            <button
                                key={sdg.id}
                                onClick={() => setSelectedSDG(selectedSDG === sdg.id ? undefined : sdg.id)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                                style={{
                                    background: selectedSDG === sdg.id ? sdg.color + '25' :
                                        `rgba(${Math.round(34 + (239 - 34) * intensity)}, ${Math.round(197 - 197 * intensity * 0.6)}, ${Math.round(94 - 94 * intensity * 0.3)}, 0.1)`,
                                    border: `1.5px solid ${selectedSDG === sdg.id ? sdg.color : 'transparent'}`,
                                    color: selectedSDG === sdg.id ? sdg.color : '#64748b',
                                    fontWeight: selectedSDG === sdg.id ? 700 : 500,
                                }}
                            >
                                <span>{sdg.icon}</span>
                                <span>SDG {sdg.id}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                                    style={{
                                        background: intensity > 0.7 ? '#dcfce7' : intensity > 0.3 ? '#fef9c3' : '#f1f5f9',
                                        color: intensity > 0.7 ? '#16a34a' : intensity > 0.3 ? '#ca8a04' : '#94a3b8',
                                    }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Full Region Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="glass-card p-6"
            >
                <h2 className="text-sm font-semibold text-slate-900 mb-4">📊 Complete Region Analytics</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-slate-500 text-xs border-b border-slate-200">
                                <th className="text-left py-3 font-medium">Region</th>
                                <th className="text-right py-3 font-medium">Funding</th>
                                <th className="text-right py-3 font-medium">NGOs</th>
                                <th className="text-right py-3 font-medium">Projects</th>
                                <th className="text-right py-3 font-medium">Beneficiaries</th>
                                <th className="text-right py-3 font-medium">₹/Person</th>
                                <th className="text-left py-3 pl-4 font-medium">SDGs</th>
                                <th className="text-center py-3 font-medium">Density</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...regions].sort((a, b) => b.funding - a.funding).map(r => {
                                const eff = r.beneficiaries > 0 ? r.funding / r.beneficiaries : 0;
                                const effColor = eff < 30 ? '#22c55e' : eff < 60 ? '#06b6d4' : eff < 100 ? '#f59e0b' : '#ef4444';
                                // Compute composite for density bar
                                const totalF = regions.reduce((s, x) => s + x.funding, 0);
                                const totalB = regions.reduce((s, x) => s + x.beneficiaries, 0);
                                const totalN = regions.reduce((s, x) => s + x.ngo_count, 0);
                                const totalP = regions.reduce((s, x) => s + x.projects, 0);
                                const composite = (r.funding / totalF) * 0.2 + (r.beneficiaries / totalB) * 0.3 +
                                    (r.ngo_count / totalN) * 0.15 + (r.projects / totalP) * 0.15;
                                const barWidth = Math.round(composite * 100 / 0.15); // scale for visibility

                                return (
                                    <tr key={r.name} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                        <td className="py-3 text-slate-800 font-medium">{r.name}</td>
                                        <td className="py-3 text-right font-semibold" style={{ color: '#22c55e' }}>₹{(r.funding / 100000).toFixed(0)}L</td>
                                        <td className="py-3 text-right text-slate-600">{r.ngo_count}</td>
                                        <td className="py-3 text-right text-slate-600">{r.projects}</td>
                                        <td className="py-3 text-right text-slate-600">{r.beneficiaries.toLocaleString()}</td>
                                        <td className="py-3 text-right font-semibold" style={{ color: effColor }}>
                                            ₹{Math.round(eff)}
                                        </td>
                                        <td className="py-3 pl-4">
                                            <div className="flex gap-1">
                                                {r.primary_sdgs.map(s => (
                                                    <span key={s} className={`sdg-${s} text-[10px] px-1.5 py-0.5 rounded`}>{s}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-20 mx-auto">
                                                <div className="h-full rounded-full" style={{
                                                    width: `${Math.min(barWidth, 100)}%`,
                                                    background: barWidth > 70 ? '#ef4444' : barWidth > 40 ? '#f59e0b' : '#22c55e',
                                                }} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
