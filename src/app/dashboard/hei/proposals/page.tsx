'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FileText,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2,
    IndianRupee,
    MapPin,
    Plus,
} from 'lucide-react';
import { SDG_INFO } from '@/data/mockData';

export default function ProposalsIndexPage() {
    const router = useRouter();
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Challenges with formed teams or ready for proposals
    const readyChallenges = [
        {
            id: 'ch-simdega-002',
            title: 'Open defecation & hygiene sanitation in Simdega tribal hamlets',
            district: 'Simdega',
            category: 'Drinking Water & Sanitation',
            sdgTags: [6, 3],
            status: 'TEAM_FORMED',
            teamName: 'Team Simdega EcoSanitation',
            faculty: 'Prof. Anjali Sharma',
            membersCount: 4,
        },
        {
            id: 'hero-challenge-pakur-001',
            title: 'Arsenic and fluoride contamination in drinking water wells',
            district: 'Pakur',
            category: 'Drinking Water & Sanitation',
            sdgTags: [6, 3],
            status: 'ACCEPTED',
            teamName: 'NIT JSR Water R&D Cell',
            faculty: 'Prof. Anjali Sharma',
            membersCount: 4,
        },
    ];

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const res = await fetch('/api/hei/proposals');
                const json = await res.json();
                if (res.ok && json.success && Array.isArray(json.data)) {
                    setProposals(json.data);
                }
            } catch (err) {
                console.warn('Failed to load proposals:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, []);

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-16">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-800/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 uppercase">
                            Screen 3 • R&D Proposal Formulation Hub
                        </span>
                    </div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">
                        University Proposal Builder & CSR Submissions
                    </h1>
                    <p className="text-xs text-slate-300 max-w-2xl mt-1">
                        Formulate technical methodologies, run AI quality pre-scorers, request CSR funding allocations, and submit proposals for Smart India Hackathon challenges.
                    </p>
                </div>

                <Link
                    href="/dashboard/hei/proposal/ch-simdega-002"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition whitespace-nowrap self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Build Proposal (Challenge #2)</span>
                </Link>
            </div>

            {/* Challenges Ready for Proposals */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        Challenges Ready for Proposal Submission
                    </h2>
                    <span className="text-xs text-slate-500">Teams formed & ready</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {readyChallenges.map((ch) => {
                        const existing = proposals.find((p) => p.challengeId === ch.id);
                        return (
                            <div
                                key={ch.id}
                                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between space-y-4"
                            >
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            {ch.status === 'ACCEPTED' ? 'Proposal Accepted' : 'Team Ready'}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                            {ch.district}, Jharkhand
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                                        {ch.title}
                                    </h3>

                                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold text-slate-800">{ch.teamName}</span>
                                            <span className="block text-slate-500 text-[10px]">Lead: {ch.faculty}</span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-700">
                                            {ch.membersCount} Members
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        {ch.sdgTags.map((t) => {
                                            const s = SDG_INFO.find((item) => item.id === t);
                                            return (
                                                <span
                                                    key={t}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                                                    style={{ backgroundColor: s ? s.color : '#059669' }}
                                                >
                                                    {s?.icon} SDG {t}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        {existing ? `Status: ${existing.status}` : 'No proposal submitted yet'}
                                    </span>
                                    <Link
                                        href={`/dashboard/hei/proposal/${ch.id}`}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                                    >
                                        <span>{existing ? 'Edit Proposal' : 'Build Proposal'}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Existing Proposals List (if any loaded from DB) */}
            {proposals.length > 0 && (
                <div className="space-y-4 pt-4">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        Submitted & Draft Proposals ({proposals.length})
                    </h2>

                    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
                        {proposals.map((p) => (
                            <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            p.status === 'ACCEPTED'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : p.status === 'SUBMITTED'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {p.status}
                                        </span>
                                        {p.aiQualityScore && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3 text-purple-600" />
                                                AI Quality: {Math.round(p.aiQualityScore * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        {p.challenge?.title || 'Community Innovation Proposal'}
                                    </h4>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                                            ₹{(p.budgetRequested || 450000).toLocaleString('en-IN')}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                            {p.fundingSource || 'Open to CSR'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {p.timelineWeeks || 16} weeks
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/hei/proposal/${p.challengeId || 'ch-simdega-002'}`}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition self-start sm:self-auto"
                                >
                                    <span>View / Edit</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
