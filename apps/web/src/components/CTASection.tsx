"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Play, CheckCircle, Rocket, Shield, Zap, Star } from 'lucide-react';
import Link from 'next/link';

// ────────────────────────────────────────────
// ANIMATED COUNTER
// ────────────────────────────────────────────
function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        let current = 0;
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;

        const timer = setInterval(() => {
            current++;
            const progress = current / steps;
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(eased * value));
            if (current >= steps) clearInterval(timer);
        }, stepTime);
        return () => clearInterval(timer);
    }, [isInView, value]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isInView ? count.toLocaleString('tr-TR') : '0'}{suffix}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-white/50 font-medium mt-0.5">{label}</div>
        </div>
    );
}


// ────────────────────────────────────────────
// MARKETPLACE LOGOS
// ────────────────────────────────────────────
const ctaMarketplaces = [
    { name: "Trendyol", image: "/images/pazaryeri/Trendyol.png" },
    { name: "Hepsiburada", image: "/images/pazaryeri/Hepsiburada.png" },
    { name: "Amazon", image: "/images/pazaryeri/Amazon.png" },
    { name: "N11", image: "/images/pazaryeri/N11.png" },
    { name: "Etsy", image: "/images/pazaryeri/Etsy.png" },
    { name: "Shopify", image: "/images/pazaryeri/Shopify.png" },
    { name: "eBay", image: "/images/pazaryeri/EBay.png" },
    { name: "WooCommerce", image: "/images/pazaryeri/WooCommerce.png" },
];

export default function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
            {/* ── Background system ── */}
            <div className="absolute inset-0 bg-white dark:bg-[#030712] transition-colors duration-700" />


            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-orange-500/[0.06] dark:bg-orange-500/[0.08] rounded-full blur-[120px]" />
            </div>

            {/* ── Subtle grid ── */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-slate-900 dark:text-white" style={{
                backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
            }} />



            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="max-w-5xl mx-auto">

                    {/* ── Top badge (Enhanced) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex justify-center mb-8"
                    >
                        <motion.div 
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 backdrop-blur-xl hover:bg-orange-100 dark:hover:bg-orange-500/15 transition-all duration-300"
                        >
                            <span className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                                </span>
                                <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Ücretsiz Deneme</span>
                            </span>
                            <span className="w-px h-3 bg-orange-200 dark:bg-orange-500/30" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Kredi kartı gerekmez</span>
                        </motion.div>
                    </motion.div>

                    {/* ── Headline ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-center mb-6 sm:mb-8"
                    >
                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]">
                            Tüm Kanallarınızı <br className="hidden sm:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                                Tek Merkezden Yönetin
                            </span>
                        </h2>
                    </motion.div>

                    {/* ── Subtitle ── */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-center text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12"
                    >
                        Excel tabloları ve dağınık paneller yerine tek operasyon merkezi.
                        Stok senkronizasyonu, sipariş yönetimi ve kargo — hepsi bir arada.
                    </motion.p>


                    {/* ── CTA Buttons (Enhanced) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        {/* Primary Button */}
                        <motion.div
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full sm:w-auto"
                        >
                            <Link
                                href="/signup"
                                className="group relative block w-full sm:w-auto"
                            >
                                <motion.div 
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur-lg"
                                />
                                <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold text-lg border border-white/10 overflow-hidden">
                                    <Rocket size={20} className="text-white/90" />
                                    <span>Ücretsiz Başla</span>
                                    <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    {/* Shimmer effect */}
                                    <motion.div 
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    />
                                </div>
                            </Link>
                        </motion.div>

                        {/* Secondary Button */}
                        <motion.div
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full sm:w-auto"
                        >
                            <Link
                                href="/demo"
                                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold text-lg border border-slate-200 dark:border-white/10 transition-colors shadow-lg hover:shadow-xl"
                            >
                                <Play size={18} fill="currentColor" className="opacity-70" />
                                Demo İzle
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* ── Stats with Glass Cards (Enhanced) ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
                    >
                        {[
                            { val: 5000, suf: "+", label: "Aktif Mağaza", color: "from-orange-500 to-amber-500" },
                            { val: 200, suf: "ms", label: "Stok Senkron", color: "from-orange-500 to-amber-500" },
                            { val: 30, suf: "+", label: "Entegrasyon", color: "from-orange-500 to-amber-500" },
                            { val: 24, suf: "/7", label: "Canlı Destek", color: "from-orange-500 to-amber-500" },
                        ].map((stat, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="p-6 rounded-3xl bg-white/50 dark:bg-white/[0.03] backdrop-blur-md border border-slate-200 dark:border-white/5 text-center group hover:bg-white dark:hover:bg-white/[0.05] transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
                            >
                                {/* Hover gradient */}
                                <motion.div 
                                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                                />
                                <div className="relative z-10">
                                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">
                                        <AnimatedStat value={stat.val} suffix={stat.suf} label={stat.label} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
