'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    DollarSign, 
    Clock, 
    Users, 
    Package,
    Calculator,
    ArrowRight,
    Sparkles,
    RotateCcw,
    Zap,
    Target,
    Timer
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ROICalculator2Props {
    features?: any; // Bu component için özel feature kontrolü gerekmiyor
}

export const ROICalculator2 = ({ features }: ROICalculator2Props) => {
    const [currentOrders, setCurrentOrders] = useState(100);
    const [avgOrderValue, setAvgOrderValue] = useState(150);
    const [timeSpent, setTimeSpent] = useState(40);
    const [employees, setEmployees] = useState(2);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Calculated values
    const [results, setResults] = useState({
        currentRevenue: 0,
        projectedRevenue: 0,
        timeSavings: 0,
        costSavings: 0,
        totalROI: 0,
        paybackPeriod: 0,
        monthlyGrowth: []
    });

    const calculateROI = () => {
        setIsCalculating(true);
        
        // Simulate calculation delay for UX
        setTimeout(() => {
            const currentRevenue = currentOrders * avgOrderValue * 12; // Annual
            const efficiencyGain = 0.35; // 35% efficiency with Pazaryonetimi
            const projectedOrders = currentOrders * (1 + efficiencyGain);
            const projectedRevenue = projectedOrders * avgOrderValue * 12;
            
            const hourlyWage = 150; // TL per hour
            const currentLaborCost = (timeSpent / 60) * employees * hourlyWage * 250; // Annual (250 working days)
            const newTimeSpent = timeSpent * 0.3; // 70% time reduction
            const newLaborCost = (newTimeSpent / 60) * employees * hourlyWage * 250;
            const costSavings = currentLaborCost - newLaborCost;
            
            const totalGain = (projectedRevenue - currentRevenue) + costSavings;
            const platformCost = 2990; // Annual platform cost
            const totalROI = ((totalGain - platformCost) / platformCost) * 100;
            const paybackPeriod = platformCost / (totalGain / 12);
            
            // Generate monthly growth data
            const monthlyGrowth = Array.from({ length: 12 }, (_, i) => {
                const monthRevenue = currentRevenue + ((projectedRevenue - currentRevenue) * (i / 12));
                return {
                    month: `${i + 1}.Ay`,
                    current: currentRevenue + (i * (currentRevenue / 12)),
                    projected: monthRevenue,
                    savings: costSavings * (i / 12)
                };
            });

            setResults({
                currentRevenue,
                projectedRevenue,
                timeSavings: (timeSpent - newTimeSpent) * employees * 250,
                costSavings,
                totalROI,
                paybackPeriod,
                monthlyGrowth
            });
            
            setIsCalculating(false);
            setShowResults(true);
        }, 2000);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('tr-TR').format(Math.round(value));
    };

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-500/5 dark:to-purple-500/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div 
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="p-2.5 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg shadow-primary/20"
                        >
                            <Calculator className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">ROI Hesaplayıcı</h3>
                            <p className="text-sm text-slate-500">Yatırım getirisini anlık hesaplayın</p>
                        </div>
                    </div>
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full"
                    >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 font-bold">Canlı</span>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {!showResults ? (
                    /* Input Form */
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Current Orders */}
                            <motion.div 
                                whileHover={{ scale: 1.01 }}
                                className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10"
                            >
                                <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    Aylık Sipariş
                                    <span className="ml-auto text-lg font-black text-blue-600">{formatNumber(currentOrders)}</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="10"
                                        max="1000"
                                        value={currentOrders}
                                        onChange={(e) => setCurrentOrders(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                                        <span>10</span>
                                        <span>500</span>
                                        <span>1000</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Average Order Value */}
                            <motion.div 
                                whileHover={{ scale: 1.01 }}
                                className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10"
                            >
                                <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-green-100 dark:bg-green-500/20 rounded-lg">
                                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    Sepet Tutarı
                                    <span className="ml-auto text-lg font-black text-green-600">{formatCurrency(avgOrderValue)}</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="50"
                                        max="1000"
                                        value={avgOrderValue}
                                        onChange={(e) => setAvgOrderValue(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                                        <span>₺50</span>
                                        <span>₺500</span>
                                        <span>₺1000</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Time Spent */}
                            <motion.div 
                                whileHover={{ scale: 1.01 }}
                                className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10"
                            >
                                <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    Günlük Süre
                                    <span className="ml-auto text-lg font-black text-amber-600">{timeSpent} dk</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="10"
                                        max="240"
                                        value={timeSpent}
                                        onChange={(e) => setTimeSpent(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                                        <span>10dk</span>
                                        <span>2sa</span>
                                        <span>4sa</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Employees */}
                            <motion.div 
                                whileHover={{ scale: 1.01 }}
                                className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10"
                            >
                                <label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    Çalışan Sayısı
                                    <span className="ml-auto text-lg font-black text-purple-600">{employees}</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={employees}
                                        onChange={(e) => setEmployees(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                                        <span>1</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Summary */}
                        <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/10 dark:to-white/5 rounded-2xl">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Aylık Tahmini Gelir:</span>
                                <span className="font-bold text-foreground">{formatCurrency(currentOrders * avgOrderValue)}</span>
                            </div>
                        </div>

                        {/* Calculate Button */}
                        <motion.button
                            onClick={calculateROI}
                            disabled={isCalculating}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-bold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isCalculating ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles className="w-5 h-5" />
                                    </motion.div>
                                    Hesaplanıyor...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    ROI Hesapla
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </div>
                ) : (
                    /* Results */
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Key Metrics with Progress Bars */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-200 dark:border-green-500/20 rounded-2xl shadow-lg shadow-green-500/10"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl">
                                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <motion.span 
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-xs text-green-600 font-black bg-green-100 dark:bg-green-500/20 px-2 py-1 rounded-full"
                                        >
                                            +{((results.projectedRevenue - results.currentRevenue) / results.currentRevenue * 100).toFixed(0)}%
                                        </motion.span>
                                    </div>
                                    <div className="text-2xl font-black text-green-600 dark:text-green-400">
                                        {formatCurrency(results.projectedRevenue)}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Yıllık Gelir</div>
                                    <div className="mt-3 h-2 bg-green-100 dark:bg-green-500/20 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '85%' }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-200 dark:border-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                                            <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="text-xs text-blue-600 font-black bg-blue-100 dark:bg-blue-500/20 px-2 py-1 rounded-full">-70%</span>
                                    </div>
                                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                        {formatNumber(results.timeSavings)} saat
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Zaman Tasarrufu</div>
                                    <div className="mt-3 h-2 bg-blue-100 dark:bg-blue-500/20 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '70%' }}
                                            transition={{ delay: 0.7, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" 
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-200 dark:border-purple-500/20 rounded-2xl shadow-lg shadow-purple-500/10"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
                                            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-xs text-purple-600 font-black bg-purple-100 dark:bg-purple-500/20 px-2 py-1 rounded-full">ROI {results.totalROI.toFixed(0)}%</span>
                                    </div>
                                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                        {formatCurrency(results.costSavings)}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Maliyet Tasarrufu</div>
                                    <div className="mt-3 h-2 bg-purple-100 dark:bg-purple-500/20 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '65%' }}
                                            transition={{ delay: 0.9, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Growth Chart */}
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10">
                                <h4 className="text-sm font-bold text-foreground mb-4">12 Aylık Büyüme Projeksiyonu</h4>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={results.monthlyGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip 
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ 
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="current"
                                            stackId="1"
                                            stroke="#94a3b8"
                                            fill="#e2e8f0"
                                            name="Mevcut"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="projected"
                                            stackId="2"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            fillOpacity={0.6}
                                            name="Projeksiyon"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="savings"
                                            stackId="3"
                                            stroke="#10b981"
                                            fill="#10b981"
                                            fillOpacity={0.4}
                                            name="Tasarruf"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Payback Period */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl shadow-lg shadow-amber-500/10"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                                            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">Yatırım Geri Dönüşü</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Maliyetin geri dönme süresi</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.6, type: "spring" }}
                                            className="text-2xl font-black text-amber-600 dark:text-amber-400"
                                        >
                                            {results.paybackPeriod.toFixed(1)} <span className="text-sm">ay</span>
                                        </motion.div>
                                        <div className="text-xs text-amber-600 font-medium">Hızlı dönüş!</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Recalculate Button */}
                            <motion.button
                                onClick={() => setShowResults(false)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Yeni Hesaplama Yap
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
