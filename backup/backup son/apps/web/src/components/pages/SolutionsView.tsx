"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Check, User, Users, Building2, ChevronRight, Sparkles, ArrowRight,
    Rocket, TrendingUp, ShoppingBag, BarChart3, Zap, Globe, Star, Crown,
    Target, Package, Clock, Shield, Brain, DollarSign, MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const SOLUTIONS_DATA = {
    hero: {
        badge: "Her Ölçekteki İşletme İçin",
        title: "İşinize Özel",
        titleHighlight: "Çözümler.",
        description: "KOBİ'den kurumsal şirketlere, her ölçekteki e-ticaret operasyonunu güçlendiren çözümler."
    },
    segments: [
        {
            id: 'startup',
            icon: User,
            name: 'Girişimciler',
            shortDesc: 'E-ticarete yeni başlayanlar',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            title: 'E-Ticarete Yeni Başlayanlar İçin',
            description: 'Sıfırdan başlayın, hızlıca büyüyün. Karmaşık sistemlerle uğraşmadan, kolay kurulum ve kullanım.',
            features: [
                'Tek tıkla pazaryeri bağlantısı',
                'Hazır ürün şablonları',
                'Otomatik fiyatlandırma',
                'Ücretsiz eğitim videoları',
                '7/24 destek hattı',
                'İlk 30 gün ücretsiz'
            ],
            stats: [
                { value: '1 Gün', label: 'Kurulum Süresi' },
                { value: '₺0', label: 'Başlangıç Maliyeti' },
                { value: '5K+', label: 'Yeni Girişimci' }
            ],
            caseStudy: {
                name: 'Ayşe Yılmaz',
                company: 'HandmadeByAyse',
                quote: '3 ay içinde 500 siparişe ulaştım. Pazaryonetimi olmadan bu mümkün olmazdı.',
                result: '+500%',
                resultLabel: 'Satış Artışı'
            }
        },
        {
            id: 'sme',
            icon: Users,
            name: 'KOBİ\'ler',
            shortDesc: 'Büyüyen işletmeler',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            title: 'Büyüyen İşletmeler İçin',
            description: 'Operasyonlarınızı ölçeklendirin. Çoklu kanal yönetimi, gelişmiş analitik ve otomasyon araçları.',
            features: [
                'Çoklu pazaryeri yönetimi',
                'Gelişmiş stok takibi',
                'AI fiyatlandırma önerileri',
                'Rakip analizi',
                'Özel raporlar',
                'API erişimi'
            ],
            stats: [
                { value: '%40', label: 'Verimlilik Artışı' },
                { value: '15+', label: 'Pazaryeri' },
                { value: '10K+', label: 'Aktif KOBİ' }
            ],
            caseStudy: {
                name: 'Mehmet Demir',
                company: 'TechMarket TR',
                quote: 'Manuel işlemler artık geçmişte kaldı. Ekibimiz stratejiye odaklanabiliyor.',
                result: '+40%',
                resultLabel: 'Kar Artışı'
            }
        },
        {
            id: 'enterprise',
            icon: Building2,
            name: 'Kurumsal',
            shortDesc: 'Büyük operasyonlar',
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
            title: 'Kurumsal Şirketler İçin',
            description: 'Enterprise seviyesinde güvenlik, özelleştirme ve destek. Global pazarlara açılın.',
            features: [
                'Özel sunucu altyapısı',
                'SSO & LDAP entegrasyonu',
                'Özel AI model eğitimi',
                'SLA garantili destek',
                'Dedicated account manager',
                'Global pazaryeri desteği'
            ],
            stats: [
                { value: '%99.9', label: 'Uptime SLA' },
                { value: '24/7', label: 'Premium Destek' },
                { value: '50+', label: 'Enterprise Müşteri' }
            ],
            caseStudy: {
                name: 'Ali Koç',
                company: 'MegaRetail Group',
                quote: '50M+ ürün, 20+ pazaryeri. Pazaryonetimi ile her şey tek panelde.',
                result: '50M+',
                resultLabel: 'İşlenen Ürün'
            }
        }
    ],
    industries: [
        { name: 'Moda & Giyim', icon: ShoppingBag, color: 'from-pink-500 to-rose-500' },
        { name: 'Elektronik', icon: Zap, color: 'from-blue-500 to-cyan-500' },
        { name: 'Ev & Yaşam', icon: Package, color: 'from-green-500 to-emerald-500' },
        { name: 'Kozmetik', icon: Star, color: 'from-purple-500 to-pink-500' },
        { name: 'Gıda', icon: Target, color: 'from-orange-500 to-amber-500' },
        { name: 'Spor', icon: TrendingUp, color: 'from-red-500 to-rose-500' },
    ],
    benefits: [
        {
            icon: Clock,
            title: 'Zaman Tasarrufu',
            desc: 'Manuel işlemleri %90 azaltın',
            stat: '10+ Saat/Hafta'
        },
        {
            icon: DollarSign,
            title: 'Maliyet Düşürme',
            desc: 'Operasyonel maliyetleri minimize edin',
            stat: '%35 Tasarruf'
        },
        {
            icon: TrendingUp,
            title: 'Satış Artışı',
            desc: 'Optimizasyon ile satışları artırın',
            stat: '+%45 Satış'
        },
        {
            icon: Shield,
            title: 'Hata Önleme',
            desc: 'Otomasyon ile hataları sıfıra indirin',
            stat: '%99.9 Doğruluk'
        }
    ]
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SolutionsView({ data }: { data: any }) {
    const [activeSegment, setActiveSegment] = useState('sme');
    const hero = data?.hero || SOLUTIONS_DATA.hero;

    const currentSegment = SOLUTIONS_DATA.segments.find(s => s.id === activeSegment) || SOLUTIONS_DATA.segments[1];

    // Handle hash-based segment switching
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                // Map hashes to segments if necessary
                const hashMap: Record<string, string> = {
                    'starter': 'startup',
                    'growth': 'sme'
                };

                const targetSegment = hashMap[hash] || hash;

                if (SOLUTIONS_DATA.segments.some(s => s.id === targetSegment)) {
                    setActiveSegment(targetSegment);

                    // Smooth scroll to the segments section
                    const element = document.getElementById('solutions-selector');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        };

        // Initial check
        handleHashChange();

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    return (
        <main className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-500">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center max-w-5xl mx-auto">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-100 dark:border-purple-500/20 rounded-full mb-8"
                        >
                            <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{hero.badge || SOLUTIONS_DATA.hero.badge}</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tight mb-8 leading-[0.95]"
                        >
                            {SOLUTIONS_DATA.hero.title}
                            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                                {SOLUTIONS_DATA.hero.titleHighlight}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed"
                        >
                            {hero.description || SOLUTIONS_DATA.hero.description}
                        </motion.p>

                        {/* Segment Selector */}
                        <motion.div
                            id="solutions-selector"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col md:flex-row items-center justify-center gap-4"
                        >
                            {SOLUTIONS_DATA.segments.map((segment) => (
                                <motion.button
                                    key={segment.id}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveSegment(segment.id)}
                                    className={`relative flex items-center gap-4 px-8 py-6 rounded-3xl font-bold transition-all w-full md:w-auto ${activeSegment === segment.id
                                            ? `bg-gradient-to-r ${segment.color} text-white shadow-2xl shadow-purple-500/20`
                                            : 'bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/30'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeSegment === segment.id ? 'bg-white/20' : `${segment.bgColor}`
                                        }`}>
                                        <segment.icon size={24} className={activeSegment === segment.id ? 'text-white' : ''} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-lg font-black">{segment.name}</div>
                                        <div className={`text-sm ${activeSegment === segment.id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {segment.shortDesc}
                                        </div>
                                    </div>
                                    {activeSegment === segment.id && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 rotate-45 shadow-lg"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Selected Segment Detail */}
            <section className="py-20 relative">
                <div className="container mx-auto px-6 max-w-7xl">
                    <motion.div
                        key={activeSegment}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    >
                        {/* Left: Content */}
                        <div className="space-y-8">
                            {/* Icon & Title */}
                            <div>
                                <div className={`inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br ${currentSegment.color} items-center justify-center mb-6 shadow-2xl`}>
                                    <currentSegment.icon size={36} className="text-white" />
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                                    {currentSegment.title}
                                </h2>
                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {currentSegment.description}
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {currentSegment.features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10"
                                    >
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentSegment.color} flex items-center justify-center flex-shrink-0`}>
                                            <Check size={16} className="text-white" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feature}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-6">
                                {currentSegment.stats.map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className={`text-3xl font-black bg-gradient-to-r ${currentSegment.color} bg-clip-text text-transparent`}>
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="flex gap-4">
                                <Link href="/signup" className={`group px-8 py-4 bg-gradient-to-r ${currentSegment.color} text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105`}>
                                    <span className="flex items-center gap-2">
                                        Hemen Başla
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                    </span>
                                </Link>
                                <Link href="/contact" className="px-8 py-4 bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                                    Demo Talep Et
                                </Link>
                            </div>
                        </div>

                        {/* Right: Case Study Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${currentSegment.color} opacity-10 rounded-[3rem] blur-3xl`} />
                            <div className="relative bg-white dark:bg-white/[0.02] rounded-[3rem] border border-slate-200 dark:border-white/10 p-10 shadow-2xl">
                                {/* Header */}
                                <div className="flex items-center gap-2 mb-8">
                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Başarı Hikayesi</span>
                                </div>

                                {/* Quote */}
                                <div className="mb-8">
                                    <div className="text-5xl text-slate-200 dark:text-slate-700 font-serif mb-4">&ldquo;</div>
                                    <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {currentSegment.caseStudy.quote}
                                    </p>
                                </div>

                                {/* Author */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentSegment.color} flex items-center justify-center text-white font-bold text-lg`}>
                                            {currentSegment.caseStudy.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{currentSegment.caseStudy.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{currentSegment.caseStudy.company}</div>
                                        </div>
                                    </div>

                                    {/* Result */}
                                    <div className="text-right">
                                        <div className={`text-3xl font-black bg-gradient-to-r ${currentSegment.color} bg-clip-text text-transparent`}>
                                            {currentSegment.caseStudy.result}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                            {currentSegment.caseStudy.resultLabel}
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Elements */}
                                <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${currentSegment.color} opacity-20 rounded-full blur-2xl`} />
                                <div className={`absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br ${currentSegment.color} opacity-10 rounded-full blur-3xl`} />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Industries Section */}
            <section className="py-20 bg-slate-50 dark:bg-white/[0.02]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
                        >
                            Her Sektöre <span className="text-purple-600">Uygun</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-lg text-slate-600 dark:text-slate-400"
                        >
                            Hangi sektörde olursanız olun, size özel çözümler sunuyoruz.
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {SOLUTIONS_DATA.industries.map((industry, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="group p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-xl transition-all text-center cursor-pointer"
                            >
                                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <industry.icon size={24} className="text-white" />
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">{industry.name}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4"
                        >
                            Neden <span className="text-purple-600">Pazaryonetimi?</span>
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {SOLUTIONS_DATA.benefits.map((benefit, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative p-8 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-2xl transition-all overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                        <benefit.icon size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-4">{benefit.desc}</p>
                                    <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        {benefit.stat}
                                    </div>
                                </div>
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
                        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-12 md:p-20 text-center"
                    >
                        {/* Background Elements */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[100px]" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-300 rounded-full blur-[100px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-8">
                                <Crown size={16} className="text-yellow-300" />
                                <span className="text-sm font-bold text-white/90">Özel Teklif Alın</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                                Size Özel Çözümü<br />Birlikte Tasarlayalım
                            </h2>

                            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
                                Uzman ekibimiz ihtiyaçlarınızı analiz edip size en uygun çözümü sunacak.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/contact" className="group px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transition-all hover:scale-105">
                                    <span className="flex items-center gap-2">
                                        Ücretsiz Danışmanlık
                                        <MessageSquare size={20} />
                                    </span>
                                </Link>
                                <Link href="/pricing" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                                    Fiyatları Gör
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
