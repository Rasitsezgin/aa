"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebhooks } from '@/lib/hooks';
import {
    Webhook,
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
    Code,
    Copy,
    Eye,
    EyeOff,
    Lock,
    ExternalLink,
    Filter,
    Search,
    Activity,
    Zap,
    Globe,
    Edit,
    MoreVertical,
    ChevronDown,
    X,
    Key,
    Shield,
    Terminal,
    FileJson
} from 'lucide-react';

// Webhook event türleri
const eventTypes = [
    { id: 'order.created', label: 'Yeni Sipariş', category: 'Sipariş' },
    { id: 'order.updated', label: 'Sipariş Güncellendi', category: 'Sipariş' },
    { id: 'order.cancelled', label: 'Sipariş İptal', category: 'Sipariş' },
    { id: 'order.shipped', label: 'Sipariş Kargoda', category: 'Sipariş' },
    { id: 'order.delivered', label: 'Sipariş Teslim Edildi', category: 'Sipariş' },
    { id: 'product.created', label: 'Yeni Ürün', category: 'Ürün' },
    { id: 'product.updated', label: 'Ürün Güncellendi', category: 'Ürün' },
    { id: 'product.deleted', label: 'Ürün Silindi', category: 'Ürün' },
    { id: 'stock.low', label: 'Düşük Stok', category: 'Stok' },
    { id: 'stock.critical', label: 'Kritik Stok', category: 'Stok' },
    { id: 'stock.updated', label: 'Stok Güncellendi', category: 'Stok' },
    { id: 'customer.created', label: 'Yeni Müşteri', category: 'Müşteri' },
    { id: 'customer.vip', label: 'VIP Müşteri', category: 'Müşteri' },
    { id: 'payment.received', label: 'Ödeme Alındı', category: 'Finans' },
    { id: 'payment.failed', label: 'Ödeme Başarısız', category: 'Finans' },
];

const recentLogs: any[] = [];

export default function WebhooksPage() {
    const [activeTab, setActiveTab] = useState<'webhooks' | 'logs' | 'events'>('webhooks');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    const { webhooks: apiWebhooks, loading, fetchWebhooks: refetch } = useWebhooks();

    const webhooksData = (Array.isArray(apiWebhooks) && apiWebhooks.length > 0)
        ? apiWebhooks.map((w, i) => ({
            ...w,
            id: String(w.id || i + 1),
            isActive: w.status === 'active',
            secret: w.secret || '',
            lastTriggered: w.lastTriggered || w.createdAt,
          }))
        : [];

    const filteredWebhooks = webhooksData.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: webhooksData.length,
        active: webhooksData.filter(w => w.isActive).length,
        totalCalls: webhooksData.reduce((sum, w) => sum + w.totalCalls, 0),
        avgSuccess: webhooksData.length > 0
            ? Math.round(webhooksData.reduce((sum, w) => sum + w.successRate, 0) / webhooksData.length * 10) / 10
            : 0
    };

    const toggleSecret = (id: string) => {
        setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast göster
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Webhook verileri yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Webhook Yönetimi</h1>
                    <p className="text-slate-500 mt-1">Harici sistemlerle gerçek zamanlı entegrasyon</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                >
                    <Plus size={18} />
                    Yeni Webhook
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
                            <Webhook size={20} className="text-primary" />
                        </div>
                        <span className="text-sm text-slate-500">Toplam Webhook</span>
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
                        <span className="text-sm text-slate-500">Toplam Çağrı</span>
                    </div>
                    <div className="text-3xl font-black text-foreground">{stats.totalCalls.toLocaleString()}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl">
                            <Zap size={20} className="text-purple-500" />
                        </div>
                        <span className="text-sm text-slate-500">Başarı Oranı</span>
                    </div>
                    <div className="text-3xl font-black text-foreground">%{stats.avgSuccess}</div>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border">
                {[
                    { id: 'webhooks', label: 'Webhooklar', icon: Webhook },
                    { id: 'logs', label: 'Çağrı Geçmişi', icon: Activity },
                    { id: 'events', label: 'Event Tipleri', icon: Zap },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${
                            activeTab === tab.id
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
            {activeTab === 'webhooks' && (
                <div className="space-y-6">
                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Webhook ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                        />
                    </div>

                    {/* Webhook List */}
                    <div className="space-y-4">
                        {filteredWebhooks.length === 0 && (
                            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                                <p className="text-sm text-slate-500">Webhook verisi bulunamadı</p>
                            </div>
                        )}
                        {filteredWebhooks.map((webhook, index) => (
                            <motion.div
                                key={webhook.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${webhook.isActive ? 'bg-green-500/10' : 'bg-slate-500/10'}`}>
                                        <Webhook size={24} className={webhook.isActive ? 'text-green-500' : 'text-slate-500'} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-foreground">{webhook.name}</h3>
                                            {webhook.isActive ? (
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

                                        {/* URL */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <code className="flex-1 px-3 py-2 bg-background/50 rounded-lg text-sm text-slate-400 font-mono truncate">
                                                {webhook.url}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(webhook.url)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>

                                        {/* Events */}
                                        <div className="flex items-center gap-2 flex-wrap mb-4">
                                            <span className="text-xs text-slate-500">Events:</span>
                                            {webhook.events.map(event => (
                                                <span key={event} className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg">
                                                    {event}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Secret */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <Key size={14} className="text-slate-500" />
                                            <span className="text-xs text-slate-500">Secret:</span>
                                            <code className="px-2 py-1 bg-background/50 rounded text-xs text-slate-400 font-mono">
                                                {showSecrets[webhook.id] ? webhook.secret : '••••••••••••••••'}
                                            </code>
                                            <button
                                                onClick={() => toggleSecret(webhook.id)}
                                                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-foreground"
                                            >
                                                {showSecrets[webhook.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(webhook.secret)}
                                                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-foreground"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Activity size={14} />
                                                <span>{webhook.totalCalls.toLocaleString()} çağrı</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-green-500">
                                                <CheckCircle size={14} />
                                                <span>%{webhook.successRate} başarı</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock size={14} />
                                                <span>Son: {new Date(webhook.lastTriggered).toLocaleString('tr-TR')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground transition-all" title="Test Et">
                                            <Play size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground transition-all" title="Düzenle">
                                            <Edit size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all" title="Sil">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-foreground">Son Webhook Çağrıları</h3>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-foreground transition-all">
                            <RefreshCw size={14} />
                            Yenile
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Webhook</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Event</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Durum</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Kod</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Süre</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Zaman</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentLogs.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>Webhook çağrı geçmişi bulunamadı</td>
                                    </tr>
                                )}
                                {recentLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/[0.02] transition-all">
                                        <td className="px-4 py-4 font-medium text-foreground">{log.webhook}</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                                                {log.event}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {log.status === 'success' ? (
                                                <span className="flex items-center gap-1 text-green-500 text-sm">
                                                    <CheckCircle size={14} />
                                                    Başarılı
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-500 text-sm">
                                                    <XCircle size={14} />
                                                    Hata
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-mono ${
                                                log.statusCode === 200 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                                {log.statusCode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-400">{log.duration}</td>
                                        <td className="px-4 py-4 text-sm text-slate-500">{log.time}</td>
                                        <td className="px-4 py-4 text-right">
                                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'events' && (
                <div className="grid grid-cols-2 gap-6">
                    {Object.entries(
                        eventTypes.reduce((acc, event) => {
                            if (!acc[event.category]) acc[event.category] = [];
                            acc[event.category].push(event);
                            return acc;
                        }, {} as Record<string, typeof eventTypes>)
                    ).map(([category, events], index) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-surface border border-border rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Zap size={18} className="text-primary" />
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {events.map(event => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between p-3 bg-background/50 rounded-xl hover:bg-white/5 transition-all"
                                    >
                                        <div>
                                            <div className="font-medium text-foreground">{event.label}</div>
                                            <code className="text-xs text-slate-500 font-mono">{event.id}</code>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(event.id)}
                                            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
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
                                <h2 className="text-xl font-bold text-foreground">Yeni Webhook Oluştur</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-foreground"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Webhook Name */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Webhook Adı</label>
                                    <input
                                        type="text"
                                        placeholder="Örn: ERP Entegrasyonu"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                                    />
                                </div>

                                {/* Endpoint URL */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Endpoint URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/webhook"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50 font-mono text-sm"
                                    />
                                </div>

                                {/* Events */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Dinlenecek Event'ler</label>
                                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-background/50 rounded-xl border border-border">
                                        {eventTypes.map(event => (
                                            <label key={event.id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                <input type="checkbox" className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary" />
                                                <span className="text-sm text-slate-400">{event.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2.5 text-slate-400 hover:text-foreground transition-all"
                                    >
                                        İptal
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all">
                                        <Webhook size={16} />
                                        Oluştur
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
