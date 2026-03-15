"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RotateCcw, Clock, CheckCircle2, XCircle, Package,
    Truck, Search, AlertTriangle, Eye, DollarSign,
    BarChart3, X, ShieldCheck, Inbox, RefreshCw,
    Loader2, ChevronDown, Printer, Mail, LucideIcon
} from 'lucide-react';
import { ExportButton } from '@/lib/export-utils';
import { apiClient } from '@/lib/api-client';
import { useReturns, useReturnStats } from '@/lib/hooks';

const RETURN_REASONS: Record<string, string> = {
    DEFECTIVE: 'Arızalı / Kusurlu',
    WRONG_ITEM: 'Yanlış Ürün Gönderildi',
    NOT_AS_DESCRIBED: 'Açıklamaya Uygun Değil',
    CHANGED_MIND: 'Fikir Değişikliği',
    DAMAGED_IN_SHIPPING: 'Kargoda Hasar',
    LATE_DELIVERY: 'Geç Teslimat',
    DUPLICATE_ORDER: 'Mükerrer Sipariş',
    OTHER: 'Diğer',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: LucideIcon }> = {
    PENDING: { label: 'Bekliyor', color: 'yellow', icon: Clock },
    APPROVED: { label: 'Onaylandı', color: 'blue', icon: CheckCircle2 },
    REJECTED: { label: 'Reddedildi', color: 'red', icon: XCircle },
    SHIPPED: { label: 'Kargo\'da', color: 'purple', icon: Truck },
    RECEIVED: { label: 'Teslim Alındı', color: 'indigo', icon: Package },
    INSPECTING: { label: 'İnceleniyor', color: 'orange', icon: Eye },
    REFUNDED: { label: 'İade Edildi', color: 'emerald', icon: DollarSign },
    COMPLETED: { label: 'Tamamlandı', color: 'green', icon: ShieldCheck },
    CANCELLED: { label: 'İptal', color: 'slate', icon: X },
};

interface ReturnItem { sku: string; title: string; quantity: number; unitPrice: number; }
interface ReturnRecord {
    id: string; orderId: string; platform: string;
    customerName: string; customerEmail: string;
    status: string; reason: string; reasonDetail?: string;
    refundAmount: number; requestDate: string; resolvedDate?: string;
    items: ReturnItem[];
}

export default function ReturnsPage() {
    const { data: statsData, loading: statsLoading } = useReturnStats();
    const { data: returnsData, loading: returnsLoading, error, refetch: loadReturns } = useReturns();
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReturn, setSelectedReturn] = useState<ReturnRecord | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const returns = useMemo(() => (returnsData as any)?.data || [], [returnsData]);
    const loading = statsLoading || returnsLoading;

    const handleAction = async (id: string, action: 'approve' | 'reject' | 'refund') => {
        setActionLoading(action);
        try {
            await apiClient.request(`/returns/${id}/${action}`, { method: 'POST' });
            await loadReturns();
            setSelectedReturn(null);
        } catch { /* ignore */ }
        setActionLoading(null);
    };

    const filtered = useMemo(() => {
        let data = returns as ReturnRecord[];
        if (statusFilter !== 'all') data = data.filter(r => r.status === statusFilter);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(r =>
                r.id.toLowerCase().includes(q) ||
                r.orderId.toLowerCase().includes(q) ||
                r.customerName.toLowerCase().includes(q) ||
                r.items.some((i: any) => i.title.toLowerCase().includes(q))
            );
        }
        return data;
    }, [returns, statusFilter, searchQuery]);

    const stats = useMemo(() => {
        const s = statsData as any;
        return {
            total: s?.total || 0,
            pending: s?.pending || 0,
            inProcess: s?.approved || 0, // Backend returns 'approved' for inProcess counts
            resolved: s?.refunded || 0,
            totalRefund: s?.totalRefundAmount || 0,
        };
    }, [statsData]);

    const reasonStats = useMemo(() => {
        const counts: Record<string, number> = {};
        (returns as ReturnRecord[]).forEach(r => { counts[r.reason] = (counts[r.reason] || 0) + 1; });
        return Object.entries(counts)
            .map(([reason, count]) => ({ reason, label: RETURN_REASONS[reason] || reason, count, pct: (returns as ReturnRecord[]).length > 0 ? count / (returns as ReturnRecord[]).length * 100 : 0 }))
            .sort((a, b) => b.count - a.count);
    }, [returns]);

    const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <RotateCcw className="w-8 h-8 text-orange-500" /> İade Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">İade taleplerini takip edin ve yönetin</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadReturns}
                        className="p-2.5 bg-surface border border-border rounded-xl text-slate-400 hover:text-foreground transition-all">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <ExportButton
                        data={filtered.map(r => ({
                            'İade No': r.id, 'Sipariş No': r.orderId, 'Platform': r.platform,
                            'Müşteri': r.customerName, 'Durum': STATUS_CONFIG[r.status]?.label,
                            'Sebep': RETURN_REASONS[r.reason], 'İade Tutarı': `₺${fmt(r.refundAmount)}`, 'Tarih': r.requestDate,
                        }))}
                        filename="iade-listesi" title="İade Raporu"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Toplam İade', value: stats.total, icon: Inbox, color: 'blue' },
                    { label: 'Bekleyen', value: stats.pending, icon: Clock, color: 'yellow' },
                    { label: 'İşlemde', value: stats.inProcess, icon: RefreshCw, color: 'purple' },
                    { label: 'Çözümlenen', value: stats.resolved, icon: CheckCircle2, color: 'green' },
                    { label: 'Toplam İade Tutarı', value: `₺${fmt(stats.totalRefund)}`, icon: DollarSign, color: 'red' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-surface rounded-2xl p-5 border border-border">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 bg-${s.color}-500/20 rounded-xl`}>
                                <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">{s.label}</div>
                                <div className="text-xl font-black text-foreground">{s.value}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="bg-surface border border-border rounded-2xl py-16 flex items-center justify-center gap-3 text-slate-500">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm font-medium">İade talepleri yükleniyor...</span>
                </div>
            )}
            {!loading && error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 flex items-center justify-between">
                    <span className="text-sm text-red-400">{error.message || 'İade verileri yüklenemedi.'}</span>
                    <button onClick={() => loadReturns()} className="text-xs font-bold text-red-400 hover:text-red-300">Tekrar Dene</button>
                </div>
            )}

            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-4">
                        {/* Reason breakdown */}
                        <div className="bg-surface rounded-2xl p-5 border border-border">
                            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-orange-400" /> İade Sebepleri
                            </h3>
                            {reasonStats.length === 0 ? (
                                <p className="text-xs text-slate-500">Henüz iade yok</p>
                            ) : (
                                <div className="space-y-3">
                                    {reasonStats.map(rs => (
                                        <div key={rs.reason}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-foreground">{rs.label}</span>
                                                <span className="text-[10px] text-slate-500">{rs.count}</span>
                                            </div>
                                            <div className="w-full bg-background rounded-full h-1.5">
                                                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${rs.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status filter */}
                        <div className="bg-surface rounded-2xl p-5 border border-border">
                            <h3 className="text-sm font-bold text-foreground mb-3">Duruma Göre Filtrele</h3>
                            <div className="space-y-1">
                                <button onClick={() => setStatusFilter('all')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === 'all' ? 'bg-orange-500/10 text-orange-500 font-bold' : 'text-slate-500 hover:text-foreground hover:bg-background'}`}>
                                    Tümü ({returns.length})
                                </button>
                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                                    const count = (returns as ReturnRecord[]).filter(r => r.status === key).length;
                                    if (count === 0) return null;
                                    return (
                                        <button key={key} onClick={() => setStatusFilter(key)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${statusFilter === key ? 'bg-orange-500/10 text-orange-500 font-bold' : 'text-slate-500 hover:text-foreground hover:bg-background'}`}>
                                            <span className="flex items-center gap-2"><cfg.icon className="w-3.5 h-3.5" /> {cfg.label}</span>
                                            <span className="text-xs">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Returns List */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="İade no, sipariş no, müşteri veya ürün ara..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-surface rounded-2xl text-foreground placeholder-slate-500 border border-border focus:border-orange-500 focus:outline-none" />
                        </div>

                        <div className="space-y-3">
                            {(filtered as ReturnRecord[]).map((ret: ReturnRecord, i: number) => {
                                const cfg = STATUS_CONFIG[ret.status] || STATUS_CONFIG['PENDING'];
                                return (
                                    <motion.div key={ret.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        onClick={() => setSelectedReturn(ret)}
                                        className="bg-surface rounded-2xl p-5 border border-border hover:border-orange-500/30 transition-all cursor-pointer">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-foreground font-bold">{ret.id}</span>
                                                    <span className="text-xs text-slate-500">•</span>
                                                    <span className="text-sm text-slate-500">{ret.orderId}</span>
                                                    <span className="px-2 py-0.5 bg-background rounded text-xs text-slate-500 border border-border">{ret.platform}</span>
                                                </div>
                                                <div className="text-sm text-slate-400 mt-1">{ret.customerName}</div>
                                            </div>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-${cfg.color}-500/10 text-${cfg.color}-500 border border-${cfg.color}-500/20`}>
                                                <cfg.icon className="w-3 h-3" /> {cfg.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm mb-3">
                                            {ret.items.slice(0, 2).map((item: ReturnItem) => (
                                                <div key={item.sku} className="flex items-center gap-1.5">
                                                    <Package className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-foreground text-sm truncate max-w-48">{item.title}</span>
                                                    <span className="text-slate-500">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {RETURN_REASONS[ret.reason] || ret.reason}</span>
                                                <span>{ret.requestDate}</span>
                                            </div>
                                            <span className="text-sm font-bold text-foreground">₺{fmt(ret.refundAmount)}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {filtered.length === 0 && (
                                <div className="text-center py-16 text-slate-500 bg-surface rounded-2xl border border-dashed border-border">
                                    <RotateCcw className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                                    <p className="font-bold text-foreground">İade talebi bulunamadı</p>
                                    <p className="text-sm mt-1">Filtre değiştirmeyi deneyin</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedReturn && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReturn(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-border shadow-2xl">
                            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">{selectedReturn.id}</h2>
                                    <p className="text-sm text-slate-500">Sipariş: {selectedReturn.orderId} · {selectedReturn.platform}</p>
                                </div>
                                <button onClick={() => setSelectedReturn(null)} className="p-2 hover:bg-background rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Status */}
                                {(() => {
                                    const cfg = STATUS_CONFIG[selectedReturn.status];
                                    return (
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-slate-500">Durum:</span>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-${cfg.color}-500/10 text-${cfg.color}-500`}>
                                                <cfg.icon className="w-3.5 h-3.5" /> {cfg.label}
                                            </span>
                                        </div>
                                    );
                                })()}

                                {/* Customer */}
                                <div className="p-4 bg-background rounded-xl border border-border">
                                    <h4 className="text-sm font-bold text-foreground mb-2">Müşteri</h4>
                                    <p className="text-sm text-foreground">{selectedReturn.customerName}</p>
                                    <p className="text-xs text-slate-500">{selectedReturn.customerEmail}</p>
                                </div>

                                {/* Items */}
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-2">İade Ürünleri</h4>
                                    <div className="space-y-2">
                                        {selectedReturn.items.map(item => (
                                            <div key={item.sku} className="p-3 bg-background rounded-xl border border-border flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{item.sku} · x{item.quantity}</p>
                                                </div>
                                                <span className="text-sm font-bold text-foreground">₺{fmt(item.unitPrice)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20">
                                    <h4 className="text-sm font-bold text-orange-500 mb-1">İade Sebebi</h4>
                                    <p className="text-sm text-foreground">{RETURN_REASONS[selectedReturn.reason] || selectedReturn.reason}</p>
                                    {selectedReturn.reasonDetail && <p className="text-xs text-slate-400 mt-1">"{selectedReturn.reasonDetail}"</p>}
                                </div>

                                {/* Refund amount */}
                                <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                                    <span className="text-sm text-slate-500">İade Tutarı</span>
                                    <span className="text-xl font-black text-foreground">₺{fmt(selectedReturn.refundAmount)}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2">
                                    {selectedReturn.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleAction(selectedReturn.id, 'reject')} disabled={!!actionLoading}
                                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                                {actionLoading === 'reject' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reddet
                                            </button>
                                            <button onClick={() => handleAction(selectedReturn.id, 'approve')} disabled={!!actionLoading}
                                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                                {actionLoading === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Onayla
                                            </button>
                                        </>
                                    )}
                                    {selectedReturn.status === 'RECEIVED' && (
                                        <button onClick={() => handleAction(selectedReturn.id, 'refund')} disabled={!!actionLoading}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                            {actionLoading === 'refund' ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />} İade İşle & Para İade Et
                                        </button>
                                    )}
                                    <button className="flex items-center gap-2 px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-slate-400 hover:text-foreground transition-all">
                                        <Printer size={14} /> Etiket
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-3 bg-background border border-border rounded-xl text-sm font-bold text-slate-400 hover:text-foreground transition-all">
                                        <Mail size={14} /> Bildir
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
