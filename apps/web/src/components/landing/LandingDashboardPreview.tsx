"use client";

import React from 'react';
import {
    Activity, ArrowUpRight, Bell, Boxes, CheckCircle, Clock,
    LayoutDashboard, Package, Search, ShoppingBag, Truck,
    TrendingUp, Globe, Zap, DollarSign,
} from 'lucide-react';

const platformColors: Record<string, string> = {
    Trendyol: 'bg-orange-500',
    Hepsiburada: 'bg-orange-600',
    Amazon: 'bg-amber-500',
    N11: 'bg-purple-500',
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Beklemede', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/80 dark:border-amber-500/20', icon: <Clock size={9} /> },
    CONFIRMED: { label: 'Hazırlanıyor', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200/80 dark:border-orange-500/20', icon: <Package size={9} /> },
    SHIPPED: { label: 'Kargoda', color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200/80 dark:border-violet-500/20', icon: <Truck size={9} /> },
    DELIVERED: { label: 'Teslim', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20', icon: <CheckCircle size={9} /> },
};

const stats = [
    { label: 'Günlük ciro', value: '₺42.580', change: '+12.4%', icon: DollarSign, accent: 'text-orange-600' },
    { label: 'Sipariş', value: '84', change: '+5', icon: ShoppingBag, accent: 'text-slate-600 dark:text-slate-300' },
    { label: 'Bekleyen', value: '12', change: '3 yeni', icon: Clock, accent: 'text-amber-600' },
    { label: 'Stok sync', value: '198ms', change: 'Canlı', icon: Zap, accent: 'text-emerald-600' },
];

const platformBars = [
    { name: 'Trendyol', revenue: '₺18.2K', pct: 82, color: 'bg-orange-500' },
    { name: 'Hepsiburada', revenue: '₺12.4K', pct: 65, color: 'bg-orange-600' },
    { name: 'Amazon', revenue: '₺7.8K', pct: 48, color: 'bg-amber-500' },
    { name: 'N11', revenue: '₺4.1K', pct: 31, color: 'bg-purple-500' },
];

const recentOrders = [
    { id: 'TR-2847193', platform: 'Trendyol', customer: 'Ayşe K.', time: '14:32', amount: 1249, status: 'CONFIRMED', paid: true },
    { id: 'HB-908214', platform: 'Hepsiburada', customer: 'Mehmet D.', time: '14:18', amount: 3890, status: 'SHIPPED', paid: true },
    { id: 'AMZ-55201', platform: 'Amazon', customer: 'Zeynep A.', time: '13:55', amount: 756, status: 'PENDING', paid: false },
    { id: 'N11-440982', platform: 'N11', customer: 'Can B.', time: '13:41', amount: 2150, status: 'DELIVERED', paid: true },
    { id: 'TR-2847088', platform: 'Trendyol', customer: 'Elif S.', time: '13:22', amount: 489, status: 'SHIPPED', paid: true },
] as const;

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: ShoppingBag, label: 'Siparişler', badge: 12 },
    { icon: Package, label: 'Ürünler' },
    { icon: Boxes, label: 'Stok', alert: true },
    { icon: Globe, label: 'Entegrasyonlar' },
];

const syncChannels = [
    { name: 'Trendyol', ok: true },
    { name: 'Hepsiburada', ok: true },
    { name: 'Amazon', ok: true },
    { name: 'N11', ok: false },
];

export default function LandingDashboardPreview({ className = '' }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute -inset-4 rounded-[28px] bg-orange-500/[0.06] blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0c1222] shadow-[0_24px_64px_-28px_rgba(15,23,42,0.28)] dark:shadow-[0_24px_64px_-28px_rgba(0,0,0,0.6)] overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center h-10 px-3 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/90 dark:bg-white/[0.02]">
                    <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="flex-1 flex justify-center px-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                            <span className="text-[9px] text-slate-500 font-mono">app.pazaryonetimi.com/dashboard</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="relative">
                            <Bell size={13} className="text-slate-400" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-[#0c1222]" />
                        </span>
                    </div>
                </div>

                <div className="flex min-h-[340px]">
                    {/* Sidebar */}
                    <aside className="hidden sm:flex w-[132px] shrink-0 flex-col border-r border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100/80 dark:border-white/[0.04]">
                            <div className="w-6 h-6 rounded-md bg-orange-600 flex items-center justify-center text-white text-[9px] font-black">P</div>
                            <span className="text-[9px] font-bold text-slate-800 dark:text-white truncate">Pazaryonetimi</span>
                        </div>
                        <nav className="flex-1 p-2 space-y-0.5">
                            {navItems.map((item) => (
                                <div
                                    key={item.label}
                                    className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[9px] font-semibold ${
                                        item.active
                                            ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <span className="flex items-center gap-1.5 min-w-0">
                                        <item.icon size={11} className="shrink-0" />
                                        <span className="truncate">{item.label}</span>
                                    </span>
                                    {item.badge && (
                                        <span className="ml-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[7px] font-bold flex items-center justify-center">{item.badge}</span>
                                    )}
                                    {item.alert && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </nav>
                        <div className="p-2 border-t border-slate-100 dark:border-white/[0.04]">
                            <div className="flex items-center gap-1.5 px-1.5 py-1">
                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300">MK</div>
                                <div className="min-w-0">
                                    <p className="text-[8px] font-semibold text-slate-700 dark:text-slate-200 truncate">ModaBütik</p>
                                    <p className="text-[7px] text-slate-400 truncate">Pro plan</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100/80 dark:border-white/[0.04] bg-white dark:bg-transparent">
                            <div className="min-w-0">
                                <h3 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">Kontrol Merkezi</h3>
                                <p className="text-[8px] text-slate-400 truncate">5 Haziran 2026 · 14:35</p>
                            </div>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 shrink-0">
                                <Activity size={9} className="animate-pulse" />
                                Canlı
                            </span>
                        </div>

                        <div className="flex-1 p-2.5 sm:p-3 space-y-2.5 overflow-hidden">
                            {/* Sync strip */}
                            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                                {syncChannels.map((ch) => (
                                    <span
                                        key={ch.name}
                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-medium whitespace-nowrap border ${
                                            ch.ok
                                                ? 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                                                : 'bg-amber-50/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'
                                        }`}
                                    >
                                        <span className={`w-1 h-1 rounded-full ${ch.ok ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                        {ch.name}
                                    </span>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-1.5">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="p-2 rounded-lg border border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <stat.icon size={10} className={stat.accent} />
                                            <span className="text-[7px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                                {stat.change.includes('+') && <ArrowUpRight size={8} />}
                                                {stat.change}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-none tabular-nums">{stat.value}</p>
                                        <p className="text-[7px] text-slate-400 mt-0.5 uppercase tracking-wide truncate">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Chart + search row */}
                            <div className="grid grid-cols-5 gap-2">
                                <div className="col-span-3 rounded-lg border border-slate-100 dark:border-white/[0.06] p-2 bg-white dark:bg-white/[0.02]">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[8px] font-semibold text-slate-600 dark:text-slate-300">Kanal cirosu</span>
                                        <TrendingUp size={10} className="text-slate-400" />
                                    </div>
                                    <div className="space-y-1">
                                        {platformBars.map((bar) => (
                                            <div key={bar.name} className="flex items-center gap-1.5">
                                                <span className="w-14 text-[7px] text-slate-500 truncate">{bar.name}</span>
                                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                                    <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                                                </div>
                                                <span className="text-[7px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums w-8 text-right">{bar.revenue}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-[8px] text-slate-400">
                                        <Search size={10} className="shrink-0" />
                                        <span className="truncate">Sipariş ara...</span>
                                    </div>
                                    <div className="flex-1 rounded-lg border border-amber-100 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/5 p-2">
                                        <p className="text-[7px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-0.5">Stok uyarısı</p>
                                        <p className="text-[8px] text-amber-700/90 dark:text-amber-400/90 leading-snug">3 SKU kritik seviyede · Trendyol senkron bekliyor</p>
                                    </div>
                                </div>
                            </div>

                            {/* Orders table */}
                            <div className="rounded-lg border border-slate-100 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-white/[0.01]">
                                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50/90 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                                    <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200">Son siparişler</span>
                                    <div className="flex gap-1">
                                        {['Tümü', 'Bekleyen', 'Kargoda'].map((tab, i) => (
                                            <span
                                                key={tab}
                                                className={`px-1.5 py-0.5 rounded text-[7px] font-semibold ${
                                                    i === 0
                                                        ? 'bg-orange-600 text-white'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {tab}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[7px] font-bold uppercase tracking-wider text-slate-400">
                                                <th className="px-2 py-1.5 w-4" />
                                                <th className="px-1 py-1.5">Sipariş</th>
                                                <th className="px-1 py-1.5 hidden min-[420px]:table-cell">Kanal</th>
                                                <th className="px-1 py-1.5">Müşteri</th>
                                                <th className="px-1 py-1.5 text-right">Tutar</th>
                                                <th className="px-2 py-1.5">Durum</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((order, idx) => {
                                                const status = statusConfig[order.status];
                                                return (
                                                    <tr
                                                        key={order.id}
                                                        className={`border-b border-slate-50 dark:border-white/[0.03] last:border-0 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                                                            idx === 0 ? 'bg-orange-50/40 dark:bg-orange-500/[0.04]' : ''
                                                        }`}
                                                    >
                                                        <td className="px-2 py-1.5">
                                                            <span className="block w-2.5 h-2.5 rounded border border-slate-300 dark:border-white/20" />
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <span className="text-[8px] font-bold text-slate-800 dark:text-white tabular-nums">{order.id}</span>
                                                            <span className="block text-[7px] text-slate-400">{order.time}</span>
                                                        </td>
                                                        <td className="px-1 py-1.5 hidden min-[420px]:table-cell">
                                                            <span className="inline-flex items-center gap-1">
                                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${platformColors[order.platform]}`} />
                                                                <span className="text-[8px] font-medium text-slate-600 dark:text-slate-300">{order.platform}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-1 py-1.5">
                                                            <span className="text-[8px] font-medium text-slate-700 dark:text-slate-200">{order.customer}</span>
                                                            <span className={`block text-[7px] font-semibold uppercase ${order.paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                                {order.paid ? 'Ödendi' : 'Bekliyor'}
                                                            </span>
                                                        </td>
                                                        <td className="px-1 py-1.5 text-right">
                                                            <span className="text-[8px] font-bold text-slate-800 dark:text-white tabular-nums">
                                                                ₺{order.amount.toLocaleString('tr-TR')}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[7px] font-semibold whitespace-nowrap ${status.bg} ${status.color}`}>
                                                                {status.icon}
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
