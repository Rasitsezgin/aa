"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart, BarChart3, TrendingUp, DollarSign,
    Target, Flag, Calendar, Plus, ChevronRight,
    ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';

export default function BudgetPlanningPage() {
    const [selectedYear, setSelectedYear] = useState('2025');

    const budgets = [
        { category: 'Pazarlama & Reklam', allocated: 45000, spent: 32450, color: 'indigo' },
        { category: 'Kargo & Lojistik', allocated: 25000, spent: 28900, color: 'blue' },
        { category: 'Ürün Tedarik', allocated: 120000, spent: 85000, color: 'emerald' },
        { category: 'Teknoloji & Yazılım', allocated: 12000, spent: 11200, color: 'purple' },
        { category: 'Operasyonel Giderler', allocated: 15000, spent: 12300, color: 'amber' },
    ];

    const totalAllocated = budgets.reduce((acc, b) => acc + b.allocated, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const overallProgress = (totalSpent / totalAllocated) * 100;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Target className="w-8 h-8 text-emerald-500" /> Bütçe Planlama
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Finansal hedeflerinizi belirleyin ve harcamalarınızı takip edin</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50"
                    >
                        <option value="2024">2024 Mali Yılı</option>
                        <option value="2025">2025 Mali Yılı</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20">
                        <Plus size={16} /> Yeni Bütçe
                    </button>
                </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm overflow-hidden relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                            <Flag size={14} className="text-emerald-500" /> Toplam Bütçe Kullanımı
                        </div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-foreground">₺{totalSpent.toLocaleString('tr-TR')}</span>
                            <span className="text-lg font-bold text-slate-400">/ ₺{totalAllocated.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-background rounded-full overflow-hidden border border-border/50 p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${overallProgress}%` }}
                                    className={`h-full rounded-full ${overallProgress > 90 ? 'bg-red-500' : 'bg-emerald-500'} shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500">Kullanılan: %{overallProgress.toFixed(1)}</span>
                                <span className="text-emerald-500">Kalan: ₺{(totalAllocated - totalSpent).toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-background/50 rounded-2xl p-4 border border-border shadow-inner">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                <ArrowUpRight size={14} className="text-emerald-500" /> Gelir Hedefi
                            </div>
                            <div className="text-xl font-black text-foreground">₺2.4M</div>
                            <div className="text-[10px] text-emerald-500 font-bold mt-1">%{74} Tamamlandı</div>
                        </div>
                        <div className="bg-background/50 rounded-2xl p-4 border border-border shadow-inner">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                <ArrowDownRight size={14} className="text-red-400" /> Tahmini Gider
                            </div>
                            <div className="text-xl font-black text-foreground">₺1.8M</div>
                            <div className="text-[10px] text-red-400 font-bold mt-1">Bütçe Sınırına Yakın</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {budgets.map((budget, i) => {
                    const pct = (budget.spent / budget.allocated) * 100;
                    return (
                        <motion.div
                            key={budget.category}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-surface rounded-2xl border border-border p-5 hover:border-emerald-500/30 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-${budget.color}-500/10 flex items-center justify-center text-${budget.color}-500`}>
                                    <PieChart size={20} />
                                </div>
                                <button className="p-2 text-slate-400 hover:text-foreground">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <h3 className="font-bold text-foreground mb-1">{budget.category}</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-xl font-black text-foreground">₺{budget.spent.toLocaleString('tr-TR')}</span>
                                <span className="text-xs text-slate-500">/ ₺{budget.allocated.toLocaleString('tr-TR')}</span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(pct, 100)}%` }}
                                        className={`h-full bg-${budget.color}-500`}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-500">
                                    <span>TÜKETİM</span>
                                    <span className={pct > 100 ? 'text-red-500' : 'text-slate-500'}>%{pct.toFixed(0)}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Comparison Chart Placeholder */}
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <BarChart3 size={18} className="text-emerald-500" /> Hedef vs Gerçekleşen (Aylık)
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Hedef</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-500" /> Gerçekleşen</div>
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-2 px-4">
                    {['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara'].map((month, i) => {
                        const targetH = 40 + ((i * 7) % 50);
                        const actualH = 40 + ((i * 11) % 50);
                        return (
                            <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex justify-center items-end gap-1 h-48">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${targetH}%` }}
                                        className="w-1.5 bg-emerald-500/20 rounded-t-sm"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${actualH}%` }}
                                        className="w-1.5 bg-indigo-500 rounded-t-sm"
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{month}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Card */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <TrendingUp size={160} />
                </div>
                <div className="space-y-2 relative z-10 text-center md:text-left">
                    <h3 className="text-xl font-black">AI Bütçe Optimizasyonu</h3>
                    <p className="text-indigo-100 text-sm max-w-md">Harcanmayan bütçeleri otomatik olarak yüksek performanslı reklam kampanyalarına aktarın.</p>
                </div>
                <button className="px-6 py-3 bg-white text-indigo-600 font-black rounded-xl text-sm hover:scale-105 transition-all shadow-lg active:scale-95 shrink-0 relative z-10 flex items-center gap-2">
                    Akıllı Dağıtımı Başlat <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
