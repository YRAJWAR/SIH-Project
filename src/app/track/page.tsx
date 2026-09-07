'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, ShieldCheck, Compass } from 'lucide-react';

export default function TrackSearchPage() {
    const router = useRouter();
    const [challengeId, setChallengeId] = useState('');
    const [error, setError] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = challengeId.trim();
        if (!trimmed) {
            setError('Please enter a valid Challenge ID or Tracking Code');
            return;
        }
        router.push(`/track/${trimmed}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#070b14] via-[#0c1422] to-[#090f1a] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto w-full text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    Triple-Helix Public Ledger
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
                    Track Challenge Resolution
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
                    Enter the tracking ID received during your citizen challenge submission to view real-time state machine progress.
                </p>

                <form onSubmit={handleSearch} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Enter Challenge ID (e.g. cly...)"
                            value={challengeId}
                            onChange={(e) => {
                                setChallengeId(e.target.value);
                                if (error) setError('');
                            }}
                            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base font-mono"
                        />
                    </div>

                    {error && <p className="text-rose-400 text-xs text-left">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                    >
                        <span>Inspect 8-Stage Pipeline</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
                    <Link
                        href="/citizen/submit"
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
                    >
                        <span>Need to log a new issue? Submit Challenge</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="hidden sm:inline">•</span>
                    <Link
                        href="/dashboard/heatmap"
                        className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
                    >
                        <Compass className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Explore Geospatial Heatmap</span>
                    </Link>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Jharkhand State Innovation & SDG Monitoring Authority • SIH26043</span>
                </div>
            </div>
        </div>
    );
}
