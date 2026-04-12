"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Target,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Download,
    Lightbulb,
    Eye,
    MousePointer,
    ShoppingCart,
    ChevronDown,
    Sparkles,
    Zap
} from 'lucide-react';
import { useSeoAnalysis } from '@/lib/hooks';

export default function SEOPage() {
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterScore, setFilterScore] = useState('all');
    const { analysis: apiSeoData, loading } = useSeoAnalysis();

    const activeProductsData = (Array.isArray(apiSeoData) && apiSeoData.length > 0) ? apiSeoData : [];
    const activeSeoTips = [
        "Başlıklarda ilk 60 karakteri optimize edin - bu alan arama sonuçlarında görünür",
        "En az 5 yüksek kaliteli ürün görseli ekleyin",
        "Ürün açıklamasında anahtar kelimeleri doğal şekilde kullanın",
        "Müşteri sorularını açıklamada yanıtlayın",
        "Teknik özellikleri bullet point olarak listeleyin"
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getImpactBadge = (impact: string) => {
        switch (impact) {
            case 'high':
                return <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500">Yüksek</span>;
            case 'medium':
                return <span className="px-2 py-1 rounded text-[10px] font-bold bg-yellow-500/10 text-yellow-500">Orta</span>;
            default:
                return <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500">Düşük</span>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'error':
                return <AlertTriangle size={14} className="text-red-500" />;
            case 'warning':
                return <AlertTriangle size={14} className="text-yellow-500" />;
            default:
                return <Lightbulb size={14} className="text-blue-500" />;
        }
    };

    const averageScore = Math.round(activeProductsData.reduce((sum: number, p: any) => sum + p.score, 0) / activeProductsData.length);
    const totalIssues = activeProductsData.reduce((sum: number, p: any) => sum + p.issues, 0);

    const filteredProducts = activeProductsData.filter((product: any) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesScore = filterScore === 'all' ||
            (filterScore === 'good' && product.score >= 80) ||
            (filterScore === 'warning' && product.score >= 60 && product.score < 80) ||
            (filterScore === 'bad' && product.score < 60);
        return matchesSearch && matchesScore;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-slate-500">SEO verileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">SEO Optimizasyonu</h1>
                    <p className="text-slate-500 font-medium">Ürünlerinizin arama görünürlüğünü artırın</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <Download size={16} /> Rapor İndir
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Sparkles size={16} /> Toplu Optimizasyon
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <Target size={20} className="text-primary" />
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-500">
                            <TrendingUp size={12} /> +5
                        </div>
                    </div>
                    <div className={`text-2xl font-black ${getScoreColor(averageScore)}`}>{averageScore}</div>
                    <div className="text-xs text-slate-500 mt-1">Ortalama SEO Skoru</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-red-500/10">
                            <AlertTriangle size={20} className="text-red-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">{totalIssues}</div>
                    <div className="text-xs text-slate-500 mt-1">Kritik Sorun</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                            <Eye size={20} className="text-blue-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">51.2K</div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Görüntüleme</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-green-500/10">
                            <MousePointer size={20} className="text-green-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">%3.4</div>
                    <div className="text-xs text-slate-500 mt-1">Ort. Tıklama Oranı</div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { id: 'all', label: 'Tümü' },
                        { id: 'bad', label: 'Kritik', color: 'text-red-500' },
                        { id: 'warning', label: 'Uyarı', color: 'text-yellow-500' },
                        { id: 'good', label: 'İyi', color: 'text-green-500' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setFilterScore(filter.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filterScore === filter.id
                                    ? 'bg-primary text-white'
                                    : 'bg-background border border-border text-foreground hover:bg-surface'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Products List */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredProducts.map((product: any, idx: number) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`bg-surface rounded-2xl border ${selectedProduct === product.id ? 'border-primary/50' : 'border-border'
                                } overflow-hidden cursor-pointer hover:border-primary/30 transition-all`}
                            onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-background border border-border text-slate-500">
                                                {product.platform}
                                            </span>
                                            {product.issues > 0 && (
                                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500">
                                                    {product.issues} sorun
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-foreground line-clamp-1">{product.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`text-2xl font-black ${getScoreColor(product.score)}`}>
                                            {product.score}
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            className={`text-slate-400 transition-transform ${selectedProduct === product.id ? 'rotate-180' : ''}`}
                                        />
                                    </div>
                                </div>

                                <div className="h-2 bg-background rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${product.score}%` }}
                                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                                        className={`h-full ${getScoreBg(product.score)}`}
                                    />
                                </div>

                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Eye size={14} className="text-slate-400" />
                                        <span className="text-slate-500">{product.views.toLocaleString('tr-TR')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MousePointer size={14} className="text-slate-400" />
                                        <span className="text-slate-500">%{product.ctr}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <ShoppingCart size={14} className="text-slate-400" />
                                        <span className="text-slate-500">%{product.conversion}</span>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedProduct === product.id && product.improvements.length > 0 && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-border"
                                    >
                                        <div className="p-5 space-y-3">
                                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">İyileştirme Önerileri</h4>
                                            {product.improvements.map((improvement: any, i: number) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-background rounded-xl">
                                                    {getTypeIcon(improvement.type)}
                                                    <div className="flex-1">
                                                        <p className="text-sm text-foreground">{improvement.message}</p>
                                                    </div>
                                                    {getImpactBadge(improvement.impact)}
                                                </div>
                                            ))}
                                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
                                                <Zap size={14} /> AI ile Otomatik Düzelt
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* SEO Tips */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-primary/10 to-purple-500/5 rounded-2xl border border-primary/20 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={18} className="text-primary" />
                            <h3 className="font-bold text-foreground">SEO İpuçları</h3>
                        </div>
                        <div className="space-y-3">
                            {activeSeoTips.map((tip: string, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-slate-500">{tip}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-surface rounded-2xl border border-border p-5">
                        <h3 className="font-bold text-foreground mb-4">Skor Dağılımı</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Mükemmel (80+)', count: activeProductsData.filter((p: any) => p.score >= 80).length, color: 'bg-green-500' },
                                { label: 'İyi (60-79)', count: activeProductsData.filter((p: any) => p.score >= 60 && p.score < 80).length, color: 'bg-yellow-500' },
                                { label: 'Kötü (0-59)', count: activeProductsData.filter((p: any) => p.score < 60).length, color: 'bg-red-500' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded ${item.color}`} />
                                        <span className="text-sm text-slate-500">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
