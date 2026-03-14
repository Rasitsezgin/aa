'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Zap, TrendingDown, Target, Bell, Settings } from 'lucide-react';

interface DefenseAction {
    id: string;
    product: string;
    competitor: string;
    action: string;
    impact: string;
    timestamp: string;
}

export const DefenseShieldWidget = () => {
    const [isActive, setIsActive] = useState(true);
    const [actions, setActions] = useState<DefenseAction[]>([
        {
            id: '1',
            product: 'iPhone 15 Case',
            competitor: 'Amazon Seller X',
            action: 'Fiyat %2 düşürüldü',
            impact: 'Buybox korundu',
            timestamp: '2 dk önce'
        },
        {
            id: '2',
            product: 'Gaming Mouse',
            competitor: 'Trendyol Mağaza Y',
            action: 'Kampanya eşleşmesi',
            impact: 'Satış hızı %15 arttı',
            timestamp: '15 dk önce'
        }
    ]);

    return (
        <div className="bg-surface rounded-3xl border border-border p-6 relative overflow-hidden h-full">
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${isActive ? 'from-emerald-500/5 via-transparent to-blue-500/5' : 'from-slate-500/5 via-transparent to-slate-500/5'}`} />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border transition-all ${isActive ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-500/10 border-slate-500 text-slate-500'}`}>
                        {isActive ? <ShieldCheck className="w-6 h-6 animate-pulse" /> : <ShieldAlert className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Otonom Savunma Kalkanı</h3>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{isActive ? 'Aktif - Rakip Takibinde' : 'Pasif - Manuel Mod'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsActive(!isActive)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${isActive ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-surface border-border text-slate-500'}`}
                >
                    {isActive ? 'DURDUR' : 'AKTİF ET'}
                </button>
            </div>

            {/* Shield Visualization */}
            <div className="relative flex flex-col items-center justify-center py-4 bg-background/50 rounded-2xl border border-border/50 mb-6">
                <div className="text-center">
                    <div className="text-[32px] font-black text-foreground leading-none">98.4%</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">GÜVENLİK SKORU</div>
                </div>
                <div className="mt-4 flex gap-8">
                    <div className="text-center">
                        <div className="text-xs font-bold text-emerald-500">24</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase">Engellenen Tehdit</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-bold text-blue-500">₺14.2K</div>
                        <div className="text-[8px] font-bold text-slate-500 uppercase">Kurtarılan Ciro</div>
                    </div>
                </div>
            </div>

            {/* Defense Timeline */}
            <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Son Koruma Aksiyonları</span>
                    <button className="text-[10px] font-bold text-primary hover:underline">TÜMÜ</button>
                </div>
                {actions.map((action) => (
                    <motion.div
                        key={action.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="p-3 bg-surface border border-border rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-foreground">{action.product}</div>
                                <div className="text-[9px] text-slate-500">{action.action} • {action.competitor}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[9px] font-bold text-emerald-500">{action.impact}</div>
                            <div className="text-[8px] text-slate-500">{action.timestamp}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-background border border-border hover:bg-surface py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2">
                    <Settings className="w-3 h-3 text-slate-400" /> AYARLAR
                </button>
                <button className="flex-1 bg-background border border-border hover:bg-surface py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2">
                    <Bell className="w-3 h-3 text-slate-400" /> RAPOR AL
                </button>
            </div>
        </div>
    );
};
