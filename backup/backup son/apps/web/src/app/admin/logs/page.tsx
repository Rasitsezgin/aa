"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import {
    ShieldAlert, AlertTriangle, CheckCircle, Search, Calendar,
    User, Terminal, Loader2, ChevronLeft, ChevronRight,
    Download, Filter, Eye, Clock, LucideIcon
} from 'lucide-react';

interface AuditLog {
    id: string;
    action: string;
    resource?: string;
    resourceType?: string;
    userId?: string;
    user?: {
        name?: string;
        email?: string;
    };
    details?: string;
    description?: string;
    ip?: string;
    userAgent?: string;
    createdAt?: string;
    time?: string;
    metadata?: Record<string, unknown>;
}

const SEVERITY_CONFIG: Record<string, { icon: LucideIcon; bgClass: string; textClass: string; label: string }> = {
    high: { icon: ShieldAlert, bgClass: 'bg-red-500/10', textClass: 'text-red-500', label: 'Kritik' },
    critical: { icon: ShieldAlert, bgClass: 'bg-red-500/10', textClass: 'text-red-500', label: 'Kritik' },
    medium: { icon: AlertTriangle, bgClass: 'bg-amber-500/10', textClass: 'text-amber-500', label: 'Uyarı' },
    warning: { icon: AlertTriangle, bgClass: 'bg-amber-500/10', textClass: 'text-amber-500', label: 'Uyarı' },
    low: { icon: Terminal, bgClass: 'bg-blue-500/10', textClass: 'text-blue-500', label: 'Bilgi' },
    info: { icon: Terminal, bgClass: 'bg-blue-500/10', textClass: 'text-blue-500', label: 'Bilgi' },
    success: { icon: CheckCircle, bgClass: 'bg-green-500/10', textClass: 'text-green-500', label: 'Başarılı' },
};

export default function LogsPage() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-audit-logs', { action: actionFilter, page, search }],
        queryFn: () => adminApi.getAuditLogs({
            action: actionFilter || undefined,
            page,
            limit: 20,
        }),
    });

    const logs = data?.logs || data || [];
    const totalPages = data?.totalPages || 1;
    const total = data?.total || (Array.isArray(logs) ? logs.length : 0);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getSeverity = (log: AuditLog) => {
        const action = (log.action || '').toLowerCase();
        if (action.includes('delete') || action.includes('fail') || action.includes('error')) return 'high';
        if (action.includes('update') || action.includes('change')) return 'medium';
        if (action.includes('create') || action.includes('login') || action.includes('success')) return 'success';
        return 'low';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Denetim Kayıtları</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Sistem güvenliği ve hata izleme merkezi</p>
                </div>
                <div className="flex gap-2">
                    <button className="h-10 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <Download size={16} /> Dışa Aktar (.csv)
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Kayıt', value: total, icon: Terminal, color: 'blue' },
                    { label: 'Kritik', value: (Array.isArray(logs) ? logs : []).filter((l: AuditLog) => getSeverity(l) === 'high').length, icon: ShieldAlert, color: 'red' },
                    { label: 'Uyarı', value: (Array.isArray(logs) ? logs : []).filter((l: AuditLog) => getSeverity(l) === 'medium').length, icon: AlertTriangle, color: 'amber' },
                    { label: 'Başarılı', value: (Array.isArray(logs) ? logs : []).filter((l: AuditLog) => getSeverity(l) === 'success').length, icon: CheckCircle, color: 'green' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-${stat.color}-500/10`}>
                            <stat.icon size={18} className={`text-${stat.color}-500`} />
                        </div>
                        <div>
                            <div className="text-xl font-black text-foreground">{stat.value}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="IP, Kullanıcı veya İşlem ara..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-slate-500 outline-none focus:border-blue-500/50"
                    />
                </div>
                <select
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-blue-500/50"
                >
                    <option value="">Tüm İşlemler</option>
                    <option value="CREATE">Oluşturma</option>
                    <option value="UPDATE">Güncelleme</option>
                    <option value="DELETE">Silme</option>
                    <option value="LOGIN">Giriş</option>
                </select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-bold">Kayıtlar yüklenirken hata oluştu</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest w-24">Durum</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">İşlem</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kaynak</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kullanıcı</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Detay</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Zaman</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {(Array.isArray(logs) ? logs : []).map((log: AuditLog, i: number) => {
                                const severity = getSeverity(log);
                                const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
                                const SeverityIcon = config.icon;
                                return (
                                    <tr key={log.id || i} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors text-sm">
                                        <td className="p-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bgClass} ${config.textClass}`}>
                                                <SeverityIcon size={16} />
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-foreground tracking-tight">{log.action || '—'}</td>
                                        <td className="p-4 text-slate-500">{log.resource || log.resourceType || '—'}</td>
                                        <td className="p-4 text-slate-500 flex items-center gap-2">
                                            <User size={12} /> {log.user?.name || log.user?.email || log.userId || '—'}
                                        </td>
                                        <td className="p-4 text-slate-500 max-w-[200px] truncate">{log.details || log.description || '—'}</td>
                                        <td className="p-4 text-right text-slate-500 font-bold whitespace-nowrap">
                                            {log.createdAt ? formatDate(log.createdAt) : log.time || '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!Array.isArray(logs) || logs.length === 0) && (
                                <tr><td colSpan={6} className="p-12 text-center text-slate-400 text-sm">Kayıt bulunamadı</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-white/5">
                            <span className="text-xs text-slate-500 font-bold">Sayfa {page} / {totalPages}</span>
                            <div className="flex gap-2">
                                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 disabled:opacity-30">
                                    <ChevronLeft size={16} />
                                </button>
                                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 disabled:opacity-30">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-foreground">Log Detayı</h3>
                            <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">✕</button>
                        </div>
                        <pre className="bg-slate-100 dark:bg-black/20 p-4 rounded-xl text-xs overflow-auto max-h-64 font-mono text-foreground">
                            {JSON.stringify(selectedLog, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
