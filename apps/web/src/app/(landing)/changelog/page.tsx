"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Zap, Bug, Shield, Rocket, Package, Calendar, ChevronDown, ChevronRight,
    Star, GitBranch, Tag, ArrowRight, Bell, Send, ExternalLink, Search, Filter,
    TrendingUp, Code, Database, Globe, Cpu, Users, BarChart3, Lock, Palette,
    RefreshCw, Check, Clock, Play, Bookmark, Heart, Share2, MessageCircle, Eye
} from 'lucide-react';
import Link from 'next/link';

type ChangeType = 'feature' | 'improvement' | 'fix' | 'security' | 'breaking' | 'deprecated';

interface Change {
    type: ChangeType;
    title: string;
    description?: string;
    tag?: string;
    link?: string;
}

interface Release {
    version: string;
    date: string;
    title: string;
    description: string;
    changes: Change[];
    isLatest?: boolean;
    isMajor?: boolean;
    highlights?: string[];
    contributors?: number;
    commits?: number;
}

// Kapsamlı release geçmişi
const releases: Release[] = [
    {
        version: "2.5.0",
        date: "4 Şubat 2026",
        title: "AI Danışman 2.0 & Akıllı Fiyatlandırma",
        description: "Yapay zeka destekli fiyat optimizasyonu, rakip analizi ve otomatik strateji önerileri.",
        isLatest: true,
        isMajor: true,
        highlights: ["AI Fiyat Optimizasyonu", "Rakip Takip Sistemi", "Strateji Önerileri"],
        contributors: 12,
        commits: 156,
        changes: [
            { type: 'feature', title: "AI Akıllı Fiyatlandırma Motoru", description: "Rakip fiyatlarını analiz ederek optimal fiyat önerileri sunar. Kar marjı, rekabet ve talep dengesini otomatik ayarlar.", tag: "AI" },
            { type: 'feature', title: "Rakip Fiyat Takip Sistemi", description: "Belirlediğiniz rakiplerin fiyatlarını gerçek zamanlı takip edin. Fiyat değişikliklerinde anında bildirim alın.", tag: "Yeni" },
            { type: 'feature', title: "Dinamik Fiyat Kuralları", description: "Koşul bazlı otomatik fiyat güncelleme kuralları oluşturun." },
            { type: 'improvement', title: "AI Danışman yanıt hızı %70 arttı", tag: "Performans" },
            { type: 'improvement', title: "Fiyat geçmişi grafikleri eklendi" },
            { type: 'fix', title: "Toplu fiyat güncelleme timeout hatası düzeltildi" },
            { type: 'security', title: "API rate limiting güçlendirildi" },
        ]
    },
    {
        version: "2.4.0",
        date: "30 Ocak 2026",
        title: "AI SEO Motoru v2",
        description: "Gemini Pro entegrasyonu ile güçlendirilmiş yeni AI SEO motoru ve toplu optimizasyon özellikleri.",
        isMajor: true,
        highlights: ["Gemini Pro AI", "Toplu SEO", "Anahtar Kelime Analizi"],
        contributors: 8,
        commits: 124,
        changes: [
            { type: 'feature', title: "Gemini Pro AI entegrasyonu", description: "Google'ın en gelişmiş AI modeli ile ürün açıklamalarınızı optimize edin.", tag: "AI" },
            { type: 'feature', title: "Toplu SEO optimizasyonu", description: "Tek tıkla binlerce ürününüzü optimize edin." },
            { type: 'feature', title: "Anahtar kelime araştırma aracı", description: "Trend anahtar kelimeleri keşfedin ve ürünlerinize ekleyin." },
            { type: 'improvement', title: "Anahtar kelime önerileri iyileştirildi" },
            { type: 'improvement', title: "SEO skoru algoritması güncellendi" },
            { type: 'fix', title: "Uzun başlıklarda karakter limiti sorunu düzeltildi" },
        ]
    },
    {
        version: "2.3.2",
        date: "22 Ocak 2026",
        title: "Hepsiburada API v3",
        description: "Hepsiburada'nın yeni API versiyonuna tam uyumluluk ve performans iyileştirmeleri.",
        contributors: 5,
        commits: 67,
        changes: [
            { type: 'feature', title: "Hepsiburada API v3 desteği", tag: "Entegrasyon" },
            { type: 'improvement', title: "Sipariş senkronizasyon hızı %40 arttı", tag: "Performans" },
            { type: 'improvement', title: "Stok güncelleme batch işlemi optimize edildi" },
            { type: 'fix', title: "Kargo takip numarası aktarım hatası düzeltildi" },
            { type: 'fix', title: "Fiyat güncelleme gecikmesi giderildi" },
        ]
    },
    {
        version: "2.3.1",
        date: "15 Ocak 2026",
        title: "Performans İyileştirmeleri",
        description: "Dashboard yükleme süreleri ve genel uygulama performansı iyileştirildi.",
        contributors: 4,
        commits: 45,
        changes: [
            { type: 'improvement', title: "Dashboard yükleme süresi %60 azaldı", tag: "Performans" },
            { type: 'improvement', title: "Ürün listesi sayfalama optimizasyonu" },
            { type: 'improvement', title: "Bellek kullanımı optimize edildi" },
            { type: 'improvement', title: "API response caching eklendi" },
            { type: 'security', title: "Güvenlik yamaları uygulandı" },
        ]
    },
    {
        version: "2.3.0",
        date: "8 Ocak 2026",
        title: "Çoklu Depo Yönetimi",
        description: "Birden fazla depo ve lokasyondan stok yönetimi artık mümkün.",
        isMajor: true,
        highlights: ["Multi-Warehouse", "Stok Transferi", "Lokasyon Raporları"],
        contributors: 7,
        commits: 98,
        changes: [
            { type: 'feature', title: "Çoklu depo desteği", description: "Farklı lokasyonlardaki stokları tek ekrandan yönetin.", tag: "Yeni" },
            { type: 'feature', title: "Depo bazlı stok transferi", description: "Depolar arası stok aktarımı yapın." },
            { type: 'feature', title: "Lokasyon bazlı raporlama" },
            { type: 'feature', title: "Depo kapasitesi takibi" },
            { type: 'improvement', title: "Stok uyarı sistemi geliştirildi" },
            { type: 'fix', title: "Negatif stok kontrolü iyileştirildi" },
        ]
    },
    {
        version: "2.2.0",
        date: "20 Aralık 2025",
        title: "Amazon Türkiye Entegrasyonu",
        description: "Amazon Türkiye pazaryeri tam entegrasyonu eklendi.",
        isMajor: true,
        highlights: ["Amazon TR", "FBA Desteği", "Reklam Yönetimi"],
        contributors: 9,
        commits: 134,
        changes: [
            { type: 'feature', title: "Amazon Türkiye entegrasyonu", description: "Ürün, sipariş ve stok senkronizasyonu.", tag: "Entegrasyon" },
            { type: 'feature', title: "Amazon FBA desteği", description: "FBA envanterinizi yönetin." },
            { type: 'feature', title: "Amazon reklam entegrasyonu" },
            { type: 'feature', title: "A+ Content yönetimi" },
            { type: 'improvement', title: "Pazaryeri bağlantı sihirbazı yenilendi" },
        ]
    },
    {
        version: "2.1.0",
        date: "5 Aralık 2025",
        title: "Gelişmiş Raporlama",
        description: "Özelleştirilebilir raporlar, otomatik rapor gönderimi ve dashboard widget'ları.",
        isMajor: true,
        contributors: 6,
        commits: 89,
        changes: [
            { type: 'feature', title: "Özelleştirilebilir rapor oluşturucu", tag: "Yeni" },
            { type: 'feature', title: "Otomatik e-posta rapor gönderimi" },
            { type: 'feature', title: "Dashboard widget'ları" },
            { type: 'feature', title: "Rapor şablonları" },
            { type: 'improvement', title: "Excel/PDF dışa aktarım geliştirildi" },
        ]
    },
    {
        version: "2.0.0",
        date: "15 Kasım 2025",
        title: "Pazaryonetimi 2.0 - Yeni Nesil Platform",
        description: "Tamamen yeniden tasarlanmış arayüz, yeni altyapı ve onlarca yeni özellik.",
        isMajor: true,
        highlights: ["Yeni Arayüz", "AI Entegrasyonu", "10x Hız"],
        contributors: 15,
        commits: 450,
        changes: [
            { type: 'feature', title: "Tamamen yeni kullanıcı arayüzü", description: "Modern, hızlı ve kullanıcı dostu tasarım.", tag: "Major" },
            { type: 'feature', title: "AI destekli öneri sistemi" },
            { type: 'feature', title: "Gerçek zamanlı bildirimler" },
            { type: 'feature', title: "Mobil uygulama desteği" },
            { type: 'improvement', title: "Platform performansı 10x arttı", tag: "Performans" },
            { type: 'breaking', title: "API v1 deprecated edildi", description: "v2'ye geçiş için dokümantasyonu inceleyin." },
            { type: 'security', title: "Yeni güvenlik altyapısı" },
        ]
    },
];

// Değişiklik tipi konfigürasyonları
const getTypeConfig = (type: ChangeType) => {
    switch (type) {
        case 'feature':
            return { icon: Sparkles, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', gradient: 'from-orange-500 to-amber-500', label: 'Yeni Özellik' };
        case 'improvement':
            return { icon: Zap, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', gradient: 'from-emerald-500 to-green-500', label: 'İyileştirme' };
        case 'fix':
            return { icon: Bug, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', gradient: 'from-amber-500 to-orange-500', label: 'Düzeltme' };
        case 'security':
            return { icon: Shield, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', gradient: 'from-red-500 to-rose-500', label: 'Güvenlik' };
        case 'breaking':
            return { icon: RefreshCw, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', gradient: 'from-purple-500 to-pink-500', label: 'Breaking Change' };
        case 'deprecated':
            return { icon: Clock, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30', gradient: 'from-slate-500 to-gray-500', label: 'Deprecated' };
    }
};

// İstatistikler
const stats = [
    { label: 'Toplam Sürüm', value: releases.length, icon: Tag },
    { label: 'Bu Ay', value: releases.filter(r => r.date.includes('2026')).length, icon: Calendar },
    { label: 'Yeni Özellik', value: releases.reduce((acc, r) => acc + r.changes.filter(c => c.type === 'feature').length, 0), icon: Sparkles },
    { label: 'Toplam Commit', value: releases.reduce((acc, r) => acc + (r.commits || 0), 0), icon: GitBranch },
];

export default function ChangelogPage() {
    const [filter, setFilter] = useState<ChangeType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([releases[0].version]));
    const [showMajorOnly, setShowMajorOnly] = useState(false);

    // Toggle version expand
    const toggleVersion = (version: string) => {
        const newExpanded = new Set(expandedVersions);
        if (newExpanded.has(version)) {
            newExpanded.delete(version);
        } else {
            newExpanded.add(version);
        }
        setExpandedVersions(newExpanded);
    };

    // Filtreleme
    const filteredReleases = useMemo(() => {
        let filtered = releases;

        // Major only filter
        if (showMajorOnly) {
            filtered = filtered.filter(r => r.isMajor);
        }

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(r => 
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.changes.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Type filter
        if (filter !== 'all') {
            filtered = filtered.map(release => ({
                ...release,
                changes: release.changes.filter(c => c.type === filter)
            })).filter(r => r.changes.length > 0);
        }

        return filtered;
    }, [filter, searchQuery, showMajorOnly]);

    // Değişiklik sayıları
    const changeCounts = useMemo(() => {
        const counts: Record<ChangeType | 'all', number> = { all: 0, feature: 0, improvement: 0, fix: 0, security: 0, breaking: 0, deprecated: 0 };
        releases.forEach(r => {
            r.changes.forEach(c => {
                counts[c.type]++;
                counts.all++;
            });
        });
        return counts;
    }, []);

    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border border-purple-200 dark:border-purple-800 rounded-full mb-6"
                    >
                        <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300 tracking-wide">Changelog</span>
                    </motion.div>
                    
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="block">Yenilikler &</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
                            Güncellemeler
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Pazaryonetimi&apos;ndeki son geliştirmeleri, yeni özellikleri ve iyileştirmeleri takip edin.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
                >
                    {stats.map((stat, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center hover:shadow-lg transition-shadow">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                                <stat.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Latest Release Hero */}
                {releases[0] && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="max-w-4xl mx-auto mb-12 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 relative overflow-hidden"
                    >
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                        
                        <div className="relative z-10">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-4 py-1.5 bg-white/20 backdrop-blur rounded-lg text-white font-mono font-bold">
                                    v{releases[0].version}
                                </span>
                                <span className="px-3 py-1 bg-emerald-400/20 text-emerald-100 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                                    <Star size={12} fill="currentColor" /> En Yeni
                                </span>
                                <span className="text-white/70 text-sm flex items-center gap-1">
                                    <Calendar size={14} /> {releases[0].date}
                                </span>
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{releases[0].title}</h2>
                            <p className="text-lg text-white/80 mb-6">{releases[0].description}</p>
                            
                            {/* Highlights */}
                            {releases[0].highlights && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {releases[0].highlights.map((highlight, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium">
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Quick stats */}
                            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
                                <span className="flex items-center gap-2">
                                    <Sparkles size={16} /> {releases[0].changes.filter(c => c.type === 'feature').length} yeni özellik
                                </span>
                                <span className="flex items-center gap-2">
                                    <GitBranch size={16} /> {releases[0].commits} commit
                                </span>
                                <span className="flex items-center gap-2">
                                    <Users size={16} /> {releases[0].contributors} katkıda bulunan
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl mx-auto mb-8"
                >
                    {/* Search & Toggle */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Güncelleme ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                            />
                        </div>
                        <button
                            onClick={() => setShowMajorOnly(!showMajorOnly)}
                            className={`px-5 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                                showMajorOnly
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                        >
                            <Star size={16} />
                            Sadece Major
                        </button>
                    </div>
                    
                    {/* Type Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                        >
                            Tümü ({changeCounts.all})
                        </button>
                        {(['feature', 'improvement', 'fix', 'security'] as ChangeType[]).map(type => {
                            const config = getTypeConfig(type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${filter === type
                                        ? `${config.bg} ${config.color}`
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                                >
                                    <config.icon size={14} />
                                    {config.label} ({changeCounts[type]})
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Releases Timeline */}
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500 via-pink-500 to-slate-200 dark:to-slate-800 hidden sm:block" />
                        
                        <div className="space-y-6">
                            {filteredReleases.map((release, index) => {
                                const isExpanded = expandedVersions.has(release.version);
                                const isLatest = index === 0;
                                
                                return (
                                    <motion.div
                                        key={release.version}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + index * 0.03 }}
                                        className="relative"
                                    >
                                        {/* Timeline dot */}
                                        <div className={`absolute left-4 md:left-6 top-8 w-4 h-4 rounded-full border-2 hidden sm:block ${
                                            release.isMajor 
                                                ? 'bg-purple-600 border-purple-300 dark:border-purple-700' 
                                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                                        }`}>
                                            {release.isMajor && (
                                                <span className="absolute inset-0 rounded-full animate-ping bg-purple-400/50" />
                                            )}
                                        </div>

                                        <div className={`sm:ml-16 rounded-2xl border transition-all hover:shadow-lg ${
                                            release.isMajor
                                                ? 'bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700'
                                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                        }`}>
                                            {/* Header */}
                                            <button
                                                onClick={() => toggleVersion(release.version)}
                                                className="w-full p-6 flex items-start justify-between text-left"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className={`px-3 py-1 rounded-lg text-sm font-mono font-bold ${
                                                            release.isMajor
                                                                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                                                                : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                                                        }`}>
                                                            v{release.version}
                                                        </span>
                                                        {release.isLatest && (
                                                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                                                                <Star size={10} fill="currentColor" /> En Yeni
                                                            </span>
                                                        )}
                                                        {release.isMajor && !release.isLatest && (
                                                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-[10px] font-bold uppercase">
                                                                Major
                                                            </span>
                                                        )}
                                                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {release.date}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{release.title}</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{release.description}</p>
                                                    
                                                    {/* Quick info */}
                                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Code size={12} /> {release.changes.length} değişiklik
                                                        </span>
                                                        {release.commits && (
                                                            <span className="flex items-center gap-1">
                                                                <GitBranch size={12} /> {release.commits} commit
                                                            </span>
                                                        )}
                                                        {release.contributors && (
                                                            <span className="flex items-center gap-1">
                                                                <Users size={12} /> {release.contributors} katkı
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Changes */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-white/10">
                                                            {/* Highlights */}
                                                            {release.highlights && (
                                                                <div className="flex flex-wrap gap-2 mb-6">
                                                                    {release.highlights.map((highlight, i) => (
                                                                        <span key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                                                                            ✨ {highlight}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Changes list */}
                                                            <div className="space-y-3">
                                                                {release.changes.map((change, i) => {
                                                                    const config = getTypeConfig(change.type);
                                                                    return (
                                                                        <motion.div 
                                                                            key={i}
                                                                            initial={{ opacity: 0, x: -10 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: i * 0.03 }}
                                                                            className="flex items-start gap-3 group"
                                                                        >
                                                                            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                                                <config.icon size={14} className={config.color} />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                    <p className="font-medium text-slate-900 dark:text-white">{change.title}</p>
                                                                                    {change.tag && (
                                                                                        <span className={`px-1.5 py-0.5 ${config.bg} ${config.color} rounded text-[10px] font-bold`}>
                                                                                            {change.tag}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                {change.description && (
                                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{change.description}</p>
                                                                                )}
                                                                            </div>
                                                                        </motion.div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* No results */}
                    {filteredReleases.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sonuç Bulunamadı</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Arama kriterlerinize uygun güncelleme bulunamadı.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setFilter('all'); setShowMajorOnly(false); }}
                                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                            >
                                Filtreleri Temizle
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Subscribe CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mt-20 relative p-10 md:p-16 rounded-3xl overflow-hidden"
                >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600" />
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />
                    
                    <div className="relative z-10 text-center">
                        <Bell className="w-16 h-16 text-white/20 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Güncellemelerden Haberdar Olun
                        </h2>
                        <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
                            Yeni özellik ve iyileştirmeler hakkında e-posta bildirimleri alın. 
                            Spam yok, sadece önemli güncellemeler.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="E-posta adresiniz"
                                className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                            />
                            <button className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
                                <Send size={18} /> Abone Ol
                            </button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-white/20 text-sm text-white/60">
                            <span className="flex items-center gap-2">
                                <Check size={16} className="text-emerald-300" /> Ayda 1-2 e-posta
                            </span>
                            <span className="flex items-center gap-2">
                                <Check size={16} className="text-emerald-300" /> İstediğiniz zaman iptal
                            </span>
                            <span className="flex items-center gap-2">
                                <Check size={16} className="text-emerald-300" /> Spam yok
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mt-12 grid md:grid-cols-3 gap-4"
                >
                    <Link href="/docs/api" className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all">
                        <Code className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">API Dokümantasyon</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Detaylı API referansı</p>
                    </Link>
                    
                    <Link href="/status" className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all">
                        <BarChart3 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Sistem Durumu</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gerçek zamanlı durum</p>
                    </Link>
                    
                    <Link href="/destek" className="group p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-all">
                        <MessageCircle className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Destek Merkezi</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Yardım ve rehberler</p>
                    </Link>
                </motion.div>
            </div>
        </MarketingPageShell>
    );
}
