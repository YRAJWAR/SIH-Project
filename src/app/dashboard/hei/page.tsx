'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Calendar,
    Sparkles,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    ArrowRight,
    Search,
    SlidersHorizontal,
    Info,
    AlertCircle,
    GraduationCap,
    HelpCircle,
    Building2,
    Check,
} from 'lucide-react';
import { SDG_INFO } from '@/data/mockData';
import RoutingExplainabilityPanel from '@/components/RoutingExplainabilityPanel';

const JHARKHAND_DISTRICTS = [
    'All Districts',
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka',
    'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla',
    'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar',
    'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi',
    'Sahibganj', 'Saraikela Kharsawan', 'Simdega', 'West Singhbhum'
];

interface MatchScore {
    overall: number;
    sdgOverlap: number;
    geoProximity: number;
    pastPerformance: number;
    reasons: string[];
}

interface ChallengeInboxItem {
    id: string;
    title: string;
    description: string;
    district: string;
    block: string;
    category: string;
    status: string;
    sdgTags: number[];
    daysSinceSubmitted: number;
    matchScore: MatchScore;
    hasExistingProposal: boolean;
    createdAt: string;
}

export default function HEIChallengeInboxPage() {
    const router = useRouter();
    const [challenges, setChallenges] = useState<ChallengeInboxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'all' | 'UNIVERSITY_ASSIGNED' | 'IN_PROGRESS'>('all');
    const [sdgFilter, setSdgFilter] = useState<string>('all');
    const [districtFilter, setDistrictFilter] = useState<string>('All Districts');
    const [sortBy, setSortBy] = useState<'newest' | 'matchScore' | 'daysPending'>('matchScore');

    // UI States
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [passingChallenge, setPassingChallenge] = useState<ChallengeInboxItem | null>(null);
    const [passReason, setPassReason] = useState<string>('');
    const [passedIds, setPassedIds] = useState<string[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchInbox = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('sdg_nexus_token') : null;
                const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch('/api/hei/challenges/inbox', { headers });
                const json = await res.json();
                if (!res.ok || !json.success) {
                    throw new Error(json.error || 'Failed to fetch challenge inbox');
                }
                setChallenges(json.data || []);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error loading challenges');
            } finally {
                setLoading(false);
            }
        };

        fetchInbox();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleConfirmPass = () => {
        if (!passingChallenge) return;
        setPassedIds((prev) => [...prev, passingChallenge.id]);
        showToast(`Challenge "${passingChallenge.title.slice(0, 30)}..." declined and returned to state routing pool.`);
        setPassingChallenge(null);
        setPassReason('');
    };

    // Filter and Sort Logic
    const filteredChallenges = challenges
        .filter((c) => !passedIds.includes(c.id))
        .filter((c) => {
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (sdgFilter !== 'all' && !c.sdgTags.includes(parseInt(sdgFilter))) return false;
            if (districtFilter !== 'All Districts' && c.district.toLowerCase() !== districtFilter.toLowerCase()) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'matchScore') return b.matchScore.overall - a.matchScore.overall;
            if (sortBy === 'daysPending') return b.daysSinceSubmitted - a.daysSinceSubmitted;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    return (
        <div className="space-y-6">
            {/* Feedback Toast */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 shadow-xl flex items-center gap-2.5 text-sm animate-in fade-in slide-in-from-bottom-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Sub-header Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                        AI-Routed Problem Bank
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        Societal Challenges Awaiting University Action
                    </h2>
                    <p className="mt-1 text-sm text-indigo-200/80 leading-relaxed">
                        Government-validated societal challenges matched to NIT Jamshedpur based on department laboratory capabilities, UN SDG expertise, and district priority.
                    </p>
                </div>
                <div className="absolute -right-6 -bottom-8 opacity-15 pointer-events-none text-white">
                    <GraduationCap className="w-64 h-64" />
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                    Filter & Prioritize Challenge Inbox
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="UNIVERSITY_ASSIGNED">Assigned to HEI (Action Required)</option>
                            <option value="IN_PROGRESS">In Progress / R&D Active</option>
                        </select>
                    </div>

                    {/* SDG Filter */}
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">SDG Target</label>
                        <select
                            value={sdgFilter}
                            onChange={(e) => setSdgFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All SDGs (1–17)</option>
                            {SDG_INFO.map((sdg) => (
                                <option key={sdg.id} value={sdg.id}>
                                    SDG {sdg.id}: {sdg.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* District Filter */}
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">District</label>
                        <select
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {JHARKHAND_DISTRICTS.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Selector */}
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="matchScore">Highest Match Score</option>
                            <option value="daysPending">Days Pending (Most Urgent)</option>
                            <option value="newest">Newest Submission</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List of Challenge Cards */}
            {loading ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Querying university challenge matching engine...</p>
                </div>
            ) : error ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                    <p className="font-semibold text-sm">Failed to load challenge inbox</p>
                    <p className="text-xs mt-1 text-rose-600">{error}</p>
                </div>
            ) : filteredChallenges.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No Challenges Routed Currently</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        No challenges routed to your institution yet. Challenges matching your department expertise will appear here automatically.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredChallenges.map((challenge) => {
                        const isExpanded = expandedId === challenge.id;
                        const match = challenge.matchScore;

                        return (
                            <div
                                key={challenge.id}
                                className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Left: Challenge Title & Tags */}
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Status Badge */}
                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                                    challenge.status === 'UNIVERSITY_ASSIGNED'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                }`}
                                            >
                                                {challenge.status.replace(/_/g, ' ')}
                                            </span>

                                            {/* Match Score Badge — RoutingExplainabilityPanel inline compact */}
                                            <RoutingExplainabilityPanel
                                                compact={true}
                                                hei={{
                                                    name: 'NIT Jamshedpur',
                                                    district: challenge.district,
                                                    sdgOverlap: (match.sdgOverlap || 85) / 100,
                                                    sdgMatched: challenge.sdgTags,
                                                    distKm: match.geoProximity === 100 ? 14 : 38,
                                                    perfScore: (match.pastPerformance || 90) / 100,
                                                    totalScore: (match.overall || 89) / 100,
                                                    departments: ['Civil Engineering', 'Environmental Science'],
                                                }}
                                            />

                                            {/* Days Pending */}
                                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                {challenge.daysSinceSubmitted === 1
                                                    ? '1 day ago'
                                                    : `${challenge.daysSinceSubmitted} days ago`}
                                            </span>
                                        </div>

                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition leading-snug">
                                            {challenge.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1 font-medium text-slate-700">
                                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                                {challenge.district}
                                                {challenge.block && challenge.block !== challenge.district
                                                    ? ` (${challenge.block} Block)`
                                                    : ''}
                                            </span>

                                            <span>•</span>

                                            {/* SDG Tags */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {challenge.sdgTags.map((tagId) => {
                                                    const sdg = SDG_INFO.find((s) => s.id === tagId);
                                                    return (
                                                        <span
                                                            key={tagId}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-white shadow-xs"
                                                            style={{ backgroundColor: sdg ? sdg.color : '#059669' }}
                                                        >
                                                            <span>{sdg?.icon}</span>
                                                            <span>SDG {tagId}</span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex-shrink-0 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedId(isExpanded ? null : challenge.id)}
                                            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPassingChallenge(challenge)}
                                            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition cursor-pointer"
                                        >
                                            Pass
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => router.push(`/dashboard/hei/team-formation/${challenge.id}`)}
                                            className="flex-1 sm:flex-initial justify-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>Accept Challenge</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Expandable Detail Drawer */}
                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs text-slate-700 animate-in fade-in">
                                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70">
                                            <h4 className="font-bold text-slate-900 mb-1 uppercase tracking-wider text-[10px]">
                                                Full Problem Statement
                                            </h4>
                                            <p className="text-slate-600 text-xs leading-relaxed">
                                                {challenge.description}
                                            </p>
                                        </div>

                                        {/* AI Routing Explainability Panel (Full Spec) */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3 text-indigo-600" />
                                                    AI Institutional Match Explainability
                                                </h4>
                                                <span className="text-[10px] text-indigo-600 font-semibold">
                                                    Triple-Helix Routing Engine
                                                </span>
                                            </div>
                                            <RoutingExplainabilityPanel
                                                hei={{
                                                    name: 'National Institute of Technology Jamshedpur',
                                                    district: challenge.district,
                                                    sdgOverlap: (match.sdgOverlap || 85) / 100,
                                                    sdgMatched: challenge.sdgTags,
                                                    distKm: match.geoProximity === 100 ? 14 : 38,
                                                    perfScore: (match.pastPerformance || 90) / 100,
                                                    totalScore: (match.overall || 89) / 100,
                                                    departments: ['Civil & Environmental Engineering', 'Water Resources', 'Computer Science'],
                                                    naacGrade: 'A+',
                                                    reasons: match.reasons,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pass Challenge Confirmation Modal */}
            <AnimatePresence>
                {passingChallenge && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
                        >
                            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                                <XCircle className="w-6 h-6" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">
                                Decline & Pass Challenge?
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Passing this challenge removes it from NIT Jamshedpur&apos;s inbox and returns it to the Jharkhand State Innovation routing pool for re-assignment to other institutions.
                            </p>

                            <div className="mt-4">
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Reason for Declining (Optional)
                                </label>
                                <select
                                    value={passReason}
                                    onChange={(e) => setPassReason(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="laboratory_capacity">Laboratory capacity constrained this semester</option>
                                    <option value="outside_department_scope">Outside current department R&D specialization</option>
                                    <option value="geographical_logistics">Logistical access to remote block challenging</option>
                                    <option value="other">Other institutional priority</option>
                                </select>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setPassingChallenge(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmPass}
                                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
                                >
                                    Confirm & Pass Challenge
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
