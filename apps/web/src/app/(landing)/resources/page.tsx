"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, ArrowRight, Play, FileText, BookOpen, Video,
    FileSpreadsheet, Presentation, Search, Clock,
    Eye, Star, TrendingUp, Users, CheckCircle2, Sparkles,
    ChevronRight, ExternalLink, Award, Target,
    Zap, BarChart3, ShoppingCart, Package, Layers, Globe
} from 'lucide-react';
import Link from 'next/link';

interface Resource {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    category: 'ebook' | 'template' | 'whitepaper' | 'guide' | 'video' | 'checklist' | 'webinar' | 'case-study';
    tags: string[];
    image: string;
    downloadUrl?: string;
    readTime?: string;
    duration?: string;
    pages?: number;
    downloads?: number;
    rating?: number;
    featured?: boolean;
    new?: boolean;
    premium?: boolean;
    author?: string;
    date?: string;
    fileSize?: string;
}

const resources: Resource[] = [
    {
        id: 'ecommerce-mastery-2026',
        title: 'E-ticaret Ustalık Rehberi 2026',
        description: 'Pazaryonetimi ile online satışınızı 10 katına çıkarın. 200+ sayfa strateji.',
        longDescription: 'Türkiye\'nin en kapsamlı e-ticaret rehberi. Pazaryeri entegrasyonu, stok yönetimi, fiyatlandırma stratejileri ve daha fazlası.',
        category: 'ebook',
        tags: ['e-ticaret', 'strateji', 'başlangıç'],
        image: 'from-orange-500 via-amber-500 to-purple-600',
        downloadUrl: '#',
        pages: 247,
        downloads: 15420,
        rating: 4.9,
        featured: true,
        author: 'Pazaryonetimi Ekibi',
        date: '2026',
        fileSize: '45 MB'
    },
    {
        id: 'ai-pricing-guide',
        title: 'AI Destekli Fiyatlandırma Stratejileri',
        description: 'Yapay zeka ile dinamik fiyatlandırma yaparak kar marjını %40 artırın.',
        category: 'guide',
        tags: ['AI', 'fiyatlandırma', 'otomasyon'],
        image: 'from-emerald-500 via-teal-500 to-cyan-600',
        readTime: '25 dk',
        downloads: 8750,
        rating: 4.8,
        featured: true,
        new: true,
        author: 'Dr. Zeynep Kaya',
        date: 'Ocak 2026'
    },
    {
        id: 'product-listing-templates',
        title: 'Premium Ürün Listeleme Şablonları',
        description: 'SEO optimizasyonlu, dönüşüm oranını 3x artıran 50+ şablon paketi.',
        category: 'template',
        tags: ['SEO', 'listeleme', 'optimizasyon'],
        image: 'from-orange-500 via-amber-500 to-yellow-500',
        downloadUrl: '#',
        downloads: 12300,
        rating: 4.7,
        premium: true,
        fileSize: '15 MB'
    },
    {
        id: 'marketplace-analytics-whitepaper',
        title: 'Pazaryeri Analytics Deep Dive',
        description: 'Veri odaklı karar verme için analytics whitepaper. KPI\'lar ve metrikler.',
        category: 'whitepaper',
        tags: ['analytics', 'veri', 'KPI'],
        image: 'from-violet-500 via-purple-500 to-fuchsia-600',
        pages: 68,
        downloads: 5420,
        rating: 4.9,
        featured: true,
        author: 'Analitik Ekibi',
        date: 'Aralık 2025'
    },
    {
        id: 'inventory-masterclass',
        title: 'Stok Yönetimi Masterclass',
        description: '4 saatlik video serisi: Sıfır stok problemi ile profesyonel envanter yönetimi.',
        category: 'video',
        tags: ['stok', 'envanter', 'otomasyon'],
        image: 'from-rose-500 via-pink-500 to-red-600',
        duration: '4 saat',
        downloads: 9870,
        rating: 4.8,
        author: 'Mehmet Yılmaz'
    },
    {
        id: 'launch-checklist',
        title: '100 Maddelik Lansman Kontrol Listesi',
        description: 'Yeni pazaryeri başlatırken hiçbir şeyi kaçırmayın. Adım adım checklist.',
        category: 'checklist',
        tags: ['lansman', 'checklist', 'başlangıç'],
        image: 'from-cyan-500 via-sky-500 to-amber-600',
        downloadUrl: '#',
        downloads: 18500,
        rating: 4.9,
        new: true,
        fileSize: '2 MB'
    },
    {
        id: 'trendyol-optimization',
        title: 'Trendyol Optimizasyon Rehberi',
        description: 'Trendyol\'da üst sıralara çıkın. Arama algoritması, badges ve stratejiler.',
        category: 'guide',
        tags: ['Trendyol', 'optimizasyon', 'SEO'],
        image: 'from-orange-600 via-red-500 to-pink-600',
        readTime: '35 dk',
        downloads: 22000,
        rating: 4.9,
        featured: true,
        author: 'E-ticaret Uzmanları'
    },
    {
        id: 'hepsiburada-webinar',
        title: 'Hepsiburada Başarı Stratejileri Webinar',
        description: '2 saatlik canlı kayıt: Hepsiburada\'da satışları patlatan teknikler.',
        category: 'webinar',
        tags: ['Hepsiburada', 'strateji', 'satış'],
        image: 'from-amber-500 via-orange-500 to-red-500',
        duration: '2 saat',
        downloads: 7650,
        rating: 4.7,
        date: 'Kasım 2025'
    },
    {
        id: 'amazon-case-studies',
        title: 'Amazon Türkiye Başarı Hikayeleri',
        description: '12 gerçek vaka analizi: Küçük işletmeden global satıcıya dönüşüm.',
        category: 'case-study',
        tags: ['Amazon', 'vaka analizi', 'başarı'],
        image: 'from-slate-600 via-slate-500 to-zinc-500',
        pages: 86,
        downloads: 6300,
        rating: 4.8,
        premium: true
    },
    {
        id: 'excel-inventory-template',
        title: 'Gelişmiş Excel Stok Takip Şablonu',
        description: 'Formüllü, dashboard\'lu, otomatik uyarılı profesyonel Excel şablonu.',
        category: 'template',
        tags: ['Excel', 'stok', 'şablon'],
        image: 'from-green-500 via-emerald-500 to-teal-500',
        downloadUrl: '#',
        downloads: 31000,
        rating: 4.6,
        fileSize: '8 MB'
    },
    {
        id: 'customer-retention-playbook',
        title: 'Müşteri Elde Tutma Playbook',
        description: 'İade oranını %60 azaltıp, tekrar satın alma oranını 4x artırın.',
        category: 'ebook',
        tags: ['müşteri', 'retention', 'CRM'],
        image: 'from-amber-500 via-amber-500 to-cyan-500',
        pages: 124,
        downloads: 8900,
        rating: 4.8,
        author: 'CRM Ekibi'
    },
    {
        id: 'seo-video-course',
        title: 'Pazaryeri SEO Masterclass Video Kursu',
        description: '6 modül, 8 saat: Ürünlerinizi aramada #1\'e taşıyın.',
        category: 'video',
        tags: ['SEO', 'kurs', 'video'],
        image: 'from-teal-500 via-cyan-500 to-sky-500',
        duration: '8 saat',
        downloads: 11200,
        rating: 4.9,
        premium: true,
        author: 'SEO Uzmanları'
    },
    {
        id: 'pricing-calculator',
        title: 'Dinamik Fiyatlandırma Hesaplayıcı',
        description: 'Kar marjı, komisyon ve kargo dahil optimal fiyat hesaplama aracı.',
        category: 'template',
        tags: ['fiyatlandırma', 'hesaplayıcı', 'Excel'],
        image: 'from-fuchsia-500 via-pink-500 to-rose-500',
        downloadUrl: '#',
        downloads: 14500,
        rating: 4.7,
        new: true,
        fileSize: '3 MB'
    },
    {
        id: 'multi-channel-guide',
        title: 'Çoklu Kanal Satış Stratejileri',
        description: '5+ pazaryerini aynı anda yönetin. Senkronizasyon ve otomasyon rehberi.',
        category: 'guide',
        tags: ['çoklu kanal', 'entegrasyon', 'otomasyon'],
        image: 'from-purple-500 via-violet-500 to-amber-500',
        readTime: '45 dk',
        downloads: 6800,
        rating: 4.8,
        author: 'Entegrasyon Ekibi'
    },
    {
        id: 'q1-ecommerce-trends',
        title: 'E-ticaret Trendleri 2026 Q1 Raporu',
        description: 'İlk çeyrek tahminleri, tüketici davranışları ve fırsat analizi.',
        category: 'whitepaper',
        tags: ['trendler', 'rapor', '2026'],
        image: 'from-sky-500 via-amber-500 to-amber-500',
        pages: 42,
        downloads: 4200,
        rating: 4.6,
        new: true,
        date: 'Ocak 2026'
    }
];

const categories = [
    { value: 'all', label: 'Tümü', icon: Layers, color: 'slate' },
    { value: 'ebook', label: 'E-Kitaplar', icon: BookOpen, color: 'blue' },
    { value: 'guide', label: 'Rehberler', icon: FileText, color: 'emerald' },
    { value: 'template', label: 'Şablonlar', icon: FileSpreadsheet, color: 'orange' },
    { value: 'whitepaper', label: 'Whitepaper', icon: Presentation, color: 'violet' },
    { value: 'video', label: 'Videolar', icon: Video, color: 'rose' },
    { value: 'checklist', label: 'Checklist', icon: CheckCircle2, color: 'cyan' },
    { value: 'webinar', label: 'Webinar', icon: Users, color: 'amber' },
    { value: 'case-study', label: 'Vaka Analizi', icon: Target, color: 'slate' },
];

const stats = [
    { label: 'Toplam İndirme', value: '180K+', icon: Download },
    { label: 'Kaynak Sayısı', value: '50+', icon: FileText },
    { label: 'Ortalama Puan', value: '4.8', icon: Star },
    { label: 'Aktif Kullanıcı', value: '25K+', icon: Users },
];

const getCategoryInfo = (category: string) => {
    const icons: Record<string, { icon: string; label: string }> = {
        'ebook': { icon: '📕', label: 'E-Kitap' },
        'guide': { icon: '📖', label: 'Rehber' },
        'template': { icon: '📋', label: 'Şablon' },
        'whitepaper': { icon: '📄', label: 'Whitepaper' },
        'video': { icon: '🎬', label: 'Video' },
        'checklist': { icon: '✅', label: 'Checklist' },
        'webinar': { icon: '🎙️', label: 'Webinar' },
        'case-study': { icon: '📊', label: 'Vaka Analizi' },
    };
    return icons[category] || { icon: '📁', label: 'Kaynak' };
};

export default function ResourceCenterPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPremiumOnly, setShowPremiumOnly] = useState(false);

    const filteredResources = useMemo(() => {
        return resources.filter(r => {
            const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
            const matchSearch = searchQuery === '' ||
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchPremium = !showPremiumOnly || r.premium;
            return matchCategory && matchSearch && matchPremium;
        });
    }, [selectedCategory, searchQuery, showPremiumOnly]);

    const featuredResources = resources.filter(r => r.featured);

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/20 blur-[150px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 dark:from-emerald-500/10 dark:to-cyan-500/10 blur-[200px] rounded-full" />
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
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-purple-900/40 dark:to-amber-900/40 border border-purple-200/50 dark:border-purple-700/50 rounded-full mb-8"
                    >
                        <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300 tracking-wide">RESOURCE CENTER</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
                            Ücretsiz
                        </span>{' '}
                        Kaynaklar
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        E-ticaret başarısı için gereken tüm araçlar, rehberler, şablonlar ve eğitim materyalleri.
                        <span className="text-purple-600 dark:text-purple-400 font-semibold"> Hepsi ücretsiz.</span>
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
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-amber-500/10 dark:from-purple-500/20 dark:to-amber-500/20 flex items-center justify-center">
                                    <stat.icon size={18} className="text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
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
                                placeholder="Kaynak ara... (ör: Trendyol, SEO, şablon)"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
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
                                ? resources.length
                                : resources.filter(r => r.category === cat.value).length;
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.value
                                            ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow-lg shadow-purple-500/25'
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

                    {/* Premium Toggle */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showPremiumOnly
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                        >
                            <Award size={16} />
                            Sadece Premium
                        </button>
                    </div>
                </motion.div>

                {/* Featured Resources - Large Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-20"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Star size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Öne Çıkan Kaynaklar</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">En çok indirilen ve beğenilen içerikler</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {featuredResources.slice(0, 4).map((resource, i) => (
                            <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="group relative rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${resource.image} opacity-90`} />

                                {/* Pattern Overlay */}
                                <div className="absolute inset-0 opacity-10" style={{
                                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                    backgroundSize: '20px 20px'
                                }} />

                                {/* Content */}
                                <div className="relative p-8 min-h-[280px] flex flex-col">
                                    {/* Top Row */}
                                    <div className="flex items-start justify-between mb-auto">
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold text-white">
                                                {getCategoryInfo(resource.category).icon} {getCategoryInfo(resource.category).label}
                                            </span>
                                            {resource.new && (
                                                <span className="px-3 py-1.5 bg-emerald-500 rounded-lg text-xs font-bold text-white">
                                                    YENİ
                                                </span>
                                            )}
                                        </div>
                                        {resource.rating && (
                                            <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                                                <Star size={14} className="text-amber-300 fill-amber-300" />
                                                <span className="text-sm font-bold text-white">{resource.rating}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Content */}
                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform">
                                            {resource.title}
                                        </h3>
                                        <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-md">
                                            {resource.longDescription || resource.description}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-6">
                                            {resource.pages && (
                                                <span className="flex items-center gap-1">
                                                    <FileText size={14} />
                                                    {resource.pages} sayfa
                                                </span>
                                            )}
                                            {resource.duration && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {resource.duration}
                                                </span>
                                            )}
                                            {resource.readTime && (
                                                <span className="flex items-center gap-1">
                                                    <Eye size={14} />
                                                    {resource.readTime}
                                                </span>
                                            )}
                                            {resource.downloads && (
                                                <span className="flex items-center gap-1">
                                                    <Download size={14} />
                                                    {resource.downloads.toLocaleString('tr-TR')} indirme
                                                </span>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-bold text-white transition-all group-hover:gap-3">
                                            {resource.category === 'video' || resource.category === 'webinar' ? (
                                                <>
                                                    <Play size={18} className="fill-white" />
                                                    İzle
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={18} />
                                                    Ücretsiz İndir
                                                </>
                                            )}
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* All Resources Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-600 flex items-center justify-center">
                                <Layers size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tüm Kaynaklar</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {filteredResources.length} kaynak bulundu
                                </p>
                            </div>
                        </div>
                    </div>

                    {filteredResources.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Kaynak Bulunamadı</h3>
                            <p className="text-slate-500 dark:text-slate-400">Farklı bir arama terimi veya kategori deneyin.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredResources.map((resource, i) => (
                                    <motion.div
                                        key={resource.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.03 }}
                                        layout
                                        className="group flex flex-col rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all hover:shadow-xl overflow-hidden"
                                    >
                                        {/* Card Header */}
                                        <div className={`relative h-40 bg-gradient-to-br ${resource.image} flex items-center justify-center overflow-hidden`}>
                                            {/* Pattern */}
                                            <div className="absolute inset-0 opacity-10" style={{
                                                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                                                backgroundSize: '16px 16px'
                                            }} />

                                            {/* Icon */}
                                            {resource.category === 'video' || resource.category === 'webinar' ? (
                                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Play size={28} className="text-white fill-white" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <span className="text-4xl">{getCategoryInfo(resource.category).icon}</span>
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                {resource.new && (
                                                    <span className="px-2 py-1 bg-emerald-500 rounded-md text-xs font-bold text-white">
                                                        YENİ
                                                    </span>
                                                )}
                                                {resource.premium && (
                                                    <span className="px-2 py-1 bg-amber-500 rounded-md text-xs font-bold text-white flex items-center gap-1">
                                                        <Award size={12} />
                                                        PREMIUM
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating */}
                                            {resource.rating && (
                                                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-md">
                                                    <Star size={12} className="text-amber-300 fill-amber-300" />
                                                    <span className="text-xs font-bold text-white">{resource.rating}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Body */}
                                        <div className="flex-1 p-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                                    {getCategoryInfo(resource.category).icon} {getCategoryInfo(resource.category).label}
                                                </span>
                                                {resource.author && (
                                                    <span className="text-xs text-slate-400">• {resource.author}</span>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {resource.title}
                                            </h3>

                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                                                {resource.description}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {resource.tags.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded text-xs">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                {resource.pages && (
                                                    <span className="flex items-center gap-1">
                                                        <FileText size={12} />
                                                        {resource.pages}p
                                                    </span>
                                                )}
                                                {resource.duration && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {resource.duration}
                                                    </span>
                                                )}
                                                {resource.readTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Eye size={12} />
                                                        {resource.readTime}
                                                    </span>
                                                )}
                                                {resource.downloads && (
                                                    <span className="flex items-center gap-1">
                                                        <Download size={12} />
                                                        {(resource.downloads / 1000).toFixed(1)}K
                                                    </span>
                                                )}
                                            </div>

                                            <button className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-sm transition-colors">
                                                {resource.category === 'video' || resource.category === 'webinar' ? 'İzle' : 'İndir'}
                                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Popular Topics Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Popüler Konular</h2>
                        <p className="text-slate-600 dark:text-slate-400">En çok aranan ve indirilen kategoriler</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: ShoppingCart, label: 'Pazaryeri Optimizasyonu', count: 12, color: 'from-orange-500 to-amber-600' },
                            { icon: Zap, label: 'Otomasyon', count: 8, color: 'from-amber-500 to-orange-600' },
                            { icon: BarChart3, label: 'Analytics', count: 6, color: 'from-emerald-500 to-teal-600' },
                            { icon: Package, label: 'Stok Yönetimi', count: 10, color: 'from-purple-500 to-pink-600' },
                            { icon: TrendingUp, label: 'Fiyatlandırma', count: 7, color: 'from-rose-500 to-red-600' },
                            { icon: Globe, label: 'Çoklu Kanal', count: 5, color: 'from-cyan-500 to-amber-600' },
                            { icon: Users, label: 'Müşteri Yönetimi', count: 9, color: 'from-violet-500 to-purple-600' },
                            { icon: Target, label: 'SEO & Görünürlük', count: 11, color: 'from-pink-500 to-rose-600' },
                        ].map((topic, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSearchQuery(topic.label.split(' ')[0])}
                                className="group p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all hover:shadow-lg text-left"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <topic.icon size={24} className="text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{topic.label}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{topic.count} kaynak</p>
                            </motion.button>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-orange-500" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        {/* Floating Elements */}
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl" />

                        <div className="relative text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                <Sparkles size={16} className="text-white" />
                                <span className="text-sm font-bold text-white">HAFTALIK İÇERİK</span>
                            </div>

                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Yeni Kaynakları Kaçırmayın
                            </h3>

                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                                Haftalık e-ticaret rehberleri, şablonlar ve best practice&apos;ler doğrudan e-postanıza gelsin.
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
                                25,000+ e-ticaret profesyoneli zaten abone. İstediğin zaman çık.
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
                            { label: 'Video Kütüphanesi', href: '/video-library', icon: Video },
                            { label: 'Webinarlar', href: '/webinars', icon: Users },
                            { label: 'Blog', href: '/blog', icon: BookOpen },
                            { label: 'Yardım Merkezi', href: '/docs', icon: FileText },
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
