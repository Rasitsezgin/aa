"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import {
    User, Mail, Lock, CheckCircle2,
    AlertCircle, RefreshCw, Eye, EyeOff, Building2,
    Sparkles, ShieldCheck, Zap, ArrowRight, Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

// Refined Magnetic Button (Same as login)
const MagneticButton = ({ children, className, onClick, disabled, type = "button" as const }: any) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((e.clientX - centerX) * 0.35);
        y.set((e.clientY - centerY) * 0.35);
    };

    const handleMouseLeave = () => {
        x.set(0); y.set(0);
    };

    return (
        <motion.button
            type={type}
            disabled={disabled}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className={className}
        >
            {children}
        </motion.button>
    );
};

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        email: '',
        password: '',
        acceptTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.acceptTerms) {
            setError('Lütfen kullanım koşullarını kabul edin.');
            return;
        }

        if (!formData.fullName.trim()) {
            setError('Kullanıcı adı zorunludur.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Geçerli bir e-posta adresi giriniz.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Şifre en az 8 karakter olmalıdır.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const nameParts = formData.fullName.trim().split(/\s+/);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const registerRes = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName,
                    lastName,
                    company: formData.companyName,
                }),
            });

            const data = await registerRes.json().catch(() => ({}));

            if (!registerRes.ok) {
                throw new Error(data.error || 'Kayıt işlemi başarısız oldu.');
            }

            const loginResult = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
                callbackUrl: '/dashboard',
            });

            if (loginResult?.ok) {
                router.push('/dashboard');
                router.refresh();
                return;
            }

            setSuccess(true);
            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kayıt protokolü başlatılamadı.');
            setIsLoading(false);
        }
    };

    const inputBaseClass = (field: string) => {
        const isFocused = focusedField === field;
        return `block w-full pl-12 sm:pl-14 pr-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] border ${isFocused
                ? 'border-blue-500/50 dark:border-blue-400 ring-4 ring-blue-500/5 bg-white dark:bg-white/[0.05]'
                : 'border-slate-200 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.1]'
            } rounded-2xl text-[13px] sm:text-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400/60 transition-all duration-300 outline-none`;
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
            >
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-10 relative">
                    <motion.div
                        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-emerald-500/20"
                    />
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">İşlem Onaylandı</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-xs mx-auto text-sm leading-relaxed px-4">
                    Kurumsal hesabınız başarıyla yapılandırıldı. Sisteme yönlendiriliyorsunuz.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-3 px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                    SİSTEME GİRİŞ YAP <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-10">
                <motion.div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/10 w-fit mb-6"
                >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Enterprise Provisioning</span>
                </motion.div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Hesap Oluştur</h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400/70 border-l-2 border-slate-100 dark:border-white/5 pl-4">Premium ticaret altyapısı için kaydınızı başlatın.</p>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-red-500/5 border border-red-500/15 rounded-2xl p-4 flex items-center gap-4"
                    >
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase italic tracking-wide">
                            [System-Error] {error}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Kullanıcı Adı</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 z-10" />
                            <input
                                type="text"
                                required
                                className={inputBaseClass('fullName')}
                                placeholder="Erdem Eroğlu"
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                onFocus={() => setFocusedField('fullName')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Marka/Kurum</label>
                        <div className="relative">
                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 z-10" />
                            <input
                                type="text"
                                required
                                className={inputBaseClass('companyName')}
                                placeholder="Eroğlu Global A.Ş"
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                onFocus={() => setFocusedField('companyName')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Operasyonel E-Posta</label>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 z-10" />
                        <input
                            type="email"
                            required
                            className={inputBaseClass('email')}
                            placeholder="admin@pazaryonetimi.com"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Güvenlik Anahtarı</label>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 z-10" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className={inputBaseClass('password')}
                            placeholder="••••••••••••"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors z-10"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-start px-1 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group select-none mt-1">
                        <div className="relative w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-white/10 group-hover:border-blue-400 transition-all flex items-center justify-center overflow-hidden">
                            <input
                                type="checkbox"
                                className="peer absolute opacity-0 w-full h-full cursor-pointer z-10"
                                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                            />
                            <div className="w-full h-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform duration-200 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                    </label>
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed">
                        <Link href="/terms" className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-tighter">Kullanım Koşullarını</Link> ve <Link href="/privacy" className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-tighter">Gizlilik Politikalarını</Link> onaylıyorum.
                    </p>
                </div>

                <MagneticButton
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.35)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] disabled:opacity-50 transition-all relative overflow-hidden flex items-center justify-center gap-3 mt-4"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                    {isLoading ? (
                        <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Hesabı Yapılandır
                        </>
                    )}
                </MagneticButton>
            </form>

            <div className="mt-12 text-center pt-8 border-t border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Zaten yetkiniz var mı?</span>
                <Link href="/login" className="ml-2 text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-all uppercase tracking-[0.15em] border-b border-blue-600/20 pb-0.5">Sisteme Giriş Yap</Link>
            </div>
        </div>
    );
}
