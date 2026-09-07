'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SDG_INFO } from '@/data/mockData';
import { useData } from '@/lib/DataContext';
import { findMatches } from '@/services/matching';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import StatCard from '@/components/dashboard/StatCard';
import { generateExecutiveReport } from '@/lib/pdfGenerator';
import { FileDown, AlertTriangle } from 'lucide-react';

const fadeIn = (d: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d },
});

export default function CorporateDashboard() {
    const { organizations, projects, donations } = useData();
    const [sdgFilter, setSdgFilter] = useState<number | null>(null);
    const [stateFilter, setStateFilter] = useState('');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [highFundingRisks, setHighFundingRisks] = useState<any[]>([]);
    const corporateSDGs = [3, 4, 6, 7, 11];

    useEffect(() => {
        fetch('/api/government/risk-flags')
            .then((r) => r.json())
            .then((res) => {
                if (res.success && res.data?.riskFlags) {
                    const filtered = res.data.riskFlags.filter(
                        (f: any) =>
                            f.risk_type === 'high_funding_low_beneficiaries' ||
                            f.risk_type === 'HIGH_FUNDING_LOW_BENEFICIARIES'
                    );
                    setHighFundingRisks(filtered);
                }
            })
            .catch((err) => console.warn('Failed to load CSR risk flags:', err));
    }, []);

    const totalCSRSpend = donations.reduce((s, d) => s + d.amount, 0);
    const projectsFunded = new Set(donations.map(d => d.project_id)).size;
    const sdgsSupported = new Set(projects.flatMap(p => p.sdg_tags)).size;

    const matches = useMemo(() => {
        return findMatches(organizations, {
            sdg_focus: sdgFilter ? [sdgFilter] : undefined,
            state: stateFilter || undefined,
        }, corporateSDGs);
    }, [sdgFilter, stateFilter, organizations]);

    const handleGenerateReport = () => {
        setIsGeneratingPDF(true);
        try {
            // Prepare matched NGOs for the table
            const tableRows = matches.slice(0, 10).map(match => [
                match.ngo.name,
                match.ngo.location.state,
                `${match.match_score}%`,
                `₹${Math.round(match.ngo.funding_need / 100000)}L`,
                match.ngo.impact_score.toString()
            ]);

            generateExecutiveReport({
                title: "CSR Impact & Ecosystem Matches",
                organizationName: "TechServe India CSR",
                date: new Date().toLocaleDateString(),
                summaryMetrics: [
                    { label: "Total CSR Spend", value: `₹${totalCSRSpend} Lakh` },
                    { label: "Projects Funded", value: projectsFunded },
                    { label: "SDGs Impacted", value: sdgsSupported },
                    { label: "Lives Impacted", value: 80000 }
                ],
                tableData: {
                    head: ['Recommended NGO', 'State', 'Match (%)', 'Funding Need', 'Innovation Outcome Score'],
                    body: tableRows
                }
            });
        } finally {
            setTimeout(() => setIsGeneratingPDF(false), 1000);
        }
    };

    return (
        <div className="space-y-6">
            <motion.div {...fadeIn(0)} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Industry & Funding Partner Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">TechServe Jharkhand CSR • Corporate Dashboard</p>
                </div>

                <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-70"
                >
                    {isGeneratingPDF ? (
                        <>
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin"></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            <FileDown size={16} />
                            CSR Execution Report
                        </>
                    )}
                </button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total CSR Spend', value: 45, icon: '💰', color: '#3b82f6', prefix: '₹', suffix: ' Lakh' },
                    { label: 'Projects Funded', value: projectsFunded, icon: '📁', color: '#10b981' },
                    { label: 'SDGs Impacted', value: sdgsSupported, icon: '🎯', color: '#8b5cf6' },
                    { label: 'Lives Impacted', value: 80000, icon: '👥', color: '#f59e0b' },
                ].map((stat, i) => (
                    <StatCard
                        key={i}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        delay={0.1 * i}
                    />
                ))}
            </div>

            {/* High Funding Low Beneficiaries Alert (Joint CSR & Government Audit) */}
            {highFundingRisks.length > 0 && (
                <motion.div {...fadeIn(0.25)} className="p-5 bg-rose-50 border border-rose-200 rounded-2xl shadow-xs">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-rose-900">
                                        Joint Government &amp; CSR Audit Alert: High Funding / Low Beneficiaries
                                    </h3>
                                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-600 text-white uppercase tracking-wider">
                                        Critical Flag
                                    </span>
                                </div>
                                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                    Simultaneous State Oversight
                                </span>
                            </div>
                            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                                Automated anomaly detection flagged projects co-funded with government where capital deployment exceeds normal beneficiary per-capita limits (&gt; ₹50,000/beneficiary). Milestone disbursements are subject to joint inspection.
                            </p>
                            <div className="mt-3 space-y-2">
                                {highFundingRisks.map((flag: any) => (
                                    <div
                                        key={flag.id}
                                        className="text-xs bg-white p-3 rounded-xl border border-rose-200/80 text-rose-950 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs"
                                    >
                                        <div>
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <span>🚩 {flag.challenge_title || flag.organization?.name || 'Gram Vikas Trust Jharkhand'}</span>
                                                <span className="text-rose-600 font-medium">({flag.district || 'Pakur District'})</span>
                                            </div>
                                            <div className="text-[11px] text-slate-600 mt-0.5 leading-normal">{flag.description}</div>
                                        </div>
                                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-100 text-rose-800 border border-rose-300 w-fit shrink-0">
                                            Verification Review Active
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Smart Matching */}
            <motion.div {...fadeIn(0.3)} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">🤝 Triple Helix Routing Engine</h2>
                        <p className="text-xs text-slate-500 mt-1">AI-powered NGO recommendations based on your CSR focus areas</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <select value={sdgFilter || ''} onChange={e => setSdgFilter(e.target.value ? parseInt(e.target.value) : null)}
                        className="input-dark w-auto text-sm py-2">
                        <option value="">All SDGs</option>
                        {SDG_INFO.map(s => <option key={s.id} value={s.id}>SDG {s.id}: {s.name}</option>)}
                    </select>
                    <input type="text" value={stateFilter} onChange={e => setStateFilter(e.target.value)}
                        className="input-dark w-auto text-sm py-2" placeholder="Filter by state..." />
                </div>

                {/* Partner Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                    {matches.map((match, i) => (
                        <motion.div key={match.ngo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="p-4 rounded-xl transition-all hover:bg-slate-100"
                            style={{ background: '#f8fafc', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            {/* NGO Cover Banner */}
                            <div className="h-24 w-full rounded-lg bg-slate-200 mb-4 overflow-hidden shadow-sm relative group">
                                <img
                                    src={`https://picsum.photos/seed/${match.ngo.id}/400/200`}
                                    alt={match.ngo.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {match.ngo.verified && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-md shadow-sm border border-emerald-500/20 backdrop-blur-sm bg-emerald-500 text-white font-semibold">✓ Verified</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-slate-200 bg-white">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${match.ngo.name}&backgroundColor=0f172a,3b82f6`} alt={match.ngo.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{match.ngo.name}</p>
                                        <p className="text-xs text-slate-500">{match.ngo.location.state}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-blue-500">{match.match_score}%</div>
                                    <div className="text-[10px] text-slate-500">Match</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {match.ngo.sdg_focus.map(s => (
                                    <span key={s} className={`sdg-${s} text-[10px] px-2 py-0.5 rounded-md`}>SDG {s}</span>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 rounded-lg" style={{ background: '#f8fafc' }}>
                                    <p className="text-xs font-bold text-slate-900">{match.ngo.impact_score}</p>
                                    <p className="text-[10px] text-slate-500">Impact</p>
                                </div>
                                <div className="p-2 rounded-lg" style={{ background: '#f8fafc' }}>
                                    <p className="text-xs font-bold text-slate-900">₹{(match.ngo.funding_need / 100000).toFixed(0)}L</p>
                                    <p className="text-[10px] text-slate-500">Need</p>
                                </div>
                                <div className="p-2 rounded-lg" style={{ background: '#f8fafc' }}>
                                    <p className="text-xs font-bold text-slate-900">{match.ngo.beneficiaries.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-500">Reach</p>
                                </div>
                            </div>

                            {match.reasons.length > 0 && (
                                <div className="mt-3 text-xs text-slate-500">
                                    {match.reasons.map((r, ri) => (
                                        <span key={ri} className="inline-block mr-2">✓ {r}</span>
                                    ))}
                                </div>
                            )}

                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
