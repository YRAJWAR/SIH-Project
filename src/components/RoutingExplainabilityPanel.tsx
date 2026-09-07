'use client';

import React from 'react';
import { Award, CheckCircle2, MapPin, GraduationCap, Building2, TrendingUp, Sparkles } from 'lucide-react';

export interface HEIMatch {
    id?: string;
    heiId?: string;
    name: string;
    district: string;
    sdgOverlap: number;
    sdgMatched: number[];
    distKm: number;
    perfScore: number;
    totalScore: number;
    departments: string[];
    naacGrade?: string | null;
    reasons?: string[];
}

export interface RoutingExplainabilityPanelProps {
    hei: HEIMatch;
    compact?: boolean;
    onSelect?: (hei: HEIMatch) => void;
    selected?: boolean;
}

export default function RoutingExplainabilityPanel({
    hei,
    compact = false,
    onSelect,
    selected = false,
}: RoutingExplainabilityPanelProps) {
    // Normalize percentage and scores (handles both 0-1 fraction and 0-100 values)
    const scoreVal = hei.totalScore <= 1 ? Math.round(hei.totalScore * 100) : Math.round(hei.totalScore);
    const sdgOverlapPct = hei.sdgOverlap <= 1 ? Math.round(hei.sdgOverlap * 100) : Math.round(hei.sdgOverlap);
    const perfScorePct = hei.perfScore <= 1 ? Math.round(hei.perfScore * 100) : Math.round(hei.perfScore);
    const distKm = Math.round(hei.distKm);

    // Subtle left border colored by score:
    // Score > 80: green border
    // Score 60-80: amber border
    // Score < 60: red border
    const borderLeftColor =
        scoreVal > 80
            ? 'border-l-emerald-500 bg-emerald-950/20'
            : scoreVal >= 60
            ? 'border-l-amber-500 bg-amber-950/20'
            : 'border-l-rose-500 bg-rose-950/20';

    const scoreBadgeColor =
        scoreVal > 80
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            : scoreVal >= 60
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

    const departmentsStr =
        Array.isArray(hei.departments) && hei.departments.length > 0
            ? hei.departments.join(', ')
            : 'Multidisciplinary Engineering';

    if (compact) {
        return (
            <div
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-l-4 text-xs font-semibold ${borderLeftColor} border-slate-700/80 bg-slate-900/90 text-slate-200`}
                title={`Routing Match: ${scoreVal}% (${hei.name})`}
            >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Match: {scoreVal}%</span>
                <span className="text-[10px] text-slate-400 font-normal">({hei.name.split(' ')[0]})</span>
            </div>
        );
    }

    return (
        <div
            onClick={() => onSelect && onSelect(hei)}
            className={`rounded-xl border border-slate-700/80 border-l-4 ${borderLeftColor} bg-slate-900/95 p-4 shadow-lg transition-all ${
                onSelect ? 'cursor-pointer hover:border-slate-600 hover:shadow-indigo-500/10' : ''
            } ${selected ? 'ring-2 ring-indigo-500 shadow-indigo-500/20' : ''}`}
        >
            {/* Header: Recommended HEI */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Recommended Institution
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                        {hei.name}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {hei.district} District
                        {hei.naacGrade && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                                NAAC {hei.naacGrade}
                            </span>
                        )}
                    </p>
                </div>

                <div className={`px-3 py-1 rounded-lg border text-sm font-extrabold flex flex-col items-center ${scoreBadgeColor}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                    <span>{scoreVal} / 100</span>
                </div>
            </div>

            {/* Explanatory Breakdown Metrics */}
            <div className="mt-3 space-y-2 text-xs">
                {/* SDG Match */}
                <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        SDG Match Score:
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{sdgOverlapPct}%</span>
                        {hei.sdgMatched && hei.sdgMatched.length > 0 && (
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                <CheckCircle2 className="w-3 h-3" />
                                SDG {hei.sdgMatched.join(', ')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Geographic Match */}
                <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        Geographic Match:
                    </span>
                    <span className="font-semibold text-slate-200">
                        {distKm}km from challenge location
                    </span>
                </div>

                {/* Faculty Expertise */}
                <div className="flex flex-col gap-0.5 text-slate-300 pt-0.5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        Faculty Expertise:
                    </span>
                    <p className="text-slate-200 font-medium pl-5 text-[11px] leading-relaxed">
                        {departmentsStr}
                    </p>
                </div>

                {/* Past Performance */}
                <div className="flex items-center justify-between text-slate-300 pt-0.5">
                    <span className="text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        Past Performance:
                    </span>
                    <span className="font-bold text-slate-200">
                        {perfScorePct}% avg outcomes
                    </span>
                </div>

                {/* Overall Score */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-white text-xs">
                        Overall Score:
                    </span>
                    <span className="font-extrabold text-white text-sm">
                        {scoreVal} / 100
                    </span>
                </div>
            </div>
        </div>
    );
}
