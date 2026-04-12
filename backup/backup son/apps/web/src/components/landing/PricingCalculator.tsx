'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calculator, 
    TrendingUp, 
    Users, 
    ShoppingCart, 
    Package, 
    DollarSign, 
    CheckCircle,
    ArrowRight,
    Sparkles,
    Zap,
    Target,
    BarChart3,
    Crown,
    Rocket
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PricingCalculatorProps {
    features?: {
        pricingCalculator?: {
            enabled: boolean;
            showProjections: boolean;
            showComparison: boolean;
            showROI: boolean;
        };
    };
}

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    features: string[];
    limits: {
        products: number;
        orders: number;
        users: number;
        platforms: number;
    };
    color: string;
    icon: React.ElementType;
    recommended?: boolean;
}

interface CalculatorState {
    products: number;
    orders: number;
    platforms: number;
    users: number;
    currentCost: number;
    projectedSavings: number;
    efficiency: number;
}

export const PricingCalculator = ({ features }: PricingCalculatorProps) => {
    const [state, setState] = useState<CalculatorState>({
        products: 100,
        orders: 500,
        platforms: 3,
        users: 2,
        currentCost: 5000,
        projectedSavings: 0,
        efficiency: 0
    });

    const [selectedPlan, setSelectedPlan] = useState<string>('professional');
    const [showResults, setShowResults] = useState(false);

    const showProjections = features?.pricingCalculator?.showProjections !== false;
    const showComparison = features?.pricingCalculator?.showComparison !== false;
    const showROI = features?.pricingCalculator?.showROI !== false;

    const pricingPlans: PricingPlan[] = [
        {
            id: 'starter',
            name: 'Starter',
            price: 299,
            features: ['Temel özellikler', '3 platform', '500 ürün'],
            limits: { products: 500, orders: 1000, users: 2, platforms: 3 },
            color: 'from-blue-500 to-cyan-500',
            icon: Rocket
        },
        {
            id: 'professional',
            name: 'Professional',
            price: 799,
            features: ['Tüm özellikler', '10 platform', '5000 ürün', 'AI özellikleri'],
            limits: { products: 5000, orders: 10000, users: 5, platforms: 10 },
            color: 'from-purple-500 to-pink-500',
            icon: Zap,
            recommended: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 2990,
            features: ['Sınırsız', 'Özel çözümler', 'API erişimi', '7/24 destek'],
            limits: { products: 50000, orders: 100000, users: 20, platforms: 50 },
            color: 'from-amber-500 to-orange-500',
            icon: Crown
        }
    ];

    useEffect(() => {
        if (!features?.pricingCalculator?.enabled) return;

        // Calculate current manual cost
        const manualCostPerPlatform = 500;
        const manualCostPerProduct = 10;
        const manualCostPerOrder = 2;
        const manualCostPerUser = 1000;

        const currentManualCost = 
            (state.platforms * manualCostPerPlatform) +
            (state.products * manualCostPerProduct) +
            (state.orders * manualCostPerOrder) +
            (state.users * manualCostPerUser);

        // Calculate efficiency and savings
        const plan = pricingPlans.find(p => p.id === selectedPlan);
        const pazaryonetimiCost = plan?.price || 0;
        const efficiency = ((currentManualCost - pazaryonetimiCost) / currentManualCost) * 100;
        const savings = currentManualCost - pazaryonetimiCost;

        setState(prev => ({
            ...prev,
            currentCost: currentManualCost,
            projectedSavings: savings,
            efficiency: Math.max(0, efficiency)
        }));
    }, [state.products, state.orders, state.platforms, state.users, selectedPlan, features?.pricingCalculator?.enabled]);

    const handleCalculate = () => {
        setShowResults(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const generateProjectionData = () => {
        const months = 12;
        return Array.from({ length: months }, (_, i) => {
            const monthGrowth = 1 + (i * 0.05); // 5% growth per month
            return {
                month: `${i + 1}.Ay`,
                manual: state.currentCost * monthGrowth,
                automated: (pricingPlans.find(p => p.id === selectedPlan)?.price || 0) * monthGrowth,
                savings: state.projectedSavings * monthGrowth
            };
        });
    };

    const currentPlan = pricingPlans.find(p => p.id === selectedPlan);

    if (!features?.pricingCalculator?.enabled) return null;

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                        <Calculator className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-foreground">İnteraktif Fiyat Hesaplayıcı</h3>
                        <p className="text-sm text-slate-500">Pazaryonetimi yatırım getirisini hesaplayın</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {!showResults ? (
                    /* Input Form */
                    <div className="space-y-8">
                        {/* Input Sliders */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Ürün Sayısı
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="10000"
                                    value={state.products}
                                    onChange={(e) => setState(prev => ({ ...prev, products: parseInt(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>10</span>
                                    <span className="font-bold text-primary">{state.products.toLocaleString()}</span>
                                    <span>10,000</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Aylık Sipariş
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="50000"
                                    value={state.orders}
                                    onChange={(e) => setState(prev => ({ ...prev, orders: parseInt(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>10</span>
                                    <span className="font-bold text-primary">{state.orders.toLocaleString()}</span>
                                    <span>50,000</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Platform Sayısı
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={state.platforms}
                                    onChange={(e) => setState(prev => ({ ...prev, platforms: parseInt(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>1</span>
                                    <span className="font-bold text-primary">{state.platforms}</span>
                                    <span>20</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Kullanıcı Sayısı
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={state.users}
                                    onChange={(e) => setState(prev => ({ ...prev, users: parseInt(e.target.value) }))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>1</span>
                                    <span className="font-bold text-primary">{state.users}</span>
                                    <span>20</span>
                                </div>
                            </div>
                        </div>

                        {/* Plan Selection */}
                        <div>
                            <h4 className="text-sm font-bold text-foreground mb-4">Paket Seçimi</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {pricingPlans.map((plan) => {
                                    const Icon = plan.icon;
                                    return (
                                        <motion.div
                                            key={plan.id}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setSelectedPlan(plan.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                selectedPlan === plan.id
                                                    ? 'bg-primary/10 border-primary'
                                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            {plan.recommended && (
                                                <div className="text-center mb-2">
                                                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full font-bold">
                                                        ÖNERİLEN
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`text-center mb-3`}>
                                                <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="text-2xl font-black text-foreground">
                                                    ₺{plan.price}
                                                </div>
                                                <div className="text-xs text-slate-500">/ay</div>
                                            </div>
                                            <div className="space-y-1">
                                                {plan.features.map((feature, index) => (
                                                    <div key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Calculate Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCalculate}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20"
                        >
                            <Calculator className="w-5 h-5" />
                            Hesapla
                            <ArrowRight className="w-5 h-5" />
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
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                                    <div className="text-sm text-slate-600 mb-1">Mevcut Maliyet</div>
                                    <div className="text-2xl font-black text-red-600">
                                        {formatCurrency(state.currentCost)}
                                    </div>
                                    <div className="text-xs text-slate-500">Manuel yönetim</div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                                    <div className="text-sm text-slate-600 mb-1">Pazaryonetimi</div>
                                    <div className="text-2xl font-black text-blue-600">
                                        {formatCurrency(currentPlan?.price || 0)}
                                    </div>
                                    <div className="text-xs text-slate-500">{currentPlan?.name} paketi</div>
                                </div>

                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/50 rounded-xl">
                                    <div className="text-sm text-slate-600 mb-1">Yıllık Tasarruf</div>
                                    <div className="text-2xl font-black text-green-600">
                                        {formatCurrency(state.projectedSavings * 12)}
                                    </div>
                                    <div className="text-xs text-green-600 font-bold">%{state.efficiency.toFixed(1)} verimlilik</div>
                                </div>
                            </div>

                            {/* Projection Chart */}
                            {showProjections && (
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10">
                                    <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                        12 Aylık Projeksiyon
                                    </h4>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={generateProjectionData()}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} />
                                            <Tooltip 
                                                formatter={(value: any) => formatCurrency(Number(value))}
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="manual"
                                                stroke="#ef4444"
                                                fill="#ef4444"
                                                fillOpacity={0.3}
                                                name="Manuel"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="automated"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.3}
                                                name="Pazaryonetimi"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="savings"
                                                stroke="#10b981"
                                                fill="#10b981"
                                                fillOpacity={0.3}
                                                name="Tasarruf"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* ROI Analysis */}
                            {showROI && (
                                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                                    <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-amber-600" />
                                        ROI Analizi
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-amber-600">
                                                {((state.projectedSavings * 12) / (currentPlan?.price || 1)).toFixed(1)}x
                                            </div>
                                            <div className="text-xs text-amber-600">Yıllık ROI</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-amber-600">
                                                {Math.ceil((currentPlan?.price || 1) / (state.projectedSavings || 1))} ay
                                            </div>
                                            <div className="text-xs text-amber-600">Geri dönüş süresi</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-amber-600">
                                                {state.efficiency.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-amber-600">Verimlilik artışı</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-amber-600">
                                                {(state.orders * 12).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-amber-600">Yıllık sipariş</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Comparison */}
                            {showComparison && (
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10">
                                    <h4 className="text-sm font-bold text-foreground mb-4">Detaylı Karşılaştırma</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                                            <span className="text-sm font-medium">Platform yönetimi</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-red-600">₺{(state.platforms * 500).toLocaleString()}</span>
                                                <span className="text-sm text-green-600 font-bold">Dahil</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                                            <span className="text-sm font-medium">Stok senkronizasyonu</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-red-600">₺{(state.products * 10).toLocaleString()}</span>
                                                <span className="text-sm text-green-600 font-bold">Otomatik</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                                            <span className="text-sm font-medium">Sipariş işleme</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-red-600">₺{(state.orders * 2).toLocaleString()}</span>
                                                <span className="text-sm text-green-600 font-bold">AI destekli</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="text-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    {currentPlan?.name} Paketini Başlat
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="block mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Yeni hesaplama yap
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};
