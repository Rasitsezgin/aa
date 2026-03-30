'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ShoppingCart, 
    Users, 
    Package, 
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Target,
    Zap,
    Globe,
    Calendar,
    Filter,
    Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsDashboardProps {
    features?: {
        analyticsDashboard?: {
            enabled: boolean;
            showRealTime: boolean;
            showCharts: boolean;
            showMetrics: boolean;
            allowInteraction: boolean;
        };
    };
}

interface MetricCard {
    title: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
    icon: React.ElementType;
    color: string;
}

interface ChartData {
    name: string;
    value: number;
    previous?: number;
}

export const AnalyticsDashboard = ({ features }: AnalyticsDashboardProps) => {
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [realTimeData, setRealTimeData] = useState<any[]>([]);

    const showRealTime = features?.analyticsDashboard?.showRealTime !== false;
    const showCharts = features?.analyticsDashboard?.showCharts !== false;
    const showMetrics = features?.analyticsDashboard?.showMetrics !== false;
    const allowInteraction = features?.analyticsDashboard?.allowInteraction !== false;

    // Sample metrics data
    const metrics: MetricCard[] = [
        {
            title: 'Toplam Gelir',
            value: '₺458,290',
            change: 12.5,
            trend: 'up',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500'
        },
        {
            title: 'Siparişler',
            value: '1,247',
            change: 8.3,
            trend: 'up',
            icon: ShoppingCart,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            title: 'Aktif Kullanıcılar',
            value: '892',
            change: -2.1,
            trend: 'down',
            icon: Users,
            color: 'from-purple-500 to-pink-500'
        },
        {
            title: 'Dönüşüm Oranı',
            value: '3.2%',
            change: 0.8,
            trend: 'up',
            icon: Target,
            color: 'from-amber-500 to-orange-500'
        }
    ];

    // Sample chart data
    const revenueData: ChartData[] = [
        { name: 'Pzt', value: 45000, previous: 42000 },
        { name: 'Sal', value: 52000, previous: 48000 },
        { name: 'Çar', value: 48000, previous: 51000 },
        { name: 'Per', value: 61000, previous: 55000 },
        { name: 'Cum', value: 58000, previous: 53000 },
        { name: 'Cmt', value: 72000, previous: 68000 },
        { name: 'Paz', value: 69000, previous: 65000 }
    ];

    const categoryData = [
        { name: 'Elektronik', value: 35, color: '#3b82f6' },
        { name: 'Moda', value: 28, color: '#8b5cf6' },
        { name: 'Ev Yaşam', value: 20, color: '#10b981' },
        { name: 'Spor', value: 12, color: '#f59e0b' },
        { name: 'Diğer', value: 5, color: '#6b7280' }
    ];

    const platformData = [
        { name: 'Trendyol', value: 45000, orders: 234 },
        { name: 'Hepsiburada', value: 38000, orders: 189 },
        { name: 'Amazon', value: 32000, orders: 156 },
        { name: 'N11', value: 28000, orders: 134 },
        { name: 'Çiçeksepeti', value: 18000, orders: 89 }
    ];

    useEffect(() => {
        if (!features?.analyticsDashboard?.enabled) return;

        // Simulate real-time data updates
        if (showRealTime) {
            const interval = setInterval(() => {
                const newData = {
                    time: new Date().toLocaleTimeString(),
                    revenue: Math.floor(Math.random() * 10000) + 40000,
                    orders: Math.floor(Math.random() * 50) + 100,
                    users: Math.floor(Math.random() * 100) + 800
                };

                setRealTimeData(prev => [...prev.slice(-9), newData]);
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [showRealTime, features?.analyticsDashboard?.enabled]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    if (!features?.analyticsDashboard?.enabled) return null;

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">Analytics Dashboard</h3>
                            <p className="text-sm text-slate-500">Gelişmiş analiz ve raporlama</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {showRealTime && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs text-green-600 font-bold">REAL-TIME</span>
                            </div>
                        )}
                        <button className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Period Selector */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {['24s', '7d', '30d', '90d', '1y'].map((period) => (
                            <button
                                key={period}
                                onClick={() => allowInteraction && setSelectedPeriod(period)}
                                className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                                    selectedPeriod === period
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                                disabled={!allowInteraction}
                            >
                                {period === '24s' ? '24 Saat' : period === '7d' ? '7 Gün' : period === '30d' ? '30 Gün' : period === '90d' ? '90 Gün' : '1 Yıl'}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                </div>

                {/* Metrics Cards */}
                {showMetrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.map((metric, index) => {
                            const Icon = metric.icon;
                            return (
                                <motion.div
                                    key={metric.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-white/10"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className={`flex items-center gap-1 text-sm font-bold ${
                                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {metric.trend === 'up' ? (
                                                <ArrowUpRight className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4" />
                                            )}
                                            {Math.abs(metric.change)}%
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-foreground mb-1">{metric.value}</div>
                                    <div className="text-xs text-slate-500">{metric.title}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Charts */}
                {showCharts && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Chart */}
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                            <h4 className="text-lg font-bold text-foreground mb-4">Gelir Trendi</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
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
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                        name="Bu Hafta"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="previous"
                                        stroke="#94a3b8"
                                        fill="#94a3b8"
                                        fillOpacity={0.2}
                                        name="Geçen Hafta"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Category Distribution */}
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                            <h4 className="text-lg font-bold text-foreground mb-4">Kategori Dağılımı</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any) => `${value}%`}
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {categoryData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                                        <span className="text-slate-500">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Platform Performance */}
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 lg:col-span-2">
                            <h4 className="text-lg font-bold text-foreground mb-4">Platform Performansı</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={platformData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip 
                                        formatter={(value: any, name: string) => [
                                            name === 'value' ? formatCurrency(Number(value)) : value,
                                            name === 'value' ? 'Gelir' : 'Sipariş'
                                        ]}
                                        contentStyle={{ 
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" name="Gelir" />
                                    <Bar dataKey="orders" fill="#8b5cf6" name="Sipariş" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Real-time Feed */}
                {showRealTime && realTimeData.length > 0 && (
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                        <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Canlı Veri Akışı
                        </h4>
                        <div className="space-y-2">
                            {realTimeData.slice(-5).reverse().map((data, index) => (
                                <motion.div
                                    key={data.time}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-2 bg-white/80 dark:bg-slate-800/80 rounded-lg"
                                >
                                    <span className="text-xs text-slate-500">{data.time}</span>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs">
                                            <span className="text-slate-600">Gelir: </span>
                                            <span className="font-bold text-green-600">{formatCurrency(data.revenue)}</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-slate-600">Sipariş: </span>
                                            <span className="font-bold text-blue-600">{data.orders}</span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-slate-600">Kullanıcı: </span>
                                            <span className="font-bold text-purple-600">{data.users}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Interactive Elements */}
                {allowInteraction && (
                    <div className="flex items-center justify-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all">
                            <Eye className="w-4 h-4" />
                            Detaylı Rapor
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                            <Zap className="w-4 h-4" />
                            AI Analiz
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                            <Globe className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
