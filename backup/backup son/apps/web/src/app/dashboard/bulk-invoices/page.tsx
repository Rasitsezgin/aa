"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Download, PlusCircle, Search, Filter, Printer,
    CheckCircle2, Clock, AlertTriangle, Eye, Trash2, Send,
    Building, Calendar, DollarSign, Hash
} from 'lucide-react';

const invoicesData: any[] = [];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    paid: { label: 'Ödendi', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
    pending: { label: 'Bekliyor', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
    overdue: { label: 'Gecikmiş', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
    draft: { label: 'Taslak', color: 'text-slate-400', bg: 'bg-slate-500/10', icon: FileText },
};

export default function BulkInvoicePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filtered = invoicesData.filter(inv =>
        (statusFilter === 'all' || inv.status === statusFilter) &&
        (inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalAmount = invoicesData.reduce((a, i) => a + i.total, 0);
    const paidAmount = invoicesData.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0);
    const pendingAmount = invoicesData.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((a, i) => a + i.total, 0);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(i => i.id));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <FileText className="w-7 h-7 text-indigo-400" /> Toplu Fatura Oluşturucu
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Faturaları oluşturun, yönetin ve toplu gönderin</p>
                </div>
                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm transition-colors">
                            <Printer className="w-4 h-4" /> {selectedIds.length} Fatura Yazdır
                        </button>
                    )}
                    <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm transition-colors">
                        <PlusCircle className="w-4 h-4" /> Yeni Fatura
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Tutar', value: `₺${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400' },
                    { label: 'Ödenen', value: `₺${paidAmount.toLocaleString()}`, icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Bekleyen', value: `₺${pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-amber-400' },
                    { label: 'Toplam Fatura', value: invoicesData.length.toString(), icon: Hash, color: 'text-indigo-400' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-5">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Fatura veya müşteri ara..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none" />
                </div>
                <div className="flex gap-1 bg-surface rounded-xl p-1 border border-border">
                    {[{ id: 'all', label: 'Tümü' }, ...Object.entries(statusConfig).map(([id, cfg]) => ({ id, label: cfg.label }))].map(f => (
                        <button key={f.id} onClick={() => setStatusFilter(f.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === f.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-foreground'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-slate-500 text-xs border-b border-border">
                            <th className="text-left px-4 py-3">
                                <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll}
                                    className="rounded border-border" />
                            </th>
                            <th className="text-left px-4 py-3 font-medium">Fatura No</th>
                            <th className="text-left px-4 py-3 font-medium">Müşteri</th>
                            <th className="text-left px-4 py-3 font-medium">Tarih</th>
                            <th className="text-left px-4 py-3 font-medium">Vade</th>
                            <th className="text-left px-4 py-3 font-medium">Kalem</th>
                            <th className="text-right px-4 py-3 font-medium">Tutar</th>
                            <th className="text-left px-4 py-3 font-medium">Durum</th>
                            <th className="text-right px-4 py-3 font-medium">İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-4 py-6 text-sm text-slate-500">Fatura verisi bulunamadı</td>
                            </tr>
                        )}
                        {filtered.map((inv, i) => {
                            const cfg = statusConfig[inv.status];
                            return (
                                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                    className="border-b border-border/50 hover:bg-background/50">
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selectedIds.includes(inv.id)} onChange={() => toggleSelect(inv.id)}
                                            className="rounded border-border" />
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-indigo-400">{inv.id}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-foreground text-xs">{inv.customer}</div>
                                        <div className="text-[10px] text-slate-500">{inv.company}</div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{inv.date}</td>
                                    <td className="px-4 py-3 text-xs text-slate-400">{inv.dueDate}</td>
                                    <td className="px-4 py-3 text-xs text-foreground">{inv.items}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="text-xs text-foreground font-medium">₺{inv.total.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-500">KDV: ₺{inv.tax.toLocaleString()}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.bg} ${cfg.color}`}>
                                            <cfg.icon className="w-3 h-3" /> {cfg.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-1.5 text-slate-500 hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                                            <button className="p-1.5 text-slate-500 hover:text-foreground"><Download className="w-3.5 h-3.5" /></button>
                                            <button className="p-1.5 text-slate-500 hover:text-foreground"><Send className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Invoice Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Yeni Fatura Oluştur</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Müşteri Adı</label>
                                    <input placeholder="Ad Soyad" className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Firma</label>
                                    <input placeholder="Firma Adı" className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Fatura Tarihi</label>
                                    <input type="date" className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Vade Tarihi</label>
                                    <input type="date" className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Notlar</label>
                                <textarea placeholder="Fatura notu..." rows={2}
                                    className="w-full px-3 py-2 bg-background rounded-lg text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none resize-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-foreground">İptal</button>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">Oluştur</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
