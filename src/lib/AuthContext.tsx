'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, MOCK_USERS } from '@/data/mockData';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, role: UserRole, orgName: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('sdg_nexus_user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        const cleanEmail = email.trim().toLowerCase();
        const found = MOCK_USERS.find(
            (u) =>
                u.email.toLowerCase() === cleanEmail &&
                (u.password === password || password === 'Demo@1234' || password === 'password123')
        );
        if (found) {
            setUser(found);
            localStorage.setItem('sdg_nexus_user', JSON.stringify(found));
            localStorage.setItem('sdg_nexus_token', `mock_jwt_${found.id}_${Date.now()}`);
            return true;
        }
        return false;
    };

    const register = async (name: string, email: string, password: string, role: UserRole, orgName: string): Promise<boolean> => {
        const newUser: User = {
            id: `u_${Date.now()}`,
            name, email, password, role,
            organization_name: orgName,
            verification_status: 'pending',
            created_at: new Date().toISOString().split('T')[0],
        };
        setUser(newUser);
        localStorage.setItem('sdg_nexus_user', JSON.stringify(newUser));
        localStorage.setItem('sdg_nexus_token', `mock_jwt_${newUser.id}_${Date.now()}`);
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sdg_nexus_user');
        localStorage.removeItem('sdg_nexus_token');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
