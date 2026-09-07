'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Inbox } from 'lucide-react';

export default function TeamFormationIndexPage() {
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Select a Challenge to Form a Team</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
                Team formation is initiated directly from assigned societal challenges in your Challenge Inbox. Review active challenges and click &ldquo;Accept Challenge&rdquo; to build an R&D student cell.
            </p>
            <Link
                href="/dashboard/hei"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
                <Inbox className="w-4 h-4" />
                <span>Go to Challenge Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}
