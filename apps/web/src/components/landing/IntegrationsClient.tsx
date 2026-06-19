"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import {
    Search, ArrowRight, Zap, Star, Clock, Users, Plug, X,
    CheckCircle2, Shield, ExternalLink, Sparkles, RefreshCw,
    Package, ShoppingCart, FileText, ChevronRight,
} from 'lucide-react';
import {
    integrations as fallbackIntegrations,
    categoryMeta,
    type Integration,
    type CategoryId,
} from './integrations-data';
import MarketingPageShell from '@/components/landing/MarketingPageShell';

type IntegrationsClientProps = {
    initialIntegrations?: Integration[];
};

// ─── Logo ─────────────────────────────────────────────
function IntegrationLogo({ item, size = 'md' }: { item: Integration; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
    const [imgFailed, setImgFailed] = useState(false);
    const dims = {
        sm: 'w-10 h-10 text-xs',
        md: 'w-14 h-14 text-base',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-20 h-20 text-xl',
    };
    const isImage = item.logo.startsWith('/') && !imgFailed;
    const initials = item.logo.length <= 3 && !item.logo.startsWith('/')
        ? item.logo
        : item.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div
            className={`${dims[size]} rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg shadow-black/10 overflow-hidden shrink-0 ring-2 ring-white/30 dark:ring-white/10`}
            style={!isImage ? { backgroundColor: item.color } : undefined}
        >
            {isImage ? (
                <img
                    src={item.logo}
                    alt={item.name}
                    className="w-full h-full object-contain p-2 bg-white"
                    onError={() => setImgFailed(true)}
                />
            ) : (
                <span className="font-black text-white tracking-tight drop-shadow-sm">{initials}</span>
            )}
        </div>
    );
}

// ─── Spotlight card wrapper ───────────────────────────
function SpotlightCard({ children, className = '', onClick }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMove}
            onClick={onClick}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm transition-shadow duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-200/80 dark:hover:border-orange-500/25 ${className}`}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                style={{
                    background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(234,88,12,0.12), transparent 70%)`,
                }}
            />
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
}

// ─── Integration card ───────────────────────────────
function IntegrationCard({ item, onSelect }: { item: Integration; onSelect: (item: Integration) => void }) {
    const categoryName = categoryMeta.find((c) => c.id === item.category)?.name ?? '';

    return (
        <motion.article layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
            <SpotlightCard onClick={() => onSelect(item)} className="flex flex-col h-full cursor-pointer">
                <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-gradient-to-b ${item.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${item.gradient} opacity-[0.06] group-hover:opacity-[0.12] blur-3xl transition-opacity pointer-events-none`} />

                <div className="p-6 pl-7 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-3 mb-5">
                        <IntegrationLogo item={item} />
                        <div className="flex flex-col items-end gap-1.5">
                            {item.isPopular && (
                                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-300 rounded-full border border-orange-200/60 dark:border-orange-500/20">
                                    Popüler
                                </span>
                            )}
                            {item.isNew && (
                                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
                                    Yeni
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">{categoryName}</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors tracking-tight">
                        {item.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed flex-1">
                        {item.shortDesc}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-5">
                        {item.features.slice(0, 3).map((f) => (
                            <span key={f} className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg">
                                {f}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100/80 dark:border-white/10">
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{item.rating}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.setupTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${item.price === 'Ücretsiz' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'}`}>
                                {item.price}
                            </span>
                            <Link
                                href={`/entegrasyonlar/${item.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-gradient-to-br group-hover:from-orange-600 group-hover:to-amber-500 group-hover:text-white transition-all duration-300"
                                aria-label={`${item.name} detay`}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </SpotlightCard>
        </motion.article>
    );
}

// ─── Featured popular card ────────────────────────────
function FeaturedStat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
    return (
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-2.5">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/55 mb-0.5">
                <Icon size={11} />{label}
            </div>
            <div className="text-sm font-black text-white">{value}</div>
        </div>
    );
}

function FeaturedCard({ item, rank, onSelect }: { item: Integration; rank: number; onSelect: (item: Integration) => void }) {
    const isHero = rank === 0;
    const categoryName = categoryMeta.find((c) => c.id === item.category)?.name ?? '';
    const featureCount = isHero ? 4 : 3;

    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: rank * 0.08 }}
            onClick={() => onSelect(item)}
            className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl text-left transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${isHero ? 'md:col-span-2 md:row-span-2 min-h-0 md:min-h-0' : 'min-h-0'}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.28),transparent_45%)]" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />

            <div className={`relative flex h-full ${isHero ? 'flex-col md:flex-row' : 'flex-col'}`}>
                {/* Sol / ana içerik */}
                <div className={`flex flex-col flex-1 p-6 md:p-7 ${isHero ? 'md:pr-4' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-5">
                        <IntegrationLogo item={item} size={isHero ? 'xl' : 'lg'} />
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/20 text-white rounded-full">
                                Popüler
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${item.price === 'Ücretsiz' ? 'bg-emerald-400/25 text-emerald-100' : 'bg-white/20 text-white'}`}>
                                {item.price}
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-black text-white/50 rounded-full border border-white/15">#{rank + 1}</span>
                        </div>
                    </div>

                    <p className="text-white/65 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{categoryName}</p>
                    <h3 className={`font-black text-white tracking-tight leading-tight ${isHero ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                        {item.name}
                    </h3>
                    <p className={`text-white/85 mt-2 leading-relaxed ${isHero ? 'text-sm md:text-[15px] line-clamp-3' : 'text-sm line-clamp-2'}`}>
                        {item.shortDesc}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                        {item.features.slice(0, featureCount).map((f) => (
                            <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-white/15 backdrop-blur-sm text-white/95 rounded-lg border border-white/10">
                                <CheckCircle2 size={10} className="text-white/70 shrink-0" />
                                {f}
                            </span>
                        ))}
                    </div>

                    <div className={`grid gap-2 mt-5 ${isHero ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                        <FeaturedStat label="Satıcı" value={item.stats.users} icon={Users} />
                        <FeaturedStat label="Puan" value={`${item.rating} / 5`} icon={Star} />
                        <FeaturedStat label="Kurulum" value={item.setupTime} icon={Clock} />
                        {isHero && <FeaturedStat label="Senkron" value={item.stats.syncTime} icon={RefreshCw} />}
                        <FeaturedStat label="Uptime" value={item.stats.uptime} icon={Shield} />
                        {!isHero && (
                            <FeaturedStat
                                label="Yorum"
                                value={item.reviews >= 1000 ? `${(item.reviews / 1000).toFixed(1)}K+` : `${item.reviews}+`}
                                icon={Sparkles}
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/15">
                        <span className="text-xs text-white/70 font-medium">
                            {item.reviews.toLocaleString('tr-TR')} değerlendirme
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:gap-2.5 transition-all">
                            Detayları gör <ChevronRight size={14} />
                        </span>
                    </div>
                </div>

                {/* Sağ panel — sadece hero kart */}
                {isHero && (
                    <div className="hidden md:flex flex-col justify-center w-[42%] shrink-0 p-6 pl-2 pr-7 pb-7">
                        <div className="rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 p-5 space-y-4 shadow-inner">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/60">Senkron özeti</p>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Canlı
                                </span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: 'Stok eşitleme', pct: 98 },
                                    { label: 'Sipariş aktarımı', pct: 100 },
                                    { label: 'Fatura otomasyonu', pct: 94 },
                                ].map((bar) => (
                                    <div key={bar.label}>
                                        <div className="flex justify-between text-[11px] text-white/80 mb-1">
                                            <span>{bar.label}</span>
                                            <span className="font-bold">{bar.pct}%</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-white/90 to-white/50"
                                                style={{ width: `${bar.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div className="rounded-xl bg-white/10 px-3 py-2.5 border border-white/10">
                                    <p className="text-[10px] text-white/55 uppercase font-bold">Günlük sipariş</p>
                                    <p className="text-lg font-black text-white mt-0.5">2.4K+</p>
                                </div>
                                <div className="rounded-xl bg-white/10 px-3 py-2.5 border border-white/10">
                                    <p className="text-[10px] text-white/55 uppercase font-bold">Senkron ürün</p>
                                    <p className="text-lg font-black text-white mt-0.5">180K+</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/25 text-[11px] font-semibold text-emerald-100">
                                <CheckCircle2 size={13} className="shrink-0" />
                                Anlık çift yönlü senkronizasyon aktif
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.button>
    );
}

// ─── Detail modal ─────────────────────────────────────
function IntegrationModal({ item, onClose }: { item: Integration; onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[450] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="integration-modal-title"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-white/10"
            >
                <div className={`relative p-8 sm:p-10 bg-gradient-to-br ${item.gradient} overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.08%22/%3E%3C/svg%3E')] opacity-40" />
                    <div className="absolute inset-0 bg-black/15" />
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors z-10 backdrop-blur-sm"
                        aria-label="Kapat"
                    >
                        <X size={18} />
                    </button>
                    <div className="relative flex items-center gap-5">
                        <IntegrationLogo item={item} size="lg" />
                        <div className="min-w-0">
                            <h2 id="integration-modal-title" className="text-2xl sm:text-3xl font-black text-white tracking-tight">{item.name}</h2>
                            <p className="text-white/85 text-sm mt-1.5">{item.shortDesc}</p>
                        </div>
                    </div>
                    <div className="relative flex flex-wrap gap-3 mt-7">
                        {[
                            { icon: Users, label: item.stats.users },
                            { icon: Star, label: `${item.rating} puan`, star: true },
                            { icon: Shield, label: item.stats.uptime },
                            { icon: Clock, label: item.setupTime },
                        ].map(({ icon: Icon, label, star }) => (
                            <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-sm text-white font-medium">
                                <Icon size={14} className={star ? 'fill-amber-300 text-amber-300' : ''} />{label}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-8 sm:p-10 space-y-8">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">{item.desc}</p>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Özellikler</h3>
                        <div className="grid sm:grid-cols-2 gap-2.5">
                            {item.features.map((f) => (
                                <div key={f} className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-white/5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link
                            href="/signup"
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold hover:shadow-xl hover:shadow-orange-500/25 transition-all"
                        >
                            <Plug size={18} /> Bağlan
                        </Link>
                        <Link
                            href={`/entegrasyonlar/${item.id}`}
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <ChevronRight size={18} /> Detay sayfası
                        </Link>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Logo marquee ─────────────────────────────────────
function LogoMarquee({ items }: { items: Integration[] }) {
    const doubled = [...items, ...items];
    return (
        <div className="relative overflow-hidden py-2">
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-[#FAFAF9] dark:from-[#0B1120] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-[#FAFAF9] dark:from-[#0B1120] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-4 animate-integrations-marquee w-max">
                {doubled.map((item, i) => (
                    <div
                        key={`${item.id}-${i}`}
                        className="flex items-center gap-3 shrink-0 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-sm shadow-sm"
                    >
                        <IntegrationLogo item={item} size="sm" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Hero hub visual ──────────────────────────────────
function HeroHub() {
    const orbitLogos = [
        '/images/pazaryeri/Trendyol.png',
        '/images/pazaryeri/Hepsiburada.png',
        '/images/pazaryeri/Amazon.png',
        '/images/pazaryeri/N11.png',
        '/images/pazaryeri/Shopify.png',
        '/images/pazaryeri/Etsy.png',
        '/images/pazaryeri/ikas.png',
        '/images/pazaryeri/ideasoft-logo.webp'
    ];

    return (
        <div className="relative w-full max-w-[min(100%,260px)] xs:max-w-[280px] sm:max-w-sm lg:max-w-md mx-auto aspect-square overflow-hidden isolate">
            <div className="absolute inset-2 min-[380px]:inset-4 sm:inset-6 [--orbit:4.25rem] min-[380px]:[--orbit:4.75rem] sm:[--orbit:6.75rem] md:[--orbit:7.75rem] lg:[--orbit:8.5rem]">
                <div className="absolute inset-[6%] rounded-full border border-dashed border-orange-300/40 dark:border-orange-500/20 animate-[spin_40s_linear_infinite]" />
                <div className="absolute inset-[22%] rounded-full border border-orange-200/30 dark:border-orange-500/10" />
                <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 blur-2xl" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative z-10 w-[4.5rem] h-[4.5rem] min-[380px]:w-20 min-[380px]:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-[1.75rem] bg-white shadow-2xl shadow-orange-500/30 flex flex-col items-center justify-center ring-4 ring-white/50 dark:ring-white/10">
                        <img src="/icons/icon-192x192.svg" alt="Pazaryonetimi Merkez Logo" className="w-8 h-8 min-[380px]:w-10 min-[380px]:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-md" />
                    </div>
                </div>

                {orbitLogos.map((logo, i) => {
                    const angle = (i / orbitLogos.length) * 360 - 90;
                    return (
                        <motion.div
                            key={logo}
                            className="absolute left-1/2 top-1/2 z-20"
                            animate={{ rotate: [angle, angle + 360] }}
                            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                        >
                            <div className="absolute" style={{ transform: `translateY(calc(-1 * var(--orbit)))` }}>
                                <motion.div
                                    animate={{ rotate: [-angle, -(angle + 360)] }}
                                    transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2"
                                >
                                    <div className="w-10 h-10 p-1.5 rounded-2xl bg-white shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 flex items-center justify-center">
                                        <img src={logo} alt="Pazaryeri Logo" className="w-full h-full object-contain drop-shadow-sm" />
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Category overview ────────────────────────────────
function CategoryOverview({
    counts,
    active,
    onSelect,
}: {
    counts: Record<string, number>;
    active: CategoryId;
    onSelect: (id: CategoryId) => void;
}) {
    const cats = categoryMeta.filter((c) => c.id !== 'all' && (counts[c.id] ?? 0) > 0);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {cats.map((cat) => {
                const Icon = cat.icon;
                const isActive = active === cat.id;
                return (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => onSelect(cat.id)}
                        className={`group relative overflow-hidden rounded-2xl p-4 text-left border transition-all ${
                            isActive
                                ? 'border-orange-400/60 bg-gradient-to-br from-orange-500/10 to-amber-500/5 shadow-lg shadow-orange-500/10'
                                : 'border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] hover:border-orange-300/50'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-xl ${isActive ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-orange-500'}`}>
                                <Icon size={18} />
                            </div>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{counts[cat.id]}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Keşfet →</p>
                    </button>
                );
            })}
        </div>
    );
}

// ─── New integrations strip ───────────────────────────
function NewIntegrationsStrip({ items, onSelect }: { items: Integration[]; onSelect: (item: Integration) => void }) {
    if (items.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                        <Zap className="w-6 h-6 text-emerald-500" />
                        Yeni eklenenler
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Son dönemde kataloğa eklenen entegrasyonlar</p>
                </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item)}
                        className="shrink-0 w-[260px] rounded-2xl border border-emerald-200/60 dark:border-emerald-500/20 bg-white/80 dark:bg-slate-900/60 p-5 text-left hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <IntegrationLogo item={item} size="sm" />
                            <div>
                                <p className="font-black text-slate-900 dark:text-white">{item.name}</p>
                                <span className="text-[10px] font-bold uppercase text-emerald-600">Yeni</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.shortDesc}</p>
                    </button>
                ))}
            </div>
        </section>
    );
}

// ─── Main page ────────────────────────────────────────
export default function IntegrationsClient({ initialIntegrations }: IntegrationsClientProps) {
    const [items] = useState<Integration[]>(
        initialIntegrations?.length ? initialIntegrations : fallbackIntegrations,
    );
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<CategoryId>('all');
    const [selected, setSelected] = useState<Integration | null>(null);
    const [portalReady, setPortalReady] = useState(false);

    useEffect(() => {
        setPortalReady(true);
    }, []);

    useEffect(() => {
        if (!selected) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [selected]);

    const counts = useMemo(() => {
        const map: Record<string, number> = { all: items.length };
        for (const item of items) {
            map[item.category] = (map[item.category] || 0) + 1;
        }
        return map;
    }, [items]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter((item) => {
            const matchCat = category === 'all' || item.category === category;
            const matchSearch = !q ||
                item.name.toLowerCase().includes(q) ||
                item.shortDesc.toLowerCase().includes(q) ||
                item.features.some((f) => f.toLowerCase().includes(q));
            return matchCat && matchSearch;
        });
    }, [search, category, items]);

    const popular = useMemo(() => items.filter((i) => i.isPopular).slice(0, 3), [items]);
    const newest = useMemo(() => items.filter((i) => i.isNew).slice(0, 6), [items]);
    const avgRating = useMemo(() => {
        if (!items.length) return '4.8';
        const avg = items.reduce((sum, i) => sum + i.rating, 0) / items.length;
        return avg.toFixed(1);
    }, [items]);

    const flowSteps = [
        { icon: Plug, title: 'Bağlan', desc: 'API anahtarınızı 5 dakikada ekleyin' },
        { icon: RefreshCw, title: 'Senkronize et', desc: 'Stok ve ürünler otomatik güncellenir' },
        { icon: ShoppingCart, title: 'Yönet', desc: 'Siparişleri tek panelden işleyin' },
        { icon: FileText, title: 'Faturala', desc: 'e-Fatura tek tıkla kesilir' },
    ];

    const showFeatured = !search && category === 'all';

    return (
        <>
        <MarketingPageShell padded={false} className="pb-20">
                {/* Hero */}
                <section className="relative border-b border-slate-200/50 dark:border-white/5 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14 lg:pt-24 lg:pb-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
                            <div className="text-center lg:text-left order-2 lg:order-1 min-w-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex flex-wrap items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/80 dark:bg-white/5 text-orange-700 dark:text-orange-300 text-[11px] sm:text-xs font-bold mb-5 sm:mb-7 border border-orange-200/60 dark:border-orange-500/20 shadow-sm backdrop-blur-sm max-w-full"
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                                    </span>
                                    {items.length}+ entegrasyon · {avgRating} ort. puan
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="text-[1.75rem] min-[380px]:text-3xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] sm:leading-[1.05] mb-4 sm:mb-6 px-1 sm:px-0"
                                >
                                    Tüm kanallarınız{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
                                        tek panelde
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 leading-relaxed px-1 sm:px-0"
                                >
                                    Pazaryeri, e-ticaret, muhasebe, kargo ve e-fatura entegrasyonlarını dakikalar içinde kurun — tek merkezden yönetin.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto lg:mx-0 w-full"
                                >
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Trendyol, Paraşüt, Shopify ara…"
                                            className="w-full pl-11 sm:pl-14 pr-4 sm:pr-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm sm:text-base shadow-xl shadow-slate-200/40 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition-all backdrop-blur-sm min-h-[48px]"
                                        />
                                    </div>
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:scale-[1.02] transition-all shrink-0 min-h-[48px]"
                                    >
                                        Ücretsiz dene <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.25 }}
                                    className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:justify-start gap-x-4 gap-y-5 sm:gap-6 mt-8 sm:mt-10 max-w-sm sm:max-w-none mx-auto lg:mx-0"
                                >
                                    {[
                                        { v: '12.5K+', l: 'Aktif satıcı' },
                                        { v: '45M+', l: 'Senkron ürün' },
                                        { v: '< 2 dk', l: 'Kurulum' },
                                        { v: '%99.9', l: 'Uptime' },
                                    ].map((s, i) => (
                                        <div key={s.l} className="flex items-center sm:gap-6">
                                            {i > 0 && <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-white/10" />}
                                            <div className="text-left w-full sm:w-auto">
                                                <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">{s.v}</div>
                                                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{s.l}</div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="order-1 lg:order-2 overflow-hidden py-1 sm:py-2 w-full flex justify-center lg:justify-end"
                            >
                                <HeroHub items={items} />
                            </motion.div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
                        <LogoMarquee items={items} />
                    </div>
                </section>

                {/* How it works — timeline */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-16">
                    <div className="text-center mb-10">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500 mb-3">Nasıl çalışır</p>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">4 adımda canlıya alın</h2>
                    </div>
                    <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-orange-300/60 to-transparent" />
                        {flowSteps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="relative text-center p-6 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-sm"
                            >
                                <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 mb-4">
                                    <step.icon className="w-6 h-6" />
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-orange-600 text-[10px] font-black flex items-center justify-center border border-orange-100 dark:border-orange-500/30 shadow-sm">
                                        {i + 1}
                                    </span>
                                </div>
                                <p className="font-black text-slate-900 dark:text-white">{step.title}</p>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Category overview */}
                {showFeatured && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
                        <div className="text-center mb-8">
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500 mb-3">Kategoriler</p>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">İhtiyacınıza göre keşfedin</h2>
                        </div>
                        <CategoryOverview
                            counts={counts}
                            active={category}
                            onSelect={(id) => {
                                setCategory(id);
                                setSearch('');
                            }}
                        />
                    </section>
                )}

                {/* New integrations */}
                {showFeatured && <NewIntegrationsStrip items={newest} onSelect={setSelected} />}

                {/* Featured popular */}
                {showFeatured && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                    <Sparkles className="w-6 h-6 text-orange-500" />
                                    En çok tercih edilenler
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Binlerce satıcının güvendiği entegrasyonlar</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-5">
                            {popular.map((item, i) => (
                                <FeaturedCard key={item.id} item={item} rank={i} onSelect={setSelected} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Filters + Grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
                    <div className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-4">
                        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-2 shadow-lg shadow-slate-200/30 dark:shadow-none">
                            <div className="flex gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {categoryMeta.map((cat) => {
                                    const Icon = cat.icon;
                                    const active = category === cat.id;
                                    const count = counts[cat.id] ?? 0;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`relative flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${active ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400'}`}
                                        >
                                            {active && (
                                                <motion.div
                                                    layoutId="integration-cat-pill"
                                                    className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl shadow-md shadow-orange-500/20"
                                                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                                />
                                            )}
                                            <span className="relative flex items-center gap-2">
                                                <Icon className="w-4 h-4" />
                                                {cat.name}
                                                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
                                                    {count}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-8 mb-6">
                        <p className="text-sm text-slate-500">
                            <span className="font-black text-slate-800 dark:text-slate-200 text-lg">{filtered.length}</span>
                            {' '}
                            <span>entegrasyon</span>
                            {search && <span className="text-orange-600 dark:text-orange-400 font-medium"> · &quot;{search}&quot;</span>}
                        </p>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-24 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-5">
                                <Package className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Sonuç bulunamadı</h3>
                            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">Farklı bir arama veya kategori deneyin.</p>
                            <button
                                type="button"
                                onClick={() => { setSearch(''); setCategory('all'); }}
                                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                            >
                                Tümünü göster
                            </button>
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((item) => (
                                    <IntegrationCard key={item.id} item={item} onSelect={setSelected} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </section>

                {/* CTA */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
                    <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-10 md:p-14">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/30 via-transparent to-amber-600/20" />
                        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/25 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/15 rounded-full blur-[80px]" />
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                                backgroundSize: '24px 24px',
                            }}
                        />
                        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-200 text-xs font-bold mb-4">
                                    <Zap size={14} /> Ücretsiz deneme
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">14 gün ücretsiz deneyin</h2>
                                <p className="text-slate-300 max-w-md leading-relaxed">Tüm entegrasyonları kredi kartı olmadan test edin. Kurulum desteği dahil.</p>
                            </div>
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-orange-700 font-bold hover:bg-orange-50 hover:scale-[1.02] transition-all shrink-0 shadow-xl shadow-black/20"
                            >
                                Hemen başla <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>
        </MarketingPageShell>

            {portalReady && createPortal(
                <AnimatePresence>
                    {selected && <IntegrationModal item={selected} onClose={() => setSelected(null)} />}
                </AnimatePresence>,
                document.body,
            )}

            <style jsx global>{`
                @keyframes integrations-marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-integrations-marquee {
                    animation: integrations-marquee 45s linear infinite;
                }
                .animate-integrations-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </>
    );
}
