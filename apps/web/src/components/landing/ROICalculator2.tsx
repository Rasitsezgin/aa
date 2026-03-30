'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Clock, 
    Users, 
    Package,
    Calculator,
    ArrowRight,
    Sparkles
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
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-foreground">ROI Hesaplayıcı 2.0</h3>
                        <p className="text-sm text-slate-500">Pazaryonetimi yatırım getirisini hesaplayın</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {!showResults ? (
                    /* Input Form */
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Current Orders */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Aylık Ortalama Sipariş
                                </label>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="10"
                                        max="1000"
                                        value={currentOrders}
                                        onChange={(e) => setCurrentOrders(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>10</span>
                                        <span className="font-bold text-primary">{formatNumber(currentOrders)}</span>
                                        <span>1000</span>
                                    </div>
                                </div>
                            </div>

                            {/* Average Order Value */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Ortalama Sepet Tutarı (₺)
                                </label>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="50"
                                        max="1000"
                                        value={avgOrderValue}
                                        onChange={(e) => setAvgOrderValue(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>₺50</span>
                                        <span className="font-bold text-primary">{formatCurrency(avgOrderValue)}</span>
                                        <span>₺1000</span>
                                    </div>
                                </div>
                            </div>

                            {/* Time Spent */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Günlük Yönetim Süresi (dakika)
                                </label>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="10"
                                        max="240"
                                        value={timeSpent}
                                        onChange={(e) => setTimeSpent(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>10 dk</span>
                                        <span className="font-bold text-primary">{timeSpent} dk</span>
                                        <span>240 dk</span>
                                    </div>
                                </div>
                            </div>

                            {/* Employees */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Çalışan Sayısı
                                </label>
                                <div className="relative">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={employees}
                                        onChange={(e) => setEmployees(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>1</span>
                                        <span className="font-bold text-primary">{employees}</span>
                                        <span>10</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calculate Button */}
                        <button
                            onClick={calculateROI}
                            disabled={isCalculating}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <Calculator className="w-5 h-5" />
                                    ROI Hesapla
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
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
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/50 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        <span className="text-xs text-green-600 font-bold">+{((results.projectedRevenue - results.currentRevenue) / results.currentRevenue * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-lg font-black text-green-600">
                                        {formatCurrency(results.projectedRevenue)}
                                    </div>
                                    <div className="text-xs text-slate-600">Yıllık Gelir (Projeksiyon)</div>
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <span className="text-xs text-blue-600 font-bold">-70%</span>
                                    </div>
                                    <div className="text-lg font-black text-blue-600">
                                        {formatNumber(results.timeSavings)} saat
                                    </div>
                                    <div className="text-xs text-slate-600">Yıllık Zaman Tasarrufu</div>
                                </motion.div>

                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800/50 rounded-2xl"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <DollarSign className="w-5 h-5 text-purple-600" />
                                        <span className="text-xs text-purple-600 font-bold">{results.totalROI.toFixed(0)}%</span>
                                    </div>
                                    <div className="text-lg font-black text-purple-600">
                                        {formatCurrency(results.costSavings)}
                                    </div>
                                    <div className="text-xs text-slate-600">Yıllık Maliyet Tasarrufu</div>
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
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">Yatırım Geri Dönüş Süresi</h4>
                                        <p className="text-xs text-slate-600 mt-1">Platform maliyetinin geri dönme süresi</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-amber-600">
                                            {results.paybackPeriod.toFixed(1)} ay
                                        </div>
                                        <div className="text-xs text-amber-600">Çok hızlı!</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recalculate Button */}
                            <button
                                onClick={() => setShowResults(false)}
                                className="w-full px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Yeni Hesaplama Yap
                            </button>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
