"use client";

import React from 'react';
import MarketingPageShell from '@/components/landing/MarketingPageShell';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, ArrowRight, Download, Clock, FileText, BarChart3,
    TrendingUp, ShoppingCart, Globe, Users, Sparkles, Target,
    CheckCircle2, Star, BookOpen, PieChart, Zap, Package
} from 'lucide-react';

const reportData = {
    title: '2026 Türkiye E-ticaret Raporu',
    subtitle: 'Pazaryeri Trendleri, Büyüme Fırsatları ve Stratejik Öngörüler',
    description: 'Türkiye e-ticaret ekosisteminin kapsamlı analizi. Pazaryeri bazında satış verileri, tüketici davranışları, sektörel büyüme trendleri ve 2026 stratejik öngörüleri.',
    pages: 156,
    readTime: '45 dk',
    downloads: 8350,
    rating: 4.9,
    publishDate: 'Ocak 2026',
    authors: ['Pazaryonetimi Araştırma Ekibi', 'E-ticaret Akademi'],

    highlights: [
        { icon: TrendingUp, value: '₺1.2T', label: 'Türkiye E-ticaret Hacmi', description: '2025 yılına göre %28 büyüme' },
        { icon: Globe, value: '15+', label: 'Pazaryeri Analizi', description: 'Trendyol, Hepsiburada, Amazon TR ve daha fazlası' },
        { icon: Users, value: '65M+', label: 'Online Alışveriş Yapan', description: 'Türkiye nüfusunun %75\'i' },
        { icon: ShoppingCart, value: '%34', label: 'Mobil Ticaret Payı', description: 'Toplam e-ticarette mobil oranı' },
    ],

    chapters: [
        { number: '01', title: 'Türkiye E-ticaret Ekosistemi', desc: 'Pazar büyüklüğü, büyüme oranları ve makroekonomik etkilerin analizi', icon: BarChart3 },
        { number: '02', title: 'Pazaryeri Karşılaştırması', desc: 'Trendyol, Hepsiburada, Amazon TR, N11, Çiçeksepeti derinlemesine analiz', icon: PieChart },
        { number: '03', title: 'Tüketici Davranışları', desc: 'Alışveriş alışkanlıkları, ödeme tercihleri ve demografik veriler', icon: Users },
        { number: '04', title: 'Sektörel Trendler', desc: 'Moda, elektronik, gıda, kozmetik ve diğer kategorilerin performansı', icon: Target },
        { number: '05', title: 'AI ve Otomasyon', desc: 'Yapay zeka destekli fiyatlandırma, stok ve müşteri yönetimi trendleri', icon: Sparkles },
        { number: '06', title: 'Cross-border E-ticaret', desc: 'Uluslararası satış fırsatları ve lojistik çözümler', icon: Globe },
        { number: '07', title: 'Düzenleyici Çerçeve', desc: 'E-ticaret mevzuatı, vergi düzenlemeleri ve uyumluluk gereksinimleri', icon: FileText },
        { number: '08', title: '2026 Stratejik Öngörüler', desc: 'Uzman tahminleri, fırsat alanları ve risk analizi', icon: Zap },
    ],

    keyFindings: [
        'Türkiye e-ticaret pazarı 2026\'da ₺1.5T\'ye ulaşması bekleniyor',
        'Trendyol pazar lideri konumunu sürdürürken Amazon TR en hızlı büyüyen platform',
        'Mobil ticaret payı %40\'a yaklaşıyor, uygulama bazlı alışveriş %55 artış gösterdi',
        'AI destekli fiyatlandırma kullanan satıcılar %35 daha yüksek kâr marjı elde ediyor',
        'Sosyal ticaret (TikTok Shop, Instagram Shops) %200+ büyüme ile yeni kanal olarak yükseliyor',
        'Sürdürülebilir ürün aramaları %180 artış gösterdi, yeşil e-ticaret trendi güçleniyor',
        'Ses ile alışveriş Türkiye\'de henüz %2 penetrasyonda, ancak 2027\'de %10\'a çıkması bekleniyor',
        'B2B e-ticaret hacminde %45 büyüme ile kurumsal dijitalleşme hız kazanıyor',
    ],
};

export default function ECommerceReport2026() {
    return (
        <MarketingPageShell as="main" padded={false} className="pb-20">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-pink-500/5 dark:from-orange-500/10 dark:via-red-500/10 dark:to-pink-500/10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-3xl -translate-y-1/2" />

                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-8">
                        <ArrowLeft size={14} />
                        Kaynaklar
                    </Link>

                    <div className="max-w-4xl">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full">Yeni Rapor</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{reportData.publishDate}</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                                {reportData.title}
                            </h1>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">{reportData.subtitle}</p>
                            <p className="mt-4 text-slate-500 dark:text-slate-500 max-w-2xl leading-relaxed">{reportData.description}</p>
                        </motion.div>

                        {/* Meta Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.5 }}
                            className="flex flex-wrap items-center gap-6 mt-8 text-sm text-slate-500 dark:text-slate-400"
                        >
                            <span className="flex items-center gap-1.5"><FileText size={14} /> {reportData.pages} sayfa</span>
                            <span className="flex items-center gap-1.5"><Clock size={14} /> {reportData.readTime} okuma</span>
                            <span className="flex items-center gap-1.5"><Download size={14} /> {reportData.downloads.toLocaleString('tr-TR')} indirme</span>
                            <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {reportData.rating}</span>
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                            className="flex flex-wrap gap-4 mt-10"
                        >
                            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                <Download size={18} />
                                Ücretsiz İndir (PDF)
                            </button>
                            <Link
                                href="/demo"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                            >
                                Demo Talep Et
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Key Highlights ── */}
            <section className="py-16 border-t border-slate-100 dark:border-white/[0.06]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {reportData.highlights.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] shadow-sm"
                            >
                                <item.icon size={24} className="text-orange-600 dark:text-orange-400 mb-3" />
                                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{item.value}</div>
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{item.label}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.description}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Chapters ── */}
            <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Rapor İçeriği</h2>
                        <p className="mt-4 text-slate-600 dark:text-slate-400">8 bölümde derinlemesine analiz</p>
                    </div>

                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reportData.chapters.map((chapter, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06, duration: 0.3 }}
                                className="group flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06] hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/30 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-500/10 dark:to-red-500/10 flex items-center justify-center shrink-0">
                                    <chapter.icon size={20} className="text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Bölüm {chapter.number}</span>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mt-1">{chapter.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{chapter.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Key Findings ── */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Öne Çıkan Bulgular</h2>
                            <p className="mt-4 text-slate-600 dark:text-slate-400">Rapordan seçme veriler ve iç görüler</p>
                        </div>

                        <div className="space-y-3">
                            {reportData.keyFindings.map((finding, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.3 }}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/[0.06]"
                                >
                                    <CheckCircle2 size={18} className="text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{finding}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Download CTA ── */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 p-10 md:p-16 text-center">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==')] opacity-50" />
                        <div className="relative">
                            <BookOpen size={48} className="text-white/80 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Raporu Hemen İndirin</h2>
                            <p className="text-white/80 max-w-xl mx-auto mb-8">156 sayfalık kapsamlı rapor, uzman analizleri ve 2026 öngörülerini ücretsiz keşfedin.</p>
                            <button className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-slate-900 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                <Download size={18} />
                                Ücretsiz İndir (PDF, 45 MB)
                            </button>
                            <p className="text-white/50 text-xs mt-4">E-posta ile kayıt gerektirir</p>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingPageShell>
    );
}
