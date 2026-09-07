'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Notification {
    id: string;
    userId?: string;
    message: string;
    priority: 'P1' | 'P2' | 'P3' | string;
    read: boolean;
    entityType?: string;
    entityId?: string;
    challengeId?: string | null;
    createdAt: string;
    link?: string;
}

export function useNotifications() {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const isFetchingRef = useRef(false);

    const getAuthHeaders = useCallback((): Record<string, string> => {
        const headers: Record<string, string> = {};
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('sdg_nexus_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const storedUser = localStorage.getItem('sdg_nexus_user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed.id) headers['x-user-id'] = parsed.id;
                    if (parsed.role) headers['x-user-role'] = parsed.role;
                    if (parsed.email) headers['x-user-email'] = parsed.email;
                } catch {
                    // Ignore parse error
                }
            }
        }
        return headers;
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            const res = await fetch('/api/notifications/unread-count', {
                headers,
                cache: 'no-store',
            });
            if (res.ok) {
                const json = await res.json();
                const count = json.data?.count !== undefined ? json.data.count : (json.count ?? 0);
                setUnreadCount(count);
            }
        } catch (err) {
            console.warn('Failed to fetch unread notification count:', err);
        }
    }, [getAuthHeaders]);

    const fetchNotifications = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setLoading(true);
        try {
            const headers = getAuthHeaders();
            const res = await fetch('/api/notifications', {
                headers,
                cache: 'no-store',
            });
            if (res.ok) {
                const json = await res.json();
                const list: Notification[] = json.data || [];
                setNotifications(list);
                const unread = list.filter((n) => !n.read).length;
                setUnreadCount(unread);
            }
        } catch (err) {
            console.warn('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [getAuthHeaders]);

    const markAsRead = useCallback(async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            const headers = {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            };
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers,
                body: JSON.stringify({ notificationIds: [id] }),
            });
        } catch (err) {
            console.warn('Failed to mark notification read:', err);
        }
    }, [getAuthHeaders]);

    const markAllAsRead = useCallback(async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);

        try {
            const headers = {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            };
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers,
                body: JSON.stringify({ all: true }),
            });
        } catch (err) {
            console.warn('Failed to mark all notifications read:', err);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        // Initial fetch
        fetchUnreadCount();
        fetchNotifications();

        // 30-second polling interval
        const intervalId = setInterval(() => {
            fetchUnreadCount();
            fetchNotifications();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [fetchUnreadCount, fetchNotifications]);

    return {
        unreadCount,
        notifications,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
    };
}
