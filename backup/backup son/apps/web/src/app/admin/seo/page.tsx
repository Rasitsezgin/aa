"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Globe, FileText, BarChart3, ArrowUpRight, ArrowDownRight,
    Edit3, Save, X, Plus, Trash2, ExternalLink, RefreshCw, CheckCircle2,
    AlertTriangle, Info, Eye, EyeOff, Link2, ArrowRight, TrendingUp,
    Code2, Map, Bot, Shield, Smartphone, Gauge, Target, Sparkles,
    ChevronDown, ChevronRight, Copy, Check, Loader2, Settings2
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

// ─── Types ──────────────────────────────────────────
interface SeoPage {
    id: string;
    path: string;
    title: string;
    description: string;
    keywords: string[];
    seoScore: number;
    indexable: boolean;
    lastModified: string;
    ogImage: string;
    canonical: string;
}

interface SeoStats {
    overallScore: number;
    totalPages: number;
    indexedPages: number;
    notIndexedPages: number;
    avgTitleLength: number;
    avgDescriptionLength: number;
    pagesWithoutMeta: number;
    pagesWithLowScore: number;
    totalKeywords: number;
    totalRedirects: number;
    sitemapPages: number;
    robotsRules: number;
    structuredDataTypes: number;
    lastCrawlDate: string;
    crawlErrors: number;
    mobileScore: number;
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    scoreHistory: { date: string; score: number }[];
}

interface Redirect {
    id: string;
    source: string;
    destination: string;
    type: string;
    hits: number;
    lastHit: string;
    active: boolean;
}

interface StructuredDataSchema {
    type: string;
    status: string;
    pages: string[];
    lastUpdated: string;
}

type TabId = 'overview' | 'pages' | 'redirects' | 'structured-data' | 'tools';

// ─── Score Color Helper ─────────────────────────────
function scoreColor(score: number) {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
}
function scoreBg(score: number) {
    if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
}
function scoreRingColor(score: number) {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
}

// ─── Circular Score ─────────────────────────────────
function CircularScore({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
    const radius = (size - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = scoreRingColor(score);

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-white/5" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <span className={`text-3xl font-black ${scoreColor(score)}`}>{score}</span>
                <span className="text-[10px] text-slate-500 font-medium">/100</span>
            </div>
            {label && <span className="text-xs text-slate-500 font-medium mt-1">{label}</span>}
        </div>
    );
}

// ─── SEO Title/Desc Preview ─────────────────────────
function GooglePreview({ title, description, url }: { title: string; description: string; url: string }) {
    const truncTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
    const truncDesc = description.length > 160 ? description.slice(0, 157) + '...' : description;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 p-4">
            <p className="text-xs text-slate-500 mb-2 font-medium">Google Arama Önizlemesi</p>
            <div className="space-y-1">
                <p className="text-sm text-green-700 dark:text-green-400 truncate">{url}</p>
                <p className="text-lg text-blue-700 dark:text-blue-400 font-medium hover:underline cursor-pointer leading-tight">{truncTitle}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{truncDesc}</p>
            </div>
            <div className="mt-3 flex gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${title.length <= 60 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                    Başlık: {title.length}/60
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${description.length <= 160 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                    Açıklama: {description.length}/160
                </span>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function AdminSeoPage() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [stats, setStats] = useState<SeoStats | null>(null);
    const [pages, setPages] = useState<SeoPage[]>([]);
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [schemas, setSchemas] = useState<StructuredDataSchema[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<SeoPage>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [newRedirect, setNewRedirect] = useState({ source: '', destination: '', type: '301' });
    const [showAddRedirect, setShowAddRedirect] = useState(false);
    const [auditing, setAuditing] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // ─── Data Loading ───────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, pagesRes, redirectsRes, schemasRes] = await Promise.allSettled([
                adminApi.getSeoStats(),
                adminApi.getSeoPages(),
                adminApi.getSeoRedirects(),
                adminApi.getStructuredData(),
            ]);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value);
            if (pagesRes.status === 'fulfilled') setPages(pagesRes.value.pages);
            if (redirectsRes.status === 'fulfilled') setRedirects(redirectsRes.value.redirects);
            if (schemasRes.status === 'fulfilled') setSchemas(schemasRes.value.schemas);
        } catch (err) {
            console.error('SEO verisi yüklenemedi:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // ─── Toast ──────────────────────────────────────
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ─── Page Edit ──────────────────────────────────
    const startEdit = (page: SeoPage) => {
        setEditingPage(page.id);
        setEditForm({ ...page });
    };

    const cancelEdit = () => {
        setEditingPage(null);
        setEditForm({});
    };

    const savePage = async () => {
        if (!editingPage || !editForm) return;
        setSaving(true);
        try {
            await adminApi.updateSeoPage(editingPage, editForm);
            setPages(prev => prev.map(p => p.id === editingPage ? { ...p, ...editForm } as SeoPage : p));
            showToast('Sayfa metadata başarıyla güncellendi');
            cancelEdit();
        } catch {
            showToast('Güncelleme başarısız', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ─── Redirect ───────────────────────────────────
    const addRedirect = async () => {
        if (!newRedirect.source || !newRedirect.destination) return;
        try {
            const result = await adminApi.createRedirect(newRedirect);
            setRedirects(prev => [...prev, { ...result, hits: 0, lastHit: new Date().toISOString(), active: true }]);
            setNewRedirect({ source: '', destination: '', type: '301' });
            setShowAddRedirect(false);
            showToast('Yönlendirme eklendi');
        } catch {
            showToast('Yönlendirme eklenemedi', 'error');
        }
    };

    // ─── Audit ──────────────────────────────────────
    const runAudit = async () => {
        setAuditing(true);
        try {
            await adminApi.runSeoAudit();
            showToast('SEO denetimi başlatıldı. Sonuçlar birkaç dakika içinde hazır olacak.');
        } catch {
            showToast('Denetim başlatılamadı', 'error');
        } finally {
            setTimeout(() => setAuditing(false), 3000);
        }
    };

    // ─── Copy ───────────────────────────────────────
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // ─── Filtered Pages ─────────────────────────────
    const filteredPages = pages.filter(p =>
        p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ─── Tabs ───────────────────────────────────────
    const tabs: { id: TabId; label: string; icon: React.ElementType; badge?: number }[] = [
        { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
        { id: 'pages', label: 'Sayfa Metadata', icon: FileText, badge: pages.length },
        { id: 'redirects', label: 'Yönlendirmeler', icon: ArrowRight, badge: redirects.length },
        { id: 'structured-data', label: 'Structured Data', icon: Code2 },
        { id: 'tools', label: 'Araçlar', icon: Settings2 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-2 ${toast.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">SEO Yönetimi</h1>
                    <p className="text-sm text-slate-500 mt-1">Sayfa metadata, yönlendirmeler, structured data ve SEO performansı</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={runAudit}
                        disabled={auditing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {auditing ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
                        SEO Denetimi Başlat
                    </button>
                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw size={16} className="text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-1 justify-center ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span className="hidden lg:inline">{tab.label}</span>
                        {tab.badge !== undefined && (
                            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold rounded-full">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ═══════ OVERVIEW TAB ═══════ */}
            {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                    {/* Score Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
                            <div className="relative">
                                <CircularScore score={stats.overallScore} />
                            </div>
                            <p className="text-xs text-slate-500 font-semibold mt-3">Genel SEO Skoru</p>
                        </div>

                        {[
                            { label: 'Mobil', score: stats.mobileScore, icon: Smartphone, color: 'text-blue-500' },
                            { label: 'Performans', score: stats.performanceScore, icon: Gauge, color: 'text-green-500' },
                            { label: 'Erişilebilirlik', score: stats.accessibilityScore, icon: Eye, color: 'text-amber-500' },
                            { label: 'Best Practices', score: stats.bestPracticesScore, icon: Shield, color: 'text-purple-500' },
                        ].map(item => (
                            <div key={item.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <item.icon size={16} className={item.color} />
                                    <span className="text-xs text-slate-500 font-semibold">{item.label}</span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className={`text-3xl font-black ${scoreColor(item.score)}`}>{item.score}</span>
                                    <span className="text-xs text-slate-400 mb-1">/100</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${item.score}%`, backgroundColor: scoreRingColor(item.score) }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Toplam Sayfa', value: stats.totalPages, icon: FileText, color: 'text-blue-500' },
                            { label: 'İndexlenen', value: stats.indexedPages, icon: CheckCircle2, color: 'text-emerald-500' },
                            { label: 'Sitemap', value: stats.sitemapPages, icon: Map, color: 'text-cyan-500' },
                            { label: 'Anahtar Kelime', value: stats.totalKeywords, icon: Target, color: 'text-purple-500' },
                            { label: 'Yönlendirme', value: stats.totalRedirects, icon: ArrowRight, color: 'text-amber-500' },
                            { label: 'Schema', value: stats.structuredDataTypes, icon: Code2, color: 'text-rose-500' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <stat.icon size={14} className={stat.color} />
                                    <span className="text-[11px] text-slate-500 font-medium">{stat.label}</span>
                                </div>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Score History & Issues */}
                    <div className="grid lg:grid-cols-2 gap-4">
                        {/* Score Trend */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <TrendingUp size={16} className="text-purple-500" />
                                SEO Skor Trendi
                            </h3>
                            <div className="space-y-3">
                                {stats.scoreHistory.map((entry, i) => {
                                    const prev = i > 0 ? stats.scoreHistory[i - 1].score : entry.score;
                                    const diff = entry.score - prev;
                                    return (
                                        <div key={entry.date} className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 w-20 font-mono">{entry.date}</span>
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${entry.score}%`, backgroundColor: scoreRingColor(entry.score) }}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold w-8 text-right ${scoreColor(entry.score)}`}>{entry.score}</span>
                                            {diff !== 0 && (
                                                <span className={`text-[10px] font-bold flex items-center ${diff > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {diff > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                    {Math.abs(diff)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Issues & Recommendations */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-amber-500" />
                                Sorunlar & Öneriler
                            </h3>
                            <div className="space-y-3">
                                {stats.pagesWithoutMeta > 0 && (
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                                        <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{stats.pagesWithoutMeta} sayfa meta bilgisi eksik</p>
                                            <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5">Her sayfanın benzersiz başlık ve açıklaması olmalı</p>
                                        </div>
                                    </div>
                                )}
                                {stats.pagesWithLowScore > 0 && (
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">{stats.pagesWithLowScore} sayfa düşük SEO skoru</p>
                                            <p className="text-xs text-amber-600/70 dark:text-amber-400/60 mt-0.5">Bu sayfaların başlık ve açıklamalarını iyileştirin</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                                    <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Avg başlık: {stats.avgTitleLength} karakter</p>
                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/60 mt-0.5">Önerilen: 50-60 karakter arası</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                                    <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Avg açıklama: {stats.avgDescriptionLength} karakter</p>
                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/60 mt-0.5">Önerilen: 140-160 karakter arası</p>
                                    </div>
                                </div>
                                {stats.notIndexedPages > 0 && (
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                        <EyeOff size={16} className="text-slate-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{stats.notIndexedPages} sayfa indexlenmiyor</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Bu sayfalar bilinçli olarak arama dışında tutulmuş olabilir</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ PAGES TAB ═══════ */}
            {activeTab === 'pages' && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Sayfa ara (URL veya başlık)..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-slate-900 dark:text-white"
                            />
                        </div>
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{filteredPages.length} sayfa</span>
                    </div>

                    {/* Page List */}
                    <div className="space-y-3">
                        {filteredPages.map(page => {
                            const isEditing = editingPage === page.id;

                            return (
                                <div key={page.id} className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${isEditing ? 'border-purple-500/50 ring-2 ring-purple-500/20' : 'border-slate-200 dark:border-white/5'}`}>
                                    {/* Page Header */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${scoreBg(page.seoScore)}`}>
                                                <span className={`text-sm font-black ${scoreColor(page.seoScore)}`}>{page.seoScore}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{page.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-slate-500 font-mono">{page.path}</span>
                                                    {page.indexable ? (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">İndexleniyor</span>
                                                    ) : (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-full font-medium">Noindex</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {!isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => startEdit(page)}
                                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <Edit3 size={14} className="text-slate-500" />
                                                    </button>
                                                    <a
                                                        href={`https://pazaryonetimi.com${page.path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <ExternalLink size={14} className="text-slate-500" />
                                                    </a>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={savePage}
                                                        disabled={saving}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                    >
                                                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                                        Kaydet
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <X size={14} className="text-slate-500" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Edit Form */}
                                    {isEditing && (
                                        <div className="border-t border-slate-100 dark:border-white/5 p-5 space-y-4">
                                            <div className="grid lg:grid-cols-2 gap-4">
                                                {/* Left: Form Fields */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                                            Sayfa Başlığı (Title Tag)
                                                            <span className={`ml-2 ${(editForm.title?.length || 0) > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                                {editForm.title?.length || 0}/60
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editForm.title || ''}
                                                            onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-slate-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                                            Meta Açıklama (Description)
                                                            <span className={`ml-2 ${(editForm.description?.length || 0) > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                                {editForm.description?.length || 0}/160
                                                            </span>
                                                        </label>
                                                        <textarea
                                                            value={editForm.description || ''}
                                                            onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                                                            rows={3}
                                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-slate-900 dark:text-white resize-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                                            Anahtar Kelimeler (virgülle ayırın)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={(editForm.keywords || []).join(', ')}
                                                            onChange={(e) => setEditForm(f => ({ ...f, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
                                                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-slate-900 dark:text-white"
                                                        />
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {(editForm.keywords || []).map((kw, i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[11px] rounded-full font-medium">
                                                                    {kw}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Canonical URL</label>
                                                            <input
                                                                type="text"
                                                                value={editForm.canonical || ''}
                                                                onChange={(e) => setEditForm(f => ({ ...f, canonical: e.target.value }))}
                                                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-slate-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">İndeksleme</label>
                                                            <button
                                                                onClick={() => setEditForm(f => ({ ...f, indexable: !f.indexable }))}
                                                                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${editForm.indexable
                                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                                                    : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                                                                    }`}
                                                            >
                                                                {editForm.indexable ? <Eye size={14} /> : <EyeOff size={14} />}
                                                                {editForm.indexable ? 'İndexleniyor' : 'Noindex'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Preview */}
                                                <div className="space-y-4">
                                                    <GooglePreview
                                                        title={editForm.title || ''}
                                                        description={editForm.description || ''}
                                                        url={editForm.canonical || `https://pazaryonetimi.com${page.path}`}
                                                    />
                                                    <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                                                        <p className="text-xs text-slate-500 font-medium mb-2">Sosyal Medya Önizlemesi (Open Graph)</p>
                                                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
                                                            <div className="h-32 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                                                                <Globe size={32} className="text-slate-400" />
                                                            </div>
                                                            <div className="p-3">
                                                                <p className="text-[10px] text-slate-400 uppercase">pazaryonetimi.com</p>
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 line-clamp-1">{editForm.title}</p>
                                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{editForm.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══════ REDIRECTS TAB ═══════ */}
            {activeTab === 'redirects' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">URL yönlendirmelerini yönetin. 301 (kalıcı) veya 302 (geçici) yönlendirmeler ekleyin.</p>
                        <button
                            onClick={() => setShowAddRedirect(!showAddRedirect)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            <Plus size={16} />
                            Yönlendirme Ekle
                        </button>
                    </div>

                    {/* Add Redirect Form */}
                    {showAddRedirect && (
                        <div className="bg-purple-50 dark:bg-purple-500/5 rounded-2xl border border-purple-200 dark:border-purple-500/20 p-5">
                            <h3 className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-4">Yeni Yönlendirme</h3>
                            <div className="grid md:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Kaynak URL</label>
                                    <input
                                        type="text"
                                        value={newRedirect.source}
                                        onChange={(e) => setNewRedirect(r => ({ ...r, source: e.target.value }))}
                                        placeholder="/eski-sayfa"
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Hedef URL</label>
                                    <input
                                        type="text"
                                        value={newRedirect.destination}
                                        onChange={(e) => setNewRedirect(r => ({ ...r, destination: e.target.value }))}
                                        placeholder="/yeni-sayfa"
                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Tür</label>
                                        <select
                                            value={newRedirect.type}
                                            onChange={(e) => setNewRedirect(r => ({ ...r, type: e.target.value }))}
                                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-900 dark:text-white"
                                        >
                                            <option value="301">301 (Kalıcı)</option>
                                            <option value="302">302 (Geçici)</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={addRedirect}
                                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Redirects Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-white/5">
                                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kaynak</th>
                                        <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hedef</th>
                                        <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tür</th>
                                        <th className="text-right px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hit</th>
                                        <th className="text-center px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {redirects.map(redirect => (
                                        <tr key={redirect.id} className="border-b border-slate-50 dark:border-white/[0.02] last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3">
                                                <code className="text-sm text-slate-700 dark:text-slate-300 font-mono">{redirect.source}</code>
                                            </td>
                                            <td className="px-4 py-3 flex items-center gap-2">
                                                <ArrowRight size={12} className="text-slate-400" />
                                                <code className="text-sm text-purple-600 dark:text-purple-400 font-mono">{redirect.destination}</code>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${redirect.type === '301'
                                                    ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                                    : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                                    }`}>{redirect.type}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {redirect.hits.toLocaleString('tr-TR')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {redirect.active ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 font-semibold">Devre dışı</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ STRUCTURED DATA TAB ═══════ */}
            {activeTab === 'structured-data' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                        Yapılandırılmış veri (JSON-LD) şemaları, arama motorlarının içeriğinizi anlamasına yardımcı olur.
                        Zengin sonuçlar (rich snippets) için gereklidir.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schemas.map(schema => (
                            <div key={schema.type} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Code2 size={16} className="text-purple-500" />
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{schema.type}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${schema.status === 'active'
                                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                                        }`}>
                                        {schema.status === 'active' ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Uygulandığı sayfalar</span>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                                            {schema.pages.includes('all') ? 'Tüm sayfalar' : schema.pages.join(', ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Son güncelleme</span>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                                            {new Date(schema.lastUpdated).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                                    <a
                                        href={`https://search.google.com/test/rich-results?url=https://pazaryonetimi.com${schema.pages[0] === 'all' ? '' : schema.pages[0]}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline"
                                    >
                                        <ExternalLink size={10} />
                                        Zengin Sonuç Testi
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Schema Code Preview */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Code2 size={16} className="text-purple-500" />
                                JSON-LD Önizleme — Organization
                            </h3>
                            <button
                                onClick={() => copyToClipboard(JSON.stringify({
                                    "@context": "https://schema.org",
                                    "@type": "Organization",
                                    "name": "Pazaryonetimi",
                                    "url": "https://pazaryonetimi.com",
                                    "logo": "https://pazaryonetimi.com/favicon.svg"
                                }, null, 2), 'org-schema')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-xs text-slate-500 font-medium transition-colors"
                            >
                                {copiedField === 'org-schema' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                {copiedField === 'org-schema' ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                        </div>
                        <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://pazaryonetimi.com/#organization",
  "name": "Pazaryonetimi",
  "url": "https://pazaryonetimi.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://pazaryonetimi.com/favicon.svg"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Turkish"
  },
  "sameAs": [
    "https://twitter.com/pazaryonetimi",
    "https://linkedin.com/company/pazaryonetimi",
    "https://instagram.com/pazaryonetimi"
  ]
}`}
                        </pre>
                    </div>
                </div>
            )}

            {/* ═══════ TOOLS TAB ═══════ */}
            {activeTab === 'tools' && (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Sitemap */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                                    <Map size={18} className="text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sitemap</h3>
                                    <p className="text-xs text-slate-500">{stats?.sitemapPages || 0} sayfa</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Sitemap.xml dosyasını yeniden oluşturun veya mevcut dosyayı görüntüleyin.</p>
                            <div className="flex gap-2">
                                <a
                                    href="https://pazaryonetimi.com/sitemap.xml"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                    <ExternalLink size={12} />
                                    Görüntüle
                                </a>
                                <button
                                    onClick={async () => {
                                        try {
                                            await adminApi.regenerateSitemap();
                                            showToast('Sitemap yeniden oluşturuldu');
                                        } catch {
                                            showToast('İşlem başarısız', 'error');
                                        }
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold transition-colors"
                                >
                                    <RefreshCw size={12} />
                                    Yenile
                                </button>
                            </div>
                        </div>

                        {/* Robots.txt */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                                    <Bot size={18} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Robots.txt</h3>
                                    <p className="text-xs text-slate-500">{stats?.robotsRules || 0} kural</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Arama motoru botları için erişim kurallarını yönetin.</p>
                            <a
                                href="https://pazaryonetimi.com/robots.txt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                            >
                                <ExternalLink size={12} />
                                robots.txt Görüntüle
                            </a>
                        </div>

                        {/* Google Search Console */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                                    <Search size={18} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Google Search Console</h3>
                                    <p className="text-xs text-slate-500">Arama performansı</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Google Search Console&apos;a bağlanarak arama performansınızı izleyin.</p>
                            <a
                                href="https://search.google.com/search-console/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                                <ExternalLink size={12} />
                                Search Console Aç
                            </a>
                        </div>

                        {/* Rich Results Test */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                    <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Zengin Sonuç Testi</h3>
                                    <p className="text-xs text-slate-500">Schema.org doğrulama</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Yapılandırılmış verilerinizin doğruluğunu Google ile test edin.</p>
                            <a
                                href="https://search.google.com/test/rich-results?url=https://pazaryonetimi.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                                <ExternalLink size={12} />
                                Test Et
                            </a>
                        </div>

                        {/* PageSpeed Insights */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                    <Gauge size={18} className="text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">PageSpeed Insights</h3>
                                    <p className="text-xs text-slate-500">Performans analizi</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Sayfa yükleme hızı ve Core Web Vitals analizi yapın.</p>
                            <a
                                href="https://pagespeed.web.dev/analysis?url=https://pazaryonetimi.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                                <ExternalLink size={12} />
                                Analiz Et
                            </a>
                        </div>

                        {/* Bing Webmaster */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                                    <Globe size={18} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bing Webmaster</h3>
                                    <p className="text-xs text-slate-500">Bing arama yönetimi</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-4">Bing arama motorunda sitenizin durumunu kontrol edin.</p>
                            <a
                                href="https://www.bing.com/webmasters/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                            >
                                <ExternalLink size={12} />
                                Bing Webmaster Aç
                            </a>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 p-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Info size={16} className="text-blue-500" />
                            SEO Yapılandırması
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div className="space-y-2">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Metadata Config</p>
                                <code className="block bg-white dark:bg-slate-900 p-2 rounded-lg text-slate-600 dark:text-slate-400 font-mono">
                                    apps/web/src/config/seo-metadata.ts
                                </code>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Structured Data</p>
                                <code className="block bg-white dark:bg-slate-900 p-2 rounded-lg text-slate-600 dark:text-slate-400 font-mono">
                                    components/SEO/StructuredData.tsx
                                </code>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Next.js Config</p>
                                <code className="block bg-white dark:bg-slate-900 p-2 rounded-lg text-slate-600 dark:text-slate-400 font-mono">
                                    apps/web/next.config.js
                                </code>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Sitemap</p>
                                <code className="block bg-white dark:bg-slate-900 p-2 rounded-lg text-slate-600 dark:text-slate-400 font-mono">
                                    apps/web/src/app/sitemap.ts
                                </code>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">Robots</p>
                                <code className="block bg-white dark:bg-slate-900 p-2 rounded-lg text-slate-600 dark:text-slate-400 font-mono">
                                    apps/web/src/app/robots.ts
                                </code>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-slate-700 dark:text-slate-300">OG Image</p>
                                <code className="block bg-white dark:bg-slate-900 p-2 rounded-lg text-slate-600 dark:text-slate-400 font-mono">
                                    apps/web/src/app/opengraph-image.tsx
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
