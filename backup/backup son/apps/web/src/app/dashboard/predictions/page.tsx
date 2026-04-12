"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Calendar,
    Target,
    Zap,
    AlertCircle,
    CheckCircle2,
    Clock,
    RefreshCw,
    Download,
    ChevronRight,
    Sparkles,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    ShoppingCart,
    DollarSign
} from 'lucide-react';
import { useMarketIntelForecast, usePredictions, Prediction } from '@/lib/hooks';

interface PredictionInsight {
    type: string;
    title: string;
    description: string;
    action: string;
    impact: string;
}

interface PredictionSummary {
    expectedRevenue: number;
    growthRate: number;
}

interface PredictionProduct {
    id: string;
    product: string;
    currentSales: number;
    predictedSales: number;
    change: number;
    confidence: number;
    trend: string;
    factors: string[];
}

export default function PredictionsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');
    const [showDetails, setShowDetails] = useState<string | null>(null);

    const { data: realForecast, loading: forecastLoading } = useMarketIntelForecast('general');
    const { predictions: apiPredictions, loading: predictionsLoading } = usePredictions();

    const salesPredictions: PredictionProduct[] = (Array.isArray(apiPredictions) && apiPredictions.length > 0) ? (apiPredictions as Prediction[]).map((p) => ({
        id: p.id,
        product: p.productName || p.productId,
        currentSales: p.currentValue || 0,
        predictedSales: p.predictedValue || 0,
        change: p.predictedValue && p.currentValue ? ((p.predictedValue - p.currentValue) / p.currentValue * 100) : 0,
        confidence: p.confidence || 0,
        trend: p.trend || 'stable',
        factors: p.insights || []
    })) : [];

    const forecastFirst = Array.isArray(realForecast) && realForecast.length > 0 ? realForecast[0] : null;

    const weeklyForecast = (Array.isArray((forecastFirst as any)?.forecast) ? (forecastFirst as any).forecast : []).map((f: any) => ({
        day: f.date || '',
        predicted: f.predicted || 0,
        actual: null
    }));

    const insights: PredictionInsight[] = (Array.isArray((forecastFirst as any)?.insights) ? (forecastFirst as any).insights : []).map((i: any) => ({
        type: i.type || 'info',
        title: i.title || '',
        description: i.description || '',
        action: 'Detayları Gör',
        impact: 'medium'
    }));

    const forecastSummary = (forecastFirst as any)?.summary;
    const totalPredictedRevenue = forecastSummary?.expectedRevenue || 0;
    const accuracy = forecastSummary?.growthRate ? Math.min(Math.round(forecastSummary.growthRate), 100) : 0;
    const activeModels = salesPredictions.length || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Brain className="w-8 h-8 text-purple-500" />
                            Satış Tahminleri
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            AI destekli satış öngörüleri ve tahminler
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-slate-600 dark:text-slate-300 hover:text-foreground transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Tahminleri Güncelle
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Rapor İndir
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-900/40 dark:to-purple-800/20 rounded-2xl p-5 border border-purple-500/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl">
                            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Tahmini Gelir (7 Gün)</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        ₺{totalPredictedRevenue.toLocaleString('tr-TR')}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+12.5% önceki haftaya göre</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-900/40 dark:to-green-800/20 rounded-2xl p-5 border border-green-500/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-xl">
                            <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Tahmin Doğruluğu</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">%{accuracy}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-3">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${accuracy}%` }}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl p-5 border border-blue-500/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Aktif AI Modelleri</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{activeModels}</div>
                    <div className="flex items-center gap-1 mt-2 text-blue-400 text-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Tüm modeller aktif</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-900/40 dark:to-orange-800/20 rounded-2xl p-5 border border-orange-500/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-500/20 rounded-xl">
                            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Son Güncelleme</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">2 saat önce</div>
                    <div className="flex items-center gap-1 mt-2 text-orange-400 text-sm">
                        <RefreshCw className="w-4 h-4" />
                        <span>Otomatik güncelleme aktif</span>
                    </div>
                </motion.div>
            </div>

            {/* Period Selection */}
            <div className="flex items-center gap-2 mb-6">
                {['daily', 'weekly', 'monthly'].map((period) => (
                    <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === period
                            ? 'bg-purple-600 text-white'
                            : 'bg-surface border border-border text-slate-500 hover:text-foreground'
                            }`}
                    >
                        {period === 'daily' && 'Günlük'}
                        {period === 'weekly' && 'Haftalık'}
                        {period === 'monthly' && 'Aylık'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Weekly Forecast Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-border"
                >
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        Haftalık Satış Tahmini
                    </h2>
                    <div className="space-y-4">
                        {weeklyForecast.map((day: any, index: number) => (
                            <div key={day.day} className="flex items-center gap-4">
                                <div className="w-24 text-sm text-slate-600 dark:text-slate-400">{day.day}</div>
                                <div className="flex-1 relative">
                                    <div className="h-8 bg-background rounded-xl border border-border overflow-hidden relative">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(day.predicted / 25000) * 100}%` }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                            className="h-full bg-purple-500/40 rounded-lg"
                                        />
                                        {day.actual && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(day.actual / 25000) * 100}%` }}
                                                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                                                className="absolute top-0 left-0 h-full bg-green-500/60 rounded-lg"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="w-28 text-right">
                                    <div className="text-sm font-medium text-foreground">
                                        ₺{day.predicted.toLocaleString('tr-TR')}
                                    </div>
                                    {day.actual && (
                                        <div className={`text-xs ${day.actual >= day.predicted ? 'text-green-400' : 'text-red-400'}`}>
                                            Gerçek: ₺{day.actual.toLocaleString('tr-TR')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500/40" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Tahmin</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Gerçekleşen</span>
                        </div>
                    </div>
                </motion.div>

                {/* AI Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface rounded-2xl p-6 border border-border"
                >
                    <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        AI İçgörüleri
                    </h2>
                    <div className="space-y-4">
                        {insights.map((insight, index: number) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-4 rounded-lg border ${insight.type === 'opportunity'
                                    ? 'bg-green-900/20 border-green-500/30'
                                    : insight.type === 'warning'
                                        ? 'bg-yellow-900/20 border-yellow-500/30'
                                        : 'bg-blue-900/20 border-blue-500/30'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {insight.type === 'opportunity' && (
                                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    {insight.type === 'warning' && (
                                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    {insight.type === 'info' && (
                                        <Eye className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-foreground">{insight.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{insight.description}</p>
                                        <button className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                                            {insight.action}
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Product Predictions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-2xl border border-border overflow-hidden"
            >
                <div className="p-6 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-purple-500" />
                        Ürün Bazlı Satış Tahminleri
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-background">
                            <tr>
                                <th className="text-left p-4 text-slate-500 text-sm font-bold">Ürün</th>
                                <th className="text-right p-4 text-slate-500 text-sm font-bold">Mevcut Satış</th>
                                <th className="text-right p-4 text-slate-500 text-sm font-bold">Tahmini Satış</th>
                                <th className="text-right p-4 text-slate-500 text-sm font-bold">Değişim</th>
                                <th className="text-center p-4 text-slate-500 text-sm font-bold">Güven Oranı</th>
                                <th className="text-center p-4 text-slate-500 text-sm font-bold">Detay</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {salesPredictions.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className="hover:bg-background/50 transition-colors">
                                        <td className="p-4">
                                            <span className="text-foreground font-medium">{item.product}</span>
                                        </td>
                                        <td className="p-4 text-right text-slate-600 dark:text-slate-300">{item.currentSales} adet</td>
                                        <td className="p-4 text-right text-foreground font-medium">{item.predictedSales} adet</td>
                                        <td className="p-4 text-right">
                                            <span className={`flex items-center justify-end gap-1 ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {item.trend === 'up' ? (
                                                    <TrendingUp className="w-4 h-4" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4" />
                                                )}
                                                {item.change > 0 ? '+' : ''}{item.change}%
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${item.confidence >= 90
                                                            ? 'bg-green-500'
                                                            : item.confidence >= 80
                                                                ? 'bg-blue-500'
                                                                : 'bg-yellow-500'
                                                            }`}
                                                        style={{ width: `${item.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-500">%{item.confidence}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setShowDetails(showDetails === String(item.id) ? null : String(item.id))}
                                                className="p-2 text-slate-500 hover:text-foreground hover:bg-background rounded-lg transition-colors"
                                            >
                                                <ChevronRight className={`w-4 h-4 transition-transform ${showDetails === String(item.id) ? 'rotate-90' : ''}`} />
                                            </button>
                                        </td>
                                    </tr>
                                    {showDetails === String(item.id) && (
                                        <tr>
                                            <td colSpan={6} className="p-4 bg-slate-100 dark:bg-slate-800/30">
                                                <div className="flex items-start gap-3">
                                                    <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-foreground mb-2">Tahmin Faktörleri:</h4>
                                                        <ul className="space-y-1">
                                                            {item.factors.map((factor, i: number) => (
                                                                <li key={i} className="text-sm text-slate-500 flex items-center gap-2">
                                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                                                    {factor}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
