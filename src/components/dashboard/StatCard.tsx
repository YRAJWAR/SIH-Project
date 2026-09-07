'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface StatCardProps {
    label: string;
    value: number;
    icon: string;
    color: string;
    prefix?: string;
    suffix?: string;
    delay?: number;
}

export default function StatCard({ label, value, icon, color, prefix = '', suffix = '', delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay,
                type: 'spring',
                stiffness: 100,
                damping: 20
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative overflow-hidden p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl"
            style={{
                boxShadow: `0 10px 40px -10px ${color}20, inset 0 0 0 1px rgba(255,255,255,0.5)`,
            }}
        >
            {/* Background Glow */}
            <div
                className="absolute top-[-20%] right-[-20%] w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: color }}
            ></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${color}15`, color: color }}
                >
                    {icon}
                </div>
                <div
                    className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider shadow-sm"
                    style={{ backgroundColor: `${color}15`, color: color, border: `1px solid ${color}30` }}
                >
                    {label}
                </div>
            </div>

            <div className="relative z-10">
                <div className="text-3xl font-black text-slate-800 tracking-tight">
                    <AnimatedCounter target={value} prefix={prefix} suffix={suffix} />
                </div>
            </div>

            {/* Sparkle effect on hover could go here, but keeping it clean for now */}
        </motion.div>
    );
}
