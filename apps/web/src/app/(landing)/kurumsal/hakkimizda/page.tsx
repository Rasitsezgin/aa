"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Building2, Users, Globe, Target, Rocket, Award,
    Sparkles, ArrowRight, Zap, Shield, TrendingUp, History
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const stats = [
    { value: '500+', label: 'Mutlu Müşteri', icon: Users },
    { value: '₺100M+', label: 'Yıllık İşlem Hacmi', icon: TrendingUp },
    { value: '7+', label: 'Pazaryeri Entegrasyonu', icon: Globe },
    { value: '%99.9', label: 'Uptime', icon: Zap },
];

const timeline = [
    { year: '2023', title: 'Başlangıç', description: 'Kütüphanede bir fikir olarak doğdu. İlk MVP 3 ayda yazıldı.' },
    { year: '2024 Q1', title: 'İlk 100 Müşteri', description: 'Sadece kulaktan kulağa yayılarak 100 aktif kullanıcıya ulaştık.' },
    { year: '2024 Q3', title: 'Yapay Zeka Devrimi', description: 'AI modülleri eklendi. Otomatik fiyatlandırma ve stok yönetimi başladı.' },
    { year: '2025', title: 'Global Açılım', description: 'Avrupa pazarına açıldık. Amazon Almanya ve İngiltere entegrasyonları tamamlandı.' },
    { year: '2026', title: 'Bugün', description: 'E-ticaretin işletim sistemi olma yolunda emin adımlarla ilerliyoruz.' },
];

export default function AboutPage() {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

    return (
        <section className="min-h-screen bg-white dark:bg-[#02040a] transition-colors duration-500 overflow-hidden">
            {/* Hero Section */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-white/[0.02] bg-[bottom_1px_center]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-[#02040a]" />

                {/* Animated Background Blobs */}
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />

                <motion.div
                    style={{ opacity, scale }}
                    className="container mx-auto px-6 relative z-10 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full mb-8 backdrop-blur-sm">
                            <Building2 size={14} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 tracking-wide uppercase">Hikayemiz</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                            E-ticaretin <br />
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Geleceğini Kodluyoruz
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            Karmaşık e-ticaret operasyonlarını, yapay zeka destekli basit ve güçlü çözümlere dönüştürüyoruz.
                        </p>
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 10, 0] }}
                    transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <div className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 flex justify-center p-1">
                        <div className="w-1 h-3 bg-blue-600 rounded-full" />
                    </div>
                </motion.div>
            </div>

            {/* Mission & Vision */}
            <div className="container mx-auto px-6 py-24 relative z-10">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">Misyonumuz</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                            Amacımız, her ölçekten e-ticaret işletmesinin, teknolojik bariyerlere takılmadan global devlerle rekabet edebilmesini sağlamak.
                            Yapay zekayı demokratize ederek, en karmaşık veri analizlerini bile bir tıkla ulaşılabilir kılıyoruz.
                        </p>
                        <div className="space-y-4">
                            {[
                                "Veri Odaklı Kararlar",
                                "Otomasyon ve Verimlilik",
                                "Sürdürülebilir Büyüme"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl rotate-3 blur-lg opacity-30" />
                        <div className="relative bg-slate-900 rounded-2xl p-8 border border-white/10 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                                        <Rocket size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Vizyonumuz</h3>
                                        <p className="text-blue-200 text-sm">2030 Hedefi</p>
                                    </div>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    &quot;Dünyanın en akıllı ve en kullanıcı dostu e-ticaret işletim sistemi olmak.
                                    Sadece bir yazılım değil, işletmelerin büyüme yolculuğundaki en güvenilir yol arkadaşı olmak.&quot;
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Stats */}
            <div className="py-24 bg-slate-50 dark:bg-white/5 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-12 h-12 mx-auto mb-4 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5">
                                    <stat.icon size={24} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="container mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Yolculuğumuz</h2>
                    <p className="text-slate-600 dark:text-slate-400">Küçük bir fikirden global bir platforma</p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10" />

                    <div className="space-y-12">
                        {timeline.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex items-center gap-8 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                            >
                                {/* Content */}
                                <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                    <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-full mb-2">
                                        {item.year}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
                                </div>

                                {/* Dot */}
                                <div className="relative z-10 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-[#02040a] shadow-xl" />

                                {/* Spacer */}
                                <div className="flex-1" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-6 pb-24">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-12 md:p-20 text-center">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Bizimle Geleceği İnşa Edin</h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                            Tutkulu, yenilikçi ve cesur bir ekibin parçası olmak ister misiniz?
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/kurumsal/kariyer"
                                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
                            >
                                Açık Pozisyonlar
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/kurumsal/ekip"
                                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors inline-flex items-center gap-2"
                            >
                                Ekibi Tanı
                                <Users size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
