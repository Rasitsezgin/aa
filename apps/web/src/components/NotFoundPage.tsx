"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Home, ArrowRight, Plug, Package, Unplug, Layers,
    HelpCircle, Search, RefreshCw,
} from 'lucide-react';

const quickLinks = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/entegrasyonlar', label: 'Entegrasyonlar', icon: Layers },
    { href: '/pricing', label: 'Fiyatlandırma', icon: Package },
    { href: '/destek', label: 'Yardım Merkezi', icon: HelpCircle },
];

const orbitBrands = [
    { label: 'TY', color: '#F27A1A' },
    { label: 'HB', color: '#FF6000' },
    { label: 'AMZ', color: '#FF9900' },
    { label: 'N11', color: '#A3248C' },
];

export default function NotFoundPage() {
    return (
        <main className="relative min-h-screen bg-[#FAFAF9] dark:bg-[#0B1120] pt-[calc(4.5rem+env(safe-area-inset-top,0px))] pb-20 overflow-hidden">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-transparent to-transparent dark:from-orange-950/25" />
                <div
                    className="absolute inset-0 opacity-[0.3] dark:opacity-[0.1]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)',
                        backgroundSize: '56px 56px',
                        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)',
                    }}
                />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-orange-400/12 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-orange-200/60 dark:border-orange-500/20 text-orange-700 dark:text-orange-300 text-xs font-bold mb-8 shadow-sm backdrop-blur-sm"
                >
                    <Unplug className="w-3.5 h-3.5" />
                    Bağlantı koptu · Sayfa senkronize değil
                </motion.div>

                {/* Illustration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.5 }}
                    className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto mb-10"
                >
                    <div className="absolute inset-0 rounded-full border border-dashed border-orange-300/40 dark:border-orange-500/20 animate-[spin_90s_linear_infinite]" />
                    <div className="absolute inset-[18%] rounded-full border border-orange-200/30 dark:border-orange-500/10" />
                    <div className="absolute inset-[32%] rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/10 blur-xl" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <span className="absolute -inset-6 text-[7rem] sm:text-[8rem] font-black text-orange-500/[0.07] dark:text-orange-400/[0.08] select-none leading-none">
                                404
                            </span>
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[1.75rem] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-xl ring-4 ring-white/50 dark:ring-white/10">
                                <Unplug className="w-11 h-11 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {orbitBrands.map((brand, i) => {
                        const angle = (i / orbitBrands.length) * 360 - 90;
                        return (
                            <motion.div
                                key={brand.label}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.07 }}
                                className="absolute left-1/2 top-1/2 [--orbit:5.5rem] sm:[--orbit:6.25rem]"
                                style={{
                                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * var(--orbit))) rotate(-${angle}deg)`,
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg ring-2 ring-white/30 dark:ring-white/10"
                                    style={{ backgroundColor: brand.color }}
                                >
                                    {brand.label}
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Broken sync line */}
                    <div className="absolute top-1/2 left-[12%] right-[12%] flex items-center justify-center gap-2 pointer-events-none">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-orange-400/50" />
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-orange-400/50" />
                    </div>
                </motion.div>

                {/* Copy */}
                <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-5"
                >
                    Bu sayfa{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
                        bulunamadı
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-10"
                >
                    Aradığınız kanal henüz senkronize edilmemiş olabilir. URL&apos;yi kontrol edin veya aşağıdaki bağlantılardan devam edin.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold hover:shadow-xl hover:shadow-orange-500/25 transition-all w-full sm:w-auto"
                    >
                        <Home className="w-4 h-4" />
                        Ana Sayfaya Dön
                    </Link>
                    <Link
                        href="/entegrasyonlar"
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 font-semibold hover:border-orange-300 dark:hover:border-orange-500/30 transition-all w-full sm:w-auto"
                    >
                        <Plug className="w-4 h-4 text-orange-500" />
                        Entegrasyonları Keşfet
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Quick links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
                >
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 hover:border-orange-200 dark:hover:border-orange-500/25 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <link.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{link.label}</span>
                        </Link>
                    ))}
                </motion.div>

                {/* Search hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="mt-10 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
                >
                    <Search className="w-4 h-4 text-orange-500" />
                    Yanlışlıkla mı geldiniz?{' '}
                    <Link href="/faq" className="font-semibold text-orange-600 dark:text-orange-400 hover:underline">
                        SSS sayfasına göz atın
                    </Link>
                </motion.p>
            </div>
        </main>
    );
}
