'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Check,
    Clock,
    MapPin,
    Calendar,
    ArrowLeft,
    Shield,
    Share2,
    Copy,
    Building2,
    ExternalLink,
    AlertCircle,
    UserCheck,
    Sparkles,
    MessageSquare,
    CheckCircle2,
} from 'lucide-react';
import { SDG_INFO } from '@/data/mockData';

interface PipelineStage {
    step: number;
    id: string;
    title: string;
    description: string;
    state: 'completed' | 'current' | 'upcoming';
    timestamp?: string | null;
}

interface AssignedHEI {
    name: string;
    district: string;
}

interface ChallengeStatusData {
    id: string;
    title: string;
    description: string;
    category: string;
    district: string;
    block?: string;
    gpsLat: number;
    gpsLng: number;
    photoUrls: string[];
    videoUrls: string[];
    status: string;
    sdgTags: number[];
    aiConfidence?: number;
    gpVerified: boolean;
    submittedBy?: string;
    submittedByMasked: string;
    isAnonymous: boolean;
    submittedVia?: string;
    createdAt: string;
    updatedAt: string;
    pipeline: PipelineStage[];
    proposalsCount: number;
    assignedInstitutions: string[];
    assignedHEI?: AssignedHEI | null;
}

const STATUS_ORDER = [
    'SUBMITTED',
    'AI_PROCESSED',
    'VALIDATED',
    'UNIVERSITY_ASSIGNED',
    'TEAM_FORMED',
    'IN_PROGRESS',
    'COMPLETED',
    'DEPLOYED',
];

export default function TrackChallengePage() {
    const params = useParams();
    const challengeId = params?.challengeId as string;

    const [data, setData] = useState<ChallengeStatusData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        if (!challengeId) return;

        const fetchStatus = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/challenges/${challengeId}/status`);
                const json = await res.json();
                if (!res.ok || !json.success) {
                    throw new Error(json.error || 'Failed to load challenge status');
                }
                setData(json.data);
            } catch (err: any) {
                setError(err.message || 'Error fetching status');
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [challengeId]);

    // Share Button: Copies URL to clipboard with "Share this challenge"
    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm">Retrieving Triple-Helix tracking telemetry...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
                    <h1 className="text-xl font-bold text-white mb-2">Challenge Not Found</h1>
                    <p className="text-sm text-slate-400 mb-6">
                        {error || 'The requested challenge could not be located in the Jharkhand platform registry.'}
                    </p>
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/track"
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
                        >
                            Try Another Tracking Code
                        </Link>
                        <Link
                            href="/citizen/submit"
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
                        >
                            Submit a New Challenge
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Determine if challenge has reached or passed UNIVERSITY_ASSIGNED status
    const currentStatusIndex = Math.max(0, STATUS_ORDER.indexOf(data.status));
    const universityAssignedIndex = STATUS_ORDER.indexOf('UNIVERSITY_ASSIGNED');
    const isPastUniversityAssigned = currentStatusIndex >= universityAssignedIndex;

    // Submitter display formatting
    // If isAnonymous=true: "Submitted by: Community Member, [District]"
    // If isAnonymous=false: "Submitted by: [firstName] [lastName], [District]"
    // Never show email or phone publicly
    const submitterDisplayText = data.submittedByMasked.startsWith('Submitted by:')
        ? data.submittedByMasked
        : `Submitted by: ${data.submittedByMasked}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#060a12] via-[#0b1220] to-[#080d18] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Navigation Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/track"
                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            title="Back to search"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                    Triple-Helix Public Tracker
                                </span>
                                <span className="text-xs text-slate-600">•</span>
                                <span className="text-xs text-slate-400 font-mono">ID: {data.id}</span>
                                {data.submittedVia === 'GRAM_PANCHAYAT_NODE' && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        GP Node Aggregated
                                    </span>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                                {data.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        {/* Requirement 4: Share button with "Share this challenge" */}
                        <button
                            type="button"
                            onClick={handleShare}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-bold border border-blue-500/30 transition shadow-sm"
                        >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                            <span>{copied ? 'Link Copied to Clipboard!' : 'Share this challenge'}</span>
                        </button>

                        <Link
                            href="/citizen/submit"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                        >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Submit New</span>
                        </Link>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* REQUIREMENT 1: ANIMATED PIPELINE PROGRESS BAR (8 STAGES)  */}
                {/* Horizontal on >= 640px, stacks vertically on < 640px      */}
                {/* ========================================================= */}
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                8-Stage Resolution Pipeline Status
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Real-time verification flow from citizen registration to on-ground village deployment.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Current Phase:</span>
                            <span className="text-xs font-bold font-mono px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                {data.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>

                    {/* DESKTOP VIEW: HORIZONTAL PIPELINE (screens >= 640px) */}
                    <div className="hidden sm:block pt-4 pb-2">
                        <div className="relative flex items-center justify-between w-full">
                            {data.pipeline.map((stage, index) => {
                                const isCompleted = stage.state === 'completed';
                                const isCurrent = stage.state === 'current';
                                const isFuture = stage.state === 'upcoming';
                                const hasNext = index < data.pipeline.length - 1;
                                const nextIsCompletedOrCurrent = hasNext && data.pipeline[index + 1].state !== 'upcoming';

                                return (
                                    <React.Fragment key={stage.id}>
                                        {/* Stage Node */}
                                        <div className="relative flex flex-col items-center group z-10">
                                            {/* Stage Circle Indicator */}
                                            {isCompleted ? (
                                                // Completed: Solid blue circle with white checkmark
                                                <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/30 transition-transform duration-300 group-hover:scale-105">
                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                </div>
                                            ) : isCurrent ? (
                                                // Current: Pulsing blue ring animation (CSS keyframes)
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-blue-400 text-white flex items-center justify-center font-bold text-xs ring-4 ring-blue-500/40 animate-pulse shadow-lg shadow-blue-500/40">
                                                        <span className="w-2.5 h-2.5 bg-white rounded-full" />
                                                    </div>
                                                </div>
                                            ) : (
                                                // Future: Grey outlined circle
                                                <div className="w-9 h-9 rounded-full border-2 border-slate-700 bg-slate-900 text-slate-500 flex items-center justify-center font-semibold text-xs transition-colors">
                                                    <span>{index + 1}</span>
                                                </div>
                                            )}

                                            {/* Stage Title and Timestamp Below */}
                                            <div className="absolute top-11 flex flex-col items-center text-center w-24">
                                                <span
                                                    className={`text-[11px] font-bold leading-tight ${
                                                        isCompleted
                                                            ? 'text-white'
                                                            : isCurrent
                                                            ? 'text-blue-400'
                                                            : 'text-slate-500'
                                                    }`}
                                                >
                                                    {stage.title}
                                                </span>

                                                {/* Timestamp below completed / current stage */}
                                                {(isCompleted || isCurrent) && stage.timestamp && (
                                                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                        {stage.timestamp}
                                                    </span>
                                                )}
                                                {isCurrent && (
                                                    <span className="text-[9px] text-blue-400 font-extrabold uppercase mt-0.5 tracking-wider">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Connecting Line between Circles */}
                                        {hasNext && (
                                            <div className="flex-1 h-0.5 mx-1 -mt-6 z-0">
                                                <div
                                                    className={`h-full transition-all duration-500 ${
                                                        nextIsCompletedOrCurrent ? 'bg-blue-600' : 'bg-slate-700'
                                                    }`}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        {/* Space reservation for stage titles below */}
                        <div className="h-14" />
                    </div>

                    {/* MOBILE VIEW: VERTICAL PIPELINE (screens < 640px) */}
                    <div className="block sm:hidden space-y-5 pt-2 pl-2">
                        {data.pipeline.map((stage, index) => {
                            const isCompleted = stage.state === 'completed';
                            const isCurrent = stage.state === 'current';
                            const hasNext = index < data.pipeline.length - 1;

                            return (
                                <div key={stage.id} className="relative flex items-start gap-4">
                                    {/* Vertical Connecting Line */}
                                    {hasNext && (
                                        <div
                                            className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px ${
                                                isCompleted ? 'bg-blue-600' : 'bg-slate-700'
                                            }`}
                                        />
                                    )}

                                    {/* Circle Marker */}
                                    <div className="relative z-10 flex-shrink-0">
                                        {isCompleted ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-600/30">
                                                <Check className="w-4 h-4 stroke-[3]" />
                                            </div>
                                        ) : isCurrent ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-400 text-white flex items-center justify-center font-bold text-xs ring-4 ring-blue-500/40 animate-pulse shadow-lg shadow-blue-500/40">
                                                <span className="w-2 h-2 bg-white rounded-full" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-900 text-slate-500 flex items-center justify-center font-semibold text-xs">
                                                <span>{index + 1}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stage Details */}
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between">
                                            <h3
                                                className={`text-xs font-bold ${
                                                    isCompleted
                                                        ? 'text-white'
                                                        : isCurrent
                                                        ? 'text-blue-400'
                                                        : 'text-slate-500'
                                                }`}
                                            >
                                                Stage {stage.step}: {stage.title}
                                            </h3>
                                            {stage.timestamp && (isCompleted || isCurrent) && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {stage.timestamp}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                                            {stage.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Grid: Overview & "Who is working on it" */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Columns: Challenge Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Challenge Description Card */}
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                            <div>
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Community Problem Statement
                                </h2>
                                <p className="text-sm text-slate-200 leading-relaxed">
                                    {data.description}
                                </p>
                            </div>

                            {/* Location & SDG Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                        Field Location
                                    </span>
                                    <div className="flex items-start gap-2 text-xs text-slate-300">
                                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-white">{data.district}, Jharkhand</p>
                                            {data.block && <p className="text-slate-400">Block: {data.block}</p>}
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                GPS: {data.gpsLat.toFixed(4)}° N, {data.gpsLng.toFixed(4)}° E
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                        Target UN SDGs
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {data.sdgTags.map((tagId) => {
                                            const sdg = SDG_INFO.find((s) => s.id === tagId);
                                            return (
                                                <span
                                                    key={tagId}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-xs"
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

                            {/* Requirement 3: Anonymous Submitter Attribution */}
                            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <span className="font-medium text-slate-200">
                                        {submitterDisplayText}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Logged {new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Photos (if present) */}
                        {data.photoUrls && data.photoUrls.length > 0 && (
                            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Ground Evidence Photography
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {data.photoUrls.map((url, i) => (
                                        <div key={i} className="rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-950">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt={`Ground evidence ${i + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: "Who is working on it" card (Shown ONLY after UNIVERSITY_ASSIGNED) */}
                    <div className="space-y-6">
                        {isPastUniversityAssigned && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-700/50 rounded-2xl p-6 shadow-xl space-y-4"
                            >
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider pb-2 border-b border-indigo-900/60">
                                    <Building2 className="w-4 h-4 text-indigo-400" />
                                    <span>Who is working on this challenge</span>
                                </div>

                                <div className="space-y-1.5">
                                    <h3 className="text-base font-extrabold text-white">
                                        {data.assignedHEI?.name || data.assignedInstitutions[0] || 'National Institute of Technology Jamshedpur'}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>
                                            {data.assignedHEI?.district || `${data.district}, Jharkhand`}
                                        </span>
                                    </div>
                                </div>

                                {/* Platform Masked Contact (Requirement 2) */}
                                <div className="bg-indigo-950/60 border border-indigo-800/60 rounded-xl p-3.5 text-xs text-indigo-200 flex items-start gap-2.5">
                                    <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">
                                        Have questions? The team receives messages via the platform.
                                    </p>
                                </div>

                                <div className="pt-1 text-[11px] text-slate-400">
                                    <span>Faculty mentors and student researchers are operating under institutional R&D and public safety protocols.</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Triple-Helix Stakeholder Overview */}
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 text-xs text-slate-400">
                            <div className="flex items-center gap-2 text-slate-300 font-bold">
                                <Shield className="w-4 h-4 text-blue-400" />
                                <span>Triple-Helix Governance Model</span>
                            </div>
                            <p className="leading-relaxed">
                                Under Jharkhand Problem Statement SIH26043, Government validates societal priorities, universities engineer prototypes, corporate CSR partners fund deployment, and Gram Panchayats verify on-ground outcomes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
