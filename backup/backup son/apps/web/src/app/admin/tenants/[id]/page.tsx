"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ArrowLeft, Building2, Users, ShoppingBag, Package, CreditCard,
    Globe, Calendar, Clock, Edit, Save, X, Trash2, Mail, Phone,
    MapPin, Crown, Sparkles, Tag, CheckCircle, AlertTriangle,
    Activity, ExternalLink, Shield, Settings, BarChart3, Loader2, LucideIcon
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    type: 'SUPERADMIN' | 'ADMIN' | 'USER';
    twoFactorEnabled: boolean;
}

interface Integration {
    id: string;
    platform: string;
    shopName?: string;
    isActive: boolean;
}

const tenantSchema = z.object({
    name: z.string().min(2, 'En az 2 karakter'),
    domain: z.string().optional(),
    plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
    taxOffice: z.string().optional(),
    taxNumber: z.string().optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

const PLAN_CONFIG = {
    FREE: { label: 'Ücretsiz', color: 'slate', icon: Tag, bgClass: 'bg-slate-500/10', textClass: 'text-slate-400' },
    PRO: { label: 'Pro', color: 'blue', icon: Sparkles, bgClass: 'bg-blue-500/10', textClass: 'text-blue-400' },
    ENTERPRISE: { label: 'Kurumsal', color: 'purple', icon: Crown, bgClass: 'bg-purple-500/10', textClass: 'text-purple-400' },
};

export default function TenantDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const tenantIdParam = params?.id;
    const tenantId = Array.isArray(tenantIdParam) ? tenantIdParam[0] : tenantIdParam ?? '';
    const [isEditing, setIsEditing] = useState(false);

    const { data: tenant, isLoading, error } = useQuery({
        queryKey: ['tenant', tenantId],
        queryFn: () => adminApi.getTenantDetail(tenantId),
    });

    const updateMutation = useMutation({
        mutationFn: (data: TenantFormData) => adminApi.updateTenant(tenantId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
            setIsEditing(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => adminApi.deleteTenant(tenantId),
        onSuccess: () => router.push('/admin/tenants'),
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm<TenantFormData>({
        resolver: zodResolver(tenantSchema),
        values: tenant ? {
            name: tenant.name || '',
            domain: tenant.domain || '',
            plan: tenant.plan || 'FREE',
            taxOffice: tenant.taxOffice || '',
            taxNumber: tenant.taxNumber || '',
        } : undefined,
    });

    const onSubmit = (data: TenantFormData) => updateMutation.mutate(data);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                    <p className="text-slate-500 font-medium">Kiracı bilgileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                    <p className="text-red-500 font-bold text-lg">Kiracı bulunamadı</p>
                    <button onClick={() => router.push('/admin/tenants')} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm">
                        Geri Dön
                    </button>
                </div>
            </div>
        );
    }

    const planConfig = PLAN_CONFIG[tenant.plan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.FREE;
    const PlanIcon = planConfig.icon;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.push('/admin/tenants')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                    <ArrowLeft size={20} className="text-slate-500" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">{tenant.name}</h1>
                        <div className={`px-3 py-1 rounded-full ${planConfig.bgClass} border border-current/20`}>
                            <span className={`text-xs font-bold ${planConfig.textClass} flex items-center gap-1`}>
                                <PlanIcon size={12} /> {planConfig.label}
                            </span>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium text-sm mt-1">ID: {tenant.id}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50">
                                {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
                            </button>
                            <button onClick={() => { setIsEditing(false); reset(); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface/80">
                                <X size={16} /> İptal
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600">
                                <Edit size={16} /> Düzenle
                            </button>
                            <button onClick={() => { if (confirm('Bu kiracıyı silmek istediğinize emin misiniz?')) deleteMutation.mutate(); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/20">
                                <Trash2 size={16} /> Sil
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Kullanıcı', value: tenant._count?.users || tenant.users?.length || 0, icon: Users, color: 'blue' },
                    { label: 'Ürün', value: tenant._count?.products || 0, icon: Package, color: 'purple' },
                    { label: 'Sipariş', value: tenant._count?.orders || 0, icon: ShoppingBag, color: 'emerald' },
                    { label: 'Aylık Gelir', value: formatCurrency(tenant.settings?.config?.monthlyRevenue || 0), icon: CreditCard, color: 'amber' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-xl bg-${stat.color}-500/10`}>
                                <stat.icon size={18} className={`text-${stat.color}-500`} />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-black text-foreground">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Tenant Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Building2 size={18} className="text-blue-500" /> Genel Bilgiler
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {isEditing ? (
                                <form className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">İşletme Adı</label>
                                        <input {...register('name')} className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50" />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Domain</label>
                                        <input {...register('domain')} className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Plan</label>
                                            <select {...register('plan')} className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50">
                                                <option value="FREE">Ücretsiz</option>
                                                <option value="PRO">Pro</option>
                                                <option value="ENTERPRISE">Kurumsal</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Vergi Dairesi</label>
                                            <input {...register('taxOffice')} className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Vergi No</label>
                                        <input {...register('taxNumber')} className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-foreground outline-none focus:border-blue-500/50" />
                                    </div>
                                </form>
                            ) : (
                                <div className="grid grid-cols-2 gap-y-4">
                                    <InfoRow icon={Building2} label="İşletme" value={tenant.name} />
                                    <InfoRow icon={Globe} label="Domain" value={tenant.domain || '—'} />
                                    <InfoRow icon={Mail} label="Slug" value={tenant.slug || '—'} />
                                    <InfoRow icon={Calendar} label="Kayıt Tarihi" value={formatDate(tenant.createdAt)} />
                                    <InfoRow icon={Settings} label="Vergi Dairesi" value={tenant.taxOffice || '—'} />
                                    <InfoRow icon={CreditCard} label="Vergi No" value={tenant.taxNumber || '—'} />
                                    <InfoRow icon={CheckCircle} label="Onboarded" value={tenant.isOnboarded ? 'Evet' : 'Hayır'} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                <Users size={18} className="text-purple-500" /> Kullanıcılar
                            </h3>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">
                                {tenant.users?.length || 0} kişi
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Ad Soyad</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">E-posta</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Tür</th>
                                        <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">2FA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {(tenant.users || []).map((user: User) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 font-bold text-foreground text-sm">{user.name || '—'}</td>
                                            <td className="p-4 text-slate-500 text-sm">{user.email}</td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.type === 'SUPERADMIN' ? 'bg-red-500/10 text-red-500' :
                                                        user.type === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                                                            'bg-blue-500/10 text-blue-500'
                                                    }`}>{user.type}</span>
                                            </td>
                                            <td className="p-4">
                                                {user.twoFactorEnabled ? (
                                                    <Shield size={16} className="text-green-500" />
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!tenant.users || tenant.users.length === 0) && (
                                        <tr><td colSpan={4} className="p-8 text-center text-slate-400 text-sm">Henüz kullanıcı yok</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-6 space-y-3">
                        <h3 className="font-bold text-foreground text-sm mb-4">Hızlı İşlemler</h3>
                        {[
                            { label: 'Mağazaya Git', icon: ExternalLink, color: 'blue' },
                            { label: 'Plan Yükselt', icon: Crown, color: 'purple' },
                            { label: 'Kullanıcı Ekle', icon: Users, color: 'emerald' },
                            { label: 'Aktivite Logları', icon: Activity, color: 'amber' },
                        ].map((action, idx) => (
                            <button key={idx} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                                <div className={`p-2 rounded-lg bg-${action.color}-500/10`}>
                                    <action.icon size={16} className={`text-${action.color}-500`} />
                                </div>
                                <span className="text-sm font-bold text-foreground">{action.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Integrations */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-6">
                        <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                            <Globe size={16} className="text-emerald-500" /> Entegrasyonlar
                        </h3>
                        {tenant.integrations && tenant.integrations.length > 0 ? (
                            <div className="space-y-2">
                                {tenant.integrations.map((intg: Integration) => (
                                    <div key={intg.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl">
                                        <div>
                                            <div className="text-sm font-bold text-foreground">{intg.platform}</div>
                                            <div className="text-xs text-slate-500">{intg.shopName || '—'}</div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${intg.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Henüz entegrasyon yok</p>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm p-6">
                        <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-blue-500" /> Zaman Çizelgesi
                        </h3>
                        <div className="space-y-4">
                            <TimelineItem label="Oluşturuldu" date={formatDate(tenant.createdAt)} />
                            <TimelineItem label="Son Güncelleme" date={formatDate(tenant.updatedAt)} />
                            {tenant.isOnboarded && <TimelineItem label="Onboarding Tamamlandı" date="✓" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <Icon size={14} className="text-slate-400 mt-0.5" />
            <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
                <div className="text-sm font-bold text-foreground">{value}</div>
            </div>
        </div>
    );
}

function TimelineItem({ label, date }: { label: string; date: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="flex-1">
                <div className="text-xs font-bold text-slate-500">{label}</div>
                <div className="text-sm font-bold text-foreground">{date}</div>
            </div>
        </div>
    );
}
