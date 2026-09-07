'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function DonorLedgerPage() {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/donor/ledger')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFeed(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">My Impact Journey</h1>
                <p className="text-slate-500">Track the lifecycle of your funded projects. Every update is verified via blockchain.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-slate-500">Loading your feed...</p>
                    </div>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 py-4">
                    {feed.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="mb-8 ml-8 relative group"
                        >
                            {/* Timeline Point */}
                            <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-12 ring-4 ring-white shadow-md text-sm"
                                style={{ background: item.type === 'milestone' ? '#10b981' : item.type === 'update' ? '#3b82f6' : '#8b5cf6' }}>
                                {item.image}
                            </span>

                            <div className="glass-card p-5 transition-transform group-hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900">{item.status}</h3>
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                {new Date(item.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-blue-600 mt-0.5">{item.project} &middot; {item.ngo}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                            Tx: {item.hash}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mt-3">{item.description}</p>

                                {item.amount && (
                                    <div className="mt-4 inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <span className="text-xs text-slate-500">Funds utilized:</span>
                                        <span className="text-sm font-bold text-slate-900">₹{item.amount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
