"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, RotateCcw, Sparkles, ShieldCheck, Clock3 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <AnimatePresence mode="wait">
                {!isSubmitted ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">
                                <Sparkles size={12} className="text-blue-500" />
                                Sifre Kurtarma
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Sifremi Unuttum</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                                Sistemimizde kayıtlı olan e-posta adresinizi girin, size bir sıfırlama linki gönderelim.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                                    <ShieldCheck size={13} /> Guvenli Islem
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                                    <Clock3 size={13} /> 1 dk icinde e-posta
                                </span>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">E-posta Adresi</label>
                                <div className="relative group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 focus-within:border-blue-500/60 focus-within:shadow-lg focus-within:shadow-blue-500/10">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="ornek@sirket.com"
                                        className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all font-sans"
                                    />
                                </div>
                            </div>

                            <button className="w-full group relative py-4 bg-gradient-to-r from-slate-900 to-blue-700 dark:from-blue-600 dark:to-cyan-500 text-white rounded-2xl font-black text-sm overflow-hidden shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 hover:shadow-slate-900/40 dark:hover:shadow-blue-600/40 transition-all hover:scale-[1.01] active:scale-[0.98] duration-300">
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_45%,transparent_100%)] translate-x-[-120%] group-hover:translate-x-[120%] duration-700" />
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Sıfırlama Linki Gönder
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>

                            <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-xl border border-slate-200/80 dark:border-white/10 text-center">
                                <Link href="/login" className="inline-flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <ArrowLeft size={14} />
                                    Giris Sayfasina Don
                                </Link>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-8 py-8"
                    >
                        <div className="relative inline-block">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1.2, rotate: 360 }}
                                transition={{ type: "spring", damping: 10 }}
                                className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500"
                            >
                                <CheckCircle2 size={48} />
                            </motion.div>
                            <div className="absolute -inset-4 bg-emerald-500/5 blur-2xl rounded-full" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Talimatlar Gonderildi!</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                                E-posta kutunuzu kontrol edin. Şifrenizi nasıl sıfırlayacağınıza dair bir mail gönderdik.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="flex items-center justify-center gap-2 w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                            >
                                <RotateCcw size={14} />
                                Tekrar Dene
                            </button>

                            <Link href="/login" className="block w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-black text-sm border border-slate-200/80 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                                Giriş Yap
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
