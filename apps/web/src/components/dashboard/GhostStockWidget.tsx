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
        <div className="bg-surface rounded-3xl border border-border p-6 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none">
                <Ghost size={120} />
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20">
                        <Ghost className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Ghost Stock Tahmini</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Stok x Satış Hızı Analizi</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-black rounded-lg border border-orange-500/20">
                    KRİTİK
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {predictions.map((p) => (
                    <div key={p.id} className="p-4 bg-background border border-border rounded-2xl hover:border-orange-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{p.product}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 text-[9px] text-slate-500 uppercase font-bold">
                                        <TrendingUp size={10} /> {p.velocity}/gün satış
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-orange-500">{p.daysLeft} GÜN</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase">Kalan Süre</div>
                            </div>
                        </div>

                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(p.stock / (p.velocity * 10)) * 100}%` }}
                                className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Tükenme: {p.predictionDate}</span>
                            </div>
                            <button className="flex items-center gap-1 text-[10px] font-black text-primary hover:gap-2 transition-all">
                                TEDARİK ET <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                <div className="flex gap-3">
                    <div className="mt-0.5"><AlertTriangle className="w-4 h-4 text-orange-500" /></div>
                    <p className="text-[10px] text-orange-500/80 font-medium leading-relaxed">
                        <strong>Ghost Stock Uyarısı:</strong> Mevcut stok miktarınız yeterli görünse de, satış ivmenizdeki artış sebebiyle 3 ürün pazartesi gününden önce tükenecek.
                    </p>
                </div>
            </div>
        </div>
    );
};
