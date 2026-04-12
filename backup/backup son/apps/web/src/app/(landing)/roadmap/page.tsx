"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Check, Clock, Target, TrendingUp } from 'lucide-react';

type QuarterType = 'Q1-2026' | 'Q2-2026' | 'Q3-2026' | 'Q4-2026';
type FeatureStatus = 'completed' | 'in-progress' | 'planned' | 'considering';

interface RoadmapFeature {
    id: string;
    title: string;
    description: string;
    quarter: QuarterType;
    status: FeatureStatus;
    category: string;
    votes?: number;
    impact: 'high' | 'medium' | 'low';
}

const features: RoadmapFeature[] = [
    // Completed
    { id: 'ai-seo', title: 'Gemini Pro SEO Motoru', description: 'AI ile ürün açıklamalarını otomatik optimize etme', quarter: 'Q1-2026', status: 'completed', category: 'AI', impact: 'high', votes: 342 },
    { id: 'bulk-optimization', title: 'Toplu Optimizasyon', description: 'Binlerce ürünü tek tıkla optimize et', quarter: 'Q1-2026', status: 'completed', category: 'Ürünler', impact: 'high', votes: 289 },

    // In Progress
    { id: 'advanced-analytics', title: 'İleri Analytics Dashboard', description: 'Real-time satış, trend ve performans analizi', quarter: 'Q1-2026', status: 'in-progress', category: 'Analitik', impact: 'high', votes: 451 },
    { id: 'ai-customer-segmentation', title: 'AI Müşteri Segmentasyonu', description: 'Otomatik müşteri profillemesi ve analizi', quarter: 'Q1-2026', status: 'in-progress', category: 'AI', impact: 'high', votes: 278 },
    { id: 'mobile-app', title: 'Mobil Uygulama (iOS/Android)', description: 'Native iOS ve Android uygulamaları', quarter: 'Q2-2026', status: 'in-progress', category: 'Platform', impact: 'high', votes: 523 },

    // Planned Q2
    { id: 'workflow-automation', title: 'Workflow Otomasyonu', description: 'Özel iş akışları ve otomasyonlar oluşturun', quarter: 'Q2-2026', status: 'planned', category: 'Otomasyon', impact: 'high', votes: 412 },
    { id: 'custom-reports', title: 'Özel Raporlar Builder', description: 'Raporları kodu yazmadan oluşturun', quarter: 'Q2-2026', status: 'planned', category: 'Analitik', impact: 'medium', votes: 267 },
    { id: 'team-collaboration', title: 'Takım İşbirliği Araçları', description: 'Yorumlar, atamalar, @mentions', quarter: 'Q2-2026', status: 'planned', category: 'İşbirliği', impact: 'medium', votes: 334 },

    // Planned Q3
    { id: 'predictive-pricing', title: 'Tahminleyici Fiyatlandırma', description: 'ML ile optimal fiyat önerileri', quarter: 'Q3-2026', status: 'planned', category: 'AI', impact: 'high', votes: 389 },
    { id: 'supply-chain', title: 'Tedarik Zinciri Yönetimi', description: 'Tedarikçi ve envanter yönetimi', quarter: 'Q3-2026', status: 'planned', category: 'Lojistik', impact: 'high', votes: 312 },
    { id: 'webhooks-api', title: 'Webhooks & Advanced API', description: 'Custom integrasyonlar için API', quarter: 'Q3-2026', status: 'planned', category: 'Geliştirici', impact: 'medium', votes: 245 },

    // Planned Q4
    { id: 'marketplace-seller-app', title: 'Pazaryeri Satıcı Uygulaması', description: 'Trendyol/Hepsiburada seller uygulaması', quarter: 'Q4-2026', status: 'planned', category: 'Platform', impact: 'high', votes: 456 },
    { id: 'multi-warehouse', title: 'Gelişmiş Çoklu Depo', description: 'Stok transfer ve dağıtım optimizasyonu', quarter: 'Q4-2026', status: 'planned', category: 'Lojistik', impact: 'medium', votes: 298 },
    { id: 'ai-content-generation', title: 'AI İçerik Oluşturucu', description: 'Ürün açıklaması, pazarlama metinleri vb.', quarter: 'Q4-2026', status: 'planned', category: 'AI', impact: 'high', votes: 534 },

    // Considering
    { id: 'blockchain-supply', title: 'Blockchain Tedarik Takibi', description: 'İçerik orijinalliği blockchain doğrulaması', quarter: 'Q1-2026', status: 'considering', category: 'Blockchain', impact: 'low', votes: 89 },
    { id: 'ar-product-preview', title: 'AR Ürün Önizleme', description: '3D AR ile ürünleri göster', quarter: 'Q1-2026', status: 'considering', category: 'Teknoloji', impact: 'medium', votes: 178 },
];

const quarters: QuarterType[] = ['Q1-2026', 'Q2-2026', 'Q3-2026', 'Q4-2026'];

const statusConfig = {
    completed: { icon: Check, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Tamamlandı' },
    'in-progress': { icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Geliştirmede' },
    planned: { icon: Target, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Planlanmış' },
    considering: { icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Düşünülüyor' },
};

export default function RoadmapPage() {
    const [selectedQuarter, setSelectedQuarter] = useState<QuarterType | 'all'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = Array.from(new Set(features.map(f => f.category)));
    const filteredFeatures = features.filter(f => {
        const matchQuarter = selectedQuarter === 'all' || f.quarter === selectedQuarter;
        const matchCategory = selectedCategory === 'all' || f.category === selectedCategory;
        return matchQuarter && matchCategory;
    });

    const groupedByQuarter = quarters.reduce((acc, q) => {
        acc[q] = filteredFeatures.filter(f => f.quarter === q);
        return acc;
    }, {} as Record<QuarterType, RoadmapFeature[]>);

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-5xl">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100/50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full mb-6">
                        <Rocket size={14} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tracking-wide uppercase">Roadmap</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                        2026 Yol Haritası
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Pazaryonetimi&apos;nin geleceğini şekillendirin. Hangi özellikleri en çok istediğinizi oylamaya açık.
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 mb-12 flex-wrap justify-center">
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button onClick={() => setSelectedQuarter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedQuarter === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                            Tümü
                        </button>
                        {quarters.map(q => (
                            <button key={q} onClick={() => setSelectedQuarter(q)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedQuarter === q ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                                {q}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                            Kategoriler
                        </button>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Roadmap */}
                <div className="space-y-12">
                    {quarters.map((quarter, qIdx) => {
                        const quarterFeatures = groupedByQuarter[quarter];
                        if (quarterFeatures.length === 0 && selectedQuarter !== 'all') return null;

                        return (
                            <motion.div key={quarter} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: qIdx * 0.1 }}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-1 bg-gradient-to-b from-indigo-600 to-indigo-400 rounded-full" />
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{quarter}</h2>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">({quarterFeatures.length} özellik)</span>
                                </div>

                                <div className="space-y-3">
                                    {quarterFeatures.map((feature, idx) => {
                                        const config = statusConfig[feature.status];
                                        const Icon = config.icon;
                                        return (
                                            <motion.div key={feature.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="group p-5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all hover:shadow-lg">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                                                                <Icon size={16} className={config.color} />
                                                            </div>
                                                            <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 ml-11">{feature.description}</p>
                                                    </div>
                                                    {feature.votes && (
                                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors">
                                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{feature.votes}</span>
                                                            <span className="text-xs text-slate-500">👍</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Voting CTA */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Sonraki Özellik Ne Olmalı?</h3>
                    <p className="text-indigo-100 mb-6">Özelikleri oylamaya açık. Sizin desteğiniz geliştirme önceliğini belirliyor.</p>
                    <button className="px-8 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                        Devamını Gör
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
