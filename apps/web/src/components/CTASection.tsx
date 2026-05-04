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
    const [mounted, setMounted] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section ref={sectionRef} className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
            {/* ── Background system ── */}
            <div className="absolute inset-0 bg-white dark:bg-[#030712] transition-colors duration-700" />


            {/* ── Aurora gradient blobs (Enhanced with animation) ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{
                        scale: [1, 1.3, 1.1, 1],
                        x: [0, 80, 40, 0],
                        y: [0, -60, 30, 0],
                        opacity: [0.06, 0.1, 0.08, 0.06],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/[0.06] rounded-full blur-[150px]"
                />
                <motion.div 
                    animate={{
                        scale: [1.1, 1.4, 1.2, 1.1],
                        x: [0, -80, -40, 0],
                        y: [0, 50, -30, 0],
                        opacity: [0.05, 0.09, 0.07, 0.05],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-400/[0.05] rounded-full blur-[160px]"
                />
                {/* Additional purple accent blob */}
                <motion.div 
                    animate={{
                        scale: [0.9, 1.2, 1, 0.9],
                        x: [0, -50, 25, 0],
                        y: [0, 40, -20, 0],
                        opacity: [0.04, 0.08, 0.06, 0.04],
                    }}
                    transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-purple-500/[0.04] rounded-full blur-[140px]"
                />
            </div>

            {/* ── Subtle grid ── */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-slate-900 dark:text-white" style={{
                backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
            }} />



            {/* ── Floating particles with interaction (Enhanced) ── */}
            {mounted && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(40)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0, 0.5, 0],
                                y: [0, -120 - Math.random() * 60],
                                x: [0, (Math.random() - 0.5) * 60],
                                scale: [0, Math.random() * 0.8 + 0.6, 0]
                            }}
                            transition={{
                                duration: 4 + Math.random() * 6,
                                delay: i * 0.15,
                                repeat: Infinity,
                                repeatDelay: Math.random() * 2
                            }}
                            style={{
                                position: 'absolute',
                                left: `${5 + Math.random() * 90}%`,
                                top: `${60 + Math.random() * 40}%`,
                                backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][i % 4], // Emerald, Blue, Purple, Amber
                            }}
                            className="w-2 h-2 rounded-full blur-[1px]"
                        />
                    ))}
                </div>
            )}

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
                            className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                        >
                            <span className="flex items-center gap-2">
                                <motion.span 
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative flex h-2 w-2"
                                >
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                </motion.span>
                                <span className="text-[11px] font-bold text-slate-600 dark:text-emerald-400 uppercase tracking-wider">Sınırlı Süre</span>
                            </span>
                            <span className="w-px h-3 bg-white/20" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">14 Gün Ücretsiz Deneme</span>
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
                        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] drop-shadow-2xl">
                            E-ticaretin <br className="hidden sm:block" />
                            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 animate-gradient-x">
                                Geleceğini Yakala
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
                        Artık Excel tabloları ve karmaşık paneller yok.
                        Tüm pazaryerlerinizi tek bir akıllı merkezden yönetin.
                        Satışlarınızı <span className="text-slate-900 dark:text-white font-bold border-b border-emerald-500/50">2 katına</span> çıkarın.
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
                                    className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 rounded-2xl blur-lg"
                                />
                                <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg border border-white/10 overflow-hidden">
                                    <motion.div 
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Rocket size={20} className="text-emerald-400" />
                                    </motion.div>
                                    <span>Hemen Başla — Ücretsiz</span>
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
                                href="/contact"
                                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold text-lg border border-slate-200 dark:border-white/10 transition-colors shadow-lg hover:shadow-xl"
                            >
                                <motion.div 
                                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Play size={18} fill="currentColor" className="opacity-70" />
                                </motion.div>
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
                            { val: 5000, suf: "+", label: "Aktif Mağaza", color: "from-emerald-500 to-teal-500" },
                            { val: 99, suf: ".9%", label: "Uptime SLA", color: "from-blue-500 to-indigo-500" },
                            { val: 15, suf: "M+", label: "Aylık Sipariş", color: "from-purple-500 to-pink-500" },
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
