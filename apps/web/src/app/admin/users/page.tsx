"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import {
    Search, Users, Shield, Lock, Unlock, Key, Mail,
    ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Loader2,
    Download, Crown, UserPlus, Edit3, Trash2, X, Check,
    Building, RefreshCw, KeyRound, ShieldAlert
} from 'lucide-react';

const USER_TYPE_CONFIG = {
    SUPERADMIN: {
        label: 'Süper Admin',
        bgClass: 'bg-red-500/10 border-red-500/20',
        textClass: 'text-red-500',
        badge: 'bg-red-500/20 text-red-500 border border-red-500/30',
        icon: Crown,
        description: 'Tüm platform ve yönetim üzerinde tam yetki',
    },
    ADMIN: {
        label: 'Admin',
        bgClass: 'bg-purple-500/10 border-purple-500/20',
        textClass: 'text-purple-500',
        badge: 'bg-purple-500/20 text-purple-500 border border-purple-500/30',
        icon: Shield,
        description: 'Yönetim paneline erişim ve operasyon yetkisi',
    },
    USER: {
        label: 'Kullanıcı',
        bgClass: 'bg-blue-500/10 border-blue-500/20',
        textClass: 'text-blue-500',
        badge: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
        icon: Users,
        description: 'Standart mağaza kullanıcısı',
    },
};

interface User {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    type: string;
    tenantId?: string;
    twoFactorEnabled: boolean;
    status: string;
    createdAt?: string;
    tenant?: {
        id?: string;
        name: string;
    };
}

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);
    const [roleChangeTargetUser, setRoleChangeTargetUser] = useState<User | null>(null);

    // Feedback toast
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    // Create user form state
    const [createForm, setCreateForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        type: 'USER',
        tenantId: '',
    });

    // Edit user form state
    const [editForm, setEditForm] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        type: 'USER',
        tenantId: '',
        status: 'active',
    });

    // Fetch users
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['admin-users', { search, type: typeFilter, page }],
        queryFn: () => adminApi.getUsers({ search: search || undefined, type: typeFilter || undefined, page }),
    });

    // Fetch tenants for dropdown
    const { data: tenantsData } = useQuery({
        queryKey: ['admin-tenants-list'],
        queryFn: () => adminApi.getTenants({ limit: 100 }),
    });

    const tenantsList = tenantsData?.tenants || [];
    const users: User[] = data?.users || (Array.isArray(data) ? data : []);
    const totalPages = data?.pagination?.totalPages || data?.totalPages || 1;

    // Mutations
    const createUserMutation = useMutation({
        mutationFn: (formData: typeof createForm) => adminApi.createUser(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setIsCreateOpen(false);
            setCreateForm({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                type: 'USER',
                tenantId: '',
            });
            setFeedback({ message: 'Yeni kullanıcı başarıyla oluşturuldu.', type: 'success' });
        },
        onError: (err: any) => {
            setFeedback({
                message: err?.message || 'Kullanıcı oluşturulurken bir hata oluştu.',
                type: 'error',
            });
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => adminApi.updateUser(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setIsEditOpen(false);
            setSelectedUser(null);
            setFeedback({ message: 'Kullanıcı bilgileri başarıyla güncellendi.', type: 'success' });
        },
        onError: (err: any) => {
            setFeedback({
                message: err?.message || 'Kullanıcı güncellenirken bir hata oluştu.',
                type: 'error',
            });
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, type }: { id: string; type: string }) => adminApi.updateUserRole(id, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setActionMenuId(null);
            setRoleChangeTargetUser(null);
            setFeedback({ message: 'Kullanıcı yetkisi başarıyla güncellendi.', type: 'success' });
        },
        onError: (err: any) => {
            setFeedback({
                message: err?.message || 'Yetki güncellenirken hata oluştu.',
                type: 'error',
            });
        },
    });

    const toggleLockMutation = useMutation({
        mutationFn: ({ id, isLocked }: { id: string; isLocked: boolean }) =>
            isLocked ? adminApi.unlockUser(id) : adminApi.lockUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setActionMenuId(null);
            setFeedback({ message: 'Kullanıcı hesap durumu güncellendi.', type: 'success' });
        },
        onError: () => {
            setFeedback({ message: 'Hesap durumu değiştirilemedi.', type: 'error' });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setActionMenuId(null);
            setFeedback({ message: 'Kullanıcı hesabı başarıyla silindi.', type: 'success' });
        },
        onError: (err: any) => {
            setFeedback({ message: err?.message || 'Kullanıcı silinemedi.', type: 'error' });
        },
    });

    const force2FAMutation = useMutation({
        mutationFn: (id: string) => adminApi.force2FA(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setActionMenuId(null);
            setFeedback({ message: '2FA zorunluluğu uygulandı.', type: 'success' });
        },
        onError: () => {
            setFeedback({ message: '2FA işlemi gerçekleştirilemedi.', type: 'error' });
        },
    });

    const openEditModal = (user: User) => {
        const nameParts = (user.name || '').split(' ');
        const fName = user.firstName || nameParts[0] || '';
        const lName = user.lastName || nameParts.slice(1).join(' ') || '';

        setEditForm({
            id: user.id,
            firstName: fName,
            lastName: lName,
            email: user.email,
            password: '',
            type: user.type,
            tenantId: user.tenantId || '',
            status: user.status || 'active',
        });
        setIsEditOpen(true);
        setActionMenuId(null);
    };

    const handleExport = () => {
        if (!users || !users.length) return;
        const csvContent =
            "data:text/csv;charset=utf-8," +
            ["ID,Ad Soyad,E-posta,Yetki,Firma,Durum,Kayıt Tarihi"]
                .concat(
                    users.map(
                        (u: User) =>
                            `"${u.id}","${u.name || ''}","${u.email}","${u.type}","${u.tenant?.name || ''}","${u.status}","${u.createdAt || ''}"`
                    )
                )
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `kullanicilar_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Feedback Alert */}
            {feedback && (
                <div
                    className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 ${
                        feedback.type === 'success'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    }`}
                >
                    {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <span className="text-sm font-bold">{feedback.message}</span>
                    <button onClick={() => setFeedback(null)} className="ml-2 opacity-60 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Kullanıcı Yönetimi</h1>
                        <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                            <span className="text-sm font-bold text-purple-500">
                                {users.length} Kullanıcı
                            </span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Platformdaki tüm kullanıcıları yönetin, yeni kullanıcı ekleyin, Admin/Süper Admin yetkisi atayın.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-foreground transition-all"
                        title="Listeyi Yenile"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-foreground transition-all"
                    >
                        <Download size={16} /> Dışa Aktar
                    </button>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        <UserPlus size={18} />
                        <span>Yeni Kullanıcı Ekle</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Ad, e-posta veya tenant ara..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-slate-500 outline-none focus:border-blue-500/50"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setPage(1);
                    }}
                    className="h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-blue-500/50"
                >
                    <option value="">Tüm Yetkiler</option>
                    <option value="SUPERADMIN">Süper Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="USER">Kullanıcı</option>
                </select>
            </div>

            {/* Table Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
                    <p className="text-sm font-medium text-slate-400">Kullanıcılar yükleniyor...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-bold mb-2">Kullanıcılar yüklenirken hata oluştu</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200"
                    >
                        Tekrar Dene
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kullanıcı</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">E-posta</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tenant / Mağaza</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Yetki / Rol</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">2FA</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Durum</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Kayıt</th>
                                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {users.map((user: User) => {
                                    const typeConfig =
                                        USER_TYPE_CONFIG[user.type as keyof typeof USER_TYPE_CONFIG] ||
                                        USER_TYPE_CONFIG.USER;
                                    const TypeIcon = typeConfig.icon;
                                    const isLocked = user.status === 'locked';

                                    return (
                                        <tr
                                            key={user.id}
                                            className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                        {(user.name || user.email)?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                                            {user.name || 'İsimsiz Kullanıcı'}
                                                            {user.type === 'SUPERADMIN' && (
                                                                <Crown size={14} className="text-amber-500 fill-amber-500" />
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-mono">
                                                            ID: {user.id.slice(0, 8)}...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                {user.email}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {user.tenant?.name ? (
                                                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                                                        <Building size={14} className="text-slate-400" />
                                                        {user.tenant.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Platform Düzeyi</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => setRoleChangeTargetUser(user)}
                                                    className={`group/role text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all hover:scale-105 ${typeConfig.badge}`}
                                                    title="Yetkiyi Değiştirmek İçin Tıklayın"
                                                >
                                                    <TypeIcon size={13} />
                                                    <span>{typeConfig.label}</span>
                                                    <Edit3 size={11} className="opacity-0 group-hover/role:opacity-100 transition-opacity ml-1" />
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                {user.twoFactorEnabled ? (
                                                    <div className="flex items-center gap-1 text-emerald-500">
                                                        <Shield size={14} />
                                                        <span className="text-xs font-bold">Aktif</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">Pasif</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleLockMutation.mutate({ id: user.id, isLocked })}
                                                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                                                        !isLocked
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/10 hover:text-rose-500'
                                                            : 'bg-rose-500/10 text-rose-500 hover:bg-emerald-500/10 hover:text-emerald-500'
                                                    }`}
                                                    title={!isLocked ? "Kilitlemek için tıklayın" : "Kilidi açmak için tıklayın"}
                                                >
                                                    {!isLocked ? (
                                                        <>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            Aktif
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock size={11} />
                                                            Kilitli
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="p-4 text-xs font-medium text-slate-500">
                                                {user.createdAt ? formatDate(user.createdAt) : '—'}
                                            </td>
                                            <td className="p-4 text-right relative">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Quick Admin Grant Button */}
                                                    {user.type === 'USER' && (
                                                        <button
                                                            onClick={() => updateRoleMutation.mutate({ id: user.id, type: 'ADMIN' })}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold transition-all border border-purple-500/20"
                                                            title="Admin Yetkisi Ver"
                                                        >
                                                            <Shield size={13} />
                                                            <span>Admin Yap</span>
                                                        </button>
                                                    )}

                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-foreground transition-colors"
                                                        title="Düzenle"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>

                                                    {/* Context menu toggle */}
                                                    <button
                                                        onClick={() =>
                                                            setActionMenuId(actionMenuId === user.id ? null : user.id)
                                                        }
                                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-foreground transition-colors"
                                                    >
                                                        <Key size={16} />
                                                    </button>
                                                </div>

                                                {/* Action Menu Popup */}
                                                {actionMenuId === user.id && (
                                                    <div className="absolute right-4 top-12 z-50 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-1.5 text-left animate-in fade-in zoom-in-95">
                                                        <div className="px-3 py-1.5 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/5 mb-1">
                                                            Yetki & Güvenlik
                                                        </div>

                                                        {/* Role Options */}
                                                        {user.type !== 'ADMIN' && (
                                                            <button
                                                                onClick={() =>
                                                                    updateRoleMutation.mutate({ id: user.id, type: 'ADMIN' })
                                                                }
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl"
                                                            >
                                                                <Shield size={14} /> Admin Yetkisi Ver
                                                            </button>
                                                        )}

                                                        {user.type !== 'SUPERADMIN' && (
                                                            <button
                                                                onClick={() =>
                                                                    updateRoleMutation.mutate({ id: user.id, type: 'SUPERADMIN' })
                                                                }
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                                                            >
                                                                <Crown size={14} /> Süper Admin Yap
                                                            </button>
                                                        )}

                                                        {user.type !== 'USER' && (
                                                            <button
                                                                onClick={() =>
                                                                    updateRoleMutation.mutate({ id: user.id, type: 'USER' })
                                                                }
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl"
                                                            >
                                                                <Users size={14} /> Standart Kullanıcı Yap
                                                            </button>
                                                        )}

                                                        <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl"
                                                        >
                                                            <Edit3 size={14} /> Bilgileri Düzenle
                                                        </button>

                                                        <button
                                                            onClick={() => toggleLockMutation.mutate({ id: user.id, isLocked })}
                                                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl ${
                                                                isLocked
                                                                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                                                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                                            }`}
                                                        >
                                                            {isLocked ? (
                                                                <>
                                                                    <Unlock size={14} /> Hesabın Kilidini Aç
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Lock size={14} /> Hesabı Kilitle
                                                                </>
                                                            )}
                                                        </button>

                                                        {!user.twoFactorEnabled && (
                                                            <button
                                                                onClick={() => force2FAMutation.mutate(user.id)}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl"
                                                            >
                                                                <KeyRound size={14} /> 2FA Zorunlu Kıl
                                                            </button>
                                                        )}

                                                        <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`'${user.email}' kullanıcısını silmek istediğinize emin misiniz?`)) {
                                                                    deleteUserMutation.mutate(user.id);
                                                                }
                                                            }}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"
                                                        >
                                                            <Trash2 size={14} /> Kullanıcıyı Sil
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-slate-400 text-sm">
                                            Kriterlere uygun kullanıcı bulunamadı.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-white/5">
                            <span className="text-xs text-slate-500 font-bold">
                                Sayfa {page} / {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* QUICK ROLE CHANGE MODAL */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {roleChangeTargetUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setRoleChangeTargetUser(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-md w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                                    <ShieldAlert size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground">Yetki & Rol Düzenle</h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {roleChangeTargetUser.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setRoleChangeTargetUser(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Bu kullanıcı için tanımlanacak yetki seviyesini seçin:
                        </p>

                        <div className="space-y-3">
                            {(['USER', 'ADMIN', 'SUPERADMIN'] as const).map((r) => {
                                const conf = USER_TYPE_CONFIG[r];
                                const Icon = conf.icon;
                                const isCurrent = roleChangeTargetUser.type === r;

                                return (
                                    <button
                                        key={r}
                                        onClick={() =>
                                            updateRoleMutation.mutate({
                                                id: roleChangeTargetUser.id,
                                                type: r,
                                            })
                                        }
                                        disabled={updateRoleMutation.isPending}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                                            isCurrent
                                                ? `${conf.bgClass} border-blue-500 ring-2 ring-blue-500/30`
                                                : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div
                                                className={`p-2 rounded-xl ${conf.bgClass} ${conf.textClass}`}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    {conf.label}
                                                    {isCurrent && (
                                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white">
                                                            Mevcut
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {conf.description}
                                                </div>
                                            </div>
                                        </div>
                                        {isCurrent && <Check size={18} className="text-blue-500" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setRoleChangeTargetUser(null)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* CREATE USER MODAL */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {isCreateOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={() => setIsCreateOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                    <UserPlus size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground">Yeni Kullanıcı Ekle</h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Kullanıcı bilgilerini girin ve sistem yetkisini belirleyin.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createUserMutation.mutate(createForm);
                            }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        Ad
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ahmet"
                                        value={createForm.firstName}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, firstName: e.target.value })
                                        }
                                        className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        Soyad
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Yılmaz"
                                        value={createForm.lastName}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, lastName: e.target.value })
                                        }
                                        className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    E-posta Adresi <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="ornek@pazaryonetimi.com"
                                    value={createForm.email}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, email: e.target.value })
                                    }
                                    className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                                    <span>Şifre</span>
                                    <span className="text-[11px] text-slate-400 font-normal">
                                        Boş bırakılırsa: Pazar123!
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={createForm.password}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, password: e.target.value })
                                    }
                                    className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    Yetki Seviyesi (Rol) <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {(['USER', 'ADMIN', 'SUPERADMIN'] as const).map((r) => {
                                        const conf = USER_TYPE_CONFIG[r];
                                        const Icon = conf.icon;
                                        const isSelected = createForm.type === r;

                                        return (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setCreateForm({ ...createForm, type: r })}
                                                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                                                    isSelected
                                                        ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/30 text-blue-500 font-bold'
                                                        : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                <Icon size={18} className={isSelected ? 'text-blue-500' : 'text-slate-400'} />
                                                <span className="text-xs font-bold">{conf.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tenant Assignment */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                                    <span>Bağlı Tenant / Mağaza</span>
                                    <span className="text-[11px] text-slate-400 font-normal">
                                        İsteğe bağlı
                                    </span>
                                </label>
                                <select
                                    value={createForm.tenantId}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, tenantId: e.target.value })
                                    }
                                    className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                >
                                    <option value="">Varsayılan Tenant (Otomatik)</option>
                                    {tenantsList.map((t: any) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({t.slug || t.id.slice(0, 8)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createUserMutation.isPending}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
                                >
                                    {createUserMutation.isPending ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Oluşturuluyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            <span>Kullanıcıyı Oluştur</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* EDIT USER MODAL */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {isEditOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={() => setIsEditOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-lg w-full shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                                    <Edit3 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground">Kullanıcıyı Düzenle</h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        ID: {editForm.id.slice(0, 12)}...
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const payload: any = {
                                    firstName: editForm.firstName,
                                    lastName: editForm.lastName,
                                    email: editForm.email,
                                    type: editForm.type,
                                    tenantId: editForm.tenantId || null,
                                    status: editForm.status,
                                };
                                if (editForm.password && editForm.password.trim().length >= 6) {
                                    payload.password = editForm.password.trim();
                                }
                                updateUserMutation.mutate({ id: editForm.id, payload });
                            }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        Ad
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, firstName: e.target.value })
                                        }
                                        className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        Soyad
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, lastName: e.target.value })
                                        }
                                        className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    E-posta Adresi
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.email}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, email: e.target.value })
                                    }
                                    className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                                    <span>Yeni Şifre Belirle</span>
                                    <span className="text-[11px] text-slate-400 font-normal">
                                        Değiştirmek istemiyorsanız boş bırakın
                                    </span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Yeni şifre (min 6 karakter)"
                                    value={editForm.password}
                                    onChange={(e) =>
                                        setEditForm({ ...editForm, password: e.target.value })
                                    }
                                    className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    Yetki Seviyesi (Rol)
                                </label>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {(['USER', 'ADMIN', 'SUPERADMIN'] as const).map((r) => {
                                        const conf = USER_TYPE_CONFIG[r];
                                        const Icon = conf.icon;
                                        const isSelected = editForm.type === r;

                                        return (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, type: r })}
                                                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                                                    isSelected
                                                        ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30 text-purple-600 dark:text-purple-400 font-bold'
                                                        : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                <Icon size={18} className={isSelected ? 'text-purple-500' : 'text-slate-400'} />
                                                <span className="text-xs font-bold">{conf.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        Hesap Durumu
                                    </label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, status: e.target.value })
                                        }
                                        className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="locked">Kilitli</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        Tenant / Mağaza
                                    </label>
                                    <select
                                        value={editForm.tenantId}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, tenantId: e.target.value })
                                        }
                                        className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500"
                                    >
                                        <option value="">Platform Düzeyi</option>
                                        {tenantsList.map((t: any) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateUserMutation.isPending}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                                >
                                    {updateUserMutation.isPending ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Kaydediliyor...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            <span>Değişiklikleri Kaydet</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
