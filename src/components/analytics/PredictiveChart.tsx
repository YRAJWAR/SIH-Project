'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface ChartData {
    month: string;
    actualScore: number;
    predictedScore: number;
}

interface PredictiveChartProps {
    data: ChartData[];
    title?: string;
    subtitle?: string;
}

/**
 * SDG Nexus — Predictive Trendline Chart
 * Visualizes current performance versus AI-forecasted future performance.
 */
export default function PredictiveChart({ data, title = "Innovation Outcome Score Forecast", subtitle = "AI-Driven predictive modeling" }: PredictiveChartProps) {
    return (
        <div className="w-full h-[400px] p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-lg relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-6 relative z-10">
                <h3 className="text-xl font-bold font-heading text-white tracking-tight">{title}</h3>
                <p className="text-sm text-slate-400">{subtitle}</p>
            </div>

            <div className="w-full h-[280px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                            domain={[0, 100]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#e2e8f0', fontWeight: 500 }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            wrapperStyle={{ color: '#cbd5e1', fontSize: '13px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="actualScore"
                            name="Actual Score"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorActual)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="predictedScore"
                            name="AI Forecast"
                            stroke="#10b981"
                            strokeDasharray="5 5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPredicted)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
