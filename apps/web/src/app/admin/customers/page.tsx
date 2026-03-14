"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Search, Users, Eye, MoreVertical, TrendingUp, DollarSign, Download, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/admin/PageTransition';

interface Customer {
    email: string;
    name: string;
    phone: string;
    totalOrders: number;
    ltv: number;
    lastOrderDate: string;
}

export default function CustomersPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [actionMenuEmail, setActionMenuEmail] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-customers', { search, page }],
        queryFn: () => adminApi.getCustomers({ search: search || undefined, page }),
    });

    const customers = data?.customers || [];
    const totalPages = data?.pagination?.totalPages || 1;

    const formatCurrency = (amount: number) => {
        return `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Müşteriler</h1>
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <span className="text-sm font-bold text-blue-500">{customers.length} Müşteri</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Platformunuzdan alışveriş yapan müşterileri (CRM) yönetin ve LTV analizi yapın.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                    <Download size={16} /> Dışa Aktar
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="İsim veya E-posta ara..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full h-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50"
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-bold">Müşteriler yüklenirken hata oluştu</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Müşteri Profili</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Telefon</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Siparişler</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">LTV (Ciro)</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Son Sipariş</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {customers.map((customer: Customer) => (
                                <tr key={customer.email} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-inner">
                                                {customer.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{customer.name}</div>
                                                <div className="text-xs text-slate-500">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                        {customer.phone || '—'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center justify-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold text-xs">
                                            {customer.totalOrders} Adet
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                                <DollarSign size={14} />
                                            </div>
                                            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(customer.ltv)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-500">
                                        {formatDate(customer.lastOrderDate)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/customers/${encodeURIComponent(customer.email)}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors"
                                        >
                                            360 Görünüm <ArrowRight size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                                        Müşteri kaydı bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Placeholder */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 dark:bg-white/5 dark:text-slate-300 rounded-lg disabled:opacity-50"
                            >
                                Önceki
                            </button>
                            <span className="text-sm font-medium text-slate-500">Sayfa {page} / {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 dark:bg-white/5 dark:text-slate-300 rounded-lg disabled:opacity-50"
                            >
                                Sonraki
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
