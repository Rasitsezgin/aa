"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Camera,
    Shield,
    Check,
    AlertCircle,
    Loader2,
    Globe,
    Building2,
    MapPin,
    Phone
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { tenantHeaders } from '@/lib/tenant';
import { PasswordChangeForm } from '@/components/settings/PasswordChangeForm';
import { useToast } from '@/providers/toast-provider';

const PLAN_LABELS: Record<string, string> = {
    FREE: 'Ücretsiz',
    PRO: 'Pro',
    ENTERPRISE: 'Kurumsal',
};

function formatDate(iso?: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function ProfileSettingsPage() {
    const { data: session, update } = useSession();
    const toast = useToast();
    const [form, setForm] = useState({
        name: session?.user?.name || '',
        phone: '',
        company: '',
        taxId: '',
        taxOffice: '',
        address: '',
        language: 'tr',
    });
    const [meta, setMeta] = useState({
        plan: 'FREE',
        createdAt: null as string | null,
        hasPassword: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/settings/profile', { cache: 'no-store' })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) return;
                setForm({
                    name: data.name || session?.user?.name || '',
                    phone: data.phone || '',
                    company: data.company || '',
                    taxId: data.taxId || '',
                    taxOffice: data.taxOffice || '',
                    address: data.address || '',
                    language: data.language || 'tr',
                });
                setMeta({
                    plan: data.plan || 'FREE',
                    createdAt: data.createdAt || data.tenantCreatedAt || null,
                    hasPassword: data.hasPassword !== false,
                });
            })
            .catch(() => {});
    }, [session?.user?.name]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');

        try {
            const res = await fetch('/api/settings/profile', {
                method: 'POST',
                headers: tenantHeaders(session),
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                throw new Error('Profil ayarlari kaydedilemedi');
            }

            const saved = await res.json();
            await update({ name: saved.name || form.name });
            toast.success('Profil güncellendi', 'Bilgileriniz kaydedildi');
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch {
            setStatus('error');
            toast.error('Hata', 'Profil kaydedilemedi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">Profil Ayarları</h1>
                <p className="text-slate-500 font-medium">Kişisel bilgilerinizi ve profil görünümünüzü yönetin.</p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Left Column: Avatar & Basic Info */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="p-8 bg-surface border border-border rounded-[32px] text-center relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-purple-600 p-1 shadow-2xl shadow-primary/20 ring-4 ring-background">
                                <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center text-4xl font-black text-primary overflow-hidden">
                                    {session?.user?.image ? (
                                        <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        session?.user?.name?.[0]?.toUpperCase() || 'A'
                                    )}
                                </div>
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-background">
                                <Camera size={18} />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-1">{session?.user?.name || 'Kullanıcı'}</h3>
                        <p className="text-sm text-slate-500 mb-6">{session?.user?.email}</p>

                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-xl text-primary text-xs font-black uppercase tracking-wider">
                            <Shield size={14} />
                            {PLAN_LABELS[meta.plan] || meta.plan} HESAP
                        </div>
                    </div>
                    <div className="p-6 bg-surface border border-border rounded-[24px]">
                        <h4 className="text-sm font-bold text-foreground mb-4">Hesap Durumu</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Üyelik Tipi</span>
                                <span className="text-xs font-bold text-foreground">Bireysel</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Kayıt Tarihi</span>
                                <span className="text-xs font-bold text-foreground">{formatDate(meta.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Paket</span>
                                <span className="text-xs font-bold text-foreground">{PLAN_LABELS[meta.plan] || meta.plan}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Edit Form */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="p-8 bg-surface border border-border rounded-[32px] space-y-8">
                        {/* Section: Kişisel Bilgiler */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <User size={18} />
                                </div>
                                <h4 className="text-lg font-bold text-foreground">Kişisel Bilgiler</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Ad Soyad</label>
                                    <div className={`relative transition-all duration-300 ${focusedInput === 'name' ? 'ring-2 ring-primary/20' : ''}`}>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                            onFocus={() => setFocusedInput('name')}
                                            onBlur={() => setFocusedInput(null)}
                                            className="w-full px-5 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all font-medium text-sm"
                                            placeholder="Adınız ve Soyadınız"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">E-posta</label>
                                    <div className="relative opacity-60">
                                        <input
                                            type="email"
                                            defaultValue={session?.user?.email || ''}
                                            disabled
                                            className="w-full px-5 py-4 bg-background border border-border rounded-2xl outline-none font-medium text-sm cursor-not-allowed"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Shield size={16} className="text-slate-400" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 ml-1">E-posta adresi güvenliğiniz için değiştirilemez.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Telefon</label>
                                    <div className={`relative transition-all duration-300 ${focusedInput === 'phone' ? 'ring-2 ring-primary/20' : ''}`}>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                            onFocus={() => setFocusedInput('phone')}
                                            onBlur={() => setFocusedInput(null)}
                                            className="w-full px-5 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all font-medium text-sm"
                                            placeholder="+90 5xx xxx xx xx"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Dil</label>
                                    <select
                                        value={form.language}
                                        onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all font-medium text-sm appearance-none"
                                    >
                                        <option value="tr">Türkçe (TR)</option>
                                        <option value="en">English (US)</option>
                                        <option value="de">Deutsch (DE)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="border-border" />

                        {/* Section: Şirket Bilgileri */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <Building2 size={18} />
                                </div>
                                <h4 className="text-lg font-bold text-foreground">Şirket Detayları</h4>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Şirket Adı</label>
                                <input
                                    type="text"
                                    value={form.company}
                                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all font-medium text-sm"
                                    placeholder="Şirketinizin Resmi Adı"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Adres</label>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all font-medium text-sm"
                                    placeholder="Şirket adresi"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Vergi Numarası</label>
                                    <input
                                        type="text"
                                        value={form.taxId}
                                        onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all font-medium text-sm"
                                        placeholder="Vergi No / TCKN"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Vergi Dairesi</label>
                                    <input
                                        type="text"
                                        value={form.taxOffice}
                                        onChange={(e) => setForm((f) => ({ ...f, taxOffice: e.target.value }))}
                                        className="w-full px-5 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary transition-all font-medium text-sm"
                                        placeholder="Vergi Dairesi"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <button
                                type="button"
                                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-foreground hover:bg-white/5 transition-all"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative px-10 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Güncelleniyor...
                                        </>
                                    ) : status === 'success' ? (
                                        <>
                                            <Check size={18} />
                                            Kaydedildi!
                                        </>
                                    ) : (
                                        'Değişiklikleri Kaydet'
                                    )}
                                </div>
                                {status === 'success' && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute inset-0 bg-green-500 flex items-center justify-center"
                                    >
                                        <Check size={24} />
                                    </motion.div>
                                )}
                            </button>
                        </div>
                    </form>

                    {meta.hasPassword && (
                        <div className="p-8 bg-surface border border-border rounded-[32px]">
                            <PasswordChangeForm />
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div >
    );
}
