"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, User, Building2, Phone, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        // Simüle edilmiş kayıt süresi
        setTimeout(() => {
            setIsLoading(false);
            router.push('/dashboard');
        }, 2000);
    };

    return (
        <div className="w-full">
            <div className="mb-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-black uppercase tracking-widest mb-4"
                >
                    <Sparkles className="w-3 h-3" /> 14 Gün Ücretsiz Deneyin
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight"
                >
                    Hesabınızı Oluşturun
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                    Saniyeler içinde kayıt olun ve tüm pazaryerlerini tek bir noktadan yönetmeye başlayın. Kredi kartı gerekmez.
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
                            Bilinmeyen bir hata oluştu.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                                placeholder="Adınız"
                            />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                                placeholder="Soyadınız"
                            />
                        </div>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Building2 className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            required
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                            placeholder="Firma / Mağaza Adı"
                        />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
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

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            required
                            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                            placeholder="Güvenli Bir Şifre Belirleyin"
                        />
                    </div>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full relative group overflow-hidden bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Hesabınız Oluşturuluyor...
                            </>
                        ) : (
                            <>
                                Ücretsiz Kayıt Ol <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                    {/* Hover Effect Layer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-white/20 to-cyan-500/0 -translate-x-[100%] group-hover:animate-shimmer" />
                </motion.button>
            </form>

            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                className="mt-6 text-center"
            >
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Kayıt olarak <Link href="#" className="text-blue-500 hover:underline">Hizmet Şartlarımızı</Link> ve <Link href="#" className="text-blue-500 hover:underline">Gizlilik Politikamızı</Link> kabul etmiş olursunuz.
                </p>
                <div className="h-px bg-border my-6" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Zaten bir hesabınız var mı?{' '}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Giriş Yapın
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
