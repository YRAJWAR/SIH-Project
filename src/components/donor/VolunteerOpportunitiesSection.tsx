'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { VolunteerOpportunity } from './VolunteerDetailModal';

const SDG_COLORS: Record<number, string> = {
    1: '#e5243b', 2: '#dda63a', 3: '#4c9f38', 4: '#c5192d', 5: '#ff3a21',
    6: '#26bde2', 7: '#fcc30b', 8: '#a21949', 9: '#fd6e25', 10: '#dd1367',
    11: '#fd9d24', 12: '#bf8b2e', 13: '#3f7e44', 14: '#0a97d9', 15: '#56c02b',
    16: '#0056c8', 17: '#19486a',
};

const CATEGORY_ICONS: Record<string, string> = {
    Environment: '🌿',
    Education: '📚',
    Healthcare: '🏥',
    default: '🤝',
};

const URGENCY_CONFIG = {
    high: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
    medium: { label: 'Filling Fast', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    low: { label: 'Open', color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
};

interface Props {
    opportunities: VolunteerOpportunity[];
    appliedIds: Set<string>;
    applyingToId: string | null;
    onCardClick: (opp: VolunteerOpportunity) => void;
    onQuickApply: (id: string) => void;
}

export default function VolunteerOpportunitiesSection({
    opportunities, appliedIds, applyingToId, onCardClick, onQuickApply
}: Props) {
    if (opportunities.length === 0) {
        return (
            <div className="text-center py-10">
                <div className="text-4xl mb-3">🙋</div>
                <p className="text-sm text-slate-500">No upcoming volunteer opportunities right now. Check back soon!</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {opportunities.map((opp, i) => {
                const spotsLeft = opp.required_volunteers - opp.filled_volunteers;
                const fillPct = Math.min(100, Math.round((opp.filled_volunteers / opp.required_volunteers) * 100));
                const urgency = URGENCY_CONFIG[opp.urgency] || URGENCY_CONFIG.low;
                const isApplied = appliedIds.has(opp.id);
                const isFull = spotsLeft <= 0;
                const catIcon = CATEGORY_ICONS[opp.category] || CATEGORY_ICONS.default;
                const dateStr = new Date(opp.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

                return (
                    <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => onCardClick(opp)}
                        className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
                        style={{ border: '1px solid #e2e8f0', background: '#fff' }}
                    >
                        {/* Card header with gradient */}
                        <div className="relative p-4 pb-3" style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)' }}>
                            {/* Urgency + Category */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                        style={{ background: urgency.bg, color: urgency.color, border: `1px solid ${urgency.color}40` }}>
                                        ● {urgency.label}
                                    </span>
                                    {opp.ngo_verified && (
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                            ✓ Verified
                                        </span>
                                    )}
                                </div>
                                <span className="text-lg">{catIcon}</span>
                            </div>

                            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 mb-1">{opp.title}</h3>
                            <p className="text-[11px]" style={{ color: '#10b981' }}>
                                {opp.ngo_name} &nbsp;·&nbsp; ★ {opp.ngo_rating}
                            </p>
                        </div>

                        <div className="p-4">
                            {/* SDG tags */}
                            <div className="flex gap-1.5 mb-3 flex-wrap">
                                {opp.sdg_tags.map(t => (
                                    <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded"
                                        style={{ background: (SDG_COLORS[t] || '#3b82f6') + '18', color: SDG_COLORS[t] || '#3b82f6' }}>
                                        SDG {t}
                                    </span>
                                ))}
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{opp.description}</p>

                            {/* Quick meta row */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {[
                                    { icon: '📅', val: dateStr },
                                    { icon: '⏰', val: `${opp.start_time} – ${opp.end_time}` },
                                    { icon: '📍', val: opp.location.split(',')[0] },
                                    { icon: '⏱️', val: `${opp.hours_commitment} hrs` },
                                ].map(item => (
                                    <div key={item.icon} className="flex items-center gap-1.5 text-xs text-slate-600">
                                        <span>{item.icon}</span>
                                        <span className="truncate">{item.val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Volunteer fill bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className="text-slate-500">👥 {opp.filled_volunteers}/{opp.required_volunteers} volunteers</span>
                                    <span className="font-semibold" style={{ color: spotsLeft < 20 ? '#ef4444' : '#10b981' }}>
                                        {isFull ? 'Full' : `${spotsLeft} left`}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all"
                                        style={{ width: `${fillPct}%`, background: `linear-gradient(90deg, #10b981, #06b6d4)` }} />
                                </div>
                            </div>

                            {/* Impact teaser */}
                            <p className="text-[10px] text-slate-400 italic mb-4 line-clamp-1">🌍 {opp.impact_statement}</p>

                            {/* CTA row */}
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => onCardClick(opp)}
                                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                                    style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                                    View Details →
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); onQuickApply(opp.id); }}
                                    disabled={applyingToId === opp.id || isApplied || isFull}
                                    className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{
                                        background: isApplied ? 'linear-gradient(135deg,#10b981,#059669)'
                                            : isFull ? '#94a3b8'
                                                : 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                                    }}>
                                    {applyingToId === opp.id ? '⏳ Applying...'
                                        : isApplied ? '✅ Applied'
                                            : isFull ? 'Fully Booked'
                                                : '👋 Quick Apply'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
