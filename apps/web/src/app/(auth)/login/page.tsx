"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Github, Chrome, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        // Simüle edilmiş giriş süresi
        setTimeout(() => {
            setIsLoading(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <motion.h2 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight"
                >
                    Tekrar Hoş Geldiniz
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                    ERP Panelinize erişmek için lütfen giriş yapın.
                </motion.p>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 flex items-start gap-3 overflow-hidden"
                    >
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="text-sm font-bold text-red-600 dark:text-red-400 text-left">
                            Bilinmeyen bir hata oluştu. Lütfen bilgilerinizi kontrol edin.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                            placeholder="E-posta Adresiniz"
                        />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                            placeholder="Şifreniz"
                        />
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="flex items-center justify-between py-1"
                >
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative w-4 h-4 rounded border border-slate-300 dark:border-slate-700 group-hover:border-blue-500 transition-colors flex items-center justify-center">
                            <input type="checkbox" className="peer absolute opacity-0 w-full h-full cursor-pointer" />
                            <CheckCircle2 className="w-3 h-3 text-blue-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Beni Hatırla</span>
                    </label>

                    <Link href="/forgot-password" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 group">
                        Şifremi Unuttum
                    </Link>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Giriş Yapılıyor...
                            </>
                        ) : (
                            <>
                                Sisteme Giriş Yap <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                    {/* Hover Effect Layer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/20 to-cyan-500/0 -translate-x-[100%] group-hover:animate-shimmer" />
                </motion.button>
            </form>

            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="mt-8"
            >
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <span className="relative bg-white dark:bg-[#0b1220] px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        VEYA
                    </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Chrome className="w-4 h-4" /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Github className="w-4 h-4" /> Github
                    </button>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="mt-8 text-center"
            >
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Hesabınız yok mu?{' '}
                    <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Hemen Oluşturun
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
