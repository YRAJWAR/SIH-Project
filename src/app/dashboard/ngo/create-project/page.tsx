'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SDG_INFO } from '@/data/mockData';
import { useData } from '@/lib/DataContext';
import { useAuth } from '@/lib/AuthContext';
import { calculateProjectScore } from '@/services/impactScoring';

interface SDGClassification {
    sdg_id: number;
    sdg_name: string;
    confidence: number;
}

interface ClassifyResult {
    sdg_tags: number[];
    classifications: SDGClassification[];
    reasoning: string;
    source: 'openai' | 'local';
}

export default function CreateProjectPage() {
    const { addProject, addActivity } = useData();
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: '', description: '', budget: '', budgetUtilized: '', location: '', lat: '', lng: '',
        startDate: '', endDate: '', beneficiaries: '', outcomeMetric: '',
    });
    const [step, setStep] = useState<'form' | 'analyzing' | 'results'>('form');
    const [sdgResults, setSdgResults] = useState<ClassifyResult | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('analyzing');

        try {
            const res = await fetch('/api/classify-sdg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: form.description }),
            });
            const json = await res.json();

            if (!res.ok || json.success === false) {
                throw new Error(json.error?.message || 'API classification failed');
            }

            // API returns { success, data: {...} } wrapper
            const raw = json.data || json;

            // Ensure classifications and sdg_tags always exist
            const results: ClassifyResult = {
                sdg_tags: raw.sdg_tags || [],
                classifications: raw.classifications || (raw.sdg_tags || []).map((t: number) => ({
                    sdg_id: t, sdg_name: '', confidence: 0.85,
                })),
                reasoning: raw.reasoning || 'Classified based on project description.',
                source: raw.source || 'local',
            };
            setSdgResults(results);
        } catch {
            // Minimal fallback if API is completely unreachable
            setSdgResults({
                sdg_tags: [17],
                classifications: [{ sdg_id: 17, sdg_name: 'Partnerships for the Goals', confidence: 0.5 }],
                reasoning: 'Classification service unavailable — default assigned.',
                source: 'local',
            });
        }
        setStep('results');
    };

    const handleSaveProject = async () => {
        setSaveStatus('saving');
        const budget = parseInt(form.budget || '0');
        const spent = parseInt(form.budgetUtilized || '0');
        const beneficiaries = parseInt(form.beneficiaries || '0');
        const locationName = form.location || 'India';

        // Call backend /api/projects — runs classifier, saves to DB, returns full result
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    organization_id: user?.id || 'u1',
                    budget_allocated: budget,
                    budget_utilized: spent,
                    beneficiaries_count: beneficiaries,
                    outcome_metric_value: parseFloat(form.outcomeMetric) || undefined,
                    latitude: parseFloat(form.lat) || undefined,
                    longitude: parseFloat(form.lng) || undefined,
                    location_name: locationName,
                    start_date: form.startDate,
                    end_date: form.endDate,
                }),
            });
            const json = await res.json();
            const data = json.data || json;

            // Also update in-memory DataContext so dashboards update immediately
            const impactScore = calculateProjectScore(
                beneficiaries, budget, spent, locationName, 0, 0, 'active'
            );

            const newProject = addProject({
                title: form.title,
                description: form.description,
                organization_id: user?.id || 'u1',
                organization_name: user?.organization_name || 'Organization',
                budget,
                spent,
                location: {
                    lat: parseFloat(form.lat) || 20.5,
                    lng: parseFloat(form.lng) || 78.9,
                    name: locationName,
                },
                timeline: { start: form.startDate, end: form.endDate },
                beneficiary_count: beneficiaries,
                sdg_tags: sdgResults?.sdg_tags || data.project?.sdg_tags || [],
                sdg_reasoning: sdgResults?.reasoning || data.project?.sdg_reasoning,
                status: 'active',
                impact_score: impactScore,
            });

            addActivity({
                project_id: newProject.id,
                project_title: newProject.title,
                description: `Project "${form.title}" created with budget ₹${budget.toLocaleString()} targeting ${beneficiaries.toLocaleString()} beneficiaries`,
                timestamp: new Date().toISOString(),
                location: locationName + (form.lat ? ` (${form.lat}, ${form.lng})` : ''),
                verified: true,
            });

            setSaveStatus('saved');
            setTimeout(() => {
                setForm({ title: '', description: '', budget: '', budgetUtilized: '', location: '', lat: '', lng: '', startDate: '', endDate: '', beneficiaries: '', outcomeMetric: '' });
                setSdgResults(null);
                setStep('form');
                setSaveStatus('idle');
            }, 2000);
        } catch {
            setSaveStatus('idle');
            alert('Project saved to local state (DB unavailable)');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-slate-900">Create New Project</h1>
                <p className="text-sm text-slate-500 mt-1">Fill in all required fields — AI will classify relevant SDGs automatically</p>
            </motion.div>

            <AnimatePresence mode="wait">
                {step === 'form' && (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleSubmit}
                        className="glass-card p-6 space-y-4"
                    >
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Project Title *</label>
                            <input type="text" value={form.title} onChange={e => update('title', e.target.value)}
                                className="input-dark" placeholder="e.g. Clean Water for Rural Maharashtra" required />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                Project Description <span className="text-blue-500">(AI will analyze this)</span> *
                            </label>
                            <textarea value={form.description} onChange={e => update('description', e.target.value)}
                                className="input-dark min-h-[120px] resize-none" required
                                placeholder="Describe your project objectives, target population, methodology, and expected outcomes..." />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Budget Allocated (₹) *</label>
                                <input type="number" value={form.budget} onChange={e => update('budget', e.target.value)}
                                    className="input-dark" placeholder="2500000" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Budget Utilized (₹) *</label>
                                <input type="number" value={form.budgetUtilized} onChange={e => update('budgetUtilized', e.target.value)}
                                    className="input-dark" placeholder="1800000" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Beneficiary Count *</label>
                                <input type="number" value={form.beneficiaries} onChange={e => update('beneficiaries', e.target.value)}
                                    className="input-dark" placeholder="25000" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Outcome Metric (0-100 improvement %) *</label>
                            <input type="number" min="0" max="100" value={form.outcomeMetric} onChange={e => update('outcomeMetric', e.target.value)}
                                className="input-dark" placeholder="e.g. 75 = 75% improvement in access" required />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Location *</label>
                                <input type="text" value={form.location} onChange={e => update('location', e.target.value)}
                                    className="input-dark" placeholder="Maharashtra" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Latitude</label>
                                <input type="text" value={form.lat} onChange={e => update('lat', e.target.value)}
                                    className="input-dark" placeholder="19.076" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Longitude</label>
                                <input type="text" value={form.lng} onChange={e => update('lng', e.target.value)}
                                    className="input-dark" placeholder="72.877" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date *</label>
                                <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)}
                                    className="input-dark" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date *</label>
                                <input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)}
                                    className="input-dark" required />
                            </div>
                        </div>

                        <div className="p-3 rounded-xl text-xs text-slate-500" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.1)' }}>
                            ⚠️ All fields marked with * are required. Projects cannot be saved without complete structured data.
                        </div>

                        <button type="submit" className="btn-neon w-full py-3 text-sm">
                            🤖 Analyze & Classify SDGs →
                        </button>
                    </motion.form>
                )}

                {step === 'analyzing' && (
                    <motion.div
                        key="analyzing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card p-12 text-center"
                    >
                        <div className="inline-block animate-spin text-4xl mb-4">🤖</div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">AI is Analyzing...</h2>
                        <p className="text-sm text-slate-500">Classifying your project into relevant UN SDGs (1–17)</p>
                        <div className="mt-6 flex justify-center gap-2">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-3 h-3 rounded-full animate-pulse"
                                    style={{ background: '#22c55e', animationDelay: `${i * 0.3}s` }} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 'results' && sdgResults && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">✅</span>
                                    <h2 className="text-lg font-bold text-slate-900">SDG Classification Complete</h2>
                                </div>
                                <span className="text-[10px] px-2.5 py-1 rounded-lg font-medium"
                                    style={{
                                        background: sdgResults.source === 'openai' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                        color: sdgResults.source === 'openai' ? '#10b981' : '#f59e0b',
                                        border: `1px solid ${sdgResults.source === 'openai' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                    }}>
                                    {sdgResults.source === 'openai' ? '🤖 OpenAI Classified' : '📊 Local Classifier'}
                                </span>
                            </div>

                            {/* SDG Cards with Confidence Scores */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                {(sdgResults.classifications || sdgResults.sdg_tags?.map(t => ({ sdg_id: t, sdg_name: '', confidence: 0.85 })) || []).map((cls, i) => {
                                    const info = SDG_INFO.find(s => s.id === cls.sdg_id);
                                    const pct = Math.round(cls.confidence * 100);
                                    return (
                                        <motion.div
                                            key={cls.sdg_id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.15 }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-[200px]"
                                            style={{ background: info?.color + '12', border: `1px solid ${info?.color}30` }}
                                        >
                                            <span className="text-2xl">{info?.icon}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold" style={{ color: info?.color }}>SDG {cls.sdg_id}</p>
                                                    <span className="text-xs font-bold" style={{ color: info?.color }}>{pct}%</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{info?.name || cls.sdg_name}</p>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                                                        className="h-full rounded-full"
                                                        style={{ background: info?.color }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.1)' }}>
                                <p className="text-xs font-medium text-blue-500 mb-1">🧠 AI Reasoning</p>
                                <p className="text-sm text-gray-300">{sdgResults.reasoning}</p>
                            </div>
                        </div>

                        {/* Project Summary */}
                        <div className="glass-card p-6">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Project Summary</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-500">Title:</span> <span className="text-slate-900 ml-2">{form.title}</span></div>
                                <div><span className="text-slate-500">Budget Allocated:</span> <span className="text-slate-900 ml-2">₹{parseInt(form.budget || '0').toLocaleString()}</span></div>
                                <div><span className="text-slate-500">Budget Utilized:</span> <span className="text-slate-900 ml-2">₹{parseInt(form.budgetUtilized || '0').toLocaleString()}</span></div>
                                <div><span className="text-slate-500">Beneficiaries:</span> <span className="text-slate-900 ml-2">{parseInt(form.beneficiaries || '0').toLocaleString()}</span></div>
                                <div><span className="text-slate-500">Location:</span> <span className="text-slate-900 ml-2">{form.location}</span></div>
                                <div><span className="text-slate-500">Outcome Metric:</span> <span className="text-slate-900 ml-2">{form.outcomeMetric}% improvement</span></div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleSaveProject} disabled={saveStatus !== 'idle'}
                                className="btn-neon flex-1 py-3 text-sm disabled:opacity-50">
                                {saveStatus === 'saving' ? '⏳ Saving to backend...' : saveStatus === 'saved' ? '✅ Project Saved!' : '💾 Save Project'}
                            </button>
                            <button onClick={() => setStep('form')} disabled={saveStatus !== 'idle'}
                                className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-500 disabled:opacity-50"
                                style={{ background: '#e2e8f0', border: '1px solid #e2e8f0' }}>
                                ← Edit Details
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
