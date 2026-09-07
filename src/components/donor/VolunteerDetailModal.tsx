'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface VolunteerOpportunity {
    id: string;
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    required_volunteers: number;
    filled_volunteers: number;
    ngo_name: string;
    ngo_id: string;
    ngo_logo: string | null;
    ngo_rating: number;
    ngo_verified: boolean;
    sdg_tags: number[];
    skills_needed: string[];
    what_to_bring: string[];
    what_provided: string[];
    impact_statement: string;
    hours_commitment: number;
    category: string;
    urgency: 'high' | 'medium' | 'low';
}

const URGENCY_CONFIG = {
    high: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    medium: { label: 'Filling', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    low: { label: 'Open', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

const SDG_COLORS: Record<number, string> = {
    1: '#e5243b', 2: '#dda63a', 3: '#4c9f38', 4: '#c5192d', 5: '#ff3a21',
    6: '#26bde2', 7: '#fcc30b', 8: '#a21949', 9: '#fd6e25', 10: '#dd1367',
    11: '#fd9d24', 12: '#bf8b2e', 13: '#3f7e44', 14: '#0a97d9', 15: '#56c02b',
    16: '#0056c8', 17: '#19486a',
};

interface Props {
    opportunity: VolunteerOpportunity | null;
    onClose: () => void;
    onApply: (id: string) => void;
    applying: boolean;
    applied: boolean;
}

export default function VolunteerDetailModal({ opportunity: opp, onClose, onApply, applying, applied }: Props) {
    if (!opp) return null;

    const spotsLeft = opp.required_volunteers - opp.filled_volunteers;
    const fillPct = Math.min(100, Math.round((opp.filled_volunteers / opp.required_volunteers) * 100));
    const urgency = URGENCY_CONFIG[opp.urgency];
    const dateStr = new Date(opp.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.93, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.93, y: 24 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
                    style={{ maxHeight: '90vh', overflowY: 'auto' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* ── Header banner ── */}
                    <div className="relative p-6 pb-4" style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
                        <button onClick={onClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl font-light">✕</button>

                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                style={{ background: 'rgba(255,255,255,0.1)' }}>
                                {opp.category === 'Environment' ? '🌿' : opp.category === 'Education' ? '📚' : opp.category === 'Healthcare' ? '🏥' : '🤝'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{ background: urgency.bg, color: urgency.color, border: `1px solid ${urgency.color}40` }}>
                                        ● {urgency.label}
                                    </span>
                                    {opp.ngo_verified && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                                            ✓ Verified NGO
                                        </span>
                                    )}
                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                        style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                                        {opp.category}
                                    </span>
                                </div>
                                <h2 className="text-lg font-bold text-white leading-snug">{opp.title}</h2>
                                <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
                                    <span style={{ color: '#10b981' }}>{opp.ngo_name}</span>
                                    <span>•</span>
                                    <span>★ {opp.ngo_rating}</span>
                                </p>
                            </div>
                        </div>

                        {/* SDG tags */}
                        <div className="flex gap-1.5 flex-wrap">
                            {opp.sdg_tags.map(t => (
                                <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded"
                                    style={{ background: (SDG_COLORS[t] || '#3b82f6') + '25', color: SDG_COLORS[t] || '#3b82f6', border: `1px solid ${SDG_COLORS[t] || '#3b82f6'}40` }}>
                                    SDG {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="p-6 space-y-5">

                        {/* Event details grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: '📅', label: 'Date', val: dateStr },
                                { icon: '⏰', label: 'Time', val: `${opp.start_time} – ${opp.end_time}` },
                                { icon: '📍', label: 'Location', val: opp.location },
                                { icon: '⏱️', label: 'Duration', val: `${opp.hours_commitment} hours` },
                            ].map(item => (
                                <div key={item.label} className="p-3 rounded-xl"
                                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">{item.icon} {item.label}</p>
                                    <p className="text-xs font-semibold text-slate-800">{item.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Volunteer spots progress */}
                        <div className="p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="font-semibold text-slate-700">👥 Volunteer Spots</span>
                                <span className="font-bold" style={{ color: spotsLeft < 20 ? '#ef4444' : '#10b981' }}>
                                    {spotsLeft} spots left
                                </span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-1">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${fillPct}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full rounded-full"
                                    style={{ background: `linear-gradient(90deg, #10b981, #06b6d4)` }} />
                            </div>
                            <p className="text-[10px] text-slate-400">{opp.filled_volunteers} of {opp.required_volunteers} volunteers registered ({fillPct}% filled)</p>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2">About this Opportunity</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{opp.description}</p>
                        </div>

                        {/* Impact */}
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#10b981' }}>🌍 Your Impact</p>
                            <p className="text-sm leading-relaxed" style={{ color: '#1a4a3a' }}>{opp.impact_statement}</p>
                        </div>

                        {/* Skills / Bring / Provided */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { title: '🎯 Skills Needed', items: opp.skills_needed, color: '#3b82f6' },
                                { title: '🎒 What to Bring', items: opp.what_to_bring, color: '#f59e0b' },
                                { title: '🎁 We Provide', items: opp.what_provided, color: '#10b981' },
                            ].map(section => (
                                <div key={section.title} className="p-3 rounded-xl"
                                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                    <p className="text-[10px] font-semibold mb-2" style={{ color: section.color }}>{section.title}</p>
                                    <ul className="space-y-1">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="text-[10px] text-slate-600 flex items-start gap-1">
                                                <span style={{ color: section.color }}>•</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Apply CTA */}
                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose}
                                className="flex-none px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                                style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                Back
                            </button>
                            <button
                                onClick={() => onApply(opp.id)}
                                disabled={applying || applied || spotsLeft === 0}
                                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{
                                    background: applied ? 'linear-gradient(135deg,#10b981,#059669)'
                                        : spotsLeft === 0 ? '#94a3b8'
                                            : 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                                    boxShadow: applied || spotsLeft === 0 ? 'none' : '0 4px 16px rgba(59,130,246,0.3)',
                                }}>
                                {applying ? '⏳ Applying...'
                                    : applied ? '✅ Application Submitted!'
                                        : spotsLeft === 0 ? 'Fully Booked'
                                            : '👋 Confirm Volunteer Application'}
                            </button>
                        </div>

                        {applied && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl text-center"
                                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                <p className="text-sm font-semibold" style={{ color: '#10b981' }}>🎉 You&apos;re registered!</p>
                                <p className="text-xs mt-1 text-slate-500">You&apos;ll receive a confirmation email. After the event, your certificate will appear in <strong>My Volunteer History</strong>.</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
