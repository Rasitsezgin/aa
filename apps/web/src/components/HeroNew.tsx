"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Variants, motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, Play, Search, BarChart3, Zap, Shield,
    Check, X, Globe,
} from 'lucide-react';

import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';
import { getMarketplaceLogo } from '@/lib/marketplace-assets';
import LandingDashboardPreview from '@/components/landing/LandingDashboardPreview';

const rotatingLogos = [
    { name: "Trendyol", id: "trendyol", mockupName: "Trendyol" },
    { name: "Hepsiburada", id: "hepsiburada", mockupName: "Hepsiburada" },
    { name: "Amazon", id: "amazon-tr", mockupName: "Amazon" },
    { name: "N11", id: "n11", mockupName: "N11" },
    { name: "Etsy", id: "etsy", mockupName: "Etsy" },
    { name: "Shopify", id: "shopify", mockupName: "Shopify" },
];

const statIcons = [Globe, Shield, Zap];
const ROTATION_MS = 2800;

function MarketplaceLogo({ name, id }: { name: string; id: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={getMarketplaceLogo(id)}
            alt={name}
            className="h-9 sm:h-10 md:h-11 w-auto max-w-[min(160px,42vw)] object-contain align-middle"
        />
    );
}

export default function HeroNew({ texts = HOMEPAGE_TEXTS.hero }: { texts?: typeof HOMEPAGE_TEXTS.hero }) {
    const prefersReducedMotion = useReducedMotion();
    const [wordIndex, setWordIndex] = useState(0);
    const [rotationPaused, setRotationPaused] = useState(false);
    const [analyzerFocused, setAnalyzerFocused] = useState(false);
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();
    const currentMarketplace = rotatingLogos[wordIndex];

    useEffect(() => {
        const dismissed = localStorage.getItem('hero-announcement-dismissed');
        setShowAnnouncement(dismissed !== 'true');
    }, []);

    const dismissAnnouncement = useCallback(() => {
        setShowAnnouncement(false);
        localStorage.setItem('hero-announcement-dismissed', 'true');
    }, []);

    useEffect(() => {
        if (prefersReducedMotion || rotationPaused) return;
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % rotatingLogos.length);
        }, ROTATION_MS);
        return () => clearInterval(interval);
    }, [prefersReducedMotion, rotationPaused]);

    const goToAnalysis = useCallback((url: string) => {
        const trimmed = url.trim();
        if (!trimmed) return;
        router.push(`/analiz?url=${encodeURIComponent(trimmed)}`);
    }, [router]);

    const handleSearch = useCallback(() => {
        goToAnalysis(searchValue);
    }, [goToAnalysis, searchValue]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    }, [handleSearch]);

    const stagger = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.12 },
        },
    };

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1, y: 0,
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const scaleIn: Variants = {
        hidden: { opacity: 0, scale: 0.92, y: 16 },
        visible: {
            opacity: 1, scale: 1, y: 0,
            transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
        },
    };

    const titleLine1 = 'titleLine1' in texts ? texts.titleLine1 : (texts as { titlePrefix?: string }).titlePrefix ?? 'mağazanızı';
    const analyzerExamples = 'analyzerExamples' in texts ? texts.analyzerExamples : [];
    const freeTrialNote = 'freeTrialNote' in texts ? texts.freeTrialNote : '14 gün ücretsiz · kredi kartı gerekmez';
    const signupCta = 'signupCta' in texts ? texts.signupCta : 'Ücretsiz Başla';
    const demoCta = 'demoCta' in texts ? texts.demoCta : 'Demo İzle';

    return (
        <section className="relative min-h-[100svh] flex flex-col overflow-hidden bg-[#FAFAF9] dark:bg-[#0B1120] transition-colors duration-500 selection:bg-orange-500/20">
            <div className="absolute inset-0 pointer-events-none hero-grid-bg" aria-hidden />
            <div className="absolute inset-0 pointer-events-none hero-radial-fade" aria-hidden />
            <div className="absolute top-[-10%] right-[-5%] w-[min(560px,80vw)] h-[min(560px,80vw)] rounded-full bg-orange-500/[0.07] blur-3xl pointer-events-none" aria-hidden />
            <div className="absolute bottom-[-15%] left-[-10%] w-[min(420px,70vw)] h-[min(420px,70vw)] rounded-full bg-slate-400/[0.05] blur-3xl pointer-events-none" aria-hidden />

            <div
                className="relative z-10 flex-1 flex flex-col justify-center container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full min-w-0 py-8 sm:py-12 lg:py-16"
                style={{ paddingTop: 'calc(5rem + env(safe-area-inset-top, 0px))' }}
            >
                <AnimatePresence>
                    {showAnnouncement && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 'auto' }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="flex justify-center mb-6 lg:mb-8 relative z-30"
                        >
                            <div className="relative flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-orange-200/50 dark:border-orange-500/20 shadow-lg shadow-orange-500/5">
                                <Link href="/entegrasyonlar" className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">{texts.badgeLabel}</span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">{texts.badge}</span>
                                    <ArrowRight size={12} className="text-slate-400" />
                                </Link>
                                <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />
                                <button type="button" onClick={dismissAnnouncement} className="p-1 rounded-full text-slate-400 hover:text-red-500 transition-colors" aria-label="Kapat">
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 xl:gap-20 items-center">
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-5 sm:gap-6 lg:gap-7 text-center lg:text-left min-w-0 order-1"
                    >
                        {/* Başlık */}
                        <motion.h1
                            variants={fadeUp}
                            className="order-1 text-[1.625rem] min-[400px]:text-[1.875rem] sm:text-[2.5rem] lg:text-[2.875rem] xl:text-[3.375rem] font-bold tracking-tight leading-[1.15] sm:leading-[1.12] text-slate-900 dark:text-white"
                        >
                            <span className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-2">
                                <span
                                    className="inline-flex"
                                    onMouseEnter={() => setRotationPaused(true)}
                                    onMouseLeave={() => setRotationPaused(false)}
                                    onFocus={() => setRotationPaused(true)}
                                    onBlur={() => setRotationPaused(false)}
                                >
                                    {prefersReducedMotion ? (
                                        <MarketplaceLogo name={rotatingLogos[0].name} id={rotatingLogos[0].id} />
                                    ) : (
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={wordIndex}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.35 }}
                                                className="inline-flex"
                                            >
                                                <MarketplaceLogo
                                                    name={currentMarketplace.name}
                                                    id={currentMarketplace.id}
                                                />
                                            </motion.span>
                                        </AnimatePresence>
                                    )}
                                </span>
                                <span className="text-slate-700 dark:text-slate-200">{titleLine1}</span>
                            </span>
                            <span className="block mt-1 sm:mt-1.5 text-orange-600 dark:text-orange-400">
                                {texts.titleSuffix}
                            </span>
                        </motion.h1>

                        {/* Analiz — mobilde başlıktan hemen sonra */}
                        <motion.div variants={fadeUp} className="order-2 lg:order-3 w-full max-w-xl mx-auto lg:mx-0 min-w-0">
                            <div
                                className={`relative flex flex-col sm:flex-row sm:items-stretch rounded-2xl border bg-white dark:bg-white/[0.03] shadow-sm transition-all duration-300 overflow-hidden min-w-0 ${
                                    analyzerFocused
                                        ? 'border-orange-300/80 dark:border-orange-500/30 shadow-lg shadow-orange-500/10 ring-2 ring-orange-500/15'
                                        : 'border-slate-200/90 dark:border-white/10'
                                }`}
                            >
                                <div className="flex flex-1 items-center gap-2 min-h-[48px] sm:min-h-[52px] pl-3 pr-3 sm:pl-4 sm:pr-2 min-w-0">
                                    <Search className="text-slate-400 shrink-0" size={18} />
                                    <input
                                        type="url"
                                        inputMode="url"
                                        placeholder={texts.analyzerPlaceholder}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setAnalyzerFocused(true)}
                                        onBlur={() => setAnalyzerFocused(false)}
                                        className="flex-1 min-w-0 w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm sm:text-base placeholder:text-slate-400"
                                        aria-label="Mağaza analiz linki"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 sm:m-1.5 px-4 py-3 sm:py-2.5 rounded-none sm:rounded-xl border-t sm:border-t-0 border-slate-100 dark:border-white/10 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-sm font-bold shadow-none sm:shadow-md sm:shadow-orange-600/30 transition-all min-h-[44px] shrink-0"
                                >
                                    <BarChart3 size={16} className="shrink-0" />
                                    <span className="sm:hidden">Analiz Et</span>
                                    <span className="hidden sm:inline">{texts.analyzerButton}</span>
                                </button>
                            </div>
                            {analyzerExamples.length > 0 && (
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-2.5">
                                    <span className="text-[11px] text-slate-400">Örnek:</span>
                                    {analyzerExamples.map((ex) => (
                                        <button
                                            key={ex.label}
                                            type="button"
                                            onClick={() => goToAnalysis(ex.url)}
                                            className="text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:border-orange-300 dark:hover:border-orange-500/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                        >
                                            {ex.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <p className="mt-2 text-xs text-slate-400 text-center lg:text-left">{texts.analyzerNote}</p>
                        </motion.div>

                        {/* Alt metin — analizden sonra (mobil önceliği) */}
                        <motion.p
                            variants={fadeUp}
                            className="order-3 lg:order-2 text-base sm:text-lg lg:text-[1.125rem] text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            {texts.subtitlePrefix}
                            <span className="text-slate-800 dark:text-slate-200 font-medium">{texts.subtitleHighlight}</span>
                            {texts.subtitleSuffix}
                        </motion.p>

                        {/* CTAs — kayıt ikincil */}
                        <motion.div
                            variants={fadeUp}
                            className="order-4 flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center gap-3 justify-center lg:justify-start"
                        >
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.03] text-slate-800 dark:text-slate-100 text-sm sm:text-base font-semibold hover:border-orange-300 dark:hover:border-orange-500/40 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 transition-all min-h-[48px]"
                            >
                                {signupCta}
                                <ArrowRight size={17} />
                            </Link>
                            <Link
                                href="/demo"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-all min-h-[48px]"
                            >
                                <Play size={15} className="opacity-60" />
                                {demoCta}
                            </Link>
                        </motion.div>
                        <motion.p variants={fadeUp} className="order-5 -mt-2 text-xs text-slate-500 dark:text-slate-400 text-center lg:text-left">
                            {freeTrialNote}
                        </motion.p>

                        {/* Güven rozetleri */}
                        <motion.div
                            variants={fadeUp}
                            className="order-6 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3"
                        >
                            {texts.stats.map((stat, i) => {
                                const Icon = statIcons[i] ?? Check;
                                return (
                                    <span
                                        key={stat.text}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08]"
                                    >
                                        <Icon size={12} className="text-orange-500/80" />
                                        {stat.text}
                                    </span>
                                );
                            })}
                        </motion.div>
                    </motion.div>

                    {/* Mockup — logo ile senkron */}
                    <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        className="w-full min-w-0 order-2 lg:order-2 max-w-md sm:max-w-lg lg:max-w-none mx-auto lg:mx-0 hero-mockup-wrap max-lg:scale-[0.92] max-lg:origin-top max-sm:scale-[0.88]"
                    >
                        <LandingDashboardPreview
                            highlightPlatform={
                                prefersReducedMotion
                                    ? rotatingLogos[0].mockupName
                                    : currentMarketplace.mockupName
                            }
                        />
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 1, delay: 2.5 }}
                className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 pointer-events-none"
                aria-hidden
            >
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-5 h-8 rounded-full border-2 border-slate-300/50 dark:border-white/15 flex justify-center pt-1.5"
                >
                    <div className="w-1 h-1.5 rounded-full bg-slate-400/50 dark:bg-white/25" />
                </motion.div>
            </motion.div>
        </section>
    );
}
