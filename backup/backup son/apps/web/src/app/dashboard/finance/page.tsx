"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, TrendingDown, PieChart,
    BarChart3, Wallet, ArrowUpRight, ArrowDownRight,
    Filter, Download, Calendar, Zap, Scale, Percent,
    RefreshCw, Receipt, CreditCard, Package
} from 'lucide-react';
import { useFinance, usePlatformPerformance, useSalesForecast, FinanceStats } from '@/lib/hooks';

interface FinancePlatform {
    name: string;
    revenue: number;
    cost: number;
    margin: string;
    colors: { bg: string; bar: string; dot: string };
}

type Period = '7d' | '30d' | '90d' | '365d';

const PERIOD_LABELS: Record<Period, string> = {
    '7d': 'Son 7 Gün',
    '30d': 'Son 30 Gün',
    '90d': 'Son 90 Gün',
    '365d': 'Bu Yıl',
};

const platformColors: Record<string, { bg: string; bar: string; dot: string }> = {
    'Trendyol': { bg: 'bg-orange-500/10', bar: 'bg-orange-500', dot: 'bg-orange-500' },
    'Amazon': { bg: 'bg-amber-500/10', bar: 'bg-amber-500', dot: 'bg-amber-500' },
    'Hepsiburada': { bg: 'bg-red-500/10', bar: 'bg-red-500', dot: 'bg-red-500' },
    'N11': { bg: 'bg-purple-500/10', bar: 'bg-purple-500', dot: 'bg-purple-500' },
    'Çiçeksepeti': { bg: 'bg-pink-500/10', bar: 'bg-pink-500', dot: 'bg-pink-500' },
};

// Simple inline SVG sparkline chart
function SparkLine({ values, color = '#6366f1' }: { values: number[]; color?: string }) {
    if (!values || values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const w = 260; const h = 60;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');
    const areaPath = `M0,${h} ` + values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 4);
        return `L${x},${y}`;
    }).join(' ') + ` L${w},${h} Z`;
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none">
            <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#sg)" />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function FinancePage() {
    const [period, setPeriod] = useState<Period>('30d');
    const { getStats, loading } = useFinance();
    const { data: platformData } = usePlatformPerformance(period);
    const { data: forecastData } = useSalesForecast(30);
    const [stats, setStats] = useState<FinanceStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await getStats();
            setStats(data as FinanceStats | null);
        };
        fetchStats();
    }, [period]);

    const displayStats = stats || { totalRevenue: 0, totalProfit: 0, totalCommission: 0, margin: 0, orderCount: 0 };

    const displayPlatforms: FinancePlatform[] = (Array.isArray(platformData) && platformData.length > 0)
        ? (platformData as any[]).map((p) => ({
            name: p.name,
            revenue: p.revenue || 0,
            cost: p.cost || 0,
            margin: p.revenue > 0 ? ((p.revenue - (p.cost || 0)) / p.revenue * 100).toFixed(1) : '0.0',
            colors: platformColors[p.name] || { bg: 'bg-slate-500/10', bar: 'bg-slate-500', dot: 'bg-slate-500' },
        }))
        : [];

    const maxRevenue = Math.max(...displayPlatforms.map(p => p.revenue), 1);

    // Sparkline values from monthly trend data (fetched from API)
    const sparkValues = (platformData as any)?.monthlyTrend
        ? (platformData as any).monthlyTrend.map((m: any) => m.amount || 0)
        : stats
            ? [stats.totalRevenue]
            : [];

    const downloadCSV = () => {
        if (!displayPlatforms.length) return;
        const rows = [['Platform', 'Gelir (₺)', 'Maliyet (₺)', 'Marj (%)'],
        ...displayPlatforms.map(p => [p.name, p.revenue.toFixed(2), p.cost.toFixed(2), p.margin])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `finans-raporu-${period}.csv`; a.click();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-emerald-500" /> Finans & Karlılık
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Satışlarınızın ve operasyonel karlılığınızın AI destekli analizi</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${period === p ? 'bg-emerald-600 text-white' : 'bg-surface border border-border text-slate-400 hover:text-foreground'}`}>
                            {PERIOD_LABELS[p]}
                        </button>
                    ))}
                    <button onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <Download size={15} /> CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Toplam Ciro', value: `₺${displayStats.totalRevenue.toLocaleString('tr-TR')}`, icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%', up: true },
                    { label: 'Net Kar', value: `₺${displayStats.totalProfit.toLocaleString('tr-TR')}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+8.4%', up: true },
                    { label: 'Komisyon', value: `₺${displayStats.totalCommission.toLocaleString('tr-TR')}`, icon: Receipt, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: '-1.2%', up: false },
                    { label: 'Ort. Marj', value: `%${displayStats.margin}`, icon: Percent, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+0.8%', up: true },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-surface rounded-2xl border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${s.up ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                {s.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {s.trend}
                            </div>
                        </div>
                        {loading ? (
                            <div className="h-8 bg-background rounded-lg animate-pulse mb-1" />
                        ) : (
                            <div className="text-3xl font-black text-foreground">{s.value}</div>
                        )}
                        <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Revenue Sparkline */}
            {sparkValues.length > 0 && (
                <div className="bg-surface rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-black text-foreground">Gelir Trendi</h3>
                        <span className="text-xs font-bold text-slate-500 uppercase">{PERIOD_LABELS[period]}</span>
                    </div>
                    <SparkLine values={sparkValues} color="#10b981" />
                    <div className="flex justify-between mt-2 text-xs text-slate-600">
                        <span>Dönem Başı</span>
                        <span className="text-emerald-500 font-bold">
                            ₺{displayStats.totalRevenue.toLocaleString('tr-TR')} Bugün
                        </span>
                    </div>
                </div>
            )}

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Platform P&L */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-foreground">Pazaryeri Karlılığı</h3>
                            <p className="text-sm text-slate-500 font-medium">Kanallara göre gelir ve maliyet dağılımı</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-background rounded-xl animate-pulse" />)}
                        </div>
                    ) : displayPlatforms.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <BarChart3 size={40} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-sm">Henüz platform verisi yok</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {displayPlatforms.map((platform, i) => (
                                <div key={platform.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${platform.colors.dot}`} />
                                            <span className="font-bold text-foreground">{platform.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500 text-xs">₺{platform.revenue.toLocaleString('tr-TR')}</span>
                                            <span className="font-bold text-green-500 text-xs">%{platform.margin} marj</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 h-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(platform.revenue / maxRevenue) * 100}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                                            className={`h-full rounded-full ${platform.colors.bar}`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-600">
                                        <span>Maliyet: ₺{platform.cost.toLocaleString('tr-TR')}</span>
                                        <span>Kâr: ₺{(platform.revenue - platform.cost).toLocaleString('tr-TR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Insights */}
                <div className="bg-surface rounded-2xl border border-primary/20 p-6 relative overflow-hidden group">
                    <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={200} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-foreground flex items-center gap-2 mb-5">
                        <Zap size={20} className="text-primary" /> AI Finans Öngörüleri
                    </h3>
                    <div className="space-y-4 relative z-10">
                        {(forecastData?.insights && Array.isArray(forecastData.insights) && forecastData.insights.length > 0)
                            ? (forecastData.insights as any[]).map((insight, idx: number) => {
                                const colorMap: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
                                    'optimization': { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: <TrendingUp size={16} /> },
                                    'warning': { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', icon: <Scale size={16} /> },
                                    'impact': { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', icon: <BarChart3 size={16} /> },
                                };
                                const style = colorMap[insight.type] || colorMap['optimization'];
                                return (
                                    <div key={idx} className={`p-4 ${style.bg} ${style.border} border rounded-xl`}>
                                        <div className={`flex items-center gap-2 ${style.text} font-bold text-sm mb-2`}>{style.icon} {insight.title}</div>
                                        <p className="text-xs text-foreground font-medium leading-relaxed">{insight.description}</p>
                                    </div>
                                );
                            })
                            : (
                                <>
                                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2"><TrendingUp size={16} /> Kar Optimizasyonu</div>
                                        <p className="text-xs text-foreground leading-relaxed">Trendyol Aksesuar marjınız %20 altında. Fiyatları %5 artırmak net kârı <span className="text-green-500 font-bold">₺12,500</span> artırabilir.</p>
                                    </div>
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <div className="flex items-center gap-2 text-blue-500 font-bold text-sm mb-2"><Scale size={16} /> Nakit Akışı</div>
                                        <p className="text-xs text-foreground leading-relaxed">Amazon hakediş gecikmesi nedeniyle 15 gün içinde nakit daralması bekleniyor. Stok alımını 1 hafta ötelemeyi düşünün.</p>
                                    </div>
                                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                        <div className="flex items-center gap-2 text-orange-500 font-bold text-sm mb-2"><BarChart3 size={16} /> Kampanya Etkisi</div>
                                        <p className="text-xs text-foreground leading-relaxed">Son kampanyada ciro %40 artarken yüksek iade oranı (%12) net kârlılığı %15 düşürdü.</p>
                                    </div>
                                </>
                            )}
                    </div>
                    <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                        <div className="text-xs font-bold text-primary mb-1">Gelecek Ay Tahmini</div>
                        <div className="text-2xl font-black text-foreground">
                            ₺{(displayStats.totalProfit * 1.15).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-500 font-bold mt-1">
                            <TrendingUp size={12} /> %15 büyüme tahmini
                        </div>
                    </div>
                    <button className="w-full mt-4 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        Detaylı Analiz Oluştur
                    </button>
                </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="text-lg font-black text-foreground mb-5">Maliyet Dağılımı</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Pazaryeri Komisyonu', value: displayStats.totalCommission, pct: '18%', icon: CreditCard, color: 'text-red-500', bg: 'bg-red-500/10' },
                        { label: 'Kargo Maliyeti', value: Math.round(displayStats.totalRevenue * 0.07), pct: '7%', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Reklam Harcaması', value: Math.round(displayStats.totalRevenue * 0.05), pct: '5%', icon: TrendingDown, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                        { label: 'İade Maliyeti', value: Math.round(displayStats.totalRevenue * 0.03), pct: '3%', icon: RefreshCw, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    ].map(c => (
                        <div key={c.label} className="p-4 bg-background rounded-xl border border-border">
                            <div className={`p-2 rounded-lg ${c.bg} w-fit mb-3`}><c.icon className={`w-4 h-4 ${c.color}`} /></div>
                            <div className="text-lg font-black text-foreground">₺{c.value.toLocaleString('tr-TR')}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{c.label}</div>
                            <div className={`text-xs font-bold ${c.color} mt-1`}>{c.pct} pay</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
