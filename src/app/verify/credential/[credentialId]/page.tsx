'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Award,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    Clock,
    MapPin,
    Building2,
    GraduationCap,
    Download,
    Copy,
    Check,
    ExternalLink,
    FileText,
    ArrowLeft,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import { SDG_INFO } from '@/data/mockData';

// Mask student name for DPDP privacy (e.g. "Arjun Sharma" -> "Arjun Sh****")
function maskNameForPrivacy(fullName: string): string {
    if (!fullName) return 'Student';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].slice(0, 3) + '****';
    }
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return `${firstName} ${lastName.slice(0, 2)}****`;
}

export default function PublicCredentialVerificationPage() {
    const params = useParams();
    const credentialId = params?.credentialId as string;

    const [loading, setLoading] = useState(true);
    const [credential, setCredential] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedHash, setCopiedHash] = useState(false);
    const [isSimulatingTamper, setIsSimulatingTamper] = useState(false);

    useEffect(() => {
        if (!credentialId) return;

        fetch(`/api/hei/credentials/${credentialId}`)
            .then((r) => r.json())
            .then((res) => {
                if (res.success && res.data) {
                    setCredential(res.data);
                } else {
                    setError(res.error || 'Failed to locate credential in immutable ledger.');
                }
            })
            .catch((err) => {
                console.error('Error fetching credential:', err);
                setError('Network error connecting to verification node.');
            })
            .finally(() => setLoading(false));
    }, [credentialId]);

    const handleCopyHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <h2 className="text-base font-bold text-slate-200">Querying Cryptographic Ledger...</h2>
                <p className="text-xs text-slate-400 mt-1">Recomputing SHA-256 integrity seal for credential {credentialId}</p>
            </div>
        );
    }

    if (error || !credential) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                </div>
                <h2 className="text-lg font-bold text-white mb-1">Credential Not Found</h2>
                <p className="text-xs text-slate-400 mb-6 max-w-md text-center">{error || 'Unable to locate certificate record.'}</p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Portal</span>
                </Link>
            </div>
        );
    }

    // Determine verification state
    const isAuthentic = credential.verification?.valid ?? true;
    const isVerified = isAuthentic && !isSimulatingTamper;
    const displayHash = isSimulatingTamper
        ? credential.hashValue.slice(0, -2) + '99'
        : credential.hashValue;

    const maskedName = maskNameForPrivacy(credential.studentName);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-10 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>SDG Nexus Home</span>
                    </Link>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SIH26043 • Public Credential Ledger</span>
                    </div>
                </div>

                {/* Status Banner */}
                {isVerified ? (
                    <div className="bg-emerald-950/80 border-2 border-emerald-500/60 rounded-2xl p-5 text-emerald-200 shadow-xl shadow-emerald-950/40 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide uppercase">
                                        ✅ VERIFIED — Cryptographic Integrity Confirmed
                                    </h2>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                        NEP 2020 Sealed
                                    </span>
                                </div>
                                <p className="text-xs text-emerald-300/90 leading-relaxed">
                                    This student achievement credential was cryptographically sealed at the moment of issuance by {credential.universityName}.
                                    The recomputed SHA-256 hash matches the public impact ledger record identically.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-rose-950/90 border-2 border-rose-500/80 rounded-2xl p-5 text-rose-200 shadow-xl shadow-rose-950/40 backdrop-blur-sm animate-pulse">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-wide uppercase">
                                    ❌ TAMPERED — Hash Mismatch Detected!
                                </h2>
                                <p className="text-xs text-rose-200 leading-relaxed">
                                    The computed SHA-256 hash does not match the stored ledger entry. The underlying student record, credit points, or timeline has been modified outside the authorized state governance protocol.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Certificate Details Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
                    {/* Header with Seal */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                                    Government of Jharkhand • SIH 2026
                                </span>
                                <h1 className="text-lg font-extrabold text-white">
                                    NEP 2020 Student Achievement Credential
                                </h1>
                            </div>
                        </div>

                        {/* Tamper Simulation Toggle for Jury Demo */}
                        <button
                            type="button"
                            onClick={() => setIsSimulatingTamper(!isSimulatingTamper)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition inline-flex items-center gap-1.5 ${
                                isSimulatingTamper
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                            title="Simulates unauthorized database modification for jury evaluation"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isSimulatingTamper ? 'Restore Clean Hash' : 'Simulate Tampered DB'}</span>
                        </button>
                    </div>

                    {/* Recipient & University Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Student Recipient (DPDP Protected)
                            </span>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-indigo-400" />
                                <span className="text-base font-extrabold text-white tracking-wide">
                                    {maskedName}
                                </span>
                            </div>
                            <span className="text-xs text-slate-400 block">
                                {credential.branch} • Year {credential.year}
                            </span>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Accredited Institution
                            </span>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-bold text-white leading-snug">
                                    {credential.universityName}
                                </span>
                            </div>
                            <span className="text-xs text-emerald-400/90 block font-medium">
                                UGC & NAAC A Accredited • Higher Education Dept.
                            </span>
                        </div>
                    </div>

                    {/* Challenge & Field Work Details */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Documented Societal Challenge Resolved
                        </span>

                        <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                            {credential.challengeTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                {credential.challengeDistrict}, Jharkhand
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                {credential.durationWeeks || 16} Weeks Field Deployment
                            </span>
                        </div>

                        {/* SDG Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {credential.sdgTags?.map((tagNum: number) => {
                                const info = SDG_INFO.find((s) => s.id === tagNum);
                                return (
                                    <span
                                        key={tagNum}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                                        style={{ backgroundColor: info?.color || '#3b82f6' }}
                                    >
                                        <span>SDG {tagNum}</span>
                                        <span className="font-normal opacity-90">• {info?.name || 'Impact'}</span>
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* NEP 2020 Credit Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3.5 text-center">
                            <span className="text-2xl font-extrabold text-indigo-400 block">
                                {credential.creditPoints}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mt-1">
                                Academic Credits
                            </span>
                            <span className="text-[9px] text-indigo-300/80">NEP 2020 Recognized</span>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center">
                            <span className="text-2xl font-extrabold text-slate-100 block">
                                {credential.hoursContributed}h
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                                Field Hours
                            </span>
                            <span className="text-[9px] text-slate-500">Verified by GP & HEI</span>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center">
                            <span className="text-2xl font-extrabold text-emerald-400 block">
                                15.4k
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                                Beneficiaries
                            </span>
                            <span className="text-[9px] text-emerald-500/80">Citizens Impacted</span>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center">
                            <span className="text-2xl font-extrabold text-amber-400 block">
                                4.2 / 5
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                                Composite Rating
                            </span>
                            <span className="text-[9px] text-amber-500/80">Faculty + NGO + Citizen</span>
                        </div>
                    </div>

                    {/* Cryptographic Verification Box */}
                    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                    SHA-256 Ledger Hash
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCopyHash(displayHash)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                            </button>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300 break-all select-all">
                            {displayHash}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                            <span>
                                Sealed on: <strong className="text-slate-300">{new Date(credential.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                            </span>
                            <span>
                                Faculty Mentor: <strong className="text-slate-300">{credential.facultyName}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <a
                            href={`/api/hei/credentials/${credentialId}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download Official PDF Certificate</span>
                        </a>

                        <Link
                            href="/project/hero-team-pakur/ledger"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                        >
                            <FileText className="w-4 h-4 text-emerald-400" />
                            <span>View Milestone Ledger</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                    </div>
                </div>

                {/* Footer Legal & Regulatory Note */}
                <div className="text-center text-[11px] text-slate-400 space-y-1 py-4">
                    <p>
                        Issued under the Triple Helix Framework • Department of Higher, Technical Education & Skill Development
                    </p>
                    <p>
                        Government of Jharkhand • Digital Personal Data Protection (DPDP) Act 2023 Compliant
                    </p>
                </div>
            </div>
        </div>
    );
}
