"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, ArrowRight, Quote, Building2, Users, Package,
    Clock, Star, Search,
    Award, Target, Zap, Globe,
    ChevronDown, Download
} from 'lucide-react';
import Link from 'next/link';

interface CaseStudy {
    id: string;
    company: string;
    logo: string;
    industry: string;
    size: string;
    location: string;
    title: string;
    subtitle: string;
    description: string;
    challenge: string;
    solution: string;
    results: {
        metric: string;
        value: string;
        change: string;
    }[];
    testimonial: {
        quote: string;
        author: string;
        role: string;
    };
    tags: string[];
    featured?: boolean;
    thumbnail: string;
    duration: string;
    marketplaces: string[];
}

const caseStudies: CaseStudy[] = [
    {
        id: 'techstore-growth',
        company: 'TechStore',
        logo: '🖥️',
        industry: 'Elektronik',
        size: '50-200 çalışan',
        location: 'İstanbul',
        title: 'TechStore: 6 Ayda %340 Satış Artışı',
        subtitle: 'Çoklu pazaryeri yönetimi ile büyüme hikayesi',
        description: 'TechStore, Türkiye\'nin önde gelen elektronik perakendecilerinden biri olarak Pazaryonetimi ile iş süreçlerini tamamen dönüştürdü.',
        challenge: '5 farklı pazaryerinde manuel stok ve fiyat yönetimi, sürekli stok tutarsızlıkları ve kayıp satışlar.',
        solution: 'Pazaryonetimi\'nin AI destekli fiyatlandırma ve otomatik stok senkronizasyonu ile tüm kanalları tek noktadan yönetim.',
        results: [
            { metric: 'Satış Artışı', value: '%340', change: '+240%' },
            { metric: 'Stok Tutarsızlığı', value: '%0.5', change: '-95%' },
            { metric: 'İşlem Süresi', value: '2 saat', change: '-80%' },
            { metric: 'Kar Marjı', value: '%28', change: '+12%' },
        ],
        testimonial: {
            quote: 'Pazaryonetimi olmadan bu büyümeyi hayal bile edemezdik. 6 ayda işimizi 3 katına çıkardık.',
            author: 'Ahmet Yıldırım',
            role: 'CEO, TechStore'
        },
        tags: ['elektronik', 'çoklu kanal', 'AI fiyatlandırma'],
        featured: true,
        thumbnail: 'from-orange-500 via-amber-500 to-purple-600',
        duration: '6 ay',
        marketplaces: ['Trendyol', 'Hepsiburada', 'Amazon', 'N11']
    },
    {
        id: 'modaevi-transformation',
        company: 'ModaEvi',
        logo: '👗',
        industry: 'Moda & Giyim',
        size: '20-50 çalışan',
        location: 'Ankara',
        title: 'ModaEvi: Sezonluk Satışlarda %500 Artış',
        subtitle: 'Dinamik fiyatlandırma ile moda sektöründe devrim',
        description: 'ModaEvi, sezonluk ürün yönetimini AI destekli araçlarla optimize ederek rakiplerini geride bıraktı.',
        challenge: 'Sezon sonu stok fazlası, fiyat savaşlarında rekabet edememe ve manuel kampanya yönetimi.',
        solution: 'AI fiyatlandırma motorları, otomatik kampanya optimizasyonu ve trend analizi ile proaktif stok yönetimi.',
        results: [
            { metric: 'Sezonluk Satış', value: '%500', change: '+400%' },
            { metric: 'Stok Devir Hızı', value: '3x', change: '+200%' },
            { metric: 'İade Oranı', value: '%4', change: '-60%' },
            { metric: 'Müşteri Memnuniyeti', value: '4.8', change: '+0.9' },
        ],
        testimonial: {
            quote: 'Dinamik fiyatlandırma sayesinde stok eritme süremiz yarıya düştü, kar marjımız ise arttı.',
            author: 'Zeynep Kara',
            role: 'Kurucu, ModaEvi'
        },
        tags: ['moda', 'dinamik fiyatlandırma', 'sezonsal'],
        featured: true,
        thumbnail: 'from-pink-500 via-rose-500 to-red-600',
        duration: '8 ay',
        marketplaces: ['Trendyol', 'Hepsiburada', 'Morhipo']
    },
    {
        id: 'gidamarket-scale',
        company: 'GıdaMarket',
        logo: '🛒',
        industry: 'Gıda & Market',
        size: '200+ çalışan',
        location: 'İzmir',
        title: 'GıdaMarket: Günlük 10,000+ Sipariş Yönetimi',
        subtitle: 'Otomasyon ile operasyonel mükemmellik',
        description: 'GıdaMarket, hızlı tüketim ürünlerinde otomasyon sayesinde pazar liderliğine ulaştı.',
        challenge: 'Yüksek hacimli sipariş yönetimi, son kullanma tarihi takibi ve lojistik koordinasyonu.',
        solution: 'Tam otomatik sipariş işleme, FIFO stok yönetimi ve entegre lojistik optimizasyonu.',
        results: [
            { metric: 'Günlük Sipariş', value: '10,000+', change: '+300%' },
            { metric: 'Sipariş Hatası', value: '%0.1', change: '-98%' },
            { metric: 'Teslimat Süresi', value: '24 saat', change: '-50%' },
            { metric: 'Operasyonel Maliyet', value: '-%35', change: '-35%' },
        ],
        testimonial: {
            quote: 'Manuel süreçlerden tamamen kurtulduk. Şimdi günde 10,000+ siparişi hatasız yönetiyoruz.',
            author: 'Can Demir',
            role: 'COO, GıdaMarket'
        },
        tags: ['gıda', 'yüksek hacim', 'otomasyon'],
        thumbnail: 'from-emerald-500 via-green-500 to-teal-600',
        duration: '12 ay',
        marketplaces: ['Trendyol', 'Hepsiburada', 'Getir', 'Yemeksepeti']
    },
    {
        id: 'kozmetika-expansion',
        company: 'Kozmetika',
        logo: '💄',
        industry: 'Kozmetik',
        size: '10-20 çalışan',
        location: 'Bursa',
        title: 'Kozmetika: Küçük Markadan Pazar Liderine',
        subtitle: 'SEO optimizasyonu ile organik büyüme',
        description: 'Kozmetika, AI SEO araçları ile ürün görünürlüğünü artırarak organik satışlarını patlattı.',
        challenge: 'Düşük ürün görünürlüğü, yoğun rekabet ve sınırlı pazarlama bütçesi.',
        solution: 'AI destekli ürün başlığı ve açıklama optimizasyonu, anahtar kelime analizi ve görsel SEO.',
        results: [
            { metric: 'Organik Satış', value: '%800', change: '+700%' },
            { metric: 'Arama Sıralaması', value: 'Top 3', change: '+47 sıra' },
            { metric: 'Tıklama Oranı', value: '%12', change: '+8%' },
            { metric: 'Dönüşüm Oranı', value: '%4.5', change: '+2.1%' },
        ],
        testimonial: {
            quote: 'SEO optimizasyonu ile reklam harcamadan arama sonuçlarında ilk 3\'e girdik.',
            author: 'Elif Yılmaz',
            role: 'Pazarlama Müdürü, Kozmetika'
        },
        tags: ['kozmetik', 'SEO', 'organik büyüme'],
        featured: true,
        thumbnail: 'from-purple-500 via-violet-500 to-amber-600',
        duration: '4 ay',
        marketplaces: ['Trendyol', 'Hepsiburada', 'Watsons']
    },
    {
        id: 'sporium-global',
        company: 'Sporium',
        logo: '⚽',
        industry: 'Spor & Outdoor',
        size: '50-100 çalışan',
        location: 'Antalya',
        title: 'Sporium: Türkiye\'den Global Pazara',
        subtitle: 'Amazon entegrasyonu ile uluslararası genişleme',
        description: 'Sporium, Pazaryonetimi ile Amazon Türkiye ve Avrupa pazarlarına başarıyla açıldı.',
        challenge: 'Uluslararası pazarlara giriş, çoklu para birimi yönetimi ve global lojistik.',
        solution: 'Amazon FBA entegrasyonu, otomatik çeviri ve fiyat lokalizasyonu, global stok yönetimi.',
        results: [
            { metric: 'Global Satış', value: '₺5M', change: '+∞' },
            { metric: 'Yeni Pazar', value: '12 ülke', change: '+12' },
            { metric: 'Amazon Satışı', value: '%40', change: '+40%' },
            { metric: 'Marka Bilinirliği', value: '5x', change: '+400%' },
        ],
        testimonial: {
            quote: 'Amazon entegrasyonu sayesinde 12 ülkeye satış yapıyoruz. Global marka olduk.',
            author: 'Mert Özkan',
            role: 'CEO, Sporium'
        },
        tags: ['spor', 'global', 'Amazon'],
        thumbnail: 'from-orange-500 via-amber-500 to-yellow-500',
        duration: '10 ay',
        marketplaces: ['Amazon TR', 'Amazon DE', 'Amazon UK', 'Trendyol']
    },
    {
        id: 'evdekor-efficiency',
        company: 'EvDekor',
        logo: '🏠',
        industry: 'Ev & Dekorasyon',
        size: '30-50 çalışan',
        location: 'Kayseri',
        title: 'EvDekor: %70 Operasyonel Verimlilik Artışı',
        subtitle: 'Toplu işlemler ile zaman tasarrufu',
        description: 'EvDekor, toplu ürün yönetimi araçları ile operasyonel verimliliğini maksimize etti.',
        challenge: '5,000+ SKU yönetimi, manuel fiyat güncellemeleri ve görsel işleme darboğazı.',
        solution: 'Toplu ürün düzenleme, Excel import/export, otomatik görsel optimizasyonu.',
        results: [
            { metric: 'İşlem Süresi', value: '-%70', change: '-70%' },
            { metric: 'SKU Yönetimi', value: '5,000+', change: '+3,000' },
            { metric: 'Hata Oranı', value: '%0.2', change: '-90%' },
            { metric: 'Çalışan Verimliliği', value: '3x', change: '+200%' },
        ],
        testimonial: {
            quote: 'Eskiden 2 gün süren fiyat güncellemesini şimdi 30 dakikada yapıyoruz.',
            author: 'Ayşe Koç',
            role: 'Operasyon Müdürü, EvDekor'
        },
        tags: ['ev dekorasyon', 'toplu işlem', 'verimlilik'],
        thumbnail: 'from-cyan-500 via-sky-500 to-amber-600',
        duration: '3 ay',
        marketplaces: ['Trendyol', 'Hepsiburada', 'N11', 'Çiçeksepeti']
    }
];

const industries = ['Tümü', 'Elektronik', 'Moda & Giyim', 'Gıda & Market', 'Kozmetik', 'Spor & Outdoor', 'Ev & Dekorasyon'];

export default function CaseStudiesPage() {
    const [selectedIndustry, setSelectedIndustry] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCase, setExpandedCase] = useState<string | null>(null);

    const filteredCases = useMemo(() => {
        return caseStudies.filter(cs => {
            const matchIndustry = selectedIndustry === 'Tümü' || cs.industry === selectedIndustry;
            const matchSearch = searchQuery === '' ||
                cs.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cs.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchIndustry && matchSearch;
        });
    }, [selectedIndustry, searchQuery]);

    const featuredCases = caseStudies.filter(cs => cs.featured);

    const stats = [
        { label: 'Başarılı Proje', value: '500+', icon: Award },
        { label: 'Ortalama Büyüme', value: '%280', icon: TrendingUp },
        { label: 'Mutlu Müşteri', value: '5,000+', icon: Users },
        { label: 'İşlenen Sipariş', value: '10M+', icon: Package },
    ];

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/20 blur-[150px] rounded-full" />
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
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-200/50 dark:border-emerald-700/50 rounded-full mb-8"
                    >
                        <Award size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tracking-wide">VAKA ANALİZLERİ</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            Başarı
                        </span>{' '}
                        Hikayeleri
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                        Pazaryonetimi ile büyüyen işletmelerin gerçek hikayeleri.
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> Rakamlarla kanıtlanmış sonuçlar.</span>
                    </p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-8 mt-10"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center">
                                    <stat.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
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
                    <div className="max-w-xl mx-auto mb-8">
                        <div className="relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Şirket veya hikaye ara..."
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                        {industries.map(industry => (
                            <button
                                key={industry}
                                onClick={() => setSelectedIndustry(industry)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedIndustry === industry
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {industry}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Featured Cases */}
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
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Öne Çıkan Hikayeler</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">En etkileyici dönüşüm hikayeleri</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {featuredCases.map((cs, i) => (
                            <motion.div
                                key={cs.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.1 }}
                                className="group relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cs.thumbnail}`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                                <div className="relative p-6 min-h-[400px] flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                                                {cs.logo}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">{cs.company}</div>
                                                <div className="text-white/60 text-sm">{cs.industry}</div>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                                            {cs.duration}
                                        </span>
                                    </div>

                                    {/* Results Grid */}
                                    <div className="grid grid-cols-2 gap-3 my-6">
                                        {cs.results.slice(0, 4).map((result, j) => (
                                            <div key={j} className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                                                <div className="text-2xl font-black text-white">{result.value}</div>
                                                <div className="text-xs text-white/60">{result.metric}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Title & CTA */}
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">{cs.title}</h3>
                                        <p className="text-white/70 text-sm mb-4">{cs.subtitle}</p>

                                        <Link
                                            href={`/case-studies/${cs.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-bold transition-colors"
                                        >
                                            Hikayeyi Oku
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* All Cases */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Building2 size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tüm Hikayeler</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{filteredCases.length} başarı hikayesi</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout">
                            {filteredCases.map((cs, i) => (
                                <motion.div
                                    key={cs.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: i * 0.05 }}
                                    layout
                                    className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all"
                                >
                                    {/* Main Card */}
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Left - Company Info */}
                                            <div className="md:w-1/4">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cs.thumbnail} flex items-center justify-center text-3xl`}>
                                                        {cs.logo}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{cs.company}</h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{cs.industry}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                        <Users size={14} />
                                                        {cs.size}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                        <Globe size={14} />
                                                        {cs.location}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                        <Clock size={14} />
                                                        {cs.duration}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Center - Story */}
                                            <div className="md:w-2/4">
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{cs.title}</h4>
                                                <p className="text-slate-600 dark:text-slate-400 mb-4">{cs.description}</p>

                                                {/* Marketplaces */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {cs.marketplaces.map((mp, j) => (
                                                        <span key={j} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
                                                            {mp}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2">
                                                    {cs.tags.map((tag, j) => (
                                                        <span key={j} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right - Results */}
                                            <div className="md:w-1/4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {cs.results.slice(0, 4).map((result, j) => (
                                                        <div key={j} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-center">
                                                            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{result.value}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">{result.metric}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expand Button */}
                                        <button
                                            onClick={() => setExpandedCase(expandedCase === cs.id ? null : cs.id)}
                                            className="mt-6 w-full flex items-center justify-center gap-2 py-3 border-t border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                        >
                                            {expandedCase === cs.id ? 'Daha Az Göster' : 'Detayları Gör'}
                                            <ChevronDown size={16} className={`transition-transform ${expandedCase === cs.id ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {expandedCase === cs.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 md:p-8 pt-0 border-t border-slate-100 dark:border-white/10">
                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        {/* Challenge */}
                                                        <div>
                                                            <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                                <Target size={18} className="text-red-500" />
                                                                Zorluk
                                                            </h5>
                                                            <p className="text-slate-600 dark:text-slate-400">{cs.challenge}</p>
                                                        </div>

                                                        {/* Solution */}
                                                        <div>
                                                            <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                                <Zap size={18} className="text-emerald-500" />
                                                                Çözüm
                                                            </h5>
                                                            <p className="text-slate-600 dark:text-slate-400">{cs.solution}</p>
                                                        </div>
                                                    </div>

                                                    {/* Testimonial */}
                                                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/30">
                                                        <Quote size={24} className="text-emerald-500 mb-4" />
                                                        <p className="text-lg italic text-slate-700 dark:text-slate-300 mb-4">
                                                            &ldquo;{cs.testimonial.quote}&rdquo;
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                                                                {cs.testimonial.author.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-900 dark:text-white">{cs.testimonial.author}</div>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400">{cs.testimonial.role}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CTA */}
                                                    <div className="mt-6 flex flex-wrap gap-4">
                                                        <Link
                                                            href={`/case-studies/${cs.id}`}
                                                            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                                        >
                                                            Tam Hikayeyi Oku
                                                            <ArrowRight size={16} />
                                                        </Link>
                                                        <button className="px-6 py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center gap-2">
                                                            <Download size={16} />
                                                            PDF İndir
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-24"
                >
                    <div className="relative p-12 md:p-16 rounded-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        <div className="relative text-center">
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Sıradaki Başarı Hikayesi Sizin Olsun
                            </h3>
                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                                500+ işletme Pazaryonetimi ile büyüdü. Şimdi sıra sizde.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/demo"
                                    className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    Ücretsiz Demo Al
                                    <ArrowRight size={18} />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/20"
                                >
                                    Fiyatları İncele
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
