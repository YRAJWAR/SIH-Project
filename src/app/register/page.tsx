'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { UserRole } from '@/data/mockData';

// ── Role metadata ──────────────────────────────────────────────
const roles = [
    {
        value: 'ngo' as UserRole,
        label: 'NGO',
        icon: '🏢',
        desc: 'Create projects & track impact',
        color: '#10b981',
        glow: 'rgba(16,185,129,0.15)',
        border: 'rgba(16,185,129,0.4)',
    },
    {
        value: 'government' as UserRole,
        label: 'Government',
        icon: '🏛️',
        desc: 'Monitor SDG progress',
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.15)',
        border: 'rgba(59,130,246,0.4)',
    },
    {
        value: 'corporate' as UserRole,
        label: 'Corporate',
        icon: '💼',
        desc: 'CSR compliance & matching',
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.15)',
        border: 'rgba(245,158,11,0.4)',
    },
    {
        value: 'donor' as UserRole,
        label: 'Donor',
        icon: '💝',
        desc: 'Fund projects & track giving',
        color: '#ec4899',
        glow: 'rgba(236,72,153,0.15)',
        border: 'rgba(236,72,153,0.4)',
    },
];

// ── SDG list for multi-select ──────────────────────────────────
const SDG_OPTIONS = [
    { id: 1, label: 'No Poverty' }, { id: 2, label: 'Zero Hunger' },
    { id: 3, label: 'Good Health' }, { id: 4, label: 'Quality Education' },
    { id: 5, label: 'Gender Equality' }, { id: 6, label: 'Clean Water' },
    { id: 7, label: 'Affordable Energy' }, { id: 8, label: 'Decent Work' },
    { id: 9, label: 'Industry & Innovation' }, { id: 10, label: 'Reduced Inequalities' },
    { id: 11, label: 'Sustainable Cities' }, { id: 12, label: 'Responsible Consumption' },
    { id: 13, label: 'Climate Action' }, { id: 14, label: 'Life Below Water' },
    { id: 15, label: 'Life on Land' }, { id: 16, label: 'Peace & Justice' },
    { id: 17, label: 'Partnerships' },
];

// ── Form state type ────────────────────────────────────────────
interface FormState {
    // common
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    // NGO
    ngoName: string;
    ngoRegNumber: string;
    ngoFocusSDGs: number[];
    ngoState: string;
    ngoWebsite: string;
    ngoContactName: string;
    // Government
    govDepartment: string;
    govDesignation: string;
    govLevel: string;
    govState: string;
    govOfficialEmail: string;
    govContactName: string;
    // Corporate
    corpCompanyName: string;
    corpIndustry: string;
    corpCINNumber: string;
    corpCSRBudget: string;
    corpContactName: string;
    corpHeadquarters: string;
    // Donor
    donorFullName: string;
    donorType: string;
    donorFocusSDGs: number[];
    donorCountry: string;
    donorPhone: string;
}

const initialForm: FormState = {
    email: '', password: '', confirmPassword: '', role: 'ngo',
    ngoName: '', ngoRegNumber: '', ngoFocusSDGs: [], ngoState: '', ngoWebsite: '', ngoContactName: '',
    govDepartment: '', govDesignation: '', govLevel: 'Central', govState: '', govOfficialEmail: '', govContactName: '',
    corpCompanyName: '', corpIndustry: '', corpCINNumber: '', corpCSRBudget: '', corpContactName: '', corpHeadquarters: '',
    donorFullName: '', donorType: 'Individual', donorFocusSDGs: [], donorCountry: 'India', donorPhone: '',
};

// ── Reusable field components ──────────────────────────────────
function InputField({ label, type = 'text', value, onChange, placeholder, required = true }: {
    label: string; type?: string; value: string;
    onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="input-dark-theme"
                placeholder={placeholder}
                required={required}
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: {
    label: string; value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="input-dark-theme"
                style={{ cursor: 'pointer' }}
            >
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

function SDGMultiSelect({ label, selected, onChange, accentColor }: {
    label: string; selected: number[];
    onChange: (ids: number[]) => void; accentColor: string;
}) {
    const toggle = (id: number) => {
        onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
    };
    return (
        <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {SDG_OPTIONS.map(sdg => (
                    <button
                        key={sdg.id}
                        type="button"
                        onClick={() => toggle(sdg.id)}
                        className="px-2 py-1 rounded-md text-[10px] font-medium transition-all"
                        style={{
                            background: selected.includes(sdg.id) ? `${accentColor}25` : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${selected.includes(sdg.id) ? accentColor : 'rgba(255,255,255,0.1)'}`,
                            color: selected.includes(sdg.id) ? accentColor : '#94a3b8',
                        }}
                    >
                        SDG {sdg.id}: {sdg.label}
                    </button>
                ))}
            </div>
            {selected.length > 0 && (
                <p className="text-[10px] mt-1" style={{ color: accentColor }}>
                    {selected.length} SDG{selected.length > 1 ? 's' : ''} selected
                </p>
            )}
        </div>
    );
}

// ── Role-specific field sections ───────────────────────────────
function NGOFields({ form, update }: { form: FormState; update: (k: keyof FormState, v: unknown) => void }) {
    const color = '#10b981';
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Contact Person Name *" value={form.ngoContactName} onChange={v => update('ngoContactName', v)} placeholder="Full name" />
                <InputField label="NGO / Organization Name *" value={form.ngoName} onChange={v => update('ngoName', v)} placeholder="e.g. GreenFuture Foundation" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <InputField label="NGO Registration Number *" value={form.ngoRegNumber} onChange={v => update('ngoRegNumber', v)} placeholder="e.g. MH/2021/0012345" />
                <InputField label="State of Operation *" value={form.ngoState} onChange={v => update('ngoState', v)} placeholder="e.g. Maharashtra" />
            </div>
            <InputField label="Website URL" value={form.ngoWebsite} onChange={v => update('ngoWebsite', v)} placeholder="https://yourwebsite.org" required={false} />
            <SDGMultiSelect
                label="Primary SDG Focus Areas *"
                selected={form.ngoFocusSDGs}
                onChange={v => update('ngoFocusSDGs', v)}
                accentColor={color}
            />
        </div>
    );
}

function GovernmentFields({ form, update }: { form: FormState; update: (k: keyof FormState, v: unknown) => void }) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Contact Person Name *" value={form.govContactName} onChange={v => update('govContactName', v)} placeholder="Full name" />
                <InputField label="Department / Ministry *" value={form.govDepartment} onChange={v => update('govDepartment', v)} placeholder="e.g. NITI Aayog" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Official Designation *" value={form.govDesignation} onChange={v => update('govDesignation', v)} placeholder="e.g. SDG Coordinator" />
                <SelectField
                    label="Government Level *"
                    value={form.govLevel}
                    onChange={v => update('govLevel', v)}
                    options={[
                        { value: 'Central', label: 'Central Government' },
                        { value: 'State', label: 'State Government' },
                        { value: 'Local', label: 'Local Body / Municipality' },
                        { value: 'District', label: 'District Administration' },
                    ]}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <InputField label="State / Union Territory *" value={form.govState} onChange={v => update('govState', v)} placeholder="e.g. Delhi" />
                <InputField label="Official Government Email *" type="email" value={form.govOfficialEmail} onChange={v => update('govOfficialEmail', v)} placeholder="name@gov.in" />
            </div>
        </div>
    );
}

function CorporateFields({ form, update }: { form: FormState; update: (k: keyof FormState, v: unknown) => void }) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <InputField label="CSR Contact Person *" value={form.corpContactName} onChange={v => update('corpContactName', v)} placeholder="Full name" />
                <InputField label="Company Name *" value={form.corpCompanyName} onChange={v => update('corpCompanyName', v)} placeholder="e.g. TechServe India Pvt Ltd" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <SelectField
                    label="Industry Sector *"
                    value={form.corpIndustry}
                    onChange={v => update('corpIndustry', v)}
                    options={[
                        { value: '', label: 'Select Sector' },
                        { value: 'Technology', label: 'Technology & IT' },
                        { value: 'Manufacturing', label: 'Manufacturing' },
                        { value: 'Finance', label: 'Finance & Banking' },
                        { value: 'Energy', label: 'Energy & Utilities' },
                        { value: 'Healthcare', label: 'Healthcare & Pharma' },
                        { value: 'FMCG', label: 'FMCG & Consumer Goods' },
                        { value: 'Telecom', label: 'Telecom & Media' },
                        { value: 'Infrastructure', label: 'Infrastructure & Real Estate' },
                        { value: 'Agriculture', label: 'Agriculture & Food' },
                        { value: 'Other', label: 'Other' },
                    ]}
                />
                <InputField label="CIN / Company Reg Number *" value={form.corpCINNumber} onChange={v => update('corpCINNumber', v)} placeholder="e.g. U72900MH2020PTC123456" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Annual CSR Budget (₹) *" value={form.corpCSRBudget} onChange={v => update('corpCSRBudget', v)} placeholder="e.g. 50,00,000" />
                <InputField label="Headquarters Location *" value={form.corpHeadquarters} onChange={v => update('corpHeadquarters', v)} placeholder="e.g. Mumbai, Maharashtra" />
            </div>
        </div>
    );
}

function DonorFields({ form, update }: { form: FormState; update: (k: keyof FormState, v: unknown) => void }) {
    const color = '#ec4899';
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Full Name *" value={form.donorFullName} onChange={v => update('donorFullName', v)} placeholder="Your full name" />
                <SelectField
                    label="Donor Type *"
                    value={form.donorType}
                    onChange={v => update('donorType', v)}
                    options={[
                        { value: 'Individual', label: 'Individual' },
                        { value: 'HNI', label: 'High Net Worth Individual (HNI)' },
                        { value: 'Foundation', label: 'Private Foundation' },
                        { value: 'Family Office', label: 'Family Office' },
                        { value: 'Impact Fund', label: 'Impact Fund' },
                        { value: 'Corporate Foundation', label: 'Corporate Foundation' },
                    ]}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <InputField label="Country *" value={form.donorCountry} onChange={v => update('donorCountry', v)} placeholder="e.g. India" />
                <InputField label="Phone Number" type="tel" value={form.donorPhone} onChange={v => update('donorPhone', v)} placeholder="+91 98765 43210" required={false} />
            </div>
            <SDGMultiSelect
                label="SDG Areas You Want to Fund *"
                selected={form.donorFocusSDGs}
                onChange={v => update('donorFocusSDGs', v)}
                accentColor={color}
            />
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────
export default function RegisterPage() {
    const [form, setForm] = useState<FormState>(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<1 | 2>(1); // 1 = role select, 2 = fill details
    const { register } = useAuth();
    const router = useRouter();

    const update = (field: keyof FormState, value: unknown) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const activeRole = roles.find(r => r.value === form.role)!;

    const getOrgName = () => {
        if (form.role === 'ngo') return form.ngoName;
        if (form.role === 'government') return form.govDepartment;
        if (form.role === 'corporate') return form.corpCompanyName;
        return form.donorType;
    };

    const getDisplayName = () => {
        if (form.role === 'ngo') return form.ngoContactName;
        if (form.role === 'government') return form.govContactName;
        if (form.role === 'corporate') return form.corpContactName;
        return form.donorFullName;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        await register(getDisplayName(), form.email, form.password, form.role, getOrgName());
        router.push('/dashboard');
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ background: '#0a0f1e' }}
        >
            {/* Background glows */}
            <div
                className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle, ${activeRole.color}, transparent)` }}
            />
            <div
                className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full opacity-8 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="glass-card-dark p-8 w-full relative z-10"
                style={{ maxWidth: '640px' }}
            >
                {/* Header */}
                <div className="text-center mb-7">
                    <Image
                        src="/logo.png" alt="SDG Nexus"
                        width={52} height={52}
                        className="rounded-2xl mx-auto mb-3"
                        style={{ objectFit: 'contain' }}
                    />
                    <h1 className="text-2xl font-bold text-white">Join SDG Nexus</h1>
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                        Create your account to start driving impact
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── Step 1: Role Selector ────────────────── */}
                    <div>
                        <label className="block text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>
                            Select Your Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {roles.map(r => (
                                <button
                                    type="button"
                                    key={r.value}
                                    onClick={() => { update('role', r.value); setError(''); }}
                                    className="p-3 rounded-xl text-left transition-all"
                                    style={{
                                        background: form.role === r.value ? r.glow : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${form.role === r.value ? r.border : 'rgba(255,255,255,0.08)'}`,
                                        boxShadow: form.role === r.value ? `0 0 12px ${r.glow}` : 'none',
                                    }}
                                >
                                    <span className="text-xl">{r.icon}</span>
                                    <p
                                        className="text-sm font-semibold mt-1"
                                        style={{ color: form.role === r.value ? r.color : '#e2e8f0' }}
                                    >
                                        {r.label}
                                    </p>
                                    <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>{r.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Divider with role label ───────────────── */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <span
                            className="text-xs font-semibold px-3 py-1 rounded-full"
                            style={{
                                background: `${activeRole.color}18`,
                                color: activeRole.color,
                                border: `1px solid ${activeRole.border}`,
                            }}
                        >
                            {activeRole.icon} {activeRole.label} Details
                        </span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    {/* ── Role-specific fields (animated switch) ── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={form.role}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.22 }}
                        >
                            {form.role === 'ngo' && <NGOFields form={form} update={update} />}
                            {form.role === 'government' && <GovernmentFields form={form} update={update} />}
                            {form.role === 'corporate' && <CorporateFields form={form} update={update} />}
                            {form.role === 'donor' && <DonorFields form={form} update={update} />}
                        </motion.div>
                    </AnimatePresence>

                    {/* ── Divider ───────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <span className="text-xs" style={{ color: '#475569' }}>Account Credentials</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    </div>

                    {/* ── Email + Password ─────────────────────── */}
                    <div className="space-y-3">
                        <InputField
                            label="Email Address *"
                            type="email"
                            value={form.email}
                            onChange={v => update('email', v)}
                            placeholder="your@email.com"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Password *"
                                type="password"
                                value={form.password}
                                onChange={v => update('password', v)}
                                placeholder="Min. 8 characters"
                            />
                            <InputField
                                label="Confirm Password *"
                                type="password"
                                value={form.confirmPassword}
                                onChange={v => update('confirmPassword', v)}
                                placeholder="Repeat password"
                            />
                        </div>
                    </div>

                    {/* ── Error ────────────────────────────────── */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-center py-2 px-3 rounded-lg"
                            style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* ── Submit ───────────────────────────────── */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                        style={{
                            background: `linear-gradient(135deg, ${activeRole.color}, ${activeRole.color}cc)`,
                            color: '#fff',
                            boxShadow: `0 4px 20px ${activeRole.glow}`,
                        }}
                    >
                        {loading
                            ? 'Creating account…'
                            : `Create ${activeRole.label} Account →`}
                    </button>
                </form>

                <p className="text-center text-xs mt-5" style={{ color: '#64748b' }}>
                    Already have an account?{' '}
                    <Link href="/login" className="hover:underline" style={{ color: '#06b6d4' }}>
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
