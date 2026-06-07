"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Send, CheckCircle, XCircle, Clock, Download,
  Filter, Search, Plus, Eye, BarChart3, TrendingUp, Receipt,
  AlertTriangle, RefreshCw, ShoppingCart
} from 'lucide-react';
import { getInvoices } from '../../actions/e-invoice';
import { useTenantId } from '@/lib/tenant';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  buyerTitle: string;
  buyerTaxNumber: string;
  type: string;
  scenario: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  gibInvoiceId?: string;
}

interface InvoiceStats {
  total: number;
  byStatus: { status: string; count: number }[];
  totals: { amount: number; tax: number };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  DRAFT: { label: 'Taslak', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800', icon: Clock },
  SENT: { label: 'Gönderildi (GİB)', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', icon: Send },
  ACCEPTED: { label: 'Kabul Edildi', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
  REJECTED: { label: 'Reddedildi', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', icon: XCircle },
  CANCELLED: { label: 'İptal', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', icon: AlertTriangle },
  PENDING: { label: 'Sırada', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', icon: RefreshCw },
};

export default function EInvoicePage() {
  const tenantId = useTenantId();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (tenantId) fetchData();
    else setLoading(false);
  }, [tenantId]);

  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    const res = await getInvoices(tenantId);
    if (res.success && res.stats) {
        setInvoices(res.invoices);
        setStats(res.stats);
    }
    setLoading(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.buyerTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency = 'TRY') =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            <Receipt className="w-8 h-8 text-primary" />
            E-Fatura & GİB Entegrasyonu
          </h1>
          <p className="text-slate-500 mt-2">Siparişlerinizin resmi e-fatura / e-arşiv takiplerini Prisma veritabanınız üzerinden yönetin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Manuel Fatura Kes
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl font-bold hover:bg-surface transition-colors">
            <Download className="w-4 h-4" /> Excel'e Aktar
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center p-12 opacity-50 bg-surface rounded-3xl border border-border">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mr-4" />
          <span className="font-bold">Veritabanından E-Fatura kayıtları derleniyor...</span>
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-[1.5rem] p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
            </div>
            <p className="text-2xl font-black text-foreground">{stats.total}</p>
            <p className="text-sm text-slate-500 font-bold">Toplam Fatura Adedi</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded-[1.5rem] p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"><CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            </div>
            <p className="text-2xl font-black text-foreground">{stats.byStatus.find(s => s.status === 'ACCEPTED')?.count || 0}</p>
            <p className="text-sm text-slate-500 font-bold">GİB Tarafından Onaylanan</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-[1.5rem] p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl"><TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
            </div>
            <p className="text-2xl font-black text-foreground">{formatCurrency(stats.totals.amount)}</p>
            <p className="text-sm text-slate-500 font-bold">Resmi Ciro</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-border rounded-[1.5rem] p-5 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl"><Receipt className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
            </div>
            <p className="text-2xl font-black text-foreground">{formatCurrency(stats.totals.tax)}</p>
            <p className="text-sm text-slate-500 font-bold">Toplam Kesilen KDV</p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="VKN, TCKN, Alıcı veya Fatura No Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-border rounded-xl bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold min-w-[200px]"
          >
            <option value="all">Filtre: Tüm Durumlar</option>
            <option value="DRAFT">Taslak</option>
            <option value="PENDING">Sırada / Kesiliyor</option>
            <option value="SENT">GİB'e İletildi</option>
            <option value="ACCEPTED">Alıcı Kabul Etti</option>
            <option value="REJECTED">Reddedildi</option>
          </select>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[140px]">Fatura No</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[120px]">Tarih</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Alıcı Cari Bilgisi</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[100px]">Fatura Tipi</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[140px]">Güncel GİB Durumu</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[120px]">KDV Dahil Tutar</th>
                  <th className="text-center px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Aksiyon</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => {
                  const statusCfg = statusConfig[inv.status] || statusConfig.DRAFT;
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={inv.id} className="border-b border-border/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                      <td className="px-6 py-5 font-mono font-bold text-sm text-foreground">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                        {new Date(inv.invoiceDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-foreground mb-0.5 truncate max-w-[200px]" title={inv.buyerTitle}>{inv.buyerTitle}</p>
                        <p className="text-[11px] font-mono text-slate-400">VKN: {inv.buyerTaxNumber}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {inv.type}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${statusCfg.color}`}>
                          <StatusIcon size={12} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-base text-foreground">
                        {formatCurrency(inv.totalAmount, inv.currency)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-500 rounded-lg transition-colors font-bold text-xs" title="Görüntüle">
                          Detay
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                    <tr>
                        <td colSpan={7} className="text-center py-20 px-4">
                            <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold mb-1">E-Fatura Bekleyen Kayıt Yok</p>
                            <p className="text-sm text-slate-400">Siparişleriniz otomasyon veya manuel yöntemle arşivlendiğinde burada listelenir.</p>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}