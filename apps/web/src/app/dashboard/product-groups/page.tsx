"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Boxes, Plus, Search, X, ChevronDown, ChevronUp,
    Barcode, ArrowRight, AlertTriangle, CheckCircle, Edit3, Trash2, Loader2, RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface SubBarcode {
    id: string; barcode: string; channel: string; note: string;
}
interface ProductGroup {
    id: string; name: string; primaryBarcode: string; brand: string;
    category: string; totalStock: number; subBarcodes: SubBarcode[];
    channels: string[];
}

const channelColors: Record<string, string> = {
    TRENDYOL: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    HEPSIBURADA: 'bg-red-500/10 text-red-400 border-red-500/20',
    AMAZON: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    N11: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    CICEKSEPETI: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    trendyol: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    hepsiburada: 'bg-red-500/10 text-red-400 border-red-500/20',
    amazon: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    n11: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};
const channelName = (ch: string) =>
    ({ TRENDYOL: 'Trendyol', HEPSIBURADA: 'Hepsiburada', AMAZON: 'Amazon', N11: 'N11', CICEKSEPETI: 'Çiçeksepeti' }[ch.toUpperCase()] || ch);

export default function ProductGroupsPage() {
    const [groups, setGroups] = useState<ProductGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newBarcode, setNewBarcode] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => { loadGroups(); }, []);

    const loadGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiClient.request<ProductGroup[]>('/product-groups');
            setGroups(result || []);
        } catch (err) {
            setError('Ürün grupları yüklenemedi.');
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const createGroup = async () => {
        if (!newGroupName || !newBarcode) return;
        setCreating(true);
        try {
            await apiClient.request('/product-groups', {
                method: 'POST',
                body: JSON.stringify({ name: newGroupName, primaryBarcode: newBarcode }),
            });
            setNewGroupName('');
            setNewBarcode('');
            setShowAddModal(false);
            await loadGroups();
        } catch { /* ignore */ }
        setCreating(false);
    };

    const deleteGroup = async (id: string) => {
        try {
            await apiClient.request(`/product-groups/${id}`, { method: 'DELETE' });
            setGroups(prev => prev.filter(g => g.id !== id));
        } catch { /* ignore */ }
    };

    const filtered = groups.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.primaryBarcode || '').includes(search) ||
        (g.brand || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalBarcodes = groups.reduce((sum, g) => sum + (g.subBarcodes?.length || 0), 0);
    const totalStock = groups.reduce((sum, g) => sum + (g.totalStock || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                            <Boxes className="w-6 h-6 text-violet-500" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground">Grup Ürün Yönetimi</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-14">Aynı ürünün farklı barkodlarını gruplandırın, ortak stok düşümü sağlayın</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadGroups}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20">
                        <Plus size={16} /> Yeni Grup Oluştur
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                    <div className="text-sm font-bold text-violet-300">Nasıl Çalışır?</div>
                    <div className="text-xs text-slate-500 mt-0.5">Aynı fiziksel ürün farklı platformlarda farklı barkodlarla listeleniyor olabilir. Bu grupları oluşturarak, herhangi bir kanaldan sipariş geldiğinde stok otomatik olarak tek bir havuzdan düşülür. Böylece aşım satış hataları önlenir.</div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Ürün Grubu', value: groups.length, color: 'text-violet-500' },
                    { label: 'Toplam Barkod', value: totalBarcodes, color: 'text-blue-500' },
                    { label: 'Toplam Stok', value: totalStock, color: 'text-green-500' },
                ].map(s => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border p-5">
                        <div className="text-2xl font-black text-foreground">{s.value}</div>
                        <div className={`text-xs font-bold ${s.color} mt-0.5`}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün adı, barkod veya marka ara..."
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-violet-500 outline-none transition-colors" />
            </div>

            {/* Loading & Error & Empty */}
            {loading && (
                <div className="bg-surface border border-border rounded-2xl py-20 flex items-center justify-center gap-3 text-slate-500">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-medium">Ürün grupları yükleniyor...</span>
                </div>
            )}

            {!loading && error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 flex items-center justify-between">
                    <span className="text-sm text-red-400">{error}</span>
                    <button onClick={loadGroups} className="text-xs font-bold text-red-400 hover:text-red-300">Tekrar Dene</button>
                </div>
            )}

            {/* Groups List */}
            {!loading && (
                <div className="space-y-4">
                    {filtered.map((group, idx) => (
                        <motion.div key={group.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                            className="bg-surface border border-border rounded-2xl overflow-hidden">
                            {/* Group Header */}
                            <button onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-violet-500/10">
                                        <Boxes className="w-5 h-5 text-violet-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-foreground">{group.name}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-slate-500 font-mono">{group.primaryBarcode}</span>
                                            {group.brand && <span className="text-[10px] text-slate-600">{group.brand} · {group.category}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        {(group.channels || []).slice(0, 4).map(ch => (
                                            <span key={ch} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${channelColors[ch] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                {channelName(ch)}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-right mr-2">
                                        <div className="text-lg font-black text-foreground">{group.totalStock || 0}</div>
                                        <div className="text-[10px] text-slate-500">Stok</div>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); deleteGroup(group.id); }}
                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                    {expandedId === group.id ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                                </div>
                            </button>

                            {/* Expanded: Barcodes */}
                            <AnimatePresence>
                                {expandedId === group.id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                        className="overflow-hidden">
                                        <div className="border-t border-border p-5 space-y-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Kanal Barkodları ({(group.subBarcodes || []).length})</h4>
                                                <button className="flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                                                    <Plus size={12} /> Barkod Ekle
                                                </button>
                                            </div>
                                            {(group.subBarcodes || []).map(sub => (
                                                <div key={sub.id} className="flex items-center gap-4 p-3 bg-background rounded-xl border border-border">
                                                    <Barcode size={14} className="text-slate-500 flex-shrink-0" />
                                                    <div className="font-mono text-sm text-foreground font-bold">{sub.barcode}</div>
                                                    <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${channelColors[sub.channel] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                        {channelName(sub.channel)}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex-1">{sub.note}</span>
                                                    <div className="flex items-center gap-1">
                                                        <button className="p-1.5 rounded-lg hover:bg-violet-500/10 text-slate-500 hover:text-violet-400 transition-colors">
                                                            <Edit3 size={12} />
                                                        </button>
                                                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(group.subBarcodes || []).length === 0 && (
                                                <p className="text-sm text-slate-500 text-center py-4">Henüz alt barkod eklenmemiş.</p>
                                            )}

                                            {/* Shared Stock Info */}
                                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 mt-2">
                                                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                                <div className="text-xs text-green-300">
                                                    <span className="font-bold">Ortak stok aktif:</span> Herhangi bir kanaldan sipariş geldiğinde, stok ortak havuzdan ({group.totalStock || 0} adet) otomatik düşülür.
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}

                    {/* Empty state */}
                    {filtered.length === 0 && !loading && !error && (
                        <div className="bg-surface border border-dashed border-border rounded-2xl py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <Boxes size={40} className="text-slate-300" />
                            <div className="text-center">
                                <p className="font-bold text-foreground">Henüz ürün grubu yok</p>
                                <p className="text-sm mt-1">İlk grubunuzu oluşturarak aynı ürünün farklı barkodlarını birleştirin.</p>
                            </div>
                        </div>
                    )}

                    {/* Add Group Card */}
                    <button onClick={() => setShowAddModal(true)}
                        className="w-full bg-surface border border-dashed border-border rounded-2xl p-6 flex items-center justify-center gap-3 text-slate-500 hover:text-foreground hover:border-violet-500/40 hover:bg-violet-500/5 transition-all">
                        <Plus size={18} /> <span className="text-sm font-bold">Yeni Ürün Grubu Oluştur</span>
                    </button>
                </div>
            )}

            {/* Add Group Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-foreground">Yeni Ürün Grubu</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-background text-slate-400"><X size={18} /></button>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ürün Adı</label>
                                <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Örn: Samsung Galaxy S24"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-violet-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ana Barkod</label>
                                <input value={newBarcode} onChange={e => setNewBarcode(e.target.value)} placeholder="8690000000000"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-violet-500 outline-none transition-colors font-mono" />
                            </div>
                            <button onClick={createGroup} disabled={!newGroupName || !newBarcode || creating}
                                className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                {creating ? <><Loader2 size={16} className="animate-spin" /> Oluşturuluyor...</> : 'Grup Oluştur'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
