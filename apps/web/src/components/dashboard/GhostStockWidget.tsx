'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Ghost, AlertTriangle, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

interface GhostStock {
    id: string;
    product: string;
    stock: number;
    daysLeft: number;
    predictionDate: string;
    velocity: number;
}

export const GhostStockWidget = () => {
    const predictions: GhostStock[] = [
        { id: '1', product: 'Oppo Enco Buds 2', stock: 42, daysLeft: 3, predictionDate: '12 Mart', velocity: 14 },
        { id: '2', product: 'Xiaomi Mi Band 7', stock: 15, daysLeft: 2, predictionDate: '11 Mart', velocity: 7.5 }
    ];

    return (
        <div className="bg-surface rounded-3xl border border-border p-6 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                <Ghost size={140} />
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20 shadow-inner">
                        <Ghost className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground uppercase tracking-tight">Ghost Stock Tahmini</h3>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Stok x Satış Hızı Analizi</p>
                    </div>
                </div>
                <div className="px-3 py-1.5 bg-orange-500/10 text-orange-500 text-[10px] font-black rounded-lg border border-orange-500/20">
                    KRİTİK
                </div>
            </div>

            <div className="space-y-5 relative z-10 flex-1">
                {predictions.map((p) => (
                    <div key={p.id} className="p-5 bg-background/40 backdrop-blur-sm border border-border rounded-2xl hover:border-orange-500/30 transition-all group shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="min-w-0 flex-1 pr-4">
                                <div className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors truncate">{p.product}</div>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                                        <TrendingUp size={12} className="text-orange-500/70" /> 
                                        <span>{p.velocity}/gün</span>
                                        <span className="text-slate-400">satış hızı</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-base font-black text-orange-500 leading-none">{p.daysLeft} GÜN</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Kalan Süre</div>
                            </div>
                        </div>

                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(p.stock / (p.velocity * 10)) * 100}%` }}
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.4)]"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-1 font-medium">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calendar size={13} />
                                <span className="text-[11px] font-bold uppercase tracking-tight">Tükenme: {p.predictionDate}</span>
                            </div>
                            <button className="flex items-center gap-1.5 text-[11px] font-black text-primary hover:gap-2.5 transition-all uppercase tracking-wider bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                                TEDARİK ET <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl shadow-sm">
                <div className="flex gap-3.5">
                    <div className="mt-1 flex-shrink-0">
                        <div className="p-1 bg-orange-500/20 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-[11px] text-orange-600/90 font-semibold leading-relaxed">
                        <span className="text-orange-600 font-black uppercase mr-1">Zeki Uyarı:</span> 
                        Mevcut stok miktarınız yeterli görünse de, satış ivmenizdeki artış sebebiyle 3 ürün pazartesi gününden önce tükenecek.
                    </p>
                </div>
            </div>
        </div>
    );
};
