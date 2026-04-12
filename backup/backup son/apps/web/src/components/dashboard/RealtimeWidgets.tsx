'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package,
    Users, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight,
    Zap, Brain, Sparkles, Activity, Eye, Star, RefreshCw, Truck
} from 'lucide-react';
import { useActivityFeed, useDashboardStats } from '@/lib/hooks';

interface Notification {
    id: string;
    type: 'order' | 'sale' | 'stock' | 'review' | 'ai' | 'alert' | 'shipping' | 'system' | 'campaign';
    title: string;
    value?: string;
    time: string;
    platform?: string;
}

export function RealtimeNotificationToast() {
    const { data: activities } = useActivityFeed(1, { refetchInterval: 30000 }); // Her 30 sn'de bir yeni aktivite kontrol et
    const [visible, setVisible] = useState<Notification | null>(null);
    const lastActivityId = useRef<string | null>(null);

    useEffect(() => {
        if (activities && activities.length > 0) {
            const latest = activities[0];
            if (latest.id !== lastActivityId.current) {
                // Sadece yeni bir aktivite ise göster
                if (lastActivityId.current !== null) {
                    const timer = setTimeout(() => {
                        setVisible({
                            id: latest.id,
                            type: latest.type as any,
                            title: latest.title,
                            value: latest.value,
                            time: 'Az önce',
                            platform: latest.platform
                        });
                    }, 0);
                    lastActivityId.current = latest.id;
                    const clearTimer = setTimeout(() => setVisible(null), 5000);

                    return () => {
                        clearTimeout(timer);
                        clearTimeout(clearTimer);
                    }
                } else {
                    lastActivityId.current = latest.id; // İlk yüklemede sessizce kaydet
                }
            }
        }
    }, [activities]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'sale': return <DollarSign className="w-4 h-4 text-green-500" />;
            case 'order': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
            case 'stock': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
            case 'ai': return <Brain className="w-4 h-4 text-purple-500" />;
            case 'shipping': return <Truck size={16} className="text-purple-500" />;
            default: return <Activity className="w-4 h-4 text-slate-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'sale': return 'border-green-500/30 bg-green-500/5';
            case 'order': return 'border-blue-500/30 bg-blue-500/5';
            case 'stock': return 'border-amber-500/30 bg-amber-500/5';
            case 'review': return 'border-yellow-500/30 bg-yellow-500/5';
            case 'ai': return 'border-purple-500/30 bg-purple-500/5';
            default: return 'border-border bg-surface';
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -20, x: -50 }}
                    className={`fixed bottom-32 lg:bottom-6 left-6 z-[110] max-w-sm p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${getTypeColor(visible.type)}`}
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-background/80">
                            {getIcon(visible.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-foreground">{visible.title}</div>
                            {visible.value && (
                                <div className="text-xs font-bold text-primary mt-0.5">{visible.value}</div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                {visible.platform && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-background/50 px-1.5 py-0.5 rounded">
                                        {visible.platform}
                                    </span>
                                )}
                                <span className="text-[10px] text-slate-500">{visible.time}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setVisible(null)}
                            className="text-slate-400 hover:text-foreground"
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


// Canlı Performans Göstergesi
export function LivePerformanceIndicator() {
    const { data: stats } = useDashboardStats('24h');

    const metrics = {
        todayRevenue: stats?.totalRevenue || 0,
        todayOrders: stats?.totalOrders || 0,
        activeVisitors: 0,
        conversionRate: stats?.conversionRate || 0,
    };

    return (
        <div className="flex items-center gap-4 px-4 py-2 bg-surface rounded-xl border border-border">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Canlı</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-green-500" />
                    <span className="font-bold text-foreground">₺{metrics.todayRevenue.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-bold text-foreground">{metrics.todayOrders}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-bold text-foreground">{metrics.activeVisitors}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-bold text-foreground">%{metrics.conversionRate.toFixed(1)}</span>
                </div>
            </div>
        </div>
    );
}
