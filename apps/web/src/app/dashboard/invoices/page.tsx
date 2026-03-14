"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Printer,
    Send,
    Eye,
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    XCircle,
    Plus,
    MoreVertical,
    Building2,
    CreditCard,
    ChevronDown,
    Mail,
    ArrowUpRight,
    DollarSign,
    RefreshCw
} from 'lucide-react';
import { useInvoices } from '@/lib/hooks';

interface Invoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    status: 'PAID' | 'PENDING' | 'DRAFT' | 'CANCELLED';
    order?: {
        customerName?: string;
        marketplaceOrderId?: string;
        platform?: string;
        totalAmount?: number | string;
    };
}

export default function InvoicesPage() {
    const { getInvoices, generateInvoice, loading } = useInvoices();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const loadInvoices = async () => {
        const response = await getInvoices() as Invoice[] | null;
        if (response) {
            setInvoices(response);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => loadInvoices(), 0);
        return () => clearTimeout(timer);
    }, []);

    // Calculate stats locally from invoices if backend doesn't provide them
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.order?.totalAmount || 0), 0);
    const paidAmount = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + Number(inv.order?.totalAmount || 0), 0);
    const pendingAmount = invoices.filter(inv => inv.status === 'PENDING' || inv.status === 'DRAFT').reduce((sum, inv) => sum + Number(inv.order?.totalAmount || 0), 0);
    const cancelledAmount = invoices.filter(inv => inv.status === 'CANCELLED').reduce((sum, inv) => sum + Number(inv.order?.totalAmount || 0), 0);

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.order?.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return <span className="px-2 py-1 rounded-full text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1 justify-center"><CheckCircle2 className="w-3 h-3" /> ÖDENDİ</span>;
            case 'PENDING':
                return <span className="px-2 py-1 rounded-full text-[10px] font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1 justify-center"><Clock className="w-3 h-3" /> BEKLEMEDE</span>;
            case 'DRAFT':
                return <span className="px-2 py-1 rounded-full text-[10px] font-black bg-gray-500/10 text-gray-500 border border-gray-500/20 flex items-center gap-1 justify-center">TASLAK</span>;
            case 'CANCELLED':
                return <span className="px-2 py-1 rounded-full text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 justify-center"><XCircle className="w-3 h-3" /> İPTAL</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1 justify-center">{status}</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-amber-500" />
                        Faturalar
                    </h1>
                    <p className="text-slate-500 font-medium">Finansal dökümanlarınızın ve faturalarınızın yönetimi</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <Download size={16} /> Toplu İndir
                    </button>
                    <button onClick={loadInvoices} className="p-2.5 bg-surface border border-border rounded-xl text-foreground hover:bg-surface/80">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-2xl border border-border">
                    <div className="text-3xl font-black text-foreground tabular-nums">₺{totalInvoiced.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Toplam Tutar</div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-border">
                    <div className="text-3xl font-black text-green-500 tabular-nums">₺{paidAmount.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Tahsil Edilen</div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-border">
                    <div className="text-3xl font-black text-yellow-500 tabular-nums">₺{pendingAmount.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Bekleyen Tevkifat</div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-border">
                    <div className="text-3xl font-black text-red-500 tabular-nums">₺{cancelledAmount.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">İptal Edilen</div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-background/30 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Fatura no veya müşteri ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-background/50 border-b border-border">
                            <tr>
                                <th className="p-4 text-left font-black text-slate-500 uppercase tracking-widest text-[10px]">Fatura No</th>
                                <th className="p-4 text-left font-black text-slate-500 uppercase tracking-widest text-[10px]">Müşteri</th>
                                <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Platform</th>
                                <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Tarih</th>
                                <th className="p-4 text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">Tutar</th>
                                <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Durum</th>
                                <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-background/50 transition-colors group">
                                    <td className="p-4">
                                        <span className="font-mono text-amber-500 font-bold">#{invoice.invoiceNumber}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-foreground">{invoice.order?.customerName || 'Bilinmiyor'}</div>
                                        <div className="text-[10px] text-slate-500 font-bold tabular-nums">#{invoice.order?.marketplaceOrderId}</div>
                                    </td>
                                    <td className="p-4 text-center text-[10px] font-black">
                                        {invoice.order?.platform}
                                    </td>
                                    <td className="p-4 text-center tabular-nums">
                                        {new Date(invoice.invoiceDate).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-black text-foreground tabular-nums">₺{Number(invoice.order?.totalAmount || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(invoice.status)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Eye size={16} /></button>
                                            <button className="p-2 text-slate-400 hover:text-foreground hover:bg-background rounded-xl transition-all"><Download size={16} /></button>
                                            <button className="p-2 text-slate-400 hover:text-foreground hover:bg-background rounded-xl transition-all"><Mail size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="text-slate-400 font-bold uppercase tracking-widest flex flex-col items-center gap-4">
                                            <FileText size={48} className="opacity-20" />
                                            Fatura bulunamadı
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
