"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight, Book, CheckCircle2, ChevronRight, Clock, Copy, Check,
    HelpCircle, Layers, Plug, Shield, Star, Zap, ExternalLink,
} from 'lucide-react';
import {
    integrations,
    categoryMeta,
    type Integration,
} from '@/components/landing/integrations-data';
import {
    setupStepsByCategory,
    getFaqs,
    getSyncEndpoints,
    getCredentialExample,
} from './integration-doc-content';

function DocLogo({ item }: { item: Integration }) {
    const [failed, setFailed] = useState(false);
    const isImage = item.logo.startsWith('/') && !failed;
    const initials = item.logo.length <= 3 && !item.logo.startsWith('/')
        ? item.logo
        : item.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ring-2 ring-white/30 overflow-hidden shrink-0`}
            style={!isImage ? { backgroundColor: item.color } : undefined}
        >
            {isImage ? (
                <img src={item.logo} alt={item.name} className="w-full h-full object-contain p-2 bg-white" onError={() => setFailed(true)} />
            ) : (
                <span className="font-black text-white text-lg">{initials}</span>
            )}
        </div>
    );
}

const sections = [
    { id: 'overview', label: 'Genel Bakış' },
    { id: 'setup', label: 'Kurulum' },
    { id: 'features', label: 'Özellikler' },
    { id: 'api', label: 'API & Senkron' },
    { id: 'requirements', label: 'Gereksinimler' },
    { id: 'faq', label: 'SSS' },
];

export default function IntegrationDocPage({ integration }: { integration: Integration }) {
    const [copied, setCopied] = useState(false);
    const categoryName = categoryMeta.find((c) => c.id === integration.category)?.name ?? '';
    const setupSteps = setupStepsByCategory[integration.category] ?? setupStepsByCategory.pazaryeri;
    const faqs = getFaqs(integration);
    const endpoints = getSyncEndpoints(integration);
    const credentialJson = getCredentialExample(integration);

    const related = integrations
        .filter((i) => i.category === integration.category && i.id !== integration.id)
        .slice(0, 5);

    const copyCode = async () => {
        await navigator.clipboard.writeText(credentialJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0B1120] pt-[calc(4.5rem+env(safe-area-inset-top,0px))]">
            {/* Hero */}
            <div className={`relative overflow-hidden border-b border-slate-200/60 dark:border-white/10 bg-gradient-to-br ${integration.gradient}`}>
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
                    <nav className="flex items-center gap-2 text-sm text-white/75 mb-8 flex-wrap">
                        <Link href="/entegrasyonlar" className="hover:text-white transition-colors">Entegrasyonlar</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/docs/api" className="hover:text-white transition-colors">Dokümantasyon</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white font-semibold">{integration.name}</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                        <DocLogo item={integration} />
                        <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">{categoryName} · Dokümantasyon</p>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
                                {integration.name} Entegrasyonu
                            </h1>
                            <p className="text-white/85 text-base sm:text-lg max-w-2xl leading-relaxed">{integration.shortDesc}</p>
                            <div className="flex flex-wrap gap-3 mt-6">
                                {[
                                    { icon: Clock, label: integration.setupTime },
                                    { icon: Star, label: `${integration.rating} puan` },
                                    { icon: Shield, label: integration.stats.uptime },
                                    { icon: Zap, label: integration.stats.syncTime },
                                ].map(({ icon: Icon, label }) => (
                                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-sm font-medium backdrop-blur-sm">
                                        <Icon className="w-3.5 h-3.5" />{label}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold hover:bg-orange-50 transition-colors shadow-xl"
                            >
                                <Plug className="w-4 h-4" /> Bağlan
                            </Link>
                            <Link
                                href="/docs/api"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/15 text-white font-semibold border border-white/25 hover:bg-white/25 transition-colors backdrop-blur-sm"
                            >
                                <Book className="w-4 h-4" /> API Referansı
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
                {/* Mobil: yatay içindekiler */}
                <div className="lg:hidden sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-20 -mx-4 px-4 py-3 mb-6 bg-[#FAFAF9]/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200/60 dark:border-white/10">
                    <div className="flex gap-2 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-orange-300 hover:text-orange-600 transition-colors"
                            >
                                {s.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
                    {/* Sidebar — sabit genişlik, içerik yanında */}
                    <aside className="hidden lg:block w-52 shrink-0">
                        <div className="sticky top-[calc(5rem+env(safe-area-inset-top,0px))] space-y-6 pr-2">
                            <nav className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">İçindekiler</p>
                                {sections.map((s) => (
                                    <a
                                        key={s.id}
                                        href={`#${s.id}`}
                                        className="block px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    >
                                        {s.label}
                                    </a>
                                ))}
                            </nav>

                            {related.length > 0 && (
                                <div className="pt-4 border-t border-slate-200/60 dark:border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">İlgili</p>
                                    <div className="space-y-0.5">
                                        {related.map((r) => (
                                            <Link
                                                key={r.id}
                                                href={r.documentation}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors truncate"
                                            >
                                                <Layers className="w-3 h-3 text-orange-500 shrink-0" />
                                                <span className="truncate">{r.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* İçerik — kalan alanı doldurur */}
                    <div className="flex-1 min-w-0 w-full space-y-12">
                        <section id="overview">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Genel Bakış</h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px] mb-6">{integration.desc}</p>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {[
                                    { label: 'Aktif kullanıcı', value: integration.stats.users },
                                    { label: 'Değerlendirme', value: `${integration.rating} / 5` },
                                    { label: 'Fiyatlandırma', value: integration.price },
                                ].map((stat) => (
                                    <div key={stat.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/10">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section id="setup">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Kurulum Adımları</h2>
                            <div className="space-y-4">
                                {setupSteps.map((step, i) => (
                                    <motion.div
                                        key={step.title}
                                        initial={{ opacity: 0, x: -8 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/10"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-md shadow-orange-500/20">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{step.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/50">
                                    <span className="text-xs font-mono text-slate-400">credentials.json örneği</span>
                                    <button
                                        type="button"
                                        onClick={copyCode}
                                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Kopyalandı' : 'Kopyala'}
                                    </button>
                                </div>
                                <pre className="p-4 overflow-x-auto text-sm text-emerald-400 font-mono leading-relaxed">
                                    <code>{credentialJson}</code>
                                </pre>
                            </div>
                        </section>

                        <section id="features">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Özellikler</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {integration.features.map((f) => (
                                    <div key={f} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/10">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section id="api">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">API & Senkronizasyon</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                {integration.name} kanalı için Pazaryönetimi REST API uç noktaları. Tam referans için{' '}
                                <Link href="/docs/api" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">API dokümantasyonuna</Link> bakın.
                            </p>
                            <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 overflow-hidden">
                                {endpoints.map((ep, i) => (
                                    <div
                                        key={ep.path}
                                        className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3.5 ${i > 0 ? 'border-t border-slate-100 dark:border-white/10' : ''} bg-white dark:bg-slate-900/40`}
                                    >
                                        <span className={`shrink-0 w-14 text-center text-[10px] font-black uppercase px-2 py-1 rounded-md ${ep.method === 'GET' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : ep.method === 'POST' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'}`}>
                                            {ep.method}
                                        </span>
                                        <code className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 flex-1">{ep.path}</code>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 sm:text-right">{ep.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section id="requirements">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Gereksinimler</h2>
                            <ul className="space-y-3">
                                {integration.requirements.map((req) => (
                                    <li key={req} className="flex items-start gap-3 p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100/60 dark:border-orange-500/15">
                                        <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section id="faq">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <HelpCircle className="w-6 h-6 text-orange-500" /> Sık Sorulan Sorular
                            </h2>
                            <div className="space-y-4">
                                {faqs.map((faq) => (
                                    <details
                                        key={faq.q}
                                        className="group p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/10 open:border-orange-200 dark:open:border-orange-500/25 transition-colors"
                                    >
                                        <summary className="font-bold text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between gap-4">
                                            {faq.q}
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
                                        </summary>
                                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                                    </details>
                                ))}
                            </div>
                        </section>

                        {/* CTA */}
                        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 p-8 sm:p-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{integration.name}&apos;ı bağlamaya hazır mısınız?</h3>
                                <p className="text-slate-300 text-sm max-w-md">14 gün ücretsiz deneyin. Kurulum desteği dahil.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                                <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-orange-700 font-bold hover:bg-orange-50 transition-colors">
                                    Ücretsiz Başla <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link href="/destek" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors">
                                    <ExternalLink className="w-4 h-4" /> Destek
                                </Link>
                            </div>
                        </div>

                        {/* Mobil: ilgili entegrasyonlar */}
                        {related.length > 0 && (
                            <div className="lg:hidden pt-4 border-t border-slate-200/60 dark:border-white/10">
                                <p className="text-xs font-bold text-slate-500 mb-3">İlgili entegrasyonlar</p>
                                <div className="flex flex-wrap gap-2">
                                    {related.map((r) => (
                                        <Link
                                            key={r.id}
                                            href={r.documentation}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-orange-300 transition-colors"
                                        >
                                            <Layers className="w-3 h-3 text-orange-500" />
                                            {r.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
