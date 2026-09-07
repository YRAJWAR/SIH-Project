'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SDG_INFO } from '@/data/mockData';

interface SDGBarChartProps {
    data: { sdg: number; score: number }[];
    height?: number;
}

export default function SDGBarChart({ data, height = 300 }: SDGBarChartProps) {
    const chartData = data.map(d => ({
        name: `SDG ${d.sdg}`,
        score: d.score,
        color: SDG_INFO.find(s => s.id === d.sdg)?.color || '#06b6d4',
        fullName: SDG_INFO.find(s => s.id === d.sdg)?.name || `SDG ${d.sdg}`,
    }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} domain={[0, 1000]} />
                <Tooltip
                    contentStyle={{
                        background: 'rgba(17,24,39,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        color: '#e2e8f0',
                    }}
                    formatter={(value: any, _name: any, props: any) => [
                        `${value} / 1000`,
                        props?.payload?.fullName ?? '',
                    ]}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={32}>
                    {chartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} fillOpacity={0.8} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
