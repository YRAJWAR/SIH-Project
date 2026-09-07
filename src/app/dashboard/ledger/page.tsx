'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/lib/DataContext';

const fadeIn = (d: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: d },
});

export default function LedgerPage() {
    const { activities, addActivity, projects } = useData();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        project_id: '', description: '', location: '', geo_lat: '', geo_lng: '', media_url: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 800)); // Simulate processing

        const project = projects.find(p => p.id === form.project_id);
        addActivity({
            project_id: form.project_id,
            project_title: project?.title || 'Unknown Project',
            description: form.description,
            timestamp: new Date().toISOString(),
            location: form.location + (form.geo_lat ? ` (${form.geo_lat}, ${form.geo_lng})` : ''),
            media_url: form.media_url || undefined,
            verified: false,
        });

        setForm({ project_id: '', description: '', location: '', geo_lat: '', geo_lng: '', media_url: '' });
        setShowForm(false);
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <motion.div {...fadeIn(0)} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Transparent Activity Ledger</h1>
                    <p className="text-sm text-slate-500 mt-1">SHA-256 hashed, timestamped, geo-tagged, and immutable activity records</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-neon text-sm py-2 px-4">
                    {showForm ? '✕ Cancel' : '+ Log Activity'}
                </button>
            </motion.div>

            {/* Activity Submission Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        key="activity-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        className="glass-card p-6 space-y-4 overflow-hidden"
                    >
                        <h2 className="text-sm font-semibold text-slate-900">Log New Activity</h2>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Project</label>
                            <select value={form.project_id} onChange={e => update('project_id', e.target.value)}
                                className="input-dark text-sm" required>
                                <option value="">Select a project...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Activity Description</label>
                            <textarea value={form.description} onChange={e => update('description', e.target.value)}
                                className="input-dark min-h-[80px] resize-none" required
                                placeholder="Describe the activity performed..." />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Location</label>
                                <input type="text" value={form.location} onChange={e => update('location', e.target.value)}
                                    className="input-dark" placeholder="City, State" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Geo Latitude</label>
                                <input type="text" value={form.geo_lat} onChange={e => update('geo_lat', e.target.value)}
                                    className="input-dark" placeholder="19.076" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Geo Longitude</label>
                                <input type="text" value={form.geo_lng} onChange={e => update('geo_lng', e.target.value)}
                                    className="input-dark" placeholder="72.877" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Media Proof URL (optional)</label>
                            <input type="url" value={form.media_url} onChange={e => update('media_url', e.target.value)}
                                className="input-dark" placeholder="https://..." />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn-neon w-full py-3 text-sm">
                            {isSubmitting ? '⏳ Generating SHA-256 Hash...' : '🔒 Submit & Hash Activity'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Ledger Stats */}
            <motion.div {...fadeIn(0.1)} className="grid grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-blue-500">{activities.length}</p>
                    <p className="text-xs text-slate-500">Total Activities</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{activities.filter(a => a.verified).length}</p>
                    <p className="text-xs text-slate-500">Verified</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{activities.filter(a => !a.verified).length}</p>
                    <p className="text-xs text-slate-500">Pending</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-violet-600">{activities.filter(a => a.media_url).length}</p>
                    <p className="text-xs text-slate-500">With Proof</p>
                </div>
            </motion.div>

            {/* Timeline */}
            <motion.div {...fadeIn(0.2)} className="relative">
                {/* Vertical line */}
                <div className="absolute left-[27px] top-0 bottom-0 w-0.5"
                    style={{ background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6, transparent)' }} />

                <div className="space-y-4">
                    {activities.map((activity, i) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.06 * Math.min(i, 10) }}
                            className="flex gap-4 relative"
                        >
                            {/* Dot */}
                            <div className="flex-shrink-0 w-[54px] flex items-start justify-center pt-4 z-10">
                                <div className="w-3.5 h-3.5 rounded-full border-2"
                                    style={{
                                        borderColor: activity.verified ? '#10b981' : '#f59e0b',
                                        background: activity.verified ? '#10b98130' : '#f59e0b30',
                                        boxShadow: activity.verified ? '0 0 8px #10b98140' : '0 0 8px #f59e0b40',
                                    }} />
                            </div>

                            {/* Card — no edit/delete (immutable) */}
                            <div className="flex-1 glass-card p-5 mb-0">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">{activity.description}</h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {activity.project_title} • {activity.location}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                                        style={{
                                            background: activity.verified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                            color: activity.verified ? '#10b981' : '#f59e0b',
                                        }}>
                                        {activity.verified ? '✓ Verified' : '⏳ Pending'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mt-3 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-slate-500">🕐</span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    {activity.media_url && (
                                        <a href={activity.media_url} target="_blank" rel="noopener noreferrer"
                                            className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
                                            📎 View Proof
                                        </a>
                                    )}
                                </div>

                                {/* Hash */}
                                <div className="mt-3 p-3 rounded-lg" style={{ background: '#f1f5f9', border: '1px solid #f8fafc' }}>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] text-slate-400">SHA-256 Hash</p>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded"
                                            style={{ background: 'rgba(6,182,212,0.1)', color: '#3b82f6' }}>
                                            🔒 Immutable
                                        </span>
                                    </div>
                                    <code className="text-xs font-mono text-blue-500 break-all">{activity.hash}</code>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
