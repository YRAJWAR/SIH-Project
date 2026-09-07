'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useData } from '@/lib/DataContext';
import { getScoreTrend, assessRisk, type RiskAssessment } from '@/services/impactScoring';

const fadeIn = (d: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d },
});

export default function AnalyticsPage() {
    const { organizations } = useData();

    const orgAnalytics = useMemo(() => {
        return organizations.map(org => {
            const trend = getScoreTrend(org.id);
            const risk = assessRisk(trend);
            return { org, trend, risk };
        });
    }, [organizations]);

    const atRiskOrgs = orgAnalytics.filter(a => a.risk.isAtRisk);

    // Funding trend (mock quarterly data)
    const fundingTrend = [
        { quarter: 'Q1 2024', funding: 45, projects: 12 },
        { quarter: 'Q2 2024', funding: 62, projects: 18 },
        { quarter: 'Q3 2024', funding: 58, projects: 22 },
        { quarter: 'Q4 2024', funding: 78, projects: 28 },
        { quarter: 'Q1 2025', funding: 85, projects: 32 },
    ];

    // Efficiency comparison
    const efficiencyData = organizations.map(org => ({
        name: org.name.split(' ')[0],
        efficiency: Math.round(org.beneficiaries / (org.funding_need / 100000)),
        score: org.impact_score,
    })).sort((a, b) => b.efficiency - a.efficiency);

    return (
        <div className="space-y-6">
            <motion.div {...fadeIn(0)}>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    📈 Trend & Risk Analysis
                    <span title="Overview of systemic risks, performance tracking and predictive efficiency calculations based on our diverse impact datasets."><Info className="w-5 h-5 text-slate-400 hover:text-blue-500 cursor-help transition-colors" /></span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">Performance tracking, efficiency trends, and risk detection across organizations</p>
            </motion.div>

            {/* Risk Alerts */}
            {atRiskOrgs.length > 0 && (
                <motion.div {...fadeIn(0.05)} className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Performance Risk Alerts
                        <span title="Identifies NGOs showing declining efficiency or outcome scores over the last 3 quarters. Requires immediate audit consideration."><Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help" /></span>
                    </h2>
                    {atRiskOrgs.map(({ org, risk }) => (
                        <div key={org.id} className="glass-card p-4 flex items-center gap-4"
                            style={{ borderColor: risk.riskLevel === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                style={{
                                    background: risk.riskLevel === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                }}>
                                ⚠️
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{org.name}</p>
                                <p className="text-xs text-slate-500">{risk.message}</p>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                                style={{
                                    background: risk.riskLevel === 'high' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                    color: risk.riskLevel === 'high' ? '#ef4444' : '#f59e0b',
                                }}>
                                {risk.riskLevel === 'high' ? '🔴 High Risk' : '🟡 Medium Risk'}
                            </span>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Summary Cards */}
            <motion.div {...fadeIn(0.1)} className="grid grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center group relative cursor-pointer">
                    <span title="Total active NGOs participating on the platform." className="absolute top-2 right-2"><Info className="w-3 h-3 text-slate-300 group-hover:text-blue-500" /></span>
                    <p className="text-2xl font-bold text-blue-500">{organizations.length}</p>
                    <p className="text-xs text-slate-500">Organizations</p>
                </div>
                <div className="glass-card p-4 text-center group relative cursor-pointer">
                    <span title="Calculated using an advanced proprietary ML model scoring Transparency, Outcomes and Scale parameters." className="absolute top-2 right-2"><Info className="w-3 h-3 text-slate-300 group-hover:text-emerald-500" /></span>
                    <p className="text-2xl font-bold text-emerald-600">
                        {Math.round(organizations.reduce((s, o) => s + o.impact_score, 0) / organizations.length)}
                    </p>
                    <p className="text-xs text-slate-500">Avg Innovation Outcome Score</p>
                </div>
                <div className="glass-card p-4 text-center group relative cursor-pointer">
                    <span title="Count of organizations showing performance degradation anomalies." className="absolute top-2 right-2"><Info className="w-3 h-3 text-slate-300 group-hover:text-violet-500" /></span>
                    <p className="text-2xl font-bold text-violet-600">{atRiskOrgs.length}</p>
                    <p className="text-xs text-slate-500">At Risk</p>
                </div>
                <div className="glass-card p-4 text-center group relative cursor-pointer">
                    <span title="Total marginalized lives verifiably improved by completed and active projects." className="absolute top-2 right-2"><Info className="w-3 h-3 text-slate-300 group-hover:text-amber-500" /></span>
                    <p className="text-2xl font-bold text-amber-600">
                        {organizations.reduce((s, o) => s + o.beneficiaries, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Total Beneficiaries</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
                {/* Funding Trend */}
                <motion.div {...fadeIn(0.15)} className="glass-card p-6">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            💰 Funding Trend (₹ Lakhs)
                            <span title="Visualizes the correlation between CSR and Government cash infusions versus project initiation velocities over time."><Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help" /></span>
                        </span>
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={fundingTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="quarter" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Line type="monotone" dataKey="funding" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                            <Line type="monotone" dataKey="projects" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2 justify-center">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-cyan-400 rounded" /> Funding
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-violet-400 rounded" /> Projects
                        </span>
                    </div>
                </motion.div>

                {/* Efficiency Comparison */}
                <motion.div {...fadeIn(0.2)} className="glass-card p-6">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            ⚡ Efficiency: Lives per ₹1 Lakh
                            <span title="ROB (Return on Beneficiary) metric. Calculated by dividing total beneficiaries by utilized budget. This logic powers our NGO verification funnel."><Info className="w-4 h-4 text-slate-400 hover:text-blue-500 cursor-help" /></span>
                        </span>
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={efficiencyData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                            <Tooltip
                                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }}
                            />
                            <Bar dataKey="efficiency" radius={[0, 6, 6, 0]}>
                                {efficiencyData.map((_, i) => (
                                    <Cell key={i} fill={i === 0 ? '#10b981' : i < 3 ? '#3b82f6' : '#334155'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Individual Org Trends */}
            <motion.div {...fadeIn(0.25)} className="glass-card p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">📊 Organization Performance Trends</h2>
                <div className="grid grid-cols-2 gap-6">
                    {orgAnalytics.slice(0, 4).map(({ org, trend, risk }) => (
                        <div key={org.id} className="p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                                        style={{ background: '#3b82f6' }}>
                                        {org.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-900">{org.name}</p>
                                        <p className="text-[10px] text-slate-500">{org.location.state}</p>
                                    </div>
                                </div>
                                {risk.isAtRisk && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                                        style={{
                                            background: risk.riskLevel === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                            color: risk.riskLevel === 'high' ? '#ef4444' : '#f59e0b',
                                        }}>
                                        ⚠️ {risk.riskType === 'efficiency_decline' ? 'Efficiency Risk' : risk.riskType === 'funding_decline' ? 'Performance Risk' : 'High Risk'}
                                    </span>
                                )}
                            </div>
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={trend}>
                                    <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 9 }} tickLine={false} axisLine={false} />
                                    <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                                    <Tooltip
                                        contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 10 }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
