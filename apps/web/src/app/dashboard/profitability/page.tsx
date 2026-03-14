"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, Percent, Package,
    BarChart3, ArrowUpRight, ArrowDownRight, Filter, Download,
    PieChart, Calculator, AlertTriangle, Star, ChevronDown
} from 'lucide-react';
import { ExportButton } from '@/lib/export-utils';

import { useProfitability } from '@/lib/hooks';

type SortField = 'name' | 'revenue' | 'profit' | 'margin' | 'quantity' | 'roi';
type SortDir = 'desc' | 'asc';

interface ProfitabilityProduct {
    id: string;
    sku: string;
    name: string;
    platform: string;
    salePrice: number;
    costPrice: number;
    quantity: number;
    returns: number;
    commission: number;
    shipping: number;
    tax: number;
    // Enriched fields
    netQuantity: number;
    revenue: number;
    totalCost: number;
    totalCommission: number;
    totalShipping: number;
    totalTax: number;
    returnCost: number;
    totalExpenses: number;
    profit: number;
    margin: number;
    roi: number;
}

export default function ProfitabilityPage() {
    const { data: profitabilityDataFromApi, loading } = useProfitability();
    const [period, setPeriod] = useState('30d');
    const [sortField, setSortField] = useState<SortField>('profit');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [showLossOnly, setShowLossOnly] = useState(false);

    const profitabilityData = profitabilityDataFromApi?.products || [];

    const enrichedProducts = useMemo(() => {
        if (!profitabilityData || !Array.isArray(profitabilityData)) return [];
        return profitabilityData.map((p: any) => {
            const netQuantity = p.quantity - p.returns;
            const revenue = p.salePrice * netQuantity;
            const totalCost = p.costPrice * p.quantity; // cost for all, including returns
            const totalCommission = p.commission * netQuantity;
            const totalShipping = p.shipping * netQuantity;
            const totalTax = p.tax * netQuantity;
            const returnCost = p.returns * (p.shipping + p.costPrice * 0.1); // return logistics
            const totalExpenses = totalCost + totalCommission + totalShipping + totalTax + returnCost;
            const profit = revenue - totalExpenses;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
            const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

            return {
                ...p,
                netQuantity,
                revenue,
                totalCost,
                totalCommission,
                totalShipping,
                totalTax,
                returnCost,
                totalExpenses,
                profit,
                margin,
                roi,
            };
        });
    }, []);

    const filtered = useMemo(() => {
        let data = enrichedProducts;
        if (platformFilter !== 'all') data = data.filter(p => p.platform === platformFilter);
        if (showLossOnly) data = data.filter(p => p.profit < 0);
        data.sort((a, b) => {
            const aVal = a[sortField] ?? 0;
            const bVal = b[sortField] ?? 0;
            return sortDir === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
        });
        return data;
    }, [enrichedProducts, platformFilter, showLossOnly, sortField, sortDir]);

    const totals = useMemo(() => {
        return enrichedProducts.reduce((acc, p) => ({
            revenue: acc.revenue + p.revenue,
            cost: acc.cost + p.totalCost,
            commission: acc.commission + p.totalCommission,
            shipping: acc.shipping + p.totalShipping,
            tax: acc.tax + p.totalTax,
            profit: acc.profit + p.profit,
            quantity: acc.quantity + p.netQuantity,
            returns: acc.returns + p.returns,
        }), { revenue: 0, cost: 0, commission: 0, shipping: 0, tax: 0, profit: 0, quantity: 0, returns: 0 });
    }, [enrichedProducts]);

    const overallMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

    const platformBreakdown = useMemo(() => {
        const platforms: Record<string, { revenue: number; profit: number; count: number }> = {};
        enrichedProducts.forEach(p => {
            if (!platforms[p.platform]) platforms[p.platform] = { revenue: 0, profit: 0, count: 0 };
            platforms[p.platform].revenue += p.revenue;
            platforms[p.platform].profit += p.profit;
            platforms[p.platform].count += p.netQuantity;
        });
        return Object.entries(platforms).map(([name, data]) => ({
            name,
            ...data,
            margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
        })).sort((a, b) => b.profit - a.profit);
    }, [enrichedProducts]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const lossProducts = enrichedProducts.filter(p => p.margin < 0).length;
    const lowMarginProducts = enrichedProducts.filter(p => p.margin >= 0 && p.margin < 10).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-emerald-500" />
                        Kârlılık Analizi
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Ürün bazlı gelir, gider ve kâr/zarar analizi
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-background rounded-xl border border-border p-1">
                        {['7d', '30d', '90d', '1y'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${period === p ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-foreground'}`}
                            >
                                {p === '7d' ? '7 Gün' : p === '30d' ? '30 Gün' : p === '90d' ? '90 Gün' : '1 Yıl'}
                            </button>
                        ))}
                    </div>
                    <ExportButton
                        data={filtered.map((p: any) => ({
                            'SKU': p.sku,
                            'Ürün': p.name,
                            'Platform': p.platform,
                            'Satış Fiyatı': p.salePrice,
                            'Maliyet': p.costPrice,
                            'Adet': p.netQuantity,
                            'Ciro': fmt(p.revenue),
                            'Toplam Gider': fmt(p.totalExpenses),
                            'Net Kâr': fmt(p.profit),
                            'Marj (%)': p.margin.toFixed(1),
                            'ROI (%)': p.roi.toFixed(1),
                        }))}
                        filename="karlilik-analizi"
                        title="Kârlılık Analizi Raporu"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Toplam Ciro', value: `₺${fmt(totals.revenue)}`, icon: DollarSign, color: 'blue', sub: `${totals.quantity} adet satış` },
                    { label: 'Net Kâr', value: `₺${fmt(totals.profit)}`, icon: totals.profit >= 0 ? TrendingUp : TrendingDown, color: totals.profit >= 0 ? 'emerald' : 'red', sub: `Marj: %${overallMargin.toFixed(1)}` },
                    { label: 'Toplam Gider', value: `₺${fmt(totals.cost + totals.commission + totals.shipping + totals.tax)}`, icon: ArrowDownRight, color: 'orange', sub: `Komisyon: ₺${fmt(totals.commission)}` },
                    { label: 'İade Maliyeti', value: `${totals.returns} adet`, icon: Package, color: 'red', sub: `%${((totals.returns / (totals.quantity + totals.returns)) * 100).toFixed(1)} iade oranı` },
                    { label: 'Zarar Eden Ürün', value: `${lossProducts}`, icon: AlertTriangle, color: 'red', sub: `${lowMarginProducts} düşük marjlı` },
                ].map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-surface rounded-2xl p-5 border border-border"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 bg-${card.color}-500/20 rounded-xl`}>
                                <card.icon className={`w-5 h-5 text-${card.color}-500`} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-500">{card.label}</div>
                                <div className="text-xl font-black text-foreground">{card.value}</div>
                                <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Platform Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-1 bg-surface rounded-2xl p-6 border border-border"
                >
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-400" />
                        Platform Kârlılığı
                    </h3>
                    <div className="space-y-4">
                        {platformBreakdown.map((pl, i) => {
                            const maxRevenue = Math.max(...platformBreakdown.map(p => p.revenue));
                            const width = maxRevenue > 0 ? (pl.revenue / maxRevenue) * 100 : 0;
                            return (
                                <div key={pl.name}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-foreground">{pl.name}</span>
                                        <span className={`text-sm font-bold ${pl.margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            %{pl.margin.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-background rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${pl.margin >= 15 ? 'bg-emerald-500' : pl.margin >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{ width: `${width}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                                        <span>Ciro: ₺{fmt(pl.revenue)}</span>
                                        <span>Kâr: ₺{fmt(pl.profit)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Cost Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-border"
                >
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Gider Dağılımı
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Ürün Maliyeti', value: totals.cost, color: 'bg-blue-500', pct: totals.cost / (totals.cost + totals.commission + totals.shipping + totals.tax) * 100 },
                            { label: 'Komisyonlar', value: totals.commission, color: 'bg-orange-500', pct: totals.commission / (totals.cost + totals.commission + totals.shipping + totals.tax) * 100 },
                            { label: 'Kargo', value: totals.shipping, color: 'bg-purple-500', pct: totals.shipping / (totals.cost + totals.commission + totals.shipping + totals.tax) * 100 },
                            { label: 'Vergi', value: totals.tax, color: 'bg-red-500', pct: totals.tax / (totals.cost + totals.commission + totals.shipping + totals.tax) * 100 },
                        ].map(item => (
                            <div key={item.label} className="p-4 bg-background rounded-xl border border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-xs text-slate-500">{item.label}</span>
                                </div>
                                <div className="text-lg font-bold text-foreground">₺{fmt(item.value)}</div>
                                <div className="text-xs text-slate-400">%{item.pct.toFixed(1)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Visual bar */}
                    <div className="flex rounded-full h-4 overflow-hidden">
                        <div className="bg-blue-500" style={{ width: `${totals.cost / (totals.cost + totals.commission + totals.shipping + totals.tax) * 100}%` }} />
                        <div className="bg-orange-500" style={{ width: `${totals.commission / (totals.cost + totals.commission + totals.shipping + totals.tax) * 100}%` }} />
                        <div className="bg-purple-500" style={{ width: `${totals.shipping / (totals.cost + totals.commission + totals.shipping + totals.tax) * 100}%` }} />
                        <div className="bg-red-500" style={{ width: `${totals.tax / (totals.cost + totals.commission + totals.shipping + totals.tax) * 100}%` }} />
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={platformFilter}
                        onChange={(e) => setPlatformFilter(e.target.value)}
                        className="bg-surface border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:border-emerald-500 focus:outline-none"
                    >
                        <option value="all">Tüm Platformlar</option>
                        <option value="Trendyol">Trendyol</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Hepsiburada">Hepsiburada</option>
                        <option value="N11">N11</option>
                        <option value="Çiçeksepeti">Çiçeksepeti</option>
                    </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showLossOnly}
                        onChange={(e) => setShowLossOnly(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-500">Sadece zarar eden ürünler</span>
                </label>
            </div>

            {/* Products P&L Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-surface rounded-2xl border border-border overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="text-left p-4 text-slate-500 font-bold">Ürün</th>
                                <th className="text-center p-4 text-slate-500 font-bold">Platform</th>
                                <th
                                    className="text-right p-4 text-slate-500 font-bold cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort('quantity')}
                                >
                                    Adet {sortField === 'quantity' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                                <th
                                    className="text-right p-4 text-slate-500 font-bold cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort('revenue')}
                                >
                                    Ciro {sortField === 'revenue' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                                <th className="text-right p-4 text-slate-500 font-bold">Maliyet</th>
                                <th className="text-right p-4 text-slate-500 font-bold">Komisyon</th>
                                <th
                                    className="text-right p-4 text-slate-500 font-bold cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort('profit')}
                                >
                                    Net Kâr {sortField === 'profit' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                                <th
                                    className="text-right p-4 text-slate-500 font-bold cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort('margin')}
                                >
                                    Marj {sortField === 'margin' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                                <th
                                    className="text-right p-4 text-slate-500 font-bold cursor-pointer hover:text-foreground"
                                    onClick={() => toggleSort('roi')}
                                >
                                    ROI {sortField === 'roi' && (sortDir === 'desc' ? '↓' : '↑')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((product: any) => (
                                <tr key={product.id} className="hover:bg-background/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{product.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{product.sku}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="px-2 py-1 bg-background rounded-lg text-xs text-slate-500 border border-border">
                                            {product.platform}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-foreground">
                                        {product.netQuantity}
                                        {product.returns > 0 && (
                                            <span className="text-xs text-red-400 ml-1">(-{product.returns})</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right text-foreground font-medium">₺{fmt(product.revenue)}</td>
                                    <td className="p-4 text-right text-slate-400">₺{fmt(product.totalCost)}</td>
                                    <td className="p-4 text-right text-slate-400">₺{fmt(product.totalCommission)}</td>
                                    <td className={`p-4 text-right font-bold ${product.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {product.profit >= 0 ? '+' : ''}₺{fmt(product.profit)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.margin >= 20
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : product.margin >= 10
                                                ? 'bg-yellow-500/10 text-yellow-500'
                                                : product.margin >= 0
                                                    ? 'bg-orange-500/10 text-orange-500'
                                                    : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            %{product.margin.toFixed(1)}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-right font-medium ${product.roi >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                                        %{product.roi.toFixed(0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-100 dark:bg-slate-800/50 font-bold">
                            <tr>
                                <td className="p-4 text-foreground" colSpan={2}>TOPLAM</td>
                                <td className="p-4 text-right text-foreground">{totals.quantity}</td>
                                <td className="p-4 text-right text-foreground">₺{fmt(totals.revenue)}</td>
                                <td className="p-4 text-right text-slate-400">₺{fmt(totals.cost)}</td>
                                <td className="p-4 text-right text-slate-400">₺{fmt(totals.commission)}</td>
                                <td className={`p-4 text-right ${totals.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {totals.profit >= 0 ? '+' : ''}₺{fmt(totals.profit)}
                                </td>
                                <td className="p-4 text-right">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${overallMargin >= 10 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        %{overallMargin.toFixed(1)}
                                    </span>
                                </td>
                                <td className="p-4 text-right text-blue-400">
                                    %{(totals.cost > 0 ? (totals.profit / totals.cost * 100) : 0).toFixed(0)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
