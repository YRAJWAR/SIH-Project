'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useNotifications, Notification } from '@/hooks/useNotifications';

function formatRelativeTime(dateString?: string): string {
    if (!dateString) return 'Recent';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
        return 'Recent';
    }
}

function resolveEntityLink(notification: Notification): string | undefined {
    if (notification.link) return notification.link;
    const type = (notification.entityType || '').toUpperCase();
    const challengeId = notification.challengeId || notification.entityId;

    if (type === 'CHALLENGE') {
        return challengeId ? `/track/${challengeId}` : undefined;
    }
    if (type === 'MILESTONE') {
        return '/dashboard/hei/milestones';
    }
    if (type === 'PROPOSAL') {
        return challengeId ? `/dashboard/hei/proposal/${challengeId}` : undefined;
    }
    if (type === 'CREDENTIAL') {
        return '/dashboard/hei/credentials';
    }
    if (type === 'RISK_FLAG') {
        return challengeId ? `/track/${challengeId}` : '/dashboard/government';
    }
    return challengeId ? `/track/${challengeId}` : undefined;
}

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const {
        unreadCount,
        notifications,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            fetchNotifications();
        }
    };

    const handleItemClick = (n: Notification) => {
        if (!n.read) {
            markAsRead(n.id);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Notifications"
                aria-label="Platform Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                Platform Alerts
                            </span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List (Last 10) */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((n) => {
                                const link = resolveEntityLink(n);
                                const isP1 = n.priority === 'P1';
                                const isP2 = n.priority === 'P2';

                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleItemClick(n)}
                                        className={`p-3.5 hover:bg-slate-800/60 transition cursor-pointer flex items-start gap-3 ${
                                            !n.read ? 'bg-slate-800/30' : ''
                                        } ${
                                            isP1
                                                ? 'border-l-4 border-l-rose-500'
                                                : isP2
                                                ? 'border-l-4 border-l-blue-500'
                                                : 'border-l-4 border-l-slate-600'
                                        }`}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            {isP1 ? (
                                                <ShieldAlert className="w-4 h-4 text-rose-400" />
                                            ) : isP2 ? (
                                                <AlertCircle className="w-4 h-4 text-blue-400" />
                                            ) : (
                                                <Info className="w-4 h-4 text-sky-400" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span
                                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                        isP1
                                                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                                            : isP2
                                                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                                            : 'bg-slate-700/50 text-slate-300 border border-slate-600/40'
                                                    }`}
                                                >
                                                    {n.priority}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    {formatRelativeTime(n.createdAt)}
                                                </span>
                                            </div>

                                            <p className="text-xs text-slate-200 leading-snug">
                                                {n.message}
                                            </p>

                                            {link && (
                                                <Link
                                                    href={link}
                                                    onClick={() => setIsOpen(false)}
                                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1 mt-1.5 font-medium"
                                                >
                                                    View details <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Bottom action: Mark all read */}
                    <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Mark all as read
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
