"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search, AlertTriangle, CheckCircle, Mail,
    Plus, Download, Users, Building2, CreditCard,
    Clock, Eye, Edit, Power,
    Package, Sparkles, Crown, Star, Activity, ArrowUpRight, ArrowDownRight,
    Settings, X, ExternalLink, Phone, MapPin, Tag
} from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    plan: 'FREE' | 'PRO' | 'ENTERPRISE';
    status: 'active' | 'trial' | 'suspended' | 'cancelled';
    users: number;
    maxUsers: number;
    stores: number;
    products: number;
    monthlyRevenue: number;
    revenueChange: number;
    joinedAt: Date;
    lastActiveAt: Date;
    billingCycle: 'monthly' | 'yearly';
    moduleCount: number;
    totalModules: number;
    logo?: string;
    tags?: string[];
}

const PLAN_CONFIG = {
    FREE: { label: 'Ücretsiz', color: 'slate', icon: Tag, bgClass: 'bg-slate-500/10', textClass: 'text-slate-400', borderClass: 'border-slate-500/20' },
    PRO: { label: 'Pro', color: 'blue', icon: Sparkles, bgClass: 'bg-blue-500/10', textClass: 'text-blue-400', borderClass: 'border-blue-500/20' },
    ENTERPRISE: { label: 'Kurumsal', color: 'purple', icon: Crown, bgClass: 'bg-purple-500/10', textClass: 'text-purple-400', borderClass: 'border-purple-500/20' },
};

const STATUS_CONFIG = {
    active: { label: 'Aktif', color: 'green', icon: CheckCircle, bgClass: 'bg-green-500/10', textClass: 'text-green-400' },
    trial: { label: 'Deneme', color: 'yellow', icon: Clock, bgClass: 'bg-yellow-500/10', textClass: 'text-yellow-400' },
    suspended: { label: 'Askıda', color: 'red', icon: AlertTriangle, bgClass: 'bg-red-500/10', textClass: 'text-red-400' },
    cancelled: { label: 'İptal', color: 'slate', icon: X, bgClass: 'bg-slate-500/10', textClass: 'text-slate-400' },
};

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [currentTime] = useState(() => Date.now());

    useEffect(() => {
        async function fetchTenants() {
            try {
                const res = await fetch('/api/admin/tenants');
                if (!res.ok) throw new Error('Veri alınamadı');
                const data = await res.json();
                setTenants((data.tenants || data || []).map((t: any) => ({
                    ...t,
                    joinedAt: new Date(t.joinedAt || t.createdAt),
                    lastActiveAt: new Date(t.lastActiveAt || t.updatedAt || t.createdAt),
                })));
            } catch {
                setTenants([]);
            } finally {
                setLoading(false);
            }
        }
        fetchTenants();
    }, []);

    // Filtreleme ve sıralama
    const filteredTenants = useMemo(() => {
        return tenants
            .filter(t => {
                if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
                    !t.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (selectedPlan !== 'all' && t.plan !== selectedPlan) return false;
                if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
                return true;
            })
            .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
    }, [searchQuery, selectedPlan, selectedStatus, tenants]);

    // İstatistikler
    const stats = useMemo(() => ({
        total: tenants.length,
        active: tenants.filter(t => t.status === 'active').length,
        trial: tenants.filter(t => t.status === 'trial').length,
        suspended: tenants.filter(t => t.status === 'suspended').length,
        totalRevenue: tenants.reduce((acc, t) => acc + t.monthlyRevenue, 0),
        totalProducts: tenants.reduce((acc, t) => acc + t.products, 0),
        totalUsers: tenants.reduce((acc, t) => acc + t.users, 0),
        enterprise: tenants.filter(t => t.plan === 'ENTERPRISE').length,
        pro: tenants.filter(t => t.plan === 'PRO').length,
    }), [tenants]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
    };

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 5) return 'Şimdi aktif';
        if (minutes < 60) return `${minutes} dakika önce`;
        if (hours < 24) return `${hours} saat önce`;
        return `${days} gün önce`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            )}
            {!loading && <>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Kiracı Yönetimi</h1>
                        <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                            <span className="text-sm font-bold text-primary">{stats.total} İşletme</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Platformdaki tüm işletmeleri yönetin</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <Download size={16} /> Dışa Aktar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Plus size={16} /> Yeni Kiracı
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Building2 size={20} className="text-primary" />
                        <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                            <ArrowUpRight size={12} /> +12%
                        </span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.total}</div>
                    <p className="text-xs text-slate-500 mt-1">Toplam Kiracı</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <CreditCard size={20} className="text-green-500" />
                        <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                            <ArrowUpRight size={12} /> +18%
                        </span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-slate-500 mt-1">Aylık Gelir</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Users size={20} className="text-blue-500" />
                        <span className="text-xs font-bold text-slate-500">{stats.active} Aktif</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.totalUsers}</div>
                    <p className="text-xs text-slate-500 mt-1">Toplam Kullanıcı</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Crown size={20} className="text-purple-500" />
                        <span className="text-xs font-bold text-purple-500">{stats.enterprise} Kurumsal</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.pro + stats.enterprise}</div>
                    <p className="text-xs text-slate-500 mt-1">Ücretli Paket</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Package size={20} className="text-orange-500" />
                        <span className="text-xs font-bold text-orange-500">Katalog</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{(stats.totalProducts / 1000).toFixed(1)}K</div>
                    <p className="text-xs text-slate-500 mt-1">Toplam Ürün</p>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Şirket adı veya email ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>

                {/* Plan Filter */}
                <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
                    <button
                        onClick={() => setSelectedPlan('all')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            selectedPlan === 'all' ? 'bg-primary text-white' : 'text-slate-500 hover:text-foreground'
                        }`}
                    >
                        Tümü
                    </button>
                    {Object.entries(PLAN_CONFIG).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedPlan(key)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                selectedPlan === key ? `${config.bgClass} ${config.textClass}` : 'text-slate-500 hover:text-foreground'
                            }`}
                        >
                            <config.icon size={12} /> {config.label}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
                    <button
                        onClick={() => setSelectedStatus('all')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            selectedStatus === 'all' ? 'bg-primary text-white' : 'text-slate-500 hover:text-foreground'
                        }`}
                    >
                        Tüm Durum
                    </button>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedStatus(key)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                selectedStatus === key ? `${config.bgClass} ${config.textClass}` : 'text-slate-500 hover:text-foreground'
                            }`}
                        >
                            <config.icon size={12} /> {config.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Table */}
                <div className="xl:col-span-3">
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-surface">
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">İşletme</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Plan</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Durum</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Kullanıcı</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Gelir</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Son Aktif</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredTenants.map((tenant, idx) => {
                                        const planConfig = PLAN_CONFIG[tenant.plan];
                                        const statusConfig = STATUS_CONFIG[tenant.status];

                                        return (
                                            <motion.tr
                                                key={tenant.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`group hover:bg-white/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                                                    selectedTenant?.id === tenant.id ? 'bg-primary/5' : ''
                                                }`}
                                                onClick={() => setSelectedTenant(tenant)}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center text-lg font-black text-primary">
                                                            {tenant.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-foreground flex items-center gap-2">
                                                                {tenant.name}
                                                                {tenant.tags?.includes('VIP') && (
                                                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Mail size={10} /> {tenant.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${planConfig.bgClass} ${planConfig.textClass} ${planConfig.borderClass} border`}>
                                                        <planConfig.icon size={10} /> {planConfig.label}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <statusConfig.icon size={14} className={statusConfig.textClass} />
                                                        <span className={`text-xs font-bold ${statusConfig.textClass}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Users size={14} className="text-slate-500" />
                                                        <span className="text-sm font-medium text-foreground">
                                                            {tenant.users}/{tenant.maxUsers}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-foreground">
                                                            {formatCurrency(tenant.monthlyRevenue)}
                                                        </span>
                                                        {tenant.revenueChange !== 0 && (
                                                            <span className={`text-[10px] font-bold flex items-center ${tenant.revenueChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                {tenant.revenueChange > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                                {Math.abs(tenant.revenueChange)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Activity size={14} className={
                                                            tenant.lastActiveAt.getTime() > currentTime - 300000 ? 'text-green-500' : 'text-slate-500'
                                                        } />
                                                        <span className="text-xs text-slate-500">
                                                            {formatRelativeTime(tenant.lastActiveAt)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 hover:bg-primary/20 rounded-lg text-slate-500 hover:text-primary transition-colors">
                                                            <Eye size={14} />
                                                        </button>
                                                        <button className="p-2 hover:bg-blue-500/20 rounded-lg text-slate-500 hover:text-blue-500 transition-colors">
                                                            <Edit size={14} />
                                                        </button>
                                                        <button className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors">
                                                            <Power size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {filteredTenants.length === 0 && (
                            <div className="p-12 text-center">
                                <Building2 size={48} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="text-lg font-bold text-foreground mb-2">Kiracı Bulunamadı</h3>
                                <p className="text-sm text-slate-500">Arama kriterlerinize uygun kiracı yok</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="xl:col-span-1">
                    <div className="sticky top-24">
                        {selectedTenant ? (
                            <motion.div
                                key={selectedTenant.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-surface border border-border rounded-2xl overflow-hidden"
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-purple-500/10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-black text-white">
                                            {selectedTenant.name[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-black text-foreground">{selectedTenant.name}</h3>
                                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${PLAN_CONFIG[selectedTenant.plan].textClass}`}>
                                                {React.createElement(PLAN_CONFIG[selectedTenant.plan].icon, { size: 10 })}
                                                {PLAN_CONFIG[selectedTenant.plan].label} Plan
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${STATUS_CONFIG[selectedTenant.status].bgClass}`}>
                                        {React.createElement(STATUS_CONFIG[selectedTenant.status].icon, { 
                                            size: 14, 
                                            className: STATUS_CONFIG[selectedTenant.status].textClass 
                                        })}
                                        <span className={`text-xs font-bold ${STATUS_CONFIG[selectedTenant.status].textClass}`}>
                                            {STATUS_CONFIG[selectedTenant.status].label}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Mail size={14} className="text-slate-500" />
                                            <span className="text-slate-500 dark:text-slate-400">{selectedTenant.email}</span>
                                        </div>
                                        {selectedTenant.phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone size={14} className="text-slate-500" />
                                                <span className="text-slate-500 dark:text-slate-400">{selectedTenant.phone}</span>
                                            </div>
                                        )}
                                        {selectedTenant.address && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin size={14} className="text-slate-500" />
                                                <span className="text-slate-500 dark:text-slate-400">{selectedTenant.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {selectedTenant.tags && selectedTenant.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {selectedTenant.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                                        <div className="text-center p-3 bg-background rounded-xl">
                                            <div className="text-xl font-black text-foreground">{selectedTenant.users}</div>
                                            <div className="text-[10px] text-slate-500">Kullanıcı</div>
                                        </div>
                                        <div className="text-center p-3 bg-background rounded-xl">
                                            <div className="text-xl font-black text-foreground">{selectedTenant.stores}</div>
                                            <div className="text-[10px] text-slate-500">Mağaza</div>
                                        </div>
                                        <div className="text-center p-3 bg-background rounded-xl">
                                            <div className="text-xl font-black text-foreground">{(selectedTenant.products / 1000).toFixed(1)}K</div>
                                            <div className="text-[10px] text-slate-500">Ürün</div>
                                        </div>
                                        <div className="text-center p-3 bg-background rounded-xl">
                                            <div className="text-xl font-black text-foreground">{selectedTenant.moduleCount}</div>
                                            <div className="text-[10px] text-slate-500">Modül</div>
                                        </div>
                                    </div>

                                    {/* Module Progress */}
                                    <div className="pt-4">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-slate-500">Modül Kullanımı</span>
                                            <span className="font-bold text-foreground">{selectedTenant.moduleCount}/{selectedTenant.totalModules}</span>
                                        </div>
                                        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                                style={{ width: `${(selectedTenant.moduleCount / selectedTenant.totalModules) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="pt-4 border-t border-border text-xs space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Kayıt Tarihi</span>
                                            <span className="font-medium text-foreground">
                                                {selectedTenant.joinedAt.toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Son Aktivite</span>
                                            <span className="font-medium text-foreground">
                                                {formatRelativeTime(selectedTenant.lastActiveAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Faturalama</span>
                                            <span className="font-medium text-foreground capitalize">
                                                {selectedTenant.billingCycle === 'yearly' ? 'Yıllık' : 'Aylık'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 border-t border-border grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
                                        <Settings size={14} /> Yönet
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-colors">
                                        <ExternalLink size={14} /> Panele Git
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-surface border border-border rounded-2xl p-8 text-center"
                            >
                                <Building2 size={48} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="text-lg font-bold text-foreground mb-2">Kiracı Seçin</h3>
                                <p className="text-sm text-slate-500">
                                    Detayları görüntülemek için listeden bir kiracı seçin
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
            </>}
        </div>
    );
}
