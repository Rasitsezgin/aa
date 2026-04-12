"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Printer, Search, CheckCircle, Package, Truck,
    MapPin, Phone, FileText, Loader2, X, RefreshCw, ShoppingBag
} from 'lucide-react';
import { useOrders } from '@/lib/hooks';

const platformColors: Record<string, string> = {
    TRENDYOL: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    HEPSIBURADA: 'bg-red-500/10 text-red-400 border-red-500/20',
    AMAZON: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    N11: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    TRENDYOL_INTERNATIONAL: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

interface Order {
    id: string;
    marketplaceOrderId?: string;
    customerName: string;
    customerPhone?: string;
    shippingAddress?: string;
    platform: string;
    status: string;
    orderDate?: string;
    createdAt: string;
}

export default function BulkLabelsPage() {
    const { getOrders, loading } = useOrders();
    const [orders, setOrders] = useState<Order[]>([]);
    const [printedIds, setPrintedIds] = useState<string[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [printing, setPrinting] = useState(false);
    const [printDone, setPrintDone] = useState(false);
    const [printError, setPrintError] = useState<string | null>(null);

    const loadOrders = async () => {
        const filters: Record<string, string> = { status: 'CONFIRMED', limit: '100' };
        if (filterPlatform !== 'all') filters.platform = filterPlatform;
        const response = await getOrders(filters) as { orders: Order[] } | null;
        if (response) {
            setOrders(response.orders || []);
        }
    };

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterPlatform]);

    // Map real order statuses to label statuses
    const getLabelStatus = (order: Order): 'ready' | 'printed' | 'shipped' => {
        if (printedIds.includes(order.id)) return 'printed';
        if (order.status === 'SHIPPED' || order.status === 'DELIVERED') return 'shipped';
        return 'ready';
    };

    const filtered = orders.filter(o => {
        const labelStatus = getLabelStatus(o);
        const matchSearch = !search ||
            (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.marketplaceOrderId || '').toLowerCase().includes(search.toLowerCase());
        const matchPlatform = filterPlatform === 'all' || o.platform === filterPlatform;
        const matchStatus = filterStatus === 'all' || labelStatus === filterStatus;
        return matchSearch && matchPlatform && matchStatus;
    });

    const toggle = (id: string) =>
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) =>
        setSelected(e.target.checked ? filtered.map(o => o.id) : []);

    const handlePrint = async () => {
        setPrintError(null);
        setPrinting(true);
        try {
            window.print();
            setPrintDone(true);
            setPrintedIds(prev => [...new Set([...prev, ...selected])]);
            setSelected([]);
        } catch {
            setPrintDone(false);
            setPrintError('Yazdırma işlemi başlatılamadı. Tarayıcı izinlerini kontrol edin.');
        } finally {
            setPrinting(false);
        }
    };

    const readyCount = orders.filter(o => getLabelStatus(o) === 'ready').length;
    const printedCount = printedIds.length;
    const shippedCount = orders.filter(o => getLabelStatus(o) === 'shipped').length;

    const platforms = [...new Set(orders.map(o => o.platform).filter(Boolean))];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <Printer className="w-6 h-6 text-rose-500" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground">Toplu Kargo Etiketi</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-14">Siparişleri seçin, tek tıkla tüm kargo etiketlerini yazdırın</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadOrders}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Yenile
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={selected.length === 0 || printing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {printing ? <><Loader2 size={16} className="animate-spin" /> Oluşturuluyor...</> : <><Printer size={16} /> {selected.length} Etiket Yazdır</>}
                    </button>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {printDone && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4 flex items-center gap-3">
                        <CheckCircle size={18} className="text-green-400" />
                        <span className="text-sm font-bold text-green-300">Yazdırma penceresi açıldı. Seçili siparişler basıldı olarak işaretlendi.</span>
                    </motion.div>
                )}
            </AnimatePresence>
            {printError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 text-sm font-medium text-red-300">
                    {printError}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Hazır Sipariş', value: readyCount, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Package },
                    { label: 'Etiket Basıldı', value: printedCount, color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: Printer },
                    { label: 'Kargoya Verildi', value: shippedCount, color: 'text-green-500', bg: 'bg-green-500/10', icon: Truck },
                ].map(s => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border p-5">
                        <div className={`p-2.5 rounded-xl ${s.bg} w-fit mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                        <div className="text-2xl font-black text-foreground">{s.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Müşteri adı veya sipariş no..."
                        className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-rose-500 outline-none transition-colors" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'ready', 'printed', 'shipped'] as const).map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${filterStatus === s ? 'bg-rose-600 text-white border-transparent' : 'bg-surface border-border text-slate-400 hover:text-foreground'}`}>
                            {s === 'all' ? 'Tümü' : s === 'ready' ? 'Hazır' : s === 'printed' ? 'Basıldı' : 'Kargoda'}
                        </button>
                    ))}
                    {platforms.length > 0 && (
                        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
                            className="px-3 py-2.5 rounded-xl text-xs font-bold border bg-surface border-border text-slate-400 focus:outline-none">
                            <option value="all">Tüm Platformlar</option>
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-3 px-5 py-4 bg-background/50 border-b border-border">
                    <div className="col-span-1">
                        <input type="checkbox"
                            checked={selected.length === filtered.length && filtered.length > 0}
                            onChange={toggleAll} className="rounded" />
                    </div>
                    <div className="col-span-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Sipariş / Müşteri</div>
                    <div className="col-span-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Teslimat Adresi</div>
                    <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">Platform</div>
                    <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">Durum</div>
                </div>

                {loading && orders.length === 0 && (
                    <div className="py-20 flex items-center justify-center gap-3 text-slate-500">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm font-medium">Siparişler yükleniyor...</span>
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
                        <ShoppingBag size={40} className="text-slate-300" />
                        <div className="text-center">
                            <p className="font-bold text-foreground">Etiket bekleyen sipariş bulunamadı</p>
                            <p className="text-sm mt-1">Kargo için hazır siparişler burada görüntülenecek.</p>
                        </div>
                    </div>
                )}

                {filtered.map((order, idx) => {
                    const labelStatus = getLabelStatus(order);
                    return (
                        <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                            className={`grid grid-cols-12 gap-3 items-center px-5 py-4 border-b border-border last:border-0 hover:bg-white/2 transition-colors ${selected.includes(order.id) ? 'bg-rose-500/5' : ''}`}>
                            <div className="col-span-1">
                                <input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggle(order.id)} className="rounded" />
                            </div>
                            <div className="col-span-4">
                                <div className="text-xs font-mono text-slate-500">#{order.marketplaceOrderId || order.id.slice(0, 8).toUpperCase()}</div>
                                <div className="font-bold text-sm text-foreground mt-0.5">{order.customerName}</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                    {new Date(order.orderDate || order.createdAt).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                            <div className="col-span-4">
                                <div className="text-xs text-foreground">{order.shippingAddress || '—'}</div>
                                {order.customerPhone && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                        <Phone size={9} /> {order.customerPhone}
                                    </div>
                                )}
                            </div>
                            <div className="col-span-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${platformColors[order.platform] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                    {order.platform}
                                </span>
                            </div>
                            <div className="col-span-2">
                                {labelStatus === 'ready' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        <Package size={9} /> Hazır
                                    </span>
                                )}
                                {labelStatus === 'printed' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                        <Printer size={9} /> Basıldı
                                    </span>
                                )}
                                {labelStatus === 'shipped' && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                        <Truck size={9} /> Kargoda
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Floating Action Bar */}
            {selected.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface border border-border rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4">
                    <span className="text-sm font-bold text-foreground">{selected.length} sipariş seçili</span>
                    <div className="h-5 w-px bg-border" />
                    <button onClick={handlePrint} disabled={printing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-500 transition-all disabled:opacity-60">
                        {printing ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
                        Etiketleri Yazdır
                    </button>
                    <button onClick={() => setSelected([])} className="p-2 rounded-xl hover:bg-background text-slate-400 transition-all">
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
