"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useShipping } from '@/lib/hooks';
import {
    Truck,
    Package,
    MapPin,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Settings,
    Plus,
    Edit3,
    Trash2,
    Calculator,
    Globe,
    Building2,
    ArrowRight,
    Star,
    Percent,
    RefreshCw,
    FileText,
    ChevronDown
} from 'lucide-react';

const shippingZones: any[] = [];
const shippingRules: any[] = [];

export default function ShippingPage() {
    const [activeTab, setActiveTab] = useState('companies');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

    // API hook
    const { shipments: apiShipments, providers: apiProviders, loading, error, fetchShipments, fetchProviders } = useShipping();

    // API verilerini göster
    const shippingCompanies = (Array.isArray(apiProviders) && apiProviders.length > 0)
        ? apiProviders.map((p, i) => ({
            id: Number(p.id) || i + 1,
            name: p.name,
            logo: p.logo || '📦',
            status: p.isActive ? 'active' : 'inactive',
            defaultRate: p.pricePerKg || 0,
            freeShippingMin: 0,
            avgDelivery: `${p.avgDeliveryDays} gün`,
            rating: p.rating || 0,
            integrationStatus: p.isActive ? 'connected' : 'disconnected',
            todayShipments: 0,
            totalShipments: 0
        }))
        : [];

    const activeCompanies = shippingCompanies.filter(c => c.status === 'active').length;
    const todayShipments = shippingCompanies.reduce((sum, c) => sum + c.todayShipments, 0);
    const avgDeliveryRating = shippingCompanies.length > 0
        ? (shippingCompanies.reduce((sum, c) => sum + c.rating, 0) / shippingCompanies.length).toFixed(1)
        : '--';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Kargo verileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <Truck className="w-8 h-8 text-cyan-500" />
                        Kargo Ayarları
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Kargo entegrasyonları ve gönderim ayarları
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-foreground transition-all"
                    >
                        <Calculator className="w-4 h-4" />
                        Kargo Hesapla
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 rounded-xl text-white text-sm font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Kargo Firması Ekle
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 dark:from-cyan-900/40 dark:to-cyan-800/20 rounded-2xl p-5 border border-cyan-500/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-cyan-500/20 rounded-xl">
                            <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Aktif Kargo Firması</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{activeCompanies}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl p-5 border border-blue-500/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl">
                            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Bugünkü Gönderim</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{todayShipments}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-2xl p-5 border border-yellow-500/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-yellow-500/20 rounded-xl">
                            <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Ortalama Puan</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{avgDeliveryRating}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-900/40 dark:to-green-800/20 rounded-2xl p-5 border border-green-500/20"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-green-500/20 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Teslimat Başarısı</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">96.8%</div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border">
                {['companies', 'zones', 'rules'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
                            activeTab === tab
                                ? 'text-cyan-600 dark:text-cyan-400 border-cyan-500'
                                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-foreground'
                        }`}
                    >
                        {tab === 'companies' && 'Kargo Firmaları'}
                        {tab === 'zones' && 'Bölge Ayarları'}
                        {tab === 'rules' && 'Kargo Kuralları'}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'companies' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {shippingCompanies.map((company, index) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-surface rounded-2xl p-5 border ${
                                company.status === 'active' ? 'border-border' : 'border-border opacity-60'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-4xl">{company.logo}</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">{company.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                company.integrationStatus === 'connected'
                                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                            }`}>
                                                {company.integrationStatus === 'connected' ? 'Bağlı' : 'Bağlı Değil'}
                                            </span>
                                            <span className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                                <Star className="w-3 h-3 fill-yellow-500" />
                                                {company.rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-500 hover:text-foreground hover:bg-surface rounded-lg transition-colors">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-3 bg-background rounded-xl border border-border">
                                    <div className="text-xs text-slate-500 mb-1">Varsayılan Ücret</div>
                                    <div className="text-lg font-bold text-foreground">₺{company.defaultRate}</div>
                                </div>
                                <div className="p-3 bg-background rounded-xl border border-border">
                                    <div className="text-xs text-slate-500 mb-1">Ücretsiz Kargo</div>
                                    <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">₺{company.freeShippingMin}+</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4 text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {company.avgDelivery}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        Bugün: {company.todayShipments}
                                    </span>
                                </div>
                                <button className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold">
                                    Detaylar
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'zones' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface rounded-2xl border border-border overflow-hidden"
                >
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-cyan-500" />
                            Bölge Bazlı Kargo Ücretleri
                        </h2>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-slate-600 dark:text-slate-300 hover:text-foreground text-sm font-bold transition-all">
                            <Plus className="w-4 h-4" />
                            Bölge Ekle
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background">
                                <tr>
                                    <th className="text-left p-4 text-slate-500 text-sm font-bold">Bölge</th>
                                    <th className="text-center p-4 text-slate-500 text-sm font-bold">İl Sayısı</th>
                                    <th className="text-right p-4 text-slate-500 text-sm font-bold">Taban Ücret</th>
                                    <th className="text-center p-4 text-slate-500 text-sm font-bold">Teslimat Süresi</th>
                                    <th className="text-center p-4 text-slate-500 text-sm font-bold">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {shippingZones.map((zone) => (
                                    <tr key={zone.id} className="hover:bg-background/50 transition-colors">
                                        <td className="p-4">
                                            <span className="text-foreground font-bold">{zone.name}</span>
                                        </td>
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-300">{zone.provinces}</td>
                                        <td className="p-4 text-right">
                                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">₺{zone.baseCost}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-background border border-border rounded-lg text-slate-600 dark:text-slate-300 text-sm">
                                                {zone.deliveryTime}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-1.5 text-slate-500 hover:text-foreground hover:bg-background rounded transition-colors">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {activeTab === 'rules' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shipping Rules */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface rounded-2xl border border-border p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Settings className="w-5 h-5 text-cyan-500" />
                                Kargo Kuralları
                            </h2>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 rounded-lg text-white text-sm font-bold hover:bg-cyan-700 transition-all">
                                <Plus className="w-4 h-4" />
                                Kural Ekle
                            </button>
                        </div>
                        <div className="space-y-3">
                            {shippingRules.map((rule) => (
                                <div
                                    key={rule.id}
                                    className={`p-4 rounded-xl border ${
                                        rule.active
                                            ? 'bg-background border-border'
                                            : 'bg-background/50 border-border opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-600'}`} />
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">{rule.name}</h3>
                                                <p className="text-xs text-slate-500">
                                                    Koşul: {rule.condition}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                rule.discount ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                            }`}>
                                                {rule.discount || rule.surcharge}
                                            </span>
                                            <button className={`relative w-10 h-5 rounded-full transition-colors ${
                                                rule.active ? 'bg-cyan-600' : 'bg-slate-300 dark:bg-slate-700'
                                            }`}>
                                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                                                    rule.active ? 'translate-x-5' : 'translate-x-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-surface rounded-2xl border border-border p-6"
                    >
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                            <Percent className="w-5 h-5 text-cyan-500" />
                            Hızlı Ayarlar
                        </h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-background rounded-xl border border-border">
                                <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2 font-medium">Ücretsiz Kargo Limiti</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        defaultValue={250}
                                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-cyan-500 focus:outline-none"
                                    />
                                    <span className="text-slate-500">₺</span>
                                </div>
                            </div>
                            <div className="p-4 bg-background rounded-xl border border-border">
                                <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2 font-medium">Varsayılan Kargo Firması</label>
                                <select className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-cyan-500 focus:outline-none">
                                    {shippingCompanies.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="p-4 bg-background rounded-xl border border-border">
                                <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2 font-medium">Otomatik Etiket Oluştur</label>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-300">Sipariş onaylandığında kargo etiketi oluştur</span>
                                    <button className="relative w-10 h-5 rounded-full bg-cyan-600 transition-colors">
                                        <span className="absolute top-0.5 translate-x-5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm" />
                                    </button>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-cyan-600 rounded-xl text-white font-bold hover:bg-cyan-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                                <RefreshCw className="w-4 h-4" />
                                Ayarları Kaydet
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
