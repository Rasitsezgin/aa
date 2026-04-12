"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CheckCircle, AlertTriangle, Info, Gift, Wrench, RefreshCw,
    Check, ExternalLink, Search, Sparkles,
    Clock, Eye, Archive, Trash2, MailOpen
} from 'lucide-react';
import Link from 'next/link';
import { useAnnouncements } from '@/lib/modules';

const TYPE_CONFIG = {
    INFO: { icon: Info, label: 'Bilgi', color: 'blue', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', textClass: 'text-blue-400' },
    WARNING: { icon: AlertTriangle, label: 'Uyarı', color: 'yellow', bgClass: 'bg-yellow-500/10', borderClass: 'border-yellow-500/20', textClass: 'text-yellow-400' },
    SUCCESS: { icon: CheckCircle, label: 'Başarı', color: 'green', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/20', textClass: 'text-green-400' },
    PROMOTION: { icon: Gift, label: 'Promosyon', color: 'purple', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/20', textClass: 'text-purple-400' },
    MAINTENANCE: { icon: Wrench, label: 'Bakım', color: 'orange', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/20', textClass: 'text-orange-400' },
    UPDATE: { icon: RefreshCw, label: 'Güncelleme', color: 'cyan', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/20', textClass: 'text-cyan-400' },
};

export default function NotificationsPage() {
    const { all: announcements, unreadCount, markAsRead, dismiss } = useAnnouncements();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [showReadOnly, setShowReadOnly] = useState<'all' | 'unread' | 'read'>('all');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);

    // Filtreleme
    const filteredAnnouncements = announcements.filter(a => {
        if (a.isDismissed) return false;
        if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !a.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedType !== 'all' && a.type !== selectedType) return false;
        if (showReadOnly === 'unread' && a.isRead) return false;
        if (showReadOnly === 'read' && !a.isRead) return false;
        return true;
    });

    const markAllAsRead = () => {
        filteredAnnouncements.forEach(a => {
            if (!a.isRead) markAsRead(a.id);
        });
    };

    // Uncomment when needed
    // const dismissAll = () => {
    //     filteredAnnouncements.forEach(a => dismiss(a.id));
    // };

    const selectedItem = selectedAnnouncement 
        ? announcements.find(a => a.id === selectedAnnouncement) 
        : null;

    const stats = {
        total: announcements.filter(a => !a.isDismissed).length,
        unread: unreadCount,
        promotions: announcements.filter(a => a.type === 'PROMOTION' && !a.isDismissed).length,
        updates: announcements.filter(a => a.type === 'UPDATE' && !a.isDismissed).length,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Bildirimler</h1>
                        {unreadCount > 0 && (
                            <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                                <span className="text-sm font-bold text-primary">{unreadCount} Okunmamış</span>
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Sistem duyuruları ve bildirimlerinizi buradan takip edin</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all"
                    >
                        <MailOpen size={16} /> Tümünü Okundu İşaretle
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Bell size={20} className="text-primary" />
                        <span className="text-xs font-bold text-slate-500">Toplam</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.total}</div>
                    <p className="text-xs text-slate-500 mt-1">Duyuru</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Eye size={20} className="text-blue-500" />
                        <span className="text-xs font-bold text-blue-500">{stats.unread} yeni</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.unread}</div>
                    <p className="text-xs text-slate-500 mt-1">Okunmamış</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Gift size={20} className="text-purple-500" />
                        <span className="text-xs font-bold text-purple-500">Fırsat</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.promotions}</div>
                    <p className="text-xs text-slate-500 mt-1">Promosyon</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface border border-border rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Sparkles size={20} className="text-cyan-500" />
                        <span className="text-xs font-bold text-cyan-500">Yeni</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.updates}</div>
                    <p className="text-xs text-slate-500 mt-1">Güncelleme</p>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Duyuru ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-500">Tür:</span>
                    <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                selectedType === 'all' ? 'bg-primary text-white' : 'text-slate-500 hover:text-foreground'
                            }`}
                        >
                            Tümü
                        </button>
                        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedType(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    selectedType === key ? `${config.bgClass} ${config.textClass}` : 'text-slate-500 hover:text-foreground'
                                }`}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Read Status Filter */}
                <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
                    {(['all', 'unread', 'read'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setShowReadOnly(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                showReadOnly === status ? 'bg-primary text-white' : 'text-slate-500 hover:text-foreground'
                            }`}
                        >
                            {status === 'all' ? 'Tümü' : status === 'unread' ? 'Okunmamış' : 'Okunmuş'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Notifications List */}
                <div className="lg:col-span-2 space-y-3">
                    {filteredAnnouncements.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-surface border border-border rounded-2xl p-12 text-center"
                        >
                            <Bell size={48} className="mx-auto mb-4 text-slate-600" />
                            <h3 className="text-lg font-bold text-foreground mb-2">Duyuru Bulunamadı</h3>
                            <p className="text-sm text-slate-500">Seçili kriterlere uygun duyuru yok</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {filteredAnnouncements.map((announcement, idx) => {
                                const config = TYPE_CONFIG[announcement.type];
                                const IconComponent = config.icon;
                                const isSelected = selectedAnnouncement === announcement.id;

                                return (
                                    <motion.div
                                        key={announcement.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            setSelectedAnnouncement(announcement.id);
                                            if (!announcement.isRead) markAsRead(announcement.id);
                                        }}
                                        className={`bg-surface border rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg group ${
                                            isSelected 
                                                ? 'border-primary/50 shadow-lg shadow-primary/10' 
                                                : !announcement.isRead 
                                                    ? 'border-primary/30 bg-primary/5' 
                                                    : 'border-border'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${config.bgClass} ${config.borderClass} border`}>
                                                <IconComponent size={20} className={config.textClass} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-foreground line-clamp-1">{announcement.title}</h3>
                                                    {!announcement.isRead && (
                                                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                                    )}
                                                    {announcement.isPinned && (
                                                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded">
                                                            Sabitlenmiş
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {announcement.summary || announcement.content}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-xs text-slate-600 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(announcement.createdAt).toLocaleDateString('tr-TR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgClass} ${config.textClass}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!announcement.isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(announcement.id);
                                                        }}
                                                        className="p-2 hover:bg-green-500/20 rounded-lg text-slate-500 hover:text-green-500 transition-colors"
                                                        title="Okundu işaretle"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dismiss(announcement.id);
                                                    }}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        {selectedItem ? (
                            <motion.div
                                key={selectedItem.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-surface border border-border rounded-2xl overflow-hidden"
                            >
                                {/* Header */}
                                <div className={`p-6 ${TYPE_CONFIG[selectedItem.type].bgClass} border-b border-border`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        {React.createElement(TYPE_CONFIG[selectedItem.type].icon, {
                                            size: 24,
                                            className: TYPE_CONFIG[selectedItem.type].textClass
                                        })}
                                        <span className={`text-sm font-bold ${TYPE_CONFIG[selectedItem.type].textClass}`}>
                                            {TYPE_CONFIG[selectedItem.type].label}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-foreground">{selectedItem.title}</h2>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {selectedItem.content}
                                    </p>

                                    {selectedItem.actionUrl && (
                                        <Link
                                            href={selectedItem.actionUrl}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                                        >
                                            {selectedItem.actionText || 'Detayları Gör'}
                                            <ExternalLink size={16} />
                                        </Link>
                                    )}

                                    <div className="pt-4 border-t border-border">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-slate-500 block mb-1">Yayın Tarihi</span>
                                                <span className="font-medium text-foreground">
                                                    {new Date(selectedItem.createdAt).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            {selectedItem.endsAt && (
                                                <div>
                                                    <span className="text-slate-500 block mb-1">Bitiş Tarihi</span>
                                                    <span className="font-medium text-foreground">
                                                        {new Date(selectedItem.endsAt).toLocaleDateString('tr-TR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 border-t border-border flex gap-2">
                                    <button
                                        onClick={() => dismiss(selectedItem.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm font-medium text-slate-500 hover:bg-surface/80 transition-colors"
                                    >
                                        <Archive size={16} /> Arşivle
                                    </button>
                                    <button
                                        onClick={() => {
                                            dismiss(selectedItem.id);
                                            setSelectedAnnouncement(null);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-500/20 bg-red-500/10 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={16} /> Sil
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-surface border border-border rounded-2xl p-8 text-center"
                            >
                                <Bell size={48} className="mx-auto mb-4 text-slate-600" />
                                <h3 className="text-lg font-bold text-foreground mb-2">Duyuru Seçin</h3>
                                <p className="text-sm text-slate-500">
                                    Detayları görüntülemek için sol taraftaki listeden bir duyuru seçin
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
