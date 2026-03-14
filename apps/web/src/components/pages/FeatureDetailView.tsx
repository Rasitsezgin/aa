"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
    Star, ArrowLeft, Sparkles, Play, LucideIcon
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface FeatureData {
    title: string;
    heroTitle: string;
    heroSubtitle: string;
    gradient: string;
    icon: React.ElementType | string;
    stats: { label: string; value: string }[];
    features: { title: string; description: string; icon: React.ElementType | string }[];
    benefits: string[];
    testimonial?: { quote: string; author: string; company: string; avatar: string };
    faq: { q: string; a: string }[];
}

export default function FeatureDetailView({ feature }: { feature: FeatureData }) {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const resolveIcon = (icon: React.ElementType | string): LucideIcon | null => {
        if (typeof icon !== 'string') return icon as LucideIcon;
        const key = icon as keyof typeof LucideIcons;
        return (LucideIcons[key] as unknown as LucideIcon) || null;
    };

    const Icon = resolveIcon(feature.icon);

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-[0.04] dark:opacity-[0.08]`} />
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    {/* Breadcrumb */}
                    <Link href="/features" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8">
                        <ArrowLeft size={14} />
                        Özelliklere Dön
                    </Link>

                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="mb-6">
                                {Icon ? (
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-xl`}>
                                        {React.createElement(Icon, { size: 32 })}
                                    </div>
                                ) : (
                                    <span className="text-6xl block">{String(feature.icon)}</span>
                                )}
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight whitespace-pre-line">
                                {feature.heroTitle}
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                {feature.heroSubtitle}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex flex-wrap gap-4 mt-10"
                        >
                            <Link
                                href="/signup"
                                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r ${feature.gradient} text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
                            >
                                Ücretsiz Başla
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/demo"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                            >
                                Demo Talep Et
                            </Link>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
                    >
                        {feature.stats.map((stat, i) => (
                            <div key={i} className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] shadow-sm">
                                <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Detailed Features ── */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            Neler Sunuyoruz?
                        </h2>
                        <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {feature.title} kapsamında sunduğumuz gelişmiş araçlar ve yetenekler
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {feature.features.map((item, i) => {
                            const ItemIcon = resolveIcon(item.icon);
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.4 }}
                                    className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] hover:shadow-2xl hover:border-slate-200 dark:hover:border-white/10 transition-all duration-500 hover:-translate-y-2"
                                >
                                    <div className="mb-6">
                                        {ItemIcon ? (
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                {React.createElement(ItemIcon, { size: 24 })}
                                            </div>
                                        ) : (
                                            <span className="text-4xl block group-hover:scale-110 transition-transform">{String(item.icon)}</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Benefits ── */}
            <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                Temel Avantajlar
                            </h2>
                            <p className="mt-4 text-slate-600 dark:text-slate-400">
                                İşletmeniz için somut faydalar
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {feature.benefits.map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.3 }}
                                    className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] shadow-sm"
                                >
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center shrink-0`}>
                                        <CheckCircle2 size={16} className="text-white" />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Testimonial ── */}
            {feature.testimonial && (
                <section className="py-20 md:py-32">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="flex justify-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <blockquote className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white leading-relaxed italic">
                                &ldquo;{feature.testimonial.quote}&rdquo;
                            </blockquote>
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                    {feature.testimonial.avatar}
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-slate-900 dark:text-white">{feature.testimonial.author}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{feature.testimonial.company}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── FAQ ── */}
            <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                Merak Edilenler
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {feature.faq.map((item, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] overflow-hidden transition-all duration-300 hover:shadow-md"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <span className="font-bold text-slate-900 dark:text-white pr-4">{item.q}</span>
                                        {openFaq === i ? (
                                            <ChevronUp size={20} className="text-blue-500 shrink-0" />
                                        ) : (
                                            <ChevronDown size={20} className="text-slate-400 shrink-0" />
                                        )}
                                    </button>
                                    <motion.div
                                        initial={false}
                                        animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 pt-2">
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className={`relative overflow-hidden rounded-[3rem] bg-gradient-to-br ${feature.gradient} p-10 md:p-20 text-center shadow-2xl shadow-blue-500/10`}>
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGh2NjBMMCB6IiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-20" />
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

                        <div className="relative">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                                {feature.title} ile<br />İşinizi Büyütün
                            </h2>
                            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                                Hemen bugün başlayın, karmaşık süreçleri otomatize edin ve rakiplerinizin önüne geçin.
                            </p>
                            <div className="flex flex-wrap justify-center gap-5">
                                <Link
                                    href="/signup"
                                    className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg shadow-xl hover:shadow-white/20 hover:-translate-y-1 transition-all"
                                >
                                    Hemen Başla
                                    <ArrowRight size={22} />
                                </Link>
                                <Link
                                    href="/iletisim"
                                    className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white/10 text-white font-bold text-lg border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all"
                                >
                                    Bize Yazın
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
