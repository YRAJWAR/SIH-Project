'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SDG_INFO } from '@/data/mockData';
import { useData } from '@/lib/DataContext';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import VolunteerDetailModal, { VolunteerOpportunity } from '@/components/donor/VolunteerDetailModal';
import VolunteerOpportunitiesSection from '@/components/donor/VolunteerOpportunitiesSection';
import VolunteerHistory, { VolunteerHistoryItem } from '@/components/donor/VolunteerHistory';
import DonorAnalytics from '@/components/donor/DonorAnalytics';

declare global { interface Window { Razorpay: any; } }

const fadeIn = (d: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d },
});

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export default function DonorDashboard() {
    const { projects, donations, addDonation } = useData();
    const [selectedSDG, setSelectedSDG] = useState<number | null>(null);
    const [showDonateModal, setShowDonateModal] = useState<string | null>(null);
    const [donateAmount, setDonateAmount] = useState<number>(1000);
    const [donorName, setDonorName] = useState('Vikram Patel');
    const [donorEmail, setDonorEmail] = useState('donor@sdgnexus.org');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
    const [lastPaymentId, setLastPaymentId] = useState<string>('');
    const [dashboardTab, setDashboardTab] = useState<'dashboard' | 'analytics'>('dashboard');

    // ── Volunteer state ──────────────────────────────────────────
    const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
    const [historyItems, setHistoryItems] = useState<VolunteerHistoryItem[]>([]);
    const [totalHours, setTotalHours] = useState(0);
    const [applyingToId, setApplyingToId] = useState<string | null>(null);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
    const [selectedOpportunity, setSelectedOpportunity] = useState<VolunteerOpportunity | null>(null);
    const [detailApplied, setDetailApplied] = useState(false);
    const [volunteerTab, setVolunteerTab] = useState<'opportunities' | 'history'>('opportunities');

    useEffect(() => {
        fetch('/api/donor/volunteer-opportunities')
            .then(r => r.json())
            .then(d => { if (d.success) setOpportunities(d.data); })
            .catch(console.error);

        fetch('/api/donor/volunteer-history')
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setHistoryItems(d.data);
                    setTotalHours(d.total_hours ?? 0);
                }
            })
            .catch(console.error);
    }, []);

    const handleVolunteerApply = async (opportunity_id: string) => {
        setApplyingToId(opportunity_id);
        try {
            const res = await fetch('/api/donor/volunteer-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunity_id }),
            });
            const data = await res.json();
            if (data.success) {
                setAppliedIds(prev => new Set([...prev, opportunity_id]));
                setOpportunities(prev => prev.map(o =>
                    o.id === opportunity_id ? { ...o, filled_volunteers: o.filled_volunteers + 1 } : o
                ));
                if (selectedOpportunity?.id === opportunity_id) setDetailApplied(true);
            } else {
                // Still mark applied in UI for demo (mock backend may throw "already applied")
                setAppliedIds(prev => new Set([...prev, opportunity_id]));
                if (selectedOpportunity?.id === opportunity_id) setDetailApplied(true);
            }
        } catch {
            setAppliedIds(prev => new Set([...prev, opportunity_id]));
        } finally {
            setApplyingToId(null);
        }
    };

    const openDetail = (opp: VolunteerOpportunity) => {
        setSelectedOpportunity(opp);
        setDetailApplied(appliedIds.has(opp.id));
    };
    const closeDetail = () => { setSelectedOpportunity(null); setDetailApplied(false); };

    const myDonations = donations.filter(d => d.donor_id === 'u4');
    const totalDonated = myDonations.reduce((s, d) => s + d.amount, 0);
    const sdgsSupported = [...new Set(myDonations.flatMap(d => d.sdg_tags))].length;
    const livesImpacted = 12500;

    const filteredProjects = selectedSDG ? projects.filter(p => p.sdg_tags.includes(selectedSDG)) : projects;
    const selectedProject = projects.find(p => p.id === showDonateModal);

    const initiatePayment = useCallback(async () => {
        if (!showDonateModal || !selectedProject || donateAmount < 1) return;
        setPaymentStatus('processing');
        try {
            const res = await fetch('/api/razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: donateAmount, project_id: selectedProject.id, project_title: selectedProject.title, donor_name: donorName, donor_email: donorEmail }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            await new Promise(r => setTimeout(r, 2000));
            const fakePaymentId = `pay_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
            setLastPaymentId(fakePaymentId);
            setPaymentStatus('success');
            addDonation({ donor_id: 'u4', donor_name: donorName, project_id: selectedProject.id, project_title: selectedProject.title, amount: donateAmount, sdg_tags: selectedProject.sdg_tags, timestamp: new Date().toISOString().split('T')[0] });
        } catch { setPaymentStatus('failed'); }
    }, [showDonateModal, selectedProject, donateAmount, donorName, donorEmail, addDonation]);

    const resetModal = () => { setShowDonateModal(null); setPaymentStatus('idle'); setLastPaymentId(''); setDonateAmount(1000); };

    return (
        <div className="space-y-6">
            <motion.div {...fadeIn(0)}>
                <h1 className="text-2xl font-bold text-slate-900">Donor Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Track your giving impact, volunteer for causes, and discover new projects</p>
            </motion.div>

            {/* ── Dashboard / Analytics Tabs ── */}
            <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#f1f5f9' }}>
                {([{ id: 'dashboard', label: '💝 Dashboard' }, { id: 'analytics', label: '📊 Analytics' }] as const).map(tab => (
                    <button key={tab.id} onClick={() => setDashboardTab(tab.id)}
                        className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                        style={{
                            background: dashboardTab === tab.id ? '#fff' : 'transparent',
                            color: dashboardTab === tab.id ? '#0f172a' : '#94a3b8',
                            boxShadow: dashboardTab === tab.id ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                        }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Analytics Tab Content ── */}
            {dashboardTab === 'analytics' && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <DonorAnalytics />
                </motion.div>
            )}

            {/* ── Dashboard Tab Content ── */}
            {dashboardTab === 'dashboard' && (<>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Donated', value: Math.round(totalDonated / 1000), icon: '💝', color: '#f43f5e', prefix: '₹', suffix: 'K' },
                        { label: 'Projects Supported', value: myDonations.length, icon: '📁', color: '#3b82f6' },
                        { label: 'SDGs Supported', value: sdgsSupported, icon: '🎯', color: '#10b981' },
                        { label: 'Volunteer Hours', value: totalHours, icon: '🙋', color: '#8b5cf6', suffix: 'h' },
                    ].map((stat, i) => (
                        <motion.div key={i} {...fadeIn(0.05 * (i + 1))} className="glass-card p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: stat.color + '15', color: stat.color }}>{stat.label}</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900">
                                <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════
                VOLUNTEER SECTION — moved ABOVE Impact Breakdown
            ══════════════════════════════════════════════ */}
                <motion.div {...fadeIn(0.2)} className="glass-card overflow-hidden">
                    {/* Section header */}
                    <div className="px-6 pt-6 pb-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                    style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                                    🙋
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Volunteer Hub</h2>
                                    <p className="text-xs text-slate-400">Give your time, amplify your impact</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {historyItems.length > 0 && (
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>
                                        {historyItems.length} Events Completed
                                    </span>
                                )}
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                                    {opportunities.length} Open Now
                                </span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 mt-4 p-1 rounded-xl w-fit" style={{ background: '#f1f5f9' }}>
                            {(['opportunities', 'history'] as const).map(tab => (
                                <button key={tab} onClick={() => setVolunteerTab(tab)}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize"
                                    style={{
                                        background: volunteerTab === tab ? '#fff' : 'transparent',
                                        color: volunteerTab === tab ? '#0f172a' : '#94a3b8',
                                        boxShadow: volunteerTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                    }}>
                                    {tab === 'opportunities' ? '🔍 Find Opportunities' : `📋 My History${historyItems.length > 0 ? ` (${historyItems.length})` : ''}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div key={volunteerTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}>
                                {volunteerTab === 'opportunities' ? (
                                    <VolunteerOpportunitiesSection
                                        opportunities={opportunities}
                                        appliedIds={appliedIds}
                                        applyingToId={applyingToId}
                                        onCardClick={openDetail}
                                        onQuickApply={handleVolunteerApply}
                                    />
                                ) : (
                                    <VolunteerHistory
                                        items={historyItems}
                                        totalHours={totalHours}
                                        onFeedbackSubmitted={(id) => {
                                            setHistoryItems(prev => prev.map(item =>
                                                item.id === id ? { ...item, feedback_submitted: true } : item
                                            ));
                                        }}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ── Impact Breakdown (now below volunteer) ── */}
                <motion.div {...fadeIn(0.3)} className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Impact Breakdown</h2>
                    <div className="space-y-4">
                        {myDonations.map((donation, i) => (
                            <div key={donation.id}>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-slate-700 font-medium">{donation.project_title}</span>
                                    <span className="text-blue-500 font-semibold">₹{donation.amount.toLocaleString()}</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(donation.amount / totalDonated) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.2 + i * 0.15 }}
                                        className="h-full rounded-full"
                                        style={{ background: `linear-gradient(90deg, ${SDG_INFO.find(s => s.id === donation.sdg_tags[0])?.color || '#3b82f6'}, ${SDG_INFO.find(s => s.id === (donation.sdg_tags[1] || donation.sdg_tags[0]))?.color || '#8b5cf6'})` }}
                                    />
                                </div>
                                <div className="flex gap-1.5 mt-1.5">
                                    {donation.sdg_tags.map(t => (
                                        <span key={t} className={`sdg-${t} text-[10px] px-1.5 py-0.5 rounded`}>SDG {t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Browse Projects ── */}
                <motion.div {...fadeIn(0.4)} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Browse Projects</h2>
                    </div>
                    {/* SDG Filter */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        <button onClick={() => setSelectedSDG(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: !selectedSDG ? 'rgba(6,182,212,0.15)' : '#f8fafc', color: !selectedSDG ? '#3b82f6' : '#94a3b8', border: `1px solid ${!selectedSDG ? 'rgba(6,182,212,0.3)' : 'transparent'}` }}>
                            All
                        </button>
                        {SDG_INFO.slice(0, 10).map(sdg => (
                            <button key={sdg.id} onClick={() => setSelectedSDG(sdg.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{ background: selectedSDG === sdg.id ? sdg.color + '20' : '#f8fafc', color: selectedSDG === sdg.id ? sdg.color : '#94a3b8', border: `1px solid ${selectedSDG === sdg.id ? sdg.color + '40' : 'transparent'}` }}>
                                {sdg.icon} {sdg.id}
                            </button>
                        ))}
                    </div>
                    {/* Project Cards */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {filteredProjects.map((project, i) => (
                            <motion.div key={project.id}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="p-4 rounded-xl flex flex-col"
                                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div className="h-40 w-full rounded-lg bg-slate-200 mb-4 overflow-hidden relative group">
                                    <img src={`https://picsum.photos/seed/${project.id}/800/600`} alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {project.sdg_tags.slice(0, 2).map((tag: number) => (
                                            <span key={tag} className={`sdg-${tag} text-[10px] px-2 py-0.5 rounded-md shadow-sm border border-white/20 backdrop-blur-sm`}>SDG {tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1">{project.title}</h3>
                                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed flex-1">{project.description}</p>
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                                    <span>📍 {project.location.name}</span>
                                    <span>👥 {project.beneficiary_count.toLocaleString()}</span>
                                </div>
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-500">₹{(project.spent / 100000).toFixed(0)}L raised</span>
                                        <span className="text-slate-500">₹{(project.budget / 100000).toFixed(0)}L goal</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(project.spent / project.budget) * 100}%` }} />
                                    </div>
                                </div>
                                <button onClick={() => { setShowDonateModal(project.id); setPaymentStatus('idle'); }}
                                    className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:shadow-md text-white"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                                    💝 Donate Now via Razorpay
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Volunteer Detail Modal ── */}
                <AnimatePresence>
                    {selectedOpportunity && (
                        <VolunteerDetailModal
                            opportunity={selectedOpportunity}
                            onClose={closeDetail}
                            onApply={handleVolunteerApply}
                            applying={applyingToId === selectedOpportunity.id}
                            applied={detailApplied}
                        />
                    )}
                </AnimatePresence>

                {/* ── Razorpay Payment Modal ── */}
                {showDonateModal && selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={resetModal}>
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
                            onClick={e => e.stopPropagation()}>
                            {paymentStatus === 'success' ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✅</span></div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                                    <p className="text-sm text-slate-500 mb-1">₹{donateAmount.toLocaleString()} donated to</p>
                                    <p className="text-sm font-semibold text-slate-800 mb-4">{selectedProject.title}</p>
                                    {lastPaymentId && (<div className="bg-slate-50 rounded-lg p-3 mb-4"><p className="text-xs text-slate-500">Payment ID</p><p className="text-sm font-mono text-blue-600">{lastPaymentId}</p></div>)}
                                    <p className="text-xs text-emerald-600 mb-4">🎉 Your contribution is now recorded on the SDG Nexus ledger</p>
                                    <button onClick={resetModal} className="w-full py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors">Done</button>
                                </div>
                            ) : paymentStatus === 'failed' ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">❌</span></div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Failed</h3>
                                    <p className="text-sm text-slate-500 mb-4">Something went wrong. Please try again.</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setPaymentStatus('idle')} className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-semibold">Try Again</button>
                                        <button onClick={resetModal} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-bold text-slate-900">Make a Donation</h3>
                                        <button onClick={resetModal} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 mb-5">
                                        <p className="text-xs text-slate-500 mb-1">Donating to</p>
                                        <p className="text-sm font-semibold text-slate-900">{selectedProject.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">📍 {selectedProject.location.name} · 👥 {selectedProject.beneficiary_count.toLocaleString()} beneficiaries</p>
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-xs text-slate-500 font-medium mb-2 block">Select Amount</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {PRESET_AMOUNTS.map(amt => (
                                                <button key={amt} onClick={() => setDonateAmount(amt)}
                                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${donateAmount === amt ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                    ₹{amt.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                            <input type="number" value={donateAmount} onChange={e => setDonateAmount(parseInt(e.target.value) || 0)}
                                                className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Custom amount" min={1} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div>
                                            <label className="text-xs text-slate-500 font-medium mb-1 block">Name</label>
                                            <input type="text" value={donorName} onChange={e => setDonorName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 font-medium mb-1 block">Email</label>
                                            <input type="email" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <button onClick={initiatePayment} disabled={paymentStatus === 'processing' || donateAmount < 1}
                                        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                                        {paymentStatus === 'processing' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </span>
                                        ) : `Pay ₹${donateAmount.toLocaleString()} via Razorpay`}
                                    </button>
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                        <span className="text-[10px] text-slate-400">🔒 Secured by</span>
                                        <span className="text-[11px] font-bold text-blue-500">Razorpay</span>
                                    </div>
                                    <p className="text-center text-[10px] text-slate-400 mt-2">🎬 Demo Mode — Payment will be simulated for presentation</p>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </>)}
        </div>
    );
}
