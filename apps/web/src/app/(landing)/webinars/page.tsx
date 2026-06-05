"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Calendar, Clock, Users, Star, ArrowRight, Bell,
    Video, Mic, Globe, Search, Filter, CheckCircle2, Sparkles,
    ExternalLink, Share2, BookmarkPlus, CalendarPlus, ChevronDown,
    Eye, MessageSquare, Award, Target, TrendingUp, Zap
} from 'lucide-react';
import Link from 'next/link';

interface Webinar {
    id: string;
    title: string;
    description: string;
    speaker: {
        name: string;
        role: string;
        company: string;
        avatar?: string;
    };
    date: string;
    time: string;
    duration: string;
    status: 'upcoming' | 'live' | 'recorded';
    category: string;
    tags: string[];
    thumbnail: string;
    attendees?: number;
    views?: number;
    rating?: number;
    featured?: boolean;
    recordingUrl?: string;
}

const webinars: Webinar[] = [
    {
        id: 'ai-pricing-2026',
        title: 'AI Destekli Fiyatlandırma ile Kar Marjınızı 3x Artırın',
        description: 'Yapay zeka algoritmaları kullanarak dinamik fiyatlandırma stratejileri oluşturun. Rakip analizi, talep tahminleme ve otomatik fiyat optimizasyonu.',
        speaker: { name: 'Dr. Zeynep Kaya', role: 'AI Stratejisti', company: 'Pazaryonetimi' },
        date: '15 Şubat 2026',
        time: '14:00',
        duration: '60 dk',
        status: 'upcoming',
        category: 'AI & Otomasyon',
        tags: ['AI', 'fiyatlandırma', 'otomasyon'],
        thumbnail: 'from-violet-500 via-purple-500 to-amber-600',
        attendees: 342,
        featured: true
    },
    {
        id: 'trendyol-masterclass',
        title: 'Trendyol Satış Masterclass: Sıfırdan Zirveye',
        description: 'Trendyol algoritmasını çözün, badge sistemini anlayın ve satışlarınızı patlayın. Gerçek vaka analizleri ve kanıtlanmış stratejiler.',
        speaker: { name: 'Ahmet Yıldırım', role: 'E-ticaret Uzmanı', company: 'Pazaryonetimi' },
        date: '20 Şubat 2026',
        time: '11:00',
        duration: '90 dk',
        status: 'upcoming',
        category: 'Pazaryeri Stratejileri',
        tags: ['Trendyol', 'strateji', 'satış'],
        thumbnail: 'from-orange-500 via-red-500 to-pink-600',
        attendees: 567,
        featured: true
    },
    {
        id: 'multi-channel-live',
        title: '🔴 CANLI: Çoklu Kanal Yönetimi Demo',
        description: '5+ pazaryerini tek ekrandan yönetin. Canlı demo ve soru-cevap seansı.',
        speaker: { name: 'Burak Aydın', role: 'Çözüm Mimarı', company: 'Pazaryonetimi' },
        date: 'Şimdi',
        time: 'CANLI',
        duration: '45 dk',
        status: 'live',
        category: 'Canlı Demo',
        tags: ['çoklu kanal', 'demo', 'canlı'],
        thumbnail: 'from-red-500 via-rose-500 to-pink-600',
        attendees: 128,
    },
    {
        id: 'inventory-automation',
        title: 'Stok Yönetimi Otomasyonu: Sıfır Hata Stratejisi',
        description: 'Stok senkronizasyonu, düşük stok uyarıları ve otomatik sipariş sistemleri.',
        speaker: { name: 'Can Yılmaz', role: 'Operasyon Müdürü', company: 'Pazaryonetimi' },
        date: '25 Şubat 2026',
        time: '15:00',
        duration: '60 dk',
        status: 'upcoming',
        category: 'Stok Yönetimi',
        tags: ['stok', 'otomasyon', 'envanter'],
        thumbnail: 'from-emerald-500 via-teal-500 to-cyan-600',
        attendees: 234
    },
    {
        id: 'seo-optimization-recorded',
        title: 'Pazaryeri SEO Optimizasyonu - Arama Sonuçlarında #1 Olun',
        description: 'Ürün başlıkları, açıklamalar ve görseller için SEO teknikleri. A/B test stratejileri.',
        speaker: { name: 'Selin Arslan', role: 'SEO Uzmanı', company: 'Pazaryonetimi' },
        date: '5 Ocak 2026',
        time: 'Kayıt',
        duration: '75 dk',
        status: 'recorded',
        category: 'SEO & Görünürlük',
        tags: ['SEO', 'optimizasyon', 'arama'],
        thumbnail: 'from-orange-500 via-amber-500 to-violet-600',
        views: 4520,
        rating: 4.9
    },
    {
        id: 'analytics-deep-dive',
        title: 'Analytics Deep Dive: Veriden Karara',
        description: 'KPI\'ları anlayın, dashboard\'ları özelleştirin ve veri odaklı kararlar alın.',
        speaker: { name: 'Deniz Öztürk', role: 'Data Analyst', company: 'Pazaryonetimi' },
        date: '20 Aralık 2025',
        time: 'Kayıt',
        duration: '60 dk',
        status: 'recorded',
        category: 'Analytics',
        tags: ['analytics', 'veri', 'KPI'],
        thumbnail: 'from-cyan-500 via-sky-500 to-amber-600',
        views: 3890,
        rating: 4.8
    },
    {
        id: 'customer-success',
        title: 'Müşteri Başarı Hikayeleri: 10x Büyüme Stratejileri',
        description: 'Pazaryonetimi ile büyüyen 5 işletmenin gerçek hikayeleri ve stratejileri.',
        speaker: { name: 'Elif Demir', role: 'Customer Success', company: 'Pazaryonetimi' },
        date: '10 Aralık 2025',
        time: 'Kayıt',
        duration: '45 dk',
        status: 'recorded',
        category: 'Başarı Hikayeleri',
        tags: ['başarı', 'büyüme', 'strateji'],
        thumbnail: 'from-amber-500 via-orange-500 to-red-500',
        views: 6120,
        rating: 4.9
    },
    {
        id: 'hepsiburada-strategies',
        title: 'Hepsiburada Satış Stratejileri 2026',
        description: 'Hepsiburada\'da öne çıkma, kampanya yönetimi ve müşteri ilişkileri.',
        speaker: { name: 'Mert Kılıç', role: 'Marketplace Danışmanı', company: 'Pazaryonetimi' },
        date: '1 Mart 2026',
        time: '10:00',
        duration: '60 dk',
        status: 'upcoming',
        category: 'Pazaryeri Stratejileri',
        tags: ['Hepsiburada', 'strateji', 'kampanya'],
        thumbnail: 'from-yellow-500 via-amber-500 to-orange-500',
        attendees: 189
    }
];

const categories = [
    'Tümü',
    'AI & Otomasyon',
    'Pazaryeri Stratejileri',
    'Stok Yönetimi',
    'SEO & Görünürlük',
    'Analytics',
    'Başarı Hikayeleri',
    'Canlı Demo'
];

const statusFilters = [
    { value: 'all', label: 'Tümü', icon: Globe },
    { value: 'upcoming', label: 'Yaklaşan', icon: Calendar },
    { value: 'live', label: 'Canlı', icon: Video },
    { value: 'recorded', label: 'Kayıtlar', icon: Play },
];

export default function WebinarsPage() {
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [email, setEmail] = useState('');

    const filteredWebinars = useMemo(() => {
        return webinars.filter(w => {
            const matchCategory = selectedCategory === 'Tümü' || w.category === selectedCategory;
            const matchStatus = selectedStatus === 'all' || w.status === selectedStatus;
            const matchSearch = searchQuery === '' ||
                w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                w.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCategory && matchStatus && matchSearch;
        });
    }, [selectedCategory, selectedStatus, searchQuery]);

    const liveWebinar = webinars.find(w => w.status === 'live');
    const featuredWebinars = webinars.filter(w => w.featured);
    const upcomingWebinars = webinars.filter(w => w.status === 'upcoming');

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-red-500/10 dark:bg-red-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/20 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 border border-red-200/50 dark:border-red-700/50 rounded-full mb-8"
                    >
                        <Video size={16} className="text-red-600 dark:text-red-400" />
                        <span className="text-sm font-bold text-red-700 dark:text-red-300 tracking-wide">WEBINARLAR</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                            Canlı
                        </span>{' '}
                        Eğitimler
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        Uzmanlardan canlı eğitimler, interaktif demo&apos;lar ve soru-cevap seansları.
                        <span className="text-red-600 dark:text-red-400 font-semibold"> Ücretsiz katılın.</span>
                    </p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-8 mt-10"
                    >
                        {[
                            { label: 'Toplam Webinar', value: '50+', icon: Video },
                            { label: 'Toplam İzlenme', value: '25K+', icon: Eye },
                            { label: 'Ortalama Puan', value: '4.8', icon: Star },
                            { label: 'Katılımcı', value: '10K+', icon: Users },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 flex items-center justify-center">
                                    <stat.icon size={18} className="text-red-600 dark:text-red-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Live Banner */}
                {liveWebinar && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="relative p-6 md:p-8 rounded-2xl overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-r ${liveWebinar.thumbnail}`} />
                            <div className="absolute inset-0 bg-black/30" />

                            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full animate-pulse">
                                        <div className="w-3 h-3 bg-white rounded-full" />
                                        <span className="text-white font-bold">CANLI YAYIN</span>
                                    </div>
                                    <div className="text-white">
                                        <h3 className="text-xl font-bold">{liveWebinar.title}</h3>
                                        <p className="text-white/70">{liveWebinar.attendees} kişi izliyor</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/webinars/${liveWebinar.id}`}
                                    className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                    <Play size={18} className="fill-current" />
                                    Şimdi Katıl
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    {/* Search */}
                    <div className="max-w-xl mx-auto mb-8">
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Webinar ara..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            />
                        </div>
                    </div>

                    {/* Status Filters */}
                    <div className="flex flex-wrap gap-3 justify-center mb-6">
                        {statusFilters.map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setSelectedStatus(filter.value)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${selectedStatus === filter.value
                                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                <filter.icon size={16} />
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Featured Webinars */}
                {selectedStatus === 'all' && selectedCategory === 'Tümü' && featuredWebinars.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Star size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Öne Çıkan Webinarlar</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">En çok beklenen etkinlikler</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {featuredWebinars.map((webinar, i) => (
                                <motion.div
                                    key={webinar.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1 }}
                                    className="group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${webinar.thumbnail}`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                    <div className="relative p-8 min-h-[300px] flex flex-col justify-end">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                                                {webinar.category}
                                            </span>
                                            <span className="px-3 py-1 bg-emerald-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                                                <Calendar size={12} />
                                                {webinar.date}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold text-white mb-2">{webinar.title}</h3>
                                        <p className="text-white/70 mb-4 line-clamp-2">{webinar.description}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
                                                    👤
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{webinar.speaker.name}</div>
                                                    <div className="text-white/60 text-sm">{webinar.speaker.role}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-white/70 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {webinar.duration}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    {webinar.attendees}
                                                </span>
                                            </div>
                                        </div>

                                        <button className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                                            <Bell size={18} />
                                            Hatırlatıcı Kur
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* All Webinars Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                                <Video size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tüm Webinarlar</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{filteredWebinars.length} webinar bulundu</p>
                            </div>
                        </div>
                    </div>

                    {filteredWebinars.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Webinar Bulunamadı</h3>
                            <p className="text-slate-500 dark:text-slate-400">Farklı filtreler deneyin.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredWebinars.map((webinar, i) => (
                                    <motion.div
                                        key={webinar.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        layout
                                        className="group rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 transition-all hover:shadow-xl"
                                    >
                                        {/* Thumbnail */}
                                        <div className={`relative h-40 bg-gradient-to-br ${webinar.thumbnail} flex items-center justify-center`}>
                                            {webinar.status === 'live' ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-red-500 rounded-full animate-pulse">
                                                    <div className="w-3 h-3 bg-white rounded-full" />
                                                    <span className="text-white font-bold">CANLI</span>
                                                </div>
                                            ) : webinar.status === 'recorded' ? (
                                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Play size={28} className="text-white fill-white" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <Calendar size={28} className="text-white" />
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${webinar.status === 'live' ? 'bg-red-500 text-white' :
                                                        webinar.status === 'upcoming' ? 'bg-emerald-500 text-white' :
                                                            'bg-slate-700 text-white'
                                                    }`}>
                                                    {webinar.status === 'live' ? '🔴 CANLI' :
                                                        webinar.status === 'upcoming' ? '📅 YAKLAŞAN' :
                                                            '▶️ KAYIT'}
                                                </span>
                                            </div>

                                            {/* Duration */}
                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs font-mono text-white">
                                                {webinar.duration}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                                    {webinar.category}
                                                </span>
                                                {webinar.status === 'upcoming' && (
                                                    <span className="text-xs text-slate-400">
                                                        • {webinar.date}, {webinar.time}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                                {webinar.title}
                                            </h3>

                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                                {webinar.description}
                                            </p>

                                            {/* Speaker */}
                                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-white/10">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm">
                                                    👤
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{webinar.speaker.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{webinar.speaker.role}</div>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                    {webinar.status === 'recorded' ? (
                                                        <>
                                                            <span className="flex items-center gap-1">
                                                                <Eye size={12} />
                                                                {webinar.views?.toLocaleString()}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                                                {webinar.rating}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <Users size={12} />
                                                            {webinar.attendees} kayıtlı
                                                        </span>
                                                    )}
                                                </div>

                                                <button className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${webinar.status === 'live'
                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                        : webinar.status === 'recorded'
                                                            ? 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                    }`}>
                                                    {webinar.status === 'live' ? 'Katıl' :
                                                        webinar.status === 'recorded' ? 'İzle' :
                                                            'Kayıt Ol'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Newsletter CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24"
                >
                    <div className="relative p-12 md:p-16 rounded-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-600 to-amber-600" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        <div className="relative text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                <Bell size={16} className="text-white" />
                                <span className="text-sm font-bold text-white">WEBİNAR BİLDİRİMLERİ</span>
                            </div>

                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Yeni Webinarları Kaçırmayın
                            </h3>

                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                                Haftalık webinar duyuruları ve özel davetler için abone olun.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="E-posta adresiniz"
                                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                                />
                                <button className="px-8 py-4 bg-white text-orange-700 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                                    Abone Ol
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Daha fazlasını keşfedin</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { label: 'Video Kütüphanesi', href: '/video-library', icon: Play },
                            { label: 'Kaynaklar', href: '/resources', icon: Target },
                            { label: 'Demo Talep Et', href: '/demo', icon: Zap },
                        ].map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors font-medium"
                            >
                                <link.icon size={16} />
                                {link.label}
                                <ExternalLink size={14} className="text-slate-400" />
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
