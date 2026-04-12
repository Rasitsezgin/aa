"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, X, Check, CheckCheck, Trash2,
    ShoppingCart, Package, AlertTriangle, TrendingUp,
    TrendingDown, Star, Truck, Users, Shield,
    Zap, Clock, Filter, ChevronDown, ChevronRight,
    ExternalLink, MoreHorizontal, Volume2, VolumeX,
    Settings, Archive, Eye, MessageSquare, Bot,
} from 'lucide-react';

// ============ TYPES ============

type NotifPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';
type NotifCategory = 'orders' | 'inventory' | 'pricing' | 'reviews' | 'shipping' | 'system' | 'ai' | 'finance';

interface Notification {
    id: string;
    title: string;
    body: string;
    category: NotifCategory;
    priority: NotifPriority;
    time: string;
    read: boolean;
    actionUrl?: string;
    actionLabel?: string;
    secondaryAction?: { label: string; onClick: () => void };
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    group?: string;
}

// ============ PRIORITY CONFIG ============

const PRIORITY_CONFIG: Record<NotifPriority, { label: string; dot: string; bg: string }> = {
    critical: { label: 'Kritik', dot: 'bg-red-500 animate-pulse', bg: 'border-l-red-500' },
    high: { label: 'Yüksek', dot: 'bg-orange-500', bg: 'border-l-orange-500' },
    medium: { label: 'Orta', dot: 'bg-yellow-500', bg: 'border-l-yellow-500' },
    low: { label: 'Düşük', dot: 'bg-blue-500', bg: 'border-l-blue-400' },
    info: { label: 'Bilgi', dot: 'bg-slate-500', bg: 'border-l-slate-500' },
};

const CATEGORY_CONFIG: Record<NotifCategory, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    orders: { label: 'Siparişler', icon: ShoppingCart },
    inventory: { label: 'Stok', icon: Package },
    pricing: { label: 'Fiyatlandırma', icon: TrendingUp },
    reviews: { label: 'Değerlendirmeler', icon: Star },
    shipping: { label: 'Kargo', icon: Truck },
    system: { label: 'Sistem', icon: Shield },
    ai: { label: 'AI Önerileri', icon: Bot },
    finance: { label: 'Finans', icon: TrendingUp },
};

// ============ NOTIFICATION DATA ============

// ============ NOTIFICATION ITEM ============

function NotificationItem({
    notification, onRead, onDelete, onAction
}: {
    notification: Notification;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
    onAction: (url: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const pc = PRIORITY_CONFIG[notification.priority];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={`border-l-2 ${pc.bg} ${notification.read ? 'opacity-60' : ''} bg-white/[0.02] rounded-r-xl hover:bg-white/[0.04] transition-all group`}
        >
            <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.03] ${notification.color}`}>
                        <notification.icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className={`text-xs font-bold truncate ${notification.read ? 'text-slate-400' : 'text-white'}`}>
                                {notification.title}
                            </p>
                            {!notification.read && <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${pc.dot}`} />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{notification.body}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] text-slate-600 flex items-center gap-1">
                                <Clock size={8} /> {notification.time}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                                notification.priority === 'critical' ? 'bg-red-500/10 text-red-400' :
                                notification.priority === 'high' ? 'bg-orange-500/10 text-orange-400' :
                                'bg-slate-500/10 text-slate-500'
                            }`}>
                                {CATEGORY_CONFIG[notification.category].label}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                            <button onClick={(e) => { e.stopPropagation(); onRead(notification.id); }}
                                className="p-1 rounded-md hover:bg-white/10" title="Okundu işaretle">
                                <Check size={12} className="text-slate-500" />
                            </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                            className="p-1 rounded-md hover:bg-white/10" title="Sil">
                            <Trash2 size={12} className="text-slate-500" />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && notification.actionUrl && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3 pl-14 flex items-center gap-2">
                            <button
                                onClick={() => onAction(notification.actionUrl!)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-colors"
                            >
                                <ExternalLink size={10} />
                                {notification.actionLabel}
                            </button>
                            {!notification.read && (
                                <button
                                    onClick={() => onRead(notification.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] text-slate-400 text-[11px] font-bold hover:bg-white/[0.06] transition-colors"
                                >
                                    <Eye size={10} />
                                    Okundu
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ============ MAIN COMPONENT ============

export default function SmartNotificationCenter({
    isOpen, onClose
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | NotifCategory>('all');
    const [soundEnabled, setSoundEnabled] = useState(true);

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
    const criticalCount = useMemo(() => notifications.filter(n => !n.read && n.priority === 'critical').length, [notifications]);

    const filtered = useMemo(() => {
        let list = [...notifications];
        if (filter === 'unread') list = list.filter(n => !n.read);
        else if (filter !== 'all') list = list.filter(n => n.category === filter);
        // Sort by priority then time
        const priorityOrder: Record<NotifPriority, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        list.sort((a, b) => {
            if (!a.read && b.read) return -1;
            if (a.read && !b.read) return 1;
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        return list;
    }, [notifications, filter]);

    const markRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotif = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleAction = (url: string) => {
        window.location.href = url;
    };

    const categoryFilters: { id: 'all' | 'unread' | NotifCategory; label: string; count?: number }[] = [
        { id: 'all', label: 'Tümü', count: notifications.length },
        { id: 'unread', label: 'Okunmamış', count: unreadCount },
        { id: 'orders', label: 'Sipariş' },
        { id: 'inventory', label: 'Stok' },
        { id: 'pricing', label: 'Fiyat' },
        { id: 'ai', label: 'AI' },
    ];

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const res = await fetch('/api/notifications', { cache: 'no-store' });
                if (!res.ok) {
                    setNotifications([]);
                    return;
                }

                const payload = await res.json();
                const incoming = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
                const normalized: Notification[] = incoming.map((item: any, index: number) => ({
                    id: String(item.id ?? index),
                    title: String(item.title ?? ''),
                    body: String(item.body ?? ''),
                    category: (['orders', 'inventory', 'pricing', 'reviews', 'shipping', 'system', 'ai', 'finance'].includes(item.category) ? item.category : 'system') as NotifCategory,
                    priority: (['critical', 'high', 'medium', 'low', 'info'].includes(item.priority) ? item.priority : 'info') as NotifPriority,
                    time: String(item.time ?? ''),
                    read: Boolean(item.read),
                    actionUrl: item.actionUrl ? String(item.actionUrl) : undefined,
                    actionLabel: item.actionLabel ? String(item.actionLabel) : undefined,
                    icon: Bell,
                    color: 'text-slate-300',
                }));
                setNotifications(normalized);
            } catch {
                setNotifications([]);
            }
        };

        void loadNotifications();
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[90]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                        className="fixed right-4 top-16 w-[400px] max-h-[calc(100vh-5rem)] bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl z-[95] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-800/50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Bell size={18} className="text-white" />
                                        {unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center">
                                                {unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-sm font-black text-white">Bildirimler</h2>
                                    {criticalCount > 0 && (
                                        <span className="text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded font-black animate-pulse">
                                            {criticalCount} KRİTİK
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                        title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                                    >
                                        {soundEnabled ? <Volume2 size={14} className="text-slate-500" /> : <VolumeX size={14} className="text-slate-500" />}
                                    </button>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                            title="Tümünü okundu işaretle"
                                        >
                                            <CheckCheck size={14} className="text-slate-500" />
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <X size={14} className="text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-1 overflow-x-auto no-scrollbar">
                                {categoryFilters.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFilter(f.id)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                                            filter === f.id
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        {f.label}
                                        {f.count !== undefined && (
                                            <span className="ml-1 text-[8px] opacity-60">({f.count})</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                            <AnimatePresence>
                                {filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Bell size={32} className="text-slate-700 mb-3" />
                                        <p className="text-sm text-slate-500 font-bold">Bildirim yok</p>
                                        <p className="text-[11px] text-slate-600 mt-1">Yeni bildirimler burada görünecek</p>
                                    </div>
                                ) : (
                                    filtered.map(n => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                            onRead={markRead}
                                            onDelete={deleteNotif}
                                            onAction={handleAction}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-800/50 flex items-center justify-between">
                            <button className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                                <Archive size={12} />
                                Arşivi Görüntüle
                            </button>
                            <button className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                                <Settings size={12} />
                                Bildirim Ayarları
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
