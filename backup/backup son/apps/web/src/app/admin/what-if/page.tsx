'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Users,
    BarChart3,
    Settings2,
    Play,
    RotateCcw,
    Info,
    ChevronRight,
    Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const INITIAL_DATA = [
    { name: 'Hafta 1', current: 4000, projected: 4000 },
    { name: 'Hafta 2', current: 4500, projected: 4500 },
    { name: 'Hafta 3', current: 5200, projected: 5200 },
    { name: 'Hafta 4', current: 4800, projected: 4800 },
];

export default function WhatIfSimulatorPage() {
    const [priceChange, setPriceChange] = useState(0);
    const [compChange, setCompChange] = useState(0);
    const [marketTrend, setMarketTrend] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [chartData, setChartData] = useState(INITIAL_DATA);

    const runSimulation = () => {
        setIsSimulating(true);

        // Simulation Logic (client side for instant feedback)
        const elasticity = -2.0;
        const priceVolImpact = (priceChange / 100) * elasticity;
        const compVolImpact = (compChange / 100) * 1.2;
        const marketVolImpact = marketTrend / 100;
        const totalImpact = 1 + priceVolImpact - compVolImpact + marketVolImpact;

        setTimeout(() => {
            const newResults = {
                revenue: Math.round(150000 * totalImpact * (1 + priceChange / 100)),
                orders: Math.round(450 * totalImpact),
                revenueChange: totalImpact * (1 + priceChange / 100) - 1,
                orderChange: totalImpact - 1
            };
            setResults(newResults);

            // Update chart
            const newChartData = INITIAL_DATA.map((d, i) => ({
                ...d,
                projected: i === 3 ? Math.round(d.current * totalImpact) : d.current
            }));
            setChartData(newChartData);
            setIsSimulating(false);
        }, 800);
    };

    useEffect(() => {
        runSimulation();
    }, [priceChange, compChange, marketTrend]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#020202] p-8 text-zinc-900 dark:text-zinc-100">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-500 font-bold text-sm tracking-widest uppercase">
                            <Settings2 className="w-4 h-4" /> Strategic Planning
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">MARKET WHAT-IF <span className="text-zinc-400">SIMULATOR</span></h1>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl hover:bg-zinc-300 transition-colors">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                            <Play className="w-4 h-4 fill-current" /> STRATEJİYİ UYGULA
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Controls Panel */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-500" /> Senaryo Parametreleri
                            </h3>

                            <div className="space-y-10">
                                {/* Price Control */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Fiyat Değişimi</label>
                                        <span className={`text-sm font-black px-3 py-1 rounded-lg ${priceChange < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {priceChange > 0 ? '+' : ''}{priceChange}%
                                        </span>
                                    </div>
                                    <input
                                        type="range" min="-50" max="50" step="1"
                                        value={priceChange}
                                        onChange={(e) => setPriceChange(Number(e.target.value))}
                                        className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                                        <span>-50% INDIRIM</span>
                                        <span>STANDART</span>
                                        <span>+50% ZAM</span>
                                    </div>
                                </div>

                                {/* Competitor Control */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Rakip Agresifliği</label>
                                        <span className="text-sm font-black px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            {compChange}% Drop
                                        </span>
                                    </div>
                                    <input
                                        type="range" min="0" max="40" step="5"
                                        value={compChange}
                                        onChange={(e) => setCompChange(Number(e.target.value))}
                                        className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                                        <span>SABIT</span>
                                        <span>YOĞUN SALDIRI</span>
                                    </div>
                                </div>

                                {/* Market Trend Control */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Pazar Trendi</label>
                                        <span className="text-sm font-black px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            {marketTrend > 0 ? '+' : ''}{marketTrend}%
                                        </span>
                                    </div>
                                    <input
                                        type="range" min="-20" max="20" step="1"
                                        value={marketTrend}
                                        onChange={(e) => setMarketTrend(Number(e.target.value))}
                                        className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
                                    <Info className="w-5 h-5" /> AI Insight
                                </h4>
                                <p className="text-sm text-indigo-100 leading-relaxed italic">
                                    "{results?.insights?.[0] || 'Seçtiğiniz indirim oranı pazar daralmasına rağmen %15 hacim artışı sağlayabilir.'}"
                                </p>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-32 h-32" />
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Öngörülen Ciro', value: results ? `₺${(results.revenue / 1000).toFixed(1)}K` : '--', change: results?.revenueChange, icon: BarChart3 },
                                { label: 'Tahmini Sipariş', value: results?.orders || '--', change: results?.orderChange, icon: Users },
                                { label: 'Hacim Değişimi', value: results ? `%${(results.orderChange * 100).toFixed(1)}` : '--', change: results?.orderChange, icon: TrendingUp },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                                            <stat.icon className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        {stat.change != null && (
                                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 
                        ${stat.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {(stat.change * 100).toFixed(1)}%
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                                    <h4 className="text-2xl font-black mt-1">{stat.value}</h4>
                                </motion.div>
                            ))}
                        </div>

                        {/* Chart Area */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm min-h-[400px]">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold">Projeksiyon Analizi</h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                                        <div className="w-3 h-3 bg-zinc-300 dark:bg-zinc-700 rounded-full" /> Mevcut
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-500">
                                        <div className="w-3 h-3 bg-indigo-500 rounded-full" /> Senaryo
                                    </div>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="current" stroke="#88888855" fillOpacity={0} />
                                        <Area type="monotone" dataKey="projected" stroke="#6366f1" fillOpacity={1} fill="url(#colorProj)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Warning / Alerts */}
                        <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                            <div>
                                <h5 className="text-rose-500 font-bold text-sm mb-1 text-zinc-900 dark:text-rose-500">Risk Değerlendirmesi</h5>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    İndirim oranınız %30 barajını geçtiği için Brüt Kar Marjınız kritik seviyenin (%12) altına düşebilir. Satış hacmi bu farkı kapatmazsa operasyonel zarar oluşabilir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
