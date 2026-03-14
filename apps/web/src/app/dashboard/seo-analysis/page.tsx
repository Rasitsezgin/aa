"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search, Globe, TrendingUp, AlertTriangle, CheckCircle2,
    XCircle, ArrowUpRight, BarChart3, FileText, Link, Eye,
    RefreshCw, ChevronDown
} from 'lucide-react';

import { useSeoPages, useSeoStats, SeoPageData } from '@/lib/hooks';

const getScoreColor = (score: number) => score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
const getScoreBg = (score: number) => score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';

export default function SeoAnalysisPage() {
    const { data: pagesData, loading: pagesLoading } = useSeoPages();
    const { data: statsData, loading: statsLoading } = useSeoStats();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'score' | 'path'>('score');

    const pages = pagesData?.pages || [];
    const isLoading = pagesLoading || statsLoading;

    const filtered = pages
        .filter(p => p.path.toLowerCase().includes(searchTerm.toLowerCase()) || p.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortBy === 'score' ? b.seoScore - a.seoScore : a.path.localeCompare(b.path));

    const stats = statsData || {
        overallScore: 0,
        totalPages: 0,
        indexedPages: 0,
        notIndexedPages: 0,
        avgTitleLength: 0,
        avgDescriptionLength: 0,
        pagesWithoutMeta: 0,
        pagesWithLowScore: 0,
        totalKeywords: 0,
        totalRedirects: 0,
        sitemapPages: 0,
        robotsRules: 0,
        structuredDataTypes: 0,
        lastCrawlDate: '',
        crawlErrors: 0,
        mobileScore: 0,
        performanceScore: 0,
        accessibilityScore: 0,
        bestPracticesScore: 0,
        scoreHistory: []
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Globe className="w-7 h-7 text-indigo-400" /> SEO Analiz Aracı
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Ürün sayfalarınızın SEO performansını analiz edin</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm transition-colors">
                    <RefreshCw className="w-4 h-4" /> Yeniden Tara
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Ort. SEO Skoru', value: stats.overallScore, icon: BarChart3, color: getScoreColor(stats.overallScore), suffix: '/100' },
                    { label: 'Endekslenen', value: stats.indexedPages, icon: CheckCircle2, color: 'text-emerald-400', suffix: ` / ${stats.totalPages}` },
                    { label: 'Düşük Skorlu', value: stats.pagesWithLowScore, icon: AlertTriangle, color: 'text-amber-400', suffix: ' sayfa' },
                    { label: 'Mobil Skor', value: stats.mobileScore, icon: Eye, color: 'text-blue-400', suffix: '/100' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-5">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                        <div className="text-2xl font-bold text-foreground">{stat.value}<span className="text-sm text-slate-500">{stat.suffix}</span></div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Sayfa veya başlık ara..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none" />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as 'score' | 'path')}
                    className="px-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border focus:outline-none">
                    <option value="score">SEO Skoru</option>
                    <option value="path">URL Yolu</option>
                </select>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Product/Page List */}
                <div className="col-span-2 space-y-3">
                    {filtered.map((p, i) => (
                        <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            onClick={() => setSelectedPageId(selectedPageId === p.id ? null : p.id)}
                            className={`bg-surface rounded-xl border p-5 cursor-pointer transition-all ${selectedPageId === p.id ? 'border-indigo-500/50' : 'border-border hover:border-indigo-500/20'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500">{p.path}</span>
                                        <span className="text-xs text-slate-600">•</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.indexable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {p.indexable ? 'Endekslenebilir' : 'no-index'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`text-2xl font-bold ${getScoreColor(p.seoScore)}`}>{p.seoScore}</div>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-1 mb-3">{p.description}</p>

                            {/* Keywords */}
                            <div className="flex flex-wrap gap-1.5">
                                {p.keywords.slice(0, 5).map((kw, j) => (
                                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                                        {kw}
                                    </span>
                                ))}
                                {p.keywords.length > 5 && <span className="text-[10px] text-slate-500">+{p.keywords.length - 5}</span>}
                            </div>

                            {/* Meta info */}
                            <div className="flex gap-4 mt-3 pt-3 border-t border-border/50 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Son Modifikasyon: {new Date(p.lastModified).toLocaleDateString('tr-TR')}</span>
                                <span className="flex items-center gap-1"><Link className="w-3 h-3" /> Canonical: {p.canonical.replace('https://pazaryonetimi.com', '')}</span>
                            </div>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && !isLoading && (
                        <div className="p-10 text-center bg-surface rounded-xl border border-dashed border-border text-slate-500">
                            Sayfa bulunamadı.
                        </div>
                    )}
                </div>

                {/* Detail & Tips */}
                <div className="space-y-4">
                    {selectedPageId && (() => {
                        const p = pages.find(pr => pr.id === selectedPageId)!;
                        return (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface rounded-xl border border-border p-5">
                                <h3 className="text-sm font-semibold text-foreground mb-3">Tüm Anahtar Kelimeler</h3>
                                <div className="flex flex-wrap gap-2">
                                    {p.keywords.map((kw, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs">{kw}</span>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <h4 className="text-xs font-semibold text-foreground mb-2">OG Image</h4>
                                    <div className="aspect-video relative rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden">
                                        <span className="text-[10px] text-slate-500">{p.ogImage}</span>
                                    </div>
                                </div>
                                <button className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs transition-colors">
                                    Detaylı Analiz Al
                                </button>
                            </motion.div>
                        );
                    })()}

                    <div className="bg-surface rounded-xl border border-border p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-3">SEO İpuçları</h3>
                        <div className="space-y-3">
                            {[
                                { icon: FileText, text: 'Başlıklar 60-70 karakter arası olmalı', color: 'text-blue-400' },
                                { icon: FileText, text: 'Açıklamalar en az 160 karakter olmalı', color: 'text-emerald-400' },
                                { icon: Link, text: 'URL\'ler kısa ve açıklayıcı olmalı', color: 'text-amber-400' },
                                { icon: Eye, text: 'Canonical etiketlerini kontrol edin', color: 'text-indigo-400' },
                                { icon: Search, text: 'Anahtar kelime yoğunluğunu optimize edin', color: 'text-rose-400' },
                            ].map((tip, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <tip.icon className={`w-4 h-4 mt-0.5 ${tip.color}`} />
                                    <span className="text-xs text-slate-400">{tip.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface rounded-xl border border-border p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Skor Geçmişi</h3>
                        <div className="space-y-3">
                            {stats.scoreHistory.map((h, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">{h.date}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-1.5 bg-background rounded-full overflow-hidden">
                                            <div className={`h-full ${getScoreBg(h.score)}`} style={{ width: `${h.score}%` }} />
                                        </div>
                                        <span className={`text-xs font-medium ${getScoreColor(h.score)}`}>{h.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
