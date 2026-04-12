"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Star, Users, TrendingUp, TrendingDown, Search, Filter,
    Eye, ShoppingCart, DollarSign, Heart, Award, Medal,
    ArrowUpRight, ArrowDownRight, ChevronDown
} from 'lucide-react';

const customers: any[] = [];

const tierConfig: Record<string, { color: string; bg: string; icon: typeof Star }> = {
    Platin: { color: 'text-violet-400', bg: 'bg-violet-500/10', icon: Award },
    Altın: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Medal },
    Gümüş: { color: 'text-slate-300', bg: 'bg-slate-500/10', icon: Star },
    Bronz: { color: 'text-orange-400', bg: 'bg-orange-500/10', icon: Star },
};

const getScoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
const getScoreBg = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500';

export default function CustomerScoringPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [tierFilter, setTierFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'score' | 'spent'>('score');
    const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

    const filtered = customers
        .filter(c => (tierFilter === 'all' || c.tier === tierFilter) && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => sortBy === 'score' ? b.score - a.score : b.totalSpent - a.totalSpent);

    const avgScore = customers.length > 0 ? Math.round(customers.reduce((a, c) => a + c.score, 0) / customers.length) : 0;
    const totalSpent = customers.reduce((a, c) => a + c.totalSpent, 0);

    const selected = customers.find(c => c.id === selectedCustomer);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Star className="w-7 h-7 text-indigo-400" /> Müşteri Puanlama Sistemi
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Müşterilerinizi puanlayın ve segmentleyin</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Müşteri', value: customers.length, icon: Users, color: 'text-indigo-400' },
                    { label: 'Ort. Puan', value: avgScore, icon: Star, color: getScoreColor(avgScore) },
                    { label: 'Platin Müşteri', value: customers.filter(c => c.tier === 'Platin').length, icon: Award, color: 'text-violet-400' },
                    { label: 'Toplam Gelir', value: `₺${(totalSpent / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-400' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-5">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tier Distribution */}
            <div className="bg-surface rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Kademe Dağılımı</h3>
                <div className="flex gap-3">
                    {Object.entries(tierConfig).map(([tier, cfg]) => {
                        const count = customers.filter(c => c.tier === tier).length;
                        const pct = customers.length > 0 ? Math.round((count / customers.length) * 100) : 0;
                        return (
                            <div key={tier} className="flex-1 text-center p-3 rounded-xl bg-background">
                                <cfg.icon className={`w-5 h-5 ${cfg.color} mx-auto mb-1`} />
                                <div className="text-lg font-bold text-foreground">{count}</div>
                                <div className="text-xs text-slate-500">{tier} (%{pct})</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Müşteri ara..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none" />
                </div>
                <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
                    className="px-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border">
                    <option value="all">Tüm Kademeler</option>
                    {Object.keys(tierConfig).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as 'score' | 'spent')}
                    className="px-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border">
                    <option value="score">Puan</option>
                    <option value="spent">Toplam Harcama</option>
                </select>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Customer List */}
                <div className="col-span-2 space-y-3">
                    {filtered.length === 0 && (
                        <div className="bg-surface rounded-xl border border-border p-6 text-sm text-slate-500">Müşteri puanlama verisi bulunamadı</div>
                    )}
                    {filtered.map((c, i) => {
                        const tCfg = tierConfig[c.tier];
                        return (
                            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                onClick={() => setSelectedCustomer(c.id)}
                                className={`bg-surface rounded-xl border p-5 cursor-pointer transition-all ${selectedCustomer === c.id ? 'border-indigo-500/50' : 'border-border hover:border-indigo-500/20'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${tCfg.bg} flex items-center justify-center`}>
                                            <tCfg.icon className={`w-5 h-5 ${tCfg.color}`} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-foreground">{c.name}</div>
                                            <div className="text-xs text-slate-500">{c.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${tCfg.bg} ${tCfg.color}`}>{c.tier}</span>
                                        <div className="text-right">
                                            <div className={`text-xl font-bold ${getScoreColor(c.score)}`}>{c.score}</div>
                                            <div className="flex items-center gap-0.5 text-[10px]">
                                                {c.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : c.trend === 'down' ? <ArrowDownRight className="w-3 h-3 text-red-400" /> : null}
                                                <span className={c.trend === 'up' ? 'text-emerald-400' : c.trend === 'down' ? 'text-red-400' : 'text-slate-500'}>{c.trend === 'up' ? 'Yükseliyor' : c.trend === 'down' ? 'Düşüyor' : 'Sabit'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> {c.orders} sipariş</span>
                                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ₺{c.totalSpent.toLocaleString()}</span>
                                    <span>Ort: ₺{c.avgOrder}</span>
                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {c.lastOrder}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Detail */}
                <div>
                    {selected ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface rounded-xl border border-border p-5 sticky top-6 space-y-4">
                            <div className="text-center">
                                <div className={`inline-flex p-3 rounded-full ${tierConfig[selected.tier].bg} mb-2`}>
                                    {React.createElement(tierConfig[selected.tier].icon, { className: `w-6 h-6 ${tierConfig[selected.tier].color}` })}
                                </div>
                                <h3 className="text-sm font-semibold text-foreground">{selected.name}</h3>
                                <p className="text-xs text-slate-500">{selected.tier} Müşteri</p>
                            </div>
                            <div className="text-center">
                                <div className={`text-4xl font-bold ${getScoreColor(selected.score)}`}>{selected.score}</div>
                                <div className="h-2 bg-background rounded-full mt-2">
                                    <div className={`h-full rounded-full ${getScoreBg(selected.score)}`} style={{ width: `${selected.score}%` }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs text-slate-400 font-medium">RFM Skorları</h4>
                                {[
                                    { label: 'Recency (Yenilik)', value: selected.rfmR },
                                    { label: 'Frequency (Sıklık)', value: selected.rfmF },
                                    { label: 'Monetary (Tutar)', value: selected.rfmM },
                                ].map((r, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">{r.label}</span>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <div key={s} className={`w-4 h-4 rounded ${s <= r.value ? 'bg-indigo-500' : 'bg-background'}`} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-border space-y-2 text-xs">
                                <div className="flex justify-between"><span className="text-slate-500">Toplam Harcama</span><span className="text-foreground">₺{selected.totalSpent.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Sipariş Sayısı</span><span className="text-foreground">{selected.orders}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Ort. Sepet</span><span className="text-foreground">₺{selected.avgOrder}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Son Sipariş</span><span className="text-foreground">{selected.lastOrder}</span></div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-surface rounded-xl border border-border p-5 text-center">
                            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Detay görmek için müşteri seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
