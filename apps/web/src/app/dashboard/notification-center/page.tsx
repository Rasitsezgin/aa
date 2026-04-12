"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BellRing, CheckCircle2, AlertTriangle, Info, XCircle,
    Package, ShoppingCart, TrendingUp, Users, Settings, X,
    Check, Trash2, Filter, MailOpen, Clock
} from 'lucide-react';

type NotifType = 'order' | 'stock' | 'system' | 'marketing' | 'alert';
type NotifPriority = 'info' | 'warning' | 'critical' | 'success';

const priorityConfig: Record<NotifPriority, { color: string; bg: string; icon: typeof Info }> = {
    info: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Info },
    warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
    critical: { color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
    success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
};

const typeConfig: Record<NotifType, { label: string; icon: typeof Bell; color: string }> = {
    order: { label: 'Sipariş', icon: ShoppingCart, color: 'text-blue-400' },
    stock: { label: 'Stok', icon: Package, color: 'text-amber-400' },
    system: { label: 'Sistem', icon: Settings, color: 'text-slate-400' },
    marketing: { label: 'Pazarlama', icon: TrendingUp, color: 'text-indigo-400' },
    alert: { label: 'Uyarı', icon: AlertTriangle, color: 'text-red-400' },
};

import { useNotifications } from '@/lib/hooks';

export default function NotificationCenterPage() {
    const { notifications, setNotifications, loading, markAsRead, clearAllRead } = useNotifications();
    const [typeFilter, setTypeFilter] = useState<'all' | NotifType>('all');
    const [showSettings, setShowSettings] = useState(false);

    const filtered = notifications.filter(n => typeFilter === 'all' || n.type === typeFilter);
    const unreadCount = notifications.filter(n => !n.read).length;

    const deleteNotif = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications(prev => prev.filter(n => !n.read));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <BellRing className="w-7 h-7 text-indigo-400" /> Bildirim Merkezi
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-full font-bold">{unreadCount}</span>
                        )}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Tüm bildirimlerinizi tek yerden yönetin</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-foreground text-xs border border-border rounded-xl">
                        <MailOpen className="w-4 h-4" /> Tümünü Oku
                    </button>
                    <button onClick={clearAll} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-foreground text-xs border border-border rounded-xl">
                        <Trash2 className="w-4 h-4" /> Okunmuşları Sil
                    </button>
                    <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-foreground border border-border rounded-xl">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-3">
                {[
                    { id: 'all' as const, label: 'Tümü', count: notifications.length },
                    ...Object.entries(typeConfig).map(([id, cfg]) => ({ id: id as NotifType, label: cfg.label, count: notifications.filter(n => n.type === id).length })),
                ].map(f => (
                    <button key={f.id} onClick={() => setTypeFilter(f.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${typeFilter === f.id ? 'bg-indigo-600/10 border-indigo-500/30' : 'border-border hover:border-indigo-500/20'}`}>
                        <div className="text-lg font-bold text-foreground">{f.count}</div>
                        <div className="text-xs text-slate-500">{f.label}</div>
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-2">
                <AnimatePresence>
                    {filtered.map((notif, i) => {
                        const pCfg = priorityConfig[notif.priority as NotifPriority];
                        const tCfg = typeConfig[notif.type as NotifType];
                        return (
                            <motion.div key={notif.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: i * 0.02 }}
                                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${notif.read ? 'bg-surface border-border' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
                                <div className={`p-2.5 rounded-xl ${pCfg.bg} mt-0.5`}>
                                    <pCfg.icon className={`w-5 h-5 ${pCfg.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className={`text-sm font-medium ${notif.read ? 'text-slate-400' : 'text-foreground'}`}>{notif.title}</h4>
                                        {!notif.read && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                                    </div>
                                    <p className="text-xs text-slate-500">{notif.message}</p>
                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                                        <span className={`flex items-center gap-1 ${tCfg.color}`}>
                                            <tCfg.icon className="w-3 h-3" /> {tCfg.label}
                                        </span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {notif.time}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {!notif.read && (
                                        <button onClick={() => markAsRead(notif.id)} className="p-1.5 text-slate-500 hover:text-emerald-400" title="Okundu işaretle">
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => deleteNotif(notif.id)} className="p-1.5 text-slate-500 hover:text-red-400" title="Sil">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">Bildirim bulunmuyor</p>
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Bildirim Ayarları</h3>
                        <div className="space-y-3">
                            {Object.entries(typeConfig).map(([id, cfg]) => (
                                <div key={id} className="flex items-center justify-between p-3 bg-background rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                                        <span className="text-sm text-foreground">{cfg.label}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        {['E-posta', 'Push', 'SMS'].map(ch => (
                                            <label key={ch} className="flex items-center gap-1 text-xs text-slate-500">
                                                <input type="checkbox" defaultChecked={ch !== 'SMS'} className="rounded border-border" />
                                                {ch}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm text-slate-400">İptal</button>
                            <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">Kaydet</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
