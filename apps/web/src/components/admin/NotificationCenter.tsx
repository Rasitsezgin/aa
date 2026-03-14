"use client";

import React, { useState } from 'react';
import {
    Bell,
    Settings,
    Check,
    Clock,
    ShoppingBag,
    AlertTriangle,
    TrendingUp,
    MessageSquare,
    Globe,
    Zap,
    Trash2
} from 'lucide-react';
import { useNotifications, RealtimeNotification } from '@/providers/notification-provider';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

    const getIcon = (type: RealtimeNotification['type'], severity: RealtimeNotification['severity']) => {
        switch (type) {
            case 'order': return <ShoppingBag className="text-green-500" size={16} />;
            case 'stock': return <AlertTriangle className="text-amber-500" size={16} />;
            case 'price': return <TrendingUp className="text-blue-500" size={16} />;
            case 'review': return <MessageSquare className="text-purple-500" size={16} />;
            case 'system': return <Zap className="text-orange-500" size={16} />;
            case 'integration': return <Globe className="text-slate-500" size={16} />;
            default: return <Bell className="text-slate-400" size={16} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors relative group"
            >
                <Bell size={18} className="text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-in zoom-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">BİLDİRİMLER</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    title="Tümünü okundu işaretle"
                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 transition-colors"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={clearAll}
                                    title="Tümünü temizle"
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                            {notifications.length === 0 ? (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                                        <Bell size={20} className="text-slate-300" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Henüz bildirim yok</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id)}
                                        className={`p-4 border-b border-slate-100 dark:border-white/5 flex gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-purple-50/30 dark:bg-purple-500/5' : ''}`}
                                    >
                                        {!notification.read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-500" />
                                        )}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notification.severity === 'success' ? 'bg-green-100 dark:bg-green-500/10' :
                                                notification.severity === 'error' ? 'bg-red-100 dark:bg-red-500/10' :
                                                    notification.severity === 'warning' ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-blue-100 dark:bg-blue-500/10'
                                            }`}>
                                            {getIcon(notification.type, notification.severity)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{notification.title}</h4>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: tr })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-center">
                            <button className="text-[11px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                                TÜM BİLDİRİMLERİ GÖR
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
