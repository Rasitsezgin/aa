"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gamepad2, Plus, X, Search, AlertTriangle,
    CheckCircle, Key, Upload, Mail, Send,
    Trash2, Loader2, RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface CodePool {
    id: string; productName: string; type: string;
    total: number; used: number; available: number;
    price: number; autoDeliver: boolean; category: string;
    lastSold?: string;
}

export default function DigitalProductsPage() {
    const [pools, setPools] = useState<CodePool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState<string | null>(null);
    const [newProductName, setNewProductName] = useState('');
    const [newProductType, setNewProductType] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [creating, setCreating] = useState(false);
    const [importCodes, setImportCodes] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => { loadPools(); }, []);

    const loadPools = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiClient.request<CodePool[]>('/digital-products');
            setPools(result || []);
        } catch {
            setError('Dijital ürünler yüklenemedi.');
            setPools([]);
        } finally {
            setLoading(false);
        }
    };

    const createPool = async () => {
        if (!newProductName || !newProductType || !newProductPrice) return;
        setCreating(true);
        try {
            await apiClient.request('/digital-products', {
                method: 'POST',
                body: JSON.stringify({
                    productName: newProductName,
                    type: newProductType,
                    price: parseFloat(newProductPrice),
                    autoDeliver: true,
                }),
            });
            setNewProductName(''); setNewProductType(''); setNewProductPrice('');
            setShowAddModal(false);
            await loadPools();
        } catch { /* ignore */ }
        setCreating(false);
    };

    const importCodesToPool = async (poolId: string) => {
        if (!importCodes.trim()) return;
        setImporting(true);
        try {
            const codes = importCodes.trim().split('\n').map((c: string) => c.trim()).filter(Boolean);
            await apiClient.request(`/digital-products/${poolId}/codes`, {
                method: 'POST',
                body: JSON.stringify({ codes }),
            });
            setImportCodes('');
            setShowImportModal(null);
            await loadPools();
        } catch { /* ignore */ }
        setImporting(false);
    };

    const deletePool = async (poolId: string) => {
        try {
            await apiClient.request(`/digital-products/${poolId}`, { method: 'DELETE' });
            setPools(prev => prev.filter(p => p.id !== poolId));
        } catch { /* ignore */ }
    };

    const filtered = pools.filter(p =>
        p.productName.toLowerCase().includes(search.toLowerCase()) ||
        p.type.toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalCodes = pools.reduce((s: number, p: CodePool) => s + (p.total || 0), 0);
    const usedCodes = pools.reduce((s: number, p: CodePool) => s + (p.used || 0), 0);
    const criticalCount = pools.filter((p: CodePool) => p.available <= 3).length;

    const getAvailabilityColor = (pool: CodePool) => {
        const ratio = pool.total > 0 ? pool.available / pool.total : 0;
        if (ratio <= 0.05 || pool.available <= 2) return { text: 'text-red-500', bar: 'bg-red-500' };
        if (ratio <= 0.2) return { text: 'text-yellow-500', bar: 'bg-yellow-500' };
        return { text: 'text-green-500', bar: 'bg-green-500' };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <Gamepad2 className="w-6 h-6 text-cyan-500" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground">Dijital Ürünler</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-14">Oyun kodları, lisanslar ve dijital ürünleri yönetin, otomatik teslimat yapın</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadPools}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20">
                        <Plus size={16} /> Ürün Ekle
                    </button>
                </div>
            </div>

            {/* Alert for critical pools */}
            {criticalCount > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/5 border border-red-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
                    <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
                    <span className="text-sm font-bold text-red-300">{criticalCount} ürünün kod havuzu kritik seviyede!</span>
                    <span className="text-xs text-slate-500 ml-1">Stok bitmeden yeni kodlar ekleyin.</span>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Ürün Tipi', value: pools.length.toString(), color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                    { label: 'Toplam Kod', value: totalCodes.toString(), color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Kullanılan', value: usedCodes.toString(), color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Kritik Stok', value: criticalCount.toString(), color: 'text-red-500', bg: 'bg-red-500/10' },
                ].map(s => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border p-5">
                        <div className={`w-fit mb-3 p-2.5 rounded-xl ${s.bg}`}><Key className={`w-5 h-5 ${s.color}`} /></div>
                        <div className="text-2xl font-black text-foreground">{s.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ürün, tür veya kategori ara..."
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-cyan-500 outline-none transition-colors" />
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="bg-surface border border-border rounded-2xl py-20 flex items-center justify-center gap-3 text-slate-500">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-medium">Dijital ürünler yükleniyor...</span>
                </div>
            )}

            {!loading && error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 flex items-center justify-between">
                    <span className="text-sm text-red-400">{error}</span>
                    <button onClick={loadPools} className="text-xs font-bold text-red-400 hover:text-red-300">Tekrar Dene</button>
                </div>
            )}

            {/* Product Pools */}
            {!loading && (
                <div className="space-y-4">
                    {filtered.map((pool: CodePool, idx: number) => {
                        const colors = getAvailabilityColor(pool);
                        const fillPct = pool.total > 0 ? (pool.used / pool.total) * 100 : 0;
                        return (
                            <motion.div key={pool.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                                className="bg-surface border border-border rounded-2xl p-5">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 rounded-xl bg-cyan-500/10 flex-shrink-0">
                                            <Key className="w-5 h-5 text-cyan-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <div className="font-bold text-foreground truncate">{pool.productName}</div>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{pool.type}</span>
                                                {pool.category && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{pool.category}</span>}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden max-w-40">
                                                    <div className={`h-full rounded-full transition-all ${colors.bar}`} style={{ width: `${fillPct}%` }} />
                                                </div>
                                                <span className={`text-xs font-bold ${colors.text}`}>{pool.available} / {pool.total} mevcut</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 lg:gap-8">
                                        <div className="text-center">
                                            <div className="text-lg font-black text-foreground">₺{pool.price.toLocaleString('tr-TR')}</div>
                                            <div className="text-[10px] text-slate-500">Fiyat</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-lg font-black ${pool.available <= 2 ? 'text-red-500' : 'text-foreground'}`}>{pool.available}</div>
                                            <div className="text-[10px] text-slate-500">Kalan Kod</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`flex items-center gap-1 text-xs font-bold ${pool.autoDeliver ? 'text-green-400' : 'text-slate-500'}`}>
                                                {pool.autoDeliver ? <><CheckCircle size={11} /> Otomatik</> : <>Manuel</>}
                                            </div>
                                            <div className="text-[10px] text-slate-500">Teslimat</div>
                                        </div>
                                        {pool.lastSold && (
                                            <div className="text-center">
                                                <div className="text-xs font-bold text-foreground">{pool.lastSold}</div>
                                                <div className="text-[10px] text-slate-500">Son Satış</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setShowImportModal(pool.id)}
                                            className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-500 transition-all">
                                            <Upload size={13} /> Kod Ekle
                                        </button>
                                        <button onClick={() => deletePool(pool.id)}
                                            className="p-2 bg-background border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {pool.autoDeliver && (
                                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-slate-500">
                                        <Mail size={12} className="text-cyan-400" />
                                        <span>Sipariş onaylandığında kod otomatik olarak müşteriye e-posta ile gönderilir.</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {filtered.length === 0 && !error && (
                        <div className="bg-surface border border-dashed border-border rounded-2xl py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <Key size={40} className="text-slate-300" />
                            <div className="text-center">
                                <p className="font-bold text-foreground">Henüz dijital ürün yok</p>
                                <p className="text-sm mt-1">İlk dijital ürününüzü ekleyerek başlayın.</p>
                            </div>
                        </div>
                    )}

                    <button onClick={() => setShowAddModal(true)}
                        className="w-full bg-surface border border-dashed border-border rounded-2xl p-6 flex items-center justify-center gap-3 text-slate-500 hover:text-foreground hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all">
                        <Plus size={18} /> <span className="text-sm font-bold">Yeni Dijital Ürün Ekle</span>
                    </button>
                </div>
            )}

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-foreground">Dijital Ürün Ekle</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-background text-slate-400"><X size={18} /></button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Ürün Adı</label>
                                    <input value={newProductName} onChange={e => setNewProductName(e.target.value)} placeholder="Örn: Steam Wallet 100 TL"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-cyan-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Platform / Tür</label>
                                    <input value={newProductType} onChange={e => setNewProductType(e.target.value)} placeholder="Örn: Steam, Xbox, Netflix"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-cyan-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Satış Fiyatı (₺)</label>
                                    <input value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} type="number" placeholder="0.00"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-cyan-500 outline-none transition-colors" />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
                                    <Send size={14} className="text-cyan-400" />
                                    <span className="text-sm text-foreground flex-1">Otomatik e-posta teslimatı aktif</span>
                                    <div className="w-10 h-5 bg-cyan-500 rounded-full relative cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                                    </div>
                                </div>
                                <button onClick={createPool} disabled={!newProductName || !newProductType || !newProductPrice || creating}
                                    className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                    {creating ? <><Loader2 size={16} className="animate-spin" /> Oluşturuluyor...</> : 'Ürün Oluştur'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Import Codes Modal */}
            <AnimatePresence>
                {showImportModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowImportModal(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-foreground">Kod Havuzuna Ekle</h3>
                                <button onClick={() => setShowImportModal(null)} className="p-1.5 rounded-lg hover:bg-background text-slate-400"><X size={18} /></button>
                            </div>
                            <div className="space-y-3">
                                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer">
                                    <Upload size={32} className="text-slate-500 mx-auto mb-3" />
                                    <div className="text-sm font-bold text-foreground">CSV dosyası sürükleyin</div>
                                    <div className="text-xs text-slate-500 mt-1">veya tıklayarak seçin</div>
                                </div>
                                <div className="text-center text-xs text-slate-500">veya</div>
                                <textarea rows={5} value={importCodes} onChange={e => setImportCodes(e.target.value)}
                                    placeholder="Kodları yapıştırın (her satıra bir kod):"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-cyan-500 outline-none transition-colors font-mono resize-none" />
                                <button onClick={() => importCodesToPool(showImportModal!)} disabled={!importCodes.trim() || importing}
                                    className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                    {importing ? <><Loader2 size={16} className="animate-spin" /> Ekleniyor...</> : 'Kodları Ekle'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
