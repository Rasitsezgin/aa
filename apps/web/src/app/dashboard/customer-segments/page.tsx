"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Target, TrendingUp, DollarSign, ShoppingCart,
    Crown, Heart, Award, Star, Download, Mail, Loader2, RefreshCw, BarChart3
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Segment {
    id: string;
    name: string;
    count: number;
    revenue: string | number;
    avgOrder: string | number;
    frequency: string | number;
    color: string;
    description?: string;
    percentage?: number;
}

interface RFMEntry {
    customer: string;
    recency: number;
    frequency: number;
    monetary: string | number;
    segment: string;
    score: number;
}

const SEGMENT_ICONS: Record<string, React.ComponentType> = {
    vip: Crown, VIP: Crown, 'VIP Müşteriler': Crown,
    'Sadık': Heart, 'Düzenli': ShoppingCart,
    'Yeni': Star, 'Uyuyan': Target,
    'Yüksek Potansiyel': Award,
};

const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; bar: string }> = {
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', bar: 'bg-amber-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', bar: 'bg-blue-500' },
    green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20', bar: 'bg-green-500' },
    red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', bar: 'bg-red-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', bar: 'bg-purple-500' },
    pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20', bar: 'bg-pink-500' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20', bar: 'bg-slate-500' },
};
const COLOR_PALETTE = ['amber', 'blue', 'green', 'red', 'purple', 'pink'];

function getSegmentIcon(name: string) {
    for (const [key, Icon] of Object.entries(SEGMENT_ICONS)) {
        if (name.toLowerCase().includes(key.toLowerCase())) return Icon;
    }
    return Users;
}

export default function CustomerSegmentationPage() {
    const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'rfm' | 'actions'>('overview');

    const [segments, setSegments] = useState<Segment[]>([]);
    const [rfmData, setRfmData] = useState<RFMEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [rfmLoading, setRfmLoading] = useState(false);

    const loadSegments = async () => {
        setLoading(true);
        try {
            const data = await apiClient.request<Segment[]>('/customer-segments');
            setSegments((data || []).map((s, i) => ({ ...s, color: s.color || COLOR_PALETTE[i % COLOR_PALETTE.length] })));
        } catch { setSegments([]); }
        setLoading(false);
    };

    const loadRfm = async () => {
        setRfmLoading(true);
        try {
            const data = await apiClient.request<RFMEntry[]>('/customers/rfm');
            setRfmData(data || []);
        } catch { setRfmData([]); }
        setRfmLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => loadSegments(), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (activeTab === 'rfm') {
            const timer = setTimeout(() => loadRfm(), 0);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    const totalCustomers = segments.reduce((s, seg) => s + seg.count, 0);
    const selected = selectedSegment ? segments.find(s => s.id === selectedSegment) : null;
    const filteredRfm = selectedSegment && selected
        ? rfmData.filter(r => r.segment === selected.name)
        : rfmData;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Users className="w-8 h-8 text-violet-500" /> Müşteri Segmentleri
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">RFM analizi ile müşteri segmentasyonu ve hedefleme</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={loadSegments} className="p-2 hover:bg-surface rounded-xl text-slate-400 hover:text-foreground transition-all">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 rounded-xl text-white text-sm font-bold hover:bg-violet-700 transition-all">
                        <Download size={16} /> Dışa Aktar
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Toplam Müşteri', value: loading ? '—' : totalCustomers.toLocaleString('tr-TR'), color: 'violet', icon: Users },
                    { label: 'Toplam Segment', value: loading ? '—' : String(segments.length), color: 'blue', icon: Target },
                    { label: 'VIP Oranı', value: loading ? '—' : `%${segments.find(s => s.name.includes('VIP'))?.percentage ?? '—'}`, color: 'amber', icon: Crown },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-surface rounded-2xl border border-border p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2.5 bg-${s.color}-500/10 rounded-xl`}>
                                <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                            </div>
                            <span className="text-slate-500 text-sm font-medium">{s.label}</span>
                        </div>
                        <div className="text-2xl font-black text-foreground">{s.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
                {[{ id: 'overview', label: 'Segmentler' }, { id: 'rfm', label: 'RFM Analizi' }, { id: 'actions', label: 'Aksiyonlar' }].map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                        className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all ${activeTab === t.id ? 'bg-violet-500/20 text-violet-400' : 'text-slate-500 hover:text-foreground'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {loading ? (
                        <div className="col-span-2 py-16 flex items-center justify-center gap-3 text-slate-500 bg-surface rounded-2xl border border-border">
                            <Loader2 size={20} className="animate-spin" /><span className="text-sm">Segmentler yükleniyor...</span>
                        </div>
                    ) : segments.length === 0 ? (
                        <div className="col-span-2 text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
                            <Users size={40} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-bold text-foreground">Henüz müşteri segmenti yok</p>
                            <p className="text-sm text-slate-500 mt-1">Yeterli müşteri verisi birikmesi bekleniyor</p>
                        </div>
                    ) : (
                        segments.map((segment, i) => {
                            const cls = COLOR_CLASSES[segment.color] || COLOR_CLASSES.slate;
                            const Icon = getSegmentIcon(segment.name);
                            const pct = segment.percentage ?? (totalCustomers > 0 ? Math.round(segment.count / totalCustomers * 100) : 0);
                            const isSelected = selectedSegment === segment.id;

                            return (
                                <motion.div key={segment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                    onClick={() => setSelectedSegment(isSelected ? null : segment.id)}
                                    className={`bg-surface rounded-2xl border p-6 cursor-pointer transition-all ${isSelected ? `${cls.border} shadow-lg` : 'border-border hover:border-slate-400/30'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${cls.bg}`}><Icon className={`w-5 h-5 ${cls.text}`} /></div>
                                            <div>
                                                <h3 className="font-bold text-foreground">{segment.name}</h3>
                                                {segment.description && <p className="text-xs text-slate-500 mt-0.5">{segment.description}</p>}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-black ${cls.bg} ${cls.text}`}>%{pct}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {[
                                            { label: 'Müşteri', value: segment.count.toLocaleString('tr-TR'), icon: Users },
                                            { label: 'Gelir', value: segment.revenue, icon: DollarSign },
                                            { label: 'Ort. Sipariş', value: segment.avgOrder, icon: ShoppingCart },
                                        ].map(m => (
                                            <div key={m.label} className="text-center p-2 bg-background/50 rounded-xl">
                                                <div className="text-[10px] text-slate-500 mb-0.5">{m.label}</div>
                                                <div className="text-sm font-black text-foreground">{typeof m.value === 'number' ? m.value.toLocaleString('tr-TR') : m.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>Müşteri oranı</span><span>%{pct}</span>
                                        </div>
                                        <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-700 ${cls.bar}`} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            )}

            {/* RFM */}
            {activeTab === 'rfm' && (
                <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-foreground flex items-center gap-2"><BarChart3 size={16} className="text-violet-400" /> RFM Skoru</h3>
                        <button onClick={loadRfm} className="text-xs text-slate-400 hover:text-foreground flex items-center gap-1 transition-all">
                            <RefreshCw size={12} className={rfmLoading ? 'animate-spin' : ''} /> Yenile
                        </button>
                    </div>
                    {rfmLoading ? (
                        <div className="py-12 flex items-center justify-center gap-3 text-slate-500">
                            <Loader2 size={18} className="animate-spin" /><span className="text-sm">RFM analizi hesaplanıyor...</span>
                        </div>
                    ) : filteredRfm.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <Target size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">RFM verisi bulunamadı</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    {['Müşteri', 'Recency (gün)', 'Frequency', 'Monetary', 'Segment', 'Skor'].map(h => (
                                        <th key={h} className="p-4 text-xs font-bold text-slate-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRfm.map((row, i) => {
                                    const scoreColor = row.score >= 90 ? 'text-amber-500' : row.score >= 70 ? 'text-blue-500' : row.score >= 50 ? 'text-green-500' : 'text-slate-500';
                                    return (
                                        <tr key={i} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                                            <td className="p-4 font-bold text-foreground">{row.customer}</td>
                                            <td className="p-4 text-slate-400">{row.recency} gün</td>
                                            <td className="p-4 text-slate-400">{row.frequency}x</td>
                                            <td className="p-4 text-foreground font-bold">{typeof row.monetary === 'number' ? `₺${row.monetary.toLocaleString('tr-TR')}` : row.monetary}</td>
                                            <td className="p-4"><span className="px-2 py-1 bg-violet-500/10 text-violet-500 rounded-full text-xs font-bold">{row.segment}</span></td>
                                            <td className={`p-4 font-black ${scoreColor}`}>{row.score}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ACTIONS */}
            {activeTab === 'actions' && (
                <div className="space-y-4">
                    {segments.map((segment, i) => {
                        const cls = COLOR_CLASSES[segment.color] || COLOR_CLASSES.slate;
                        const Icon = getSegmentIcon(segment.name);
                        return (
                            <motion.div key={segment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                className="bg-surface rounded-2xl border border-border p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${cls.bg}`}><Icon className={`w-4 h-4 ${cls.text}`} /></div>
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">{segment.name}</h4>
                                            <p className="text-xs text-slate-500">{segment.count.toLocaleString('tr-TR')} müşteri</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all">
                                            <Mail size={12} /> E-posta Kampanyası
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-2 bg-violet-500/10 text-violet-500 rounded-xl text-xs font-bold hover:bg-violet-500/20 transition-all">
                                            <Target size={12} /> Hedefle
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-500 rounded-xl text-xs font-bold hover:bg-green-500/20 transition-all">
                                            <TrendingUp size={12} /> Analiz Et
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
