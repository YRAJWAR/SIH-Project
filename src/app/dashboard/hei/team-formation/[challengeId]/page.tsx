'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import {
    Users,
    ArrowLeft,
    Search,
    Star,
    Trash2,
    Lock,
    Sparkles,
    CheckCircle2,
    MapPin,
    AlertCircle,
    UserCheck,
    GraduationCap,
    Check,
    Plus,
} from 'lucide-react';
import { SDG_INFO } from '@/data/mockData';

interface Student {
    id: string;
    userId?: string;
    name: string;
    email: string;
    branch: string;
    year: number;
    skills: string[];
    rating: number;
    credits: number;
}

interface TeamMemberSelection {
    studentProfileId: string;
    name: string;
    email: string;
    branch: string;
    role: 'Lead' | 'Developer' | 'Field Researcher' | 'Designer';
}

export default function TeamFormationPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const challengeId = params?.challengeId as string;

    // Challenge info
    const [challenge, setChallenge] = useState<any | null>(null);
    const [loadingChallenge, setLoadingChallenge] = useState(true);

    // Form states
    const [facultyName, setFacultyName] = useState(user?.name || 'Prof. Anjali Sharma');
    const [facultyEmail, setFacultyEmail] = useState(user?.email || 'faculty@nitjsr.ac.in');
    const [backupLead, setBackupLead] = useState('Dr. Sanjay Verma');
    const [teamName, setTeamName] = useState('');

    // Students search
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Selected team members
    const [teamMembers, setTeamMembers] = useState<TeamMemberSelection[]>([]);

    // Submission states
    const [locking, setLocking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch challenge details
    useEffect(() => {
        if (!challengeId) return;

        const fetchChallenge = async () => {
            setLoadingChallenge(true);
            try {
                const res = await fetch(`/api/challenges/${challengeId}/status`);
                const json = await res.json();
                if (res.ok && json.success) {
                    setChallenge(json.data);
                    // Propose a default team name based on challenge title
                    const words = json.data.title.split(' ').slice(0, 3).join(' ');
                    setTeamName(`Team ${words} Innovation`);
                } else {
                    // Demo fallback
                    setChallenge({
                        id: challengeId,
                        title: 'Open defecation & hygiene sanitation in Simdega tribal hamlets',
                        description:
                            'Rural cluster of 4 villages lacking decentralized eco-friendly bio-toilets. Requires localized engineering prototype and water recycling unit.',
                        district: 'Simdega',
                        sdgTags: [6, 3],
                        status: 'UNIVERSITY_ASSIGNED',
                    });
                    setTeamName('Team Simdega EcoSanitation');
                }
            } catch {
                setChallenge({
                    id: challengeId,
                    title: 'Community Societal R&D Challenge',
                    description: 'Interdisciplinary engineering intervention required for community empowerment.',
                    district: 'Jharkhand',
                    sdgTags: [6, 11],
                    status: 'UNIVERSITY_ASSIGNED',
                });
                setTeamName('Team Jharkhand Nexus R&D');
            } finally {
                setLoadingChallenge(false);
            }
        };

        fetchChallenge();
    }, [challengeId]);

    // Fetch students based on search query
    useEffect(() => {
        const timer = setTimeout(async () => {
            setLoadingStudents(true);
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('sdg_nexus_token') : null;
                const headers: Record<string, string> = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`/api/students/search?q=${encodeURIComponent(searchQuery)}`, { headers });
                const json = await res.json();
                if (res.ok && json.success) {
                    setStudents(json.data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingStudents(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Update faculty info when user loads
    useEffect(() => {
        if (user) {
            setFacultyName(user.name);
            setFacultyEmail(user.email);
        }
    }, [user]);

    const handleAddStudent = (student: Student) => {
        if (teamMembers.some((m) => m.studentProfileId === student.id)) return;

        // Default role: First student is Lead, subsequent are Developer / Field Researcher
        const role: 'Lead' | 'Developer' | 'Field Researcher' | 'Designer' =
            teamMembers.length === 0 ? 'Lead' : teamMembers.length === 1 ? 'Developer' : 'Field Researcher';

        setTeamMembers((prev) => [
            ...prev,
            {
                studentProfileId: student.id,
                name: student.name,
                email: student.email,
                branch: student.branch,
                role,
            },
        ]);
    };

    const handleRemoveStudent = (studentProfileId: string) => {
        setTeamMembers((prev) => prev.filter((m) => m.studentProfileId !== studentProfileId));
    };

    const handleRoleChange = (
        studentProfileId: string,
        role: 'Lead' | 'Developer' | 'Field Researcher' | 'Designer'
    ) => {
        setTeamMembers((prev) =>
            prev.map((m) => (m.studentProfileId === studentProfileId ? { ...m, role } : m))
        );
    };

    const handleLockTeam = async () => {
        if (teamMembers.length < 2) {
            setError('Please add at least 2 student team members before locking the team.');
            return;
        }

        if (!teamName.trim()) {
            setError('Please provide a team name.');
            return;
        }

        setError(null);
        setLocking(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('sdg_nexus_token') : null;
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/hei/teams/create', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    challengeId,
                    teamName: teamName.trim(),
                    facultyName: facultyName.trim(),
                    facultyEmail: facultyEmail.trim(),
                    backupLead: backupLead ? backupLead.trim() : undefined,
                    members: teamMembers.map((m) => ({
                        studentProfileId: m.studentProfileId,
                        role: m.role,
                    })),
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to lock team');
            }

            // Redirect to Challenge Inbox
            router.push('/dashboard/hei');
        } catch (err: any) {
            setError(err.message || 'Error creating team');
            setLocking(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            {/* Top Back Link */}
            <div>
                <Link
                    href="/dashboard/hei"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Challenge Inbox
                </Link>
            </div>

            {/* Top Challenge Overview Card */}
            {loadingChallenge ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-2/3 mx-auto" />
                </div>
            ) : (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-800/60 shadow-md">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                            Accepting & Forming Team
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            {challenge.district}, Jharkhand
                        </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2">
                        {challenge.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mb-4">
                        {challenge.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                        <span className="text-xs text-slate-400 mr-1">Target UN SDGs:</span>
                        {challenge.sdgTags?.map((tagId: number) => {
                            const sdg = SDG_INFO.find((s) => s.id === tagId);
                            return (
                                <span
                                    key={tagId}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold text-white shadow-xs"
                                    style={{ backgroundColor: sdg ? sdg.color : '#059669' }}
                                >
                                    <span>{sdg?.icon}</span>
                                    <span>SDG {tagId}: {sdg?.name}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 flex items-start gap-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Team Formation Error</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (7 cols): Team Metadata & Student Search */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Team Configuration Card */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                            <Users className="w-4 h-4 text-indigo-600" />
                            Research Team Leadership
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Faculty Mentor (Pre-filled)
                                </label>
                                <input
                                    type="text"
                                    value={facultyName}
                                    onChange={(e) => setFacultyName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Prof. Anjali Sharma"
                                />
                                <span className="text-[10px] text-slate-400 mt-0.5 block">{facultyEmail}</span>
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Backup Faculty / Co-Lead
                                </label>
                                <input
                                    type="text"
                                    value={backupLead}
                                    onChange={(e) => setBackupLead(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Dr. Sanjay Verma"
                                />
                                <span className="text-[10px] text-slate-400 mt-0.5 block">Co-investigator</span>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Official Team Name *
                                </label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. NITJSR Eco-Water Solutions Cell"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student Search & Candidate Selection */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                <GraduationCap className="w-4 h-4 text-indigo-600" />
                                Student Researcher Candidates
                            </div>
                            <span className="text-[11px] text-slate-400">
                                {students.length} profile(s) found
                            </span>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search students by name, branch, skills (e.g. Water, GIS, Python)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Student Cards List */}
                        {loadingStudents ? (
                            <div className="py-8 text-center text-xs text-slate-500">
                                Searching university student database...
                            </div>
                        ) : students.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">
                                No students matched &ldquo;{searchQuery}&rdquo;. Try another skill or branch.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                                {students.map((student) => {
                                    const isAdded = teamMembers.some((m) => m.studentProfileId === student.id);

                                    return (
                                        <div
                                            key={student.id}
                                            className={`p-3.5 rounded-xl border transition-all ${
                                                isAdded
                                                    ? 'bg-indigo-50/50 border-indigo-200'
                                                    : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <div>
                                                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                                                        {student.name}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-500">
                                                        {student.branch} • Year {student.year}
                                                    </span>
                                                </div>

                                                {/* Rating stars */}
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    <span>{student.rating.toFixed(1)}</span>
                                                </div>
                                            </div>

                                            {/* Skills chips */}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {student.skills.slice(0, 3).map((skill, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-[9px] px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 rounded"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                type="button"
                                                disabled={isAdded}
                                                onClick={() => handleAddStudent(student)}
                                                className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                                                    isAdded
                                                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                                }`}
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        Added to Team
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Add to Team
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (5 cols): Selected Team Members Panel & Lock CTA */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 sticky top-6">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Configured Team Members
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Minimum 2 members required to lock team.
                                </p>
                            </div>
                            <span
                                className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                                    teamMembers.length >= 2
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-600'
                                }`}
                            >
                                {teamMembers.length} / 2 required
                            </span>
                        </div>

                        {teamMembers.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-medium text-slate-600">No students added yet</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                    Search and click &ldquo;Add to Team&rdquo; on candidates from the left panel.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.studentProfileId}
                                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <span className="font-bold text-xs text-slate-900 block truncate">
                                                {member.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500 block truncate">
                                                {member.branch}
                                            </span>
                                        </div>

                                        {/* Role Selector Dropdown */}
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={member.role}
                                                onChange={(e) =>
                                                    handleRoleChange(member.studentProfileId, e.target.value as any)
                                                }
                                                className="bg-white border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-800 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <option value="Lead">Lead</option>
                                                <option value="Developer">Developer</option>
                                                <option value="Field Researcher">Field Researcher</option>
                                                <option value="Designer">Designer</option>
                                            </select>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStudent(member.studentProfileId)}
                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* NEP 2020 Compliance Notice */}
                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
                            <span className="font-bold block mb-0.5">🎓 Academic Credit Earning:</span>
                            Locking this team registers students into Jharkhand R&D credit framework (NEP 2020 compliant).
                        </div>

                        {/* Lock Team CTA */}
                        <button
                            type="button"
                            disabled={teamMembers.length < 2 || locking}
                            onClick={handleLockTeam}
                            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md ${
                                teamMembers.length >= 2 && !locking
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {locking ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Registering Team & Alerting Government...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Lock Team & Form R&D Cell
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
