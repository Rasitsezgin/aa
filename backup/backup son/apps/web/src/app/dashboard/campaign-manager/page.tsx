"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Megaphone, Plus, Calendar, Tag, Target, TrendingUp, Eye,
    Edit, Trash2, Copy, Play, Pause, CheckCircle, Clock,
    Percent, Gift, Zap, Users, BarChart3
} from 'lucide-react';
import { useCampaigns } from '@/lib/hooks';

interface Campaign {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'scheduled' | 'ended' | 'draft';
    startDate: string;
    endDate: string;
    platform: string;
    discount: string;
    affectedProducts: number;
    totalSales: string;
    conversionRate: number;
}

const statusLabels: Record<string, string> = { active: 'Aktif', scheduled: 'Planlanmış', ended: 'Bitti', draft: 'Taslak' };
const statusColors: Record<string, string> = { active: 'emerald', scheduled: 'blue', ended: 'slate', draft: 'yellow' };

export default function CampaignManagerPage() {
    const { campaigns } = useCampaigns();
    const [filter, setFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);

    const normalizedCampaigns: Campaign[] = (Array.isArray(campaigns) ? campaigns : []).map((c: any) => ({
        id: String(c.id),
        name: c.name,
        type: c.type,
        status: c.status === 'completed' ? 'ended' : c.status,
        startDate: c.startDate,
        endDate: c.endDate,
        platform: Array.isArray(c.platforms) && c.platforms.length > 0 ? c.platforms.join(', ') : 'Tümü',
        discount: c.discount !== undefined ? `%${c.discount}` : '-',
        affectedProducts: Array.isArray(c.products) ? c.products.length : 0,
        totalSales: `₺${Number(c.revenue || 0).toLocaleString('tr-TR')}`,
        conversionRate: Number(c.conversionRate || 0),
    }));

    const filtered = filter === 'all' ? normalizedCampaigns : normalizedCampaigns.filter(c => c.status === filter);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-pink-500" /> Kampanya Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-1">İndirim, kupon ve kampanyalarınızı oluşturun ve yönetin</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-medium">
                    <Plus className="w-4 h-4" /> Kampanya Oluştur
                </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Aktif Kampanya', value: normalizedCampaigns.filter(c => c.status === 'active').length, icon: Play },
                    { label: 'Toplam Gelir', value: `₺${normalizedCampaigns.reduce((s, c) => s + Number(String(c.totalSales).replace(/[^\d]/g, '')), 0).toLocaleString('tr-TR')}`, icon: TrendingUp },
                    { label: 'Ort. Dönüşüm', value: normalizedCampaigns.length > 0 ? `%${(normalizedCampaigns.reduce((s, c) => s + c.conversionRate, 0) / normalizedCampaigns.length).toFixed(1)}` : '--', icon: Target },
                    { label: 'Etkilenen Ürün', value: normalizedCampaigns.reduce((s, c) => s + c.affectedProducts, 0), icon: Tag },
                ].map((s, i) => (
                    <div key={i} className="bg-surface rounded-2xl border border-border p-5">
                        <s.icon className="w-5 h-5 text-pink-500 mb-2" />
                        <div className="text-2xl font-bold text-foreground">{s.value}</div>
                        <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
                {['all', 'active', 'scheduled', 'ended'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`flex-1 py-2 text-xs rounded-lg font-medium transition-all ${filter === f ? 'bg-pink-500/20 text-pink-400' : 'text-slate-500 hover:text-foreground'}`}>
                        {f === 'all' ? 'Tümü' : statusLabels[f]}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filtered.length === 0 && (
                    <div className="bg-surface rounded-2xl border border-border p-6 text-sm text-slate-500">Kampanya verisi bulunamadı</div>
                )}
                {filtered.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-surface rounded-2xl border border-border p-5 hover:border-pink-500/30 transition-colors">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-base font-bold text-foreground">{c.name}</h3>
                                    <span className={`px-2 py-0.5 text-xs rounded-full bg-${statusColors[c.status]}-500/20 text-${statusColors[c.status]}-400`}>
                                        {statusLabels[c.status]}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.startDate} → {c.endDate}</span>
                                    <span>{c.platform}</span>
                                    <span className="text-foreground font-medium">{c.discount}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-background rounded-lg text-slate-400"><Eye className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-background rounded-lg text-slate-400"><Edit className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">Satış</div><div className="text-sm font-bold text-foreground">{c.totalSales}</div></div>
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">Dönüşüm</div><div className="text-sm font-bold text-foreground">%{c.conversionRate}</div></div>
                            <div className="p-3 bg-background rounded-xl"><div className="text-xs text-slate-500">Ürün Sayısı</div><div className="text-sm font-bold text-foreground">{c.affectedProducts}</div></div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {showCreate && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl w-full max-w-lg border border-border p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-foreground mb-4">Yeni Kampanya</h3>
                        <div className="space-y-4">
                            <input placeholder="Kampanya Adı" className="w-full px-4 py-2.5 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="date" className="px-3 py-2 bg-background rounded-xl text-sm text-foreground border border-border" />
                                <input type="date" className="px-3 py-2 bg-background rounded-xl text-sm text-foreground border border-border" />
                            </div>
                            <select className="w-full px-4 py-2.5 bg-background rounded-xl text-sm text-foreground border border-border">
                                <option>İndirim</option><option>Paket</option><option>Flash Sale</option><option>Kupon</option><option>Ücretsiz Kargo</option>
                            </select>
                            <input placeholder="İndirim Oranı/Miktarı" className="w-full px-4 py-2.5 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border" />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-background text-foreground rounded-xl text-sm font-medium">İptal</button>
                            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-pink-600 text-white rounded-xl text-sm font-medium">Oluştur</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
