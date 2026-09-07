'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    FileText,
    Sparkles,
    CheckCircle2,
    MapPin,
    AlertCircle,
    Building2,
    Calendar,
    IndianRupee,
    ShieldCheck,
    Send,
    Save,
    Clock,
    Award,
    HelpCircle,
} from 'lucide-react';
import { SDG_INFO } from '@/data/mockData';

interface CorporatePartner {
    id: string;
    name: string;
    registration_number?: string;
    district?: string;
    industry?: string;
}

interface ComponentScore {
    score: number;
    label: string;
    feedback: string;
}

interface QualityScoreData {
    overallScore: number;
    components: {
        feasibility: ComponentScore;
        budgetReasonableness: ComponentScore;
        teamDomainAlignment: ComponentScore;
        approachCompleteness: ComponentScore;
    };
    wordCount: number;
    recommendations: string[];
}

export default function ProposalBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const challengeId = params?.challengeId as string;

    // Challenge info
    const [challenge, setChallenge] = useState<any | null>(null);
    const [loadingChallenge, setLoadingChallenge] = useState(true);

    // Form inputs
    const [approach, setApproach] = useState('');
    const [timelineWeeks, setTimelineWeeks] = useState(16);
    const [budgetRequested, setBudgetRequested] = useState<number | string>(450000);
    const [csrPartner, setCsrPartner] = useState('Open to any partner');
    const [ipDeclaration, setIpDeclaration] = useState('Open Source — published under MIT/CC license');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Corporate partners list
    const [corporateList, setCorporateList] = useState<CorporatePartner[]>([]);
    const [loadingCorporate, setLoadingCorporate] = useState(false);

    // AI Pre-scorer states
    const [scoring, setScoring] = useState(false);
    const [qualityScores, setQualityScores] = useState<QualityScoreData | null>(null);

    // Submission states
    const [savingDraft, setSavingDraft] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch Challenge Details
    useEffect(() => {
        if (!challengeId) return;

        const fetchChallenge = async () => {
            setLoadingChallenge(true);
            try {
                const res = await fetch(`/api/challenges/${challengeId}/status`);
                const json = await res.json();
                if (res.ok && json.success && json.data) {
                    setChallenge(json.data);
                } else {
                    // Fallback to Challenge #2 or default
                    setChallenge({
                        id: challengeId,
                        title: 'Open defecation & hygiene sanitation in Simdega tribal hamlets',
                        description:
                            'Rural cluster of 4 villages lacking decentralized eco-friendly bio-toilets. Requires localized engineering prototype and water recycling unit with Gram Panchayat engagement.',
                        district: 'Simdega',
                        category: 'Drinking Water & Sanitation',
                        sdgTags: [6, 3],
                        status: 'TEAM_FORMED',
                    });
                }
            } catch {
                setChallenge({
                    id: challengeId,
                    title: 'Open defecation & hygiene sanitation in Simdega tribal hamlets',
                    description:
                        'Rural cluster of 4 villages lacking decentralized eco-friendly bio-toilets. Requires localized engineering prototype and water recycling unit with Gram Panchayat engagement.',
                    district: 'Simdega',
                    category: 'Drinking Water & Sanitation',
                    sdgTags: [6, 3],
                    status: 'TEAM_FORMED',
                });
            } finally {
                setLoadingChallenge(false);
            }
        };

        fetchChallenge();
    }, [challengeId]);

    // Fetch Existing Proposal (if draft already exists)
    useEffect(() => {
        if (!challengeId) return;

        const fetchExistingProposal = async () => {
            try {
                const res = await fetch(`/api/hei/proposals?challengeId=${challengeId}`);
                const json = await res.json();
                if (res.ok && json.success && json.data) {
                    const p = json.data;
                    if (p.approach) setApproach(p.approach);
                    if (p.timelineWeeks) setTimelineWeeks(p.timelineWeeks);
                    if (p.budgetRequested) setBudgetRequested(p.budgetRequested);
                    if (p.fundingSource) setCsrPartner(p.fundingSource);
                    if (p.ipDeclaration) setIpDeclaration(p.ipDeclaration);
                    setTermsAccepted(true);
                }
            } catch (err) {
                console.warn('No existing proposal found, starting blank form:', err);
            }
        };

        fetchExistingProposal();
    }, [challengeId]);

    // Fetch Corporate Partners from GET /api/corporate/list
    useEffect(() => {
        const fetchCorporates = async () => {
            setLoadingCorporate(true);
            try {
                const res = await fetch('/api/corporate/list');
                const json = await res.json();
                if (res.ok && json.success && Array.isArray(json.data)) {
                    setCorporateList(json.data);
                }
            } catch (err) {
                console.warn('Failed to load corporate list:', err);
            } finally {
                setLoadingCorporate(false);
            }
        };

        fetchCorporates();
    }, []);

    // AI Quality Pre-scorer Trigger
    const handlePreviewQualityScore = async () => {
        setScoring(true);
        setToastMessage(null);

        try {
            const res = await fetch('/api/hei/proposals/score-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId,
                    approach,
                    timelineWeeks,
                    budgetRequested: Number(budgetRequested),
                    csrPartner,
                    ipDeclaration,
                }),
            });

            const json = await res.json();
            if (res.ok && json.success && json.data) {
                setQualityScores(json.data);
                setToastMessage({
                    type: 'success',
                    text: `AI Quality Pre-Score calculated: ${json.data.overallScore}/100`,
                });
            } else {
                throw new Error(json.error || 'Failed to compute quality score');
            }
        } catch (err: any) {
            setToastMessage({
                type: 'error',
                text: err.message || 'Error generating AI score preview',
            });
        } finally {
            setScoring(false);
        }
    };

    // Save Draft
    const handleSaveDraft = async () => {
        setSavingDraft(true);
        setToastMessage(null);

        try {
            const res = await fetch('/api/hei/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId,
                    approach,
                    timelineWeeks,
                    budgetRequested: Number(budgetRequested),
                    csrPartner,
                    ipDeclaration,
                    termsAccepted,
                    status: 'DRAFT',
                    aiQualityScore: qualityScores?.overallScore,
                }),
            });

            const json = await res.json();
            if (res.ok && json.success) {
                setToastMessage({
                    type: 'success',
                    text: 'Proposal draft saved successfully!',
                });
            } else {
                throw new Error(json.error || 'Failed to save draft');
            }
        } catch (err: any) {
            setToastMessage({
                type: 'error',
                text: err.message || 'Could not save draft proposal',
            });
        } finally {
            setSavingDraft(false);
        }
    };

    // Submit Proposal
    const handleSubmitProposal = async () => {
        if (!approach.trim()) {
            setToastMessage({
                type: 'error',
                text: 'Please provide an approach description before submitting.',
            });
            return;
        }

        if (!termsAccepted) {
            setToastMessage({
                type: 'error',
                text: 'Please accept the platform Terms of Engagement to submit.',
            });
            return;
        }

        setSubmitting(true);
        setToastMessage(null);

        try {
            const res = await fetch('/api/hei/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengeId,
                    approach,
                    timelineWeeks,
                    budgetRequested: Number(budgetRequested),
                    csrPartner,
                    ipDeclaration,
                    termsAccepted,
                    status: 'SUBMITTED',
                    aiQualityScore: qualityScores?.overallScore,
                }),
            });

            const json = await res.json();
            if (res.ok && json.success) {
                setToastMessage({
                    type: 'success',
                    text: 'Proposal submitted! P2 notifications sent to Government and CSR partners.',
                });
                setTimeout(() => {
                    router.push('/dashboard/hei/proposals');
                }, 1800);
            } else {
                throw new Error(json.error || 'Failed to submit proposal');
            }
        } catch (err: any) {
            setToastMessage({
                type: 'error',
                text: err.message || 'Error submitting proposal',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-16">
            {/* Top Navigation Link */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/hei"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Challenge Inbox
                </Link>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Phase 3: Formal R&D Proposal Formulation</span>
                </div>
            </div>

            {/* Header: Challenge Title, District, SDG tags (Same as Team Formation) */}
            {loadingChallenge ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto" />
                </div>
            ) : (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-800/60 shadow-md">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 uppercase">
                            Screen 3 • Proposal Builder
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            {challenge?.district || 'Jharkhand'}, Jharkhand
                        </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2">
                        {challenge?.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mb-4">
                        {challenge?.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                        <span className="text-xs text-slate-400 mr-1">Target UN SDGs:</span>
                        {challenge?.sdgTags?.map((tagId: number) => {
                            const sdg = SDG_INFO.find((s) => s.id === tagId);
                            return (
                                <span
                                    key={tagId}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold text-white shadow-xs"
                                    style={{ backgroundColor: sdg ? sdg.color : '#059669' }}
                                >
                                    <span>{sdg?.icon}</span>
                                    <span>SDG {tagId}: {sdg?.name}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
                            toastMessage.type === 'success'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {toastMessage.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            )}
                            <span className="font-medium">{toastMessage.text}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setToastMessage(null)}
                            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Proposal Form Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-sm space-y-7">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Technical R&D Proposal Form</h2>
                        <p className="text-xs text-slate-500">
                            Provide methodology, timeline, requested grant allocation, and IP declaration for CSR funding matching.
                        </p>
                    </div>
                </div>

                {/* 1. Approach */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            Approach & Methodology
                            <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">
                            {approach.trim().split(/\s+/).filter(Boolean).length} words (150+ words optimal)
                        </span>
                    </div>
                    <textarea
                        rows={6}
                        value={approach}
                        onChange={(e) => setApproach(e.target.value)}
                        placeholder="Describe how your team will solve this challenge. Include methodology, key deliverables, and expected outcomes."
                        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 placeholder:text-slate-400 leading-relaxed"
                    />
                </div>

                {/* 2. Timeline (Slider: 4 to 52 weeks) */}
                <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            Timeline (Execution to Community Handover)
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                                {timelineWeeks} weeks
                            </span>
                            <span className="text-[11px] text-slate-500 hidden sm:inline">
                                (~{Math.round((timelineWeeks / 4.3) * 10) / 10} months)
                            </span>
                        </div>
                    </div>
                    <input
                        type="range"
                        min={4}
                        max={52}
                        step={1}
                        value={timelineWeeks}
                        onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                        <span>4 weeks (Rapid sprint)</span>
                        <span>16 weeks (Standard academic pilot)</span>
                        <span>52 weeks (Annual deployment)</span>
                    </div>
                </div>

                {/* 3. Budget Requested */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <IndianRupee className="w-4 h-4 text-indigo-600" />
                            Budget Requested
                            <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                ₹
                            </span>
                            <input
                                type="number"
                                min={10000}
                                step={10000}
                                value={budgetRequested}
                                onChange={(e) => setBudgetRequested(e.target.value)}
                                placeholder="450000"
                                className="w-full text-xs sm:text-sm pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 font-semibold"
                            />
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Includes hardware materials, testing kits, travel to {challenge?.district || 'district'}, and student stipends.
                        </p>
                    </div>

                    {/* 4. CSR Partner Preference */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            CSR Partner Preference
                        </label>
                        <select
                            value={csrPartner}
                            onChange={(e) => setCsrPartner(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 bg-white font-medium"
                        >
                            <option value="Open to any partner">Open to any partner (Maximum matching reach)</option>
                            {loadingCorporate ? (
                                <option disabled>Loading registered CSR companies...</option>
                            ) : (
                                corporateList.map((corp) => (
                                    <option key={corp.id} value={corp.name}>
                                        {corp.name} {corp.district ? `(${corp.district})` : ''}
                                    </option>
                                ))
                            )}
                        </select>
                        <p className="text-[11px] text-slate-500">
                            Preference shared with Department of Planning & CSR Council.
                        </p>
                    </div>
                </div>

                {/* 5. IP Declaration (Radio Buttons) */}
                <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Intellectual Property (IP) Declaration
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            {
                                id: 'student-ip',
                                value: 'Student IP — students own the intellectual property',
                                title: 'Student IP',
                                desc: 'Students own the intellectual property and patent rights.',
                            },
                            {
                                id: 'university-ip',
                                value: 'University IP — university retains ownership',
                                title: 'University IP',
                                desc: 'University retains ownership via institutional tech-transfer cell.',
                            },
                            {
                                id: 'open-source',
                                value: 'Open Source — published under MIT/CC license',
                                title: 'Open Source',
                                desc: 'Published under MIT/CC license for maximum public benefit.',
                            },
                        ].map((option) => {
                            const selected = ipDeclaration === option.value;
                            return (
                                <label
                                    key={option.id}
                                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                                        selected
                                            ? 'bg-indigo-50/60 border-indigo-400 ring-1 ring-indigo-400/30'
                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <input
                                            type="radio"
                                            name="ipDeclaration"
                                            value={option.value}
                                            checked={selected}
                                            onChange={() => setIpDeclaration(option.value)}
                                            className="mt-0.5 accent-indigo-600"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 block">
                                                {option.title}
                                            </span>
                                            <span className="text-[11px] text-slate-500 leading-snug block mt-0.5">
                                                {option.desc}
                                            </span>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* 6. Terms Acceptance Checkbox */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-600"
                        />
                        <div className="text-xs text-slate-700 leading-relaxed">
                            <span className="font-semibold text-slate-900">Terms of Technical Integrity: </span>
                            I accept that the university bears responsibility for the technical soundness of this proposal (per platform Terms of Engagement), including milestone safety and field validation protocols.
                        </div>
                    </label>
                </div>

                {/* AI QUALITY PRE-SCORER SECTION */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl text-white">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <h3 className="text-sm font-bold text-white tracking-wide">
                                    AI Quality Pre-Scorer (Advisory Engine)
                                </h3>
                            </div>
                            <p className="text-[11px] text-slate-300">
                                Real-time algorithmic check against feasibility, budget reasonableness, team-domain alignment, and completeness.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handlePreviewQualityScore}
                            disabled={scoring}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{scoring ? 'Evaluating Proposal...' : 'Preview Quality Score'}</span>
                        </button>
                    </div>

                    {/* Pre-Scorer Results Display (4 Colored Progress Bars) */}
                    {qualityScores && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-indigo-50/50 border border-indigo-200/80 rounded-2xl p-5 space-y-5"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                                        {qualityScores.overallScore}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                                            Composite Proposal Quality Index
                                        </h4>
                                        <span className="text-[11px] text-indigo-700">
                                            Advisory Pre-Score • Does not block submission
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Ready for CSR Review
                                </span>
                            </div>

                            {/* 4 Colored Progress Bars */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 1. Feasibility (Emerald) */}
                                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-700">1. Feasibility</span>
                                        <span className="font-extrabold text-emerald-700">
                                            {qualityScores.components.feasibility.score}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                                            style={{ width: `${qualityScores.components.feasibility.score}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-tight">
                                        {qualityScores.components.feasibility.feedback}
                                    </p>
                                </div>

                                {/* 2. Budget Reasonableness (Indigo) */}
                                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-700">2. Budget Reasonableness</span>
                                        <span className="font-extrabold text-indigo-700">
                                            {qualityScores.components.budgetReasonableness.score}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                                            style={{ width: `${qualityScores.components.budgetReasonableness.score}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-tight">
                                        {qualityScores.components.budgetReasonableness.feedback}
                                    </p>
                                </div>

                                {/* 3. Team-Domain Alignment (Amber) */}
                                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-700">3. Team-Domain Alignment</span>
                                        <span className="font-extrabold text-amber-600">
                                            {qualityScores.components.teamDomainAlignment.score}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-amber-500 h-full rounded-full transition-all duration-700"
                                            style={{ width: `${qualityScores.components.teamDomainAlignment.score}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-tight">
                                        {qualityScores.components.teamDomainAlignment.feedback}
                                    </p>
                                </div>

                                {/* 4. Approach Completeness (Purple) */}
                                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-xs space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-700">4. Approach Completeness</span>
                                        <span className="font-extrabold text-purple-700">
                                            {qualityScores.components.approachCompleteness.score}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-purple-600 h-full rounded-full transition-all duration-700"
                                            style={{ width: `${qualityScores.components.approachCompleteness.score}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-tight">
                                        {qualityScores.components.approachCompleteness.feedback}
                                    </p>
                                </div>
                            </div>

                            {/* Recommendations */}
                            {qualityScores.recommendations.length > 0 && (
                                <div className="bg-white/90 p-3.5 rounded-xl border border-indigo-100 text-[11px] space-y-1">
                                    <span className="font-bold text-slate-700 block">Pre-Scorer Recommendations:</span>
                                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                        {qualityScores.recommendations.map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={savingDraft || submitting}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 text-slate-500" />
                        <span>{savingDraft ? 'Saving Draft...' : 'Save Draft'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmitProposal}
                        disabled={submitting || savingDraft}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        <span>{submitting ? 'Submitting to CSR & GOV...' : 'Submit Proposal'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
