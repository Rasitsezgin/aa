"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import Link from 'next/link';
import {
    Users, CreditCard, Activity, Zap, ArrowUpRight, Globe, Server,
    Clock, ShoppingBag, Sparkles, BarChart3, Edit, Save, X, Loader2, Package, TrendingUp, Settings,
    Layers, FileText, Menu, LayoutTemplate, Gift
} from 'lucide-react';
import { saveDashboardLayout } from '@/actions/dashboard';

interface DashboardConfig {
    showStats: boolean;
    showRevenue: boolean;
    showServerStatus: boolean;
    showQuickActions: boolean;
    showLiveLogs: boolean;
    showPlatformStats: boolean;
    isActive: boolean;
    capabilities?: { seo?: boolean; analysis?: boolean; image?: boolean };
    tokensUsed: number;
    showAiVision: boolean;
}

interface Permission {
    id: string;
    action: string;
    resource: string;
}

export default function DashboardClient({ config }: { config: DashboardConfig | null }) {
    const [isEditing, setIsEditing] = useState(false);
    const [layout, setLayout] = useState<DashboardConfig>(config || {
        showStats: true,
        showRevenue: true,
        showServerStatus: true,
        showQuickActions: true,
        showLiveLogs: true,
        showPlatformStats: true,
        showAiVision: true,
        isActive: true,
        tokensUsed: 0,
    });

    const { data: predictions, isLoading: predictionsLoading } = useQuery({
        queryKey: ['admin-predictions'],
        queryFn: () => adminApi.getPredictions(),
        refetchInterval: 300000, // 5 min
    });

    const { data: aiSummary, isLoading: summaryLoading } = useQuery({
        queryKey: ['admin-ai-summary'],
        queryFn: () => adminApi.getAiSummary(),
        refetchInterval: 600000, // 10 min
    });

    const { data: dashboardData, isLoading, isError } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: () => adminApi.getDashboardStats(),
        refetchInterval: 60000,
    });

    const handleSave = async () => {
        await saveDashboardLayout(layout);
        setIsEditing(false);
    };

    const toggleSection = (key: keyof DashboardConfig) => {
        setLayout((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Günaydın" : currentHour < 18 ? "İyi günler" : "İyi akşamlar";

    const formatNumber = (val: number) => new Intl.NumberFormat('tr-TR').format(val || 0);
    const formatCurrency = (val: number) => {
        if (!val) return '₺0';
        if (val >= 1_000_000) return `₺${(val / 1_000_000).toFixed(1)}M`;
        if (val >= 1_000) return `₺${(val / 1_000).toFixed(0)}K`;
        return `₺${val}`;
    };

    const formatUptime = (seconds?: number) => {
        if (!seconds || seconds < 1) return '0dk';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) return `${days}g ${hours}s`;
        if (hours > 0) return `${hours}s ${minutes}dk`;
        return `${minutes}dk`;
    };

    const demandChanges: number[] = Array.isArray(predictions?.demandForecast)
        ? predictions.demandForecast
            .map((item: any) => Number(item?.change || 0))
            .filter((value: number) => Number.isFinite(value))
        : [];

    const expectedGrowth = demandChanges.length > 0
        ? (demandChanges.reduce((sum, value) => sum + value, 0) / demandChanges.length)
        : 0;

    const proactiveAlerts = Array.isArray(predictions?.stockPredictions)
        ? predictions.stockPredictions.slice(0, 5).map((stock: any) => {
            const daysUntilStockout = Number(stock?.daysUntilStockout || 0);
            const severity = daysUntilStockout <= 7 ? 'warning' : daysUntilStockout <= 14 ? 'info' : 'success';
            return {
                type: 'stock',
                severity,
                message: `${stock?.productName || 'Ürün'} için stok tahmini: ${Math.max(daysUntilStockout, 0)} gün`,
            };
        })
        : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative">
            {/* Edit Mode Toggle */}
            <div className="absolute top-0 right-0 z-10">
                {isEditing ? (
                    <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-lg border border-slate-200 dark:border-white/10">
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
                            <Save size={14} /> Kaydet
                        </button>
                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-200">
                            <X size={14} /> İptal
                        </button>
                    </div>
                ) : (
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Son Güncelleme</div>
                        <div className="text-sm font-bold text-foreground flex items-center gap-2 justify-end">
                            <Clock size={14} className="text-slate-400" />
                            {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            <button onClick={() => setIsEditing(true)} className="ml-4 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-blue-500" title="Düzenle">
                                <Edit size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Welcome Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            Tüm Sistemler Çalışıyor
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">{greeting}, <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Admin</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Platform özeti ve kritik metrikler.</p>
                    <div className="flex items-center gap-3 mt-3">
                        <Link 
                            href="/admin/dashboard" 
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                        >
                            <Settings size={14} />
                            Dashboard Widget'ları
                        </Link>
                        <Link 
                            href="/admin/pages" 
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-500/20 transition-colors"
                        >
                            <Layers size={14} />
                            Sayfa Yönetimi
                        </Link>
                        <Link 
                            href="/admin/menus" 
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors"
                        >
                            <Menu size={14} />
                            Menü Yönetimi
                        </Link>
                        <Link 
                            href="/admin/footers" 
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                        >
                            <LayoutTemplate size={14} />
                            Footer Yönetimi
                        </Link>
                        <Link 
                            href="/admin/offers" 
                            className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-600 rounded-lg text-xs font-bold hover:bg-pink-500/20 transition-colors"
                        >
                            <Gift size={14} />
                            Özel Teklifler
                        </Link>
                    </div>
                </div>
            </div>

            {/* Top Stats Row */}
            {isEditing && <label className="flex items-center gap-2 p-2 border border-dashed border-blue-500 rounded-lg mb-2 text-blue-500 font-bold text-xs"><input type="checkbox" checked={layout.showStats} onChange={() => toggleSection('showStats')} /> İstatistikleri Göster</label>}
            {layout.showStats && (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isEditing ? 'opacity-80 border-2 border-dashed border-slate-300 p-2 rounded-3xl' : ''}`}>
                    {[
                        { label: "Toplam Mağaza", value: isLoading ? '...' : formatNumber(dashboardData?.tenantCount || 0), change: dashboardData?.tenantGrowth || "+0%", icon: Users, color: "blue", gradient: "from-blue-500 to-cyan-500" },
                        { label: "Aylık Gelir", value: isLoading ? '...' : formatCurrency(dashboardData?.monthlyRevenue || 0), change: dashboardData?.revenueGrowth || "+0%", icon: CreditCard, color: "emerald", gradient: "from-emerald-500 to-green-500" },
                        { label: "Aktif Oturum", value: isLoading ? '...' : formatNumber(dashboardData?.activeSessions || 0), change: "+0%", icon: Globe, color: "purple", gradient: "from-purple-500 to-pink-500" },
                        { label: "AI İstek/Gün", value: isLoading ? '...' : formatNumber(dashboardData?.aiJobsCount || 0), change: "+0%", icon: Sparkles, color: "amber", gradient: "from-amber-500 to-orange-500" },
                    ].map((stat, idx) => (
                        <div key={idx} className="relative bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4 group hover:border-slate-300 dark:hover:border-white/10 transition-all overflow-hidden shadow-sm dark:shadow-none">
                            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${stat.gradient} opacity-5 dark:opacity-10 blur-3xl group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity rounded-full pointer-events-none`} />
                            <div className="relative flex justify-between items-start">
                                <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 dark:text-${stat.color}-400`}>
                                    <stat.icon size={22} />
                                </div>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1 border border-green-500/20">
                                    <ArrowUpRight size={12} />
                                    {stat.change}
                                </span>
                            </div>
                            <div className="relative">
                                <div className="text-3xl font-black text-foreground tracking-tight">{stat.value}</div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AI VISION - Predictive Analytics */}
            {isEditing && <label className="flex items-center gap-2 p-2 border border-dashed border-blue-500 rounded-lg mb-2 text-blue-500 font-bold text-xs"><input type="checkbox" checked={layout.showAiVision} onChange={() => toggleSection('showAiVision')} /> AI Vision Panelini Göster</label>}
            {layout.showAiVision && (
                <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isEditing ? 'opacity-80 border-2 border-dashed border-slate-300 p-2 rounded-3xl' : ''}`}>
                    {/* Growth Prediction */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity">
                            <Sparkles size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">AI PREDICTION</span>
                                <span className="text-white/60 text-xs font-medium">• 7 Günlük Tahmin</span>
                            </div>
                            <h2 className="text-3xl font-black mb-2 tracking-tight">Satışlarda <span className="text-green-400">%{expectedGrowth.toFixed(1)}</span> Değişim Öngörülüyor</h2>
                            <p className="text-indigo-100/80 text-sm font-medium max-w-md mb-8">
                                {summaryLoading ? 'AI özeti hazırlanıyor...' : (aiSummary?.predictionText || 'AI özeti bulunamadı.')}
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    {
                                        label: "30 Gün Gelir Tahmini",
                                        value: formatCurrency(Number(predictions?.revenuePrediction?.next30Days || 0)),
                                        trend: `${expectedGrowth >= 0 ? '+' : ''}${expectedGrowth.toFixed(1)}%`
                                    },
                                    {
                                        label: "Doğruluk Payı",
                                        value: `%${Number(predictions?.revenuePrediction?.confidence || 0)}`,
                                        trend: Number(predictions?.revenuePrediction?.confidence || 0) >= 80 ? 'Yüksek' : 'Orta'
                                    },
                                    {
                                        label: "Risk Seviyesi",
                                        value: String(predictions?.riskAnalysis?.overallRisk || 'unknown').toUpperCase(),
                                        trend: predictions?.revenuePrediction?.trend === 'up' ? 'Yukarı Trend' : 'Aşağı Trend'
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                        <div className="text-[10px] font-bold text-white/60 uppercase mb-1">{item.label}</div>
                                        <div className="text-lg font-black">{item.value}</div>
                                        <div className="text-[9px] font-bold text-green-400 flex items-center gap-1 mt-1">
                                            <ArrowUpRight size={10} /> {item.trend}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Alerts / Proactive Insights */}
                    <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            Proaktif Analiz
                        </h3>
                        <div className="space-y-4">
                            {predictionsLoading && (
                                <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                                    Proaktif analiz verileri yükleniyor...
                                </div>
                            )}
                            {!predictionsLoading && proactiveAlerts.length === 0 && (
                                <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                                    Gösterilecek stok uyarısı bulunamadı.
                                </div>
                            )}
                            {proactiveAlerts.map((alert: any, i: number) => (
                                <div key={i} className={`p-4 rounded-2xl border flex gap-4 transition-all hover:scale-[1.02] cursor-pointer ${alert.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20 text-amber-900 dark:text-amber-100' :
                                    alert.severity === 'info' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 text-blue-900 dark:text-blue-100' :
                                        'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 text-green-900 dark:text-green-100'
                                    }`}>
                                    <div className="mt-0.5">
                                        {alert.type === 'stock' ? <Package size={18} /> : <TrendingUp size={18} />}
                                    </div>
                                    <div>
                                        <div className="text-[13px] font-bold leading-tight">{alert.message}</div>
                                        <div className="text-[10px] opacity-70 mt-1 font-medium">Hemen İncele</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Revenue Chart */}
                <div className="lg:col-span-8 space-y-2">
                    {isEditing && <label className="flex items-center gap-2 p-2 border border-dashed border-blue-500 rounded-lg text-blue-500 font-bold text-xs"><input type="checkbox" checked={layout.showRevenue} onChange={() => toggleSection('showRevenue')} /> Gelir Grafiğini Göster</label>}
                    {layout.showRevenue && (
                        <div className={`bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-none ${isEditing ? 'opacity-80 border-2 border-dashed border-slate-300' : ''}`}>
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider flex items-center gap-3">
                                        <BarChart3 size={20} className="text-blue-500 dark:text-blue-400" />
                                        Gelir Analizi
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Son 12 ayın ciro performansı</p>
                                </div>
                            </div>
                            <div className="flex items-end gap-2 h-56 w-full">
                                {(() => {
                                    const revenueChart = dashboardData?.revenueChart || [];
                                    const chartData = revenueChart.length > 0
                                        ? revenueChart.map((item: any) => item.revenue || 0)
                                        : [];

                                    if (chartData.length === 0) {
                                        return (
                                            <div className="w-full h-full flex items-center justify-center text-sm text-slate-500">
                                                Gelir grafiği için yeterli veri yok.
                                            </div>
                                        );
                                    }

                                    const maxVal = Math.max(...chartData, 1);
                                    return chartData.map((val: number, i: number) => {
                                        const h = Math.max((val / maxVal) * 100, 5);
                                        return (
                                            <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer" title={revenueChart[i]?.month ? `${revenueChart[i].month}: ${formatCurrency(val)}` : undefined}>
                                                <div style={{ height: `${h}%` }} className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500/40 rounded-t-lg group-hover:from-blue-500 group-hover:to-blue-400 transition-all duration-300 relative shadow-lg shadow-blue-500/10" />
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Server Status & Load */}
                <div className="lg:col-span-4 space-y-2">
                    {isEditing && <label className="flex items-center gap-2 p-2 border border-dashed border-blue-500 rounded-lg text-blue-500 font-bold text-xs"><input type="checkbox" checked={layout.showServerStatus} onChange={() => toggleSection('showServerStatus')} /> Sunucu Durumunu Göster</label>}
                    {layout.showServerStatus && (
                        <div className={`bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 flex flex-col shadow-sm dark:shadow-none h-full ${isEditing ? 'opacity-80 border-2 border-dashed border-slate-300' : ''}`}>
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-3">
                                <Activity size={20} className="text-emerald-500 dark:text-emerald-400" />
                                Sistem Sağlığı
                            </h3>
                            <div className="flex-1 flex items-center justify-center relative my-4">
                                <div className="w-44 h-44 rounded-full border-[10px] border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                                    <div className="text-center z-10">
                                        <div className="text-3xl font-black text-foreground">{isLoading ? '...' : formatUptime(dashboardData?.serverStatus?.uptime)}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Çalışma Süresi</div>
                                    </div>
                                </div>
                            </div>
                            {isError && (
                                <div className="mt-4 text-xs text-red-500 font-medium text-center">
                                    Sunucu sağlık verisi alınamadı.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
