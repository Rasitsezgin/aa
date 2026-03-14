"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, TrendingUp, Package, ShoppingCart, DollarSign,
    Users, Star, AlertTriangle, Truck, Store, CheckCircle,
    ArrowRight, Eye, MessageSquare
} from 'lucide-react';

interface TimelineEvent {
    id: string;
    type: 'order' | 'sale' | 'stock' | 'review' | 'shipping' | 'campaign' | 'system';
    title: string;
    description: string;
    time: string;
    platform?: string;
    value?: string;
    status?: 'success' | 'warning' | 'info' | 'error';
}

const fallbackEvents: TimelineEvent[] = [
    { id: '1', type: 'order', title: 'Yeni Sipariş #TY-28934', description: 'iPhone 15 Pro Kılıf x3 - Trendyol', time: '2 dk önce', platform: 'Trendyol', value: '₺449,70', status: 'success' },
    { id: '2', type: 'shipping', title: 'Kargo Teslim Edildi', description: 'Sipariş #HB-19384 müşteriye ulaştı', time: '15 dk önce', platform: 'Hepsiburada', status: 'success' },
    { id: '3', type: 'review', title: 'Yeni Yorum ⭐⭐⭐⭐⭐', description: '"Harika ürün, çok beğendim!" - Samsung S24 Cam', time: '28 dk önce', platform: 'Amazon', status: 'success' },
    { id: '4', type: 'stock', title: 'Stok Uyarısı', description: 'Xiaomi Kablosuz Şarj - Stok: 3 adet (kritik)', time: '45 dk önce', platform: 'Amazon', status: 'warning' },
    { id: '5', type: 'sale', title: 'Günlük Satış Rekoru', description: 'Bugün 156 sipariş ile rekor kırdınız!', time: '1 saat önce', value: '₺52.340', status: 'success' },
    { id: '6', type: 'campaign', title: 'Kampanya Başlatıldı', description: '%15 indirim kampanyası aktif edildi', time: '2 saat önce', platform: 'Trendyol', status: 'info' },
    { id: '7', type: 'system', title: 'Fiyat Güncellendi', description: 'AI 12 ürünün fiyatını optimize etti', time: '3 saat önce', status: 'info' },
    { id: '8', type: 'order', title: 'Toplu Sipariş', description: 'B2B müşteri 50 adetlik sipariş verdi', time: '4 saat önce', platform: 'N11', value: '₺12.500', status: 'success' },
];

interface ActivityTimelineProps {
    events?: TimelineEvent[];
}

export default function ActivityTimeline({ events: propEvents }: ActivityTimelineProps) {
    const events = propEvents && propEvents.length > 0 ? propEvents : fallbackEvents;
    const [filter, setFilter] = useState<string>('all');
    const [visibleCount, setVisibleCount] = useState(5);

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingCart className="w-3.5 h-3.5" />;
            case 'sale': return <DollarSign className="w-3.5 h-3.5" />;
            case 'stock': return <Package className="w-3.5 h-3.5" />;
            case 'review': return <Star className="w-3.5 h-3.5" />;
            case 'shipping': return <Truck className="w-3.5 h-3.5" />;
            case 'campaign': return <TrendingUp className="w-3.5 h-3.5" />;
            case 'system': return <CheckCircle className="w-3.5 h-3.5" />;
            default: return <Eye className="w-3.5 h-3.5" />;
        }
    };

    const getEventColor = (status: string = 'info') => {
        switch (status) {
            case 'success': return 'bg-green-500 text-white';
            case 'warning': return 'bg-amber-500 text-white';
            case 'error': return 'bg-red-500 text-white';
            default: return 'bg-blue-500 text-white';
        }
    };

    const filters = [
        { key: 'all', label: 'Tümü' },
        { key: 'order', label: 'Siparişler' },
        { key: 'stock', label: 'Stok' },
        { key: 'review', label: 'Yorumlar' },
        { key: 'shipping', label: 'Kargo' },
    ];

    const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter);

    return (
        <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Aktivite Akışı</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide pb-1">
                {filters.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                            filter === f.key
                                ? 'bg-primary text-white'
                                : 'bg-background/50 text-slate-500 hover:text-foreground border border-border'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-1">
                    <AnimatePresence>
                        {filteredEvents.slice(0, visibleCount).map((event, idx) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-start gap-3 pl-1 py-2 group"
                            >
                                <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getEventColor(event.status)}`}>
                                    {getEventIcon(event.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground">{event.title}</span>
                                        <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">{event.time}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">{event.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {event.platform && (
                                            <span className="text-[9px] font-bold bg-background/50 border border-border px-1.5 py-0.5 rounded text-slate-500">
                                                {event.platform}
                                            </span>
                                        )}
                                        {event.value && (
                                            <span className="text-[10px] font-bold text-green-500">{event.value}</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {filteredEvents.length > visibleCount && (
                <button
                    onClick={() => setVisibleCount(v => v + 5)}
                    className="w-full mt-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                    Daha Fazla Göster
                    <ArrowRight className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
