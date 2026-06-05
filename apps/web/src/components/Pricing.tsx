"use client";

import React, { useState } from 'react';
import { Check, Sparkles, BarChart3, ShieldCheck, CreditCard, Headphones, Clock } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

const ComparisonTable = dynamic(() => import("@/components/ComparisonTable"), { ssr: false });

export default function Pricing({ texts = HOMEPAGE_TEXTS.pricing }: { texts?: typeof HOMEPAGE_TEXTS.pricing }) {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <section className="py-20 md:py-32 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#02040a] relative overflow-hidden transition-colors duration-500">
            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                {/* Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-6"
                    >
                        <Sparkles size={14} className="text-yellow-500" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">{texts.badge}</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900 dark:text-white">{texts.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10">
                        {texts.subtitle}
                    </p>

                    {/* Toggle Switch */}
                    <div className="flex items-center justify-center gap-4">
                        <motion.span 
                            animate={{ color: !isAnnual ? 'var(--foreground)' : 'var(--text-secondary)' }}
                            className={`text-sm font-bold transition-colors ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
                        >Aylık</motion.span>
                        <motion.button
                            onClick={() => setIsAnnual(!isAnnual)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-full p-1 relative transition-colors hover:bg-slate-300 dark:hover:bg-white/20"
                        >
                            <motion.div
                                className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-lg shadow-orange-500/30"
                                animate={{ x: isAnnual ? 32 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </motion.button>
                        <motion.span 
                            animate={{ color: isAnnual ? 'var(--foreground)' : 'var(--text-secondary)' }}
                            className={`text-sm font-bold transition-colors ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                            Yıllık <motion.span 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="ml-1 text-[10px] bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wide font-black"
                            >%20 İndirim</motion.span>
                        </motion.span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Starter Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, y: -8 }}
                        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="p-10 rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 backdrop-blur-xl hover:shadow-2xl dark:hover:shadow-orange-500/5 transition-all duration-500 relative group overflow-hidden"
                    >
                        {/* Subtle hover gradient */}
                        <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            background: 'linear-gradient(135deg, rgba(234,88,12,0.08) 0%, rgba(245,158,11,0.04) 50%, transparent 100%)'
                        }}
                        />

                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white relative z-10">{texts.plans[0].name}</h3>
                        <div className="flex items-end gap-1 mb-6 h-12 relative z-10">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={isAnnual ? 'year-basic' : 'month-basic'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-4xl font-black text-slate-900 dark:text-white"
                                >
                                    ₺{isAnnual ? texts.plans[0].priceAnnual : texts.plans[0].priceMonthly}
                                </motion.div>
                            </AnimatePresence>
                            <span className="text-lg text-slate-400 font-medium mb-1">/ay</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm h-10 relative z-10">{texts.plans[0].description}</p>
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-2xl border border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold mb-8 text-slate-900 dark:text-white relative z-10"
                        >Planı Seç</motion.button>
                        <ul className="space-y-4 relative z-10">
                            {texts.plans[0].features.map((i, idx) => (
                                <motion.li 
                                    key={i} 
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.05 }}
                                    className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                                >
                                    <motion.div 
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center"
                                    >
                                        <Check size={12} className="text-orange-600" />
                                    </motion.div>
                                    {i}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Pro Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.03, y: -10 }}
                        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="p-10 rounded-[32px] border-2 border-orange-500/30 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 backdrop-blur-xl relative group hover:border-orange-500/50 shadow-2xl shadow-orange-500/10 dark:shadow-orange-500/5 transition-all duration-500 overflow-hidden"
                    >
                        {/* Animated Glow effect */}
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 blur-3xl rounded-full"
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full"
                        />

                        <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-[10px] font-black uppercase tracking-widest text-white rounded-bl-2xl shadow-lg shadow-orange-500/30"
                        >Önerilen</motion.div>
                        <h3 className="text-xl font-bold mb-2 text-orange-600 dark:text-orange-400 relative z-10">{texts.plans[1].name}</h3>
                        <div className="flex items-end gap-1 mb-6 h-12 relative z-10">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={isAnnual ? 'year-pro' : 'month-pro'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="text-4xl font-black text-slate-900 dark:text-white"
                                >
                                    ₺{isAnnual ? texts.plans[1].priceAnnual : texts.plans[1].priceMonthly}
                                </motion.div>
                            </AnimatePresence>
                            <span className="text-lg text-slate-400 font-medium mb-1">/ay</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm h-10 relative z-10">{texts.plans[1].description}</p>
                        <motion.button 
                            whileHover={{ scale: 1.03, boxShadow: "0 20px 40px -10px rgba(234,88,12,0.35)" }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all font-bold mb-8 text-white shadow-lg shadow-orange-500/30 relative z-10"
                        >Ücretsiz Dene</motion.button>
                        <ul className="space-y-4 relative z-10">
                            {texts.plans[1].features.map((i, idx) => (
                                <motion.li 
                                    key={i} 
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.05 }}
                                    className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
                                >
                                    <motion.div 
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center"
                                    >
                                        <Check size={12} className="text-orange-600 dark:text-orange-400" />
                                    </motion.div>
                                    {i}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-16 pt-10 border-t border-slate-200 dark:border-white/10"
                >
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Rakiplerle Karşılaştırma</span>
                    </div>
                    <ComparisonTable />
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
                >
                    {[
                        { icon: ShieldCheck, label: "14 Gün Para İadesi" },
                        { icon: CreditCard, label: "Kredi Kartı Gerekmez" },
                        { icon: Headphones, label: "7/24 Destek" },
                        { icon: Clock, label: "2 Dakikada Kurulum" },
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5">
                            <badge.icon className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{badge.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
