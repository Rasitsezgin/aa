"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Variants, motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, Play, Search, Sparkles, Zap, Shield,
    Check, X
} from 'lucide-react';

import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';
import LandingDashboardPreview from '@/components/landing/LandingDashboardPreview';

// ────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────

const rotatingLogos = [
    { name: "Trendyol", image: "/images/pazaryeri/Trendyol.png", color: "#F27A1A" },
    { name: "Hepsiburada", image: "/images/pazaryeri/Hepsiburada.png", color: "#FF6000" },
    { name: "Amazon", image: "/images/pazaryeri/Amazon.png", color: "#FF9900" },
    { name: "N11", image: "/images/pazaryeri/N11.png", color: "#7B2BFC" },
    { name: "Etsy", image: "/images/pazaryeri/Etsy.png", color: "#F16521" },
    { name: "Shopify", image: "/images/pazaryeri/Shopify.png", color: "#96BF48" },
];



const statIcons = [Zap, Shield, Check];

// ────────────────────────────────────────────
// MAIN HERO COMPONENT
// ────────────────────────────────────────────

export default function HeroNew({ texts = HOMEPAGE_TEXTS.hero }: { texts?: typeof HOMEPAGE_TEXTS.hero }) {
    const [wordIndex, setWordIndex] = useState(0);
    const [analyzerFocused, setAnalyzerFocused] = useState(false);
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();
    const currentMarketplace = rotatingLogos[wordIndex];

    useEffect(() => {
        setShowAnnouncement(false);
    }, []);

    const dismissAnnouncement = useCallback(() => {
        setShowAnnouncement(false);
        localStorage.setItem('hero-announcement-dismissed', 'true');
    }, []);

    // Rotating words
    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % rotatingLogos.length);
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = useCallback(() => {
        if (!searchValue.trim()) return;
        router.push(`/analiz?url=${encodeURIComponent(searchValue.trim())}`);
    }, [router, searchValue]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    // Animation variants
    const stagger = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.15 },
        },
    };

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const scaleIn: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1, scale: 1,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
        },
    };

    return (
        <section
            className="relative min-h-svh overflow-hidden bg-[#FAFAF9] dark:bg-[#0F172A] transition-colors duration-500 selection:bg-orange-500/20 overflow-x-hidden"
        >
            {/* ═══════════════════════════════════════════════ */}
            {/* BACKGROUND SYSTEM (Optimized with CSS) */}
            {/* ═══════════════════════════════════════════════ */}

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full bg-orange-500/[0.04] blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-slate-400/[0.04] blur-3xl" />
            </div>

            <div
                className="absolute inset-0 pointer-events-none opacity-[0.18] dark:opacity-[0.08]"
                style={{
                    backgroundImage: `linear-gradient(rgba(148,163,184,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.45) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />


            {/* ═══════════════════════════════════════════════ */}
            {/* MAIN CONTENT                                   */}
            {/* ═══════════════════════════════════════════════ */}
            <div
                className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-12 sm:pb-16 lg:pb-20 max-w-7xl w-full"
                style={{ paddingTop: 'calc(4.05rem + env(safe-area-inset-top, 0px))' }}
            >

                {/* ────────────────────── TOP ANNOUNCEMENT ────────────────────── */}
                <AnimatePresence>
                    {showAnnouncement && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: "auto", filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, height: "auto", filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0, filter: "blur(6px)" }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="flex justify-center mb-8 relative z-30"
                        >
                            <div className="relative group rounded-full transition-all duration-300 hover:scale-[1.01]">
                                <div className="relative flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-orange-200/50 dark:border-orange-500/20 shadow-lg shadow-orange-500/5 group-hover:shadow-orange-500/10 group-hover:border-orange-300/60 transition-all">
                                    <Link href="/entegrasyonlar" className="flex items-center gap-3 sm:gap-4">
                                        <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-500/15 dark:bg-orange-500/10 border border-orange-500/30 dark:border-orange-500/20">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                                            </span>
                                            <span className="text-[10px] sm:text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-tighter sm:tracking-widest">{texts.badgeLabel}</span>
                                        </div>

                                        <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                            {texts.badge}
                                        </span>

                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-orange-500 transition-all duration-300">
                                            <ArrowRight size={12} className="text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors group-hover:translate-x-0.5" />
                                        </div>
                                    </Link>

                                    <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1" />

                                    <button
                                        onClick={dismissAnnouncement}
                                        className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                                        aria-label="Kapat"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">

                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-8 text-center lg:text-left"
                    >
                        <motion.h1
                            variants={fadeUp}
                            className="text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem] xl:text-[3.25rem] font-bold tracking-tight leading-[1.25] text-slate-900 dark:text-white"
                        >
                            <span className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-2.5 gap-y-2">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={wordIndex}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.35 }}
                                        className="inline-flex items-center gap-2 h-11 sm:h-12 px-3 sm:px-3.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.04] shadow-sm"
                                        style={{ borderLeftWidth: 3, borderLeftColor: currentMarketplace.color }}
                                    >
                                        <Image
                                            src={currentMarketplace.image}
                                            alt={currentMarketplace.name}
                                            width={72}
                                            height={24}
                                            className="h-5 sm:h-6 w-auto max-w-[72px] object-contain"
                                        />
                                        <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                                            {currentMarketplace.name}
                                        </span>
                                    </motion.span>
                                </AnimatePresence>
                                <span className="text-slate-700 dark:text-slate-200">{texts.titlePrefix}</span>
                                <span className="text-orange-600 dark:text-orange-400">{texts.titleSuffix}</span>
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed"
                        >
                            {texts.subtitlePrefix}
                            <span className="text-slate-800 dark:text-slate-200 font-medium">{texts.subtitleHighlight}</span>
                            {texts.subtitleSuffix}
                        </motion.p>

                        <motion.div variants={fadeUp} className="space-y-3 max-w-lg mx-auto lg:mx-0 w-full">
                            <div className={`flex flex-col sm:flex-row items-stretch gap-2 rounded-xl border bg-white dark:bg-white/[0.03] p-1.5 transition-shadow ${analyzerFocused ? 'border-slate-300 dark:border-white/20 shadow-md' : 'border-slate-200 dark:border-white/10 shadow-sm'}`}>
                                <div className="flex flex-1 items-center gap-2 px-3 min-h-[44px]">
                                    <Search className="text-slate-400 shrink-0" size={18} />
                                    <input
                                        type="text"
                                        placeholder={texts.analyzerPlaceholder}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setAnalyzerFocused(true)}
                                        onBlur={() => setAnalyzerFocused(false)}
                                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm placeholder:text-slate-400 min-w-0"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-sm shadow-orange-600/20 transition-colors min-h-[44px]"
                                >
                                    <Sparkles size={14} />
                                    <span className="hidden sm:inline">{texts.analyzerButton}</span>
                                    <span className="sm:hidden">Analiz</span>
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 text-center lg:text-left">{texts.analyzerNote}</p>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center lg:justify-start"
                        >
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-sm shadow-orange-600/20 transition-colors"
                            >
                                Ücretsiz Başla
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                href="/demo"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                            >
                                <Play size={14} className="text-slate-500" />
                                Demo İzle
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400"
                        >
                            {texts.stats.map((stat, i) => {
                                const Icon = statIcons[i] ?? Check;
                                return (
                                    <React.Fragment key={i}>
                                        {i > 0 && <span className="hidden sm:block w-px h-3 bg-slate-200 dark:bg-white/10" />}
                                        <span className="inline-flex items-center gap-1.5">
                                            <Icon size={12} className="text-slate-400" />
                                            {stat.text}
                                        </span>
                                    </React.Fragment>
                                );
                            })}
                        </motion.div>

                        <div className="lg:hidden w-full max-w-md mx-auto pt-2">
                            <LandingDashboardPreview />
                        </div>
                    </motion.div>

                    <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        className="hidden lg:block w-full"
                    >
                        <LandingDashboardPreview />
                    </motion.div>
                </div>


            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* SCROLL INDICATOR                               */}
            {/* ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 1, delay: 3 }}
                className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden sm:flex"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-5 h-8 rounded-full border-2 border-slate-400/40 dark:border-white/20 flex justify-center pt-1.5"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1 h-1.5 rounded-full bg-slate-400/60 dark:bg-white/30"
                    />
                </motion.div>
            </motion.div>
        </section>
    );
}
