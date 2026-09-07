'use client';

import React, { useEffect, useState } from 'react';

interface ImpactGaugeProps {
    score: number;
    maxScore?: number;
    size?: number;
    label?: string;
}

export default function ImpactGauge({ score, maxScore = 1000, size = 180, label = 'Innovation Outcome Score' }: ImpactGaugeProps) {
    const [animated, setAnimated] = useState(0);
    const percentage = (score / maxScore) * 100;
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animated / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(percentage), 200);
        return () => clearTimeout(timer);
    }, [percentage]);

    const getColor = () => {
        if (percentage >= 80) return '#10b981';
        if (percentage >= 60) return '#06b6d4';
        if (percentage >= 40) return '#f59e0b';
        return '#f43f5e';
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"
                    />
                    {/* Score arc */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke={getColor()} strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: `drop-shadow(0 0 6px ${getColor()}40)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: getColor() }}>{score}</span>
                    <span className="text-xs text-gray-500">/ {maxScore}</span>
                </div>
            </div>
            <p className="mt-2 text-sm text-gray-400 font-medium">{label}</p>
        </div>
    );
}
