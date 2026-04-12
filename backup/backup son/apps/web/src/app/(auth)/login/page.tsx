"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Mail, ArrowRight, Chrome, Eye, EyeOff, Sparkles, Lock, Loader2, AlertCircle, ShieldCheck, Clock3, Zap } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { useSearchParams } from 'next/navigation';

function LoginForm() {
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const errorParam = searchParams?.get('error');
        const callbackUrl = searchParams?.get('callbackUrl');
        
        if (errorParam) {
            const errorMessages: Record<string, string> = {
                Configuration: 'Sunucu yapılandırma hatası. Lütfen daha sonra tekrar deneyin.',
                CredentialsSignin: 'Geçersiz e-posta veya şifre.',
                OAuthSignin: 'OAuth giriş hatası. Lütfen tekrar deneyin.',
                OAuthCallback: 'OAuth geri dönüş hatası.',
                Default: 'Giriş sırasında bir hata oluştu.',
                true: 'Geçersiz e-posta veya şifre.',
            };
            setTimeout(() => setError(errorMessages[errorParam] || errorMessages.Default), 0);
        }
        
        // Store callback URL in session storage for redirect after login
        if (callbackUrl) {
            sessionStorage.setItem('callbackUrl', callbackUrl);
        }
    }, [searchParams]);

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
        >
            <div className="mb-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
                    <Sparkles size={12} className="text-blue-500" />
                    Guvenli Giris
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Tekrar Hos Geldiniz
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm leading-relaxed">
                    Hesabınıza giriş yaparak panelinize erişin.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                        <ShieldCheck size={13} /> 2FA Destegi
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                        <Clock3 size={13} /> 30 sn altinda giris
                    </span>
                </div>
            </div>

            {/* OAuth Buttons */}
            <motion.div variants={itemVariants} className="space-y-3">
                <button
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    className="w-full group flex items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                    type="button"
                >
                    <Chrome size={18} className="group-hover:rotate-12 transition-transform" />
                    <span>Google ile Devam Et</span>
                </button>
                <button
                    onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
                    className="w-full group flex items-center justify-center gap-3 px-4 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                    type="button"
                >
                    <Github size={18} className="group-hover:rotate-12 transition-transform" />
                    <span>Facebook ile Devam Et</span>
                </button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/95 dark:bg-[#0b1220] px-4 text-slate-400 font-bold tracking-widest">
                        veya e-posta ile
                    </span>
                </div>
            </motion.div>

            <motion.form
                variants={itemVariants}
                className="space-y-6"
                onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    setError(null);
                    setIsLoading(true);

                    const formData = new FormData(e.currentTarget);
                    const email = formData.get('email') as string;
                    const password = formData.get('password') as string;

                    if (!email || !password) {
                        setError('E-posta ve şifre gereklidir.');
                        setIsLoading(false);
                        return;
                    }

                    const result = await signIn('credentials', {
                        email,
                        password,
                        redirect: false,
                        callbackUrl: '/dashboard',
                    });

                    if (!result?.ok || result?.error) {
                        setError('Geçersiz e-posta veya şifre.');
                        setIsLoading(false);
                    } else {
                        // Success - let page reload naturally via signIn or use window.location
                        window.location.href = '/dashboard';
                    }
                }}
            >
                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                    </motion.div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                            E-posta Adresi
                        </label>
                    </div>
                    <div
                        className={`relative group bg-white dark:bg-white/5 border rounded-2xl transition-all duration-300 ${focusedInput === 'email'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                    >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                            <Mail
                                size={18}
                                className={`transition-colors duration-300 ${focusedInput === 'email' ? 'text-blue-500' : 'text-slate-400'
                                    }`}
                            />
                        </div>
                        <input
                            name="email"
                            type="email"
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="ornek@sirket.com"
                            className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Şifre
                        </label>
                        <Link href="/forgot-password" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                            Unuttum?
                        </Link>
                    </div>
                    <div
                        className={`relative group bg-white dark:bg-white/5 border rounded-2xl transition-all duration-300 ${focusedInput === 'password'
                            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                    >
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                            <Lock
                                size={18}
                                className={`transition-colors duration-300 ${focusedInput === 'password' ? 'text-blue-500' : 'text-slate-400'
                                    }`}
                            />
                        </div>
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={isLoading} className="w-full group mt-2 relative py-4 bg-gradient-to-r from-slate-900 to-blue-700 dark:from-blue-600 dark:to-cyan-500 text-white rounded-2xl font-bold text-sm overflow-hidden shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 hover:shadow-slate-900/40 dark:hover:shadow-blue-600/40 transition-all hover:scale-[1.01] active:scale-[0.98] duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_45%,transparent_100%)] translate-x-[-120%] group-hover:translate-x-[120%] duration-700" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Kontrol Ediliyor...
                            </>
                        ) : (
                            <>
                                Giriş Yap
                                <Zap size={15} className="opacity-90" />
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
            </motion.form>

            <motion.div variants={itemVariants} className="mt-6 text-center bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Hesabınız yok mu?{' '}
                    <Link href="/register" className="text-slate-900 dark:text-blue-400 font-black hover:underline transition-all">
                        Hemen Oluşturun
                    </Link>
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                Verileriniz sifrelenmis baglanti ile korunur.
            </motion.div>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <React.Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>}>
            <LoginForm />
        </React.Suspense>
    );
}

