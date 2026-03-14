"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Truck, Package, MapPin, Clock, CheckCircle2, AlertTriangle,
    Search, Eye, RefreshCw, ArrowRight, Navigation,
    XCircle, Loader2, Bell
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Shipment {
    id: string;
    orderId: string;
    customer: string;
    carrier: string;
    tracking: string;
    status: string;
    city: string;
    date: string;
    deliveredDate?: string | null;
    items: number;
    timeline?: TimelineEvent[];
}

interface TimelineEvent {
    time: string;
    event: string;
    location: string;
    done: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    delivered: { label: 'Teslim Edildi', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
    'in-transit': { label: 'Yolda', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Truck },
    preparing: { label: 'Hazırlanıyor', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Package },
    returned: { label: 'İade', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
    problem: { label: 'Sorunlu', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
};

export default function ShippingTrackingPage() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [selectedTimeline, setSelectedTimeline] = useState<TimelineEvent[]>([]);

    const loadShipments = async () => {
        setLoading(true);
        try {
            const data = await apiClient.request<Shipment[]>('/shipments');
            setShipments(data || []);
        } catch { setShipments([]); }
        setLoading(false);
    };

    const loadTimeline = async (shipmentId: string) => {
        setTimelineLoading(true);
        try {
            const data = await apiClient.request<TimelineEvent[]>(`/shipments/${shipmentId}/timeline`);
            setSelectedTimeline(data || []);
        } catch { setSelectedTimeline([]); }
        setTimelineLoading(false);
    };

    useEffect(() => {
        loadShipments();
    }, []);

    const handleSelect = (id: string) => {
        if (selectedId === id) { setSelectedId(null); setSelectedTimeline([]); return; }
        setSelectedId(id);
        loadTimeline(id);
    };

    const filtered = shipments.filter(s =>
        (statusFilter === 'all' || s.status === statusFilter) &&
        (s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.tracking.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: shipments.length,
        delivered: shipments.filter(s => s.status === 'delivered').length,
        inTransit: shipments.filter(s => s.status === 'in-transit').length,
        problem: shipments.filter(s => ['problem', 'returned'].includes(s.status)).length,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Truck className="w-8 h-8 text-indigo-400" /> Kargo Takip Sistemi
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Tüm gönderilerinizi tek panelden takip edin</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-sm text-slate-500 hover:text-foreground transition-all">
                        <Bell size={15} /> Bildirim Kur
                    </button>
                    <button onClick={loadShipments} className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-sm text-slate-500 hover:text-foreground transition-all">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Güncelle
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Gönderi', value: stats.total, icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Teslim Edilen', value: stats.delivered, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Yolda', value: stats.inTransit, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Sorunlu', value: stats.problem, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-2xl border border-border p-5">
                        <div className={`inline-flex p-2.5 rounded-xl ${s.bg} mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                        <div className="text-2xl font-black text-foreground">{loading ? '—' : s.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Takip no, müşteri veya kargo ID ara..."
                        className="w-full pl-11 pr-4 py-3 bg-surface rounded-2xl text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none" />
                </div>
                <div className="flex gap-1 bg-surface rounded-2xl p-1.5 border border-border">
                    {[{ id: 'all', label: 'Tümü' }, ...Object.entries(statusConfig).map(([id, cfg]) => ({ id, label: cfg.label }))].map(f => (
                        <button key={f.id} onClick={() => setStatusFilter(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === f.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-foreground'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Shipments List */}
                <div className="col-span-2 space-y-3">
                    {loading ? (
                        <div className="py-16 flex items-center justify-center gap-3 text-slate-500 bg-surface rounded-2xl border border-border">
                            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Gönderiler yükleniyor...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
                            <Truck size={40} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-bold text-foreground">Gönderi bulunamadı</p>
                            <p className="text-sm text-slate-500 mt-1">Arama kriterlerini değiştirin</p>
                        </div>
                    ) : (
                        filtered.map((s, i) => {
                            const cfg = statusConfig[s.status] || { label: s.status, color: 'text-slate-400', bg: 'bg-slate-500/10', icon: Package };
                            const StatusIcon = cfg.icon;
                            return (
                                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                    onClick={() => handleSelect(s.id)}
                                    className={`bg-surface rounded-2xl border p-5 cursor-pointer transition-all ${selectedId === s.id ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/5' : 'border-border hover:border-indigo-500/20'}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-foreground">{s.id}</span>
                                                <ArrowRight className="w-3 h-3 text-slate-600" />
                                                <span className="text-xs text-slate-500">{s.orderId}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">{s.customer} • {s.items} ürün</div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.bg.replace('bg-', 'border-').replace('/10', '/30')}`}>
                                            <StatusIcon className="w-3 h-3" /> {cfg.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {s.carrier}</span>
                                        <span className="font-mono">{s.tracking}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.city}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.date}</span>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Tracking Detail */}
                <div>
                    {selectedId ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="bg-surface rounded-2xl border border-border p-5 sticky top-6">
                            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-indigo-400" /> Takip Detayı
                            </h3>
                            {timelineLoading ? (
                                <div className="py-8 flex items-center justify-center gap-2 text-slate-500">
                                    <Loader2 size={16} className="animate-spin" /><span className="text-xs">Yükleniyor...</span>
                                </div>
                            ) : selectedTimeline.length === 0 ? (
                                <p className="text-xs text-slate-500 text-center py-6">Takip verisi bulunamadı</p>
                            ) : (
                                <div className="space-y-0">
                                    {selectedTimeline.map((t, i) => (
                                        <div key={i} className="flex gap-3 pb-4 relative">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full mt-0.5 ${i === 0 ? 'bg-indigo-500' : t.done ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                                                {i < selectedTimeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                                            </div>
                                            <div className="pb-2">
                                                <div className="text-xs font-bold text-foreground">{t.event}</div>
                                                <div className="text-[10px] text-slate-500">{t.location}</div>
                                                <div className="text-[10px] text-slate-600">{t.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
                            <Eye className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-bold text-foreground mb-1">Takip Detayı</p>
                            <p className="text-xs text-slate-500">Detay görmek için bir gönderi seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
