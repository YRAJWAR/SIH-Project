'use client';
import { useEffect, useState } from 'react';

export default function DonorLeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/donor/leaderboard')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setLeaderboard(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Group by category
    const categories: Record<string, any[]> = {};
    leaderboard.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    });

    Object.keys(categories).forEach(cat => {
        categories[cat].sort((a, b) => a.rank - b.rank);
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="mb-10 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Live Rankings
                </span>
                <h1 className="text-4xl font-extrabold font-heading text-slate-900 mb-3 tracking-tight">Donor Hall of Fame</h1>
                <p className="text-slate-500 max-w-2xl mx-auto">Compare your impact with the community. Ranks are recalculated dynamically based on on-chain verifiable metric streams.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-slate-500">Compiling leaderboard...</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(categories).map(([categoryName, users]) => (
                        <div key={categoryName} className="glass-card rounded-2xl overflow-hidden border border-slate-200">
                            <div className="p-5" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', borderBottom: '1px solid #f1f5f9' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                        style={{ background: categoryName.includes('SDG') ? '#e0f2fe' : categoryName.includes('Volunteer') ? '#dcfce7' : '#fef3c7', fontSize: '1.25rem' }}>
                                        {categoryName.includes('SDG') ? '🎯' : categoryName.includes('Volunteer') ? '⏱️' : '🔥'}
                                    </div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{categoryName}</h3>
                                </div>
                            </div>

                            <div className="p-2">
                                {users.map((user: any, index: number) => (
                                    <div key={user.id}
                                        className="flex items-center gap-4 p-3 rounded-xl transition-colors shrink-0"
                                        style={{
                                            background: user.isSelf ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                                            border: user.isSelf ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid transparent'
                                        }}>
                                        <div className="flex-shrink-0 w-6 font-mono text-sm font-bold opacity-50 text-center"
                                            style={{ color: user.rank === 1 ? '#eab308' : user.rank === 2 ? '#94a3b8' : user.rank === 3 ? '#b45309' : '#64748b' }}>
                                            #{user.rank}
                                        </div>

                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`} className="w-full h-full object-cover" alt="avatar" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2">
                                                {user.name}
                                                {user.isSelf && <span className="text-[9px] uppercase tracking-wider bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">You</span>}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium truncate">{user.metric}</p>
                                        </div>

                                        <div className="text-xs flex items-center justify-center">
                                            {user.trend === 'up' ? '↗️' : user.trend === 'down' ? '↘️' : '➡️'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
