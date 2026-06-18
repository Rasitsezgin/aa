"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '@/lib/admin-api';
import {
    Layers, Shield, Zap, Sparkles, Plus, Search, Filter,
    Package, Settings, Edit3, Trash2, Eye, EyeOff, Star, TrendingUp,
    Users, DollarSign, BarChart3, Clock, CheckCircle, XCircle, AlertTriangle,
    ChevronDown, ChevronRight, Save, X, RefreshCw, Download, Upload,
    Bot, Target, Image, Store, Globe, Boxes, Tags, Truck, Warehouse,
    CreditCard, Receipt, Megaphone, MessageSquare, FileText, LineChart, PieChart,
    LayoutDashboard, ShoppingCart, Crown, Gem, Award, ToggleRight
} from 'lucide-react';

// Modül kategorileri
const CATEGORIES = {
    AI_TOOLS: { name: 'AI Araçları', icon: Sparkles, color: 'purple' },
    ANALYTICS: { name: 'Analitik', icon: BarChart3, color: 'blue' },
    MARKETPLACE: { name: 'Pazaryeri', icon: Store, color: 'green' },
    FINANCE: { name: 'Finans', icon: CreditCard, color: 'yellow' },
    MARKETING: { name: 'Pazarlama', icon: Megaphone, color: 'pink' },
    LOGISTICS: { name: 'Lojistik', icon: Truck, color: 'orange' },
    AUTOMATION: { name: 'Otomasyon', icon: Zap, color: 'cyan' },
    REPORTS: { name: 'Raporlar', icon: FileText, color: 'slate' },
};

const PLAN_BADGES = {
    FREE: { name: 'Ücretsiz', color: 'slate', icon: Package },
    PRO: { name: 'Pro', color: 'blue', icon: Crown },
    ENTERPRISE: { name: 'Kurumsal', color: 'purple', icon: Gem },
};

// Demo modül verileri
const MODULES_DATA = [
    {
        id: '1', key: 'AI_ADVISOR', name: 'AI Danışman',
        description: 'Yapay zeka destekli kişisel iş danışmanınız. Satış stratejileri, fiyatlandırma önerileri ve pazar analizi.',
        icon: 'Bot', category: 'AI_TOOLS', monthlyPrice: 299, yearlyPrice: 2990, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: false, isNew: false,
        features: ['Gerçek zamanlı sohbet', 'Satış stratejileri', 'Fiyatlandırma analizi'],
        usageCount: 1240, activeUsers: 856, rating: 4.8, revenue: 254600,
    },
    {
        id: '2', key: 'AI_SEO', name: 'SEO Optimizasyonu',
        description: 'AI destekli ürün başlıkları, açıklamaları ve anahtar kelime optimizasyonu.',
        icon: 'Target', category: 'AI_TOOLS', monthlyPrice: 199, yearlyPrice: 1990, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: false, isNew: false,
        features: ['Otomatik başlık optimizasyonu', 'Anahtar kelime önerileri', 'SEO skor analizi'],
        usageCount: 2150, activeUsers: 1420, rating: 4.7, revenue: 189200,
    },
    {
        id: '3', key: 'AI_IMAGE', name: 'AI Görsel İşleme',
        description: 'Arka plan silme, görsel iyileştirme ve otomatik kırpma.',
        icon: 'Image', category: 'AI_TOOLS', monthlyPrice: 399, yearlyPrice: 3990, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: true, isNew: true,
        features: ['Arka plan silme', 'Görsel kalite artırma', 'Otomatik kırpma'],
        usageCount: 520, activeUsers: 340, rating: 4.5, revenue: 45800,
    },
    {
        id: '4', key: 'COMPETITOR_ANALYSIS', name: 'Rakip Analizi',
        description: 'Rakip fiyat takibi, stok durumu ve strateji analizi.',
        icon: 'TrendingUp', category: 'ANALYTICS', monthlyPrice: 249, yearlyPrice: 2490, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: false, isNew: false,
        features: ['Anlık fiyat takibi', 'Stok durumu izleme', 'Alarm sistemi'],
        usageCount: 1850, activeUsers: 1120, rating: 4.6, revenue: 167400,
    },
    {
        id: '5', key: 'PREDICTIONS', name: 'Satış Tahminleri',
        description: 'AI destekli satış ve stok tahminleri.',
        icon: 'PieChart', category: 'ANALYTICS', monthlyPrice: 299, yearlyPrice: 2990, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: false, isNew: false,
        features: ['Satış tahminleri', 'Stok optimizasyonu', 'Mevsimsel analiz'],
        usageCount: 980, activeUsers: 620, rating: 4.4, revenue: 124600,
    },
    {
        id: '6', key: 'STORE_MANAGEMENT', name: 'Mağaza Yönetimi',
        description: 'Tüm pazaryeri mağazalarınızı tek panelden yönetin.',
        icon: 'Store', category: 'MARKETPLACE', monthlyPrice: 0, requiredPlan: 'FREE',
        isCore: true, isActive: true, isBeta: false, isNew: false,
        features: ['Çoklu mağaza desteği', 'Merkezi ürün yönetimi'],
        usageCount: 5420, activeUsers: 4850, rating: 4.9, revenue: 0,
    },
    {
        id: '7', key: 'INTEGRATIONS', name: 'Entegrasyonlar',
        description: 'Trendyol, Amazon, Hepsiburada ve daha fazlası ile entegrasyon.',
        icon: 'Globe', category: 'MARKETPLACE', monthlyPrice: 0, requiredPlan: 'FREE',
        isCore: true, isActive: true, isBeta: false, isNew: false,
        features: ['Trendyol', 'Amazon', 'Hepsiburada', 'N11'],
        usageCount: 5120, activeUsers: 4650, rating: 4.8, revenue: 0,
    },
    {
        id: '8', key: 'BULK_ACTIONS', name: 'Toplu İşlemler',
        description: 'Binlerce ürünü tek seferde güncelleyin.',
        icon: 'Boxes', category: 'MARKETPLACE', monthlyPrice: 149, yearlyPrice: 1490, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: false, isNew: false,
        features: ['Toplu fiyat güncelleme', 'Excel import/export'],
        usageCount: 2340, activeUsers: 1890, rating: 4.6, revenue: 189200,
    },
    {
        id: '9', key: 'INVOICES', name: 'Fatura Yönetimi',
        description: 'Otomatik fatura oluşturma ve e-Fatura entegrasyonu.',
        icon: 'Receipt', category: 'FINANCE', monthlyPrice: 99, yearlyPrice: 990, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: false, isNew: false,
        features: ['Otomatik fatura', 'e-Fatura entegrasyonu'],
        usageCount: 1560, activeUsers: 1240, rating: 4.6, revenue: 82400,
    },
    {
        id: '10', key: 'SHIPPING', name: 'Kargo Yönetimi',
        description: 'Kargo firmalarını ve teslimat süreçlerini yönetin.',
        icon: 'Truck', category: 'LOGISTICS', monthlyPrice: 149, yearlyPrice: 1490, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: false, isNew: false,
        features: ['Çoklu kargo firması', 'Otomatik etiket'],
        usageCount: 1780, activeUsers: 1450, rating: 4.6, revenue: 145200,
    },
    {
        id: '11', key: 'INVENTORY', name: 'Stok Yönetimi',
        description: 'Merkezi stok yönetimi ve otomatik senkronizasyon.',
        icon: 'Warehouse', category: 'LOGISTICS', monthlyPrice: 0, requiredPlan: 'FREE',
        isCore: true, isActive: true, isBeta: false, isNew: false,
        features: ['Merkezi stok', 'Çoklu depo', 'Stok alarmları'],
        usageCount: 4980, activeUsers: 4520, rating: 4.8, revenue: 0,
    },
    {
        id: '12', key: 'CAMPAIGNS', name: 'Kampanya Yönetimi',
        description: 'Pazaryeri kampanyalarını tek panelden yönetin.',
        icon: 'Megaphone', category: 'MARKETING', monthlyPrice: 149, yearlyPrice: 1490, requiredPlan: 'PRO',
        isCore: false, isActive: true, isBeta: false, isNew: false,
        features: ['Kampanya oluşturma', 'A/B testi'],
        usageCount: 890, activeUsers: 560, rating: 4.4, revenue: 56200,
    },
];

const ICON_MAP: Record<string, any> = {
    Bot, Target, Image, TrendingUp, PieChart, Store, Globe, Boxes,
    Receipt, Megaphone, Truck, Warehouse, LineChart, BarChart3,
    Sparkles, Shield, Zap, Package, CreditCard, FileText, MessageSquare,
};

export default function ModuleManagement() {
    const [modules, setModules] = useState(MODULES_DATA);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showOnlyActive, setShowOnlyActive] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    useEffect(() => {
        async function loadModules() {
            try {
                const data = await adminApi.getModules();
                if (data.modules?.length) {
                    setModules(data.modules);
                }
            } catch {
                // Fallback: MODULES_DATA
            } finally {
                setLoading(false);
            }
        }
        void loadModules();
    }, []);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            await adminApi.updateModule(id, { isActive: !isActive });
            setModules((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: !isActive } : m)));
        } catch {
            // ignore
        }
    };

    const filteredModules = useMemo(() => {
        return modules.filter(mod => {
            if (searchQuery && !mod.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (selectedCategory && mod.category !== selectedCategory) return false;
            if (selectedPlan && mod.requiredPlan !== selectedPlan) return false;
            if (showOnlyActive && !mod.isActive) return false;
            return true;
        });
    }, [modules, searchQuery, selectedCategory, selectedPlan, showOnlyActive]);

    const stats = useMemo(() => {
        const totalRevenue = modules.reduce((sum, m) => sum + m.revenue, 0);
        const totalUsers = modules.reduce((sum, m) => sum + m.activeUsers, 0);
        const activeModules = modules.filter(m => m.isActive).length;
        const betaModules = modules.filter(m => m.isBeta).length;
        return { totalRevenue, totalUsers, activeModules, betaModules };
    }, [modules]);

    const toggleModuleStatus = (moduleId: string) => {
        setModules(prev => prev.map(m => m.id === moduleId ? { ...m, isActive: !m.isActive } : m));
    };

    const getCategoryColor = (category: string) => CATEGORIES[category as keyof typeof CATEGORIES]?.color || 'slate';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl">
                            <Layers size={28} className="text-white" />
                        </div>
                        Modül Yönetimi
                    </h1>
                    <p className="text-slate-600 dark:text-slate-500 font-medium mt-1">Platformdaki tüm modülleri yapılandırın ve yönetin</p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">
                        <Download size={16} /> Dışa Aktar
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-600/20">
                        <Plus size={18} /> Yeni Modül
                    </motion.button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 dark:bg-gradient-to-br dark:from-green-900/40 dark:to-green-800/20 rounded-2xl p-5 border border-green-200 dark:border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-xl"><DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Toplam Gelir</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">₺{stats.totalRevenue.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1"><TrendingUp size={12} /> Bu ay +12.5%</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-blue-50 dark:bg-gradient-to-br dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl"><Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Aktif Kullanıcı</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.totalUsers.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1"><TrendingUp size={12} /> Bu ay +8.3%</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-purple-50 dark:bg-gradient-to-br dark:from-purple-900/40 dark:to-purple-800/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl"><CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Aktif Modül</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.activeModules} / {modules.length}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.betaModules} beta modül</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-yellow-50 dark:bg-gradient-to-br dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-2xl p-5 border border-yellow-200 dark:border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-500/20 rounded-xl"><Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" /></div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Ort. Puan</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">4.6 / 5.0</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1"><Star size={12} fill="currentColor" /> 2,450 değerlendirme</div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[250px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <input type="text" placeholder="Modül ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50" />
                    </div>
                    <select value={selectedCategory || ''} onChange={(e) => setSelectedCategory(e.target.value || null)}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50">
                        <option value="">Tüm Kategoriler</option>
                        {Object.entries(CATEGORIES).map(([key, cat]) => (<option key={key} value={key}>{cat.name}</option>))}
                    </select>
                    <select value={selectedPlan || ''} onChange={(e) => setSelectedPlan(e.target.value || null)}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50">
                        <option value="">Tüm Planlar</option>
                        {Object.entries(PLAN_BADGES).map(([key, plan]) => (<option key={key} value={key}>{plan.name}</option>))}
                    </select>
                    <button onClick={() => setShowOnlyActive(!showOnlyActive)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${showOnlyActive ? 'bg-green-500/20 border-green-500/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                        {showOnlyActive ? <Eye size={16} /> : <EyeOff size={16} />} Sadece Aktif
                    </button>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}><Layers size={16} /></button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}><BarChart3 size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredModules.map((mod, index) => {
                        const IconComponent = ICON_MAP[mod.icon] || Package;
                        const color = getCategoryColor(mod.category);
                        return (
                            <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                                className={`bg-white dark:bg-slate-900/50 p-6 rounded-2xl border transition-all group hover:shadow-xl ${mod.isActive ? 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20' : 'border-red-300 dark:border-red-500/20 opacity-60'}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 bg-${color}-500/10 rounded-xl text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform`}>
                                            <IconComponent size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-foreground">{mod.name}</h3>
                                                {mod.isNew && <span className="px-1.5 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded">YENİ</span>}
                                                {mod.isBeta && <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold rounded">BETA</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs text-${color}-600 dark:text-${color}-400`}>{CATEGORIES[mod.category as keyof typeof CATEGORIES]?.name}</span>
                                                {mod.isCore && <span className="text-xs text-slate-500 flex items-center gap-1"><Shield size={10} /> Temel</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleModuleStatus(mod.id)} disabled={mod.isCore}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${mod.isCore ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : mod.isActive ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'}`}>
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${mod.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{mod.description}</p>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {mod.features.slice(0, 3).map((feature, i) => (
                                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">{feature}</span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-3 gap-3 py-4 border-t border-slate-200 dark:border-white/5">
                                    <div><div className="text-xs text-slate-500">Kullanıcı</div><div className="text-sm font-bold text-foreground">{mod.activeUsers.toLocaleString()}</div></div>
                                    <div><div className="text-xs text-slate-500">Puan</div><div className="text-sm font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1"><Star size={12} fill="currentColor" />{mod.rating}</div></div>
                                    <div><div className="text-xs text-slate-500">Gelir</div><div className="text-sm font-bold text-green-600 dark:text-green-400">{mod.revenue > 0 ? `₺${(mod.revenue / 1000).toFixed(0)}K` : '-'}</div></div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${mod.requiredPlan === 'FREE' ? 'bg-slate-500/20 text-slate-600 dark:text-slate-400' : mod.requiredPlan === 'PRO' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'}`}>
                                            {PLAN_BADGES[mod.requiredPlan as keyof typeof PLAN_BADGES]?.name}
                                        </span>
                                        {mod.monthlyPrice > 0 && <span className="text-xs font-bold text-foreground">₺{mod.monthlyPrice}/ay</span>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Eye size={14} /></button>
                                        <button className="p-2 text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Edit3 size={14} /></button>
                                        <button className="p-2 text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Settings size={14} /></button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="text-left p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">Modül</th>
                                    <th className="text-left p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">Kategori</th>
                                    <th className="text-left p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">Plan</th>
                                    <th className="text-right p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">Fiyat</th>
                                    <th className="text-right p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">Kullanıcı</th>
                                    <th className="text-right p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">Gelir</th>
                                    <th className="text-center p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">Puan</th>
                                    <th className="text-center p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">Durum</th>
                                    <th className="text-center p-4 text-slate-600 dark:text-slate-400 text-sm font-bold">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {filteredModules.map((mod) => {
                                    const IconComponent = ICON_MAP[mod.icon] || Package;
                                    const color = getCategoryColor(mod.category);
                                    return (
                                        <tr key={mod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 bg-${color}-500/10 rounded-lg text-${color}-600 dark:text-${color}-400`}><IconComponent size={18} /></div>
                                                    <div>
                                                        <div className="font-bold text-foreground flex items-center gap-2">
                                                            {mod.name}
                                                            {mod.isNew && <span className="px-1 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 text-[8px] font-bold rounded">YENİ</span>}
                                                            {mod.isBeta && <span className="px-1 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-[8px] font-bold rounded">BETA</span>}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{mod.key}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4"><span className={`text-sm text-${color}-600 dark:text-${color}-400`}>{CATEGORIES[mod.category as keyof typeof CATEGORIES]?.name}</span></td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${mod.requiredPlan === 'FREE' ? 'bg-slate-500/20 text-slate-600 dark:text-slate-400' : mod.requiredPlan === 'PRO' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'}`}>
                                                    {PLAN_BADGES[mod.requiredPlan as keyof typeof PLAN_BADGES]?.name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">{mod.monthlyPrice > 0 ? <span className="text-foreground font-bold">₺{mod.monthlyPrice}</span> : <span className="text-slate-500">-</span>}</td>
                                            <td className="p-4 text-right"><span className="text-foreground">{mod.activeUsers.toLocaleString()}</span></td>
                                            <td className="p-4 text-right">{mod.revenue > 0 ? <span className="text-green-600 dark:text-green-400 font-bold">₺{mod.revenue.toLocaleString()}</span> : <span className="text-slate-500">-</span>}</td>
                                            <td className="p-4 text-center"><span className="text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-1"><Star size={12} fill="currentColor" />{mod.rating}</span></td>
                                            <td className="p-4 text-center">
                                                <button onClick={() => toggleModuleStatus(mod.id)} disabled={mod.isCore}
                                                    className={`relative w-10 h-5 rounded-full transition-colors ${mod.isCore ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : mod.isActive ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'}`}>
                                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${mod.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button className="p-1.5 text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"><Eye size={14} /></button>
                                                    <button className="p-1.5 text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"><Edit3 size={14} /></button>
                                                    <button className="p-1.5 text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Settings size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredModules.length === 0 && (
                <div className="text-center py-16">
                    <Package size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-600" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Modül Bulunamadı</h3>
                    <p className="text-slate-500">Arama kriterlerinize uygun modül bulunamadı.</p>
                </div>
            )}
        </div>
    );
}
