"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Zap, Check, X, Settings, TrendingUp, TrendingDown,
    RefreshCw, Plus, Loader2, ChevronRight, Shield, Globe, Bell,
    Clock, BarChart3, ArrowRight, Play, Pause, Trash2
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface PriceRule {
    id: string;
    name: string;
    platform: string;
    type: 'min_margin' | 'competitor_match' | 'dynamic' | 'time_based';
    status: 'active' | 'paused';
    affectedProducts: number;
    avgPriceChange: number;
    description: string;
    minMargin?: number;
}

interface PriceSuggestion {
    id: string;
    product: string;
    currentPrice: number;
    suggestedPrice: number;
    competitorPrice: number;
    margin: number;
    reason: string;
    impact: string;
    platform: string;
}

interface PriceHistory {
    id: string;
    date: string;
    product: string;
    oldPrice: number;
    newPrice: number;
    source: string;
    platform: string;
}

const RULE_TYPE_LABELS: Record<string, string> = {
    min_margin: 'Min. Marj',
    competitor_match: 'Rakip Eşleştir',
    dynamic: 'Dinamik',
    time_based: 'Zamanlı',
};

const RULE_TYPE_ICONS: Record<string, any> = {
    min_margin: Shield,
    competitor_match: Globe,
    dynamic: Zap,
    time_based: Clock,
};

export default function PriceOptimizationPage() {
    const [tab, setTab] = useState<'suggestions' | 'rules' | 'history'>('suggestions');

    // Suggestions state
    const [suggestions, setSuggestions] = useState<PriceSuggestion[]>([]);
    const [sugLoading, setSugLoading] = useState(true);
    const [approvedIds, setApprovedIds] = useState<string[]>([]);
    const [rejectedIds, setRejectedIds] = useState<string[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Rules state
    const [rules, setRules] = useState<PriceRule[]>([]);
    const [rulesLoading, setRulesLoading] = useState(true);
    const [showNewRule, setShowNewRule] = useState(false);

    // History state
    const [history, setHistory] = useState<PriceHistory[]>([]);
    const [histLoading, setHistLoading] = useState(false);

    const loadSuggestions = async () => {
        setSugLoading(true);
        try {
            const data = await apiClient.request<PriceSuggestion[]>('/price-suggestions');
            setSuggestions(data || []);
        } catch { setSuggestions([]); }
        setSugLoading(false);
    };

    const loadRules = async () => {
        setRulesLoading(true);
        try {
            const data = await apiClient.request<PriceRule[]>('/price-rules');
            setRules(data || []);
        } catch { setRules([]); }
        setRulesLoading(false);
    };

    const loadHistory = async () => {
        setHistLoading(true);
        try {
            const data = await apiClient.request<PriceHistory[]>('/price-history');
            setHistory(data || []);
        } catch { setHistory([]); }
        setHistLoading(false);
    };

    useEffect(() => { loadSuggestions(); loadRules(); }, []);
    useEffect(() => { if (tab === 'history' && history.length === 0) loadHistory(); }, [tab]);

    // Load functions hoisted above

    const approve = async (id: string) => {
        setActionLoading(id);
        try {
            await apiClient.request(`/price-suggestions/${id}/approve`, { method: 'POST' });
            setApprovedIds(prev => [...prev, id]);
        } catch { setApprovedIds(prev => [...prev, id]); }
        setActionLoading(null);
    };

    const reject = async (id: string) => {
        setActionLoading(id);
        try {
            await apiClient.request(`/price-suggestions/${id}/reject`, { method: 'POST' });
            setRejectedIds(prev => [...prev, id]);
        } catch { setRejectedIds(prev => [...prev, id]); }
        setActionLoading(null);
    };

    const toggleRule = async (rule: PriceRule) => {
        const newStatus = rule.status === 'active' ? 'paused' : 'active';
        try {
            await apiClient.request(`/price-rules/${rule.id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
            setRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: newStatus } : r));
        } catch { /* ignore */ }
    };

    const deleteRule = async (id: string) => {
        try {
            await apiClient.request(`/price-rules/${id}`, { method: 'DELETE' });
            setRules(prev => prev.filter(r => r.id !== id));
        } catch { /* ignore */ }
    };

    const pendingSuggestions = suggestions.filter(s => !approvedIds.includes(s.id) && !rejectedIds.includes(s.id));
    const activeRules = rules.filter(r => r.status === 'active').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Target className="w-8 h-8 text-emerald-500" /> Fiyat Optimizasyonu
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">AI destekli fiyat önerileri ve otomatik fiyatlandırma kuralları</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-bold flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> AI Aktif
                    </span>
                    <button onClick={loadSuggestions} className="p-2 hover:bg-surface rounded-xl text-slate-400 hover:text-foreground transition-all">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
                {[
                    { id: 'suggestions', label: 'Fiyat Önerileri', count: pendingSuggestions.length },
                    { id: 'rules', label: 'Fiyat Kuralları', count: activeRules },
                    { id: 'history', label: 'Değişiklik Geçmişi' },
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
                        className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${tab === t.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-foreground'}`}>
                        {t.label}
                        {t.count !== undefined && t.count > 0 && (
                            <span className="px-1.5 py-0.5 bg-background rounded-full text-xs font-bold">{t.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* SUGGESTIONS */}
            {tab === 'suggestions' && (
                <div className="space-y-4">
                    {/* Summary cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-surface rounded-2xl border border-border p-5">
                            <div className="text-xs text-slate-500 mb-1">Potansiyel Kâr Artışı</div>
                            <div className="text-2xl font-black text-emerald-500">
                                {sugLoading ? '—' : `+₺${(pendingSuggestions.reduce((s, p) => s + Math.abs(p.suggestedPrice - p.currentPrice) * 30, 0)).toLocaleString('tr-TR')}/ay`}
                            </div>
                        </div>
                        <div className="bg-surface rounded-2xl border border-border p-5">
                            <div className="text-xs text-slate-500 mb-1">Bekleyen Öneriler</div>
                            <div className="text-2xl font-black text-foreground">{sugLoading ? '—' : pendingSuggestions.length}</div>
                        </div>
                        <div className="bg-surface rounded-2xl border border-border p-5">
                            <div className="text-xs text-slate-500 mb-1">Ort. Marj İyileşme</div>
                            <div className="text-2xl font-black text-blue-500">
                                {pendingSuggestions.length > 0
                                    ? `+${(pendingSuggestions.reduce((s, p) => s + p.margin, 0) / pendingSuggestions.length).toFixed(1)}%`
                                    : '—'}
                            </div>
                        </div>
                    </div>

                    {sugLoading ? (
                        <div className="py-16 flex items-center justify-center gap-3 text-slate-500 bg-surface rounded-2xl border border-border">
                            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Öneriler yükleniyor...</span>
                        </div>
                    ) : pendingSuggestions.length === 0 ? (
                        <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
                            <Target size={40} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-bold text-foreground">Tüm öneriler değerlendirildi ✓</p>
                            <p className="text-sm text-slate-500 mt-1">Yeni öneriler için AI tarama yapılıyor</p>
                        </div>
                    ) : (
                        pendingSuggestions.map((s, i) => (
                            <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                className="bg-surface rounded-2xl border border-border p-5 hover:border-emerald-500/30 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-sm font-bold text-foreground">{s.product}</h3>
                                            <span className="px-2 py-0.5 bg-background text-slate-500 text-xs rounded border border-border">{s.platform}</span>
                                        </div>
                                        <div className="flex items-center gap-8 mb-3">
                                            {[
                                                { label: 'Mevcut', value: `₺${s.currentPrice}`, cls: 'text-foreground' },
                                                { label: '', value: <ArrowRight size={16} className="text-slate-500" />, cls: '' },
                                                { label: 'Önerilen', value: `₺${s.suggestedPrice}`, cls: s.suggestedPrice < s.currentPrice ? 'text-red-500' : 'text-emerald-500' },
                                                { label: 'Rakip', value: `₺${s.competitorPrice}`, cls: 'text-slate-400' },
                                                { label: 'Marj', value: `%${s.margin}`, cls: 'text-blue-500' },
                                            ].map((f, fi) => (
                                                <div key={fi}>
                                                    {f.label && <div className="text-[10px] text-slate-500 mb-1">{f.label}</div>}
                                                    <div className={`text-base font-black ${f.cls}`}>{f.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="flex items-center gap-1 text-amber-500"><Bell size={10} /> {s.reason}</span>
                                            <span className="flex items-center gap-1 text-emerald-500"><TrendingUp size={10} /> {s.impact}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {actionLoading === s.id ? (
                                            <div className="p-2"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                                        ) : (
                                            <>
                                                <button onClick={() => approve(s.id)} className="p-2.5 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-500 rounded-xl transition-all"><Check className="w-4 h-4" /></button>
                                                <button onClick={() => reject(s.id)} className="p-2.5 bg-red-500/15 hover:bg-red-500/30 text-red-500 rounded-xl transition-all"><X className="w-4 h-4" /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* RULES */}
            {tab === 'rules' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={() => setShowNewRule(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all">
                            <Plus size={16} /> Yeni Kural
                        </button>
                    </div>

                    {rulesLoading ? (
                        <div className="py-16 flex items-center justify-center gap-3 text-slate-500 bg-surface rounded-2xl border border-border">
                            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Kurallar yükleniyor...</span>
                        </div>
                    ) : rules.length === 0 ? (
                        <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
                            <Shield size={40} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-bold text-foreground">Henüz fiyat kuralı yok</p>
                            <p className="text-sm text-slate-500 mt-1">İlk kuralı oluşturun</p>
                        </div>
                    ) : (
                        rules.map((rule, i) => {
                            const Icon = RULE_TYPE_ICONS[rule.type] || Shield;
                            return (
                                <motion.div key={rule.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                    className="bg-surface rounded-2xl border border-border p-5 hover:border-slate-400/30 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${rule.status === 'active' ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                                                <Icon className={`w-5 h-5 ${rule.status === 'active' ? 'text-emerald-500' : 'text-slate-500'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-bold text-foreground">{rule.name}</h3>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${rule.status === 'active' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'}`}>
                                                        {rule.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-background text-slate-500 text-[10px] rounded border border-border">{rule.platform}</span>
                                                    <span className="px-2 py-0.5 bg-background text-slate-500 text-[10px] rounded border border-border">{RULE_TYPE_LABELS[rule.type]}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{rule.description}</p>
                                                <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-600">
                                                    <span>{rule.affectedProducts} ürün</span>
                                                    <span className={rule.avgPriceChange > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                                        {rule.avgPriceChange > 0 ? '+' : ''}{rule.avgPriceChange}% ort.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleRule(rule)}
                                                className={`p-2 rounded-xl transition-all ${rule.status === 'active' ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}>
                                                {rule.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                            </button>
                                            <button className="p-2 hover:bg-background rounded-xl text-slate-400 hover:text-foreground transition-all">
                                                <Settings size={16} />
                                            </button>
                                            <button onClick={() => deleteRule(rule.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}

                    {/* New Rule Modal */}
                    <AnimatePresence>
                        {showNewRule && (
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowNewRule(false)}>
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={e => e.stopPropagation()}
                                    className="bg-surface rounded-2xl w-full max-w-md border border-border shadow-2xl">
                                    <div className="p-5 border-b border-border flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-foreground">Yeni Fiyat Kuralı</h2>
                                        <button onClick={() => setShowNewRule(false)} className="p-2 hover:bg-background rounded-xl"><X size={18} className="text-slate-400" /></button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Kural Adı</label>
                                            <input className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-emerald-500 focus:outline-none" placeholder="Örn: Minimum Marj Koruması" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Kural Türü</label>
                                            <select className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-emerald-500 focus:outline-none">
                                                {Object.entries(RULE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Platform</label>
                                            <select className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-emerald-500 focus:outline-none">
                                                {['Tümü', 'Trendyol', 'Hepsiburada', 'Amazon', 'N11'].map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Eşik Değeri (%)</label>
                                            <input type="number" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-emerald-500 focus:outline-none" placeholder="15" min="0" max="100" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Açıklama</label>
                                            <textarea className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-emerald-500 focus:outline-none resize-none" rows={2} placeholder="Bu kural ne yapar?" />
                                        </div>
                                        <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm">Kaydet ve Etkinleştir</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* HISTORY */}
            {tab === 'history' && (
                <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-foreground">Fiyat Değişiklikleri</h3>
                        <button onClick={loadHistory} className="text-xs font-bold text-slate-400 hover:text-foreground flex items-center gap-1 transition-all">
                            <RefreshCw size={12} className={histLoading ? 'animate-spin' : ''} /> Yenile
                        </button>
                    </div>
                    {histLoading ? (
                        <div className="py-12 flex items-center justify-center gap-3 text-slate-500">
                            <Loader2 size={18} className="animate-spin" /><span className="text-sm">Yükleniyor...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <BarChart3 size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">Henüz fiyat değişikliği yok</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    {['Tarih', 'Ürün', 'Platform', 'Eski Fiyat', 'Yeni Fiyat', 'Kaynak'].map(h => (
                                        <th key={h} className="p-4 text-xs font-bold text-slate-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((row, i) => (
                                    <tr key={row.id || i} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                                        <td className="p-4 text-slate-500 text-xs">{row.date}</td>
                                        <td className="p-4 text-foreground font-medium">{row.product}</td>
                                        <td className="p-4 text-slate-500 text-xs">{row.platform}</td>
                                        <td className="p-4 text-slate-400">₺{row.oldPrice}</td>
                                        <td className={`p-4 font-bold ${row.newPrice > row.oldPrice ? 'text-emerald-500' : 'text-red-500'}`}>₺{row.newPrice}</td>
                                        <td className="p-4 text-xs text-slate-500">{row.source}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
