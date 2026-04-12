"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import {
    Search, Users, UserCog, Shield, Lock, Unlock, Key, Mail,
    Phone, Calendar, Eye, MoreVertical, ChevronLeft, ChevronRight,
    AlertTriangle, CheckCircle, Loader2, Filter, Download, Crown
} from 'lucide-react';

const USER_TYPE_CONFIG = {
    SUPERADMIN: { label: 'Süper Admin', bgClass: 'bg-red-500/10', textClass: 'text-red-500', icon: Crown },
    ADMIN: { label: 'Admin', bgClass: 'bg-purple-500/10', textClass: 'text-purple-500', icon: Shield },
    USER: { label: 'Kullanıcı', bgClass: 'bg-blue-500/10', textClass: 'text-blue-500', icon: Users },
};

interface User {
    id: string;
    name?: string;
    email: string;
    type: string;
    twoFactorEnabled: boolean;
    status: string;
    createdAt?: string;
    tenant?: {
        name: string;
    };
}

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-users', { search, type: typeFilter, page }],
        queryFn: () => adminApi.getUsers({ search: search || undefined, type: typeFilter || undefined, page }),
    });


    const force2FAMutation = useMutation({
        mutationFn: (id: string) => adminApi.force2FA(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setActionMenuId(null);
        },
    });

    const users = data?.users || data || [];
    const totalPages = data?.totalPages || 1;

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Kullanıcı Yönetimi</h1>
                        <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                            <span className="text-sm font-bold text-purple-500">{Array.isArray(users) ? users.length : 0} Kullanıcı</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Platformdaki tüm kullanıcıları yönetin, kilitleyin veya 2FA zorunlu kılın</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                    <Download size={16} /> Dışa Aktar
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Ad, e-posta veya tenant ara..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-slate-500 outline-none focus:border-blue-500/50"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-blue-500/50"
                >
                    <option value="">Tüm Türler</option>
                    <option value="SUPERADMIN">Süper Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">Kullanıcı</option>
                </select>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-bold">Kullanıcılar yüklenirken hata oluştu</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kullanıcı</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">E-posta</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tenant</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tür</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">2FA</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Durum</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kayıt</th>
                                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                            {(Array.isArray(users) ? users : []).map((user: User) => {
                                const typeConfig = USER_TYPE_CONFIG[user.type as keyof typeof USER_TYPE_CONFIG] || USER_TYPE_CONFIG.USER;
                                const TypeIcon = typeConfig.icon;
                                return (
                                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {(user.name || user.email)?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <span className="font-bold text-foreground text-sm">{user.name || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{user.email}</td>
                                        <td className="p-4 text-sm text-slate-500">{user.tenant?.name || '—'}</td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeConfig.bgClass} ${typeConfig.textClass} flex items-center gap-1 w-fit`}>
                                                <TypeIcon size={12} /> {typeConfig.label}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.twoFactorEnabled ? (
                                                <div className="flex items-center gap-1 text-green-500"><Shield size={14} /> <span className="text-xs font-bold">Aktif</span></div>
                                            ) : (
                                                <span className="text-xs text-slate-400">Pasif</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${user.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {user.status === 'active' ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{user.createdAt ? formatDate(user.createdAt) : '—'}</td>
                                        <td className="p-4 text-right relative">
                                            <button
                                                onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={16} className="text-slate-400" />
                                            </button>
                                            {actionMenuId === user.id && (
                                                <div className="absolute right-4 top-12 z-50 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-1">
                                                    <button onClick={() => setSelectedUser(user)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-foreground hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg">
                                                        <Eye size={14} /> Detay Görüntüle
                                                    </button>
                                                    {!user.twoFactorEnabled && (
                                                        <button onClick={() => force2FAMutation.mutate(user.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg">
                                                            <Key size={14} /> 2FA Zorunlu Kıl
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {(!Array.isArray(users) || users.length === 0) && (
                                <tr><td colSpan={8} className="p-12 text-center text-slate-400 text-sm">Kullanıcı bulunamadı</td></tr>
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

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-foreground">Kullanıcı Detayları</h3>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg">✕</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                {(selectedUser.name || selectedUser.email)?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <div className="text-lg font-bold text-foreground">{selectedUser.name || '—'}</div>
                                <div className="text-sm text-slate-500">{selectedUser.email}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-xs font-bold text-slate-500 uppercase">Tür</span><div className="font-bold text-foreground">{selectedUser.type}</div></div>
                            <div><span className="text-xs font-bold text-slate-500 uppercase">Tenant</span><div className="font-bold text-foreground">{selectedUser.tenant?.name || '—'}</div></div>
                            <div><span className="text-xs font-bold text-slate-500 uppercase">2FA</span><div className="font-bold text-foreground">{selectedUser.twoFactorEnabled ? 'Aktif' : 'Pasif'}</div></div>
                            <div><span className="text-xs font-bold text-slate-500 uppercase">Durum</span><div className="font-bold text-foreground">{selectedUser.status === 'active' ? 'Aktif' : 'Pasif'}</div></div>
                            <div><span className="text-xs font-bold text-slate-500 uppercase">Kayıt Tarihi</span><div className="font-bold text-foreground">{selectedUser.createdAt ? formatDate(selectedUser.createdAt) : '—'}</div></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
