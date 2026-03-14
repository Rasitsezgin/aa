"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  BarChart3,
  TrendingUp,
  Receipt,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

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
  DRAFT: { label: 'Taslak', color: 'text-gray-500 bg-gray-100', icon: Clock },
  SENT: { label: 'Gönderildi', color: 'text-blue-600 bg-blue-100', icon: Send },
  ACCEPTED: { label: 'Kabul Edildi', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  REJECTED: { label: 'Reddedildi', color: 'text-red-600 bg-red-100', icon: XCircle },
  CANCELLED: { label: 'İptal', color: 'text-orange-600 bg-orange-100', icon: AlertTriangle },
};

export default function EInvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Demo data
    setStats({
      total: 156,
      byStatus: [
        { status: 'SENT', count: 45 },
        { status: 'ACCEPTED', count: 89 },
        { status: 'REJECTED', count: 5 },
        { status: 'CANCELLED', count: 3 },
        { status: 'DRAFT', count: 14 },
      ],
      totals: { amount: 1250000, tax: 225000 },
    });

    setInvoices([
      { id: '1', invoiceNumber: 'PYN2026000000001', invoiceDate: '2026-03-01', buyerTitle: 'ABC Teknoloji A.Ş.', buyerTaxNumber: '1234567890', type: 'SATIS', scenario: 'TEMEL', status: 'ACCEPTED', totalAmount: 12500, taxAmount: 2500, currency: 'TRY', gibInvoiceId: 'a1b2c3d4' },
      { id: '2', invoiceNumber: 'PYN2026000000002', invoiceDate: '2026-03-02', buyerTitle: 'XYZ Ltd. Şti.', buyerTaxNumber: '9876543210', type: 'SATIS', scenario: 'TICARI', status: 'SENT', totalAmount: 8750, taxAmount: 1750, currency: 'TRY', gibInvoiceId: 'e5f6g7h8' },
      { id: '3', invoiceNumber: 'PYN2026000000003', invoiceDate: '2026-03-03', buyerTitle: 'Demo Holding', buyerTaxNumber: '5555555555', type: 'IADE', scenario: 'TEMEL', status: 'DRAFT', totalAmount: 3200, taxAmount: 640, currency: 'TRY' },
      { id: '4', invoiceNumber: 'PYN2026000000004', invoiceDate: '2026-03-04', buyerTitle: 'Global Dış Tic.', buyerTaxNumber: '1112223334', type: 'SATIS', scenario: 'IHRACAT', status: 'ACCEPTED', totalAmount: 45000, taxAmount: 0, currency: 'USD' },
      { id: '5', invoiceNumber: 'PYN2026000000005', invoiceDate: '2026-03-05', buyerTitle: 'Test Yazılım', buyerTaxNumber: '9998887776', type: 'SATIS', scenario: 'TEMEL', status: 'REJECTED', totalAmount: 1800, taxAmount: 360, currency: 'TRY' },
    ]);

    setLoading(false);
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.buyerTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency = 'TRY') =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">E-Fatura</h1>
          <p className="text-slate-500 font-medium">GİB e-fatura yönetimi ve takibi</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
            <Plus size={18} />
            Yeni Fatura
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl font-semibold hover:bg-surface transition-colors">
            <Download size={18} />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-100 rounded-xl"><FileText className="w-5 h-5 text-blue-600" /></div>
            </div>
            <p className="text-2xl font-black text-foreground">{stats.total}</p>
            <p className="text-sm text-slate-500 font-medium">Toplam Fatura</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-green-100 rounded-xl"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            </div>
            <p className="text-2xl font-black text-foreground">{stats.byStatus.find(s => s.status === 'ACCEPTED')?.count || 0}</p>
            <p className="text-sm text-slate-500 font-medium">Kabul Edilen</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-100 rounded-xl"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
            </div>
            <p className="text-2xl font-black text-foreground">{formatCurrency(stats.totals.amount)}</p>
            <p className="text-sm text-slate-500 font-medium">Toplam Tutar</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-orange-100 rounded-xl"><Receipt className="w-5 h-5 text-orange-600" /></div>
            </div>
            <p className="text-2xl font-black text-foreground">{formatCurrency(stats.totals.tax)}</p>
            <p className="text-sm text-slate-500 font-medium">Toplam KDV</p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Fatura no veya alıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-xl bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="DRAFT">Taslak</option>
          <option value="SENT">Gönderildi</option>
          <option value="ACCEPTED">Kabul Edildi</option>
          <option value="REJECTED">Reddedildi</option>
          <option value="CANCELLED">İptal</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Fatura No</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tarih</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Alıcı</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tip</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Durum</th>
                <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tutar</th>
                <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const statusCfg = statusConfig[inv.status] || statusConfig.DRAFT;
                const StatusIcon = statusCfg.icon;
                return (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-background/30 transition-colors">
                    <td className="px-5 py-4 font-mono font-semibold text-sm text-foreground">{inv.invoiceNumber}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{new Date(inv.invoiceDate).toLocaleDateString('tr-TR')}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-foreground">{inv.buyerTitle}</p>
                      <p className="text-xs text-slate-400">VKN: {inv.buyerTaxNumber}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{inv.scenario}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusCfg.color}`}>
                        <StatusIcon size={12} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-sm text-foreground">{formatCurrency(inv.totalAmount, inv.currency)}</td>
                    <td className="px-5 py-4 text-center">
                      <button className="p-2 hover:bg-background rounded-lg transition-colors" title="Detay">
                        <Eye size={16} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">Fatura bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}