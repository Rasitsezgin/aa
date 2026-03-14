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
    const max = Math.max(...data.map(d => d.value)) || 1;

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

    // Mock live data - in real app this would come from WebSocket or polling
    const mockData = {
        revenue: 48750.90,
        revenueTrend: 12.5,
        revenueHistory: [32000, 35000, 38000, 42000, 39000, 44000, 48750],
        orders: 156,
        ordersTrend: 8.3,
        ordersHistory: [120, 135, 128, 142, 150, 148, 156],
        visitors: 3420,
        visitorsTrend: -2.1,
        visitorsHistory: [3800, 3500, 3200, 3600, 3400, 3300, 3420],
        conversionRate: 4.56,
        conversionTrend: 0.3,
        avgOrderValue: 312.50,
        aovTrend: 5.2,
        pendingOrders: 23,
        lowStock: 8,
        activeProducts: 342,
        customerCount: 1850,
        customerTrend: 15.2,
        returnRate: 2.8,
        returnTrend: -0.5,
        platforms: [
            { name: 'Trendyol', logo: 'T', orders: 78, revenue: 24300, trend: 15 },
            { name: 'Hepsiburada', logo: 'H', orders: 42, revenue: 13200, trend: 8 },
            { name: 'Amazon', logo: 'A', orders: 23, revenue: 7800, trend: 22 },
            { name: 'N11', logo: 'N', orders: 13, revenue: 3450, trend: -3 },
        ],
        hourlyOrders: [
            { label: '09', value: 5 }, { label: '10', value: 12 }, { label: '11', value: 18 },
            { label: '12', value: 22 }, { label: '13', value: 15 }, { label: '14', value: 28 },
            { label: '15', value: 20 }, { label: '16', value: 16 },
        ],
    };

    const activities = [
        { id: '1', type: 'order', text: 'Yeni sipariş: #TR-4521 (₺245.00)', time: '2dk', icon: ShoppingCart, color: 'bg-green-500/10 text-green-400' },
        { id: '2', type: 'review', text: 'Yeni değerlendirme: ⭐⭐⭐⭐⭐', time: '5dk', icon: Star, color: 'bg-yellow-500/10 text-yellow-400' },
        { id: '3', type: 'stock', text: 'Düşük stok: "Bluetooth Kulaklık" (3 adet)', time: '8dk', icon: AlertTriangle, color: 'bg-orange-500/10 text-orange-400' },
        { id: '4', type: 'order', text: 'Yeni sipariş: #HB-1287 (₺189.90)', time: '12dk', icon: ShoppingCart, color: 'bg-green-500/10 text-green-400' },
        { id: '5', type: 'shipping', text: 'Kargo teslim edildi: #TR-4498', time: '15dk', icon: Truck, color: 'bg-blue-500/10 text-blue-400' },
        { id: '6', type: 'price', text: 'Rakip fiyat değişimi: -₺15 (Ürün #342)', time: '18dk', icon: TrendingDown, color: 'bg-red-500/10 text-red-400' },
    ];

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setLastRefresh(new Date());
            setIsRefreshing(false);
        }, 1000);
    };

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
                    value={mockData.revenue}
                    prefix="₺"
                    decimals={2}
                    trend={mockData.revenueTrend}
                    icon={DollarSign}
                    color="#22c55e"
                    sparkData={mockData.revenueHistory}
                    subtitle="Dünden %12.5 fazla"
                />
                <KPICard
                    title="Toplam Sipariş"
                    value={mockData.orders}
                    trend={mockData.ordersTrend}
                    icon={ShoppingCart}
                    color="#3b82f6"
                    sparkData={mockData.ordersHistory}
                    subtitle={`${mockData.pendingOrders} beklemede`}
                    pulse={mockData.pendingOrders > 20}
                />
                <KPICard
                    title="Ziyaretçi"
                    value={mockData.visitors}
                    trend={mockData.visitorsTrend}
                    icon={Eye}
                    color="#8b5cf6"
                    sparkData={mockData.visitorsHistory}
                    subtitle={`Dönüşüm: %${mockData.conversionRate}`}
                />
                <KPICard
                    title="Ort. Sepet Değeri"
                    value={mockData.avgOrderValue}
                    prefix="₺"
                    decimals={2}
                    trend={mockData.aovTrend}
                    icon={Target}
                    color="#f59e0b"
                    subtitle="Hedefe %87 ulaşıldı"
                />
            </div>

            {/* Secondary row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Aktif Ürünler" value={mockData.activeProducts} icon={Package} color="#06b6d4" />
                <KPICard title="Müşteriler" value={mockData.customerCount} trend={mockData.customerTrend} icon={Users} color="#ec4899" />
                <KPICard title="İade Oranı" value={mockData.returnRate} suffix="%" decimals={1} trend={mockData.returnTrend} icon={RefreshCw} color="#ef4444" />
                <KPICard title="Düşük Stok" value={mockData.lowStock} icon={AlertTriangle} color="#f97316" pulse={mockData.lowStock > 5} subtitle="Dikkat gerekiyor" />
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
                        {mockData.platforms.map(p => (
                            <PlatformCard key={p.name} {...p} />
                        ))}
                    </div>
                </div>

                {/* Hourly Orders */}
                <div className="bg-surface border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Saatlik Siparişler</h3>
                        <BarChart3 size={14} className="text-slate-600" />
                    </div>
                    <MiniBarChart data={mockData.hourlyOrders} color="#3b82f6" />
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-600">En yoğun: 14:00</span>
                        <span className="text-[10px] text-primary font-bold">28 sipariş</span>
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
                </div>
            </div>
        </div>
    );
}
