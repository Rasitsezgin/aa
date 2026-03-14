"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Globe, TrendingUp, DollarSign, ShoppingCart,
    ArrowUpRight, ArrowDownRight, Store, ExternalLink,
    Zap, Star, AlertCircle, CheckCircle2, Sparkles
} from 'lucide-react';

interface MarketplaceHealth {
    name: string;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    score: number;
    metrics: {
        listingHealth: number;
        priceCompetitiveness: number;
        stockAvailability: number;
        customerSatisfaction: number;
        shippingPerformance: number;
    };
    alerts: string[];
    aiRecommendation: string;
}

const fallbackData: MarketplaceHealth[] = [
    {
        name: 'Trendyol',
        status: 'excellent',
        score: 92,
        metrics: { listingHealth: 95, priceCompetitiveness: 88, stockAvailability: 85, customerSatisfaction: 96, shippingPerformance: 94 },
        alerts: [],
        aiRecommendation: 'Fiyatları %5 artırabilirsiniz, rakipleriniz ortalama %12 pahalı',
    },
    {
        name: 'Hepsiburada',
        status: 'good',
        score: 78,
        metrics: { listingHealth: 82, priceCompetitiveness: 75, stockAvailability: 70, customerSatisfaction: 85, shippingPerformance: 78 },
        alerts: ['3 ürün listede görünmüyor'],
        aiRecommendation: 'SEO skorunuz düşük, ürün başlıklarını optimize edin',
    },
    {
        name: 'Amazon',
        status: 'good',
        score: 85,
        metrics: { listingHealth: 88, priceCompetitiveness: 82, stockAvailability: 80, customerSatisfaction: 90, shippingPerformance: 86 },
        alerts: [],
        aiRecommendation: 'Prime uyumlu ürün sayısını artırın, dönüşüm %35 artabilir',
    },
    {
        name: 'N11',
        status: 'warning',
        score: 65,
        metrics: { listingHealth: 70, priceCompetitiveness: 60, stockAvailability: 55, customerSatisfaction: 72, shippingPerformance: 68 },
        alerts: ['Stok güncelleme sıklığı düşük', '2 olumsuz yorum yanıtlanmadı'],
        aiRecommendation: 'Stok sync sıklığını artırın, günlük ₺850 kayıp tespit edildi',
    },
];

interface MarketplaceHealthMapProps {
    data?: MarketplaceHealth[];
}

export default function MarketplaceHealthMap({ data: propData }: MarketplaceHealthMapProps) {
    const data = propData && propData.length > 0 ? propData : fallbackData;
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'excellent': return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30', label: 'Mükemmel' };
            case 'good': return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30', label: 'İyi' };
            case 'warning': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30', label: 'Dikkat' };
            case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30', label: 'Kritik' };
            default: return { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/30', label: 'Bilinmiyor' };
        }
    };

    const metricLabels: Record<string, string> = {
        listingHealth: 'Liste Sağlığı',
        priceCompetitiveness: 'Fiyat Rekabeti',
        stockAvailability: 'Stok Erişilebilirliği',
        customerSatisfaction: 'Müşteri Memnuniyeti',
        shippingPerformance: 'Kargo Performansı',
    };

    return (
        <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Pazaryeri Sağlık Haritası</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Gerçek Zamanlı</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {data.map((platform) => {
                    const style = getStatusStyle(platform.status);
                    const isSelected = selectedPlatform === platform.name;

                    return (
                        <motion.div
                            key={platform.name}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                isSelected ? `${style.border} ${style.bg}` : 'border-border hover:border-primary/30'
                            }`}
                            onClick={() => setSelectedPlatform(isSelected ? null : platform.name)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-foreground">{platform.name}</span>
                                {platform.alerts.length > 0 && (
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                )}
                            </div>

                            {/* Score Circle */}
                            <div className="flex items-center justify-center mb-3">
                                <div className="relative w-16 h-16">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            className="text-border"
                                            strokeWidth="3"
                                        />
                                        <motion.path
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            className={style.text}
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: '0 100' }}
                                            animate={{ strokeDasharray: `${platform.score} 100` }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-lg font-black ${style.text}`}>{platform.score}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <span className={`text-[10px] font-bold ${style.text} ${style.bg} px-2 py-0.5 rounded-full`}>
                                    {style.label}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Selected Platform Details */}
            {selectedPlatform && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 p-4 rounded-xl bg-background/50 border border-border"
                >
                    {(() => {
                        const platform = data.find(p => p.name === selectedPlatform);
                        if (!platform) return null;

                        return (
                            <>
                                <h4 className="text-sm font-bold text-foreground mb-3">{platform.name} Detay Metrikleri</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                                    {Object.entries(platform.metrics).map(([key, value]) => (
                                        <div key={key} className="text-center">
                                            <div className={`text-lg font-black ${value >= 80 ? 'text-green-500' : value >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                                                %{value}
                                            </div>
                                            <div className="text-[10px] text-slate-500">{metricLabels[key]}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Recommendation */}
                                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span className="text-xs text-primary font-medium">{platform.aiRecommendation}</span>
                                    </div>
                                </div>

                                {/* Alerts */}
                                {platform.alerts.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {platform.alerts.map((alert, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-[10px] text-amber-500">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>{alert}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </motion.div>
            )}
        </div>
    );
}
