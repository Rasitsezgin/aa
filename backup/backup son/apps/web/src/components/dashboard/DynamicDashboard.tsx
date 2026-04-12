'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DollarSign, ShoppingCart, Users, Target, LineChart, BarChart, 
    PieChart, Package, AlertTriangle, Brain, Zap, Activity,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
    MoreVertical, Settings, Loader2
} from 'lucide-react';
import { LineChart as RechartsLine, BarChart as RechartsBar, PieChart as RechartsPie, Line, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useDashboardStats, useRecentOrders, useAiInsights, usePlatformPerformance, useActivityFeed, useStockAlerts, useTopProducts } from '@/lib/hooks';

interface DashboardConfig {
    sections: Array<{
        id: string;
        title: string;
        widgets: Array<{
            id: string;
            type: 'metric' | 'chart' | 'table' | 'custom';
            title: string;
            icon: string;
            position: { x: number; y: number; w: number; h: number };
            config: Record<string, any>;
            enabled: boolean;
        }>;
        layout: 'grid' | 'flex' | 'custom';
        columns: number;
        enabled: boolean;
    }>;
}

interface DynamicDashboardProps {
    config?: DashboardConfig;
    editable?: boolean;
}

// Gerçek Veri Widget'ları - API'den çekilen veriler
const RealtimeMetricWidget = ({ title, value, change, icon: Icon, format = 'number', loading }: any) => {
    const formatValue = (val: number) => {
        if (format === 'currency') return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
        if (format === 'percentage') return `${(val || 0).toFixed(1)}%`;
        return (val || 0).toLocaleString();
    };

    if (loading) return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-slate-500">Yükleniyor...</span>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{title}</h3>
                </div>
                {change !== undefined && change !== null && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(change).toFixed(1)}%
                    </div>
                )}
            </div>
            <div className="text-2xl font-black text-foreground">{formatValue(value)}</div>
        </motion.div>
    );
};

const MetricWidget = ({ widget }: any) => {
    const Icon = Activity;
    return <div>Metric</div>;
};

const ChartWidget = ({ widget }: any) => {
    return <div>Chart</div>;
};

const TableWidget = ({ widget }: any) => {
    return <div>Table</div>;
};

const CustomWidget = ({ widget }: any) => {
    const Icon = Brain;

    switch (widget.id) {
        case 'ai-insights':
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200 dark:border-blue-800/50"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">{widget.title}</h3>
                            <p className="text-xs text-slate-500">{widget.description}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg">
                            <div className="text-xs font-bold text-blue-600 mb-1">AI Önerisi</div>
                            <div className="text-sm text-slate-600">Elektronik kategorisinde fiyat optimizasyonu yapmanızı öneriyoruz. %15 kar artışı potansiyeli.</div>
                        </div>
                        <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-lg">
                            <div className="text-xs font-bold text-purple-600 mb-1">Tahmin</div>
                            <div className="text-sm text-slate-600">Gelecek hafta siparişleriniz %25 artabilir. Stok hazırlığı öneriliyor.</div>
                        </div>
                    </div>
                </motion.div>
            );
            
        case 'quick-actions':
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">{widget.title}</h3>
                            <p className="text-xs text-slate-500">{widget.description}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                            { label: 'Yeni Sipariş', icon: ShoppingCart, color: 'blue' },
                            { label: 'Ürün Ekle', icon: Package, color: 'green' },
                            { label: 'Raporlar', icon: BarChart, color: 'purple' },
                            { label: 'Veri Aktar', icon: Activity, color: 'orange' }
                        ].map((action, index) => {
                            const ActionIcon = action.icon;
                            return (
                                <button
                                    key={index}
                                    className="flex flex-col items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                >
                                    <div className={`w-8 h-8 bg-${action.color}-100 dark:bg-${action.color}-900/30 rounded-lg flex items-center justify-center`}>
                                        <ActionIcon className={`w-4 h-4 text-${action.color}-600 dark:text-${action.color}-400`} />
                                    </div>
                                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            );
            
        case 'activity-feed':
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">{widget.title}</h3>
                            <p className="text-xs text-slate-500">{widget.description}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {[
                            { text: 'Yeni sipariş: #1234', time: 'Az önce', icon: ShoppingCart },
                            { text: 'Stok güncellendi: iPhone 15', time: '2 dk önce', icon: Package },
                            { text: 'Fiyat güncellendi: Samsung S24', time: '5 dk önce', icon: TrendingUp },
                            { text: 'Müşteri yorumu: 5 yıldız', time: '10 dk önce', icon: Users }
                        ].map((activity, index) => {
                            const ActivityIcon = activity.icon;
                            return (
                                <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                                    <ActivityIcon className="w-4 h-4 text-primary" />
                                    <div className="flex-1">
                                        <div className="text-sm text-foreground">{activity.text}</div>
                                        <div className="text-xs text-slate-500">{activity.time}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            );
            
        default:
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10"
                >
                    <div className="text-center text-slate-500">
                        <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Custom widget: {widget.title}</p>
                    </div>
                </motion.div>
            );
    }
};

// Gerçek Dashboard - API'den veri çeken
export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ editable = false }) => {
    // Gerçek API'den veri çek
    const { data: stats, loading: statsLoading } = useDashboardStats('30d');
    const { data: orders, loading: ordersLoading } = useRecentOrders(5);
    const { data: insights, loading: insightsLoading } = useAiInsights();
    const { data: platforms, loading: platformsLoading } = usePlatformPerformance();
    const { data: activities, loading: activitiesLoading } = useActivityFeed(10);
    const { data: stockAlerts, loading: stockLoading } = useStockAlerts();
    const { data: topProducts, loading: productsLoading } = useTopProducts(5);

    // Ana metrikler - DashboardStats interface'ine göre
    const metrics = [
        { title: 'Toplam Ciro', value: stats?.totalRevenue, change: stats?.periodComparison?.revenueChange, icon: DollarSign, format: 'currency' },
        { title: 'Sipariş Sayısı', value: stats?.totalOrders, change: stats?.periodComparison?.ordersChange, icon: ShoppingCart, format: 'number' },
        { title: 'Aktif Ürün', value: stats?.activeProducts, change: stats?.periodComparison?.productsChange, icon: Package, format: 'number' },
        { title: 'Dönüşüm Oranı', value: stats?.conversionRate, change: stats?.periodComparison?.conversionChange, icon: TrendingUp, format: 'percentage' },
    ];

    return (
        <div className="space-y-6">
            {/* Ana Metrik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {metrics.map((m, i) => (
                    <RealtimeMetricWidget key={i} {...m} loading={statsLoading} />
                ))}
            </div>

            {/* Grafikler ve Tablolar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Performansı - Gerçek Veri */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground">Platform Performansı</h3>
                        {platformsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <RechartsBar data={platforms || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="platform" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip formatter={(v) => `₺${Number(v).toLocaleString()}`} />
                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </RechartsBar>
                    </ResponsiveContainer>
                </motion.div>

                {/* Son Siparişler - Gerçek Veri */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground">Son Siparişler</h3>
                        {ordersLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left p-2 font-medium">Sipariş</th>
                                    <th className="text-left p-2 font-medium">Platform</th>
                                    <th className="text-left p-2 font-medium">Tutar</th>
                                    <th className="text-left p-2 font-medium">Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(orders || []).map((order: any, i: number) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td className="p-2">#{order.id?.toString().slice(-6)}</td>
                                        <td className="p-2">{order.platform || '-'}</td>
                                        <td className="p-2">₺{order.total?.toLocaleString?.() || 0}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* AI Insights ve Aktivite */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Önerileri - Gerçek */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-bold text-foreground">AI Önerileri</h3>
                        {insightsLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                    </div>
                    <div className="space-y-3">
                        {(insights || []).slice(0, 3).map((insight: any, i: number) => (
                            <div key={i} className="p-3 bg-white/80 rounded-lg">
                                <div className="text-xs font-bold text-blue-600 mb-1">{insight.type}</div>
                                <div className="text-sm text-slate-600">{insight.message}</div>
                            </div>
                        ))}
                        {!insights?.length && !insightsLoading && (
                            <div className="text-sm text-slate-500">Henüz öneri yok</div>
                        )}
                    </div>
                </motion.div>

                {/* Stok Uyarıları */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-bold text-foreground">Stok Uyarıları</h3>
                        {stockLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(stockAlerts || []).slice(0, 5).map((alert: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                                <Package className="w-4 h-4 text-amber-500" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{alert.productName}</div>
                                    <div className="text-xs text-slate-500">Kalan: {alert.stock} adet</div>
                                </div>
                            </div>
                        ))}
                        {!stockAlerts?.length && !stockLoading && (
                            <div className="text-sm text-slate-500">Stok sorunu yok</div>
                        )}
                    </div>
                </motion.div>

                {/* Aktivite Akışı - Gerçek */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-bold text-foreground">Son Aktiviteler</h3>
                        {activitiesLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(activities || []).map((activity: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                                <Activity className="w-4 h-4 text-primary" />
                                <div className="flex-1">
                                    <div className="text-sm text-foreground">{activity.action}</div>
                                    <div className="text-xs text-slate-500">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
