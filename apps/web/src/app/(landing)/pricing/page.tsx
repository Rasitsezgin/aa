"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check, X, Zap, Crown, Rocket, Star, Shield, Users, Globe, Brain,
    ArrowRight, Sparkles, HelpCircle, Building2, MessageSquare, Clock,
    TrendingUp, Package, BarChart3, Lock, Gift, BadgeCheck, Phone
} from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_PRICING_CATALOG, type PricingCatalog } from '@/config/pricing-catalog';

const PRICING_DATA = {
    hero: {
        badge: "Şeffaf Fiyatlandırma",
        title: "Büyümenize Uygun",
        titleHighlight: "Planlar.",
        description: "Gizli maliyet yok. Her plan için 14 gün ücretsiz deneme. İstediğiniz zaman iptal."
    },
    toggle: {
        monthly: 'Aylık',
        yearly: 'Yıllık',
        discount: '%20 İndirim'
    },
    plans: [
        {
            id: 'starter',
            name: 'Başlangıç',
            desc: 'E-ticarete yeni başlayanlar için ideal başlangıç paketi.',
            price: { monthly: 299, yearly: 239 },
            icon: Rocket,
            color: 'from-blue-500 to-cyan-500',
            popular: false,
            features: [
                { name: '2 Pazaryeri Entegrasyonu', included: true },
                { name: '1.000 Ürün Limiti', included: true },
                { name: 'Temel Stok Yönetimi', included: true },
                { name: 'Manuel Sipariş Takibi', included: true },
                { name: 'E-posta Desteği', included: true },
                { name: 'Temel Raporlar', included: true },
                { name: 'AI SEO Önerileri', included: false },
                { name: 'Rakip Analizi', included: false },
                { name: 'Dinamik Fiyatlandırma', included: false },
                { name: 'API Erişimi', included: false },
            ],
            cta: 'Ücretsiz Dene',
            ctaLink: '/signup?plan=starter'
        },
        {
            id: 'professional',
            name: 'Profesyonel',
            desc: 'Büyüyen işletmeler için en popüler seçim.',
            price: { monthly: 799, yearly: 639 },
            icon: Crown,
            color: 'from-purple-500 to-pink-500',
            popular: true,
            features: [
                { name: 'Sınırsız Pazaryeri', included: true, highlight: true },
                { name: '10.000 Ürün Limiti', included: true },
                { name: 'Gelişmiş Stok Yönetimi', included: true },
                { name: 'Otomatik Sipariş İşleme', included: true, highlight: true },
                { name: '7/24 Canlı Destek', included: true, highlight: true },
                { name: 'Detaylı Analitik', included: true },
                { name: 'AI SEO Optimizasyonu', included: true, highlight: true },
                { name: 'Temel Rakip Analizi', included: true },
                { name: 'Dinamik Fiyatlandırma', included: true, highlight: true },
                { name: 'API Erişimi', included: true },
            ],
            cta: 'Hemen Başla',
            ctaLink: '/signup?plan=professional'
        },
        {
            id: 'enterprise',
            name: 'Kurumsal',
            desc: 'Büyük ölçekli operasyonlar için özel çözümler.',
            price: { monthly: 'Özel', yearly: 'Özel' },
            icon: Building2,
            color: 'from-orange-500 to-red-500',
            popular: false,
            features: [
                { name: 'Sınırsız Her Şey', included: true, highlight: true },
                { name: '50.000+ Ürün Kapasitesi', included: true },
                { name: 'Çoklu Depo Yönetimi', included: true },
                { name: 'Özel Entegrasyonlar', included: true, highlight: true },
                { name: 'Dedicated Account Manager', included: true, highlight: true },
                { name: 'Custom Raporlar', included: true },
                { name: 'Özel AI Model Eğitimi', included: true, highlight: true },
                { name: 'Gelişmiş Rakip Analizi', included: true },
                { name: 'White-label Seçenekleri', included: true },
                { name: 'SLA Garantisi (%99.9)', included: true, highlight: true },
            ],
            cta: 'İletişime Geç',
            ctaLink: '/contact?plan=enterprise'
        }
    ],
    addons: [
        {
            name: 'Ekstra Pazaryeri',
            price: '+₺99/ay',
            desc: 'Ek pazaryeri entegrasyonu',
            icon: Globe
        },
        {
            name: 'Ek 5.000 Ürün',
            price: '+₺149/ay',
            desc: 'Ürün limitini artırın',
            icon: Package
        },
        {
            name: 'Öncelikli Destek',
            price: '+₺199/ay',
            desc: '1 saat içinde yanıt garantisi',
            icon: Clock
        },
        {
            name: 'Gelişmiş Analytics',
            price: '+₺249/ay',
            desc: 'Custom dashboardlar ve raporlar',
            icon: BarChart3
        }
    ],
    comparison: [
        { feature: 'Pazaryeri Sayısı', starter: '2', professional: 'Sınırsız', enterprise: 'Sınırsız' },
        { feature: 'Ürün Limiti', starter: '1.000', professional: '10.000', enterprise: '50.000+' },
        { feature: 'Stok Güncelleme', starter: '30 dk', professional: '5 dk', enterprise: 'Anlık' },
        { feature: 'AI Özellikleri', starter: false, professional: true, enterprise: true },
        { feature: 'Rakip Analizi', starter: false, professional: 'Temel', enterprise: 'Gelişmiş' },
        { feature: 'API Erişimi', starter: false, professional: true, enterprise: true },
        { feature: 'Özel Entegrasyonlar', starter: false, professional: false, enterprise: true },
        { feature: 'SLA Garantisi', starter: false, professional: false, enterprise: '%99.9' },
        { feature: 'Account Manager', starter: false, professional: false, enterprise: true },
        { feature: 'Destek', starter: 'E-posta', professional: '7/24 Canlı', enterprise: 'Dedicated' },
    ],
    faqs: [
        {
            q: 'Ücretsiz deneme süresi ne kadar?',
            a: 'Tüm planlarımızda 14 gün ücretsiz deneme hakkı sunuyoruz. Kredi kartı bilgisi gerekmez.'
        },
        {
            q: 'Plan değişikliği yapabilir miyim?',
            a: 'Evet, istediğiniz zaman üst veya alt plana geçiş yapabilirsiniz. Geçiş anlık olarak uygulanır.'
        },
        {
            q: 'İptal etmek istersem ne olur?',
            a: 'İstediğiniz zaman iptal edebilirsiniz. Mevcut dönem sonuna kadar hizmet devam eder.'
        },
        {
            q: 'Ödeme yöntemleri nelerdir?',
            a: 'Kredi kartı, banka kartı ve havale/EFT ile ödeme yapabilirsiniz. Kurumsal fatura kesilir.'
        },
        {
            q: 'Teknik destek nasıl sağlanıyor?',
            a: 'Plana göre e-posta, canlı chat veya telefon desteği sunuyoruz. Enterprise planlarda dedicated manager atanır.'
        },
        {
            q: 'Verilerim güvende mi?',
            a: 'Evet, tüm verileriniz şifreli olarak saklanır. KVKK ve GDPR uyumlu altyapı kullanıyoruz.'
        }
    ],
    guarantees: [
        { icon: Shield, text: '14 Gün Para İadesi' },
        { icon: Lock, text: 'SSL Güvenli Ödeme' },
        { icon: BadgeCheck, text: 'KVKK Uyumlu' },
        { icon: Gift, text: 'Gizli Maliyet Yok' }
    ]
};

export default function PricingPage() {
    const [isYearly, setIsYearly] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [catalog, setCatalog] = useState<PricingCatalog>(DEFAULT_PRICING_CATALOG);

    useEffect(() => {
        let isMounted = true;

        const loadCatalog = async () => {
            try {
                const res = await fetch('/api/pricing-catalog', { cache: 'no-store' });
                if (!res.ok) return;
                const data = (await res.json()) as PricingCatalog;
                if (isMounted) {
                    setCatalog(data);
                }
            } catch {
                // Varsayilan fiyatlar ile devam et
            }
        };

        loadCatalog();
        return () => {
            isMounted = false;
        };
    }, []);

    const resolvedPlans = PRICING_DATA.plans.map((plan) => {
        if (plan.id === 'starter') {
            const starter = catalog.plans.find((item) => item.id === 'starter');
            if (!starter) return plan;

            return {
                ...plan,
                name: starter.name,
                price: {
                    monthly: starter.monthly ?? plan.price.monthly,
                    yearly: starter.yearly ?? plan.price.yearly,
                },
            };
        }

        if (plan.id === 'professional') {
            const professional = catalog.plans.find((item) => item.id === 'professional');
            if (!professional) return plan;

            return {
                ...plan,
                name: professional.name,
                price: {
                    monthly: professional.monthly ?? plan.price.monthly,
                    yearly: professional.yearly ?? plan.price.yearly,
                },
            };
        }

        if (plan.id === 'enterprise') {
            const enterprise = catalog.plans.find((item) => item.id === 'enterprise');
            if (!enterprise) return plan;

            return {
                ...plan,
                name: enterprise.name,
                price: {
                    monthly: enterprise.enterpriseLabel ?? 'Ozel',
                    yearly: enterprise.enterpriseLabel ?? 'Ozel',
                },
            };
        }

        return plan;
    });

    const formatPrice = (price: number | string) => {
        if (typeof price === 'string') return price;
        return new Intl.NumberFormat('tr-TR').format(price);
    };

    return (
        <main className="min-h-screen bg-white dark:bg-[#020617] transition-colors duration-500">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-green-500/10 dark:bg-green-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-12 overflow-hidden">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-100 dark:border-green-500/20 rounded-full mb-8"
                        >
                            <Sparkles size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-sm font-bold text-green-700 dark:text-green-300">{PRICING_DATA.hero.badge}</span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-8 leading-[0.95]"
                        >
                            {PRICING_DATA.hero.title}
                            <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                {PRICING_DATA.hero.titleHighlight}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12"
                        >
                            {PRICING_DATA.hero.description}
                        </motion.p>

                        {/* Billing Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-4 p-2 bg-slate-100 dark:bg-white/5 rounded-2xl"
                        >
                            <button
                                onClick={() => setIsYearly(false)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all ${!isYearly
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                {catalog.monthlyLabel}
                            </button>
                            <button
                                onClick={() => setIsYearly(true)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isYearly
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg'
                                        : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                {catalog.yearlyLabel}
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                                    {catalog.yearlyDiscountLabel}
                                </span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 relative">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {resolvedPlans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative group ${plan.popular ? 'md:-mt-8 md:mb-8' : ''}`}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                                        <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-xl">
                                            <span className="text-white text-sm font-bold flex items-center gap-2">
                                                <Star size={14} className="fill-white" />
                                                En Popüler
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className={`h-full p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${plan.popular
                                        ? 'bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border-purple-200 dark:border-purple-500/30 shadow-2xl shadow-purple-500/10'
                                        : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 hover:border-green-200 dark:hover:border-green-500/30 hover:shadow-xl'
                                    }`}>
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                                                <plan.icon size={24} className="text-white" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.desc}</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-2">
                                            {typeof plan.price.monthly === 'number' ? (
                                                <>
                                                    <span className="text-5xl font-black text-slate-900 dark:text-white">
                                                        ₺{formatPrice(isYearly ? plan.price.yearly : plan.price.monthly)}
                                                    </span>
                                                    <span className="text-slate-500 dark:text-slate-400 font-medium">/ay</span>
                                                </>
                                            ) : (
                                                <span className="text-4xl font-black text-slate-900 dark:text-white">
                                                    {plan.price.monthly}
                                                </span>
                                            )}
                                        </div>
                                        {isYearly && typeof plan.price.monthly === 'number' && typeof plan.price.yearly === 'number' && (
                                            <p className="text-sm text-green-600 dark:text-green-400 font-bold mt-2">
                                                Yıllık ödemede ₺{formatPrice((plan.price.monthly - plan.price.yearly) * 12)} tasarruf
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <Link
                                        href={plan.ctaLink}
                                        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all mb-8 ${plan.popular
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02]'
                                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-xl hover:scale-[1.02]'
                                            }`}
                                    >
                                        {plan.cta}
                                        <ArrowRight size={18} />
                                    </Link>

                                    {/* Features */}
                                    <div className="space-y-4">
                                        {plan.features.map((feature, j) => (
                                            <div
                                                key={j}
                                                className={`flex items-center gap-3 ${feature.highlight ? 'font-bold' : ''
                                                    }`}
                                            >
                                                {feature.included ? (
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${feature.highlight
                                                            ? `bg-gradient-to-br ${plan.color}`
                                                            : 'bg-green-100 dark:bg-green-500/20'
                                                        }`}>
                                                        <Check size={14} className={feature.highlight ? 'text-white' : 'text-green-600 dark:text-green-400'} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                                        <X size={14} className="text-slate-400" />
                                                    </div>
                                                )}
                                                <span className={`text-sm ${feature.included
                                                        ? 'text-slate-700 dark:text-slate-300'
                                                        : 'text-slate-400 dark:text-slate-500'
                                                    }`}>
                                                    {feature.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Guarantees */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-6 mt-12"
                    >
                        {PRICING_DATA.guarantees.map((g, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <g.icon size={18} className="text-green-600 dark:text-green-400" />
                                <span className="font-medium">{g.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Add-ons Section */}
            <section className="py-20 bg-slate-50 dark:bg-white/[0.02]">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                            Ek Özellikler
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            İhtiyacınıza göre planınızı genişletin
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PRICING_DATA.addons.map((addon, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-green-200 dark:hover:border-green-500/30 hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                                    <addon.icon size={20} className="text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{addon.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{addon.desc}</p>
                                <p className="text-lg font-black text-green-600 dark:text-green-400">{addon.price}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-20">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                            Detaylı Karşılaştırma
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className="grid grid-cols-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                            <div className="p-6 font-bold text-slate-500 dark:text-slate-400">Özellik</div>
                            <div className="p-6 text-center font-bold text-slate-900 dark:text-white">Başlangıç</div>
                            <div className="p-6 text-center font-bold text-purple-600 bg-purple-50 dark:bg-purple-500/10">Profesyonel</div>
                            <div className="p-6 text-center font-bold text-slate-900 dark:text-white">Kurumsal</div>
                        </div>

                        {/* Rows */}
                        {PRICING_DATA.comparison.map((row, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-4 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="p-4 font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                    {row.feature}
                                </div>
                                {['starter', 'professional', 'enterprise'].map((plan, j) => {
                                    const value = row[plan as keyof typeof row];
                                    return (
                                        <div
                                            key={j}
                                            className={`p-4 text-center flex items-center justify-center ${plan === 'professional' ? 'bg-purple-50/50 dark:bg-purple-500/5' : ''
                                                }`}
                                        >
                                            {typeof value === 'boolean' ? (
                                                value ? (
                                                    <Check size={20} className="text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <X size={20} className="text-slate-300 dark:text-slate-600" />
                                                )
                                            ) : (
                                                <span className={`font-bold ${plan === 'professional' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {value}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-50 dark:bg-white/[0.02]">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                            Sıkça Sorulan Sorular
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {PRICING_DATA.faqs.map((faq, i) => (
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
                                        <div className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>
                                            <span className="text-xl text-slate-400">+</span>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
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
                                <Phone size={16} className="text-white" />
                                <span className="text-sm font-bold text-white/90">Yardıma mı ihtiyacınız var?</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
                                Doğru planı seçmenize<br />yardımcı olalım
                            </h2>

                            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
                                Uzman ekibimiz ihtiyaçlarınızı dinleyip size en uygun çözümü öneriyor.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/contact" className="group px-10 py-5 bg-white text-green-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
                                    <span className="flex items-center gap-2">
                                        Ücretsiz Danışmanlık
                                        <MessageSquare size={20} />
                                    </span>
                                </Link>
                                <a href="tel:+908501234567" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-2">
                                    <Phone size={20} />
                                    0850 123 45 67
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
