"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Clock, Users, Search, Star, Eye,
    Calendar, BookOpen,
    ArrowRight, ExternalLink, Sparkles, GraduationCap,
    Award, Target, TrendingUp,
    BarChart3, Layers, CheckCircle2,
    PlayCircle, Pause, Volume2, Maximize2, Settings
} from 'lucide-react';
import Link from 'next/link';

interface Video {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'webinar' | 'course' | 'tutorial' | 'live';
    thumbnail: string;
    duration: string;
    totalVideos?: number;
    views?: number;
    rating?: number;
    date?: string;
    instructor?: {
        name: string;
        role: string;
        avatar?: string;
    };
    level: 'beginner' | 'intermediate' | 'advanced';
    featured?: boolean;
    new?: boolean;
    popular?: boolean;
    progress?: number;
    chapters?: number;
    language?: string;
    tags?: string[];
}

const videos: Video[] = [
    {
        id: 'complete-ecommerce-course',
        title: 'Komple E-ticaret Masterclass 2026',
        description: 'Sıfırdan profesyonele: Pazaryeri satışının A\'dan Z\'ye tüm sırları. 50+ ders, 15+ saat içerik.',
        type: 'course',
        thumbnail: 'from-violet-600 via-purple-600 to-amber-700',
        duration: '15 saat',
        totalVideos: 52,
        views: 45200,
        rating: 4.9,
        instructor: { name: 'Ahmet Yıldırım', role: 'E-ticaret Uzmanı' },
        level: 'beginner',
        featured: true,
        chapters: 8,
        language: 'Türkçe',
        tags: ['başlangıç', 'kapsamlı', 'sertifikalı']
    },
    {
        id: 'pazaryonetimi-intro',
        title: 'Pazaryonetimi\'ye Hoş Geldiniz',
        description: 'Platform tanıtımı ve temel özelliklerin 5 dakikada keşfi. İlk adımınızı atın.',
        type: 'video',
        thumbnail: 'from-orange-500 via-sky-500 to-cyan-500',
        duration: '5 dk',
        views: 128500,
        rating: 4.8,
        instructor: { name: 'Pazaryonetimi', role: 'Resmi' },
        level: 'beginner',
        featured: true,
        new: true,
        tags: ['giriş', 'hızlı', 'temel']
    },
    {
        id: 'ai-seo-masterclass',
        title: 'AI SEO ile Satışları 10x Artırın',
        description: 'Yapay zeka destekli ürün optimizasyonu. Başlık, açıklama ve görsel SEO teknikleri.',
        type: 'course',
        thumbnail: 'from-emerald-500 via-teal-500 to-cyan-600',
        duration: '4 saat',
        totalVideos: 18,
        views: 32100,
        rating: 4.9,
        instructor: { name: 'Dr. Zeynep Kara', role: 'SEO Stratejisti' },
        level: 'intermediate',
        featured: true,
        popular: true,
        chapters: 5,
        tags: ['AI', 'SEO', 'optimizasyon']
    },
    {
        id: 'trendyol-success',
        title: 'Trendyol\'da Zirveye Çıkın',
        description: 'Trendyol algoritması, badge sistemi ve öne çıkma stratejileri. Gerçek vaka analizleri.',
        type: 'course',
        thumbnail: 'from-orange-500 via-red-500 to-pink-600',
        duration: '6 saat',
        totalVideos: 24,
        views: 67800,
        rating: 4.8,
        instructor: { name: 'Mehmet Özkan', role: 'Trendyol Uzmanı' },
        level: 'intermediate',
        chapters: 6,
        tags: ['Trendyol', 'pazaryeri', 'strateji']
    },
    {
        id: 'hepsiburada-webinar',
        title: 'Hepsiburada Başarı Sırları - Canlı Webinar',
        description: 'Hepsiburada\'da satışları patlatan teknikler. Soru-cevap bölümü dahil.',
        type: 'webinar',
        thumbnail: 'from-amber-500 via-orange-500 to-red-500',
        duration: '2 saat',
        views: 18900,
        rating: 4.7,
        date: '15 Şubat 2026',
        instructor: { name: 'Ayşe Demir', role: 'Marketplace Danışmanı' },
        level: 'intermediate',
        new: true,
        tags: ['Hepsiburada', 'webinar', 'canlı']
    },
    {
        id: 'inventory-automation',
        title: 'Stok Yönetimi Otomasyonu',
        description: 'Sıfır stok problemi yok! Otomatik senkronizasyon ve uyarı sistemleri kurulumu.',
        type: 'tutorial',
        thumbnail: 'from-slate-600 via-zinc-600 to-neutral-700',
        duration: '45 dk',
        views: 23400,
        rating: 4.8,
        instructor: { name: 'Can Yılmaz', role: 'Otomasyon Uzmanı' },
        level: 'beginner',
        tags: ['stok', 'otomasyon', 'entegrasyon']
    },
    {
        id: 'dynamic-pricing',
        title: 'Dinamik Fiyatlandırma Stratejileri',
        description: 'Rekabet analizi ve AI destekli fiyat optimizasyonu ile kar marjını maksimize edin.',
        type: 'course',
        thumbnail: 'from-fuchsia-500 via-pink-500 to-rose-600',
        duration: '3 saat',
        totalVideos: 14,
        views: 19800,
        rating: 4.9,
        instructor: { name: 'Prof. Ali Kaya', role: 'Fiyatlama Uzmanı' },
        level: 'advanced',
        popular: true,
        chapters: 4,
        tags: ['fiyatlandırma', 'AI', 'rekabet']
    },
    {
        id: 'amazon-turkiye',
        title: 'Amazon Türkiye Başlangıç Rehberi',
        description: 'Amazon\'da mağaza açma, FBA sistemi ve global satış fırsatları.',
        type: 'course',
        thumbnail: 'from-yellow-500 via-amber-500 to-orange-500',
        duration: '5 saat',
        totalVideos: 22,
        views: 41200,
        rating: 4.7,
        instructor: { name: 'Emre Şahin', role: 'Amazon Seller' },
        level: 'beginner',
        chapters: 5,
        tags: ['Amazon', 'FBA', 'global']
    },
    {
        id: 'analytics-dashboard',
        title: 'Analytics Dashboard Kullanımı',
        description: 'Verilerinizi anlamlandırın. KPI takibi, raporlama ve veri odaklı karar verme.',
        type: 'tutorial',
        thumbnail: 'from-amber-500 via-amber-500 to-cyan-500',
        duration: '35 dk',
        views: 15600,
        rating: 4.6,
        instructor: { name: 'Selin Arslan', role: 'Data Analyst' },
        level: 'beginner',
        tags: ['analytics', 'dashboard', 'rapor']
    },
    {
        id: 'customer-service-excellence',
        title: 'Müşteri Hizmetleri Mükemmelliği',
        description: '5 yıldızlı değerlendirme alma sanatı. Şikayet yönetimi ve müşteri memnuniyeti.',
        type: 'video',
        thumbnail: 'from-green-500 via-emerald-500 to-teal-500',
        duration: '1 saat',
        views: 28300,
        rating: 4.8,
        instructor: { name: 'Deniz Yılmaz', role: 'CX Manager' },
        level: 'intermediate',
        tags: ['müşteri', 'hizmet', 'değerlendirme']
    },
    {
        id: 'multi-channel-live',
        title: 'Çoklu Kanal Yönetimi - Canlı Demo',
        description: '5+ pazaryerini tek ekrandan yönetin. Gerçek zamanlı senkronizasyon demo\'su.',
        type: 'live',
        thumbnail: 'from-purple-500 via-violet-500 to-amber-600',
        duration: '1.5 saat',
        views: 12100,
        rating: 4.9,
        date: '20 Şubat 2026',
        instructor: { name: 'Burak Aydın', role: 'Çözüm Mimarı' },
        level: 'intermediate',
        new: true,
        tags: ['çoklu kanal', 'entegrasyon', 'canlı']
    },
    {
        id: 'advanced-api',
        title: 'API Entegrasyonları - Geliştirici Rehberi',
        description: 'REST API kullanımı, webhook\'lar ve custom entegrasyon geliştirme.',
        type: 'course',
        thumbnail: 'from-slate-700 via-zinc-700 to-neutral-800',
        duration: '8 saat',
        totalVideos: 32,
        views: 8700,
        rating: 4.9,
        instructor: { name: 'Kerem Öztürk', role: 'Senior Developer' },
        level: 'advanced',
        chapters: 7,
        tags: ['API', 'geliştirici', 'teknik']
    }
];

const categories = [
    { value: 'all', label: 'Tümü', icon: Layers },
    { value: 'video', label: 'Videolar', icon: Play },
    { value: 'course', label: 'Kurslar', icon: GraduationCap },
    { value: 'webinar', label: 'Webinarlar', icon: Users },
    { value: 'tutorial', label: 'Eğitimler', icon: BookOpen },
    { value: 'live', label: 'Canlı', icon: PlayCircle },
];

const levels = [
    { value: 'all', label: 'Tüm Seviyeler', color: 'slate' },
    { value: 'beginner', label: 'Başlangıç', color: 'green' },
    { value: 'intermediate', label: 'Orta', color: 'blue' },
    { value: 'advanced', label: 'İleri', color: 'purple' },
];

const stats = [
    { label: 'Toplam Video', value: '150+', icon: Play },
    { label: 'İzlenme', value: '500K+', icon: Eye },
    { label: 'Ortalama Puan', value: '4.8', icon: Star },
    { label: 'Sertifikalı Kurs', value: '12', icon: Award },
];

const getTypeInfo = (type: string) => {
    const types: Record<string, { icon: string; label: string; color: string }> = {
        'video': { icon: '🎬', label: 'Video', color: 'blue' },
        'course': { icon: '📚', label: 'Kurs', color: 'purple' },
        'webinar': { icon: '🎙️', label: 'Webinar', color: 'orange' },
        'tutorial': { icon: '📖', label: 'Eğitim', color: 'emerald' },
        'live': { icon: '🔴', label: 'Canlı', color: 'red' },
    };
    return types[type] || { icon: '🎬', label: 'Video', color: 'blue' };
};

const getLevelInfo = (level: string) => {
    const levels: Record<string, { label: string; color: string }> = {
        'beginner': { label: 'Başlangıç', color: 'green' },
        'intermediate': { label: 'Orta', color: 'blue' },
        'advanced': { label: 'İleri', color: 'purple' },
    };
    return levels[level] || { label: 'Başlangıç', color: 'green' };
};

export default function VideoLibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPopularOnly, setShowPopularOnly] = useState(false);

    const filteredVideos = useMemo(() => {
        return videos.filter(v => {
            const matchCategory = selectedCategory === 'all' || v.type === selectedCategory;
            const matchLevel = selectedLevel === 'all' || v.level === selectedLevel;
            const matchSearch = searchQuery === '' ||
                v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (v.tags && v.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
            const matchPopular = !showPopularOnly || v.popular;
            return matchCategory && matchLevel && matchSearch && matchPopular;
        });
    }, [selectedCategory, selectedLevel, searchQuery, showPopularOnly]);

    const featuredVideos = videos.filter(v => v.featured);
    const upcomingLive = videos.filter(v => v.type === 'live' || v.type === 'webinar').slice(0, 3);

    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-orange-500/10 dark:bg-orange-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/20 blur-[150px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-cyan-500/5 to-violet-500/5 dark:from-cyan-500/10 dark:to-violet-500/10 blur-[200px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-100 to-purple-100 dark:from-orange-900/40 dark:to-amber-900/40 border border-orange-200/50 dark:border-orange-700/50 rounded-full mb-8"
                    >
                        <Play size={16} className="text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-bold text-orange-700 dark:text-orange-300 tracking-wide">VİDEO KÜTÜPHANESİ</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            İzle
                        </span>{' '}
                        ve Öğren
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        150+ video, kurs ve webinar ile e-ticaret yolculuğunuzu hızlandırın.
                        <span className="text-orange-600 dark:text-orange-400 font-semibold"> Kendi hızınızda öğrenin.</span>
                    </p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-8 mt-12"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-purple-500/10 dark:from-orange-500/20 dark:to-purple-500/20 flex items-center justify-center">
                                    <stat.icon size={18} className="text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Featured Hero Video */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-20"
                >
                    <div className="relative rounded-[2rem] overflow-hidden group cursor-pointer">
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${featuredVideos[0]?.thumbnail || 'from-violet-600 to-amber-700'}`} />

                        {/* Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        {/* Content */}
                        <div className="relative p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-8">
                            {/* Left - Video Preview */}
                            <div className="flex-1">
                                <div className="aspect-video bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center relative overflow-hidden">
                                    {/* Fake Player UI */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center cursor-pointer group-hover:bg-white/40 transition-colors"
                                        >
                                            <Play size={36} className="text-white fill-white ml-1" />
                                        </motion.div>
                                    </div>

                                    {/* Player Controls */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                        <div className="flex items-center gap-4 text-white/80">
                                            <Pause size={20} className="opacity-0" />
                                            <div className="flex-1 h-1 bg-white/20 rounded-full">
                                                <div className="h-full w-0 bg-white rounded-full" />
                                            </div>
                                            <span className="text-sm font-mono">0:00 / {featuredVideos[0]?.duration}</span>
                                            <Volume2 size={18} />
                                            <Settings size={18} />
                                            <Maximize2 size={18} />
                                        </div>
                                    </div>

                                    {/* Badge */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-bold text-white">
                                            ⭐ EN POPÜLER
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right - Info */}
                            <div className="flex-1 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-bold">
                                        {getTypeInfo(featuredVideos[0]?.type || 'course').icon} {getTypeInfo(featuredVideos[0]?.type || 'course').label}
                                    </span>
                                    <span className="px-3 py-1.5 bg-green-500/80 rounded-lg text-sm font-bold">
                                        {getLevelInfo(featuredVideos[0]?.level || 'beginner').label}
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black mb-4">
                                    {featuredVideos[0]?.title}
                                </h2>

                                <p className="text-lg text-white/80 mb-6 leading-relaxed">
                                    {featuredVideos[0]?.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-6 text-white/70 mb-8">
                                    <span className="flex items-center gap-2">
                                        <Clock size={18} />
                                        {featuredVideos[0]?.duration}
                                    </span>
                                    {featuredVideos[0]?.totalVideos && (
                                        <span className="flex items-center gap-2">
                                            <Play size={18} />
                                            {featuredVideos[0]?.totalVideos} video
                                        </span>
                                    )}
                                    {featuredVideos[0]?.views && (
                                        <span className="flex items-center gap-2">
                                            <Eye size={18} />
                                            {(featuredVideos[0]?.views / 1000).toFixed(1)}K izlenme
                                        </span>
                                    )}
                                    {featuredVideos[0]?.rating && (
                                        <span className="flex items-center gap-2">
                                            <Star size={18} className="fill-amber-400 text-amber-400" />
                                            {featuredVideos[0]?.rating}
                                        </span>
                                    )}
                                </div>

                                {/* Instructor */}
                                {featuredVideos[0]?.instructor && (
                                    <div className="flex items-center gap-4 mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">
                                            👨‍🏫
                                        </div>
                                        <div>
                                            <div className="font-bold">{featuredVideos[0]?.instructor.name}</div>
                                            <div className="text-sm text-white/60">{featuredVideos[0]?.instructor.role}</div>
                                        </div>
                                    </div>
                                )}

                                <button className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg shadow-black/20 group">
                                    <PlayCircle size={20} />
                                    Kursa Başla
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                >
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Video, kurs veya eğitim ara..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {categories.map(cat => {
                            const count = cat.value === 'all'
                                ? videos.length
                                : videos.filter(v => v.type === cat.value).length;
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.value
                                        ? 'bg-gradient-to-r from-orange-600 to-purple-600 text-white shadow-lg shadow-orange-500/25'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                        }`}
                                >
                                    <cat.icon size={16} />
                                    {cat.label}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${selectedCategory === cat.value
                                        ? 'bg-white/20'
                                        : 'bg-slate-200 dark:bg-white/10'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Level Filters */}
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {levels.map(level => (
                            <button
                                key={level.value}
                                onClick={() => setSelectedLevel(level.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedLevel === level.value
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {level.label}
                            </button>
                        ))}
                    </div>

                    {/* Popular Toggle */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowPopularOnly(!showPopularOnly)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showPopularOnly
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                        >
                            <TrendingUp size={16} />
                            Sadece Popüler
                        </button>
                    </div>
                </motion.div>

                {/* Upcoming Live Events */}
                {upcomingLive.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yaklaşan Canlı Etkinlikler</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {upcomingLive.map((video, i) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    className="group p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200/50 dark:border-red-700/30 hover:border-red-300 dark:hover:border-red-600/50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                            {video.type === 'live' ? '🔴 CANLI' : '🎙️ WEBINAR'}
                                        </span>
                                        {video.date && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {video.date}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                        {video.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                                        {video.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {video.duration}
                                        </span>
                                        <button className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">
                                            Hatırlat →
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Featured Videos Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Star size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Öne Çıkan İçerikler</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">En çok izlenen ve beğenilen videolar</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredVideos.map((video, i) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="group rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all hover:shadow-xl cursor-pointer"
                            >
                                {/* Thumbnail */}
                                <div className={`relative aspect-video bg-gradient-to-br ${video.thumbnail} flex items-center justify-center overflow-hidden`}>
                                    {/* Pattern */}
                                    <div className="absolute inset-0 opacity-10" style={{
                                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                        backgroundSize: '16px 16px'
                                    }} />

                                    {/* Play Button */}
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/50 transition-colors"
                                    >
                                        <Play size={24} className="text-white fill-white ml-1" />
                                    </motion.div>

                                    {/* Duration */}
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-mono text-white">
                                        {video.duration}
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        {video.new && (
                                            <span className="px-2 py-1 bg-emerald-500 rounded text-xs font-bold text-white">
                                                YENİ
                                            </span>
                                        )}
                                        {video.popular && (
                                            <span className="px-2 py-1 bg-amber-500 rounded text-xs font-bold text-white">
                                                POPÜLER
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${video.type === 'course' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                            video.type === 'webinar' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                                'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                            }`}>
                                            {getTypeInfo(video.type).icon} {getTypeInfo(video.type).label}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${video.level === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            video.level === 'intermediate' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                                'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                            }`}>
                                            {getLevelInfo(video.level).label}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                        {video.title}
                                    </h3>

                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                        {video.description}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                        {video.totalVideos && (
                                            <span className="flex items-center gap-1">
                                                <Play size={12} />
                                                {video.totalVideos} video
                                            </span>
                                        )}
                                        {video.views && (
                                            <span className="flex items-center gap-1">
                                                <Eye size={12} />
                                                {(video.views / 1000).toFixed(1)}K
                                            </span>
                                        )}
                                        {video.rating && (
                                            <span className="flex items-center gap-1">
                                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                                {video.rating}
                                            </span>
                                        )}
                                    </div>

                                    {/* Instructor */}
                                    {video.instructor && (
                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm">
                                                👤
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{video.instructor.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{video.instructor.role}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* All Videos Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                                <Layers size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tüm İçerikler</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {filteredVideos.length} içerik bulundu
                                </p>
                            </div>
                        </div>
                    </div>

                    {filteredVideos.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">İçerik Bulunamadı</h3>
                            <p className="text-slate-500 dark:text-slate-400">Farklı bir arama terimi veya filtre deneyin.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            <AnimatePresence mode="popLayout">
                                {filteredVideos.filter(v => !v.featured).map((video, i) => (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.03 }}
                                        layout
                                        className="group rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all hover:shadow-lg cursor-pointer"
                                    >
                                        {/* Thumbnail */}
                                        <div className={`relative aspect-video bg-gradient-to-br ${video.thumbnail} flex items-center justify-center overflow-hidden`}>
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                                            {/* Hover Zoom Effect */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center z-10">
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    whileHover={{ scale: 1.1, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
                                                >
                                                    <Play size={32} className="text-white fill-white ml-1 shadow-xl" />
                                                </motion.div>
                                            </div>

                                            {/* Preview Overlay (Simulated) */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                                                <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 animate-[shimmer_2s_infinite]" />
                                            </div>

                                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-mono text-white border border-white/10 z-20">
                                                {video.duration}
                                            </div>

                                            {video.new && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 shadow-lg shadow-emerald-500/20 rounded-lg text-[10px] font-bold text-white z-20">
                                                    YENİ
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                                                    {getTypeInfo(video.type).icon} {getTypeInfo(video.type).label}
                                                </span>
                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                    {getLevelInfo(video.level).label}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                {video.title}
                                            </h3>

                                            {video.instructor && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                    {video.instructor.name}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                {video.views && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Eye size={10} />
                                                        {(video.views / 1000).toFixed(1)}K
                                                    </span>
                                                )}
                                                {video.rating && (
                                                    <span className="flex items-center gap-0.5">
                                                        <Star size={10} className="fill-amber-400 text-amber-400" />
                                                        {video.rating}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Learning Paths */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Öğrenme Yolları</h2>
                        <p className="text-slate-600 dark:text-slate-400">Hedefinize göre özelleştirilmiş kurs serisi</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'E-ticaret Başlangıç',
                                description: 'Sıfırdan başlayanlar için temel kavramlar ve ilk satış stratejileri.',
                                courses: 8,
                                duration: '12 saat',
                                color: 'from-green-500 to-emerald-600',
                                icon: Target
                            },
                            {
                                title: 'Pazaryeri Uzmanlık',
                                description: 'Trendyol, Hepsiburada ve Amazon\'da ileri seviye teknikler.',
                                courses: 12,
                                duration: '24 saat',
                                color: 'from-orange-500 to-amber-600',
                                icon: BarChart3
                            },
                            {
                                title: 'Ölçeklendirme',
                                description: 'İşletmenizi büyütmek için otomasyon ve analitik stratejileri.',
                                courses: 6,
                                duration: '15 saat',
                                color: 'from-purple-500 to-pink-600',
                                icon: TrendingUp
                            },
                        ].map((path, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all hover:shadow-xl cursor-pointer"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <path.icon size={28} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{path.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{path.description}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Play size={14} />
                                        {path.courses} kurs
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {path.duration}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Newsletter CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24"
                >
                    <div className="relative p-12 md:p-16 rounded-[2rem] overflow-hidden">
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-purple-600 to-pink-600" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        {/* Floating Elements */}
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl" />

                        <div className="relative text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                <Sparkles size={16} className="text-white" />
                                <span className="text-sm font-bold text-white">HAFTALIK YENİ İÇERİK</span>
                            </div>

                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Yeni Videoları Kaçırmayın
                            </h3>

                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                                Haftalık yeni videolar, kurslar ve canlı etkinlik duyuruları doğrudan e-postanıza gelsin.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                                <input
                                    type="email"
                                    placeholder="E-posta adresiniz"
                                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all"
                                />
                                <button className="px-8 py-4 bg-white text-purple-700 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                                    Abone Ol
                                    <ArrowRight size={18} />
                                </button>
                            </div>

                            <p className="text-sm text-white/60 mt-6">
                                30,000+ öğrenci zaten abone. İstediğin zaman çık.
                            </p>
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
                            { label: 'Kaynaklar', href: '/resources', icon: BookOpen },
                            { label: 'Webinarlar', href: '/webinars', icon: Users },
                            { label: 'Yardım Merkezi', href: '/docs', icon: CheckCircle2 },
                            { label: 'Blog', href: '/blog', icon: Sparkles },
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
        </MarketingPageShell>
    );
}
