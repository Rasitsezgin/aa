"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, TrendingUp, TrendingDown, AlertTriangle,
    Search, Filter, RefreshCw, BarChart3, ArrowUpRight,
    ArrowDownRight, Eye, ExternalLink, ShieldAlert,
    Clock, Zap, ShoppingCart, Globe, Boxes, Edit2
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface CompetitorProduct {
    id: string;
    name: string;
    sku: string;
    myPrice: number;
    competitorPrice: number;
    diff: number;
    platform: string;
    competitorName: string;
    buyBox: boolean;
    status: 'under' | 'over' | 'equal';
    lastUpdate: string;
}

export default function CompetitorTrackingPage() {
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<CompetitorProduct[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await apiClient.getCompetitors() as any[];
                const normalized: CompetitorProduct[] = Array.isArray(data)
                    ? data.map((p, i) => {
                        const myPrice = Number(p.myPrice ?? p.ourPrice ?? 0);
                        const competitorPrice = Number(p.competitorPrice ?? p.price ?? 0);
                        const diff = competitorPrice - myPrice;
                        return {
                            id: String(p.id ?? i + 1),
                            name: p.name || p.productName || '-',
                            sku: p.sku || '-',
                            myPrice,
                            competitorPrice,
                            diff,
                            platform: p.platform || '-',
                            competitorName: p.competitorName || p.storeName || '-',
                            buyBox: Boolean(p.buyBox),
                            status: diff < 0 ? 'over' : diff > 0 ? 'under' : 'equal',
                            lastUpdate: p.lastUpdate || p.updatedAt || '-',
                        };
                    })
                    : [];
                setProducts(normalized);
            } catch {
                setProducts([]);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        buyBoxCount: products.filter(p => p.buyBox).length,
        underPriced: products.filter(p => p.status === 'over').length,
        totalTracked: products.length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-slate-500 font-medium">Rakip fiyatlar taranıyor...</p>
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
                        <ShieldAlert className="w-8 h-8 text-red-500" /> Rakip Takibi
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Rakiplerinizin fiyat hamlelerini anlık izleyin ve Buy Box&apos;ı koruyun</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80">
                        <RefreshCw size={16} /> Anlık Tara
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                        <Target size={18} /> Yeni Rakip İzle
                    </button>
                </div>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <BarChart3 size={100} className="text-emerald-500" />
                    </div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Buy Box Sahipliği</div>
                    <div className="text-4xl font-black text-foreground">%{((stats.buyBoxCount / stats.totalTracked) * 100).toFixed(0)}</div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">{stats.buyBoxCount} üründe Buy Box sizde</p>
                </div>

                <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingDown size={100} className="text-red-500" />
                    </div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Yüksek Fiyat Kalan</div>
                    <div className="text-4xl font-black text-red-500">{stats.underPriced} Ürün</div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Bu ürünlerde rakiplerinizden pahalısınız</p>
                </div>

                <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap size={100} />
                    </div>
                    <h3 className="text-lg font-black mb-1">Akıllı Fiyatlama</h3>
                    <p className="text-primary-100 text-xs font-medium leading-relaxed mb-4">
                        Rakipleriniz fiyat değiştirdiğinde sistem sizin yerinize tepki versin ister misiniz?
                    </p>
                    <button className="px-5 py-2 bg-white text-primary font-black rounded-lg text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                        Oto-Pilotu Başlat
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Ürün adı veya SKU ile ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold text-foreground focus:outline-none">
                        <option>Tüm Kanallar</option>
                        <option>Trendyol</option>
                        <option>Hepsiburada</option>
                    </select>
                    <select className="bg-background border border-border rounded-xl px-4 py-2 text-sm font-bold text-foreground focus:outline-none">
                        <option>Durum: Tümü</option>
                        <option>Buy Box Kayıp</option>
                        <option>En Ucuz Benim</option>
                    </select>
                </div>
            </div>

            {/* Tracked Products List */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-background/50 border-b border-border text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-6 py-4 text-left">Ürün Bilgisi</th>
                                <th className="px-6 py-4 text-right">Benim Fiyatım</th>
                                <th className="px-6 py-4 text-right">Rakip Fiyatı</th>
                                <th className="px-6 py-4 text-right">Fark</th>
                                <th className="px-6 py-4 text-center">En Ucuz</th>
                                <th className="px-6 py-4 text-right">Son Güncelleme</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 && (
                                <tr>
                                    <td className="px-6 py-6 text-sm text-slate-500" colSpan={7}>Rakip takip verisi bulunamadı</td>
                                </tr>
                            )}
                            {filtered.map((p, i) => (
                                <motion.tr
                                    key={p.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="hover:bg-background/20 transition-all group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {p.name[0]}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground">{p.name}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase">{p.sku} • {p.platform}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-sm font-black text-foreground">₺{p.myPrice.toLocaleString('tr-TR')}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-sm font-bold text-foreground">₺{p.competitorPrice.toLocaleString('tr-TR')}</div>
                                        <div className="text-[10px] text-slate-400 font-medium italic">{p.competitorName}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className={`text-sm font-black flex items-center justify-end gap-1 ${p.status === 'under' ? 'text-emerald-500' : p.status === 'over' ? 'text-red-500' : 'text-slate-500'}`}>
                                            {p.status === 'under' ? <ArrowUpRight size={14} /> : p.status === 'over' ? <ArrowDownRight size={14} /> : null}
                                            {p.diff > 0 ? `+₺${p.diff}` : p.diff < 0 ? `-₺${Math.abs(p.diff)}` : 'Aynı'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.buyBox ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {p.buyBox ? 'Sizde (Buy Box)' : 'Rakipte'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-xs text-slate-500 font-medium flex items-center justify-end gap-1">
                                            <Clock size={12} /> {p.lastUpdate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-primary transition-all shadow-sm">
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-primary transition-all shadow-sm">
                                                <ExternalLink size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend / Info */}
            <div className="flex gap-6 justify-center">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Fiyatınız Daha Ucuz
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> Rakip Daha Ucuz
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-slate-400" /> Fiyatlar Eşit
                </div>
            </div>
        </div>
    );
}
