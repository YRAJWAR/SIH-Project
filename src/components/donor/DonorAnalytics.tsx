'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import GeoImpactMap from '@/components/analytics/GeoImpactMap';
import PredictiveChart from '@/components/analytics/PredictiveChart';

// ── Types ─────────────────────────────────────────────────────────────────
interface Overview {
    total_donated: number; total_donations: number; beneficiaries_impacted: number;
    sdgs_supported: number; projects_supported: number; volunteer_hours: number;
    volunteer_events: number; impact_per_rupee: number; cost_per_beneficiary: number;
    platform_avg_cost_per_beneficiary: number; giving_streak_months: number;
    reputation_tier: string; tier_progress: number; next_tier: string;
    next_tier_requirement: string; rank_percentile: number; avg_donation_size: number;
    platform_avg_donation_size: number; yoy_growth: number;
    sdg_diversity_score: number; platform_avg_sdg_diversity: number;
}
interface TimelineMonth {
    month: string; amount: number; projects: number; beneficiaries: number;
}
interface SdgItem {
    sdg_id: number; sdg_name: string; amount: number; pct: number;
    color: string; beneficiaries: number;
}
interface BenchmarkData {
    donor: Record<string, number>;
    platform_avg: Record<string, number>;
    top_10_pct: Record<string, number>;
    percentile: number;
    insights: { type: string; text: string }[];
}
interface Story {
    id: string; amount: number; project_title: string; ngo_name: string;
    sdg_tags: number[]; headline: string; story: string;
    metric_icon: string; metric_label: string; metric_sub: string;
    image_seed: string; date: string; verified: boolean;
}

// ── Badge config ──────────────────────────────────────────────────────────
const BADGES = [
    { id: 'first', icon: '🌱', label: 'First Donation', desc: 'Made your first donation', earned: true },
    { id: 'multi', icon: '💎', label: 'Loyal Patron', desc: 'Donated to 5+ projects', earned: true },
    { id: 'sdg5', icon: '🎯', label: 'SDG Champion', desc: 'Funded 5+ different SDGs', earned: true },
    { id: 'vol10', icon: '⏱️', label: '10-Hour Volunteer', desc: 'Volunteered 10+ hours', earned: true },
    { id: 'streak', icon: '🔥', label: '5-Month Streak', desc: '5 consecutive months of giving', earned: true },
    { id: 'big', icon: '💰', label: 'High-Impact Donor', desc: 'Total donations exceed ₹2.5L', earned: true },
    { id: 'feedback', icon: '⭐', label: 'NGO Reviewer', desc: 'Submitted 2+ NGO authenticity reviews', earned: false },
    { id: 'allsdgs', icon: '🌍', label: 'SDG Legend', desc: 'Fund every single SDG at least once', earned: false },
    { id: 'vol50', icon: '🏆', label: 'Master Volunteer', desc: 'Accumulate 50 volunteer hours', earned: false },
    { id: 'champ', icon: '👑', label: 'Impact Champion', desc: 'Reach the Impact Champion donor tier', earned: false },
];

// ── Tier config ───────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, string> = {
    'Bronze Donor': '#cd7f32',
    'Silver Donor': '#94a3b8',
    'Gold Donor': '#f59e0b',
    'Impact Champion': '#3b82f6',
};

// ── Report generator ──────────────────────────────────────────────────────
function generateAnnualReport(overview: Overview, sdgPortfolio: SdgItem[], stories: Story[]) {
    const currentYear = 2025;
    const sdgRows = sdgPortfolio.map(s =>
        `<tr><td>SDG ${s.sdg_id}</td><td>${s.sdg_name}</td><td>₹${s.amount.toLocaleString()}</td><td>${s.pct}%</td><td>${s.beneficiaries.toLocaleString()}</td></tr>`
    ).join('');
    const storyItems = stories.slice(0, 3).map(s =>
        `<li style="margin-bottom:12px"><strong>${s.headline}</strong><br/><span style="font-size:13px;color:#475569">${s.story.slice(0, 180)}...</span></li>`
    ).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Annual Giving Report ${currentYear}</title>
<style>
  body{margin:0;font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;color:#1e293b}
  .page{max-width:800px;margin:40px auto;background:white;padding:60px;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.1)}
  .header{text-align:center;border-bottom:3px solid #10b981;padding-bottom:30px;margin-bottom:30px}
  .logo{font-size:40px;margin-bottom:6px}.brand{font-size:20px;font-weight:800;color:#10b981;letter-spacing:2px}
  h1{font-size:26px;color:#0f172a;margin:20px 0 4px}
  .subtitle{font-size:14px;color:#94a3b8;margin-bottom:0}
  .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:24px 0}
  .stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center}
  .stat-val{font-size:26px;font-weight:800;color:#10b981}.stat-lbl{font-size:12px;color:#64748b;margin-top:4px}
  h2{font-size:16px;color:#0f172a;border-left:4px solid #10b981;padding-left:12px;margin:28px 0 14px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#f1f5f9;text-align:left;padding:10px 12px;color:#475569;font-weight:600}
  td{padding:9px 12px;border-bottom:1px solid #f1f5f9;color:#1e293b}
  .tier{display:inline-block;padding:6px 16px;border-radius:20px;font-weight:700;font-size:14px;background:#fef3c7;color:#b45309;border:2px solid #f59e0b;margin-bottom:10px}
  .footer{text-align:center;font-size:11px;color:#94a3b8;margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0}
  ul{padding-left:18px;color:#475569}
</style></head><body><div class="page">
  <div class="header">
    <div class="logo">🌍</div>
    <div class="brand">SDG NEXUS</div>
    <h1>Annual Giving Report ${currentYear}</h1>
    <div class="subtitle">Prepared for Vikram Patel &nbsp;·&nbsp; donor@sdgnexus.org</div>
    <div style="margin-top:16px"><div class="tier">🥇 ${overview.reputation_tier}</div></div>
  </div>

  <h2>📊 Giving Overview</h2>
  <div class="stats-grid">
    <div class="stat"><div class="stat-val">₹${(overview.total_donated / 1000).toFixed(0)}K</div><div class="stat-lbl">Total Donated</div></div>
    <div class="stat"><div class="stat-val">${overview.beneficiaries_impacted.toLocaleString()}</div><div class="stat-lbl">People Impacted</div></div>
    <div class="stat"><div class="stat-val">${overview.sdgs_supported}</div><div class="stat-lbl">SDGs Supported</div></div>
    <div class="stat"><div class="stat-val">${overview.projects_supported}</div><div class="stat-lbl">Projects Funded</div></div>
    <div class="stat"><div class="stat-val">${overview.volunteer_hours}h</div><div class="stat-lbl">Volunteer Hours</div></div>
    <div class="stat"><div class="stat-val">Top ${100 - overview.rank_percentile}%</div><div class="stat-lbl">Platform Rank</div></div>
  </div>

  <h2>🎯 SDG Allocation Breakdown</h2>
  <table><thead><tr><th>SDG</th><th>Goal</th><th>Amount</th><th>% of Giving</th><th>Beneficiaries</th></tr></thead>
  <tbody>${sdgRows}</tbody></table>

  <h2>💡 Your Impact Stories</h2>
  <ul>${storyItems}</ul>

  <div class="footer">
    This report was generated by SDG Nexus · sdgnexus.org<br/>
    All impact data is verifiable through the SDG Nexus blockchain ledger · Report ID: RPT-${currentYear}-VKP-${Date.now().toString(36).toUpperCase()}
  </div>
</div></body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
}

// ── Custom Tooltip ────────────────────────────────────────────────────────
const TimelineTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div className="bg-white rounded-xl shadow-lg p-3 border border-slate-100 text-xs">
            <p className="font-bold text-slate-900 mb-1">{label}</p>
            <p style={{ color: '#3b82f6' }}>₹{(d?.amount || 0).toLocaleString()} donated</p>
            {d?.projects > 0 && <p style={{ color: '#10b981' }}>{d.projects} project{d.projects > 1 ? 's' : ''}</p>}
            {d?.beneficiaries > 0 && <p style={{ color: '#8b5cf6' }}>{d.beneficiaries.toLocaleString()} beneficiaries</p>}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────
export default function DonorAnalytics() {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [timeline, setTimeline] = useState<TimelineMonth[]>([]);
    const [sdgPortfolio, setSdgPortfolio] = useState<SdgItem[]>([]);
    const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [geoImpact, setGeoImpact] = useState<any[]>([]);
    const [impactForecast, setImpactForecast] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeStory, setActiveStory] = useState<Story | null>(null);
    const [activeSection, setActiveSection] = useState<'timeline' | 'portfolio' | 'benchmark' | 'stories' | 'badges' | 'map'>('timeline');

    useEffect(() => {
        Promise.all([
            fetch('/api/donor/analytics/overview').then(r => r.json()),
            fetch('/api/donor/analytics/giving-timeline').then(r => r.json()),
            fetch('/api/donor/analytics/sdg-portfolio').then(r => r.json()),
            fetch('/api/donor/analytics/peer-benchmark').then(r => r.json()),
            fetch('/api/donor/analytics/impact-stories').then(r => r.json()),
            fetch('/api/donor/analytics/geo-impact').then(r => r.json()),
            fetch('/api/donor/analytics/impact-forecast').then(r => r.json())
        ]).then(([ov, tl, sdg, bm, st, geo, fc]) => {
            if (ov.success) setOverview(ov.data);
            if (tl.success) setTimeline(tl.data);
            if (sdg.success) setSdgPortfolio(sdg.data);
            if (bm.success) setBenchmark(bm.data);
            if (st.success) setStories(st.data);
            if (geo.success) setGeoImpact(geo.data);
            if (fc.success) setImpactForecast(fc);
        }).finally(() => setLoading(false));
    }, []);

    const handleDownloadReport = useCallback(() => {
        if (overview && sdgPortfolio.length && stories.length)
            generateAnnualReport(overview, sdgPortfolio, stories);
    }, [overview, sdgPortfolio, stories]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-500">Loading your impact intelligence...</p>
                </div>
            </div>
        );
    }

    const tierColor = overview ? (TIER_COLORS[overview.reputation_tier] || '#3b82f6') : '#3b82f6';

    const SECTION_TABS = [
        { id: 'timeline', label: '📈 Giving Timeline' },
        { id: 'map', label: '🗺️ Impact Map' },
        { id: 'portfolio', label: '🎯 SDG Portfolio' },
        { id: 'benchmark', label: '🏆 Peer Rank' },
        { id: 'stories', label: '💡 Impact Stories' },
        { id: 'badges', label: '🎖️ Badges' },
    ] as const;

    return (
        <div className="space-y-6">
            {/* ── Top Scorecard ── */}
            {overview && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2d1f 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>

                    <div className="p-6">
                        {/* Tier + streak */}
                        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                        style={{ background: tierColor + '25', border: `2px solid ${tierColor}50` }}>
                                        {overview.reputation_tier === 'Bronze Donor' ? '🥉'
                                            : overview.reputation_tier === 'Silver Donor' ? '🥈'
                                                : overview.reputation_tier === 'Gold Donor' ? '🥇' : '👑'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium" style={{ color: tierColor }}>Donor Tier</p>
                                        <p className="text-xl font-bold text-white">{overview.reputation_tier}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 rounded-full overflow-hidden" style={{ width: 180, background: 'rgba(255,255,255,0.1)' }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${overview.tier_progress}%` }}
                                            transition={{ duration: 1 }}
                                            className="h-full rounded-full" style={{ background: tierColor }} />
                                    </div>
                                    <span className="text-[10px] text-slate-400">{overview.tier_progress}% → {overview.next_tier}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <p className="text-2xl font-bold" style={{ color: '#f97316' }}>🔥{overview.giving_streak_months}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Month Streak</p>
                                </div>
                                <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <p className="text-2xl font-bold text-emerald-400">Top {100 - overview.rank_percentile}%</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Platform Rank</p>
                                </div>
                                <div className="text-center px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <p className="text-2xl font-bold text-blue-400">+{overview.yoy_growth}%</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">YoY Growth</p>
                                </div>
                            </div>
                        </div>

                        {/* Key metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                            {[
                                { label: 'Total Donated', value: `₹${(overview.total_donated / 1000).toFixed(0)}K`, icon: '💝', color: '#f43f5e' },
                                { label: 'Lives Impacted', value: overview.beneficiaries_impacted.toLocaleString(), icon: '🫂', color: '#10b981' },
                                { label: 'SDGs Funded', value: `${overview.sdgs_supported}/17`, icon: '🎯', color: '#3b82f6' },
                                { label: 'Cost / Beneficiary', value: `₹${overview.cost_per_beneficiary}`, icon: '📉', color: '#8b5cf6' },
                            ].map(stat => (
                                <div key={stat.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <p className="text-lg mb-1">{stat.icon}</p>
                                    <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Download report button */}
                        <button onClick={handleDownloadReport}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
                            📄 Download My Annual Giving Report (2025)
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ── Section Tabs ── */}
            <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: '#f1f5f9' }}>
                {SECTION_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveSection(tab.id)}
                        className="whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{
                            background: activeSection === tab.id ? '#fff' : 'transparent',
                            color: activeSection === tab.id ? '#0f172a' : '#94a3b8',
                            boxShadow: activeSection === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeSection}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                    {/* ── Giving Timeline ── */}
                    {activeSection === 'timeline' && (
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">📈 Your Giving Timeline</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Monthly donations over the past 12 months</p>
                                </div>
                                {timeline.length > 0 && (
                                    <div className="flex gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 rounded" style={{ background: '#3b82f6', display: 'inline-block' }} />
                                            Donation amount
                                        </span>
                                    </div>
                                )}
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={timeline} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                                        tickFormatter={v => v === 0 ? '₹0' : `₹${v / 1000}K`} />
                                    <Tooltip content={<TimelineTooltip />} />
                                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                        {timeline.map((d, i) => (
                                            <Cell key={i} fill={d.amount > 0 ? '#3b82f6' : '#e2e8f0'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-3 gap-3 mt-5">
                                {[
                                    { label: 'Best Month', value: `₹${Math.max(...timeline.map(m => m.amount)).toLocaleString()}`, color: '#3b82f6' },
                                    { label: 'Active Months', value: `${timeline.filter(m => m.amount > 0).length}/12`, color: '#10b981' },
                                    { label: 'Avg / Active Month', value: `₹${Math.round(timeline.filter(m => m.amount > 0).reduce((s, m) => s + m.amount, 0) / Math.max(1, timeline.filter(m => m.amount > 0).length)).toLocaleString()}`, color: '#8b5cf6' },
                                ].map(stat => (
                                    <div key={stat.label} className="p-3 rounded-xl text-center" style={{ background: '#f8fafc' }}>
                                        <p className="text-base font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Predictive Chart */}
                            {impactForecast && impactForecast.data && (
                                <div className="mt-8">
                                    <PredictiveChart
                                        data={impactForecast.data}
                                        title="Your Personal Impact Trajectory"
                                        subtitle={`Current score: ${impactForecast.current_score} → Projected 6m: ${impactForecast.predicted_6m} (+${impactForecast.growth_pct}%)`}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Impact Map ── */}
                    {activeSection === 'map' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                            <div className="mb-6 flex justify-between items-end">
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>India Impact Footprint</h3>
                                    <p className="text-sm" style={{ color: '#64748b' }}>Geographical visualization of where your funds generated impact.</p>
                                </div>
                            </div>
                            {geoImpact.length > 0 ? (
                                <GeoImpactMap data={geoImpact} />
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-10">No geographic data available yet.</p>
                            )}
                        </motion.div>
                    )}

                    {/* ── SDG Portfolio ── */}
                    {activeSection === 'portfolio' && (
                        <div className="glass-card p-6">
                            <h2 className="text-base font-bold text-slate-900 mb-1">🎯 SDG Portfolio Allocation</h2>
                            <p className="text-xs text-slate-500 mb-5">How your giving is distributed across the UN Sustainable Development Goals</p>
                            <div className="grid md:grid-cols-2 gap-6 items-center">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie data={sdgPortfolio} dataKey="amount" nameKey="sdg_name"
                                            cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                                            paddingAngle={2}>
                                            {sdgPortfolio.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v: number | undefined) => [`₹${(v ?? 0).toLocaleString()}`, 'Donated']}
                                            contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-2.5">
                                    {sdgPortfolio.sort((a, b) => b.amount - a.amount).map(s => (
                                        <div key={s.sdg_id}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: s.color }} />
                                                    SDG {s.sdg_id} — {s.sdg_name}
                                                </span>
                                                <span style={{ color: s.color }} className="font-bold">{s.pct}%</span>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                                                    transition={{ duration: 0.8, delay: 0.1 }}
                                                    className="h-full rounded-full" style={{ background: s.color }} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5">₹{s.amount.toLocaleString()} · {s.beneficiaries.toLocaleString()} beneficiaries</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Peer Benchmark ── */}
                    {activeSection === 'benchmark' && benchmark && (
                        <div className="glass-card p-6 space-y-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 mb-1">🏆 Peer Benchmarking</h2>
                                <p className="text-xs text-slate-500">How you compare to other donors on the platform</p>
                            </div>

                            {/* Rank badge */}
                            <div className="flex items-center gap-4 p-5 rounded-2xl"
                                style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                                    style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                                    🏅
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-slate-900">Top {100 - benchmark.percentile}% Donor</p>
                                    <p className="text-sm text-slate-500">You outperform {benchmark.percentile}% of all donors on SDG Nexus</p>
                                </div>
                            </div>

                            {/* Comparison bars */}
                            <div className="space-y-4">
                                {[
                                    { key: 'avg_monthly_donation', label: 'Avg Monthly Giving', prefix: '₹', suffix: '' },
                                    { key: 'sdg_diversity', label: 'SDG Diversity Score', prefix: '', suffix: '/17' },
                                    { key: 'volunteer_hours', label: 'Volunteer Hours', prefix: '', suffix: 'h' },
                                    { key: 'cost_per_beneficiary', label: 'Cost / Beneficiary', prefix: '₹', suffix: '', inverse: true },
                                ].map(metric => {
                                    const you = benchmark.donor[metric.key] ?? 0;
                                    const avg = benchmark.platform_avg[metric.key] ?? 1;
                                    const top10 = benchmark.top_10_pct[metric.key] ?? 1;
                                    const maxVal = Math.max(you, avg, top10);
                                    const youPct = (you / maxVal) * 100;
                                    const avgPct = (avg / maxVal) * 100;
                                    const topPct = (top10 / maxVal) * 100;
                                    const youGood = metric.inverse ? you < avg : you > avg;
                                    return (
                                        <div key={metric.key} className="p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <p className="text-xs font-semibold text-slate-700 mb-3">{metric.label}</p>
                                            {[
                                                { label: 'You', pct: youPct, val: you, color: youGood ? '#10b981' : '#f59e0b' },
                                                { label: 'Platform Avg', pct: avgPct, val: avg, color: '#94a3b8' },
                                                { label: 'Top 10%', pct: topPct, val: top10, color: '#3b82f6' },
                                            ].map(row => (
                                                <div key={row.label} className="mb-2">
                                                    <div className="flex justify-between text-[10px] mb-0.5">
                                                        <span className="text-slate-500">{row.label}</span>
                                                        <span className="font-bold" style={{ color: row.color }}>
                                                            {metric.prefix}{typeof row.val === 'number' ? row.val.toLocaleString() : row.val}{metric.suffix}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${row.pct}%` }}
                                                            transition={{ duration: 0.7 }}
                                                            className="h-full rounded-full" style={{ background: row.color }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* AI Insights */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-3">💡 Personalised Insights</h3>
                                <div className="space-y-2">
                                    {benchmark.insights.map((ins, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-xl text-xs"
                                            style={{
                                                background: ins.type === 'strength' ? 'rgba(16,185,129,0.06)' : 'rgba(59,130,246,0.06)',
                                                border: `1px solid ${ins.type === 'strength' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`,
                                            }}>
                                            <span>{ins.type === 'strength' ? '✅' : '🚀'}</span>
                                            <span style={{ color: ins.type === 'strength' ? '#166534' : '#1e40af' }}>{ins.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Impact Stories ── */}
                    {activeSection === 'stories' && (
                        <div className="space-y-4">
                            <div className="glass-card px-6 py-4">
                                <h2 className="text-base font-bold text-slate-900">💡 Your Impact Stories</h2>
                                <p className="text-xs text-slate-500 mt-0.5">The real-world difference each of your donations made</p>
                            </div>
                            {stories.map((story, i) => (
                                <motion.div key={story.id}
                                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                    className="glass-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => setActiveStory(activeStory?.id === story.id ? null : story)}>
                                    <div className="flex gap-4 p-5">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={`https://picsum.photos/seed/${story.image_seed}/200/200`}
                                                alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-sm font-bold text-slate-900 leading-snug">{story.headline}</p>
                                                {story.verified && (
                                                    <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                                                        ✓ Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mb-2">{story.ngo_name} · ₹{story.amount.toLocaleString()} · {new Date(story.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#10b981' }}>
                                                    <span className="text-base">{story.metric_icon}</span>
                                                    <span>{story.metric_label}</span>
                                                </div>
                                                <span className="text-xs text-slate-400">{story.metric_sub}</span>
                                            </div>
                                        </div>
                                        <span className="text-slate-300 text-sm self-center">{activeStory?.id === story.id ? '▲' : '▼'}</span>
                                    </div>
                                    <AnimatePresence>
                                        {activeStory?.id === story.id && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                className="overflow-hidden">
                                                <div className="px-5 pb-5 pt-0">
                                                    <div className="h-px bg-slate-100 mb-4" />
                                                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{story.story}</p>
                                                    <div className="flex gap-1.5">
                                                        {story.sdg_tags.map(t => (
                                                            <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded"
                                                                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                                                                SDG {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* ── Badges ── */}
                    {activeSection === 'badges' && (
                        <div className="glass-card p-6">
                            <h2 className="text-base font-bold text-slate-900 mb-1">🎖️ Achievements & Milestones</h2>
                            <p className="text-xs text-slate-500 mb-5">Your giving journey milestones — keep going to unlock more!</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {BADGES.map((badge, i) => (
                                    <motion.div key={badge.id}
                                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="p-4 rounded-xl text-center transition-all"
                                        style={{
                                            background: badge.earned ? 'rgba(16,185,129,0.06)' : '#f8fafc',
                                            border: `1px solid ${badge.earned ? 'rgba(16,185,129,0.25)' : '#e2e8f0'}`,
                                            opacity: badge.earned ? 1 : 0.55,
                                        }}>
                                        <div className="text-3xl mb-2" style={{ filter: badge.earned ? 'none' : 'grayscale(1)' }}>
                                            {badge.icon}
                                        </div>
                                        <p className="text-xs font-bold text-slate-900 mb-1">{badge.label}</p>
                                        <p className="text-[10px] text-slate-500 leading-snug">{badge.desc}</p>
                                        {badge.earned && (
                                            <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                ✓ Earned
                                            </span>
                                        )}
                                        {!badge.earned && (
                                            <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8' }}>
                                                🔒 Locked
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-5 flex items-center gap-2 p-4 rounded-xl"
                                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <span className="text-xl">🚀</span>
                                <p className="text-xs text-slate-600">
                                    You&apos;ve earned <strong style={{ color: '#10b981' }}>{BADGES.filter(b => b.earned).length}</strong> of {BADGES.length} badges.
                                    Submit 2 NGO reviews and fund 2 more SDGs to unlock the next 2 badges!
                                </p>
                            </div>
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
}
