"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCampaigns, Campaign } from '@/lib/hooks';
import {
    Megaphone,
    Plus,
    Calendar,
    Clock,
    Target,
    TrendingUp,
    DollarSign,
    Eye,
    MousePointer,
    ShoppingCart,
    Play,
    Pause,
    Edit,
    Trash2,
    Copy,
    BarChart3,
    Zap,
    Tag,
    Percent,
    Gift,
    Sparkles,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';

// Campaign types
const campaignTypes = [
    { id: 'discount', name: 'İndirim', icon: <Percent size={16} />, color: 'bg-green-500' },
    { id: 'bundle', name: 'Bundle', icon: <Gift size={16} />, color: 'bg-purple-500' },
    { id: 'flash', name: 'Flash Sale', icon: <Zap size={16} />, color: 'bg-orange-500' },
    { id: 'coupon', name: 'Kupon', icon: <Tag size={16} />, color: 'bg-blue-500' }
];

export default function CampaignsPage() {
    const { campaigns: apiCampaigns, loading } = useCampaigns();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    const campaigns: Campaign[] = (Array.isArray(apiCampaigns) && apiCampaigns.length > 0) ? apiCampaigns : [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Aktif
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <Clock size={10} /> Planlandı
                    </span>
                );
            case 'paused':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        <Pause size={10} /> Duraklatıldı
                    </span>
                );
            case 'ended':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        <CheckCircle size={10} /> Tamamlandı
                    </span>
                );
            default:
                return null;
        }
    };

    const getCampaignTypeConfig = (type: string) => {
        return campaignTypes.find(t => t.id === type) || campaignTypes[0];
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesStatus = selectedStatus === 'all' || campaign.status === selectedStatus;
        const matchesType = selectedType === 'all' || campaign.type === selectedType;
        return matchesStatus && matchesType;
    });

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.stats?.revenue ?? c.revenue ?? 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-500 font-medium">Kampanyalar yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Kampanyalar</h1>
                    <p className="text-slate-500 font-medium">Pazaryeri kampanyalarınızı oluşturun ve yönetin</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                    <Plus size={16} /> Yeni Kampanya
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-green-500/10">
                            <Megaphone size={20} className="text-green-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">{activeCampaigns}</div>
                    <div className="text-xs text-slate-500 mt-1">Aktif Kampanya</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                            <DollarSign size={20} className="text-blue-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">₺{(totalBudget / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Bütçe</div>
                    <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(totalSpent / totalBudget) * 100}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">₺{(totalSpent / 1000).toFixed(0)}K harcandı</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6 rounded-2xl border border-green-500/20"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-green-500/10">
                            <TrendingUp size={20} className="text-green-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-green-600">₺{(totalRevenue / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-green-600/70 mt-1">Toplam Gelir</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10">
                            <BarChart3 size={20} className="text-purple-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {(totalRevenue / totalSpent).toFixed(2)}x
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Ortalama ROAS</div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                    {[
                        { id: 'all', label: 'Tümü' },
                        { id: 'active', label: 'Aktif' },
                        { id: 'scheduled', label: 'Planlandı' },
                        { id: 'paused', label: 'Duraklatıldı' },
                        { id: 'ended', label: 'Tamamlandı' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedStatus(filter.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedStatus === filter.id
                                ? 'bg-primary text-white'
                                : 'bg-surface border border-border text-foreground hover:bg-background'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {campaignTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(selectedType === type.id ? 'all' : type.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedType === type.id
                                ? 'bg-primary text-white'
                                : 'bg-surface border border-border text-foreground hover:bg-background'
                                }`}
                        >
                            {type.icon}
                            {type.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaigns List */}
            <div className="space-y-4">
                {filteredCampaigns.map((campaign, idx) => {
                    const typeConfig = getCampaignTypeConfig(campaign.type);

                    return (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all"
                        >
                            <div className="p-5">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${typeConfig.color}`}>
                                            {typeConfig.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-foreground">{campaign.name}</h3>
                                                {getStatusBadge(campaign.status)}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {campaign.startDate} - {campaign.endDate}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Percent size={10} />
                                                    %{campaign.discount} indirim
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {campaign.platforms.map((p: string) => (
                                            <span key={p} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-background border border-border text-slate-500">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Campaign Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 p-4 bg-background rounded-xl">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Gösterim</div>
                                        <div className="text-lg font-bold text-foreground">
                                            {(campaign.stats?.impressions ?? campaign.impressions) > 0 ? `${((campaign.stats?.impressions ?? campaign.impressions) / 1000).toFixed(0)}K` : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Tıklama</div>
                                        <div className="text-lg font-bold text-foreground">
                                            {(campaign.stats?.clicks ?? campaign.clicks) > 0 ? `${((campaign.stats?.clicks ?? campaign.clicks) / 1000).toFixed(1)}K` : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Dönüşüm</div>
                                        <div className="text-lg font-bold text-foreground">
                                            {(campaign.stats?.conversions ?? campaign.conversions) > 0 ? (campaign.stats?.conversions ?? campaign.conversions) : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Harcama</div>
                                        <div className="text-lg font-bold text-foreground">
                                            ₺{(campaign.spent / 1000).toFixed(1)}K
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Gelir</div>
                                        <div className="text-lg font-bold text-green-500">
                                            {(campaign.stats?.revenue ?? campaign.revenue) > 0 ? `₺${((campaign.stats?.revenue ?? campaign.revenue) / 1000).toFixed(0)}K` : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">ROAS</div>
                                        <div className="text-lg font-bold text-primary">
                                            {(campaign.stats?.roas ?? campaign.roas) > 0 ? `${(campaign.stats?.roas ?? campaign.roas).toFixed(2)}x` : '-'}
                                        </div>
                                    </div>
                                </div>

                                {/* Budget Progress */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-slate-500">Bütçe Kullanımı</span>
                                        <span className="font-medium text-foreground">
                                            ₺{campaign.spent.toLocaleString('tr-TR')} / ₺{campaign.budget.toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-background rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            className={`h-full ${campaign.spent / campaign.budget > 0.8 ? 'bg-red-500' : 'bg-primary'}`}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
                                    <button className="p-2 rounded-lg hover:bg-background text-slate-400 hover:text-foreground transition-all">
                                        <BarChart3 size={16} />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-background text-slate-400 hover:text-foreground transition-all">
                                        <Copy size={16} />
                                    </button>
                                    <button className="p-2 rounded-lg hover:bg-background text-slate-400 hover:text-foreground transition-all">
                                        <Edit size={16} />
                                    </button>
                                    {campaign.status === 'active' ? (
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs font-bold text-yellow-500 hover:bg-yellow-500/20 transition-all">
                                            <Pause size={12} /> Duraklat
                                        </button>
                                    ) : campaign.status === 'paused' || campaign.status === 'scheduled' ? (
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs font-bold text-green-500 hover:bg-green-500/20 transition-all">
                                            <Play size={12} /> Başlat
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Create Campaign CTA */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/5 rounded-2xl border border-primary/20 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                            <Sparkles size={24} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">AI Kampanya Önerisi</h3>
                            <p className="text-sm text-slate-500">Yapay zeka, verilerinize göre en uygun kampanya stratejisini önerir</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
                        AI Önerisi Al <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
