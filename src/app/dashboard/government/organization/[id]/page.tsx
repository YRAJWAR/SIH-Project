'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_DONATIONS, MOCK_ACTIVITIES, MOCK_IMPACT_SCORES, SDG_INFO } from '@/data/mockData';
import { useParams, useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fadeIn = (d: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d },
});

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#ec4899'];

export default function OrganizationDetail() {
    const params = useParams();
    const router = useRouter();
    const [org, setOrg] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [donations, setDonations] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [impactScore, setImpactScore] = useState<any>(null);

    useEffect(() => {
        if (!params || !params.id) return;
        const id = params.id as string;
        const foundOrg = MOCK_USERS.find(u => u.id === id);
        if (foundOrg) {
            setOrg(foundOrg);
            const relatedProjects = MOCK_PROJECTS.filter(p => p.organization_id === id || p.organization_name === foundOrg.organization_name);
            setProjects(relatedProjects);
            const relatedDonations = MOCK_DONATIONS.filter(d => relatedProjects.some(rp => rp.id === d.project_id));
            setDonations(relatedDonations);
            const relatedActivities = MOCK_ACTIVITIES.filter(a => relatedProjects.some(rp => rp.id === a.project_id));
            setActivities(relatedActivities);
            const score = MOCK_IMPACT_SCORES.find(s => s.organization_id === id);
            setImpactScore(score);
        }
    }, [params]);

    if (!org) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    const utilizationRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const totalBeneficiaries = projects.reduce((sum, p) => sum + p.beneficiary_count, 0);
    const totalDonationsReceived = donations.reduce((sum, d) => sum + d.amount, 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    // SDG breakdown for pie chart
    const sdgMap = new Map<number, number>();
    projects.forEach(p => {
        p.sdg_tags.forEach((sdg: number) => {
            sdgMap.set(sdg, (sdgMap.get(sdg) || 0) + 1);
        });
    });
    const sdgChartData = Array.from(sdgMap.entries()).map(([sdg, count]) => {
        const info = SDG_INFO.find(s => s.id === sdg);
        return { name: info ? info.name : `SDG ${sdg}`, value: count, color: info?.color || '#64748b' };
    });

    // Budget breakdown for bar chart
    const budgetData = projects.map(p => ({
        name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title,
        budget: p.budget / 100000,
        spent: p.spent / 100000,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div {...fadeIn(0)} className="flex items-start gap-4">
                <button onClick={() => router.back()}
                    className="mt-1 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 text-lg">
                    ←
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-slate-900">{org.organization_name}</h1>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md ${org.role === 'ngo' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {org.role}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${org.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            org.verification_status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                'bg-rose-50 text-rose-600 border border-rose-200'}`}>
                            {org.verification_status.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">👤 {org.name} • 📧 {org.email} • Registered since {org.created_at}</p>
                </div>
            </motion.div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                    { label: 'Total Budget', value: `₹${(totalBudget / 100000).toFixed(1)}L`, color: '#3b82f6', icon: '💰' },
                    { label: 'Utilized', value: `₹${(totalSpent / 100000).toFixed(1)}L`, color: '#10b981', icon: '📊' },
                    { label: 'Utilization', value: `${utilizationRate.toFixed(1)}%`, color: utilizationRate > 70 ? '#10b981' : '#f59e0b', icon: '📈' },
                    { label: 'Donations', value: `₹${(totalDonationsReceived / 1000).toFixed(0)}K`, color: '#8b5cf6', icon: '🤝' },
                    { label: 'Active Projects', value: `${activeProjects}`, color: '#06b6d4', icon: '📁' },
                    { label: 'Beneficiaries', value: totalBeneficiaries.toLocaleString(), color: '#f43f5e', icon: '👥' },
                ].map((card, i) => (
                    <motion.div key={i} {...fadeIn(0.05 * (i + 1))} className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{card.icon}</span>
                            <span className="text-[11px] text-slate-500 font-medium">{card.label}</span>
                        </div>
                        <div className="text-xl font-bold" style={{ color: card.color }}>{card.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Impact Score + SDG Focus */}
            {impactScore && (
                <div className="grid md:grid-cols-2 gap-5">
                    <motion.div {...fadeIn(0.2)} className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">📊 Innovation Outcome Score Breakdown</h2>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                                style={{
                                    background: impactScore.overall_score >= 850 ? 'linear-gradient(135deg,#10b981,#059669)' :
                                        impactScore.overall_score >= 700 ? 'linear-gradient(135deg,#3b82f6,#2563eb)' :
                                            'linear-gradient(135deg,#f59e0b,#d97706)'
                                }}>
                                {impactScore.overall_score}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">Overall Innovation Outcome Score</p>
                                <p className="text-xs text-slate-500">
                                    {impactScore.overall_score >= 850 ? 'Excellent Performance' :
                                        impactScore.overall_score >= 700 ? 'Good Performance' : 'Needs Improvement'}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Beneficiary Scale', value: impactScore.beneficiary_scale, color: '#3b82f6' },
                                { label: 'Outcome Quality', value: impactScore.outcome_score, color: '#10b981' },
                                { label: 'Geographic Need', value: impactScore.geographic_need, color: '#8b5cf6' },
                                { label: 'Funding Efficiency', value: impactScore.funding_efficiency, color: '#f59e0b' },
                                { label: 'Verification', value: impactScore.verification_score, color: '#06b6d4' },
                            ].map((metric, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-600">{metric.label}</span>
                                        <span className="font-bold" style={{ color: metric.color }}>{metric.value}/100</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="h-2 rounded-full transition-all" style={{
                                            width: `${metric.value}%`,
                                            background: metric.color
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div {...fadeIn(0.25)} className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">🎯 SDG Focus Areas</h2>
                        {sdgChartData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={sdgChartData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name }) => (name || '').length > 12 ? (name || '').substring(0, 12) + '...' : (name || '')}>
                                            {sdgChartData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: 'none', borderRadius: 12, color: '#e2e8f0' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {sdgChartData.map((sdg, i) => (
                                        <span key={i} className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: sdg.color + '20', color: sdg.color }}>
                                            {sdg.name}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">No SDG data available.</p>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Budget Breakdown Chart */}
            {budgetData.length > 0 && (
                <motion.div {...fadeIn(0.3)} className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">💰 Project Budget vs Utilization (₹ Lakhs)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={budgetData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <RechartsTooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: 'none', borderRadius: 12, color: '#e2e8f0' }} />
                            <Bar dataKey="budget" fill="#3b82f6" fillOpacity={0.6} radius={[4, 4, 0, 0]} name="Budget (₹L)" barSize={20} />
                            <Bar dataKey="spent" fill="#10b981" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Spent (₹L)" barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Projects + Transactions side by side */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Projects */}
                <motion.div {...fadeIn(0.35)} className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">📁 Project Portfolio ({projects.length})</h2>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                        {projects.length === 0 ? (
                            <p className="text-sm text-slate-500">No projects registered.</p>
                        ) : (
                            projects.map(project => (
                                <div key={project.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">{project.title}</h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5">{project.location.name} • {project.timeline.start} → {project.timeline.end}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                project.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {project.status}
                                            </span>
                                            <p className="text-xs font-bold text-blue-600 mt-1">Score: {project.impact_score}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">{project.description}</p>
                                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                                        <span>Budget: ₹{project.budget.toLocaleString()}</span>
                                        <span>Spent: ₹{project.spent.toLocaleString()} ({((project.spent / project.budget) * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}></div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] text-slate-500">👥 {project.beneficiary_count.toLocaleString()} beneficiaries</span>
                                        <span className="text-slate-300">•</span>
                                        {project.sdg_tags.slice(0, 3).map((sdg: number) => {
                                            const info = SDG_INFO.find(s => s.id === sdg);
                                            return <span key={sdg} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: (info?.color || '#64748b') + '20', color: info?.color || '#64748b' }}>
                                                {info?.icon} SDG {sdg}
                                            </span>;
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                <div className="space-y-6">
                    {/* Transactions / Donations */}
                    <motion.div {...fadeIn(0.4)} className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">🤝 Funding Received ({donations.length} transactions)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead>
                                    <tr className="text-xs text-slate-500 uppercase bg-slate-50/50 rounded-t-lg">
                                        <th className="px-4 py-2.5">Date</th>
                                        <th className="px-4 py-2.5">Donor</th>
                                        <th className="px-4 py-2.5">Project</th>
                                        <th className="px-4 py-2.5 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {donations.length === 0 ? (
                                        <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No transactions recorded.</td></tr>
                                    ) : (
                                        donations.map(don => (
                                            <tr key={don.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                                <td className="px-4 py-3 whitespace-nowrap text-xs">{don.timestamp}</td>
                                                <td className="px-4 py-3 font-medium text-slate-900 text-xs">{don.donor_name}</td>
                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                    {don.project_title.length > 25 ? don.project_title.substring(0, 25) + '...' : don.project_title}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{don.amount.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {donations.length > 0 && (
                                <div className="mt-3 p-3 bg-emerald-50 rounded-lg flex justify-between items-center">
                                    <span className="text-xs font-medium text-emerald-700">Total Funding Received</span>
                                    <span className="text-sm font-bold text-emerald-700">₹{totalDonationsReceived.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Activities */}
                    <motion.div {...fadeIn(0.45)} className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">📝 Project Milestone Ledger ({activities.length} entries)</h2>
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {activities.length === 0 ? (
                                <p className="text-sm text-slate-400">No activity logs found.</p>
                            ) : (
                                activities.map(act => (
                                    <div key={act.id} className="text-sm p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-semibold text-slate-700 text-xs">{act.project_title}</span>
                                            <span className="text-[11px] text-slate-400">{new Date(act.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-slate-600 text-xs">{act.description}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded ${act.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {act.verified ? '✓ Verified' : '⏳ Unverified'}
                                            </span>
                                            <span className="text-[10px] text-slate-400">📍 {act.location}</span>
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 py-0.5 rounded">Tx: {act.hash.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
