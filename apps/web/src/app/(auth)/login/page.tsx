"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Facebook, Chrome, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, Fingerprint, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

// Refined Magnetic Button
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

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (!result?.ok || result.error) {
                setError('Kimlik doğrulama başarısız. Lütfen bilgilerinizi kontrol edin.');
                setIsLoading(false);
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            setError('Güvenli bağlantı sırasında bir protokol hatası oluştu.');
            setIsLoading(false);
        }
    };

    const inputBaseClass = (field: string) => {
        const isFocused = focusedField === field;
        return `block w-full pl-10 sm:pl-12 pr-${field === 'password' ? '10 sm:pr-12' : '3 sm:pr-4'} py-3 sm:py-4 bg-slate-50/50 dark:bg-white/[0.05] border ${isFocused
                ? 'border-blue-500/50 dark:border-blue-500/40 ring-4 ring-blue-500/5 bg-white dark:bg-white/[0.05]'
                : 'border-slate-200 dark:border-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.1] shadow-sm'
            } rounded-xl sm:rounded-2xl text-[13px] sm:text-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400/60 placeholder:font-medium transition-all duration-300 outline-none`;
    };

    return (
        <div className="w-full max-w-md sm:max-w-lg mx-auto px-4 sm:px-6">
            {/* Header Section */}
            <div className="mb-8 sm:mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/10 w-fit mb-6"
                >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Operator Authorization</span>
                </motion.div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">Oturum Aç</h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400/70 border-l-2 border-slate-100 dark:border-white/5 pl-3 sm:pl-4">Kurumsal ERP sistemine güvenli erişim sağlayın.</p>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-8 bg-red-500/5 border border-red-500/15 rounded-2xl p-4 flex items-center gap-4"
                    >
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                        </div>
                        <div className="text-[11px] font-bold text-red-600 dark:text-red-400 tracking-wide uppercase italic">
                            [System-Error] {error}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
                <div className="space-y-5">
                    {/* Email Input */}
                    <div className="space-y-2 group/field">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Kullanıcı Kimliği (E-Posta)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10 transition-colors group-focus-within/field:text-blue-500">
                                <Mail className="w-4.5 h-4.5" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                className={inputBaseClass('email')}
                                placeholder="name@corporation.com"
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2 group/field">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Erişim Anahtarı</label>
                            <Link href="/forgot-password" ml-1 className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-700 transition-colors">Anahtar Yenile</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10 transition-colors group-focus-within/field:text-blue-500">
                                <Lock className="w-4.5 h-4.5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                className={inputBaseClass('password')}
                                placeholder="••••••••••••"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-400 hover:text-blue-500 transition-colors z-10"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center px-1">
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className="relative w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-white/10 group-hover:border-blue-400 transition-all flex items-center justify-center overflow-hidden">
                            <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer z-10" />
                            <div className="w-full h-full bg-blue-600 scale-0 peer-checked:scale-100 transition-transform duration-200 flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-slate-700 dark:group-hover:text-white transition-colors">Sessiz Oturum (Beni Hatırla)</span>
                    </label>
                </div>

                {/* Login Button */}
                <MagneticButton
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.35)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] disabled:opacity-50 transition-all relative overflow-hidden flex items-center justify-center gap-3 mt-4"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                    {isLoading ? (
                        <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                        <>
                            <Fingerprint className="w-5 h-5" />
                            Sisteme Bağlan
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </MagneticButton>
            </form>

            <div className="my-10 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100 dark:border-white/5" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-[#0b1220] px-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Integrated Auth</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => signIn('google')}
                    className="flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-500 dark:hover:text-white transition-all group"
                >
                    <Chrome className="w-4 h-4 group-hover:scale-110 transition-transform" /> Google
                </button>
                <button
                    type="button"
                    onClick={() => signIn('facebook')}
                    className="flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-all group"
                >
                    <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" /> Facebook
                </button>
            </div>

            <div className="mt-12 text-center pt-8 border-t border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Müşterimiz değil misiniz?</span>
                <Link href="/register" className="ml-2 text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-all uppercase tracking-[0.15em] border-b border-blue-600/20 pb-0.5">Yenı Kayıt Oluştur</Link>
            </div>
        </div>
    );
}
