'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useData } from '@/lib/DataContext';

export default function ProfilePage() {
    const { user } = useAuth();
    const { projects } = useData();

    if (!user) return null;

    const myProjects = projects.filter(p => p.organization_id === user.id);
    const totalBeneficiaries = myProjects.reduce((acc, p) => acc + p.beneficiary_count, 0);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header Area */}
            <div className="relative h-48 rounded-2xl overflow-hidden mb-16" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #0f172a 100%)' }}>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center"></div>
                <div className="absolute -bottom-12 left-8 flex items-end">
                    <div className="w-32 h-32 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-2xl border-4 border-white"
                        style={{ background: '#3b82f6', color: '#fff' }}>
                        {user.name.charAt(0)}
                    </div>
                </div>
            </div>

            <div className="px-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                    <p className="text-lg text-slate-500 mt-1">{user.organization_name}</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        Edit Profile
                    </button>
                    <button className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-md hover:opacity-90 transition-opacity" style={{ background: '#16a34a' }}>
                        Download Report
                    </button>
                </div>
            </div>

            <div className="px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left Column - Details */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Account Overview</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Verification Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full" style={{ background: user.verification_status === 'verified' ? '#10b981' : '#f59e0b' }}></span>
                                    <span className="text-sm font-medium text-slate-800">{user.verification_status === 'verified' ? 'Level 3 - Fully Verified' : 'Level 1 - Pending KYC'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Registered Role</p>
                                <p className="text-sm font-medium text-slate-800 mt-0.5">{user.role.toUpperCase()} 🏢</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Email Address</p>
                                <p className="text-sm font-medium text-slate-800 mt-0.5">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Member Since</p>
                                <p className="text-sm font-medium text-slate-800 mt-0.5">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">SDG Nexus ID</p>
                                <p className="text-xs font-mono text-slate-600 mt-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">{user.id}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Compliance & Documents</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">📄</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Registration Certificate</p>
                                        <p className="text-[10px] text-slate-500">Verified on {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="text-green-500 text-sm">✓</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🏦</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Financial Audit FY24-25</p>
                                        <p className="text-[10px] text-slate-500">Secure Vault Storage</p>
                                    </div>
                                </div>
                                <span className="text-green-500 text-sm">✓</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            + Upload New Document
                        </button>
                    </motion.div>
                </div>

                {/* Right Column - Activity & Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
                            <h4 className="text-3xl font-bold" style={{ color: '#16a34a' }}>{myProjects.length || 0}</h4>
                            <p className="text-xs font-medium text-slate-500 uppercase mt-2">Active Projects</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 text-center">
                            <h4 className="text-3xl font-bold" style={{ color: '#3b82f6' }}>{(totalBeneficiaries / 1000).toFixed(1)}K</h4>
                            <p className="text-xs font-medium text-slate-500 uppercase mt-2">Beneficiaries Reached</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 text-center">
                            <h4 className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>{Math.max(90, 100 - (myProjects.length * 2))}%</h4>
                            <p className="text-xs font-medium text-slate-500 uppercase mt-2">Profile Completeness</p>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Activity & Security</h3>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Secure</span>
                        </div>

                        <div className="space-y-4">
                            {[
                                { action: 'Logged in from new device', date: 'Just now', ip: '192.168.1.1', location: 'Mumbai, India', icon: '💻' },
                                { action: 'Downloaded Impact Report', date: '2 days ago', ip: '192.168.1.1', location: 'Mumbai, India', icon: '📥' },
                                { action: 'Profile Details Updated', date: '5 days ago', ip: '192.168.1.1', location: 'Mumbai, India', icon: '⚙️' },
                            ].map((log, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm text-lg">
                                        {log.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-800">{log.action}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                                            <span>{log.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>IP: {log.ip}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{log.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">Preferences</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="text-sm font-medium text-slate-900">Email Notifications</h5>
                                    <p className="text-xs text-slate-500 mt-0.5">Receive monthly digest of platform analytics.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="text-sm font-medium text-slate-900">Two-Factor Authentication (2FA)</h5>
                                    <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to your account.</p>
                                </div>
                                <button className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">Enable 2FA</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
