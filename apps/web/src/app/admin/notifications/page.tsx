"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Send, Users, AlertTriangle, Info, CheckCircle, Plus, Edit3,
    Trash2, Eye, EyeOff, Clock, Calendar, Target, Gift, Wrench, RefreshCw,
    ChevronDown, X, Image, Link, Star, TrendingUp, MessageSquare, Zap,
    Crown, Gem, Package, Pin, Archive, BarChart3, Filter, Search
} from 'lucide-react';

const ANNOUNCEMENT_TYPES = {
    INFO: { name: 'Bilgi', icon: Info, color: 'blue', bgClass: 'bg-blue-500/20', textClass: 'text-blue-400' },
    WARNING: { name: 'Uyarı', icon: AlertTriangle, color: 'yellow', bgClass: 'bg-yellow-500/20', textClass: 'text-yellow-400' },
    SUCCESS: { name: 'Başarı', icon: CheckCircle, color: 'green', bgClass: 'bg-green-500/20', textClass: 'text-green-400' },
    PROMOTION: { name: 'Promosyon', icon: Gift, color: 'purple', bgClass: 'bg-purple-500/20', textClass: 'text-purple-400' },
    MAINTENANCE: { name: 'Bakım', icon: Wrench, color: 'orange', bgClass: 'bg-orange-500/20', textClass: 'text-orange-400' },
    UPDATE: { name: 'Güncelleme', icon: RefreshCw, color: 'cyan', bgClass: 'bg-cyan-500/20', textClass: 'text-cyan-400' },
};

const TARGET_AUDIENCES = {
    ALL: { name: 'Tüm Kullanıcılar', icon: Users },
    FREE_USERS: { name: 'Ücretsiz Kullanıcılar', icon: Package },
    PRO_USERS: { name: 'Pro Kullanıcılar', icon: Crown },
    ENTERPRISE_USERS: { name: 'Kurumsal Kullanıcılar', icon: Gem },
};

const MOCK_ANNOUNCEMENTS = [
    {
        id: '1',
        title: '🚀 Yeni AI Görsel İşleme Modülü!',
        content: 'Yapay zeka destekli görsel işleme modülümüz artık kullanımda. Arka plan silme, görsel iyileştirme ve daha fazlası...',
        summary: 'AI görsel işleme modülü yayında!',
        type: 'UPDATE',
        target: 'ALL',
        actionUrl: '/dashboard/ai-tools',
        actionText: 'Keşfet',
        startsAt: new Date(),
        endsAt: null,
        isActive: true,
        isPinned: true,
        priority: 10,
        viewCount: 1250,
        readCount: 890,
        dismissCount: 45,
        createdAt: new Date(),
    },
    {
        id: '2',
        title: '⚡ Performans İyileştirmeleri',
        content: 'Sistem genelinde %40 daha hızlı yükleme süreleri ve geliştirilmiş kullanıcı deneyimi.',
        summary: 'Sistem performansı artırıldı',
        type: 'SUCCESS',
        target: 'ALL',
        startsAt: new Date(Date.now() - 86400000),
        isActive: true,
        isPinned: false,
        priority: 5,
        viewCount: 890,
        readCount: 650,
        dismissCount: 120,
        createdAt: new Date(Date.now() - 86400000),
    },
    {
        id: '3',
        title: '🎁 Pro Kullanıcılara Özel İndirim!',
        content: 'Bu hafta sonu Pro pakette %20 indirim fırsatını kaçırmayın. Kod: PROWEEKEND',
        summary: 'Pro pakette %20 indirim',
        type: 'PROMOTION',
        target: 'FREE_USERS',
        actionUrl: '/pricing',
        actionText: 'Yükselt',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 172800000),
        isActive: true,
        isPinned: false,
        priority: 8,
        viewCount: 456,
        readCount: 320,
        dismissCount: 23,
        createdAt: new Date(),
    },
    {
        id: '4',
        title: '🔧 Planlı Bakım Bildirimi',
        content: '5 Şubat 2026 saat 03:00-05:00 arasında planlı bakım yapılacaktır.',
        summary: '5 Şubat planlı bakım',
        type: 'MAINTENANCE',
        target: 'ALL',
        startsAt: new Date(),
        isActive: true,
        isPinned: false,
        priority: 7,
        viewCount: 234,
        readCount: 180,
        dismissCount: 12,
        createdAt: new Date(),
    },
    {
        id: '5',
        title: '⚠️ Trendyol API Güncellemesi',
        content: 'Trendyol API\'si yeni sürüme geçti. Entegrasyonlarınızı kontrol edin.',
        summary: 'Trendyol API güncellendi',
        type: 'WARNING',
        target: 'ALL',
        startsAt: new Date(Date.now() - 172800000),
        isActive: false,
        isPinned: false,
        priority: 6,
        viewCount: 1850,
        readCount: 1650,
        dismissCount: 200,
        createdAt: new Date(Date.now() - 172800000),
    },
];

export default function NotificationsPage() {
    const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        summary: '',
        type: 'INFO',
        target: 'ALL',
        actionUrl: '',
        actionText: '',
        isPinned: false,
        priority: 5,
    });

    const filteredAnnouncements = announcements.filter(a => {
        if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterType && a.type !== filterType) return false;
        if (filterStatus === 'active' && !a.isActive) return false;
        if (filterStatus === 'inactive' && a.isActive) return false;
        return true;
    });

    const stats = {
        total: announcements.length,
        active: announcements.filter(a => a.isActive).length,
        totalViews: announcements.reduce((sum, a) => sum + a.viewCount, 0),
        totalReads: announcements.reduce((sum, a) => sum + a.readCount, 0),
    };

    const toggleStatus = (id: string) => {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    };

    const togglePin = (id: string) => {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
    };

    const deleteAnnouncement = (id: string) => {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
    };

    const handleSubmit = () => {
        if (editingAnnouncement) {
            setAnnouncements(prev => prev.map(a => {
                if (a.id === editingAnnouncement.id) {
                    return {
                        ...a,
                        title: formData.title,
                        content: formData.content,
                        summary: formData.summary,
                        type: formData.type,
                        target: formData.target,
                        actionUrl: formData.actionUrl,
                        actionText: formData.actionText,
                        isPinned: formData.isPinned,
                        priority: formData.priority,
                    } as any;
                }
                return a;
            }));
        } else {
            const newAnnouncement = {
                id: Date.now().toString(),
                title: formData.title,
                content: formData.content,
                summary: formData.summary,
                type: formData.type,
                target: formData.target,
                actionUrl: formData.actionUrl,
                actionText: formData.actionText,
                startsAt: new Date(),
                endsAt: null,
                isActive: true,
                isPinned: formData.isPinned,
                priority: formData.priority,
                viewCount: 0,
                readCount: 0,
                dismissCount: 0,
                createdAt: new Date(),
            } as any;
            setAnnouncements(prev => [newAnnouncement, ...prev]);
        }
        setShowCreateModal(false);
        setEditingAnnouncement(null);
        setFormData({
            title: '', content: '', summary: '', type: 'INFO', target: 'ALL',
            actionUrl: '', actionText: '', isPinned: false, priority: 5,
        });
    };

    const openEditModal = (announcement: any) => {
        setFormData({
            title: announcement.title,
            content: announcement.content,
            summary: announcement.summary || '',
            type: announcement.type,
            target: announcement.target,
            actionUrl: announcement.actionUrl || '',
            actionText: announcement.actionText || '',
            isPinned: announcement.isPinned,
            priority: announcement.priority,
        });
        setEditingAnnouncement(announcement);
        setShowCreateModal(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                            <Bell size={28} className="text-white" />
                        </div>
                        Duyuru Yönetimi
                    </h1>
                    <p className="text-slate-600 dark:text-slate-500 font-medium mt-1">Kullanıcılara duyuru ve bildirim gönderin</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-600/20"
                >
                    <Plus size={18} /> Yeni Duyuru
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 dark:bg-gradient-to-br dark:from-blue-900/40 dark:to-blue-800/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl"><Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Toplam Duyuru</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.total}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-green-50 dark:bg-gradient-to-br dark:from-green-900/40 dark:to-green-800/20 rounded-2xl p-5 border border-green-200 dark:border-green-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/20 rounded-xl"><CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Aktif Duyuru</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.active}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-purple-50 dark:bg-gradient-to-br dark:from-purple-900/40 dark:to-purple-800/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/20 rounded-xl"><Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Toplam Görüntüleme</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.totalViews.toLocaleString()}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-cyan-50 dark:bg-gradient-to-br dark:from-cyan-900/40 dark:to-cyan-800/20 rounded-2xl p-5 border border-cyan-200 dark:border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-cyan-500/20 rounded-xl"><MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /></div>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Okunma Oranı</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {stats.totalViews > 0 ? Math.round((stats.totalReads / stats.totalViews) * 100) : 0}%
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[250px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        <input type="text" placeholder="Duyuru ara..." value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </div>
                    <select value={filterType || ''} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value || null)}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none">
                        <option value="">Tüm Türler</option>
                        {Object.entries(ANNOUNCEMENT_TYPES).map(([key, type]) => (
                            <option key={key} value={key}>{type.name}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                        {(['all', 'active', 'inactive'] as const).map((status) => (
                            <button key={status} onClick={(e: React.MouseEvent<HTMLButtonElement>) => setFilterStatus(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === status ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                {status === 'all' ? 'Tümü' : status === 'active' ? 'Aktif' : 'Pasif'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {filteredAnnouncements.map((announcement, index) => {
                    const typeConfig = ANNOUNCEMENT_TYPES[announcement.type as keyof typeof ANNOUNCEMENT_TYPES];
                    const TypeIcon = typeConfig?.icon || Info;
                    const targetConfig = TARGET_AUDIENCES[announcement.target as keyof typeof TARGET_AUDIENCES];

                    return (
                        <motion.div
                            key={announcement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-white dark:bg-slate-900/50 rounded-2xl border transition-all shadow-sm dark:shadow-none ${announcement.isActive ? 'border-slate-200 dark:border-white/10' : 'border-red-300 dark:border-red-500/20 opacity-60'}`}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-xl ${typeConfig?.bgClass}`}>
                                            <TypeIcon size={24} className={typeConfig?.textClass} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-foreground text-lg">{announcement.title}</h3>
                                                {announcement.isPinned && (
                                                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded flex items-center gap-1">
                                                        <Pin size={10} /> Sabitlenmiş
                                                    </span>
                                                )}
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeConfig?.bgClass} ${typeConfig?.textClass}`}>
                                                    {typeConfig?.name}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">{announcement.content}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    {targetConfig && <targetConfig.icon size={12} />}
                                                    {targetConfig?.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye size={12} /> {announcement.viewCount} görüntüleme
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle size={12} /> {announcement.readCount} okunma
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(announcement.createdAt).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => togglePin(announcement.id)}
                                            className={`p-2 rounded-lg transition-colors ${announcement.isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
                                            <Pin size={16} />
                                        </button>
                                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => openEditModal(announcement)}
                                            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => toggleStatus(announcement.id)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${announcement.isActive ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${announcement.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                        <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => deleteAnnouncement(announcement.id)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filteredAnnouncements.length === 0 && (
                <div className="text-center py-16">
                    <Bell size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-600" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Duyuru Bulunamadı</h3>
                    <p className="text-slate-500">Arama kriterlerinize uygun duyuru bulunamadı.</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => { setShowCreateModal(false); setEditingAnnouncement(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-white/10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-foreground">
                                        {editingAnnouncement ? 'Duyuru Düzenle' : 'Yeni Duyuru Oluştur'}
                                    </h2>
                                    <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { setShowCreateModal(false); setEditingAnnouncement(null); }}
                                        className="p-2 text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Başlık *</label>
                                    <input type="text" value={formData.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Duyuru başlığı..." className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">İçerik *</label>
                                    <textarea value={formData.content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                                        rows={4} placeholder="Duyuru içeriği..." className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tür</label>
                                        <select value={formData.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-foreground focus:outline-none">
                                            {Object.entries(ANNOUNCEMENT_TYPES).map(([key, type]) => (
                                                <option key={key} value={key}>{type.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hedef Kitle</label>
                                        <select value={formData.target} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, target: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none">
                                            {Object.entries(TARGET_AUDIENCES).map(([key, target]) => (
                                                <option key={key} value={key}>{target.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Aksiyon URL (Opsiyonel)</label>
                                        <input type="text" value={formData.actionUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, actionUrl: e.target.value })}
                                            placeholder="/dashboard/..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Buton Metni</label>
                                        <input type="text" value={formData.actionText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, actionText: e.target.value })}
                                            placeholder="Örn: Keşfet, Yükselt..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.isPinned} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isPinned: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/50" />
                                        <span className="text-sm text-slate-300">Duyuruyu sabitle</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-slate-500">Öncelik:</label>
                                        <input type="number" min="1" max="10" value={formData.priority} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                            className="w-16 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
                                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { setShowCreateModal(false); setEditingAnnouncement(null); }}
                                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300">
                                    İptal
                                </button>
                                <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit()} disabled={!formData.title || !formData.content}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2">
                                    <Send size={16} />
                                    {editingAnnouncement ? 'Güncelle' : 'Yayınla'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
