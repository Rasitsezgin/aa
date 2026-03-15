"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, TrendingUp, BarChart3, Target,
    Zap, Plus, Filter, Search, MoreVertical,
    CheckCircle2, AlertTriangle, Clock, MousePointer2,
    Eye, ShoppingBag, ArrowUpRight, ArrowDownRight,
    RefreshCw, Play, Pause, Trash2, DollarSign
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Campaign {
    id: string;
    name: string;
    platform: 'Trendyol' | 'Hepsiburada' | 'Amazon' | 'N11';
    type: 'Search' | 'Display' | 'Product';
    status: 'active' | 'paused' | 'ended' | 'scheduled';
    budget: number;
    spent: number;
    roas: number;
    ctr: number;
    impressions: number;
    clicks: number;
    sales: number;
    startDate: string;
    endDate?: string;
}

export default function AdCampaignsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [filterPlatform, setFilterPlatform] = useState('all');

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const data = await apiClient.getCampaigns() as any[];
                const normalized: Campaign[] = Array.isArray(data)
                    ? data.map((c, i) => ({
                        id: String(c.id ?? i + 1),
                        name: c.name,
                        platform: (Array.isArray(c.platforms) && c.platforms[0]) || c.platform || 'Trendyol',
                        type: c.type || 'Search',
                        status: c.status === 'completed' ? 'ended' : (c.status || 'paused'),
                        budget: Number(c.budget || 0),
                        spent: Number(c.spent || 0),
                        roas: Number(c.roas || 0),
                        ctr: Number(c.ctr || 0),
                        impressions: Number(c.impressions || 0),
                        clicks: Number(c.clicks || 0),
                        sales: Number(c.conversions || c.sales || 0),
                        startDate: c.startDate || '',
                        endDate: c.endDate,
                    }))
                    : [];
                setCampaigns(normalized);
            } catch {
                setCampaigns([]);
            }
            setLoading(false);
        };
        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(c =>
        (filterPlatform === 'all' || c.platform === filterPlatform) &&
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        totalSpent: campaigns.reduce((acc, c) => acc + c.spent, 0),
        avgRoas: campaigns.filter(c => c.roas > 0).length > 0
            ? campaigns.filter(c => c.roas > 0).reduce((acc, c, _, arr) => acc + (c.roas / arr.length), 0)
            : 0,
        totalClicks: campaigns.reduce((acc, c) => acc + c.clicks, 0),
        totalSales: campaigns.reduce((acc, c) => acc + c.sales, 0),
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 font-medium">Reklam verileri analiz ediliyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-orange-500" /> Reklam Kampanyaları
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Bütçenizi yönetin ve reklam yatırım getirinizi (ROAS) artırın</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">
                    <Plus size={18} /> Yeni Kampanya Oluştur
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Harcama', value: `₺${stats.totalSpent.toLocaleString('tr-TR')}`, icon: DollarSign, color: 'text-blue-500', trend: '+12%', up: true },
                    { label: 'Ortalama ROAS', value: `${stats.avgRoas.toFixed(1)}x`, icon: TrendingUp, color: 'text-emerald-500', trend: '+0.5', up: true },
                    { label: 'Toplam Tıklama', value: stats.totalClicks.toLocaleString('tr-TR'), icon: MousePointer2, color: 'text-purple-500', trend: '-2%', up: false },
                    { label: 'Reklam Kaynaklı Satış', value: stats.totalSales.toLocaleString('tr-TR'), icon: ShoppingBag, color: 'text-orange-500', trend: '+8', up: true },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface rounded-2xl border border-border p-5"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon size={20} className={stat.color} />
                            <div className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded ${stat.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {stat.up ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                                {stat.trend}
                            </div>
                        </div>
                        <div className="text-2xl font-black text-foreground">{stat.value}</div>
                        <div className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tight">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Kampanya adı ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-indigo-500/50"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold text-foreground focus:outline-none"
                    >
                        <option value="all">Tüm Platformlar</option>
                        <option value="Trendyol">Trendyol</option>
                        <option value="Hepsiburada">Hepsiburada</option>
                        <option value="Amazon">Amazon</option>
                        <option value="N11">N11</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-bold text-slate-600 hover:text-foreground transition-all">
                        <Filter size={16} /> Filtreler
                    </button>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-background/50 border-b border-border text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-4 text-left">Kampanya</th>
                                <th className="px-6 py-4 text-left">Durum</th>
                                <th className="px-6 py-4 text-right">Bütçe</th>
                                <th className="px-6 py-4 text-right">Harcama</th>
                                <th className="px-6 py-4 text-right">ROAS</th>
                                <th className="px-6 py-4 text-right">Tıklama/CTR</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCampaigns.length === 0 && (
                                <tr>
                                    <td className="px-6 py-6 text-sm text-slate-500" colSpan={7}>Reklam kampanya verisi bulunamadı</td>
                                </tr>
                            )}
                            {filteredCampaigns.map((c) => (
                                <tr key={c.id} className="hover:bg-background/20 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-[10px]">
                                                {c.platform[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground">{c.name}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">{c.platform} • {c.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500' :
                                                c.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'
                                                }`} />
                                            <span className="text-xs font-black uppercase tracking-tighter text-slate-500">
                                                {c.status === 'active' ? 'AKTİF' : c.status === 'paused' ? 'DURAKLATILDI' : 'TAMAMLANDI'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-sm font-bold text-foreground">₺{c.budget.toLocaleString('tr-TR')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-sm font-bold text-foreground">₺{c.spent.toLocaleString('tr-TR')}</div>
                                        <div className="w-20 ml-auto h-1.5 bg-background rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${(c.spent / c.budget) * 100}%` }} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`text-sm font-black ${c.roas >= 4 ? 'text-emerald-500' : 'text-slate-500'}`}>
                                            {c.roas > 0 ? `${c.roas.toFixed(1)}x` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-sm font-bold text-foreground">{c.clicks.toLocaleString('tr-TR')}</div>
                                        <div className="text-[10px] text-slate-500">%{c.ctr.toFixed(1)} CTR</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 outline-none">
                                            {c.status === 'active' ? (
                                                <button className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-all" title="Duraklat">
                                                    <Pause size={14} />
                                                </button>
                                            ) : (
                                                <button className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all" title="Başlat">
                                                    <Play size={14} />
                                                </button>
                                            )}
                                            <button className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap size={120} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-100">
                            <Zap size={14} /> AI Optimizasyon Önerisi
                        </div>
                        <h3 className="text-xl font-black">&quot;Prime Day&quot; Kampanyanızı Ölçeklendirin</h3>
                        <p className="text-indigo-100/90 text-sm font-medium leading-relaxed">
                            Amazon&apos;daki Prime Day hazırlık kampanyanızıb ROAS değeri beklentilerin %40 üzerinde. Bütçeyi ₺5.000 artırmak tahmini ₺32.000 ek satış getirebilir.
                        </p>
                        <button className="px-6 py-2.5 bg-white text-indigo-600 font-black rounded-lg text-sm hover:scale-105 transition-all shadow-lg active:scale-95">
                            Hemen Uygula
                        </button>
                    </div>
                </div>

                <div className="bg-surface rounded-2xl border border-border p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Target size={18} className="text-orange-500" /> Kanallara Göre Performans
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Trendyol', val: 65, color: 'bg-orange-500' },
                            { name: 'Hepsiburada', val: 42, color: 'bg-blue-500' },
                            { name: 'Amazon', val: 88, color: 'bg-indigo-500' },
                            { name: 'N11', val: 24, color: 'bg-red-500' },
                        ].map(platform => (
                            <div key={platform.name} className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black text-slate-500">
                                    <span>{platform.name}</span>
                                    <span>%{platform.val} VERİMLİLİK</span>
                                </div>
                                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${platform.val}%` }}
                                        className={`h-full ${platform.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
