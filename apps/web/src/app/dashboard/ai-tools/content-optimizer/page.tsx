"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Brain,
    Target,
    Zap,
    RefreshCw,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Search,
    Copy,
    Save,
    Share2,
    Globe
} from 'lucide-react';
import { useContentOptimizer, OptimizedContent } from '@/lib/hooks';

export default function ContentOptimizerPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [platform, setPlatform] = useState('Trendyol');
    const [result, setResult] = useState<OptimizedContent | null>(null);
    const { optimize, loading } = useContentOptimizer();

    const handleOptimize = async () => {
        if (!title || !description) return;
        const res = await optimize(title, description, platform);
        if (res) setResult(res);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Brain className="w-8 h-8 text-purple-500" />
                        AI İçerik Optimizasyonu
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Ürün içeriklerinizi Gemini ile pazaryeri SEO kurallarına göre mükemmelleştirin
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Panel */}
                <div className="space-y-6">
                    <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 p-1 bg-background rounded-xl border border-border">
                            {['Trendyol', 'Hepsiburada', 'Amazon', 'N11'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPlatform(p)}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${platform === p
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'text-slate-500 hover:text-foreground'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Mevcut Ürün Başlığı</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Örn: Kablosuz Kulaklık"
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Ürün Açıklaması</label>
                            <textarea
                                rows={8}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ürün detaylarını, teknik özelliklerini buraya yazın..."
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                            />
                        </div>

                        <button
                            onClick={handleOptimize}
                            disabled={loading || !title || !description}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    SEO Optimizasyonu Başlat
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    {!result && !loading ? (
                        <div className="h-full bg-surface border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-12 opacity-40">
                            <Search size={48} className="mb-4" />
                            <p className="font-medium">Analiz Sonuçları</p>
                            <p className="text-sm">Analiz sonuçları ve öneriler burada görüntülenecek.</p>
                        </div>
                    ) : loading ? (
                        <div className="h-full bg-surface rounded-2xl border border-border p-12 flex flex-col items-center justify-center text-center">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
                                <div className="relative bg-purple-600 rounded-full w-full h-full flex items-center justify-center">
                                    <Brain className="w-10 h-10 text-white animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">AI Analiz Ediyor...</h3>
                            <p className="text-slate-500 text-sm">
                                {platform} algoritmaları ve güncel SEO trendleri taranıyor.
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface rounded-2xl border border-border overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-purple-500/5">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <span className="font-bold text-sm tracking-widest uppercase">Optimum İçerik</span>
                                </div>
                                <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                                    SEO SKORU: {result?.seoScoreAfter}
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Önerilen Başlık</label>
                                        <button className="text-slate-400 hover:text-purple-500 transition-colors">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <p className="p-4 bg-background border border-border rounded-xl text-sm font-bold">
                                        {result?.optimizedTitle}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Optimize Edilmiş Açıklama</label>
                                        <button className="text-slate-400 hover:text-purple-500 transition-colors">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <div className="p-4 bg-background border border-border rounded-xl text-sm text-slate-400 leading-relaxed max-h-[200px] overflow-y-auto">
                                        {result?.optimizedDescription}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Anahtar Kelimeler</label>
                                        <div className="flex flex-wrap gap-2">
                                            {result?.keywords.map((kw, i) => (
                                                <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded">
                                                    #{kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">İyileştirmeler</label>
                                        <ul className="space-y-1">
                                            {result?.improvements.map((imp, i) => (
                                                <li key={i} className="text-[10px] text-green-400 flex items-center gap-1">
                                                    <CheckCircle2 size={10} />
                                                    {imp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center gap-2 py-3 bg-background border border-border rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                                        <Save size={16} />
                                        Taslak Olarak Kaydet
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                                        <Globe size={16} />
                                        Pazaryerine Gönder
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
