"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, Download, Calendar, Filter, TrendingUp, TrendingDown,
    FileText, PieChart, ArrowUpRight, ArrowDownRight, DollarSign,
    Package, ShoppingCart, Users, Globe, Clock, ChevronDown, Printer
} from 'lucide-react';

type ReportType = 'sales' | 'products' | 'platforms' | 'customers' | 'financial';
type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

const REPORT_TYPES = [
    { id: 'sales' as ReportType, label: 'Satış Raporu', icon: ShoppingCart, color: 'blue' },
    { id: 'products' as ReportType, label: 'Ürün Raporu', icon: Package, color: 'purple' },
    { id: 'platforms' as ReportType, label: 'Platform Raporu', icon: Globe, color: 'cyan' },
    { id: 'customers' as ReportType, label: 'Müşteri Raporu', icon: Users, color: 'indigo' },
    { id: 'financial' as ReportType, label: 'Finansal Rapor', icon: DollarSign, color: 'emerald' },
];

const PERIODS: { id: Period; label: string }[] = [
    { id: 'daily', label: 'Günlük' },
    { id: 'weekly', label: 'Haftalık' },
    { id: 'monthly', label: 'Aylık' },
    { id: 'quarterly', label: 'Çeyreklik' },
    { id: 'yearly', label: 'Yıllık' },
    { id: 'custom', label: 'Özel' },
];

const salesData = {
    summary: [
        { label: 'Toplam Satış', value: '₺1.284.520', change: 12.5, icon: DollarSign },
        { label: 'Sipariş Sayısı', value: '4.892', change: 8.3, icon: ShoppingCart },
        { label: 'Ortalama Sepet', value: '₺262', change: 3.8, icon: TrendingUp },
        { label: 'İade Oranı', value: '%3.2', change: -0.5, icon: Package },
    ],
    table: [
        { date: '2025-01-27', orders: 156, revenue: '₺42.120', avgOrder: '₺270', returns: 5 },
        { date: '2025-01-26', orders: 142, revenue: '₺38.540', avgOrder: '₺271', returns: 3 },
        { date: '2025-01-25', orders: 168, revenue: '₺45.360', avgOrder: '₺270', returns: 7 },
        { date: '2025-01-24', orders: 134, revenue: '₺36.180', avgOrder: '₺270', returns: 4 },
        { date: '2025-01-23', orders: 189, revenue: '₺51.030', avgOrder: '₺270', returns: 6 },
        { date: '2025-01-22', orders: 145, revenue: '₺39.150', avgOrder: '₺270', returns: 2 },
        { date: '2025-01-21', orders: 178, revenue: '₺48.060', avgOrder: '₺270', returns: 8 },
    ],
    platforms: [
        { name: 'Trendyol', revenue: '₺542.320', share: 42.2, change: 15.3 },
        { name: 'Hepsiburada', revenue: '₺321.130', share: 25.0, change: 8.7 },
        { name: 'Amazon', revenue: '₺257.900', share: 20.1, change: -2.3 },
        { name: 'N11', revenue: '₺112.450', share: 8.8, change: 5.1 },
        { name: 'Çiçeksepeti', revenue: '₺50.720', share: 3.9, change: 22.8 },
    ],
};

export default function AdvancedReportsPage() {
    const [reportType, setReportType] = useState<ReportType>('sales');
    const [period, setPeriod] = useState<Period>('monthly');
    const [showSchedule, setShowSchedule] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-blue-500" />
                        Gelişmiş Raporlama
                    </h1>
                    <p className="text-slate-500 mt-1">Detaylı satış, ürün ve platform raporlarınızı inceleyin</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowSchedule(!showSchedule)} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-300 hover:text-foreground transition-colors">
                        <Clock className="w-4 h-4" /> Zamanla
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" /> Dışa Aktar
                    </button>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                {REPORT_TYPES.map(rt => (
                    <button key={rt.id} onClick={() => setReportType(rt.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${reportType === rt.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-surface border border-border text-slate-500 hover:text-foreground'}`}>
                        <rt.icon className="w-4 h-4" /> {rt.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div className="flex gap-1">
                    {PERIODS.map(p => (
                        <button key={p.id} onClick={() => setPeriod(p.id)}
                            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${period === p.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-foreground'}`}>
                            {p.label}
                        </button>
                    ))}
                </div>
                {period === 'custom' && (
                    <div className="flex items-center gap-2 ml-4">
                        <input type="date" className="px-3 py-1.5 bg-background rounded-lg text-xs text-foreground border border-border" />
                        <span className="text-xs text-slate-500">—</span>
                        <input type="date" className="px-3 py-1.5 bg-background rounded-lg text-xs text-foreground border border-border" />
                    </div>
                )}
            </div>

            {showSchedule && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-bold text-foreground mb-4">Otomatik Rapor Zamanla</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Sıklık</label>
                            <select className="w-full px-3 py-2 bg-background rounded-xl text-sm text-foreground border border-border">
                                <option>Her gün</option><option>Her hafta</option><option>Her ay</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Format</label>
                            <select className="w-full px-3 py-2 bg-background rounded-xl text-sm text-foreground border border-border">
                                <option>PDF</option><option>Excel</option><option>CSV</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">E-posta</label>
                            <input type="email" placeholder="rapor@email.com" className="w-full px-3 py-2 bg-background rounded-xl text-sm text-foreground border border-border placeholder:text-slate-500" />
                        </div>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Zamanlayıcıyı Kaydet</button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {salesData.summary.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-surface rounded-2xl border border-border p-5">
                        <div className="flex items-center justify-between mb-3">
                            <item.icon className="w-5 h-5 text-slate-400" />
                            <span className={`flex items-center text-xs font-medium ${item.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {item.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {Math.abs(item.change)}%
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{item.value}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Platform Dağılımı</h3>
                <div className="space-y-3">
                    {salesData.platforms.map((p, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <span className="w-24 text-sm text-foreground font-medium">{p.name}</span>
                            <div className="flex-1 h-8 bg-background rounded-lg overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${p.share}%` }} transition={{ delay: i * 0.1, duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center px-3">
                                    <span className="text-xs text-white font-medium">{p.share}%</span>
                                </motion.div>
                            </div>
                            <span className="w-24 text-sm text-foreground text-right">{p.revenue}</span>
                            <span className={`w-16 text-xs text-right ${p.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {p.change > 0 ? '+' : ''}{p.change}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="text-lg font-bold text-foreground">Detaylı Veri</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 text-xs font-medium text-slate-500">Tarih</th>
                                <th className="text-right p-4 text-xs font-medium text-slate-500">Sipariş</th>
                                <th className="text-right p-4 text-xs font-medium text-slate-500">Gelir</th>
                                <th className="text-right p-4 text-xs font-medium text-slate-500">Ort. Sipariş</th>
                                <th className="text-right p-4 text-xs font-medium text-slate-500">İade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesData.table.map((row, i) => (
                                <tr key={i} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                                    <td className="p-4 text-foreground">{row.date}</td>
                                    <td className="p-4 text-right text-foreground">{row.orders}</td>
                                    <td className="p-4 text-right text-foreground font-medium">{row.revenue}</td>
                                    <td className="p-4 text-right text-slate-400">{row.avgOrder}</td>
                                    <td className="p-4 text-right text-red-400">{row.returns}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
