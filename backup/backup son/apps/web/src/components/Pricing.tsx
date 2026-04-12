"use client";

import React, { useState } from 'react';
import { Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 dark:bg-purple-500/10 blur-[120px] rounded-full" />
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
                        <span className={`text-sm font-bold transition-colors ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Aylık</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-full p-1 relative transition-colors hover:bg-slate-300 dark:hover:bg-white/20"
                        >
                            <motion.div
                                className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30"
                                animate={{ x: isAnnual ? 32 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={`text-sm font-bold transition-colors ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                            Yıllık <span className="ml-1 text-[10px] bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wide font-black">%20 İndirim</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Starter Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-10 rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 backdrop-blur-xl hover:shadow-2xl dark:hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-2 relative group overflow-hidden"
                    >
                        {/* Subtle hover gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                        <button className="w-full py-3.5 rounded-2xl border border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-bold mb-8 text-slate-900 dark:text-white relative z-10">Planı Seç</button>
                        <ul className="space-y-4 relative z-10">
                            {texts.plans[0].features.map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                        <Check size={12} className="text-blue-500" />
                                    </div>
                                    {i}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Pro Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-10 rounded-[32px] border-2 border-blue-500/30 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 backdrop-blur-xl relative group hover:border-blue-500/50 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-black uppercase tracking-widest text-white rounded-bl-2xl shadow-lg">Önerilen</div>
                        <h3 className="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400 relative z-10">{texts.plans[1].name}</h3>
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
                        <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all font-bold mb-8 text-white shadow-lg shadow-blue-500/30 group-hover:scale-[1.02] relative z-10">Ücretsiz Dene</button>
                        <ul className="space-y-4 relative z-10">
                            {texts.plans[1].features.map(i => (
                                <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                        <Check size={12} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    {i}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
