"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart,
    Package, Users, Star, Eye, BarChart3, PieChart,
    ArrowUpRight, ArrowDownRight, Minus, RefreshCw,
    Zap, Clock, Target, Award, Truck, AlertTriangle,
    Activity, Globe,
} from 'lucide-react';

// ============ ANIMATED COUNTER ============

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }: {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const duration = 1200;
        const steps = 40;
        const stepDuration = duration / steps;
        const increment = (value - display) / steps;
        let current = display;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            current += increment;
            if (step >= steps) {
                current = value;
                clearInterval(timer);
            }
            setDisplay(current);
        }, stepDuration);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>
            {prefix}{display.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
        </span>
    );
}

// ============ TREND INDICATOR ============

function TrendBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    return (
        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black ${
            isPositive ? 'bg-green-500/10 text-green-400' :
            isNeutral ? 'bg-slate-500/10 text-slate-400' :
            'bg-red-500/10 text-red-400'
        }`}>
            {isPositive ? <ArrowUpRight size={10} /> : isNeutral ? <Minus size={10} /> : <ArrowDownRight size={10} />}
            {isPositive ? '+' : ''}{value}{suffix}
        </div>
    );
}

// ============ SPARKLINE ============

function Sparkline({ data, color = '#3b82f6', height = 40 }: { data: number[]; color?: string; height?: number }) {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 100;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');
    const areaPoints = `0,${height} ${points} ${w},${height}`;

    return (
        <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ============ MINI BAR CHART ============

function MiniBarChart({ data, color = '#3b82f6' }: { data: { label: string; value: number }[]; color?: string }) {
    if (data.length === 0) {
        return <div className="text-[10px] text-slate-500">Grafik verisi bulunamadi.</div>;
    }

    const max = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.value / max) * 100}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5, type: 'spring' }}
                        className="w-full rounded-t-sm min-h-[2px]"
                        style={{ backgroundColor: color, opacity: 0.6 + (d.value / max) * 0.4 }}
                    />
                    <span className="text-[7px] text-slate-600 font-bold">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

// ============ MAIN KPI CARD ============

function KPICard({
    title, value, prefix, suffix, decimals, trend, icon: Icon, color,
    sparkData, subtitle, onClick, pulse,
}: {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    trend?: number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    sparkData?: number[];
    subtitle?: string;
    onClick?: () => void;
    pulse?: boolean;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={onClick}
            className={`bg-surface border border-border rounded-2xl p-4 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Background glow */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${color}`} />

            <div className="flex items-start justify-between mb-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10 border border-current/10`}
                    style={{ backgroundColor: `${color}15`, borderColor: `${color}25` }}
                >
                    <Icon size={18} className={pulse ? 'animate-pulse' : ''} />
                </div>
                {trend !== undefined && <TrendBadge value={trend} />}
            </div>

            <div className="relative z-10">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">{title}</p>
                <p className="text-2xl font-black text-white leading-none">
                    <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
                </p>
                {subtitle && <p className="text-[10px] text-slate-600 mt-1">{subtitle}</p>}
            </div>

            {sparkData && (
                <div className="mt-3 relative z-10">
                    <Sparkline data={sparkData} color={color} height={32} />
                </div>
            )}
        </motion.div>
    );
}

// ============ PLATFORM CARD ============

function PlatformCard({ name, logo, orders, revenue, trend }: {
    name: string;
    logo: string;
    orders: number;
    revenue: number;
    trend: number;
}) {
    return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-black text-slate-400 shrink-0">
                {logo}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{name}</p>
                <p className="text-[10px] text-slate-600">{orders} sipariş</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-white">₺{revenue.toLocaleString('tr-TR')}</p>
                <TrendBadge value={trend} />
            </div>
        </div>
    );
}

// ============ REAL-TIME ACTIVITY FEED ============

function ActivityFeed({ activities }: { activities: { id: string; type: string; text: string; time: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }[] }) {
    return (
        <div className="space-y-1">
            {activities.map((a, i) => (
                <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${a.color}`}>
                        <a.icon size={11} />
                    </div>
                    <p className="text-[11px] text-slate-400 flex-1">{a.text}</p>
                    <span className="text-[9px] text-slate-600 shrink-0">{a.time}</span>
                </motion.div>
            ))}
        </div>
    );
}

// ============ MAIN COMPONENT ============

export default function LiveAnalyticsDashboard() {
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [analytics, setAnalytics] = useState({
        revenue: 0,
        revenueTrend: 0,
        revenueHistory: [] as number[],
        orders: 0,
        ordersTrend: 0,
        ordersHistory: [] as number[],
        visitors: 0,
        visitorsTrend: 0,
        visitorsHistory: [] as number[],
        conversionRate: 0,
        conversionTrend: 0,
        avgOrderValue: 0,
        aovTrend: 0,
        pendingOrders: 0,
        lowStock: 0,
        activeProducts: 0,
        customerCount: 0,
        customerTrend: 0,
        returnRate: 0,
        returnTrend: 0,
        platforms: [] as { name: string; logo: string; orders: number; revenue: number; trend: number }[],
        hourlyOrders: [] as { label: string; value: number }[],
    });
    const [activities, setActivities] = useState<{ id: string; type: string; text: string; time: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }[]>([]);

    const loadAnalytics = async () => {
        const candidates = ['/api/analytics/live', '/api/dashboard/live-analytics'];

        for (const url of candidates) {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) continue;
                const payload = await res.json();
                const data = payload?.data ?? payload ?? {};

                setAnalytics(prev => ({
                    ...prev,
                    revenue: Number(data.revenue ?? 0),
                    revenueTrend: Number(data.revenueTrend ?? 0),
                    revenueHistory: Array.isArray(data.revenueHistory) ? data.revenueHistory.map(Number) : [],
                    orders: Number(data.orders ?? 0),
                    ordersTrend: Number(data.ordersTrend ?? 0),
                    ordersHistory: Array.isArray(data.ordersHistory) ? data.ordersHistory.map(Number) : [],
                    visitors: Number(data.visitors ?? 0),
                    visitorsTrend: Number(data.visitorsTrend ?? 0),
                    visitorsHistory: Array.isArray(data.visitorsHistory) ? data.visitorsHistory.map(Number) : [],
                    conversionRate: Number(data.conversionRate ?? 0),
                    conversionTrend: Number(data.conversionTrend ?? 0),
                    avgOrderValue: Number(data.avgOrderValue ?? 0),
                    aovTrend: Number(data.aovTrend ?? 0),
                    pendingOrders: Number(data.pendingOrders ?? 0),
                    lowStock: Number(data.lowStock ?? 0),
                    activeProducts: Number(data.activeProducts ?? 0),
                    customerCount: Number(data.customerCount ?? 0),
                    customerTrend: Number(data.customerTrend ?? 0),
                    returnRate: Number(data.returnRate ?? 0),
                    returnTrend: Number(data.returnTrend ?? 0),
                    platforms: Array.isArray(data.platforms) ? data.platforms : [],
                    hourlyOrders: Array.isArray(data.hourlyOrders) ? data.hourlyOrders : [],
                }));

                const incomingActivities = Array.isArray(data.activities) ? data.activities : [];
                setActivities(
                    incomingActivities.map((a: any, index: number) => ({
                        id: String(a.id ?? `${index}`),
                        type: String(a.type ?? 'activity'),
                        text: String(a.text ?? ''),
                        time: String(a.time ?? ''),
                        icon: Activity,
                        color: 'bg-blue-500/10 text-blue-400',
                    }))
                );

                return;
            } catch {
                continue;
            }
        }

        setAnalytics(prev => ({ ...prev }));
        setActivities([]);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadAnalytics();
        setLastRefresh(new Date());
        setIsRefreshing(false);
    };

    useEffect(() => {
        void loadAnalytics();
    }, []);

    const busiestHour = analytics.hourlyOrders.reduce<{ label: string; value: number } | null>((acc, cur) => {
        if (!acc || cur.value > acc.value) return cur;
        return acc;
    }, null);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">Canlı Analitik</h1>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Activity size={12} className="text-green-400 animate-pulse" />
                        Gerçek zamanlı veri akışı
                        <span className="text-slate-700">•</span>
                        Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    Yenile
                </button>
            </div>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Günlük Ciro"
                    value={analytics.revenue}
                    prefix="₺"
                    decimals={2}
                    trend={analytics.revenueTrend}
                    icon={DollarSign}
                    color="#22c55e"
                    sparkData={analytics.revenueHistory}
                    subtitle="Dünden %12.5 fazla"
                />
                <KPICard
                    title="Toplam Sipariş"
                    value={analytics.orders}
                    trend={analytics.ordersTrend}
                    icon={ShoppingCart}
                    color="#3b82f6"
                    sparkData={analytics.ordersHistory}
                    subtitle={`${analytics.pendingOrders} beklemede`}
                    pulse={analytics.pendingOrders > 20}
                />
                <KPICard
                    title="Ziyaretçi"
                    value={analytics.visitors}
                    trend={analytics.visitorsTrend}
                    icon={Eye}
                    color="#8b5cf6"
                    sparkData={analytics.visitorsHistory}
                    subtitle={`Dönüşüm: %${analytics.conversionRate}`}
                />
                <KPICard
                    title="Ort. Sepet Değeri"
                    value={analytics.avgOrderValue}
                    prefix="₺"
                    decimals={2}
                    trend={analytics.aovTrend}
                    icon={Target}
                    color="#f59e0b"
                    subtitle="Hedefe %87 ulaşıldı"
                />
            </div>

            {/* Secondary row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Aktif Ürünler" value={analytics.activeProducts} icon={Package} color="#06b6d4" />
                <KPICard title="Müşteriler" value={analytics.customerCount} trend={analytics.customerTrend} icon={Users} color="#ec4899" />
                <KPICard title="İade Oranı" value={analytics.returnRate} suffix="%" decimals={1} trend={analytics.returnTrend} icon={RefreshCw} color="#ef4444" />
                <KPICard title="Düşük Stok" value={analytics.lowStock} icon={AlertTriangle} color="#f97316" pulse={analytics.lowStock > 5} subtitle="Dikkat gerekiyor" />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Platform Performance */}
                <div className="bg-surface border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pazaryeri Performansı</h3>
                        <Globe size={14} className="text-slate-600" />
                    </div>
                    <div className="space-y-1">
                        {analytics.platforms.map(p => (
                            <PlatformCard key={p.name} {...p} />
                        ))}
                        {analytics.platforms.length === 0 && (
                            <div className="text-xs text-slate-500 px-2 py-3">Pazaryeri verisi bulunamadi.</div>
                        )}
                    </div>
                </div>

                {/* Hourly Orders */}
                <div className="bg-surface border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Saatlik Siparişler</h3>
                        <BarChart3 size={14} className="text-slate-600" />
                    </div>
                    <MiniBarChart data={analytics.hourlyOrders} color="#3b82f6" />
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-600">En yoğun: {busiestHour ? `${busiestHour.label}:00` : '-'}</span>
                        <span className="text-[10px] text-primary font-bold">{busiestHour ? `${busiestHour.value} siparis` : 'Veri yok'}</span>
                    </div>
                </div>

                {/* Real-time Activity */}
                <div className="bg-surface border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={12} className="text-green-400 animate-pulse" />
                            Canlı Aktivite
                        </h3>
                    </div>
                    <ActivityFeed activities={activities} />
                    {activities.length === 0 && (
                        <div className="text-xs text-slate-500 px-2 py-1">Aktivite verisi bulunamadi.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
