'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ghost, AlertTriangle, TrendingUp, Calendar, ChevronRight, Brain } from 'lucide-react';
import { useStockAlerts } from '@/lib/hooks';

interface GhostStock {
    id: string;
    product: string;
    stock: number;
    daysLeft: number;
    predictionDate: string;
    velocity: number;
}

export const GhostStockWidget = () => {
    const { data: stockAlerts, loading } = useStockAlerts();

    // Gerçek stok uyarılarından ghost stock tahminleri oluştur
    const predictions: GhostStock[] = React.useMemo(() => {
        if (!stockAlerts || !Array.isArray(stockAlerts)) return [];
        
        return stockAlerts
            .filter((alert: any) => alert.daysUntilStockout && alert.daysUntilStockout <= 7)
            .slice(0, 2)
            .map((alert: any, idx: number) => {
                const daysLeft = alert.daysUntilStockout || 1;
                const predictionDate = new Date();
                predictionDate.setDate(predictionDate.getDate() + daysLeft);
                
                return {
                    id: alert.id || `${idx}`,
                    product: alert.productName || alert.product || 'Bilinmeyen Ürün',
                    stock: alert.currentStock || 0,
                    daysLeft,
                    predictionDate: predictionDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                    velocity: alert.velocity || Math.round((alert.currentStock || 0) / Math.max(daysLeft, 1))
                };
            });
    }, [stockAlerts]);

    return (
        <div className="bg-surface rounded-3xl border border-border p-6 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                <Ghost size={140} />
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20 shadow-inner shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <Ghost className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                        <h3 className="text-[14px] font-black text-foreground uppercase tracking-tight truncate">Ghost Stock</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Stok Tahmini</p>
                    </div>
                </div>
                <div className="px-2.5 py-1.5 bg-red-500 text-white text-[9px] font-black rounded-full shadow-lg shadow-red-500/20 shrink-0 animate-pulse">
                    KRİTİK
                </div>
            </div>

            <div className="space-y-4 relative z-10 flex-1">
                {predictions.length > 0 ? predictions.map((p) => (
                    <div key={p.id} className="p-4 bg-background/50 backdrop-blur-md border border-border rounded-2xl hover:border-orange-500/30 transition-all group/item shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className="min-w-0 flex-1 pr-3">
                                <div className="text-[13px] font-bold text-foreground group-hover/item:text-orange-500 transition-colors truncate">{p.product}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <TrendingUp size={11} className="text-orange-500" /> 
                                        <span>{p.velocity}/gün</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-[14px] font-black text-orange-600 leading-none">{p.daysLeft} GÜN</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Kalan</div>
                            </div>
                        </div>

                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((p.stock / (p.velocity * 10)) * 100, 100)}%` }}
                                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                            />
                        </div>

                        <div className="flex items-center justify-between font-medium">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <Calendar size={12} />
                                <span className="text-[10px] font-bold uppercase">{p.predictionDate}</span>
                            </div>
                            <button className="flex items-center gap-1 text-[10px] font-black text-primary hover:gap-2 transition-all uppercase tracking-wider bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
                                TEDARİK <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                        <Ghost className="w-10 h-10 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Kritik Ürün Yok</p>
                    </div>
                )}
            </div>

            <div className={`mt-6 p-4 rounded-2xl border transition-all duration-500 ${predictions.length > 0 
                ? 'bg-orange-500/10 border-orange-500/20 shadow-lg shadow-orange-500/5' 
                : 'bg-green-500/10 border-green-500/20 shadow-lg shadow-green-500/5'}`}>
                <div className="flex gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                        <div className={`p-1.5 rounded-xl ${predictions.length > 0 ? 'bg-orange-500/20' : 'bg-green-500/20'}`}>
                            {predictions.length > 0 ? (
                                <AlertTriangle className="w-4 h-4 text-orange-600" />
                            ) : (
                                <Brain className="w-4 h-4 text-green-600" />
                            )}
                        </div>
                    </div>
                    <div>
                        <div className={`text-[11px] font-black uppercase tracking-wider mb-0.5 ${predictions.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            Zeki Uyarı
                        </div>
                        <p className={`text-[11px] font-bold leading-relaxed ${predictions.length > 0 ? 'text-orange-700/80' : 'text-green-700/80'}`}>
                            {predictions.length > 0 
                                ? `${predictions.length} ürün tükenmek üzere. Hemen aksiyon alın.`
                                : 'Mevcut stok durumu stabil. Kritik seviyede ürün bulunmuyor.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
