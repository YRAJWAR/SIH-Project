'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Cpu,
  ShieldCheck,
  Award,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Compass,
  FileCheck
} from 'lucide-react';

// Animated Count-Up Helper Component
function CountUp({ end, duration = 1500, prefix = '', suffix = '', decimals = 0 }: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * end);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  const formatted = decimals > 0 ? count.toFixed(decimals) : Math.round(count).toString();
  return <span>{prefix}{formatted}{suffix}</span>;
}

export default function LandingPage() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Demo accounts for SIH 2026 Jury
  const demoAccounts = [
    {
      role: 'Citizen (Submitter)',
      name: 'Ramu Oraon',
      email: 'citizen@jharkhand.gov.in',
      badge: 'Public Submitter',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Reports grassroots societal challenges with geo-tagged proof',
    },
    {
      role: 'District Collector (Government)',
      name: 'Dr. Ramesh Kumar',
      email: 'collector@jharkhand.gov.in',
      badge: 'State Authority',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Validates challenges, routes to anchor HEIs & tracks district metrics',
    },
    {
      role: 'University Faculty (HEI Lead)',
      name: 'Prof. Anjali Sharma (NIT Jsr)',
      email: 'faculty@nitjsr.ac.in',
      badge: 'Academic Lead',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Reviews matched problems, assigns student teams & submits proposals',
    },
    {
      role: 'Industry Partner (CSR Funder)',
      name: 'Tata Steel CSR Wing',
      email: 'csr@tatasteel.com',
      badge: 'CSR Partner',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Funds accepted proposals & releases tranches against validated milestones',
    },
    {
      role: 'Deployment Partner (NGO)',
      name: 'PRADAN Jharkhand',
      email: 'admin@pradan.net',
      badge: 'Field Partner',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Deploys hardware prototypes & coordinates ground verification with Panchayats',
    },
    {
      role: 'University Student (Innovator)',
      name: 'Arjun Mahato (NIT Jsr)',
      email: 'student@nitjsr.ac.in',
      badge: 'NEP Scholar',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Conducts field testing, submits proof & earns NAAC-compliant NEP credits',
    },
  ];

  // 3 Live non-DEPLOYED challenges from seed data
  const liveChallenges = [
    {
      title: 'High school dropout rate in Dumka tribal belt',
      district: 'Dumka',
      category: 'Education',
      sdgs: [
        { id: 4, name: 'Quality Education', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
        { id: 10, name: 'Reduced Inequalities', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
      ],
      status: 'IN_PROGRESS',
      statusLabel: 'In Progress',
      statusClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      daysActive: 42,
      assignedHei: 'Ranchi University & Tribal Welfare Cell',
    },
    {
      title: 'Crop pest management for kharif season in Garhwa',
      district: 'Garhwa',
      category: 'Agriculture',
      sdgs: [
        { id: 2, name: 'Zero Hunger', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
        { id: 15, name: 'Life on Land', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      ],
      status: 'TEAM_FORMED',
      statusLabel: 'Team Formed',
      statusClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      daysActive: 28,
      assignedHei: 'IIT (ISM) Dhanbad Ag-Tech Lab',
    },
    {
      title: 'Road connectivity to 8 villages in Latehar',
      district: 'Latehar',
      category: 'Infrastructure',
      sdgs: [
        { id: 11, name: 'Sustainable Cities', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
      ],
      status: 'VALIDATED',
      statusLabel: 'Validated by GoJ',
      statusClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      daysActive: 19,
      assignedHei: 'BIT Sindri Civil Engineering Cell',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-400 text-lg">
                  SDG
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SDG Nexus</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline-block">
                  SIH 2026
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                Govt. of Jharkhand • SIH26043
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/track"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition no-underline"
            >
              Live Challenges
            </Link>
            <Link
              href="/citizen/submit"
              className="text-xs sm:text-sm font-medium text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg hover:bg-cyan-500/10 transition no-underline hidden sm:block"
            >
              Submit Issue
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-white px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition shadow-sm no-underline"
            >
              Sign In
            </Link>
            <Link
              href="/citizen/submit"
              className="text-xs sm:text-sm font-semibold text-slate-950 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 transition shadow-md shadow-cyan-500/20 no-underline sm:hidden"
            >
              Submit
            </Link>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* SECTION 1 — HERO                                                          */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 bg-[#0f172a]">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Tagline / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-cyan-400 text-xs sm:text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>SIH 2026 | Problem Statement SIH26043 | Government of Jharkhand</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Jharkhand's Collaborative <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
              Innovation Stack
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Connecting communities, universities, and industry to solve real challenges.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/track"
              id="hero-view-challenges-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 no-underline"
            >
              <span>View Live Challenges</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/citizen/submit"
              id="hero-submit-challenge-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-base transition-all transform hover:-translate-y-0.5 no-underline shadow-sm"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Submit a Challenge</span>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto text-left">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-cyan-500/30 transition">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                <CountUp end={12} duration={1200} />
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-400">
                Active Challenges
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-cyan-500/30 transition">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                <CountUp end={24} duration={1500} />
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-400">
                Jharkhand Districts
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-cyan-500/30 transition">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                <CountUp end={6} duration={1200} />
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-400">
                Partner Institutions
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-cyan-500/30 transition">
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
                <CountUp end={1.5} duration={1800} prefix="₹" suffix="Cr" decimals={1} />
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-400">
                CSR Committed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 — THE PROBLEM (White Background)                                */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-white text-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-rose-600 uppercase mb-2 block">
              The Systemic Disconnect
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Three groups. Thousands of problems. Zero connection.
            </h2>
          </div>

          {/* Three Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-14">
            {/* Card 1: Communities */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl hover:border-rose-300 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  1. Communities
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Jharkhand's 24 districts generate thousands of documented local challenges every year — water, health, education, livelihoods. They submit complaints with no visibility into resolution.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-rose-600">
                Silent Grudges & Unresolved Grievances
              </div>
            </div>

            {/* Card 2: Universities */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  2. Universities
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  16+ HEIs in Jharkhand graduate 60,000+ students annually. Students do semester projects on theoretical problems when real challenges go unsolved 50km away.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-blue-600">
                Wasted Engineering & Research Talent
              </div>
            </div>

            {/* Card 3: Industry */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl hover:border-amber-300 transition group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  3. Industry
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  ₹800+ crore in annual CSR spending in Jharkhand. Companies disburse funds through personal networks and trusted intermediaries — with no visibility into actual impact.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-semibold text-amber-600">
                Blind Allocations & Compliance Checkboxes
              </div>
            </div>
          </div>

          {/* Punchline Highlight */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-center text-white shadow-xl">
            <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white">
              The bottleneck isn't resources or expertise. <span className="text-cyan-400 underline decoration-cyan-500 underline-offset-4">It's routing.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3 — THE SOLUTION — 6-ACTOR EXPLAINER                               */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#0a1122] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase mb-2 block">
              The Triple Helix Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              One platform. Six actors. A closed innovation loop.
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Every challenge moves through an immutable, transparent pipeline from grassroots report to verified citizen outcome.
            </p>
          </div>

          {/* 6-Actor Flow Grid / Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative">
            {/* Actor 1: Citizen */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/50 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Step 1</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">CITIZEN</h4>
                <div className="text-xs font-semibold text-emerald-400 mb-2.5">
                  [submits challenge]
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Snaps geotagged photo & notes issue without paperwork.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-end text-slate-400">
                <ArrowRight className="w-4 h-4 text-cyan-400 hidden lg:block" />
                <ArrowDown className="w-4 h-4 text-cyan-400 lg:hidden" />
              </div>
            </div>

            {/* Actor 2: Government */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/50 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Step 2</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">GOVERNMENT</h4>
                <div className="text-xs font-semibold text-blue-400 mb-2.5">
                  [validates & routes]
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  District Collector validates veracity & routes via AI match engine.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-end text-slate-400">
                <ArrowRight className="w-4 h-4 text-cyan-400 hidden lg:block" />
                <ArrowDown className="w-4 h-4 text-cyan-400 lg:hidden" />
              </div>
            </div>

            {/* Actor 3: University */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Step 3</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">UNIVERSITY</h4>
                <div className="text-xs font-semibold text-purple-400 mb-2.5">
                  [forms team & builds]
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Faculty & students engineer low-cost, open-source solution prototype.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-end text-slate-400">
                <ArrowRight className="w-4 h-4 text-cyan-400 hidden lg:block" />
                <ArrowDown className="w-4 h-4 text-cyan-400 lg:hidden" />
              </div>
            </div>

            {/* Actor 4: NGO */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-rose-500/50 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Step 4</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">NGO</h4>
                <div className="text-xs font-semibold text-rose-400 mb-2.5">
                  [deploys on ground]
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Local grassroot NGO works with Gram Panchayat to deploy hardware.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-end text-slate-400">
                <ArrowRight className="w-4 h-4 text-cyan-400 hidden lg:block" />
                <ArrowDown className="w-4 h-4 text-cyan-400 lg:hidden" />
              </div>
            </div>

            {/* Actor 5: CSR Company */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-500/50 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Step 5</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">CSR COMPANY</h4>
                <div className="text-xs font-semibold text-amber-400 mb-2.5">
                  [funds milestones]
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Authorizes milestone-based tranche disbursement against verified proof.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-end text-slate-400">
                <ArrowRight className="w-4 h-4 text-cyan-400 hidden lg:block" />
                <ArrowDown className="w-4 h-4 text-cyan-400 lg:hidden" />
              </div>
            </div>

            {/* Actor 6: Citizen Validation */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/50 transition">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">Step 6</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">CITIZEN</h4>
                <div className="text-xs font-semibold text-emerald-400 mb-2.5">
                  [validates outcome]
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Panchayat verifies clean water / deployed solution, closing the loop.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-end text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Loop Closed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4 — THREE KEY FEATURES                                            */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#0f172a] border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase mb-2 block">
              Core Technical Innovations
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              What makes this different
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Not another directory or compliance portal. An automated, cryptographic execution engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/40 hover:bg-slate-800/80 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-6">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Triple Helix Routing Engine
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  AI matches challenges to the right university automatically based on SDG expertise, geographic distance, and track record.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-cyan-300">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Mathematical Formula</span>
                SDG Overlap (40%) + Geographic Proximity (30%) + HEI Performance (30%)
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/40 hover:bg-slate-800/80 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  SHA-256 Tamper-Evident Ledger
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Every milestone is cryptographically sealed at submission. Any database modification breaks the hash chain and triggers an instant alert.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-indigo-300">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Immutability Guarantee</span>
                SHA256(milestoneId | proofUrl | gpsCoords | timestamp | parentHash)
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/40 hover:bg-slate-800/80 transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  NEP 2020 Academic Credentials
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Students earn verifiable digital certificates for real field work — documented, hashed, government-branded. Directly bankable in NAAC assessment.
                </p>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 font-mono text-xs text-amber-300">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">UGC Credit Framework</span>
                30 Field Hours = 1 Academic Credit • Faculty + NGO + GP Composite
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5 — LIVE CHALLENGES TEASER                                        */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#0a1122] border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase mb-2 block">
                Real-Time Grassroots Feed
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                12 active challenges across Jharkhand
              </h2>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Community-submitted societal issues undergoing automated Triple Helix routing.
              </p>
            </div>

            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 text-sm font-semibold transition no-underline self-start md:self-auto"
            >
              <span>View all challenges</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3 Challenge Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveChallenges.map((challenge, idx) => (
              <div
                key={idx}
                className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 hover:border-slate-600 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{challenge.district}, Jharkhand</span>
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${challenge.statusClass}`}>
                      {challenge.statusLabel}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 line-clamp-2">
                    {challenge.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {challenge.sdgs.map((sdg) => (
                      <span
                        key={sdg.id}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-md border ${sdg.color}`}
                      >
                        SDG {sdg.id}: {sdg.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{challenge.daysActive} days active</span>
                  </div>
                  <Link
                    href="/track"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 no-underline"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6 — DEMO ACCOUNTS (for jury)                                      */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#0f172a] border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase mb-2 block">
              Smart India Hackathon 2026 Jury Evaluation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Try it yourself — Demo Credentials
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Experience the platform from each of the six role perspectives. All accounts are pre-seeded with active workflows.
            </p>

            <div className="inline-block mt-4 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold">
              🔑 Note: All demo accounts log in with password: <code className="bg-slate-900 px-2 py-0.5 rounded text-white font-mono">Demo@1234</code>
            </div>
          </div>

          {/* Responsive Table of Demo Accounts */}
          <div className="bg-slate-800/60 border border-slate-700/90 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-700/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-4 sm:px-6">Role & Stakeholder</th>
                    <th className="py-4 px-4 sm:px-6">Email Address</th>
                    <th className="py-4 px-4 sm:px-6">Password</th>
                    <th className="py-4 px-4 sm:px-6 hidden lg:table-cell">Perspective / Workflow</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-sm">
                  {demoAccounts.map((acc, i) => (
                    <tr key={i} className="hover:bg-slate-700/30 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{acc.role}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{acc.name}</div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 font-mono text-xs text-slate-200">
                        <div className="flex items-center gap-2">
                          <span>{acc.email}</span>
                          <button
                            onClick={() => handleCopy(acc.email)}
                            title="Copy email"
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                          >
                            {copiedEmail === acc.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 font-mono text-xs text-slate-300">
                        Demo@1234
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-xs text-slate-400 hidden lg:table-cell max-w-xs">
                        {acc.description}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/login?email=${encodeURIComponent(acc.email)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition no-underline"
                        >
                          <span>Log In</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7 — FOOTER                                                        */}
      {/* ========================================================================= */}
      <footer className="bg-[#0a0f1d] border-t border-slate-800 py-10 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Left */}
          <div className="font-medium text-slate-300">
            SDG Nexus | SIH 2026 | PS SIH26043
          </div>

          {/* Centre */}
          <div className="text-slate-500 font-normal">
            Built in 72 hours by a student team
          </div>

          {/* Right */}
          <div className="font-medium text-slate-300">
            Government of Jharkhand | NEP 2020 Compliant | DPDP Act 2023 Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
