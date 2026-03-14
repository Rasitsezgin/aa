"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';

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
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Şifremi Unuttum</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Sistemimizde kayıtlı olan e-posta adresinizi girin, size bir sıfırlama linki gönderelim.
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }}>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">E-posta Adresi</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="ornek@sirket.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none text-slate-900 dark:text-white font-medium focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all font-sans"
                                    />
                                </div>
                            </div>

                            <button className="w-full group relative py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm overflow-hidden shadow-xl hover:shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Sıfırlama Linki Gönder
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity" />
                            </button>

                            <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <ArrowLeft size={14} />
                                Giriş Sayfasına Dön
                            </Link>
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
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Talimatlar Gönderildi!</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
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

                            <Link href="/login" className="block w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                                Giriş Yap
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
