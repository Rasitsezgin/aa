'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Activity } from 'lucide-react';
import { useDashboardStats } from '@/lib/hooks';

interface RadarData {
    label: string;
    value: number;
    max: number;
}

export const SalesRadar3D = () => {
    const [scanAngle, setScanAngle] = useState(0);
    const { data: stats, loading } = useDashboardStats('24h');

    useEffect(() => {
        const scanInterval = setInterval(() => {
            setScanAngle(prev => (prev + 2) % 360);
        }, 30);

        return () => {
            clearInterval(scanInterval);
        };
    }, []);

    // Gerçek veriden radar metrikleri oluştur
    const radarData: RadarData[] = stats ? [
        { label: 'Gelir', value: (stats as any)?.totalRevenue || 0, max: ((stats as any)?.totalRevenue || 1) * 1.2 },
        { label: 'Sipariş', value: (stats as any)?.totalOrders || 0, max: ((stats as any)?.totalOrders || 1) * 1.2 },
        { label: 'Kâr', value: (stats as any)?.netProfit || 0, max: ((stats as any)?.netProfit || 1) * 1.2 },
        { label: 'Marj', value: ((stats as any)?.profitMargin || 0) * 100, max: 100 },
    ] : [];

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `₺${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `₺${(value / 1000).toFixed(1)}K`;
        return `₺${value.toFixed(0)}`;
    };

    return (
        <div className="bg-surface rounded-3xl border border-border p-8 relative overflow-hidden h-[400px] flex items-center justify-center group">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5" />

            {/* Radar Lines */}
            <div className="relative w-[300px] h-[300px] rounded-full border border-indigo-500/20 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full border border-indigo-500/10" />
                <div className="absolute inset-16 rounded-full border border-indigo-500/10" />
                <div className="absolute inset-32 rounded-full border border-indigo-500/10" />

                {/* Axis Lines */}
                <div className="absolute w-full h-[1px] bg-indigo-500/5" />
                <div className="absolute w-[1px] h-full bg-indigo-500/5" />

                {/* Scanning Beam */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(99, 102, 241, 0.2) 60deg, transparent 61deg)',
                        transform: `rotate(${scanAngle}deg)`
                    }}
                />

                {/* Real Data Display */}
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-500">
                        Veriler yükleniyor...
                    </div>
                ) : stats ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-black text-indigo-500">
                            {formatCurrency((stats as any)?.totalRevenue || 0)}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">24s Gelir</div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-500 text-center px-10">
                        Canlı satış verisi bulunamadı
                    </div>
                )}

                {/* Center Core */}
                <div className="w-8 h-8 rounded-full bg-surface border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] z-10 flex items-center justify-center animate-pulse">
                    <Target className="w-4 h-4 text-indigo-500" />
                </div>
            </div>

            {/* Sidebar Stats - Gerçek Veriler */}
            <div className="absolute right-8 top-8 bottom-8 w-32 flex flex-col gap-3 justify-center">
                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">CANLI NABIZ</div>
                    <div className="text-sm font-black text-indigo-400">AKTİF</div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">24s SİPARİŞ</div>
                    <div className="text-sm font-black text-emerald-500">
                        {(stats as any)?.totalOrders || 0}
                    </div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">NET KÂR</div>
                    <div className="text-sm font-black text-pink-500">
                        {formatCurrency((stats as any)?.netProfit || 0)}
                    </div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-bold text-white uppercase tracking-tighter">KÂR MARJ</div>
                    <div className="text-sm font-black text-amber-500">
                        %{((stats as any)?.profitMargin || 0).toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute left-8 bottom-8 flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Gelir</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Canlı</span>
                </div>
            </div>

            {/* Header Text */}
            <div className="absolute left-8 top-8">
                <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                    Canlı Satış Radarı
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] rounded-full flex items-center gap-1">
                        <Activity className="w-3 h-3" /> LIVE
                    </span>
                </h3>
                <p className="text-xs text-slate-500">Gerçek zamanlı satış sinyalleri</p>
            </div>
        </div>
    );
};
