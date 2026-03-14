"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Variants, motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import MagneticButton from './ui/MagneticButton';
import { useRouter } from 'next/navigation';
import {
    ArrowRight, Play, Search, Sparkles, Zap, Shield, BarChart3,
    TrendingUp, Package, Users, Check, X,
    Globe, Layers, Activity
} from 'lucide-react';

import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

// ────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────

const marketplaceLogos = [
    { name: "Trendyol", image: "/images/pazaryeri/Trendyol.png", color: "#F27A1A" },
    { name: "Hepsiburada", image: "/images/pazaryeri/Hepsiburada.png", color: "#FF6000" },
    { name: "Amazon", image: "/images/pazaryeri/Amazon.png", color: "#FF9900" },
    { name: "N11", image: "/images/pazaryeri/N11.png", color: "#7B2BFC" },
    { name: "Etsy", image: "/images/pazaryeri/Etsy.png", color: "#F16521" },
    { name: "Shopify", image: "/images/pazaryeri/Shopify.png", color: "#96BF48" },
    { name: "eBay", image: "/images/pazaryeri/EBay.png", color: "#E53238" },
    { name: "WooCommerce", image: "/images/pazaryeri/WooCommerce.png", color: "#96588A" },
];

const rotatingLogos = [
    { name: "Trendyol", image: "/images/pazaryeri/Trendyol.png", accent: "from-orange-400 to-orange-600", glow: "rgba(242,122,26,0.35)" },
    { name: "Hepsiburada", image: "/images/pazaryeri/Hepsiburada.png", accent: "from-orange-500 to-red-500", glow: "rgba(255,96,0,0.35)" },
    { name: "Amazon", image: "/images/pazaryeri/Amazon.png", accent: "from-amber-400 to-orange-500", glow: "rgba(255,153,0,0.35)" },
    { name: "N11", image: "/images/pazaryeri/N11.png", accent: "from-violet-500 to-purple-600", glow: "rgba(123,43,252,0.35)" },
    { name: "Etsy", image: "/images/pazaryeri/Etsy.png", accent: "from-orange-500 to-red-500", glow: "rgba(241,101,33,0.35)" },
    { name: "Shopify", image: "/images/pazaryeri/Shopify.png", accent: "from-green-400 to-emerald-600", glow: "rgba(150,191,72,0.35)" },
];



const trustBadges = [
    { icon: Shield, text: "256-bit SSL" },
    { icon: Zap, text: "200ms Senkron" },
    { icon: Check, text: "KVKK Uyumlu" },
];

// Smooth chart data (SVG path)
const chartPoints = [
    { x: 0, y: 65 }, { x: 8, y: 55 }, { x: 16, y: 60 },
    { x: 24, y: 45 }, { x: 32, y: 50 }, { x: 40, y: 35 },
    { x: 48, y: 40 }, { x: 56, y: 28 }, { x: 64, y: 32 },
    { x: 72, y: 22 }, { x: 80, y: 18 }, { x: 88, y: 15 },
    { x: 96, y: 8 }, { x: 100, y: 5 },
];

function buildSmoothPath(points: { x: number; y: number }[]) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpx = (p0.x + p1.x) / 2;
        d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
}

const chartPath = buildSmoothPath(chartPoints);
const chartAreaPath = chartPath + ` L 100 100 L 0 100 Z`;

// ────────────────────────────────────────────
// ANIMATED COUNTER
// ────────────────────────────────────────────
function AnimatedCounter({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!inView) return;
        const start = 0;
        const end = value;
        const isDecimal = value % 1 !== 0;
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * eased;
            setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, value, duration]);

    return (
        <span ref={ref}>
            {count % 1 !== 0 ? count.toFixed(1) : count.toLocaleString('tr-TR')}
            {suffix}
        </span>
    );
}

// ────────────────────────────────────────────
// FLOATING PARTICLES
// ────────────────────────────────────────────
function FloatingParticles() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        setParticles(Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 15,
            delay: Math.random() * 10,
            opacity: Math.random() * 0.3 + 0.1,
        })));
    }, []);

    if (!mounted || particles.length === 0) return null;

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-emerald-400 dark:bg-emerald-500"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        opacity: [p.opacity, p.opacity * 2, p.opacity],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// ────────────────────────────────────────────
// NOTIFICATION TOASTS (floating cards)
// ────────────────────────────────────────────
function FloatingNotification({ delay = 0 }: { delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: delay + 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -right-2 xl:-right-4 bottom-20 xl:bottom-24 z-30 hidden lg:block"
        >
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-3 px-4 py-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-emerald-500/10"
            >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-emerald-500" />
                </div>
                <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">Satışlarınız %27 arttı</div>
                    <div className="text-[10px] text-slate-500">Son 7 gün • Trendyol</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </motion.div>
        </motion.div>
    );
}

function FloatingOrderNotification({ delay = 0 }: { delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: delay + 3.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -left-2 xl:-left-6 top-28 xl:top-32 z-30 hidden lg:block"
        >
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="flex items-center gap-3 px-4 py-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-blue-500/10"
            >
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                    <Package size={16} className="text-blue-500" />
                </div>
                <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">+48 yeni sipariş</div>
                    <div className="text-[10px] text-slate-500">Bugün • Tüm kanallar</div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ────────────────────────────────────────────
// MOBILE HERO VISUAL
// ────────────────────────────────────────────
function MobileHeroVisual() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden relative w-full max-w-[340px] mx-auto my-12"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-[32px] blur-2xl" />

            {/* Main Card */}
            <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[24px] p-5 shadow-2xl shadow-emerald-500/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Zap size={20} fill="currentColor" />
                        </div>
                        <div>
                            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Günlük Satış</div>
                            <div className="text-xl font-black text-slate-900 dark:text-white">₺24.500</div>
                        </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +18%
                    </div>
                </div>

                {/* Chart Visual (Simplified) */}
                <div className="h-24 relative mb-6">
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-lg" />
                    {/* Bars */}
                    <div className="flex items-end justify-between h-full px-2 pb-2">
                        {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                                className="w-[12%] rounded-t-sm bg-gradient-to-t from-emerald-500 to-teal-400 opacity-80"
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Canlı Veri</span>
                    </div>
                    <div className="flex -space-x-2">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-white/10" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Badge Left */}
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-4 top-12 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-white/10 shadow-lg flex items-center gap-2"
            >
                <div className="bg-blue-100 dark:bg-blue-500/10 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                    <Package size={14} />
                </div>
                <div className="text-[10px] font-bold">
                    <div className="text-slate-900 dark:text-white">Yeni Sipariş</div>
                    <div className="text-slate-500">2 dk önce</div>
                </div>
            </motion.div>

            {/* Floating Badge Right */}
            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-2 bottom-20 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-white/10 shadow-lg flex items-center gap-2"
            >
                <div className="bg-orange-100 dark:bg-orange-500/10 p-1.5 rounded-lg text-orange-600 dark:text-orange-400">
                    <TrendingUp size={14} />
                </div>
                <div className="text-[10px] font-bold">
                    <div className="text-slate-900 dark:text-white">Trend Yükselişte</div>
                </div>
            </motion.div>

        </motion.div>
    );
}

// ────────────────────────────────────────────
// MAIN HERO COMPONENT
// ────────────────────────────────────────────

export default function HeroNew({ texts = HOMEPAGE_TEXTS.hero }: { texts?: typeof HOMEPAGE_TEXTS.hero }) {
    const [mounted, setMounted] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const [analyzerFocused, setAnalyzerFocused] = useState(false);
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const router = useRouter();
    const sectionRef = useRef<HTMLElement>(null);

    // Mouse parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 25, stiffness: 150 };
    const mouseXSpring = useSpring(mouseX, springConfig);
    const mouseYSpring = useSpring(mouseY, springConfig);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    }, [mouseX, mouseY]);

    useEffect(() => {
        setMounted(true);
        // Using a short timeout fixes the React synchronous state update warning during render phase
        const timer = setTimeout(() => {
            const dismissed = localStorage.getItem('hero-announcement-dismissed');
            if (!dismissed) {
                setShowAnnouncement(true);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const dismissAnnouncement = useCallback(() => {
        setShowAnnouncement(false);
        localStorage.setItem('hero-announcement-dismissed', 'true');
    }, []);

    // Rotating words
    useEffect(() => {
        if (!mounted) return;
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % rotatingLogos.length);
        }, 2800);
        return () => clearInterval(interval);
    }, [mounted]);

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
        hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
        visible: {
            opacity: 1, y: 0, filter: "blur(0px)",
            transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const scaleIn: Variants = {
        hidden: { opacity: 0, scale: 0.85, filter: "blur(10px)" },
        visible: {
            opacity: 1, scale: 1, filter: "blur(0px)",
            transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
        },
    };

    return (
        <section
            ref={sectionRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen min-h-[100svh] flex items-center overflow-hidden bg-[#fafbfc] dark:bg-[#030712] transition-colors duration-700 selection:bg-emerald-500/20 overflow-x-hidden"
        >
            {/* ═══════════════════════════════════════════════ */}
            {/* BACKGROUND SYSTEM                              */}
            {/* ═══════════════════════════════════════════════ */}

            {/* Primary gradient mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Main aurora orb - top left */}
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1.1, 1],
                        opacity: [0.12, 0.22, 0.18, 0.12],
                        x: [0, 80, 30, 0],
                        y: [0, -50, 20, 0],
                    }}
                    transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[30%] -left-[15%] w-[70vw] h-[70vw] rounded-full will-change-transform"
                    style={{
                        background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(6,182,212,0.12) 40%, transparent 70%)",
                        filter: "blur(60px)",
                        transform: "translate3d(0,0,0)",
                    }}
                />
                {/* Secondary orb - bottom right */}
                <motion.div
                    animate={{
                        scale: [1.1, 1.4, 1.2, 1.1],
                        opacity: [0.08, 0.18, 0.12, 0.08],
                        x: [0, -60, -20, 0],
                        y: [0, 40, -30, 0],
                    }}
                    transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[25%] -right-[15%] w-[65vw] h-[65vw] rounded-full will-change-transform"
                    style={{
                        background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)",
                        filter: "blur(80px)",
                        transform: "translate3d(0,0,0)",
                    }}
                />
                {/* Tertiary orb - center */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.12, 0.05],
                        rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[15%] left-[40%] w-[50vw] h-[50vw] rounded-full will-change-transform"
                    style={{
                        background: "radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 60%)",
                        filter: "blur(90px)",
                        transform: "translate3d(0,0,0)",
                    }}
                />

                {/* Spotlight from top */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh]"
                    style={{
                        background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 100%)",
                    }}
                />
            </div>

            {/* Grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(rgba(100,116,139,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.5) 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                }}
            />

            {/* Noise texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Floating particles */}
            <FloatingParticles />

            {/* Radial vignette */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(3,7,18,0.15) 100%)",
                }}
            />

            {/* ═══════════════════════════════════════════════ */}
            {/* MAIN CONTENT                                   */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 sm:py-20 lg:py-28">

                {/* ────────────────────── TOP ANNOUNCEMENT ────────────────────── */}
                <AnimatePresence>
                    {showAnnouncement && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: "auto", filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, height: "auto", filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0, filter: "blur(6px)" }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="flex justify-center mb-10 sm:mb-14 lg:mb-16 relative z-30"
                        >
                            <div className="relative group p-[1px] rounded-full overflow-hidden transition-all duration-500 hover:scale-[1.02]">
                                {/* Revolving Gradient Border */}
                                <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_20%,#10b981_40%,#14b8a6_60%,transparent_80%)] animate-[spin_4s_linear_infinity] opacity-100 dark:opacity-75" />

                                <div className="relative flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl transition-colors duration-500 group-hover:bg-white/80 dark:group-hover:bg-slate-900/80 shadow-2xl shadow-emerald-500/10">
                                    <Link href="/features" className="flex items-center gap-3 sm:gap-4">
                                        {/* Premium Badge */}
                                        <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                            </span>
                                            <span className="text-[10px] sm:text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter sm:tracking-widest">Yeni</span>
                                        </div>

                                        <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                            {texts.badge}
                                        </span>

                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-emerald-500 transition-all duration-300">
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

                <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-14 xl:gap-20">

                    {/* ────────────────────── LEFT COLUMN ────────────────────── */}
                    <motion.div
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="flex-1 text-center lg:text-left w-full max-w-2xl lg:max-w-[640px]"
                    >
                        {/* Headline */}
                        <motion.h1
                            variants={fadeUp}
                            className="text-[2rem] xs:text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] xl:text-[4.5rem] font-black tracking-[-0.035em] leading-[1.08] text-slate-900 dark:text-white mb-5 sm:mb-7"
                        >
                            <span className="flex items-center gap-2 sm:gap-3 md:gap-4 justify-center lg:justify-start flex-wrap">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={wordIndex}
                                        initial={{ opacity: 0, y: 24, scale: 0.85, filter: "blur(10px)" }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: -24, scale: 0.85, filter: "blur(10px)" }}
                                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                        className="relative inline-flex items-center justify-center"
                                    >
                                        {/* Brand glow */}
                                        <span
                                            className="absolute inset-0 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl opacity-60 transition-colors duration-500"
                                            style={{ backgroundColor: rotatingLogos[wordIndex].glow }}
                                        />
                                        {/* Gradient border wrapper */}
                                        <span className={`relative inline-flex items-center justify-center w-[110px] sm:w-[140px] md:w-[160px] h-[44px] sm:h-[52px] md:h-[64px] rounded-xl sm:rounded-2xl bg-gradient-to-br ${rotatingLogos[wordIndex].accent} transition-colors duration-500`}>
                                            <span className="inline-flex items-center justify-center w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-lg sm:rounded-[14px] bg-white dark:bg-[#0c1222] relative">
                                                <Image
                                                    src={rotatingLogos[wordIndex].image}
                                                    alt={rotatingLogos[wordIndex].name}
                                                    width={40}
                                                    height={40}
                                                    className="h-[20px] sm:h-[24px] md:h-[28px] w-auto max-w-[80%] object-contain select-none"
                                                />
                                            </span>
                                        </span>
                                    </motion.span>
                                </AnimatePresence>
                                <span>{texts.titlePrefix}</span>
                            </span>
                            <span className="block mt-1">
                                {texts.titleSuffix}
                            </span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            variants={fadeUp}
                            className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed"
                        >
                            {texts.subtitlePrefix}
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                {texts.subtitleHighlight}
                            </span>
                            {texts.subtitleSuffix}
                        </motion.p>

                        {/* Analyzer Input Bar */}
                        <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
                            <div className={`relative group max-w-xl mx-auto lg:mx-0 transition-all duration-500 ${analyzerFocused ? 'scale-[1.01]' : ''}`}>
                                {/* Glow ring */}
                                <div className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-cyan-500/60 transition-opacity duration-500 blur-sm ${analyzerFocused ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'}`} />
                                <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-opacity duration-500 ${analyzerFocused ? 'opacity-30' : 'opacity-0 group-hover:opacity-15'}`} />

                                <div className="relative flex items-center bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-black/20 p-1.5 sm:p-2">
                                    <Search className="text-slate-400 ml-3 sm:ml-4 shrink-0" size={20} />
                                    <input
                                        type="text"
                                        placeholder={texts.analyzerPlaceholder}
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setAnalyzerFocused(true)}
                                        onBlur={() => setAnalyzerFocused(false)}
                                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white text-sm sm:text-base px-3 sm:px-4 py-2.5 sm:py-3 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="relative overflow-hidden px-5 sm:px-7 py-2.5 sm:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 flex items-center gap-2 group/btn"
                                    >
                                        <Sparkles size={15} className="group-hover/btn:rotate-12 transition-transform" />
                                        <span className="hidden sm:inline">{texts.analyzerButton}</span>
                                        <span className="sm:hidden">Analiz</span>
                                        {/* Shimmer */}
                                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    </button>
                                </div>

                                <p className="mt-3 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 text-center lg:text-left">
                                    {texts.analyzerNote}
                                </p>
                            </div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8"
                        >
                            <MagneticButton distance={0.2} className="w-full sm:w-auto">
                                <Link
                                    href="/signup"
                                    className="group relative w-full sm:w-auto overflow-hidden px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-2xl shadow-emerald-600/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5"
                                >
                                    Ücretsiz Başla
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    {/* Shimmer overlay */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                                </Link>
                            </MagneticButton>

                            <MagneticButton distance={0.2} className="w-full sm:w-auto">
                                <button className="group w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-slate-900/5 dark:shadow-none">
                                    <div className="relative">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                            <Play size={14} fill="currentColor" className="text-emerald-600 dark:text-emerald-400 ml-0.5" />
                                        </span>
                                    </div>
                                    Demo İzle
                                </button>
                            </MagneticButton>
                        </motion.div>


                        {/* Mobile Visual (Visible only on mobile) */}
                        <MobileHeroVisual />

                        {/* Trust badges */}
                        <motion.div
                            variants={fadeUp}
                            className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start"
                        >
                            {trustBadges.map((badge, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                                    <badge.icon size={13} className="text-emerald-500/70" />
                                    <span>{badge.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* ────────────────────── RIGHT COLUMN ────────────────────── */}
                    <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        className="flex-1 relative w-full max-w-[560px] xl:max-w-[640px] hidden lg:block"
                        style={{ perspective: "1800px" }}
                    >
                        <motion.div
                            style={{
                                rotateX,
                                rotateY,
                                transformStyle: "preserve-3d",
                            }}
                            className="relative z-10 w-full"
                        >
                            {/* ── Dashboard Card ── */}
                            <div className="relative bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] rounded-[28px] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.12)] dark:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)] overflow-hidden">
                                {/* Subtle gradient border glow */}
                                <div className="absolute inset-0 rounded-[28px] p-px bg-gradient-to-b from-white/20 dark:from-white/[0.06] to-transparent pointer-events-none" />

                                {/* Window chrome */}
                                <div className="flex items-center h-11 px-5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
                                    <div className="flex gap-[7px]">
                                        <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57] shadow-inner" />
                                        <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E] shadow-inner" />
                                        <div className="w-[11px] h-[11px] rounded-full bg-[#28C840] shadow-inner" />
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="flex items-center gap-2 px-4 py-1 bg-slate-100/80 dark:bg-white/[0.04] rounded-lg">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            </div>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">app.pazaryonetimi.com</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-40">
                                        <Layers size={12} className="text-slate-400" />
                                        <Globe size={12} className="text-slate-400" />
                                    </div>
                                </div>

                                {/* Dashboard content */}
                                <div className="p-5 sm:p-6 space-y-5">
                                    {/* Greeting & quick stats */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest mb-0.5">Dashboard</div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Genel Bakış</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <Activity size={10} />
                                                Canlı
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Aylık Gelir", value: "₺241K", change: "+18%", gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/[0.08] dark:to-teal-500/[0.08]", border: "border-emerald-500/15", textColor: "text-emerald-600 dark:text-emerald-400", icon: TrendingUp },
                                            { label: "Siparişler", value: "1,284", change: "+24%", gradient: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/[0.08] dark:to-indigo-500/[0.08]", border: "border-blue-500/15", textColor: "text-blue-600 dark:text-blue-400", icon: Package },
                                            { label: "ROI", value: "%312", change: "+7%", gradient: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/[0.08] dark:to-pink-500/[0.08]", border: "border-purple-500/15", textColor: "text-purple-600 dark:text-purple-400", icon: BarChart3 },
                                        ].map((m, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8, delay: 1.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                                                className={`p-3.5 rounded-2xl bg-gradient-to-br ${m.gradient} border ${m.border} group/metric cursor-default`}
                                            >
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <m.icon size={12} className={m.textColor} />
                                                    <span className={`text-[9px] font-bold uppercase tracking-[0.08em] ${m.textColor} opacity-70`}>{m.label}</span>
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{m.value}</span>
                                                    <span className={`text-[10px] font-bold ${m.textColor} mb-0.5`}>{m.change}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Chart section */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 1, delay: 1.8 }}
                                        className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]"
                                    >
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                                    <Zap size={16} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">Büyüme Trendi</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500">12 aylık performans</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                <TrendingUp size={10} className="text-emerald-500" />
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+42%</span>
                                            </div>
                                        </div>

                                        {/* SVG Chart */}
                                        <div className="h-32 relative">
                                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                                                <defs>
                                                    <linearGradient id="heroChartGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="rgb(16,185,129)" stopOpacity="0.3" />
                                                        <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0" />
                                                    </linearGradient>
                                                    <linearGradient id="heroLineGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="rgb(16,185,129)" />
                                                        <stop offset="50%" stopColor="rgb(20,184,166)" />
                                                        <stop offset="100%" stopColor="rgb(6,182,212)" />
                                                    </linearGradient>
                                                </defs>
                                                {/* Area fill */}
                                                <motion.path
                                                    d={chartAreaPath}
                                                    fill="url(#heroChartGradient)"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 1.5, delay: 2.2 }}
                                                />
                                                {/* Line */}
                                                <motion.path
                                                    d={chartPath}
                                                    fill="none"
                                                    stroke="url(#heroLineGradient)"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 2, delay: 2, ease: "easeOut" }}
                                                />
                                                {/* Pulse dot at end */}
                                                <motion.circle
                                                    cx="100"
                                                    cy="5"
                                                    r="2.5"
                                                    fill="rgb(16,185,129)"
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.5, delay: 4 }}
                                                />
                                                <motion.circle
                                                    cx="100"
                                                    cy="5"
                                                    r="2.5"
                                                    fill="rgb(16,185,129)"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: [0, 0.5, 0], r: [2.5, 6, 2.5] }}
                                                    transition={{ duration: 2, delay: 4.5, repeat: Infinity }}
                                                />
                                            </svg>
                                        </div>

                                        {/* Mini marketplace row */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/60 dark:border-white/[0.04]">
                                            <div className="flex items-center -space-x-2">
                                                {marketplaceLogos.slice(0, 5).map((logo, i) => (
                                                    <motion.div
                                                        key={logo.name}
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.5, delay: 3 + i * 0.1 }}
                                                        className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center overflow-hidden shadow-sm relative"
                                                    >
                                                        <Image src={logo.image} alt={logo.name} width={16} height={16} className="w-4 h-4 object-contain" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                6 pazaryeri bağlı
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* ── Floating notification cards ── */}
                            <FloatingNotification delay={0} />
                            <FloatingOrderNotification delay={0} />

                            {/* ── Orbiting marketplace logos ── */}
                            {marketplaceLogos.slice(0, 6).map((logo, i) => {
                                const angle = (i / 6) * 360;
                                const radiusX = 290;
                                const radiusY = 240;
                                return (
                                    <motion.div
                                        key={logo.name}
                                        className="absolute top-1/2 left-1/2 z-20 pointer-events-none"
                                        animate={{
                                            rotate: [angle, angle + 360],
                                        }}
                                        transition={{
                                            duration: 60,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        style={{
                                            width: 0,
                                            height: 0,
                                            transformOrigin: "0 0",
                                        }}
                                    >
                                        <motion.div
                                            animate={{
                                                rotate: [-(angle), -(angle + 360)],
                                            }}
                                            transition={{
                                                duration: 60,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                            style={{
                                                position: "absolute",
                                                left: radiusX * Math.cos(angle * Math.PI / 180) - 24,
                                                top: radiusY * Math.sin(angle * Math.PI / 180) - 24,
                                            }}
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-xl flex items-center justify-center p-2.5 hover:scale-125 transition-transform duration-300 pointer-events-auto cursor-pointer group relative">
                                                <Image src={logo.image} alt={logo.name} fill className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity p-2.5" />
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
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
