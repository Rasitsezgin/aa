"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Sparkles, Target, BarChart3, FileText, Zap, RefreshCw,
    CheckCircle2, AlertCircle, AlertTriangle, ArrowUpRight, Copy,
    Save, Globe, Search, ChevronDown, ChevronRight, Eye, Send,
    TrendingUp, TrendingDown, Layers, Tag, Clock, Check, X,
    Wand2, BookOpen, ListChecks, Shield, Star, Image as ImageIcon,
    Video, Palette, Download, Share2, PlayCircle
} from 'lucide-react';
import {
    useContentAnalysis,
    useContentOptimization,
    useContentHealth,
    ContentAnalysisResult,
    ContentOptimizationResult,
} from '@/lib/hooks';

const PLATFORMS = ['TRENDYOL', 'HEPSIBURADA', 'AMAZON', 'N11', 'CICEKSEPETI'];
const TONES = [
    { id: 'professional', label: 'Profesyonel', emoji: '💼', desc: 'Resmi ve güven verici' },
    { id: 'friendly', label: 'Samimi', emoji: '😊', desc: 'Sıcak ve arkadaşça' },
    { id: 'luxury', label: 'Lüks', emoji: '✨', desc: 'Prestijli ve sofistike' },
    { id: 'fun', label: 'Eğlenceli', emoji: '🎉', desc: 'Enerjik ve dikkat çekici' },
    { id: 'technical', label: 'Teknik', emoji: '🔧', desc: 'Detaylı ve bilimsel' },
];

function ScoreCircle({ score, size = 'md', label }: { score: number; size?: 'sm' | 'md' | 'lg'; label?: string }) {
    const color = score >= 80 ? 'text-emerald-400 border-emerald-500' : score >= 60 ? 'text-amber-400 border-amber-500' : 'text-red-400 border-red-500';
    const bgColor = score >= 80 ? 'bg-emerald-500/10' : score >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10';
    const sizes = { sm: 'w-10 h-10 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 text-xl' };

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`${sizes[size]} ${color} ${bgColor} rounded-full border-2 flex items-center justify-center font-bold`}>
                {score}
            </div>
            {label && <span className="text-[10px] text-slate-500 uppercase font-medium">{label}</span>}
        </div>
    );
}

function HealthStatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
        excellent: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Mükemmel', icon: <CheckCircle2 size={12} /> },
        good: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'İyi', icon: <TrendingUp size={12} /> },
        needs_improvement: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Geliştirilmeli', icon: <AlertTriangle size={12} /> },
        critical: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Kritik', icon: <AlertCircle size={12} /> },
    };
    const c = config[status] || config.needs_improvement;
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${c.color}`}>
            {c.icon} {c.label}
        </span>
    );
}

type TabType = 'analyze' | 'optimize' | 'generate' | 'health' | 'visual';

export default function ContentStudioPage() {
    const [activeTab, setActiveTab] = useState<TabType>('health');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [platform, setPlatform] = useState('TRENDYOL');
    const [tone, setTone] = useState('professional');
    const [keywords, setKeywords] = useState('');
    const [category, setCategory] = useState('');
    const [productName, setProductName] = useState('');
    const [features, setFeatures] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const { analyze, analysisResult, loading: analyzeLoading } = useContentAnalysis();
    const { optimizeDeep, generateDesc, apply, result: optResult, loading: optLoading } = useContentOptimization();
    const { data: healthData, loading: healthLoading, refetch: refetchHealth } = useContentHealth();

    const [genResult, setGenResult] = useState<any>(null);

    const [visualMode, setVisualMode] = useState<'image' | 'video'>('image');
    const [selectedTheme, setSelectedTheme] = useState('modern');
    const [visualResult, setVisualResult] = useState<any>(null);
    const [visualLoading, setVisualLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!title) return;
        await analyze({
            title,
            description: description || undefined,
            platform,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
            category: category || undefined,
        });
    };

    const handleOptimize = async () => {
        if (!title) return;
        await optimizeDeep({
            title,
            description: description || undefined,
            platform,
            tone,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
            category: category || undefined,
        });
    };

    const handleGenerate = async () => {
        if (!productName) return;
        const result = await generateDesc({
            productName,
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
            platform,
            tone,
            category: category || undefined,
            features: features ? features.split(',').map(f => f.trim()) : undefined,
        });
        if (result) setGenResult(result);
    };

    const handleApply = async (optimizationId: string, sync: boolean) => {
        await apply(optimizationId, sync);
    };

    const handleGenerateLifestyle = async () => {
        setVisualLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/studio/lifestyle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({ productId: 'temp-id', theme: selectedTheme })
            });
            const data = await res.json();
            setVisualResult({ type: 'image', url: data.url });
        } catch (err) {
            console.error(err);
        } finally {
            setVisualLoading(false);
        }
    };

    const handleGenerateVideo = async () => {
        setVisualLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/studio/video-short`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({ productId: 'temp-id' })
            });
            const data = await res.json();
            setVisualResult({ type: 'video', ...data });
        } catch (err) {
            console.error(err);
        } finally {
            setVisualLoading(false);
        }
    };

    const copyText = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'health', label: 'İçerik Sağlığı', icon: <BarChart3 size={16} /> },
        { id: 'analyze', label: 'Derinlemesine Analiz', icon: <Search size={16} /> },
        { id: 'optimize', label: 'AI Optimizasyon', icon: <Sparkles size={16} /> },
        { id: 'generate', label: 'Açıklama Üretici', icon: <Wand2 size={16} /> },
        { id: 'visual', label: 'Görsel Stüdyo', icon: <ImageIcon size={16} /> },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/20">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        AI İçerik Stüdyosu
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Ürün içeriklerinizi analiz edin, optimize edin ve pazaryerine gönderin
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {healthData && <HealthStatusBadge status={healthData.healthStatus} />}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-surface rounded-xl border border-border">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                            : 'text-slate-500 hover:text-foreground hover:bg-background'
                            }`}
                    >
                        {tab.icon}
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Health Dashboard */}
            <AnimatePresence mode="wait">
                {activeTab === 'health' && (
                    <motion.div
                        key="health"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {healthLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Brain className="w-10 h-10 text-violet-500 animate-pulse" />
                            </div>
                        ) : healthData ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-surface rounded-2xl border border-border p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <Layers className="w-5 h-5 text-slate-400" />
                                            <span className="text-2xl font-bold text-foreground">{healthData.totalProducts}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Toplam Ürün</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl border border-border p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <Target className="w-5 h-5 text-slate-400" />
                                            <ScoreCircle score={healthData.averageScores.overall} size="sm" />
                                        </div>
                                        <p className="text-xs text-slate-500">Ortalama Skor</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl border border-border p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                                            <span className="text-2xl font-bold text-amber-400">{healthData.lowScoreCount}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Düşük Skorlu</p>
                                    </div>
                                    <div className="bg-surface rounded-2xl border border-border p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <FileText className="w-5 h-5 text-red-400" />
                                            <span className="text-2xl font-bold text-red-400">{healthData.missingDescriptionCount}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Açıklama Eksik</p>
                                    </div>
                                </div>

                                {/* Score Breakdown */}
                                <div className="bg-surface rounded-2xl border border-border p-6">
                                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-violet-500" />
                                        Skor Dağılımı
                                    </h3>
                                    <div className="grid grid-cols-4 gap-6">
                                        <ScoreCircle score={healthData.averageScores.seo} size="lg" label="SEO" />
                                        <ScoreCircle score={healthData.averageScores.readability} size="lg" label="Okunabilirlik" />
                                        <ScoreCircle score={healthData.averageScores.keyword} size="lg" label="Anahtar Kelime" />
                                        <ScoreCircle score={healthData.averageScores.overall} size="lg" label="Genel" />
                                    </div>
                                </div>

                                {/* Recent Optimizations */}
                                {healthData.recentOptimizations.length > 0 && (
                                    <div className="bg-surface rounded-2xl border border-border p-6">
                                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-violet-500" />
                                            Son Optimizasyonlar
                                        </h3>
                                        <div className="space-y-2">
                                            {healthData.recentOptimizations.map((opt: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-slate-500">{opt.platform}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${opt.status === 'applied' ? 'bg-emerald-500/20 text-emerald-400' : opt.status === 'draft' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                                            {opt.status === 'applied' ? 'Uygulandı' : opt.status === 'draft' ? 'Taslak' : opt.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-red-400">{opt.seoScoreBefore}</span>
                                                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                                        <span className="text-emerald-400 font-bold">{opt.seoScoreAfter}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => refetchHealth()}
                                        className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm hover:bg-surface transition-all"
                                    >
                                        <RefreshCw size={14} /> Yenile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('analyze')}
                                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all"
                                    >
                                        <Search size={14} /> Ürün Analiz Et
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-slate-500">
                                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>İçerik sağlığı verisi yüklenemedi</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Deep Analysis Tab */}
                {activeTab === 'analyze' && (
                    <motion.div
                        key="analyze"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input */}
                            <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Search className="w-4 h-4 text-violet-500" /> İçerik Analizi
                                </h3>

                                <PlatformSelector platform={platform} setPlatform={setPlatform} />

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Ürün Başlığı *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ürün başlığını girin..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Ürün Açıklaması</label>
                                    <textarea
                                        rows={6}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Mevcut ürün açıklamasını girin..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Anahtar Kelimeler (virgülle ayırın)</label>
                                    <input
                                        type="text"
                                        value={keywords}
                                        onChange={(e) => setKeywords(e.target.value)}
                                        placeholder="örn: bluetooth, kulaklık, kablosuz"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzeLoading || !title}
                                    className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {analyzeLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Brain className="w-4 h-4" />
                                            Derinlemesine Analiz Et
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Analysis Results */}
                            <div>
                                {!analysisResult && !analyzeLoading ? (
                                    <div className="h-full bg-surface border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-12 opacity-40">
                                        <Target size={48} className="mb-4" />
                                        <p className="font-medium">Analiz Sonuçları</p>
                                        <p className="text-sm mt-1">İçerik girin ve analiz başlatın</p>
                                    </div>
                                ) : analyzeLoading ? (
                                    <div className="h-full bg-surface rounded-2xl border border-border p-12 flex flex-col items-center justify-center">
                                        <div className="relative w-20 h-20 mb-6">
                                            <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping" />
                                            <div className="relative bg-violet-600 rounded-full w-full h-full flex items-center justify-center">
                                                <Brain className="w-8 h-8 text-white animate-pulse" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">AI Analiz Ediyor...</h3>
                                        <p className="text-slate-500 text-xs">SEO, okunabilirlik, platform uyumluluğu kontrol ediliyor</p>
                                    </div>
                                ) : analysisResult ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-surface rounded-2xl border border-border overflow-hidden space-y-0"
                                    >
                                        {/* Score Header */}
                                        <div className="p-5 border-b border-border bg-violet-500/5">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Analiz Raporu</span>
                                                <ScoreCircle score={analysisResult.scores.overall} size="md" />
                                            </div>
                                            <div className="grid grid-cols-4 gap-3">
                                                <ScoreCircle score={analysisResult.scores.seo} size="sm" label="SEO" />
                                                <ScoreCircle score={analysisResult.scores.readability} size="sm" label="Okunabilirlik" />
                                                <ScoreCircle score={analysisResult.scores.keyword} size="sm" label="Anahtar Kelime" />
                                                <ScoreCircle score={analysisResult.scores.competitiveness} size="sm" label="Rekabet" />
                                            </div>
                                        </div>

                                        {/* Platform Compliance */}
                                        <div className="p-5 border-b border-border">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Platform Uyumluluğu</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { label: 'Başlık Uzunluğu', ok: analysisResult.platformCompliance.titleLength },
                                                    { label: 'Açıklama Uzunluğu', ok: analysisResult.platformCompliance.descriptionLength },
                                                    { label: 'Yasak İçerik', ok: analysisResult.platformCompliance.noForbiddenContent },
                                                ].map((item, i) => (
                                                    <div key={i} className={`p-2 rounded-lg text-center text-[10px] font-medium ${item.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {item.ok ? <Check size={12} className="mx-auto mb-1" /> : <X size={12} className="mx-auto mb-1" />}
                                                        {item.label}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Issues & Suggestions */}
                                        <div className="p-5 border-b border-border space-y-4">
                                            {analysisResult.issues.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2 flex items-center gap-1">
                                                        <AlertCircle size={10} /> Tespit Edilen Sorunlar
                                                    </h4>
                                                    <ul className="space-y-1.5">
                                                        {analysisResult.issues.map((issue, i) => (
                                                            <li key={i} className="text-xs text-red-400/80 flex items-start gap-2">
                                                                <span className="mt-0.5">•</span> {issue}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {analysisResult.suggestions.length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase mb-2 flex items-center gap-1">
                                                        <CheckCircle2 size={10} /> Öneriler
                                                    </h4>
                                                    <ul className="space-y-1.5">
                                                        {analysisResult.suggestions.map((sug, i) => (
                                                            <li key={i} className="text-xs text-emerald-400/80 flex items-start gap-2">
                                                                <span className="mt-0.5">•</span> {sug}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Keywords */}
                                        <div className="p-5 border-b border-border">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Tespit Edilen Anahtar Kelimeler</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {analysisResult.keywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[10px] font-bold rounded">
                                                        #{kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* AI Insights */}
                                        {analysisResult.aiInsights && (
                                            <div className="p-5 border-b border-border space-y-3">
                                                <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                    <Brain size={10} /> AI Derinlemesine Analiz
                                                </h4>
                                                {analysisResult.aiInsights.targetAudience && (
                                                    <div className="text-xs">
                                                        <span className="text-slate-500">Hedef Kitle:</span>{' '}
                                                        <span className="text-foreground">{analysisResult.aiInsights.targetAudience}</span>
                                                    </div>
                                                )}
                                                {analysisResult.aiInsights.contentGaps?.length > 0 && (
                                                    <div>
                                                        <span className="text-[10px] text-amber-400 font-bold">Eksik Bilgiler:</span>
                                                        <ul className="mt-1 space-y-0.5">
                                                            {analysisResult.aiInsights.contentGaps.map((gap, i) => (
                                                                <li key={i} className="text-[10px] text-amber-400/80 flex items-start gap-1">
                                                                    <AlertTriangle size={8} className="mt-0.5 flex-shrink-0" /> {gap}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Character Stats */}
                                        <div className="p-5">
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Karakter İstatistikleri</h4>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Başlık</span>
                                                    <span className="text-foreground">{analysisResult.characterAnalysis.titleLength}/{analysisResult.characterAnalysis.maxTitleLength}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Açıklama</span>
                                                    <span className="text-foreground">{analysisResult.characterAnalysis.descriptionLength}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Kelime</span>
                                                    <span className="text-foreground">{analysisResult.characterAnalysis.wordCount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Cümle</span>
                                                    <span className="text-foreground">{analysisResult.characterAnalysis.sentenceCount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="p-5 bg-violet-500/5 border-t border-border">
                                            <button
                                                onClick={() => {
                                                    setActiveTab('optimize');
                                                }}
                                                className="w-full py-3 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Sparkles size={14} /> Bu İçeriği Optimize Et
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Optimize Tab */}
                {activeTab === 'optimize' && (
                    <motion.div
                        key="optimize"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input */}
                            <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-500" /> AI İçerik Optimizasyonu
                                </h3>

                                <PlatformSelector platform={platform} setPlatform={setPlatform} />

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Mevcut Başlık *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ürün başlığını girin..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Mevcut Açıklama</label>
                                    <textarea
                                        rows={5}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Ürün açıklamasını girin..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Anahtar Kelimeler</label>
                                    <input
                                        type="text"
                                        value={keywords}
                                        onChange={(e) => setKeywords(e.target.value)}
                                        placeholder="virgülle ayırın..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                {/* Tone Selection */}
                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-2">İçerik Tonu</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {TONES.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTone(t.id)}
                                                className={`p-2.5 rounded-xl border text-center transition-all ${tone === t.id
                                                    ? 'bg-violet-500/20 border-violet-500 shadow-lg shadow-violet-500/10'
                                                    : 'border-border hover:border-violet-500/50'
                                                    }`}
                                            >
                                                <div className="text-base mb-0.5">{t.emoji}</div>
                                                <div className="text-[10px] font-medium text-foreground">{t.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleOptimize}
                                    disabled={optLoading || !title}
                                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {optLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            AI ile Optimize Et
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Optimization Results */}
                            <div>
                                {!optResult && !optLoading ? (
                                    <div className="h-full bg-surface border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-12 opacity-40">
                                        <Sparkles size={48} className="mb-4" />
                                        <p className="font-medium">Optimizasyon Sonucu</p>
                                        <p className="text-sm mt-1">İçerik girin ve optimize edin</p>
                                    </div>
                                ) : optLoading ? (
                                    <div className="h-full bg-surface rounded-2xl border border-border p-12 flex flex-col items-center justify-center">
                                        <div className="relative w-20 h-20 mb-6">
                                            <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping" />
                                            <div className="relative bg-gradient-to-br from-violet-600 to-purple-600 rounded-full w-full h-full flex items-center justify-center">
                                                <Sparkles className="w-8 h-8 text-white animate-pulse" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">AI Optimize Ediyor...</h3>
                                        <p className="text-slate-500 text-xs">İçerik {platform} kurallarına göre yeniden oluşturuluyor</p>
                                    </div>
                                ) : optResult ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-surface rounded-2xl border border-border overflow-hidden"
                                    >
                                        {/* Score Comparison Header */}
                                        <div className="p-5 border-b border-border bg-violet-500/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-yellow-500" />
                                                <span className="font-bold text-xs tracking-widest uppercase">Optimum İçerik v{optResult.version}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-red-400">{optResult.seoScoreBefore}</span>
                                                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                                                    {optResult.seoScoreAfter}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 space-y-5">
                                            {/* Optimized Title */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Optimize Edilmiş Başlık</label>
                                                    <button onClick={() => copyText(optResult.optimizedTitle, 'title')} className="text-slate-400 hover:text-violet-500 transition-colors">
                                                        {copied === 'title' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <p className="p-3 bg-background border border-border rounded-xl text-sm font-bold">{optResult.optimizedTitle}</p>
                                            </div>

                                            {/* Optimized Description */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Optimize Edilmiş Açıklama</label>
                                                    <button onClick={() => copyText(optResult.optimizedDescription || '', 'desc')} className="text-slate-400 hover:text-violet-500 transition-colors">
                                                        {copied === 'desc' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <div className="p-3 bg-background border border-border rounded-xl text-sm text-slate-400 leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                                                    {optResult.optimizedDescription}
                                                </div>
                                            </div>

                                            {/* Keywords */}
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Anahtar Kelimeler</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {optResult.keywords?.map((kw, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[10px] font-bold rounded">
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Improvements */}
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Yapılan İyileştirmeler</label>
                                                <ul className="space-y-1">
                                                    {optResult.improvements?.map((imp, i) => (
                                                        <li key={i} className="text-[10px] text-emerald-400 flex items-start gap-1.5">
                                                            <CheckCircle2 size={10} className="mt-0.5 flex-shrink-0" />
                                                            {imp}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="p-5 bg-violet-500/5 border-t border-border grid grid-cols-3 gap-3">
                                            <button
                                                onClick={() => copyText(`${optResult.optimizedTitle}\n\n${optResult.optimizedDescription}`, 'all')}
                                                className="flex items-center justify-center gap-1.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                                            >
                                                {copied === 'all' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                Kopyala
                                            </button>
                                            <button
                                                onClick={() => handleApply(optResult.id, false)}
                                                className="flex items-center justify-center gap-1.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                                            >
                                                <Save size={12} />
                                                Ürüne Uygula
                                            </button>
                                            <button
                                                onClick={() => handleApply(optResult.id, true)}
                                                className="flex items-center justify-center gap-1.5 py-2.5 bg-foreground text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                                            >
                                                <Send size={12} />
                                                Pazaryerine Gönder
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Generate Tab */}
                {activeTab === 'generate' && (
                    <motion.div
                        key="generate"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input */}
                            <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Wand2 className="w-4 h-4 text-violet-500" /> Sıfırdan Açıklama Oluştur
                                </h3>

                                <PlatformSelector platform={platform} setPlatform={setPlatform} />

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Ürün Adı *</label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        placeholder="örn: iPhone 15 Pro Max Silikon Kılıf"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Kategori</label>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="örn: Elektronik > Telefon Aksesuarları"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Anahtar Kelimeler</label>
                                    <input
                                        type="text"
                                        value={keywords}
                                        onChange={(e) => setKeywords(e.target.value)}
                                        placeholder="virgülle ayırın..."
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-1.5">Ürün Özellikleri</label>
                                    <input
                                        type="text"
                                        value={features}
                                        onChange={(e) => setFeatures(e.target.value)}
                                        placeholder="örn: darbe emici, MagSafe uyumlu, ince"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                {/* Tone Selection */}
                                <div>
                                    <label className="text-xs font-medium text-slate-400 block mb-2">İçerik Tonu</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {TONES.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTone(t.id)}
                                                className={`p-2.5 rounded-xl border text-center transition-all ${tone === t.id
                                                    ? 'bg-violet-500/20 border-violet-500'
                                                    : 'border-border hover:border-violet-500/50'
                                                    }`}
                                            >
                                                <div className="text-base mb-0.5">{t.emoji}</div>
                                                <div className="text-[10px] font-medium text-foreground">{t.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={optLoading || !productName}
                                    className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {optLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4" />
                                            Açıklama Oluştur
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Generated Result */}
                            <div>
                                {!genResult && !optLoading ? (
                                    <div className="h-full bg-surface border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-12 opacity-40">
                                        <Wand2 size={48} className="mb-4" />
                                        <p className="font-medium">Oluşturulan İçerik</p>
                                        <p className="text-sm mt-1">Ürün bilgilerini girin ve oluşturun</p>
                                    </div>
                                ) : optLoading ? (
                                    <div className="h-full bg-surface rounded-2xl border border-border p-12 flex flex-col items-center justify-center">
                                        <div className="relative w-20 h-20 mb-6">
                                            <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
                                            <div className="relative bg-gradient-to-br from-amber-600 to-orange-600 rounded-full w-full h-full flex items-center justify-center">
                                                <Wand2 className="w-8 h-8 text-white animate-pulse" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">AI İçerik Oluşturuyor...</h3>
                                        <p className="text-slate-500 text-xs">{platform} için en ideal açıklama hazırlanıyor</p>
                                    </div>
                                ) : genResult ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-surface rounded-2xl border border-border overflow-hidden"
                                    >
                                        <div className="p-5 border-b border-border bg-amber-500/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Wand2 className="w-5 h-5 text-amber-500" />
                                                <span className="font-bold text-xs tracking-widest uppercase">Oluşturulan İçerik</span>
                                            </div>
                                            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                                                SEO: {genResult.seoScore}
                                            </span>
                                        </div>

                                        <div className="p-5 space-y-5">
                                            {/* Title */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Başlık</label>
                                                    <button onClick={() => copyText(genResult.title, 'gen-title')} className="text-slate-400 hover:text-amber-500">
                                                        {copied === 'gen-title' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <p className="p-3 bg-background border border-border rounded-xl text-sm font-bold">{genResult.title}</p>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Açıklama</label>
                                                    <button onClick={() => copyText(genResult.description, 'gen-desc')} className="text-slate-400 hover:text-amber-500">
                                                        {copied === 'gen-desc' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <div className="p-3 bg-background border border-border rounded-xl text-sm text-slate-400 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                                                    {genResult.description}
                                                </div>
                                            </div>

                                            {/* Highlights */}
                                            {genResult.highlights?.length > 0 && (
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Öne Çıkan Özellikler</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {genResult.highlights.map((h: string, i: number) => (
                                                            <span key={i} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                                                                <Star size={8} /> {h}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Keywords */}
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Anahtar Kelimeler</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {genResult.keywords?.map((kw: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-[10px] font-bold rounded">
                                                            #{kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* CTA */}
                                            {genResult.callToAction && (
                                                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                                    <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">Harekete Geçirici Mesaj</label>
                                                    <p className="text-sm text-foreground">{genResult.callToAction}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 bg-amber-500/5 border-t border-border grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => copyText(`${genResult.title}\n\n${genResult.description}`, 'gen-all')}
                                                className="flex items-center justify-center gap-1.5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                                            >
                                                {copied === 'gen-all' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                                Tümünü Kopyala
                                            </button>
                                            <button
                                                onClick={handleGenerate}
                                                className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all"
                                            >
                                                <RefreshCw size={12} />
                                                Yeniden Oluştur
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                )}
                {/* Visual Studio Tab */}
                {activeTab === 'visual' && (
                    <motion.div
                        key="visual"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Control Panel */}
                        <div className="bg-surface rounded-2xl border border-border p-6 space-y-6">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-violet-500" /> AI Görsel & Video Üretici
                            </h3>

                            <div className="flex p-1 bg-background rounded-xl border border-border">
                                <button
                                    onClick={() => setVisualMode('image')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${visualMode === 'image' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}
                                >
                                    Lifestyle Resim
                                </button>
                                <button
                                    onClick={() => setVisualMode('video')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${visualMode === 'video' ? 'bg-violet-600 text-white' : 'text-slate-500'}`}
                                >
                                    Video Short (Draft)
                                </button>
                            </div>

                            {visualMode === 'image' ? (
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tema Seçin</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Modern', 'Minimal', 'Luxury', 'Summer', 'Studio', 'Cozy'].map(theme => (
                                            <button
                                                key={theme}
                                                onClick={() => setSelectedTheme(theme.toLowerCase())}
                                                className={`p-3 rounded-xl border text-[10px] font-bold transition-all ${selectedTheme === theme.toLowerCase() ? 'bg-violet-500/10 border-violet-500 text-violet-500' : 'border-border opacity-60'}`}
                                            >
                                                {theme}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleGenerateLifestyle}
                                        disabled={visualLoading}
                                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-500/20 disabled:opacity-50"
                                    >
                                        {visualLoading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'LIFESTYLE RESİM ÜRET'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl">
                                        <p className="text-xs text-violet-500 font-medium">
                                            Yapay zeka ürününüz için 15 saniyelik bir Reels/TikTok senaryosu ve görsel konsept hazırlayacak.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleGenerateVideo}
                                        disabled={visualLoading}
                                        className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-500/20 disabled:opacity-50"
                                    >
                                        {visualLoading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'VIDEO KONSEPTİ OLUŞTUR'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Result Panel */}
                        <div className="bg-surface rounded-2xl border border-border overflow-hidden flex flex-col items-center justify-center p-6 min-h-[400px]">
                            {visualLoading ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-sm font-bold text-foreground">AI Stüdyo Çalışıyor...</p>
                                </div>
                            ) : visualResult ? (
                                visualResult.type === 'image' ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
                                        <div className="aspect-square w-full bg-background rounded-2xl overflow-hidden border border-border relative group">
                                            <img src={visualResult.url} alt="Result" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button className="p-3 bg-white text-black rounded-full"><Download size={20} /></button>
                                                <button className="p-3 bg-white text-black rounded-full"><Share2 size={20} /></button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-center text-slate-500 italic">Yapay zeka ile {selectedTheme} temasında üretildi.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
                                        <div className="p-6 bg-background border border-border rounded-2xl space-y-4">
                                            <div className="flex items-center gap-2 text-rose-500 font-bold">
                                                <Video size={18} /> {visualResult.videoName}
                                            </div>
                                            <div className="text-sm text-foreground leading-relaxed italic">
                                                "{visualResult.script}"
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                {visualResult.scenes.map((scene: any, i: number) => (
                                                    <div key={i} className="p-3 bg-surface rounded-xl border border-border space-y-1">
                                                        <div className="text-[10px] font-bold text-slate-500">Sahne {scene.sceneId}</div>
                                                        <div className="text-[10px] text-foreground line-clamp-2">{scene.description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            ) : (
                                <div className="text-center opacity-30">
                                    <ImageIcon size={64} className="mx-auto mb-4" />
                                    <p className="text-sm font-bold">Önizleme Burada Görünecek</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Platform seçici
function PlatformSelector({ platform, setPlatform }: { platform: string; setPlatform: (p: string) => void }) {
    return (
        <div className="flex items-center gap-1 p-1 bg-background rounded-xl border border-border">
            {PLATFORMS.map((p) => (
                <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex-1 py-2 px-2 rounded-lg text-[10px] font-bold transition-all ${platform === p
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-slate-500 hover:text-foreground'
                        }`}
                >
                    {p}
                </button>
            ))}
        </div>
    );
}
