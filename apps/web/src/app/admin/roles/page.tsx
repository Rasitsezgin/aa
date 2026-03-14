"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Shield, Plus, Edit, Trash2, Save, X, Users, CheckSquare,
    Loader2, AlertTriangle, ChevronDown, ChevronRight,
    Package, Settings, ShoppingBag, BarChart3,
    CreditCard, Globe, Sparkles
} from 'lucide-react';

const roleSchema = z.object({
    name: z.string().min(2, 'En az 2 karakter').max(50, 'En fazla 50 karakter'),
    description: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'En az 1 izin seçin'),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    _count?: {
        users: number;
    };
}

const PERMISSION_GROUPS = [
    {
        group: 'Ürün Yönetimi', icon: Package,
        permissions: [
            { key: 'product:read', label: 'Ürünleri Görüntüle' },
            { key: 'product:create', label: 'Ürün Ekle' },
            { key: 'product:update', label: 'Ürün Düzenle' },
            { key: 'product:delete', label: 'Ürün Sil' },
        ],
    },
    {
        group: 'Sipariş Yönetimi', icon: ShoppingBag,
        permissions: [
            { key: 'order:read', label: 'Siparişleri Görüntüle' },
            { key: 'order:update', label: 'Sipariş Güncelle' },
            { key: 'order:cancel', label: 'Sipariş İptal' },
            { key: 'order:refund', label: 'İade / İptal' },
        ],
    },
    {
        group: 'Finans', icon: CreditCard,
        permissions: [
            { key: 'finance:read', label: 'Finansı Görüntüle' },
            { key: 'finance:export', label: 'Rapor Dışa Aktar' },
            { key: 'finance:manage', label: 'Fatura Yönetimi' },
        ],
    },
    {
        group: 'Kullanıcı Yönetimi', icon: Users,
        permissions: [
            { key: 'user:read', label: 'Kullanıcıları Görüntüle' },
            { key: 'user:create', label: 'Kullanıcı Ekle' },
            { key: 'user:update', label: 'Kullanıcı Düzenle' },
            { key: 'user:delete', label: 'Kullanıcı Sil' },
        ],
    },
    {
        group: 'Entegrasyonlar', icon: Globe,
        permissions: [
            { key: 'integration:read', label: 'Entegrasyonları Görüntüle' },
            { key: 'integration:manage', label: 'Entegrasyon Yönet' },
        ],
    },
    {
        group: 'Raporlar & Analitik', icon: BarChart3,
        permissions: [
            { key: 'analytics:read', label: 'Raporları Görüntüle' },
            { key: 'analytics:export', label: 'Rapor Dışa Aktar' },
        ],
    },
    {
        group: 'Sistem Ayarları', icon: Settings,
        permissions: [
            { key: 'settings:read', label: 'Ayarları Görüntüle' },
            { key: 'settings:manage', label: 'Ayarları Yönet' },
            { key: 'settings:backup', label: 'Yedekleme Yönet' },
        ],
    },
    {
        group: 'AI & Otomasyon', icon: Sparkles,
        permissions: [
            { key: 'ai:read', label: 'AI Önerilerini Gör' },
            { key: 'ai:manage', label: 'AI Ayarlarını Yönet' },
        ],
    },
];

export default function RolesPage() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const { data: roles, isLoading, error } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminApi.getRoles(),
    });

    const createMutation = useMutation({
        mutationFn: (data: RoleFormData) => adminApi.createRole(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            setIsCreating(false);
            createForm.reset();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: RoleFormData }) => adminApi.updateRole(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
            setEditingRole(null);
            editForm.reset();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminApi.deleteRole(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-roles'] }),
    });

    const createForm = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: { name: '', description: '', permissions: [] },
    });

    const editForm = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
    });

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
    };

    const onCreateSubmit = (data: RoleFormData) => createMutation.mutate(data);
    const onEditSubmit = (data: RoleFormData) => {
        if (editingRole) updateMutation.mutate({ id: editingRole.id, data });
    };

    const startEdit = (role: Role) => {
        setEditingRole(role);
        editForm.reset({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || [],
        });
        setExpandedGroups(PERMISSION_GROUPS.map(g => g.group));
    };

    const rolesList = Array.isArray(roles) ? roles : [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Rol ve İzin Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Roller oluşturun, izinleri yönetin ve erişim kontrolü sağlayın</p>
                </div>
                <button
                    onClick={() => { setIsCreating(true); setExpandedGroups(PERMISSION_GROUPS.map(g => g.group)); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={16} /> Yeni Rol Oluştur
                </button>
            </div>

            {/* Create Role Form */}
            {isCreating && (
                <RoleForm
                    form={createForm}
                    onSubmit={onCreateSubmit}
                    onCancel={() => { setIsCreating(false); createForm.reset(); }}
                    isPending={createMutation.isPending}
                    title="Yeni Rol Oluştur"
                    expandedGroups={expandedGroups}
                    toggleGroup={toggleGroup}
                />
            )}

            {/* Edit Role Form */}
            {editingRole && (
                <RoleForm
                    form={editForm}
                    onSubmit={onEditSubmit}
                    onCancel={() => { setEditingRole(null); editForm.reset(); }}
                    isPending={updateMutation.isPending}
                    title={`Rol Düzenle: ${editingRole.name}`}
                    expandedGroups={expandedGroups}
                    toggleGroup={toggleGroup}
                />
            )}

            {/* Roles List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-500 font-bold">Roller yüklenirken hata oluştu</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rolesList.map((role: Role) => (
                        <div key={role.id} className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                                            <Shield size={20} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground">{role.name}</h3>
                                            <p className="text-xs text-slate-500">{role.description || 'Açıklama yok'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Permission badges */}
                                <div className="flex flex-wrap gap-1.5">
                                    {(role.permissions || []).slice(0, 6).map((perm: string) => (
                                        <span key={perm} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500">
                                            {perm}
                                        </span>
                                    ))}
                                    {(role.permissions || []).length > 6 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                            +{role.permissions.length - 6} daha
                                        </span>
                                    )}
                                </div>

                                {/* User count */}
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Users size={12} />
                                    <span>{role._count?.users || 0} kullanıcı bu rolde</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-slate-200 dark:border-white/5 p-3 flex gap-2">
                                <button
                                    onClick={() => startEdit(role)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                >
                                    <Edit size={14} /> Düzenle
                                </button>
                                <button
                                    onClick={() => { if (confirm(`"${role.name}" rolünü silmek istediğinize emin misiniz?`)) deleteMutation.mutate(role.id); }}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 size={14} /> Sil
                                </button>
                            </div>
                        </div>
                    ))}

                    {rolesList.length === 0 && !isCreating && (
                        <div className="col-span-full text-center py-20">
                            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold text-lg">Henüz rol tanımlanmamış</p>
                            <p className="text-sm text-slate-400 mt-1">Yukarıdaki &quot;Yeni Rol Oluştur&quot; butonunu kullanın</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function RoleForm({ form, onSubmit, onCancel, isPending, title, expandedGroups, toggleGroup }: {
    form: import('react-hook-form').UseFormReturn<RoleFormData>; onSubmit: (data: RoleFormData) => void; onCancel: () => void;
    isPending: boolean; title: string; expandedGroups: string[]; toggleGroup: (g: string) => void;
}) {
    const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
    const selectedPermissions = watch('permissions') || [];

    const togglePermission = (key: string) => {
        const current = selectedPermissions;
        const updated = current.includes(key) ? current.filter((p: string) => p !== key) : [...current, key];
        setValue('permissions', updated, { shouldValidate: true });
    };

    const toggleGroupAll = (permissions: { key: string }[]) => {
        const keys = permissions.map(p => p.key);
        const allSelected = keys.every(k => selectedPermissions.includes(k));
        if (allSelected) {
            setValue('permissions', selectedPermissions.filter((p: string) => !keys.includes(p)), { shouldValidate: true });
        } else {
            const merged = [...new Set([...selectedPermissions, ...keys])];
            setValue('permissions', merged, { shouldValidate: true });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                    <Shield size={20} className="text-blue-500" /> {title}
                </h3>
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Rol Adı *</label>
                        <input {...register('name')} placeholder="Örn: Mağaza Yöneticisi" className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Açıklama</label>
                        <input {...register('description')} placeholder="Bu rolün kısa açıklaması" className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50" />
                    </div>
                </div>

                {/* Permission Groups */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">İzinler *</label>
                        <span className="text-xs font-bold text-blue-500">{selectedPermissions.length} izin seçili</span>
                    </div>
                    {errors.permissions && <p className="text-red-500 text-xs mb-2">{errors.permissions.message}</p>}

                    <div className="space-y-2">
                        {PERMISSION_GROUPS.map((group) => {
                            const GroupIcon: import('lucide-react').LucideIcon = group.icon as any;
                            const isExpanded = expandedGroups.includes(group.group);
                            const groupKeys = group.permissions.map(p => p.key);
                            const selectedCount = groupKeys.filter(k => selectedPermissions.includes(k)).length;
                            const allSelected = selectedCount === groupKeys.length;

                            return (
                                <div key={group.group} className="border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.group)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <GroupIcon size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-foreground">{group.group}</span>
                                            {selectedCount > 0 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                                    {selectedCount}/{groupKeys.length}
                                                </span>
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                    </button>
                                    {isExpanded && (
                                        <div className="p-3 pt-0 space-y-1 border-t border-slate-200 dark:border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => toggleGroupAll(group.permissions)}
                                                className="text-xs font-bold text-blue-500 hover:text-blue-600 mb-2"
                                            >
                                                {allSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                                            </button>
                                            {group.permissions.map(perm => (
                                                <label
                                                    key={perm.key}
                                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.includes(perm.key)}
                                                        onChange={() => togglePermission(perm.key)}
                                                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-foreground font-medium">{perm.label}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono ml-auto">{perm.key}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-white/5">
                    <button type="button" onClick={onCancel} className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface/80">
                        İptal
                    </button>
                    <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 disabled:opacity-50">
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}
