"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
    Star, ArrowLeft, Sparkles, Play
} from 'lucide-react';

interface SolutionData {
    title: string;
    heroTitle: string;
    heroSubtitle: string;
    gradient: string;
    icon: string;
    stats: { label: string; value: string }[];
    features: { title: string; description: string; icon: string }[];
    benefits: string[];
    testimonial?: { quote: string; author: string; company: string; avatar: string };
    faq: { q: string; a: string }[];
}

export default function SolutionDetailView({ solution }: { solution: SolutionData }) {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 pt-24">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-[0.04] dark:opacity-[0.08]`} />
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    {/* Breadcrumb */}
                    <Link href="/solutions" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-8">
                        <ArrowLeft size={14} />
                        Çözümlere Dön
                    </Link>

                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="text-5xl mb-6 block">{solution.icon}</span>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight whitespace-pre-line">
                                {solution.heroTitle}
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                {solution.heroSubtitle}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex flex-wrap gap-4 mt-10"
                        >
                            <Link
                                href="/demo"
                                className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r ${solution.gradient} text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all`}
                            >
                                Ücretsiz Demo
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                            >
                                Fiyatları İncele
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
                        {solution.stats.map((stat, i) => (
                            <div key={i} className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] shadow-sm">
                                <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${solution.gradient} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                            Öne Çıkan Özellikler
                        </h2>
                        <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {solution.title} sektörüne özel geliştirilen araçlar ve özellikler
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {solution.features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] hover:shadow-lg hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
                            >
                                <span className="text-3xl mb-4 block">{feature.icon}</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Benefits ── */}
            <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                Neden {solution.title}?
                            </h2>
                            <p className="mt-4 text-slate-600 dark:text-slate-400">
                                Pazaryonetimi ile elde edeceğiniz avantajlar
                            </p>
                        </div>

                        <div className="space-y-4">
                            {solution.benefits.map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.3 }}
                                    className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06]"
                                >
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${solution.gradient} flex items-center justify-center shrink-0`}>
                                        <CheckCircle2 size={16} className="text-white" />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Testimonial ── */}
            {solution.testimonial && (
                <section className="py-20 md:py-32">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="flex justify-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <blockquote className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white leading-relaxed italic">
                                &ldquo;{solution.testimonial.quote}&rdquo;
                            </blockquote>
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${solution.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                                    {solution.testimonial.avatar}
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-slate-900 dark:text-white">{solution.testimonial.author}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{solution.testimonial.company}</div>
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
                                Sıkça Sorulan Sorular
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {solution.faq.map((item, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-5 text-left"
                                    >
                                        <span className="font-semibold text-slate-900 dark:text-white pr-4">{item.q}</span>
                                        {openFaq === i ? (
                                            <ChevronUp size={18} className="text-slate-400 shrink-0" />
                                        ) : (
                                            <ChevronDown size={18} className="text-slate-400 shrink-0" />
                                        )}
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-5 pb-5">
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${solution.gradient} p-10 md:p-16 text-center`}>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')] opacity-50" />
                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {solution.title} Çözümünü Deneyin
                            </h2>
                            <p className="text-white/80 max-w-xl mx-auto mb-8">
                                14 gün ücretsiz deneme ile tüm özelliklere erişin. Kredi kartı gerekmez.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    href="/demo"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    Ücretsiz Başla
                                    <ArrowRight size={18} />
                                </Link>
                                <Link
                                    href="/iletisim"
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
                                >
                                    Bize Ulaşın
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
