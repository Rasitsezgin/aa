"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { Search, LifeBuoy, AlertTriangle, Loader2, MessageSquare, Clock, Filter, Eye } from 'lucide-react';
import Link from 'next/link';

interface SupportTicket {
    id: string;
    subject: string;
    status: string;
    priority: string;
    customerName: string | null;
    customerEmail: string | null;
    createdAt: string;
    messageCount: number;
}

export default function SupportTicketsPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('ALL');

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-support-tickets', { page, status }],
        queryFn: () => adminApi.getSupportTickets({ page, status }),
    });

    const tickets = data?.tickets || [];
    const totalPages = data?.pagination?.totalPages || 1;

    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'OPEN': return 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
            case 'PENDING': return 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400';
            case 'RESOLVED': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
            case 'CLOSED': return 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400';
            default: return 'bg-slate-100 dark:bg-white/5 text-slate-500';
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'URGENT': return 'text-red-500';
            case 'HIGH': return 'text-amber-500';
            case 'LOW': return 'text-slate-400';
            default: return 'text-blue-500';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Yardım Masası</h1>
                        <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                            <span className="text-sm font-bold text-purple-500">{tickets.length} Talep</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Bütün platformlardan gelen müşteri destek taleplerini merkezi olarak yönetin.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-sm">
                <div className="flex items-center gap-2 px-4 h-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl">
                    <Filter size={16} className="text-slate-400" />
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-300 outline-none w-40"
                    >
                        <option value="ALL">Tüm Durumlar</option>
                        <option value="OPEN">Açık</option>
                        <option value="PENDING">Beklemede</option>
                        <option value="RESOLVED">Çözüldü</option>
                        <option value="CLOSED">Kapalı</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-bold">Talepler yüklenirken hata oluştu</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest w-12">Öncelik</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Müşteri</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Konu</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Durum</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Mesajlar</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tarih</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {tickets.map((ticket: SupportTicket) => (
                                <tr key={ticket.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-center">
                                        <LifeBuoy size={18} className={`mx-auto ${getPriorityColor(ticket.priority)}`} />
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm">{ticket.customerName || 'Bilinmiyor'}</div>
                                        <div className="text-xs text-slate-500">{ticket.customerEmail || '—'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate" title={ticket.subject}>
                                            {ticket.subject}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm font-bold">
                                            <MessageSquare size={14} />
                                            {ticket.messageCount}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-500 flex items-center gap-1.5">
                                        <Clock size={14} /> {formatDate(ticket.createdAt)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/support-tickets/${ticket.id}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/20 dark:hover:text-purple-400 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors"
                                        >
                                            Yanıtla
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                                        Destek talebi bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

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
