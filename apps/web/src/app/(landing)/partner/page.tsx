"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Zap, TrendingUp, DollarSign, ArrowRight,
    Check, Star, Award, Briefcase, Globe,
    Building2, Rocket, Shield, Gift, ChevronDown, Play,
    Phone, Mail, Clock, Sparkles, CheckCircle2,
    BarChart3, Layers, MessageSquare, ExternalLink, Crown,
    Handshake, GraduationCap, FileText, Calendar
} from 'lucide-react';
import Link from 'next/link';

interface PartnerBenefit {
    icon: React.ElementType;
    title: string;
    description: string;
    highlight?: string;
}

interface PartnerTier {
    name: string;
    commission: string;
    requirement: string;
    features: string[];
    color: string;
    popular?: boolean;
}

interface PartnerSuccess {
    company: string;
    logo: string;
    story: string;
    revenue: string;
    growth: string;
    testimonial: string;
    person: string;
    role: string;
}

const partnerTypes = [
    {
        id: 'agency',
        label: 'Ajanslar',
        icon: Building2,
        description: 'E-ticaret ve dijital pazarlama ajansları',
        color: 'from-violet-500 to-purple-600',
        benefits: [
            'Müşterilerinize premium çözüm sunun',
            'White-label dashboard erişimi',
            'Öncelikli teknik destek',
            'Co-marketing fırsatları'
        ]
    },
    {
        id: 'reseller',
        label: 'Satıcılar',
        icon: Briefcase,
        description: 'B2B satış ve danışmanlık firmaları',
        color: 'from-orange-500 to-amber-600',
        benefits: [
            'Yüksek komisyon oranları',
            'Satış eğitimi ve sertifikasyon',
            'Demo hesap ve materyaller',
            'Lead paylaşım programı'
        ]
    },
    {
        id: 'tech',
        label: 'Teknoloji Partnerleri',
        icon: Rocket,
        description: 'Yazılım ve entegrasyon şirketleri',
        color: 'from-emerald-500 to-teal-600',
        benefits: [
            'API erişimi ve dokümantasyon',
            'Teknik entegrasyon desteği',
            'Marketplace\'te listeleme',
            'Ortak geliştirme fırsatları'
        ]
    },
    {
        id: 'affiliate',
        label: 'Affiliate',
        icon: Globe,
        description: 'İçerik üreticileri ve influencer\'lar',
        color: 'from-pink-500 to-rose-600',
        benefits: [
            'Kolay başvuru süreci',
            'Özel affiliate linkleri',
            'Gerçek zamanlı takip',
            'Aylık ödeme garantisi'
        ]
    },
];

const benefits: PartnerBenefit[] = [
    {
        icon: DollarSign,
        title: 'Rekabetçi Komisyon',
        description: 'Her başarılı satışta %15 ile %35 arasında komisyon kazanın.',
        highlight: '%35\'e kadar'
    },
    {
        icon: TrendingUp,
        title: 'Pazarlama Desteği',
        description: 'Premium pazarlama materyalleri, landing page\'ler ve kampanya destekleri.',
        highlight: '50+ materyal'
    },
    {
        icon: Users,
        title: 'Dedicated Account Manager',
        description: 'Size özel hesap yöneticisi ile birebir destek ve strateji geliştirme.',
        highlight: '7/24 destek'
    },
    {
        icon: Zap,
        title: 'Hızlı Onboarding',
        description: 'Sadece 24 saat içinde programa katılın ve satışlara başlayın.',
        highlight: '24 saat'
    },
    {
        icon: BarChart3,
        title: 'Gelişmiş Analytics',
        description: 'Performansınızı izlemek için real-time dashboard ve detaylı raporlar.',
        highlight: 'Real-time'
    },
    {
        icon: GraduationCap,
        title: 'Eğitim & Sertifikasyon',
        description: 'Ürün eğitimleri, satış teknikleri ve resmi sertifikasyon programı.',
        highlight: 'Sertifikalı'
    },
    {
        icon: Gift,
        title: 'Özel Bonuslar',
        description: 'Hedef aşımlarında ekstra bonuslar ve performans ödülleri.',
        highlight: '₺50K+ bonus'
    },
    {
        icon: Shield,
        title: 'Uzun Vadeli Gelir',
        description: 'Müşteri lifetime value üzerinden recurring komisyon kazanın.',
        highlight: 'Recurring'
    },
];

const tiers: PartnerTier[] = [
    {
        name: 'Bronze',
        commission: '%15',
        requirement: 'Başlangıç',
        color: 'from-amber-600 to-yellow-700',
        features: [
            'Temel partner dashboard',
            'E-posta desteği',
            'Pazarlama materyalleri',
            'Aylık ödeme'
        ]
    },
    {
        name: 'Silver',
        commission: '%20',
        requirement: '3+ aktif müşteri',
        color: 'from-slate-400 to-slate-500',
        features: [
            'Gelişmiş analytics',
            'Öncelikli destek',
            'Co-branding fırsatları',
            'Haftalık ödeme',
            'Demo hesaplar'
        ]
    },
    {
        name: 'Gold',
        commission: '%25',
        requirement: '10+ aktif müşteri',
        color: 'from-amber-400 to-yellow-500',
        popular: true,
        features: [
            'Dedicated account manager',
            'White-label çözümler',
            'Lead paylaşımı',
            'Özel kampanya desteği',
            'VIP etkinlik davetleri',
            'Bonus programı'
        ]
    },
    {
        name: 'Platinum',
        commission: '%35',
        requirement: '25+ aktif müşteri',
        color: 'from-slate-300 to-slate-400',
        features: [
            'Stratejik ortaklık',
            'Özel API erişimi',
            'Joint venture fırsatları',
            'Global expansion desteği',
            'C-level görüşmeleri',
            'Yıllık summit daveti',
            'Revenue share modeli'
        ]
    },
];

const successStories: PartnerSuccess[] = [
    {
        company: 'Dijital Çözümler A.Ş.',
        logo: '🏢',
        story: 'Partner olduktan 6 ay sonra 25 müşteriye ulaştık. Pazaryonetimi ile müşteri memnuniyeti %97\'ye yükseldi ve churn oranımız %2\'ye düştü.',
        revenue: '₺450K',
        growth: '+340%',
        testimonial: 'Pazaryonetimi partnerliği işimizi tamamen dönüştürdü. Artık müşterilerimize gerçek değer katıyoruz.',
        person: 'Ahmet Yıldırım',
        role: 'CEO'
    },
    {
        company: 'E-commerce Danışmanlık Ltd.',
        logo: '💼',
        story: 'Müşterilerimize Pazaryonetimi önermeye başladık ve passive income\'ımız 6 haneli rakamlara ulaştı. Şimdi Gold partner statüsündeyiz.',
        revenue: '₺680K',
        growth: '+520%',
        testimonial: 'En iyi kararımız Pazaryonetimi partneri olmaktı. Komisyonlar harika, destek mükemmel.',
        person: 'Zeynep Kara',
        role: 'Founder'
    },
    {
        company: 'TechBridge Solutions',
        logo: '🚀',
        story: 'API entegrasyonu sayesinde kendi SaaS ürünümüze Pazaryonetimi özelliklerini ekledik. Müşterilerimiz çok memnun.',
        revenue: '₺320K',
        growth: '+180%',
        testimonial: 'Teknik partner programı muhteşem. Dokümantasyon ve destek üst düzey.',
        person: 'Can Özkan',
        role: 'CTO'
    },
];

const faqs = [
    {
        question: 'Partner programına kimler başvurabilir?',
        answer: 'E-ticaret danışmanları, dijital ajanslar, yazılım şirketleri, B2B satıcılar ve içerik üreticileri başvurabilir. Minimum gereksinim sektör deneyimi ve aktif müşteri/takipçi portföyüdür.'
    },
    {
        question: 'Komisyon ödemeleri nasıl yapılır?',
        answer: 'Bronze ve Silver partnerler için aylık, Gold ve üzeri için haftalık ödeme yapılır. Minimum ödeme tutarı ₺500\'dir. Banka havalesi veya PayPal ile ödeme alabilirsiniz.'
    },
    {
        question: 'Müşteri kaybettiğimde komisyon ne olur?',
        answer: 'İlk 12 ay boyunca aktif kalan müşteriler için lifetime komisyon kazanırsınız. Müşteri iptal ederse, sonraki ödemelerden komisyon kesilmez ancak önceki kazanımlarınız korunur.'
    },
    {
        question: 'White-label çözüm nedir?',
        answer: 'Gold ve üzeri partnerler kendi markalarıyla Pazaryonetimi çözümünü sunabilir. Özel domain, logo ve renklerle müşterilerinize beyaz etiketli platform sağlayabilirsiniz.'
    },
    {
        question: 'Başvuru süreci ne kadar sürer?',
        answer: 'Başvurular genellikle 24-48 saat içinde değerlendirilir. Onaylanmanız halinde aynı gün partner portalına erişim sağlanır ve hemen satışlara başlayabilirsiniz.'
    },
];

export default function PartnerPage() {
    const [selectedType, setSelectedType] = useState('agency');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const currentPartnerType = partnerTypes.find(p => p.id === selectedType);

    return (
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-500/10 dark:bg-violet-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/20 blur-[150px] rounded-full" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 blur-[200px] rounded-full" />
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
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-amber-900/40 border border-violet-200/50 dark:border-violet-700/50 rounded-full mb-8"
                    >
                        <Handshake size={16} className="text-violet-600 dark:text-violet-400" />
                        <span className="text-sm font-bold text-violet-700 dark:text-violet-300 tracking-wide">PARTNER PROGRAMI</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Birlikte{' '}
                        <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Büyüyelim
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
                        Türkiye&apos;nin en hızlı büyüyen e-ticaret platformunun partneri olun.
                        <span className="text-violet-600 dark:text-violet-400 font-semibold"> %35&apos;e varan komisyon</span> kazanın.
                    </p>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-8"
                    >
                        {[
                            { label: 'Aktif Partner', value: '500+', icon: Users },
                            { label: 'Ödenen Komisyon', value: '₺15M+', icon: DollarSign },
                            { label: 'Partner Memnuniyeti', value: '%96', icon: Star },
                            { label: 'Ortalama Kazanç', value: '₺12K/ay', icon: TrendingUp },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center">
                                    <stat.icon size={18} className="text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="text-left">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Partner Types Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Partner Tipini Seçin</h2>
                        <p className="text-slate-600 dark:text-slate-400">Size en uygun partner programını bulun</p>
                    </div>

                    {/* Type Tabs */}
                    <div className="flex flex-wrap gap-4 justify-center mb-10">
                        {partnerTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${selectedType === type.id
                                        ? `bg-gradient-to-r ${type.color} text-white shadow-lg shadow-violet-500/25`
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                <type.icon size={24} />
                                <div className="text-left">
                                    <div className="text-sm font-bold">{type.label}</div>
                                    <div className={`text-xs ${selectedType === type.id ? 'text-white/70' : 'text-slate-400'}`}>
                                        {type.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Selected Type Details */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedType}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`relative p-8 md:p-12 rounded-3xl overflow-hidden`}
                        >
                            {/* Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${currentPartnerType?.color} opacity-10 dark:opacity-20`} />
                            <div className="absolute inset-0 bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm" />

                            <div className="relative grid md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${currentPartnerType?.color} text-white mb-6`}>
                                        {currentPartnerType && <currentPartnerType.icon size={18} />}
                                        <span className="font-bold">{currentPartnerType?.label}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                                        {currentPartnerType?.label} için Özel Avantajlar
                                    </h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                                        {currentPartnerType?.description} için tasarlanmış partner programı
                                    </p>
                                    <Link
                                        href="/contact?subject=partner"
                                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r ${currentPartnerType?.color} text-white hover:opacity-90 transition-opacity`}
                                    >
                                        Hemen Başvur
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {currentPartnerType?.benefits.map((benefit, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-white/10 shadow-sm"
                                        >
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentPartnerType?.color} flex items-center justify-center`}>
                                                <CheckCircle2 size={20} className="text-white" />
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Benefits Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Partner Avantajları</h2>
                        <p className="text-slate-600 dark:text-slate-400">Tüm partner tiplerine sunulan faydalar</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all hover:shadow-xl"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <benefit.icon size={24} className="text-violet-600 dark:text-violet-400" />
                                    </div>
                                    {benefit.highlight && (
                                        <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-lg">
                                            {benefit.highlight}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Commission Tiers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Komisyon Yapısı</h2>
                        <p className="text-slate-600 dark:text-slate-400">Performansınıza göre artan komisyon oranları</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tiers.map((tier, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative p-6 rounded-2xl overflow-hidden ${tier.popular
                                        ? 'ring-2 ring-amber-400 dark:ring-amber-500'
                                        : 'border border-slate-200 dark:border-white/10'
                                    } bg-white dark:bg-white/5`}
                            >
                                {/* Popular Badge */}
                                {tier.popular && (
                                    <div className="absolute top-4 right-4">
                                        <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <Crown size={12} />
                                            EN POPÜLER
                                        </span>
                                    </div>
                                )}

                                {/* Tier Badge */}
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${tier.color} text-white mb-6`}>
                                    <Award size={18} />
                                    <span className="font-bold">{tier.name}</span>
                                </div>

                                {/* Commission */}
                                <div className="mb-6">
                                    <div className={`text-5xl font-black bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                                        {tier.commission}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">komisyon oranı</div>
                                </div>

                                {/* Requirement */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 mb-6">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Gereksinim: <span className="text-slate-900 dark:text-white">{tier.requirement}</span>
                                    </span>
                                </div>

                                {/* Features */}
                                <div className="space-y-3">
                                    {tier.features.map((feature, j) => (
                                        <div key={j} className="flex items-center gap-3">
                                            <Check size={16} className={`${tier.popular ? 'text-amber-500' : 'text-violet-500'}`} />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Success Stories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Partner Başarı Hikayeleri</h2>
                        <p className="text-slate-600 dark:text-slate-400">Partnerlerimizin gerçek sonuçları</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {successStories.map((story, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all hover:shadow-xl"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center text-2xl">
                                        {story.logo}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{story.company}</h3>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className="fill-current" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{story.revenue}</div>
                                        <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Toplam Kazanç</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                                        <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{story.growth}</div>
                                        <div className="text-xs text-orange-600/70 dark:text-orange-400/70">Büyüme</div>
                                    </div>
                                </div>

                                {/* Story */}
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    {story.story}
                                </p>

                                {/* Testimonial */}
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border-l-4 border-violet-500">
                                    <p className="text-sm italic text-slate-700 dark:text-slate-300 mb-3">
                                        &ldquo;{story.testimonial}&rdquo;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                            {story.person.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">{story.person}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{story.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Requirements Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="p-8 md:p-12 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Başvuru Koşulları</h2>
                            <p className="text-slate-600 dark:text-slate-400">Partner olmak için gereken minimum kriterler</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { type: 'Ajanslar', icon: Building2, reqs: ['E-ticaret danışmanlığı deneyimi', 'Aktif müşteri portföyü (min. 5)', 'Pazaryeri bilgisi', 'Teknik destek yeteneği'] },
                                { type: 'Satıcılar', icon: Briefcase, reqs: ['B2B satış deneyimi', 'Sektör ağı ve network', 'CRM/ERP bilgisi', 'İletişim becerisi'] },
                                { type: 'Teknoloji', icon: Rocket, reqs: ['Yazılım geliştirme tecrübesi', 'API entegrasyon bilgisi', 'SaaS ürün deneyimi', 'Teknik dokümantasyon'] },
                                { type: 'Affiliate', icon: Globe, reqs: ['Aktif sosyal medya/blog', 'E-ticaret içerik deneyimi', 'Min. 5K takipçi/ziyaretçi', 'İçerik üretim kapasitesi'] },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                            <item.icon size={20} className="text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{item.type}</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {item.reqs.map((req, j) => (
                                            <div key={j} className="flex items-center gap-2">
                                                <Check size={14} className="text-violet-500 flex-shrink-0" />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{req}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Sıkça Sorulan Sorular</h2>
                        <p className="text-slate-600 dark:text-slate-400">Partner programı hakkında merak edilenler</p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                                >
                                    <span className="font-bold text-slate-900 dark:text-white pr-4">{faq.question}</span>
                                    <ChevronDown
                                        size={20}
                                        className={`text-slate-400 transition-transform flex-shrink-0 ${expandedFaq === i ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                <AnimatePresence>
                                    {expandedFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 pt-0 text-slate-600 dark:text-slate-400">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="relative p-12 md:p-16 rounded-[2rem] overflow-hidden">
                        {/* Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        {/* Floating Elements */}
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl" />

                        <div className="relative">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                {/* Left Content */}
                                <div className="text-white">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                        <Sparkles size={16} />
                                        <span className="text-sm font-bold">24 SAAT İÇİNDE ONAY</span>
                                    </div>

                                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                                        Partnerimiz Olmaya Hazır mısınız?
                                    </h2>

                                    <p className="text-xl text-white/80 mb-8">
                                        Hemen başvurun, 24 saat içinde size dönüş yapalım. Binlerce partnerle birlikte büyüyelim.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            href="/contact?subject=partner"
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-700 rounded-xl font-bold hover:bg-violet-50 transition-colors shadow-lg shadow-black/20"
                                        >
                                            Partner Başvurusu Yap
                                            <ArrowRight size={18} />
                                        </Link>
                                        <Link
                                            href="/partner-demo"
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors border border-white/20"
                                        >
                                            <Play size={18} />
                                            Demo İzle
                                        </Link>
                                    </div>
                                </div>

                                {/* Right - Contact Info */}
                                <div className="space-y-4">
                                    {[
                                        { icon: Mail, label: 'E-posta', value: 'partners@pazaryonetimi.com' },
                                        { icon: Phone, label: 'Telefon', value: '+90 212 555 0123' },
                                        { icon: Clock, label: 'Yanıt Süresi', value: '24 saat içinde' },
                                        { icon: Calendar, label: 'Demo', value: 'Online görüşme planlayın' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                                <item.icon size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-white/60">{item.label}</div>
                                                <div className="font-bold text-white">{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                    <p className="text-slate-500 dark:text-slate-400 mb-4">Daha fazla bilgi</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { label: 'Partner Portal', href: '/partner-portal', icon: Layers },
                            { label: 'Komisyon Hesaplayıcı', href: '/commission-calculator', icon: DollarSign },
                            { label: 'Partner Rehberi', href: '/partner-guide', icon: FileText },
                            { label: 'SSS', href: '/faq', icon: MessageSquare },
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
