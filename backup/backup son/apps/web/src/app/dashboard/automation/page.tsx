"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Plus,
    Play,
    Pause,
    Settings,
    Trash2,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowRight,
    RefreshCw,
    Package,
    ShoppingCart,
    Bell,
    Mail,
    Tag,
    Truck,
    TrendingDown,
    TrendingUp,
    Users,
    Bot,
    Filter,
    ChevronDown,
    ChevronRight,
    Edit,
    Copy,
    MoreVertical,
    Activity,
    Target,
    Calendar,
    Eye,
    MessageSquare,
    DollarSign,
    Percent,
    Layers,
    Search,
    BarChart3,
    X
} from 'lucide-react';
import { useAutomations, Automation, AutomationLog } from '@/lib/hooks';



// Otomasyon türleri
const automationTypes = [
    { id: 'stock', label: 'Stok Otomasyonu', icon: Package, color: 'blue' },
    { id: 'price', label: 'Fiyat Otomasyonu', icon: Tag, color: 'green' },
    { id: 'order', label: 'Sipariş Otomasyonu', icon: ShoppingCart, color: 'purple' },
    { id: 'notification', label: 'Bildirim Otomasyonu', icon: Bell, color: 'yellow' },
    { id: 'shipping', label: 'Kargo Otomasyonu', icon: Truck, color: 'orange' },
    { id: 'customer', label: 'Müşteri Otomasyonu', icon: Users, color: 'pink' },
];

export default function AutomationPage() {
    const [activeTab, setActiveTab] = useState<'automations' | 'templates' | 'logs'>('automations');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Static workflow templates (UI config, not data)
    const workflowTemplates = [
        {
            id: 1,
            name: "Yeni Sipariş İşleme",
            description: "Sipariş alındığında tüm süreci otomatize et",
            steps: ["Sipariş doğrula", "Stok düş", "Fatura oluştur", "Kargo etiketi bas", "Müşteriye bildir"],
            usageCount: 0,
            rating: 4.9
        },
        {
            id: 2,
            name: "Stok Yenileme",
            description: "Düşük stok tespiti ve tedarikçi bildirimi",
            steps: ["Stok kontrol", "Kritik ürünleri bul", "Tedarikçiye sipariş", "Takip numarası al"],
            usageCount: 0,
            rating: 4.7
        },
        {
            id: 3,
            name: "Fiyat Optimizasyonu",
            description: "AI destekli otomatik fiyat ayarlama",
            steps: ["Rakip fiyat analizi", "Marj hesapla", "Optimal fiyat belirle", "Güncelle"],
            usageCount: 0,
            rating: 4.8
        },
        {
            id: 4,
            name: "Müşteri Geri Kazanımı",
            description: "Pasif müşterileri yeniden aktive et",
            steps: ["30 gün sipariş yok", "Kişisel öneri hazırla", "E-posta gönder", "Takip et"],
            usageCount: 0,
            rating: 4.5
        },
    ];

    const { automations: apiAutomations, loading } = useAutomations();
    const automations: Automation[] = (Array.isArray(apiAutomations) && apiAutomations.length > 0) ? apiAutomations : [];

    // Logs state
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const loadLogs = async () => {
        setLogsLoading(true);
        try {
            const { apiClient } = await import('@/lib/api-client');
            const data = await apiClient.request<AutomationLog[]>('/automations/logs');
            setLogs(data || []);
        } catch { setLogs([]); }
        setLogsLoading(false);
    };

    useEffect(() => { if (activeTab === 'logs') loadLogs(); }, [activeTab]);

    const filteredAutomations = automations.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !selectedType || a.type === selectedType;
        return matchesSearch && matchesType;
    });

    const stats = {
        total: automations.length,
        active: automations.filter(a => a.isActive ?? a.status === 'active').length,
        totalRuns: automations.reduce((sum, a) => sum + a.runCount, 0),
        avgSuccess: Math.round(automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length)
    };

    const getTypeConfig = (type: string) => {
        const config = automationTypes.find(t => t.id === type);
        const colors: Record<string, { bg: string; text: string; border: string }> = {
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
            green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
            yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
            orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
            pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
        };
        return {
            icon: config?.icon || Zap,
            label: config?.label || 'Otomasyon',
            ...colors[config?.color || 'blue']
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Otomasyonlar yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Otomasyon Merkezi</h1>
                    <p className="text-slate-500 mt-1">İş süreçlerinizi otomatize edin, zamandan tasarruf edin</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                >
                    <Plus size={18} />
                    Yeni Otomasyon
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-primary/10 rounded-xl">
                            <Layers size={20} className="text-primary" />
                        </div>
                        <span className="text-sm text-slate-500">Toplam Otomasyon</span>
                    </div>
                    <div className="text-3xl font-black text-foreground">{stats.total}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-green-500/10 rounded-xl">
                            <CheckCircle size={20} className="text-green-500" />
                        </div>
                        <span className="text-sm text-slate-500">Aktif</span>
                    </div>
                    <div className="text-3xl font-black text-green-500">{stats.active}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl">
                            <Activity size={20} className="text-blue-500" />
                        </div>
                        <span className="text-sm text-slate-500">Toplam Çalışma</span>
                    </div>
                    <div className="text-3xl font-black text-foreground">{stats.totalRuns.toLocaleString()}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl">
                            <Target size={20} className="text-purple-500" />
                        </div>
                        <span className="text-sm text-slate-500">Başarı Oranı</span>
                    </div>
                    <div className="text-3xl font-black text-foreground">%{stats.avgSuccess}</div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border">
                {[
                    { id: 'automations', label: 'Otomasyonlarım', icon: Zap },
                    { id: 'templates', label: 'Şablonlar', icon: Layers },
                    { id: 'logs', label: 'Çalışma Geçmişi', icon: Activity },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${activeTab === tab.id
                            ? 'text-primary border-primary'
                            : 'text-slate-500 border-transparent hover:text-foreground'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'automations' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Otomasyon ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedType(null)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedType ? 'bg-primary text-white' : 'bg-surface border border-border text-slate-400 hover:text-foreground'
                                    }`}
                            >
                                Tümü
                            </button>
                            {automationTypes.slice(0, 4).map(type => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedType === type.id
                                            ? 'bg-primary text-white'
                                            : 'bg-surface border border-border text-slate-400 hover:text-foreground'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {type.label.replace(' Otomasyonu', '')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Automation List */}
                    <div className="space-y-4">
                        {filteredAutomations.map((automation, index) => {
                            const typeConfig = getTypeConfig(automation.type);
                            const TypeIcon = typeConfig.icon;

                            return (
                                <motion.div
                                    key={automation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${typeConfig.bg}`}>
                                            <TypeIcon size={24} className={typeConfig.text} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-foreground">{automation.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${typeConfig.bg} ${typeConfig.text} border ${typeConfig.border}`}>
                                                    {typeConfig.label}
                                                </span>
                                                {(automation.isActive ?? automation.status === 'active') ? (
                                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        AKTİF
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                                        DURAKLATILDI
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mb-4">{automation.description}</p>

                                            {/* Trigger → Action Flow */}
                                            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl mb-4">
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tetikleyici</div>
                                                    <div className="text-sm text-foreground">{automation.trigger}</div>
                                                </div>
                                                <ArrowRight size={20} className="text-primary" />
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Eylem</div>
                                                    <div className="text-sm text-foreground">{automation.action}</div>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Activity size={14} />
                                                    <span>{automation.runCount} çalışma</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-green-500">
                                                    <CheckCircle size={14} />
                                                    <span>%{automation.successRate} başarı</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Clock size={14} />
                                                    <span>Son: {new Date(automation.lastRun || '').toLocaleString('tr-TR')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground transition-all">
                                                <Play size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground transition-all">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground transition-all">
                                                <Copy size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="grid grid-cols-2 gap-6">
                    {workflowTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">{template.name}</h3>
                                    <p className="text-sm text-slate-500">{template.description}</p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Bot size={24} className="text-primary" />
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="flex items-center gap-2 flex-wrap mb-4">
                                {template.steps.map((step, idx) => (
                                    <React.Fragment key={idx}>
                                        <span className="px-2 py-1 bg-background/50 rounded-lg text-xs text-slate-400">
                                            {step}
                                        </span>
                                        {idx < template.steps.length - 1 && (
                                            <ChevronRight size={12} className="text-slate-600" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Users size={12} />
                                        {template.usageCount} kullanım
                                    </span>
                                    <span className="flex items-center gap-1 text-yellow-500">
                                        ★ {template.rating}
                                    </span>
                                </div>
                                <button className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                                    Kullan
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-foreground">Son Çalışmalar</h3>
                        <button onClick={loadLogs} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-foreground transition-all">
                            <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} /> Yenile
                        </button>
                    </div>
                    {logsLoading ? (
                        <div className="py-10 flex items-center justify-center gap-3 text-slate-500">
                            <RefreshCw size={16} className="animate-spin" /><span className="text-sm">Yükleniyor...</span>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="py-10 text-center text-slate-500">
                            <Activity size={28} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">Henüz otomasyon çalışması yok</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {logs.map((log: AutomationLog, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-all">
                                    <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : log.status === 'error' ? 'bg-red-500' : 'bg-slate-500'}`} />
                                    <div className="flex-1">
                                        <div className="font-medium text-foreground">{log.automation || log.name}</div>
                                        <div className="text-sm text-slate-500">{log.details || log.message}</div>
                                    </div>
                                    <div className="text-xs text-slate-500">{log.time || log.createdAt}</div>
                                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground">
                                        <Eye size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <h2 className="text-xl font-bold text-foreground">Yeni Otomasyon Oluştur</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-500 mb-6">Otomasyon türünü seçin:</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {automationTypes.map(type => {
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.id}
                                                className="flex flex-col items-center gap-3 p-6 bg-background/50 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-2xl transition-all group"
                                            >
                                                <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-all">
                                                    <Icon size={28} className="text-primary" />
                                                </div>
                                                <span className="font-medium text-foreground">{type.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
