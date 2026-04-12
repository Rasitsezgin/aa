"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ShieldCheck } from 'lucide-react';

const FEATURES = [
    { name: "Pazaryeri Entegrasyon Sayısı", p: "30+ Global & Yerel", s: "Sadece TR (3-4)", check: true },
    { name: "Yapay Zeka SEO Desteği", p: "Gemini 1.5 Motoru", s: "Elle Giriş", check: true },
    { name: "Stok Senkronizasyon Hızı", p: "200ms (Real-time)", s: "5-15 Dakika", check: true },
    { name: "Global Satış Desteği", p: "Tam Destek (Amazon EU, Etsy)", s: "Destek Yok", check: true },
    { name: "AI Komut Merkezi", p: "Mevcut (CMD+K)", s: "Sabit Menüler", check: true },
    { name: "Canlı Performans Akışı", p: "Anlık Push Bildirim", s: "Sayfa Yenileme", check: true },
    { name: "Otomatik Fiyat Analizi", p: "Saatlik Rakip Takibi", s: "Manuel Giriş", check: true },
];

export default function ComparisonTable() {
    return (
        <section className="py-12 md:py-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                <div className="text-center mb-10 sm:mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-full mb-6">
                        <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">GÜVEN VE FARK</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 sm:mb-6 text-slate-900 dark:text-white">
                        Neden <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Pazaryonetimi?</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-lg max-w-xl mx-auto">
                        Standart yazılımlar sadece rapor sunar. Biz operasyonunuzun her adımını yapay zeka ile otomatikleştiririz.
                    </p>
                </div>

                <div className="relative overflow-hidden rounded-[16px] sm:rounded-[24px] md:rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 shadow-2xl dark:shadow-none backdrop-blur-xl">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[640px]">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/5">
                                <th className="p-4 md:p-8 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Özellikler</th>
                                <th className="p-4 md:p-8 text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter">Pazaryonetimi</th>
                                <th className="p-4 md:p-8 text-sm font-bold text-slate-400 dark:text-slate-500">Standart Yazılımlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {FEATURES.map((feature, i) => (
                                <motion.tr
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="p-4 md:p-8">
                                        <div className="text-slate-700 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{feature.name}</div>
                                    </td>
                                    <td className="p-4 md:p-8 bg-blue-50/50 dark:bg-blue-500/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                            <span className="text-slate-900 dark:text-white font-bold">{feature.p}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 md:p-8">
                                        <div className="flex items-center gap-3 opacity-70 dark:opacity-50">
                                            <X size={16} className="text-red-500" />
                                            <span className="text-slate-500">{feature.s}</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    </div>

                    {/* Footer for the table */}
                    <div className="p-4 sm:p-6 md:p-10 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-col items-center justify-between gap-4 sm:gap-6 md:flex-row md:gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20">P</div>
                            <div>
                                <div className="text-slate-900 dark:text-white font-bold italic">"Dünyanın en iyi e-ticaret altyapısı."</div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">- TECH INSIDE REVIEW 2026</div>
                            </div>
                        </div>
                        <button className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 text-sm sm:text-base">
                            TESTE BAŞLA
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
