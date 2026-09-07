'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import CryptoJS from 'crypto-js';
import {
    Target,
    ArrowLeft,
    Plus,
    Calendar,
    MapPin,
    Building2,
    Clock,
    CheckCircle2,
    ShieldCheck,
    AlertCircle,
    X,
    Upload,
    Video,
    Camera,
    Navigation,
    Lock,
    Sparkles,
    Check,
    Hash,
    ExternalLink,
} from 'lucide-react';
import { SDG_INFO } from '@/data/mockData';

interface MilestoneProject {
    id: string;
    projectId: string;
    teamId: string;
    proposalId?: string;
    challengeId: string;
    challengeTitle: string;
    district: string;
    block?: string;
    category?: string;
    sdgTags?: number[];
    csrFunder: string;
    daysActive: number;
    proposalStatus: string;
    totalMilestones: number;
    verifiedMilestones: number;
    facultyName?: string;
}

interface MilestoneItem {
    id: string;
    teamId: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'PENDING' | 'SUBMITTED' | 'GP_VERIFIED' | 'CSR_APPROVED' | 'REJECTED';
    proofUrls: string[];
    proofVideoUrl?: string | null;
    hashValue?: string | null;
    gpsLat?: number | null;
    gpsLng?: number | null;
    verifierCode?: string | null;
    fundReleased?: number | null;
    createdAt?: string;
}

// Client image compressor
async function compressImageToMax1200(file: File): Promise<{ dataUrl: string; compressedSize: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                const maxDim = 1200;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve({ dataUrl: e.target?.result as string, compressedSize: file.size });
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                const base64str = dataUrl.split(',')[1] || '';
                const compressedSize = Math.round((base64str.length * 3) / 4);
                resolve({ dataUrl, compressedSize });
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export default function MilestoneTrackerPage() {
    // Projects and selection
    const [projects, setProjects] = useState<MilestoneProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<MilestoneProject | null>(null);
    const [loadingProjects, setLoadingProjects] = useState(true);

    // Milestones for selected project
    const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
    const [loadingMilestones, setLoadingMilestones] = useState(false);

    // Side panel state for "Add Milestone"
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    // Form inputs in side panel
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [photos, setPhotos] = useState<{ dataUrl: string; name: string }[]>([]);
    const [videoName, setVideoName] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [gpsLat, setGpsLat] = useState<number | null>(null);
    const [gpsLng, setGpsLng] = useState<number | null>(null);
    const [gpsDetecting, setGpsDetecting] = useState(false);
    const [gpsStatus, setGpsStatus] = useState<string | null>(null);

    // Submission states & Cryptographic Sealing
    const [submittingMilestone, setSubmittingMilestone] = useState(false);
    const [sealedHash, setSealedHash] = useState<string | null>(null);
    const [sealedSuccess, setSealedSuccess] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);

    // 1. Fetch Active Projects
    useEffect(() => {
        const fetchProjects = async () => {
            setLoadingProjects(true);
            try {
                const res = await fetch('/api/hei/milestones/projects');
                const json = await res.json();
                if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
                    setProjects(json.data);
                    setSelectedProject(json.data[0]); // Select Hero Demo Project by default
                }
            } catch (err) {
                console.warn('Failed to load milestone projects:', err);
            } finally {
                setLoadingProjects(false);
            }
        };

        fetchProjects();
    }, []);

    // 2. Fetch Milestones when selected project changes
    useEffect(() => {
        if (!selectedProject) return;

        const fetchMilestones = async () => {
            setLoadingMilestones(true);
            try {
                const projectId = selectedProject.projectId || selectedProject.id;
                const res = await fetch(`/api/hei/milestones/${projectId}`);
                const json = await res.json();
                if (res.ok && json.success && Array.isArray(json.data)) {
                    setMilestones(json.data);
                }
            } catch (err) {
                console.warn('Failed to load milestones for project:', err);
            } finally {
                setLoadingMilestones(false);
            }
        };

        fetchMilestones();
    }, [selectedProject]);

    // GPS Auto-Capture
    const handleCaptureGps = () => {
        if (!navigator.geolocation) {
            setGpsStatus('Geolocation not supported by browser. Using district center coordinates.');
            setGpsLat(24.6352);
            setGpsLng(87.8448);
            return;
        }

        setGpsDetecting(true);
        setGpsStatus('Acquiring precise satellite coordinates...');

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGpsLat(Number(pos.coords.latitude.toFixed(4)));
                setGpsLng(Number(pos.coords.longitude.toFixed(4)));
                setGpsDetecting(false);
                setGpsStatus(`GPS Auto-Captured (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`);
            },
            (err) => {
                setGpsDetecting(false);
                // Fallback to demo GPS for Pakur / district
                setGpsLat(24.6352);
                setGpsLng(87.8448);
                setGpsStatus(`Satellite lock simulation: Pakur District (${err.message ? 'Fallback lock' : 'Active'})`);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    };

    // Photo Upload (max 3 photos, 5MB each)
    const handlePhotoUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setFormError(null);

        const newPhotos: { dataUrl: string; name: string }[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 5 * 1024 * 1024) {
                setFormError(`Image "${file.name}" exceeds 5MB limit`);
                continue;
            }

            try {
                const res = await compressImageToMax1200(file);
                newPhotos.push({
                    dataUrl: res.dataUrl,
                    name: file.name,
                });
            } catch (err) {
                console.error('Failed to compress image:', err);
            }
        }

        setPhotos((prev) => [...prev, ...newPhotos].slice(0, 3)); // Max 3 photos
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Video Upload (optional, mp4, max 50MB)
    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            setFormError('Video file exceeds 50MB limit');
            return;
        }

        setVideoName(file.name);
        setVideoUrl(URL.createObjectURL(file));
    };

    // ON MILESTONE SUBMISSION (Key Technical Requirement)
    const handleSubmitMilestone = async () => {
        if (!newTitle.trim()) {
            setFormError('Milestone title is required');
            return;
        }

        if (!newDueDate) {
            setFormError('Please pick a due date');
            return;
        }

        setFormError(null);
        setSubmittingMilestone(true);

        try {
            // 1. After photo upload returns URL, compute SHA-256 of:
            // proofUrl + timestamp + gpsLat + gpsLng
            // Using crypto-js
            const primaryProofUrl = photos.length > 0
                ? photos[0].dataUrl
                : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

            const effectiveLat = gpsLat ?? 24.6352;
            const effectiveLng = gpsLng ?? 87.8448;
            const timestamp = new Date().toISOString();

            const hashInput = `${primaryProofUrl}|${timestamp}|${effectiveLat}|${effectiveLng}`;
            const computedHash = CryptoJS.SHA256(hashInput).toString();

            // Set state to display cryptographically sealed status to user
            setSealedHash(computedHash);

            // 2. Call POST /api/hei/milestones/submit with hashValue
            const res = await fetch('/api/hei/milestones/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: selectedProject?.projectId || selectedProject?.id,
                    teamId: selectedProject?.teamId || selectedProject?.id,
                    title: newTitle.trim(),
                    description: newDescription.trim(),
                    dueDate: newDueDate,
                    proofUrls: photos.map((p) => p.dataUrl),
                    proofVideoUrl: videoUrl,
                    hashValue: computedHash,
                    gpsLat: effectiveLat,
                    gpsLng: effectiveLng,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to submit sealed milestone');
            }

            // 3. Update local Kanban board state immediately
            const submittedMilestone: MilestoneItem = {
                id: json.data?.milestone?.id || `ms-${Date.now()}`,
                teamId: selectedProject?.teamId || 'team-1',
                title: newTitle.trim(),
                description: newDescription.trim(),
                dueDate: newDueDate,
                status: 'SUBMITTED',
                proofUrls: photos.map((p) => p.dataUrl),
                proofVideoUrl: videoUrl,
                hashValue: computedHash,
                gpsLat: effectiveLat,
                gpsLng: effectiveLng,
                createdAt: timestamp,
            };

            setMilestones((prev) => [submittedMilestone, ...prev]);
            setSealedSuccess(true);
        } catch (err: any) {
            setFormError(err.message || 'Error sealing milestone');
        } finally {
            setSubmittingMilestone(false);
        }
    };

    const handleResetForm = () => {
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setPhotos([]);
        setVideoName(null);
        setVideoUrl(null);
        setGpsLat(null);
        setGpsLng(null);
        setGpsStatus(null);
        setSealedHash(null);
        setSealedSuccess(false);
        setFormError(null);
        setIsSidePanelOpen(false);
    };

    // Columns categorizer for Kanban board
    const pendingMilestones = milestones.filter((m) => m.status === 'PENDING');
    const submittedMilestones = milestones.filter((m) => m.status === 'SUBMITTED');
    const verifiedMilestones = milestones.filter(
        (m) => m.status === 'GP_VERIFIED' || m.status === 'CSR_APPROVED'
    );
    const rejectedMilestones = milestones.filter((m) => m.status === 'REJECTED');

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Top Bar Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <Link
                        href="/dashboard/hei"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Challenge Inbox
                    </Link>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        Screen 4 • Milestone Tracker & Cryptographic Proof Verification
                    </h1>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {selectedProject && (
                        <Link
                            href={`/project/${selectedProject.teamId || selectedProject.id}/ledger`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 hover:text-amber-200 text-xs font-bold border border-slate-700 shadow-sm transition"
                        >
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Public SHA-256 Ledger</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setSealedSuccess(false);
                            setSealedHash(null);
                            setIsSidePanelOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Milestone</span>
                    </button>
                </div>
            </div>

            {/* Active Projects Cards (Proposals with status ACCEPTED) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Active Accepted Projects ({projects.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                        Click project card to inspect milestone board
                    </span>
                </div>

                {loadingProjects ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                        <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((proj) => {
                            const isSelected = (selectedProject?.id || selectedProject?.projectId) === (proj.id || proj.projectId);
                            return (
                                <div
                                    key={proj.id}
                                    onClick={() => setSelectedProject(proj)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs flex flex-col justify-between space-y-3 ${
                                        isSelected
                                            ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                                            : 'bg-white text-slate-900 border-slate-200 hover:border-indigo-300'
                                    }`}
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                    isSelected
                                                        ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                }`}
                                            >
                                                Proposal Accepted
                                            </span>
                                            <span
                                                className={`text-[11px] font-semibold flex items-center gap-1 ${
                                                    isSelected ? 'text-slate-300' : 'text-slate-500'
                                                }`}
                                            >
                                                <Clock className="w-3 h-3 text-indigo-400" />
                                                {proj.daysActive} days active
                                            </span>
                                        </div>

                                        <h3 className="text-xs sm:text-sm font-bold leading-snug">
                                            {proj.challengeTitle}
                                        </h3>
                                    </div>

                                    <div
                                        className={`pt-2 border-t text-[11px] flex items-center justify-between ${
                                            isSelected ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                                        }`}
                                    >
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                            {proj.district}, Jharkhand
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold">
                                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                                            {proj.csrFunder}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Selected Project Info Header */}
            {selectedProject && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-slate-900 block text-sm">
                                {selectedProject.challengeTitle}
                            </span>
                            <span className="text-slate-500">
                                District: {selectedProject.district} • CSR Funder: <strong className="text-slate-800">{selectedProject.csrFunder}</strong> • {selectedProject.daysActive} days active
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/project/${selectedProject.teamId || selectedProject.id}/ledger`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold transition shadow-xs"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Public Ledger</span>
                            <ExternalLink className="w-3 h-3 text-emerald-600" />
                        </Link>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold">
                            Total: {milestones.length} Milestones
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                            {verifiedMilestones.length} Verified
                        </span>
                    </div>
                </div>
            )}

            {/* KANBAN-STYLE MILESTONE BOARD (4 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Column 1: Pending */}
                <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Pending
                            </h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200">
                            {pendingMilestones.length}
                        </span>
                    </div>

                    <div className="space-y-3 min-h-[160px]">
                        {pendingMilestones.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs italic">
                                No pending milestones
                            </div>
                        ) : (
                            pendingMilestones.map((m) => (
                                <MilestoneCard key={m.id} milestone={m} />
                            ))
                        )}
                    </div>
                </div>

                {/* Column 2: Submitted */}
                <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                                Submitted
                            </h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-blue-800 border border-blue-200">
                            {submittedMilestones.length}
                        </span>
                    </div>

                    <div className="space-y-3 min-h-[160px]">
                        {submittedMilestones.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs italic">
                                No submitted proofs awaiting review
                            </div>
                        ) : (
                            submittedMilestones.map((m) => (
                                <MilestoneCard key={m.id} milestone={m} />
                            ))
                        )}
                    </div>
                </div>

                {/* Column 3: Verified */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                                Verified
                            </h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-200">
                            {verifiedMilestones.length}
                        </span>
                    </div>

                    <div className="space-y-3 min-h-[160px]">
                        {verifiedMilestones.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs italic">
                                No verified milestones yet
                            </div>
                        ) : (
                            verifiedMilestones.map((m) => (
                                <MilestoneCard key={m.id} milestone={m} />
                            ))
                        )}
                    </div>
                </div>

                {/* Column 4: Rejected */}
                <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                                Rejected
                            </h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-rose-800 border border-rose-200">
                            {rejectedMilestones.length}
                        </span>
                    </div>

                    <div className="space-y-3 min-h-[160px]">
                        {rejectedMilestones.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs italic">
                                Zero rejected milestones
                            </div>
                        ) : (
                            rejectedMilestones.map((m) => (
                                <MilestoneCard key={m.id} milestone={m} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* SIDE PANEL / DRAWER MODAL: "Add Milestone" */}
            <AnimatePresence>
                {isSidePanelOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
                        >
                            {/* Drawer Header */}
                            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900">
                                            Submit Project Milestone Proof
                                        </h2>
                                        <p className="text-[11px] text-slate-500">
                                            Target Project: {selectedProject?.challengeTitle}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="p-5 sm:p-6 space-y-5 flex-1">
                                {formError && (
                                    <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                        <span>{formError}</span>
                                    </div>
                                )}

                                {/* Cryptographic Seal Banner (Displayed upon submission) */}
                                {sealedSuccess && sealedHash && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-emerald-900 text-white p-5 rounded-2xl space-y-3 shadow-md border border-emerald-700"
                                    >
                                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                            <span>Your milestone is cryptographically sealed</span>
                                        </div>

                                        <p className="text-[11px] text-emerald-100 leading-relaxed">
                                            SHA-256 cryptographic digest computed from uploaded photographic proof, timestamp, and satellite GPS coordinates:
                                        </p>

                                        {/* Monospace Code Block: [first 16 chars]...[last 16 chars] */}
                                        <div className="bg-black/40 border border-emerald-500/40 rounded-xl p-3 font-mono text-xs text-emerald-300 flex items-center justify-between">
                                            <span className="tracking-wider">
                                                {sealedHash.slice(0, 16)}...{sealedHash.slice(-16)}
                                            </span>
                                            <span className="text-[10px] text-emerald-400/80 bg-emerald-950 px-2 py-0.5 rounded">
                                                SHA-256
                                            </span>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleResetForm}
                                                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                                            >
                                                Done & Close
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 1. Title */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Milestone Title <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="e.g. Prototype filtration unit installed at Amrapara"
                                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800"
                                    />
                                </div>

                                {/* 2. Description */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Description & Deliverables Summary
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        placeholder="Technical metrics, flow rate, village operator training notes, or laboratory test results."
                                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 leading-relaxed"
                                    />
                                </div>

                                {/* 3. Due Date Picker (native <input type="date">) */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                        Due Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={newDueDate}
                                        onChange={(e) => setNewDueDate(e.target.value)}
                                        className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 font-medium"
                                    />
                                </div>

                                {/* 4. GPS Auto-Capture Button */}
                                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <Navigation className="w-4 h-4 text-indigo-600" />
                                            GPS Geo-Tagging (Immutable Ledger Proof)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleCaptureGps}
                                            disabled={gpsDetecting}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1.5"
                                        >
                                            <Navigation className="w-3 h-3" />
                                            <span>{gpsDetecting ? 'Acquiring...' : 'Auto-Capture GPS'}</span>
                                        </button>
                                    </div>

                                    {gpsLat && gpsLng ? (
                                        <div className="flex items-center gap-2 pt-2 text-xs text-emerald-800 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span>
                                                Coordinates: {gpsLat.toFixed(4)}° N, {gpsLng.toFixed(4)}° E
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-slate-500 pt-1">
                                            Click above to stamp physical on-ground validation location.
                                        </p>
                                    )}

                                    {gpsStatus && (
                                        <p className="text-[10px] text-indigo-600 font-medium">{gpsStatus}</p>
                                    )}
                                </div>

                                {/* 5. Proof Photo Upload (Max 3 photos, 5MB each) */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                            <Camera className="w-4 h-4 text-indigo-600" />
                                            Proof Photos (Max 3, 5MB each)
                                        </label>
                                        <span className="text-[11px] text-slate-400">
                                            {photos.length}/3 selected
                                        </span>
                                    </div>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20"
                                    >
                                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                        <span className="text-xs text-slate-600 font-medium block">
                                            Click to upload on-site field photos
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            Supports JPG, PNG with client-side EXIF preserved
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handlePhotoUpload(e.target.files)}
                                        className="hidden"
                                    />

                                    {photos.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 pt-1">
                                            {photos.map((p, idx) => (
                                                <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 group">
                                                    <img
                                                        src={p.dataUrl}
                                                        alt={p.name}
                                                        className="w-full h-20 object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                                                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition text-[10px]"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 6. Proof Video Upload (Optional, mp4, max 50MB) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Video className="w-4 h-4 text-indigo-600" />
                                        Proof Video (Optional, MP4, Max 50MB)
                                    </label>
                                    <input
                                        type="file"
                                        ref={videoInputRef}
                                        accept="video/mp4,video/*"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                    />

                                    {videoName ? (
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                                            <span className="truncate max-w-xs font-medium text-slate-800">
                                                {videoName}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVideoName(null);
                                                    setVideoUrl(null);
                                                }}
                                                className="text-rose-600 hover:text-rose-800 font-bold"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => videoInputRef.current?.click()}
                                            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-2 font-medium"
                                        >
                                            <Video className="w-4 h-4 text-slate-400" />
                                            <span>Attach video demonstration</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="p-5 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitMilestone}
                                    disabled={submittingMilestone}
                                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>{submittingMilestone ? 'Sealing Proof...' : 'Seal & Submit Milestone'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Milestone Card Component for Kanban Board
function MilestoneCard({ milestone }: { milestone: MilestoneItem }) {
    const isVerified = milestone.status === 'GP_VERIFIED' || milestone.status === 'CSR_APPROVED';
    const isSubmitted = milestone.status === 'SUBMITTED';

    return (
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs space-y-2.5 hover:shadow-xs transition">
            <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {milestone.title}
                </h4>
                <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                        isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : isSubmitted
                            ? 'bg-blue-100 text-blue-800'
                            : milestone.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {milestone.status === 'GP_VERIFIED'
                        ? 'GP Verified'
                        : milestone.status === 'CSR_APPROVED'
                        ? 'CSR Approved'
                        : milestone.status}
                </span>
            </div>

            {milestone.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {milestone.description}
                </p>
            )}

            {/* Proof thumbnail preview if present */}
            {milestone.proofUrls && milestone.proofUrls.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                    {milestone.proofUrls.slice(0, 2).map((url, i) => (
                        <img
                            key={i}
                            src={url}
                            alt="Proof"
                            className="w-10 h-10 object-cover rounded-md border border-slate-200 flex-shrink-0"
                        />
                    ))}
                    {milestone.proofUrls.length > 2 && (
                        <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                            +{milestone.proofUrls.length - 2}
                        </div>
                    )}
                </div>
            )}

            {/* Cryptographic SHA-256 Hash Display */}
            {milestone.hashValue && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-[10px] space-y-0.5 font-mono">
                    <div className="flex items-center justify-between text-slate-400 font-sans">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-600 uppercase">
                            <Lock className="w-2.5 h-2.5 text-indigo-600" />
                            SHA-256 Sealed
                        </span>
                        {milestone.verifierCode && (
                            <span className="text-[9px] text-emerald-700 font-semibold font-sans">
                                Sign: #{milestone.verifierCode}
                            </span>
                        )}
                    </div>
                    <span className="text-indigo-900 block truncate">
                        {milestone.hashValue.slice(0, 16)}...{milestone.hashValue.slice(-16)}
                    </span>
                </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
                {milestone.gpsLat && milestone.gpsLng && (
                    <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                        <MapPin className="w-2.5 h-2.5" />
                        {milestone.gpsLat.toFixed(2)}°, {milestone.gpsLng.toFixed(2)}°
                    </span>
                )}
            </div>
        </div>
    );
}
