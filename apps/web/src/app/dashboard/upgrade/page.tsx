"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Check, X, Sparkles, Crown, Zap, ArrowRight,
    Bot, TrendingUp, BarChart3, Users, Package, Globe,
    Headphones, Gift, ChevronDown, ChevronUp,
    LineChart, Boxes, Tags, Megaphone, FileText
} from 'lucide-react';
import Link from 'next/link';
import { useModules } from '@/lib/modules';

interface PricingPlan {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    icon: React.ElementType;
    color: string;
    bgGradient: string;
    popular?: boolean;
    features: {
        category: string;
        items: { name: string; included: boolean | string }[];
    }[];
    modules: string[];
    limits: {
        products: number | 'unlimited';
        stores: number | 'unlimited';
        users: number | 'unlimited';
        orders: number | 'unlimited';
    };
}

const PRICING_PLANS: PricingPlan[] = [
    {
        id: 'FREE',
        name: 'Ücretsiz',
        description: 'Yeni başlayanlar için ideal başlangıç planı',
        monthlyPrice: 0,
        yearlyPrice: 0,
        icon: Zap,
        color: 'slate',
        bgGradient: 'from-slate-500 to-slate-600',
        features: [
            {
                category: 'Temel Özellikler',
                items: [
                    { name: 'Dashboard & Raporlama', included: true },
                    { name: 'Sipariş Yönetimi', included: true },
                    { name: 'Ürün Kataloğu', included: '100 ürün' },
                    { name: 'Stok Takibi', included: true },
                    { name: 'Müşteri Yönetimi', included: true },
                ]
            },
            {
                category: 'Pazaryeri',
                items: [
                    { name: 'Pazaryeri Entegrasyonu', included: '1 mağaza' },
                    { name: 'Otomatik Senkronizasyon', included: false },
                    { name: 'Toplu İşlemler', included: false },
                ]
            },
            {
                category: 'AI & Analitik',
                items: [
                    { name: 'AI Danışman', included: false },
                    { name: 'Rakip Analizi', included: false },
                    { name: 'Satış Tahminleri', included: false },
                ]
            },
            {
                category: 'Destek',
                items: [
                    { name: 'Email Desteği', included: true },
                    { name: 'Öncelikli Destek', included: false },
                    { name: 'Özel Hesap Yöneticisi', included: false },
                ]
            },
        ],
        modules: ['DASHBOARD', 'ORDERS', 'PRODUCTS', 'INVENTORY', 'CUSTOMERS', 'SETTINGS'],
        limits: { products: 100, stores: 1, users: 2, orders: 500 }
    },
    {
        id: 'PRO',
        name: 'Pro',
        description: 'Büyüyen işletmeler için güçlü özellikler',
        monthlyPrice: 499,
        yearlyPrice: 399,
        icon: Sparkles,
        color: 'blue',
        bgGradient: 'from-blue-500 to-cyan-500',
        popular: true,
        features: [
            {
                category: 'Temel Özellikler',
                items: [
                    { name: 'Dashboard & Raporlama', included: true },
                    { name: 'Sipariş Yönetimi', included: true },
                    { name: 'Ürün Kataloğu', included: '5.000 ürün' },
                    { name: 'Stok Takibi', included: true },
                    { name: 'Müşteri Yönetimi', included: true },
                ]
            },
            {
                category: 'Pazaryeri',
                items: [
                    { name: 'Pazaryeri Entegrasyonu', included: '5 mağaza' },
                    { name: 'Otomatik Senkronizasyon', included: true },
                    { name: 'Toplu İşlemler', included: true },
                ]
            },
            {
                category: 'AI & Analitik',
                items: [
                    { name: 'AI Danışman', included: true },
                    { name: 'Rakip Analizi', included: true },
                    { name: 'Satış Tahminleri', included: true },
                ]
            },
            {
                category: 'Destek',
                items: [
                    { name: 'Email Desteği', included: true },
                    { name: 'Öncelikli Destek', included: true },
                    { name: 'Özel Hesap Yöneticisi', included: false },
                ]
            },
        ],
        modules: [
            'DASHBOARD', 'ORDERS', 'PRODUCTS', 'INVENTORY', 'CUSTOMERS', 'SETTINGS',
            'AI_ADVISOR', 'AI_SEO', 'COMPETITOR_ANALYSIS', 'PREDICTIONS',
            'STORE_MANAGEMENT', 'INTEGRATIONS', 'BULK_ACTIONS', 'PRICING_ENGINE',
            'CAMPAIGNS', 'REVIEWS'
        ],
        limits: { products: 5000, stores: 5, users: 10, orders: 'unlimited' }
    },
    {
        id: 'ENTERPRISE',
        name: 'Kurumsal',
        description: 'Büyük ölçekli işletmeler için özel çözümler',
        monthlyPrice: 1499,
        yearlyPrice: 1199,
        icon: Crown,
        color: 'purple',
        bgGradient: 'from-purple-500 to-pink-500',
        features: [
            {
                category: 'Temel Özellikler',
                items: [
                    { name: 'Dashboard & Raporlama', included: true },
                    { name: 'Sipariş Yönetimi', included: true },
                    { name: 'Ürün Kataloğu', included: 'Sınırsız' },
                    { name: 'Stok Takibi', included: true },
                    { name: 'Müşteri Yönetimi', included: true },
                ]
            },
            {
                category: 'Pazaryeri',
                items: [
                    { name: 'Pazaryeri Entegrasyonu', included: 'Sınırsız' },
                    { name: 'Otomatik Senkronizasyon', included: true },
                    { name: 'Toplu İşlemler', included: true },
                ]
            },
            {
                category: 'AI & Analitik',
                items: [
                    { name: 'AI Danışman', included: true },
                    { name: 'Rakip Analizi', included: true },
                    { name: 'Satış Tahminleri', included: true },
                ]
            },
            {
                category: 'Destek',
                items: [
                    { name: 'Email Desteği', included: true },
                    { name: 'Öncelikli Destek', included: true },
                    { name: 'Özel Hesap Yöneticisi', included: true },
                ]
            },
        ],
        modules: [
            'DASHBOARD', 'ORDERS', 'PRODUCTS', 'INVENTORY', 'CUSTOMERS', 'SETTINGS',
            'AI_ADVISOR', 'AI_SEO', 'AI_IMAGE', 'COMPETITOR_ANALYSIS', 'PREDICTIONS',
            'STORE_MANAGEMENT', 'INTEGRATIONS', 'BULK_ACTIONS', 'PRICING_ENGINE',
            'FINANCIAL_REPORTS', 'CAMPAIGNS', 'REVIEWS', 'SHIPPING', 'LOGISTICS', 'API_ACCESS'
        ],
        limits: { products: 'unlimited', stores: 'unlimited', users: 'unlimited', orders: 'unlimited' }
    },
];

const FAQ_ITEMS = [
    {
        question: 'Planımı ne zaman değiştirebilirim?',
        answer: 'Planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. Yükseltme anında geçerli olur, düşürme ise mevcut dönem sonunda.'
    },
    {
        question: 'Yıllık ödeme avantajı nedir?',
        answer: 'Yıllık ödeme seçeneği ile aylık fiyata göre 2 ay ücretsiz kullanım hakkı kazanırsınız. Bu %17 tasarruf anlamına gelir.'
    },
    {
        question: 'Ücretsiz deneme süresi var mı?',
        answer: 'Evet! Pro ve Kurumsal planları 14 gün boyunca ücretsiz deneyebilirsiniz. Kredi kartı gerekmez.'
    },
    {
        question: 'İptal etmek istersem ne olur?',
        answer: 'İstediğiniz zaman iptal edebilirsiniz. Verileriniz 30 gün boyunca saklanır ve bu süre içinde tekrar aktif edebilirsiniz.'
    },
];

export default function UpgradePage() {
    const { tenantPlan } = useModules();
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const currentPlanIndex = PRICING_PLANS.findIndex(p => p.id === tenantPlan);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
                >
                    <Sparkles size={16} className="text-primary" />
                    <span className="text-sm font-bold text-primary">Mevcut Plan: {tenantPlan}</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-4"
                >
                    İşletmenizi <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Büyütün</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-slate-500 dark:text-slate-400"
                >
                    İhtiyacınıza uygun planı seçin. Dilediğiniz zaman yükseltin veya düşürün.
                </motion.p>
            </div>

            {/* Billing Toggle */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center items-center gap-4"
            >
                <span className={`text-sm font-bold ${billingPeriod === 'monthly' ? 'text-foreground' : 'text-slate-500'}`}>
                    Aylık
                </span>
                <button
                    onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                    className={`relative w-16 h-8 rounded-full transition-colors ${
                        billingPeriod === 'yearly' ? 'bg-primary' : 'bg-slate-600'
                    }`}
                >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        billingPeriod === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                    }`} />
                </button>
                <span className={`text-sm font-bold ${billingPeriod === 'yearly' ? 'text-foreground' : 'text-slate-500'}`}>
                    Yıllık
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs font-bold rounded-full">
                    2 Ay Ücretsiz
                </span>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {PRICING_PLANS.map((plan, idx) => {
                    const isCurrentPlan = plan.id === tenantPlan;
                    const isUpgrade = idx > currentPlanIndex;
                    const price = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            className={`relative bg-surface border rounded-3xl overflow-hidden transition-all hover:shadow-2xl ${
                                plan.popular 
                                    ? 'border-primary shadow-xl shadow-primary/10 lg:scale-105 z-10' 
                                    : 'border-border hover:border-primary/30'
                            }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-black rounded-bl-xl">
                                    En Popüler
                                </div>
                            )}

                            {/* Current Plan Badge */}
                            {isCurrentPlan && (
                                <div className="absolute top-0 left-0 px-4 py-1 bg-green-500 text-white text-xs font-black rounded-br-xl">
                                    Mevcut Plan
                                </div>
                            )}

                            {/* Header */}
                            <div className="p-8 text-center border-b border-border">
                                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.bgGradient} flex items-center justify-center mb-4`}>
                                    <plan.icon size={32} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-2">{plan.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{plan.description}</p>
                                
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-black text-foreground">
                                        {price === 0 ? 'Ücretsiz' : `₺${price}`}
                                    </span>
                                    {price > 0 && (
                                        <span className="text-slate-500">/ay</span>
                                    )}
                                </div>
                                {billingPeriod === 'yearly' && price > 0 && (
                                    <p className="text-xs text-slate-500 mt-2">
                                        Yıllık ₺{price * 12} fatura edilir
                                    </p>
                                )}
                            </div>

                            {/* Limits */}
                            <div className="p-6 border-b border-border grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-background rounded-xl">
                                    <Package size={16} className="mx-auto mb-1 text-primary" />
                                    <div className="text-sm font-bold text-foreground">
                                        {plan.limits.products === 'unlimited' ? '∞' : plan.limits.products.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-slate-500">Ürün</div>
                                </div>
                                <div className="text-center p-3 bg-background rounded-xl">
                                    <Globe size={16} className="mx-auto mb-1 text-primary" />
                                    <div className="text-sm font-bold text-foreground">
                                        {plan.limits.stores === 'unlimited' ? '∞' : plan.limits.stores}
                                    </div>
                                    <div className="text-[10px] text-slate-500">Mağaza</div>
                                </div>
                                <div className="text-center p-3 bg-background rounded-xl">
                                    <Users size={16} className="mx-auto mb-1 text-primary" />
                                    <div className="text-sm font-bold text-foreground">
                                        {plan.limits.users === 'unlimited' ? '∞' : plan.limits.users}
                                    </div>
                                    <div className="text-[10px] text-slate-500">Kullanıcı</div>
                                </div>
                                <div className="text-center p-3 bg-background rounded-xl">
                                    <BarChart3 size={16} className="mx-auto mb-1 text-primary" />
                                    <div className="text-sm font-bold text-foreground">
                                        {plan.limits.orders === 'unlimited' ? '∞' : plan.limits.orders.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-slate-500">Sipariş/ay</div>
                                </div>
                            </div>

                            {/* Features Preview */}
                            <div className="p-6 space-y-4">
                                {plan.features.slice(0, 2).map((category, catIdx) => (
                                    <div key={catIdx}>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            {category.category}
                                        </h4>
                                        <div className="space-y-2">
                                            {category.items.slice(0, 3).map((item, itemIdx) => (
                                                <div key={itemIdx} className="flex items-center gap-2">
                                                    {item.included ? (
                                                        <Check size={14} className="text-green-500 flex-shrink-0" />
                                                    ) : (
                                                        <X size={14} className="text-slate-600 flex-shrink-0" />
                                                    )}
                                                    <span className={`text-sm ${item.included ? 'text-foreground' : 'text-slate-500 line-through'}`}>
                                                        {item.name}
                                                        {typeof item.included === 'string' && (
                                                            <span className="text-primary font-medium ml-1">({item.included})</span>
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Expand Button */}
                                <button
                                    onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-primary hover:underline"
                                >
                                    {expandedPlan === plan.id ? (
                                        <>Daha Az <ChevronUp size={14} /></>
                                    ) : (
                                        <>Tüm Özellikler <ChevronDown size={14} /></>
                                    )}
                                </button>

                                {/* Expanded Features */}
                                {expandedPlan === plan.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pt-4 border-t border-border"
                                    >
                                        {plan.features.slice(2).map((category, catIdx) => (
                                            <div key={catIdx}>
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                    {category.category}
                                                </h4>
                                                <div className="space-y-2">
                                                    {category.items.map((item, itemIdx) => (
                                                        <div key={itemIdx} className="flex items-center gap-2">
                                                            {item.included ? (
                                                                <Check size={14} className="text-green-500 flex-shrink-0" />
                                                            ) : (
                                                                <X size={14} className="text-slate-600 flex-shrink-0" />
                                                            )}
                                                            <span className={`text-sm ${item.included ? 'text-foreground' : 'text-slate-500 line-through'}`}>
                                                                {item.name}
                                                                {typeof item.included === 'string' && (
                                                                    <span className="text-primary font-medium ml-1">({item.included})</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="p-6 pt-0">
                                {isCurrentPlan ? (
                                    <button 
                                        disabled
                                        className="w-full py-3 bg-green-500/20 text-green-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> Mevcut Planınız
                                    </button>
                                ) : isUpgrade ? (
                                    <button className={`w-full py-3 bg-gradient-to-r ${plan.bgGradient} text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg`}>
                                        Yükselt <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button className="w-full py-3 border border-border text-foreground rounded-xl font-bold text-sm hover:bg-surface transition-colors">
                                        Düşür
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Module Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="max-w-4xl mx-auto"
            >
                <h2 className="text-2xl font-black text-foreground text-center mb-8">Modül Karşılaştırması</h2>
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-background border-b border-border">
                        <div className="font-bold text-foreground">Modül</div>
                        {PRICING_PLANS.map(plan => (
                            <div key={plan.id} className="text-center font-bold text-foreground">{plan.name}</div>
                        ))}
                    </div>
                    {[
                        { name: 'AI Danışman', key: 'AI_ADVISOR', icon: Bot },
                        { name: 'Rakip Analizi', key: 'COMPETITOR_ANALYSIS', icon: TrendingUp },
                        { name: 'Satış Tahminleri', key: 'PREDICTIONS', icon: LineChart },
                        { name: 'Toplu İşlemler', key: 'BULK_ACTIONS', icon: Boxes },
                        { name: 'Fiyat Motoru', key: 'PRICING_ENGINE', icon: Tags },
                        { name: 'Kampanya Yönetimi', key: 'CAMPAIGNS', icon: Megaphone },
                        { name: 'Finansal Raporlar', key: 'FINANCIAL_REPORTS', icon: FileText },
                    ].map((mod, idx) => (
                        <div key={mod.key} className={`grid grid-cols-4 gap-4 p-4 ${idx % 2 === 0 ? 'bg-surface' : 'bg-background'}`}>
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <mod.icon size={16} className="text-primary" />
                                {mod.name}
                            </div>
                            {PRICING_PLANS.map(plan => (
                                <div key={plan.id} className="text-center">
                                    {plan.modules.includes(mod.key) ? (
                                        <Check size={18} className="mx-auto text-green-500" />
                                    ) : (
                                        <X size={18} className="mx-auto text-slate-600" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="max-w-2xl mx-auto"
            >
                <h2 className="text-2xl font-black text-foreground text-center mb-8">Sık Sorulan Sorular</h2>
                <div className="space-y-3">
                    {FAQ_ITEMS.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-surface border border-border rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <span className="font-bold text-foreground">{item.question}</span>
                                {expandedFaq === idx ? (
                                    <ChevronUp size={18} className="text-primary" />
                                ) : (
                                    <ChevronDown size={18} className="text-slate-500" />
                                )}
                            </button>
                            {expandedFaq === idx && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="px-4 pb-4"
                                >
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.answer}</p>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Contact CTA */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="max-w-2xl mx-auto text-center bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-3xl p-8"
            >
                <Gift size={40} className="mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-black text-foreground mb-2">Özel Teklif Almak İster misiniz?</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Büyük ölçekli ihtiyaçlarınız için size özel bir plan hazırlayalım.
                </p>
                <Link
                    href="/dashboard/support"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                    <Headphones size={18} /> Satış Ekibiyle Görüşün
                </Link>
            </motion.div>
        </div>
    );
}
