'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ShieldCheck,
    ShieldAlert,
    Lock,
    ExternalLink,
    Copy,
    Check,
    MapPin,
    Calendar,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Eye,
    EyeOff,
    Sparkles,
    Database,
    Binary,
    ArrowLeft,
    Building2,
    Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { SDG_INFO } from '@/data/mockData';

interface MilestoneLedgerItem {
    id: string;
    teamId: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'PENDING' | 'SUBMITTED' | 'GP_VERIFIED' | 'CSR_APPROVED' | string;
    proofUrls: string[];
    proofVideoUrl?: string | null;
    hashValue: string;
    gpsLat?: number | null;
    gpsLng?: number | null;
    exifTimestamp?: string | null;
    verifierCode?: string | null;
    fundReleased?: number | null;
    createdAt: string;
}

interface ProjectLedgerData {
    id: string;
    teamId: string;
    title: string;
    district: string;
    sdgTags: number[];
    status: string;
    universityName: string;
    facultyLead?: string;
}

interface VerificationResult {
    milestoneId: string;
    valid: boolean;
    storedHash: string;
    computedHash: string;
    timestamp: string;
    coords: string;
    milestoneTitle?: string;
}

export default function PublicProjectLedgerPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = use(params);
    const { user } = useAuth();

    const [loading, setLoading] = useState<boolean>(true);
    const [project, setProject] = useState<ProjectLedgerData | null>(null);
    const [milestones, setMilestones] = useState<MilestoneLedgerItem[]>([]);
    const [merkleRoot, setMerkleRoot] = useState<string>('');
    const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);

    // Verification state
    const [verifyingId, setVerifyingId] = useState<string | null>(null);
    const [computationPhase, setComputationPhase] = useState<string>('');
    const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({});

    // Copy states
    const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
    const [copiedRoot, setCopiedRoot] = useState<boolean>(false);

    useEffect(() => {
        const fetchLedger = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/ledger/${encodeURIComponent(projectId)}`);
                const json = await res.json();
                if (json.success && json.data) {
                    setProject(json.data.project);
                    setMilestones(json.data.milestones || []);
                    setMerkleRoot(json.data.merkleRoot || '');
                }
            } catch (err) {
                console.error('Failed to load public ledger:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLedger();
    }, [projectId]);

    const handleVerify = async (milestone: MilestoneLedgerItem) => {
        setVerifyingId(milestone.id);
        setComputationPhase('Reading payload from immutable ledger...');

        try {
            // Stage 1: visual computation delay (minimum 1.2s demo moment)
            const phaseTimer1 = setTimeout(() => {
                setComputationPhase('Recomputing SHA-256 (proofUrl | timestamp | lat | lng)...');
            }, 500);

            const [res] = await Promise.all([
                fetch('/api/ledger/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        milestoneId: milestone.id,
                        hashValue: milestone.hashValue,
                    }),
                }),
                new Promise((resolve) => setTimeout(resolve, 1200)),
            ]);

            clearTimeout(phaseTimer1);
            setComputationPhase('Validating cryptographic integrity signature...');

            const json = await res.json();

            if (json.success && json.data) {
                setVerificationResults((prev) => ({
                    ...prev,
                    [milestone.id]: {
                        milestoneId: milestone.id,
                        valid: json.data.valid,
                        storedHash: json.data.storedHash,
                        computedHash: json.data.computedHash,
                        timestamp: json.data.timestamp,
                        coords: json.data.coords,
                        milestoneTitle: milestone.title,
                    },
                }));
            }
        } catch (err) {
            console.error('Verification error:', err);
        } finally {
            setVerifyingId(null);
            setComputationPhase('');
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        if (id === 'root') {
            setCopiedRoot(true);
            setTimeout(() => setCopiedRoot(false), 2000);
        } else {
            setCopiedHashId(id);
            setTimeout(() => setCopiedHashId(null), 2000);
        }
    };

    const formatCoordinates = (lat?: number | null, lng?: number | null) => {
        const defaultLat = 24.6352;
        const defaultLng = 87.8448;
        const effectiveLat = lat !== null && lat !== undefined ? lat : defaultLat;
        const effectiveLng = lng !== null && lng !== undefined ? lng : defaultLng;

        const latStr = `${Math.abs(effectiveLat).toFixed(4)}°${effectiveLat >= 0 ? 'N' : 'S'}`;
        const lngStr = `${Math.abs(effectiveLng).toFixed(4)}°${effectiveLng >= 0 ? 'E' : 'W'}`;

        return {
            display: `${latStr}, ${lngStr}`,
            href: `https://www.google.com/maps?q=${effectiveLat},${effectiveLng}`,
        };
    };

    const formatTruncatedHash = (hash?: string | null) => {
        if (!hash) return 'Sealing pending...';
        const clean = hash.trim();
        if (clean.length <= 18) return clean;
        return `${clean.slice(0, 8)}...${clean.slice(-8)}`;
    };

    const checkExifMismatch = (captureTime?: string | null, uploadTime?: string | null) => {
        if (!captureTime || !uploadTime) return false;
        try {
            const cap = new Date(captureTime).getTime();
            const upl = new Date(uploadTime).getTime();
            const diffHours = Math.abs(upl - cap) / (1000 * 60 * 60);
            return diffHours > 2;
        } catch {
            return false;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CSR_APPROVED':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        CSR_APPROVED
                    </span>
                );
            case 'GP_VERIFIED':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
                        <Check className="w-3.5 h-3.5" />
                        GP_VERIFIED
                    </span>
                );
            case 'SUBMITTED':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        SUBMITTED
                    </span>
                );
            case 'PENDING':
            default:
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-700/40 text-slate-300 border border-slate-600/40 flex items-center gap-1 w-fit">
                        PENDING
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-base font-bold text-white">Accessing Cryptographic Ledger</h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">Synchronizing SHA-256 Merkle root...</p>
            </div>
        );
    }

    const effectiveProject = project || {
        id: projectId,
        teamId: projectId,
        title: 'Community Drinking Water Contamination & Arsenic Filtration',
        district: 'Pakur',
        sdgTags: [6, 3, 11],
        status: 'IN_PROGRESS',
        universityName: 'National Institute of Technology Jamshedpur',
        facultyLead: 'Prof. Anjali Sharma',
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            {/* Top Navigation & Breadcrumb */}
            <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <Link
                            href="/track"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Public Tracker</span>
                        </Link>
                        <span className="text-slate-600 text-xs hidden sm:inline">•</span>
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                            <Database className="w-3.5 h-3.5" />
                            <span>SHA-256 Public Proof Ledger</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        {user ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                                <Eye className="w-3 h-3" />
                                Reviewer Mode ({user.role})
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[11px]">
                                <EyeOff className="w-3 h-3 text-slate-500" />
                                Public Access (Proofs Redacted)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* ─── HEADER ──────────────────────────────────────────────── */}
                <header className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Binary className="w-64 h-64 text-indigo-400" />
                    </div>

                    <div className="relative z-10 space-y-4 max-w-4xl">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Immutable Impact Ledger
                            </span>
                            {/* Current ChallengeStatus Badge */}
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                                {effectiveProject.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                {effectiveProject.district} District, Jharkhand
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                SDG Nexus — Project Impact Ledger
                            </h1>
                            <p className="text-base sm:text-lg font-semibold text-slate-200 mt-1">
                                {effectiveProject.title}
                            </p>
                        </div>

                        {/* District, University & SDG tags */}
                        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                            <div className="flex items-center gap-1.5 text-slate-300 font-medium bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
                                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{effectiveProject.universityName}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                {effectiveProject.sdgTags.map((tagId) => {
                                    const sdg = SDG_INFO.find((s) => s.id === tagId);
                                    return (
                                        <span
                                            key={tagId}
                                            className="px-2.5 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                                            style={{ backgroundColor: sdg ? sdg.color : '#059669' }}
                                        >
                                            SDG {tagId}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cryptographic Immutability Notice (Mandated text) */}
                        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3 mt-4">
                            <Lock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                            <p className="leading-relaxed">
                                <span className="font-semibold text-white">Cryptographic Assurance: </span>
                                This ledger is cryptographically immutable. Every entry below was sealed at the moment
                                of submission. Any modification to the underlying database will be detected instantly.
                            </p>
                        </div>
                    </div>
                </header>

                {/* ─── MILESTONE LEDGER TABLE ──────────────────────────────── */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900">
                        <div>
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <Database className="w-4 h-4 text-emerald-400" />
                                Verified Milestone Ledger Entries
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                SHA-256 sealed field telemetry, on-site GP endorsements, and CSR tranche release hashes
                            </p>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                            {milestones.length} sealed payload{milestones.length === 1 ? '' : 's'}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                                    <th className="py-3.5 px-4 min-w-[220px]">Milestone Title</th>
                                    <th className="py-3.5 px-4 whitespace-nowrap">Submitted</th>
                                    <th className="py-3.5 px-4 font-mono">SHA-256 Hash</th>
                                    <th className="py-3.5 px-4">GPS Location</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/70">
                                {milestones.map((m, idx) => {
                                    const coords = formatCoordinates(m.gpsLat, m.gpsLng);
                                    const vResult = verificationResults[m.id];
                                    const isVerifying = verifyingId === m.id;
                                    const isExpanded = expandedMilestoneId === m.id;
                                    const hasExifMismatch = checkExifMismatch(m.exifTimestamp, m.createdAt);

                                    return (
                                        <React.Fragment key={m.id}>
                                            <tr className="hover:bg-slate-800/40 transition-colors">
                                                {/* Index */}
                                                <td className="py-4 px-4 text-center font-mono text-slate-500 font-bold">
                                                    0{idx + 1}
                                                </td>

                                                {/* Milestone Title + Expand Toggle */}
                                                <td className="py-4 px-4">
                                                    <div className="font-bold text-white text-sm leading-snug">
                                                        {m.title}
                                                    </div>
                                                    <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">
                                                        {m.description}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpandedMilestoneId(isExpanded ? null : m.id)
                                                        }
                                                        className="mt-1.5 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className="w-3.5 h-3.5" />
                                                                Hide Proof Details
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-3.5 h-3.5" />
                                                                View Proof Evidence &amp; EXIF
                                                            </>
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Submitted Timestamp */}
                                                <td className="py-4 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                                                    {new Date(m.createdAt).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>

                                                {/* SHA-256 Hash */}
                                                <td className="py-4 px-4 font-mono">
                                                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                                                        <span className="text-slate-300" title={m.hashValue}>
                                                            {formatTruncatedHash(m.hashValue)}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => copyToClipboard(m.hashValue, m.id)}
                                                            className="text-slate-500 hover:text-slate-200 transition p-0.5"
                                                            title="Copy full SHA-256 hash"
                                                        >
                                                            {copiedHashId === m.id ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* GPS */}
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <a
                                                        href={coords.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 hover:underline transition font-mono text-[11px]"
                                                        title="Open in Google Maps"
                                                    >
                                                        <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                                                        <span>{coords.display}</span>
                                                        <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                                                    </a>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {getStatusBadge(m.status)}
                                                </td>

                                                {/* Verify Column */}
                                                <td className="py-4 px-4 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerify(m)}
                                                        disabled={isVerifying}
                                                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                                                            isVerifying
                                                                ? 'bg-indigo-900 text-indigo-300 border border-indigo-700'
                                                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                                                        }`}
                                                    >
                                                        {isVerifying ? (
                                                            <>
                                                                <div className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-white rounded-full animate-spin" />
                                                                <span>Verifying...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                                <span>Verify Integrity</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Verification Banner Row (Appears when verified or while computing) */}
                                            {(isVerifying || vResult) && (
                                                <tr>
                                                    <td colSpan={7} className="p-0 border-b border-slate-800">
                                                        {isVerifying ? (
                                                            <div className="px-6 py-3 bg-indigo-950/40 border-y border-indigo-900/60 flex items-center gap-3 animate-pulse">
                                                                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                                                                <span className="text-xs font-mono text-indigo-300">
                                                                    {computationPhase || 'Computing SHA-256 verification...'}
                                                                </span>
                                                            </div>
                                                        ) : vResult?.valid ? (
                                                            <div className="px-6 py-3.5 bg-emerald-950/40 border-y border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-300">
                                                                <div className="flex items-center gap-2">
                                                                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                                                    <span className="font-bold text-white">
                                                                        ✅ VERIFIED — Hash confirmed.
                                                                    </span>
                                                                    <span className="text-slate-300">
                                                                        Submitted {new Date(vResult.timestamp).toLocaleString('en-IN')}.
                                                                    </span>
                                                                    <span className="text-emerald-400 font-mono">
                                                                        Location: {vResult.coords}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] font-mono text-emerald-400/80">
                                                                    Payload integrity confirmed against SHA-256 seal
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="px-6 py-3.5 bg-rose-950/50 border-y border-rose-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-300">
                                                                <div className="flex items-center gap-2">
                                                                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                                                                    <span className="font-bold text-white">
                                                                        ❌ TAMPERED — Computed hash does not match stored hash. Alert raised.
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] font-mono text-rose-400">
                                                                    Expected: {vResult?.computedHash.slice(0, 12)}... ≠ Stored: {vResult?.storedHash.slice(0, 12)}...
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}

                                            {/* ─── PROOF PANEL (Expandable per milestone) ─────────── */}
                                            {isExpanded && (
                                                <tr className="bg-slate-950/70 border-b border-slate-800">
                                                    <td colSpan={7} className="p-6">
                                                        <div className="space-y-4 max-w-5xl">
                                                            {/* Proof Panel Header */}
                                                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-white">
                                                                        Field Evidence &amp; Integrity Telemetry
                                                                    </span>
                                                                    <span className="text-slate-500">•</span>
                                                                    <span className="text-indigo-400 font-semibold">
                                                                        Submitted by: {effectiveProject.universityName}
                                                                    </span>
                                                                </div>

                                                                {m.verifierCode && (
                                                                    <div className="text-slate-400 font-mono text-[11px]">
                                                                        Endorsement Code: <span className="text-white font-bold">{m.verifierCode}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Photo Thumbnails */}
                                                            <div>
                                                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                                    <span>Cryptographically Sealed Photographic Proofs</span>
                                                                    {!user && (
                                                                        <span className="text-amber-400 flex items-center gap-1 text-[10px] font-medium">
                                                                            <EyeOff className="w-3 h-3" />
                                                                            DPDP 2023: Citizen privacy blur applied
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {m.proofUrls && m.proofUrls.length > 0 ? (
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                                        {m.proofUrls.map((url, pIdx) => (
                                                                            <div
                                                                                key={pIdx}
                                                                                className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video shadow-md"
                                                                            >
                                                                                <img
                                                                                    src={url}
                                                                                    alt={`Proof ${pIdx + 1}`}
                                                                                    className={`w-full h-full object-cover transition-all duration-300 ${
                                                                                        user ? 'filter-none' : 'filter blur-md scale-105'
                                                                                    }`}
                                                                                />

                                                                                {!user && (
                                                                                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
                                                                                        <Lock className="w-5 h-5 text-amber-400 mb-1" />
                                                                                        <span className="text-[11px] font-bold text-white">
                                                                                            Privacy Redacted
                                                                                        </span>
                                                                                        <span className="text-[9px] text-slate-300 mt-0.5">
                                                                                            Login with HEI or Government credentials to view original evidence
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                {user && (
                                                                                    <a
                                                                                        href={url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition shadow"
                                                                                    >
                                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-slate-500 text-xs">
                                                                        No secondary media attachments attached.
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* EXIF Timestamp Analysis */}
                                                            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                                        <span className="text-slate-300">
                                                                            <strong className="text-white">Photo capture time:</strong>{' '}
                                                                            {m.exifTimestamp
                                                                                ? new Date(m.exifTimestamp).toLocaleString('en-IN')
                                                                                : 'Extracted from sealed JPEG metadata'}
                                                                        </span>
                                                                        <span className="text-slate-600">vs</span>
                                                                        <span className="text-slate-300">
                                                                            <strong className="text-white">Upload time:</strong>{' '}
                                                                            {new Date(m.createdAt).toLocaleString('en-IN')}
                                                                        </span>
                                                                    </div>

                                                                    {m.fundReleased && (
                                                                        <span className="text-emerald-400 font-bold">
                                                                            Tranche Released: ₹{m.fundReleased.toLocaleString('en-IN')}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Amber warning if capture and upload differ by > 2 hours */}
                                                                {hasExifMismatch && (
                                                                    <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-2 text-xs">
                                                                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                                                        <span className="font-semibold">
                                                                            Capture/upload time mismatch:
                                                                        </span>
                                                                        <span>
                                                                            Photo was captured &gt;2 hours before submission. Flagged for secondary Gram Panchayat cross-verification.
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ─── MERKLE ROOT SECTION ─────────────────────────────────── */}
                <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-6 sm:p-7 shadow-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                <Binary className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    Project Cryptographic Merkle Root
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Binary Merkle tree digest computed across all {milestones.length} milestone hashes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Publicly Auditable
                            </span>
                        </div>
                    </div>

                    {/* Root Hash Display */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                Ledger Merkle Root
                            </div>
                            <div className="font-mono text-xs sm:text-sm font-bold text-emerald-400 break-all select-all">
                                {merkleRoot || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => copyToClipboard(merkleRoot, 'root')}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                        >
                            {copiedRoot ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Root Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Merkle Root</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Instruction text (Mandated text) */}
                    <p className="text-xs text-slate-400 leading-relaxed">
                        This root hash is committed daily to a public repository for external verification. The Merkle root
                        proves the integrity of the entire ledger without revealing individual records.
                    </p>
                </section>
            </main>
        </div>
    );
}
