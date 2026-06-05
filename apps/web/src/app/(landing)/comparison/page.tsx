"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, X, ArrowRight, BarChart3, Crown, Zap, Shield, Brain,
    Users, Clock, TrendingUp, Star, ChevronDown, MessageSquare,
    Globe, Package, Sparkles, Rocket, Building2, Award, Target,
    BadgeCheck, AlertTriangle, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const COMPARISON_DATA = {
    hero: {
        badge: "Akıllı Karşılaştırma",
        title: "Neden",
        titleHighlight: "Pazaryonetimi?",
        description: "Pazaryeri yönetim çözümlerini detaylıca karşılaştırın. 5.000+ işletmenin neden bizi tercih ettiğini görün."
    },
    competitors: [
        {
            id: 'traditional',
            name: 'Geleneksel Çözümler',
            logo: '/images/competitors/traditional.png',
            tagline: 'Klasik e-ticaret yazılımları',
            type: 'Klasik',
            founded: '-',
            pricing: 'Değişken',
            color: 'from-slate-500 to-slate-600'
        },
        {
            id: 'enterprise',
            name: 'Kurumsal Yazılımlar',
            logo: '/images/competitors/enterprise.png',
            tagline: 'Büyük ölçekli ERP sistemleri',
            type: 'Kurumsal',
            founded: '-',
            pricing: 'Yüksek',
            color: 'from-slate-600 to-slate-700'
        },
        {
            id: 'pazaryonetimi',
            name: 'Pazaryonetimi',
            logo: '/images/logo.png',
            tagline: 'AI-Powered Pazaryeri Yönetimi',
            type: 'Modern',
            founded: '2023',
            pricing: '₺299-1.299',
            color: 'from-green-500 to-emerald-500',
            isUs: true
        }
    ],
    categories: [
        {
            name: 'Temel Özellikler',
            icon: Package,
            features: [
                { name: 'Pazaryeri Entegrasyonu', traditional: '3-5 Platform', enterprise: '5-10 Platform', pazaryonetimi: '15+ Platform', highlight: 'pazaryonetimi' },
                { name: 'Ürün Yönetimi', traditional: true, enterprise: true, pazaryonetimi: true },
                { name: 'Sipariş Yönetimi', traditional: true, enterprise: true, pazaryonetimi: true },
                { name: 'Stok Senkronizasyonu', traditional: '30-60 dk', enterprise: '15-30 dk', pazaryonetimi: 'Anlık', highlight: 'pazaryonetimi' },
                { name: 'Çoklu Depo Desteği', traditional: false, enterprise: true, pazaryonetimi: true },
            ]
        },
        {
            name: 'AI & Otomasyon',
            icon: Brain,
            features: [
                { name: 'AI Fiyatlandırma', traditional: false, enterprise: false, pazaryonetimi: true, highlight: 'pazaryonetimi' },
                { name: 'Akıllı SEO Önerileri', traditional: false, enterprise: 'Temel', pazaryonetimi: 'Gelişmiş', highlight: 'pazaryonetimi' },
                { name: 'Otomatik Sipariş İşleme', traditional: false, enterprise: 'Kısmi', pazaryonetimi: '%100', highlight: 'pazaryonetimi' },
                { name: 'Rakip Analizi', traditional: false, enterprise: false, pazaryonetimi: true, highlight: 'pazaryonetimi' },
                { name: 'Satış Tahminleme', traditional: false, enterprise: false, pazaryonetimi: true, highlight: 'pazaryonetimi' },
            ]
        },
        {
            name: 'Analitik & Raporlama',
            icon: BarChart3,
            features: [
                { name: 'Gerçek Zamanlı Dashboard', traditional: false, enterprise: true, pazaryonetimi: true },
                { name: 'Gelişmiş Raporlar', traditional: 'Temel', enterprise: true, pazaryonetimi: true },
                { name: 'Kârlılık Analizi', traditional: false, enterprise: 'Temel', pazaryonetimi: 'Detaylı', highlight: 'pazaryonetimi' },
                { name: 'Trend Analizi', traditional: false, enterprise: false, pazaryonetimi: true, highlight: 'pazaryonetimi' },
                { name: 'Custom Dashboards', traditional: false, enterprise: 'Ücretli', pazaryonetimi: true, highlight: 'pazaryonetimi' },
            ]
        },
        {
            name: 'Destek & Entegrasyon',
            icon: Users,
            features: [
                { name: '7/24 Canlı Destek', traditional: false, enterprise: 'Ücretli', pazaryonetimi: true, highlight: 'pazaryonetimi' },
                { name: 'Türkçe Destek', traditional: true, enterprise: true, pazaryonetimi: true },
                { name: 'API Erişimi', traditional: 'Kısıtlı', enterprise: true, pazaryonetimi: 'Full', highlight: 'pazaryonetimi' },
                { name: 'Webhook Desteği', traditional: false, enterprise: true, pazaryonetimi: true },
                { name: 'Özel Entegrasyonlar', traditional: 'Ücretli', enterprise: 'Ücretli', pazaryonetimi: 'Dahil', highlight: 'pazaryonetimi' },
            ]
        }
    ],
    advantages: [
        {
            icon: Brain,
            title: 'AI-Powered Teknoloji',
            desc: 'Rakiplerimizin sunmadığı yapay zeka tabanlı fiyatlandırma, SEO ve tahminleme özellikleri.',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: Zap,
            title: 'Anlık Senkronizasyon',
            desc: '30 dakika yerine anlık stok ve fiyat güncellemesi. Hız farkı = Satış farkı.',
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: Shield,
            title: 'Şeffaf Fiyatlandırma',
            desc: 'Gizli maliyet yok. Tüm özellikler dahil. Rakiplerimiz ek ücret alırken biz dahil ediyoruz.',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: Users,
            title: '7/24 Türkçe Destek',
            desc: 'Her planda ücretsiz canlı destek. Rakipler ek ücret talep ediyor.',
            color: 'from-orange-500 to-amber-500'
        }
    ],
    stats: [
        { value: '15+', label: 'Pazaryeri Entegrasyonu', icon: Globe },
        { value: '%40', label: 'Ortalama Satış Artışı', icon: TrendingUp },
        { value: '5.000+', label: 'Aktif Kullanıcı', icon: Users },
        { value: '%98', label: 'Müşteri Memnuniyeti', icon: Star }
    ],
    testimonials: [
        {
            quote: "Geleneksel yazılımdan geçtikten sonra satışlarımız %35 arttı. AI fiyatlandırma gerçekten çalışıyor.",
            author: "Mehmet K.",
            company: "TechStore",
            rating: 5,
            previousPlatform: "Geleneksel Yazılım"
        },
        {
            quote: "Kurumsal ERP'de aylık 5.000₺ ödüyorduk, aynı özellikleri 799₺'ye alıyoruz. Üstelik AI dahil!",
            author: "Ayşe B.",
            company: "ModeVizyon",
            rating: 5,
            previousPlatform: "Kurumsal ERP"
        },
        {
            quote: "7/24 destek ve anlık senkronizasyon hayatımızı kurtardı. Artık stok sıkıntısı yok.",
            author: "Can D.",
            company: "ElektroMarket",
            rating: 5,
            previousPlatform: "Manuel Yönetim"
        }
    ],
    faqs: [
        {
            q: 'Geçiş süreci ne kadar sürer?',
            a: 'Mevcut platformunuzdan verilerinizi ortalama 2-3 iş günü içinde aktarıyoruz. Ekibimiz tüm süreçte yanınızda.'
        },
        {
            q: 'Verilerim güvende mi?',
            a: 'Evet, tüm veriler şifreli saklanır. KVKK ve GDPR uyumlu altyapımız ile %99.9 uptime garantisi sunuyoruz.'
        },
        {
            q: 'Mevcut entegrasyonlarım çalışır mı?',
            a: '15+ pazaryeri ile doğrudan entegreyiz. Özel entegrasyonlar için API ve webhook desteği sunuyoruz.'
        },
        {
            q: 'Eğitim veriliyor mu?',
            a: 'Evet, tüm planlarda ücretsiz onboarding eğitimi, video dersler ve dokümantasyon sunuyoruz.'
        }
    ]
};

export default function ComparisonPage() {
    const [activeCategory, setActiveCategory] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const renderValue = (value: boolean | string, highlight?: string, platform?: string) => {
        if (typeof value === 'boolean') {
            return value ? (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${highlight === platform ? 'bg-green-100 dark:bg-green-500/20' : 'bg-slate-100 dark:bg-white/5'
                    }`}>
                    <Check size={18} className={highlight === platform ? 'text-green-600 dark:text-green-400' : 'text-green-600 dark:text-green-400'} />
                </div>
            ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto">
                    <X size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
            );
        }
        return (
            <span className={`font-bold ${highlight === platform ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'
                }`}>
                {value}
            </span>
        );
    };

    return (
        <main className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-500">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-green-500/10 dark:bg-green-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 overflow-hidden">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-100 dark:border-green-500/20 rounded-full mb-8"
                        >
                            <BarChart3 size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-bold text-green-700 dark:text-green-300">{COMPARISON_DATA.hero.badge}</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-8 leading-[0.95]"
                        >
                            {COMPARISON_DATA.hero.title}
                            <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {COMPARISON_DATA.hero.titleHighlight}
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12"
                        >
                            {COMPARISON_DATA.hero.description}
                        </motion.p>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {COMPARISON_DATA.stats.map((stat, i) => (
                                <div key={i} className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-green-200 dark:hover:border-green-500/30 transition-all">
                                    <stat.icon size={24} className="mx-auto mb-3 text-green-600 dark:text-green-400" />
                                    <div className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Competitor Overview */}
            <section className="py-12 bg-slate-50 dark:bg-white/[0.02]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {COMPARISON_DATA.competitors.map((comp, i) => (
                            <motion.div
                                key={comp.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative p-8 rounded-3xl border-2 transition-all ${comp.isUs
                                        ? 'bg-gradient-to-b from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border-green-300 dark:border-green-500/30 shadow-2xl shadow-green-500/10'
                                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10'
                                    }`}
                            >
                                {comp.isUs && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-xl">
                                            <span className="text-white text-sm font-bold flex items-center gap-2">
                                                <Crown size={14} className="fill-white" />
                                                Önerilen
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="text-center">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${comp.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                        <span className="text-white text-2xl font-black">{comp.name[0]}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{comp.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{comp.tagline}</p>

                                    <div className="flex items-center justify-center gap-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full ${comp.isUs
                                                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                                            } font-bold`}>
                                            {comp.type}
                                        </span>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                        <div className="text-3xl font-black text-slate-900 dark:text-white">{comp.pricing}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Aylık Fiyat</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Tabs + Comparison Table */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {COMPARISON_DATA.categories.map((cat, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveCategory(i)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeCategory === i
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                <cat.icon size={18} />
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Comparison Table */}
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl"
                    >
                        {/* Header */}
                        <div className="grid grid-cols-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                            <div className="p-6 font-bold text-slate-500 dark:text-slate-400 flex items-center gap-3">
                                {React.createElement(COMPARISON_DATA.categories[activeCategory].icon, { size: 20 })}
                                {COMPARISON_DATA.categories[activeCategory].name}
                            </div>
                            <div className="p-6 text-center font-bold text-slate-700 dark:text-slate-300">Geleneksel</div>
                            <div className="p-6 text-center font-bold text-slate-700 dark:text-slate-300">Kurumsal</div>
                            <div className="p-6 text-center font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10">Pazaryonetimi</div>
                        </div>

                        {/* Rows */}
                        {COMPARISON_DATA.categories[activeCategory].features.map((feature, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-4 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="p-5 font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                    {feature.name}
                                    {feature.highlight === 'pazaryonetimi' && (
                                        <Sparkles size={14} className="ml-2 text-green-500" />
                                    )}
                                </div>
                                <div className="p-5 text-center flex items-center justify-center">
                                    {renderValue(feature.traditional, feature.highlight, 'traditional')}
                                </div>
                                <div className="p-5 text-center flex items-center justify-center">
                                    {renderValue(feature.enterprise, feature.highlight, 'enterprise')}
                                </div>
                                <div className="p-5 text-center flex items-center justify-center bg-green-50/50 dark:bg-green-500/5">
                                    {renderValue(feature.pazaryonetimi, feature.highlight, 'pazaryonetimi')}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Key Advantages */}
            <section className="py-20 bg-slate-50 dark:bg-white/[0.02]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                            Temel Avantajlarımız
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">Rakiplerimizden bizi ayıran özellikler</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {COMPARISON_DATA.advantages.map((adv, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-green-200 dark:hover:border-green-500/30 hover:shadow-xl transition-all group"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${adv.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <adv.icon size={28} className="text-white" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{adv.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{adv.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials from Switchers */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                            Geçiş Yapanlar Ne Diyor?
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">Diğer platformlardan geçen müşterilerimizin deneyimleri</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {COMPARISON_DATA.testimonials.map((testimonial, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/10"
                            >
                                {/* Previous Platform Badge */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-full text-xs font-bold line-through">
                                        {testimonial.previousPlatform}
                                    </div>
                                    <ArrowRight size={16} className="text-slate-400" />
                                    <div className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                                        Pazaryonetimi
                                    </div>
                                </div>

                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star key={j} size={18} className="text-yellow-500 fill-yellow-500" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-slate-700 dark:text-slate-300 mb-6 italic">&quot;{testimonial.quote}&quot;</p>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                        {testimonial.author[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{testimonial.author}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.company}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-50 dark:bg-white/[0.02]">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                            Geçiş Hakkında SSS
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {COMPARISON_DATA.faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-green-200 dark:hover:border-green-500/30 transition-all text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900 dark:text-white pr-4">{faq.q}</h3>
                                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </div>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.p
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed overflow-hidden"
                                            >
                                                {faq.a}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 md:p-20 text-center"
                    >
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[100px]" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-300 rounded-full blur-[100px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8">
                                <CheckCircle2 size={16} className="text-white" />
                                <span className="text-sm font-bold text-white/90">14 Gün Ücretsiz Deneme</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                                Farkı Kendiniz Görün
                            </h2>

                            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
                                Kredi kartı gerekmeden 14 gün ücretsiz deneyin. Memnun kalmazsanız hiçbir ücret yok.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/signup" className="group px-10 py-5 bg-white text-green-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2">
                                    Ücretsiz Deneyin
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/contact" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2">
                                    <MessageSquare size={20} />
                                    Danışmanlık Alın
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
