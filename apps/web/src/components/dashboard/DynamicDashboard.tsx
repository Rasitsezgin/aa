'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    DollarSign, ShoppingCart,
    Package, AlertTriangle, Brain, Activity,
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Loader2
} from 'lucide-react';
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardStats, useRecentOrders, useAiInsights, usePlatformPerformance, useActivityFeed, useStockAlerts } from '@/lib/hooks';

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

// Gerçek Dashboard - API'den veri çeken
export const DynamicDashboard: React.FC<DynamicDashboardProps> = () => {
    // Gerçek API'den veri çek
    const { data: stats, loading: statsLoading } = useDashboardStats('30d');
    const { data: orders, loading: ordersLoading } = useRecentOrders(5);
    const { data: insights, loading: insightsLoading } = useAiInsights();
    const { data: platforms, loading: platformsLoading } = usePlatformPerformance();
    const { data: activities, loading: activitiesLoading } = useActivityFeed(10);
    const { data: stockAlerts, loading: stockLoading } = useStockAlerts();
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
                                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                    <th className="text-left p-2">Sipariş</th>
                                    <th className="text-left p-2">Platform</th>
                                    <th className="text-left p-2">Tutar</th>
                                    <th className="text-left p-2">Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(orders || []).map((order: any, i: number) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-2 font-medium text-foreground">#{order.id}</td>
                                        <td className="p-2">
                                            <span className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                {order.platform}
                                            </span>
                                        </td>
                                        <td className="p-2 font-bold text-foreground">₺{order.price?.toLocaleString()}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                order.status === 'Tamamlandı' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Kargoda' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'İptal' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!orders || orders.length === 0) && !ordersLoading && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-400 italic">Henüz sipariş bulunmuyor</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* AI Pilot Kontrol Merkezi */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden p-8 rounded-2xl bg-slate-900 text-white shadow-2xl"
            >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/40">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">AI-Pilot Kontrol Merkezi</h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg">
                            Yapay zeka asistanınız mağazanızı 7/24 denetliyor. Bugün gerçekleştirilen otomatik aksiyonlar ve iyileştirmeler aşağıdadır.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Doğruluk Oranı</div>
                                <div className="text-xl font-black text-primary">%{stats?.aiMetrics?.accuracy || 94.5}</div>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Aktif Modeller</div>
                                <div className="text-xl font-black text-purple-400">{stats?.aiMetrics?.activeModels || 4}</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                                <Activity className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="text-3xl font-black mb-1">{stats?.aiMetrics?.automatedActions || 0}</div>
                            <div className="text-xs text-slate-400 font-medium">Bugün Tamamlanan Otomatik İşlem</div>
                        </div>
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-primary/20 rounded-2xl border border-primary/30 cursor-pointer"
                        >
                            <div className="w-10 h-10 bg-primary/40 rounded-xl flex items-center justify-center mb-4">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-3xl font-black mb-1">₺{stats?.aiMetrics?.savingsGenerated?.toLocaleString() || '0'}</div>
                            <div className="text-xs text-slate-300 font-medium italic">AI Tarafından Sağlanan Tasarruf</div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Alt Bilgi Gridi - Finansal Analiz ve AI Bilgileri */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10"
                >
                    <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Kârlılık Analizi (Net)
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Brüt Ciro</span>
                            <span className="font-bold">₺{stats?.totalRevenue?.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-white/5" />
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs text-red-500/80">
                                <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-red-400" /> Ürün Maliyeti</span>
                                <span>- ₺{stats?.financialAnalytics?.totalProductCost?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-red-500/80">
                                <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-red-400" /> Komisyon</span>
                                <span>- ₺{stats?.financialAnalytics?.totalCommission?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-red-500/80">
                                <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-red-400" /> Kargo</span>
                                <span>- ₺{stats?.financialAnalytics?.totalShipping?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-red-500/80">
                                <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-red-400" /> KDV / Vergi</span>
                                <span>- ₺{stats?.financialAnalytics?.totalTax?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t-2 border-dashed border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-foreground">Net Kâr</span>
                                <div className="text-right">
                                    <div className="text-xl font-black text-green-500">₺{stats?.netProfit?.toLocaleString()}</div>
                                    <div className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full inline-block">
                                        %{stats?.profitMargin} Marj
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
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
