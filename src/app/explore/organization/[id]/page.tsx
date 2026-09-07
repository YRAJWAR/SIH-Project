'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SDG_INFO } from '@/data/mockData';
import { use } from 'react';

interface OrgDetail {
    id: string;
    name: string;
    type: string;
    state: string;
    district: string | null;
    verification_status: string;
    impact: {
        scale_score: number;
        outcome_score: number;
        efficiency_score: number;
        geographic_need_score: number;
        transparency_score: number;
        final_score: number;
        calculation_version: string;
    } | null;
    sdg_focus: number[];
    transparency: {
        total_activities: number;
        verified_activities: number;
        verification_rate: number;
        has_geo_tags: boolean;
        has_proof_uploads: boolean;
        level: string;
    };
    projects: {
        id: string;
        title: string;
        status: string;
        beneficiaries: number;
        sdg_tags: number[];
    }[];
    geo_impact: {
        project_title?: string;
        district?: string;
        state?: string;
        beneficiaries?: number;
        total_beneficiaries?: number;
        sdg_tags?: number[];
        sdg_id?: number;
        latitude?: number | null;
        longitude?: number | null;
    }[];
}

const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
});

function getScoreColor(score: number) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#06b6d4';
    if (score >= 40) return '#f59e0b';
    return '#f43f5e';
}

function getFinalScoreColor(score: number) {
    if (score >= 850) return '#10b981';
    if (score >= 700) return '#06b6d4';
    if (score >= 500) return '#f59e0b';
    return '#f43f5e';
}

function getTransparencyColor(level: string) {
    if (level === 'Very High') return '#10b981';
    if (level === 'High') return '#06b6d4';
    if (level === 'Medium') return '#f59e0b';
    return '#f43f5e';
}

export default function OrganizationPublicProfile({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [org, setOrg] = useState<OrgDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/public/organizations/${resolvedParams.id}`)
            .then(r => r.json())
            .then(json => {
                const payload = json.data || json;
                if (!payload.error) setOrg(payload);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
                <div className="text-center">
                    <Image src="/logo.png" alt="Loading" width={56} height={56} className="animate-pulse mx-auto mb-4" />
                    <p className="text-gray-400">Loading organization profile...</p>
                </div>
            </div>
        );
    }

    if (!org) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
                <div className="text-center">
                    <div className="text-5xl mb-4">❌</div>
                    <p className="text-gray-400 text-lg">Organization not found</p>
                    <Link href="/explore" className="text-cyan-400 text-sm mt-4 inline-block no-underline">← Back to Explorer</Link>
                </div>
            </div>
        );
    }

    const totalBeneficiaries = org.projects.reduce((s, p) => s + p.beneficiaries, 0);

    const impactBreakdown = org.impact ? [
        { label: 'Beneficiary Scale', score: org.impact.scale_score, color: '#3b82f6' },
        { label: 'Outcome Score', score: org.impact.outcome_score, color: '#10b981' },
        { label: 'Efficiency', score: org.impact.efficiency_score, color: '#f59e0b' },
        { label: 'Geographic Need', score: org.impact.geographic_need_score, color: '#8b5cf6' },
        { label: 'Transparency', score: org.impact.transparency_score, color: '#06b6d4' },
    ] : [];

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
                        <Link href="/explore" className="text-sm font-medium text-cyan-400 no-underline">← Explorer</Link>
                        <Link href="/login"
                            className="px-5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition no-underline"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <motion.div {...fadeIn(0)} className="mb-8">
                        <Link href="/explore" className="text-xs text-gray-500 no-underline hover:text-gray-300 transition mb-4 inline-block">
                            ← Back to Explorer
                        </Link>
                        <div className="flex items-center gap-5 mt-2">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                {org.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-extrabold text-white">{org.name}</h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    {org.type} • {org.district ? `${org.district}, ` : ''}{org.state}
                                    <span className="ml-3 text-emerald-400 text-xs font-medium">✓ {org.verification_status}</span>
                                </p>
                            </div>
                            {org.impact && (
                                <div className="text-right hidden md:block">
                                    <div className="text-4xl font-extrabold" style={{ color: getFinalScoreColor(org.impact.final_score) }}>
                                        {org.impact.final_score}
                                    </div>
                                    <div className="text-xs text-gray-500">Innovation Outcome Score · v{org.impact.calculation_version}</div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div {...fadeIn(0.1)} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Projects', value: org.projects.length, icon: '📁', color: '#3b82f6' },
                            { label: 'Beneficiaries', value: `${(totalBeneficiaries / 1000).toFixed(0)}K`, icon: '👥', color: '#10b981' },
                            { label: 'SDGs Covered', value: org.sdg_focus.length, icon: '🎯', color: '#8b5cf6' },
                            { label: 'Transparency', value: org.transparency.level, icon: '🔍', color: getTransparencyColor(org.transparency.level) },
                        ].map((stat, i) => (
                            <div key={i} className="p-5 rounded-2xl text-center"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div className="text-2xl mb-2">{stat.icon}</div>
                                <div className="text-xl font-bold text-white">{stat.value}</div>
                                <div className="text-[10px] text-gray-500 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Impact Breakdown */}
                        <motion.div {...fadeIn(0.2)} className="p-6 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                                ⚡ Innovation Outcome Score Breakdown
                                {org.impact && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full text-gray-500 font-medium"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        v{org.impact.calculation_version}
                                    </span>
                                )}
                            </h2>
                            {org.impact ? (
                                <div className="space-y-4">
                                    {impactBreakdown.map((item, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-gray-400">{item.label}</span>
                                                <span className="font-semibold" style={{ color: item.color }}>{Math.round(item.score)}%</span>
                                            </div>
                                            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ background: item.color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(item.score, 100)}%` }}
                                                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400">Final Composite Score</span>
                                            <span className="text-2xl font-bold" style={{ color: getFinalScoreColor(org.impact.final_score) }}>
                                                {org.impact.final_score}
                                                <span className="text-xs text-gray-500 font-normal"> / 1000</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No impact score available yet.</p>
                            )}
                        </motion.div>

                        {/* SDG Focus + Transparency */}
                        <div className="space-y-6">
                            {/* SDG Breakdown */}
                            <motion.div {...fadeIn(0.25)} className="p-6 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h2 className="text-lg font-semibold text-white mb-4">🎯 SDG Alignment</h2>
                                <div className="flex flex-wrap gap-2">
                                    {org.sdg_focus.map(s => {
                                        const info = SDG_INFO.find(i => i.id === s);
                                        return (
                                            <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                                                style={{ background: (info?.color || '#666') + '20', border: `1px solid ${(info?.color || '#666')}40`, color: info?.color || '#fff' }}>
                                                <span>{info?.icon}</span>
                                                <span>SDG {s}: {info?.name || 'Unknown'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {org.sdg_focus.length === 0 && (
                                    <p className="text-sm text-gray-500">No SDG data available.</p>
                                )}
                            </motion.div>

                            {/* Transparency */}
                            <motion.div {...fadeIn(0.3)} className="p-6 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <h2 className="text-lg font-semibold text-white mb-4">🔍 Transparency Level</h2>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-3xl font-extrabold" style={{ color: getTransparencyColor(org.transparency.level) }}>
                                        {org.transparency.level}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {org.transparency.verification_rate}% verification rate
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Total Activities', value: org.transparency.total_activities, ok: true },
                                        { label: 'Verified', value: org.transparency.verified_activities, ok: org.transparency.verified_activities > 0 },
                                        { label: 'Geo Tags', value: org.transparency.has_geo_tags ? '✓ Yes' : '✗ No', ok: org.transparency.has_geo_tags },
                                        { label: 'Proof Uploads', value: org.transparency.has_proof_uploads ? '✓ Yes' : '✗ No', ok: org.transparency.has_proof_uploads },
                                    ].map((item, i) => (
                                        <div key={i} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                            <div className="text-sm font-bold" style={{ color: item.ok ? '#10b981' : '#f43f5e' }}>
                                                {item.value}
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Projects (Public — no financial info) */}
                    <motion.div {...fadeIn(0.35)} className="p-6 rounded-2xl mb-8"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h2 className="text-lg font-semibold text-white mb-4">📁 Active Projects</h2>
                        <div className="space-y-3">
                            {org.projects.map((p, i) => (
                                <motion.div key={p.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.08 }}
                                    className="p-4 rounded-xl flex items-center justify-between"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-white">{p.title}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {p.sdg_tags.map(s => (
                                                <span key={s} className={`sdg-${s} text-[9px] px-1.5 py-0.5 rounded`}>SDG {s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-white">{p.beneficiaries.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500">Beneficiaries</p>
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                            style={{
                                                color: p.status === 'ACTIVE' ? '#10b981' : p.status === 'COMPLETED' ? '#3b82f6' : '#f59e0b',
                                                background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : p.status === 'COMPLETED' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                                            }}>
                                            {p.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Geo Impact */}
                    {org.geo_impact && org.geo_impact.length > 0 && (
                        <motion.div {...fadeIn(0.4)} className="p-6 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 className="text-lg font-semibold text-white mb-4">🗺️ Geographic Impact</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {org.geo_impact.map((g, i) => (
                                    <div key={i} className="p-4 rounded-xl text-center"
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <p className="text-sm font-semibold text-white">
                                            {g.project_title || `${g.district || g.state}`}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(g.beneficiaries || g.total_beneficiaries || 0).toLocaleString()} beneficiaries
                                        </p>
                                        {g.sdg_tags && (
                                            <div className="flex justify-center gap-1 mt-2">
                                                {g.sdg_tags.map(s => (
                                                    <span key={s} className={`sdg-${s} text-[9px] px-1.5 py-0.5 rounded`}>SDG {s}</span>
                                                ))}
                                            </div>
                                        )}
                                        {g.sdg_id && !g.sdg_tags && (
                                            <span className={`sdg-${g.sdg_id} text-[9px] px-1.5 py-0.5 rounded mt-2 inline-block`}>SDG {g.sdg_id}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5 text-center text-xs text-gray-600">
                © 2025 SDG Nexus. Public profile — Open access impact transparency.
            </footer>
        </div>
    );
}
