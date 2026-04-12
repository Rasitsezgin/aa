"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Brain,
    Image as ImageIcon,
    Target,
    Zap,
    ChevronRight,
    ArrowUpRight,
    Send,
    Wand2,
    FileText,
    Layers,
    FlaskConical
} from 'lucide-react';

export default function AiTools() {
    const tools = [
        {
            id: 'image-studio',
            title: 'AI Görsel Stüdyosu',
            description: 'DALL-E 3 ile stüdyo kalitesinde ürün görselleri üretin, arka plan temizleyin ve upscale edin.',
            icon: ImageIcon,
            color: 'blue',
            href: '/dashboard/ai-tools/image-studio',
            badges: ['DALL-E 3', 'HD Generation']
        },
        {
            id: 'content-optimizer',
            title: 'İçerik Editörü',
            description: 'Ürün başlık ve açıklamalarınızı Gemini AI ile optimize edin, SEO skorunuzu saniyeler içinde artırın.',
            icon: Sparkles,
            color: 'purple',
            href: '/dashboard/ai-tools/content-optimizer',
            badges: ['Gemini 1.5 Pro', 'SEO Boost']
        },
        {
            id: 'advisor',
            title: 'AI Danışman',
            description: 'Satış verilerinizi analiz eden ve size özel büyüme stratejileri sunan akıllı sesli asistan.',
            icon: Brain,
            color: 'green',
            href: '/dashboard/ai-advisor',
            badges: ['Voice AI', 'Expert Advice']
        },
        {
            id: 'content-studio',
            title: 'İçerik Stüdyosu',
            description: 'Ürün içeriklerinizi derinlemesine analiz edin, SEO skorlarını görün, AI ile optimize edin ve yeni açıklamalar üretin.',
            icon: FlaskConical,
            color: 'cyan',
            href: '/dashboard/ai-tools/content-studio',
            badges: ['Deep Analysis', 'SEO Health']
        },
        {
            id: 'batch-optimizer',
            title: 'Toplu Optimizasyon',
            description: 'Yüzlerce ürünü tek seferde AI ile optimize edin, skoru düşük ürünleri otomatik iyileştirin ve pazaryerine gönderin.',
            icon: Layers,
            color: 'amber',
            href: '/dashboard/ai-tools/batch-optimizer',
            badges: ['Batch AI', 'Auto Sync']
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/5 p-12 lg:p-20">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px]" />

                <div className="relative z-10 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
                    >
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Pazaryeri Zekası</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-bold text-slate-400">Beta v2.0</span>
                    </motion.div>

                    <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">
                        Yapay Zeka ile <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Pazar Hakimiyeti</span>
                    </h1>
                    <p className="text-lg text-slate-400 font-medium mb-10 leading-relaxed">
                        Ürünlerinizi listelemekle yetinmeyin. AI araçlarımızla pazar dinamiklerine hükmedin, en iyi görsellere ve en yüksek SEO skoruna sahip olun.
                    </p>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, idx) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Link
                            href={tool.href}
                            className="group block h-full bg-surface border border-border p-8 rounded-[2rem] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <tool.icon size={120} />
                            </div>

                            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-all bg-${tool.color}-500/10 group-hover:scale-110`}>
                                <tool.icon className={`w-7 h-7 text-${tool.color}-500`} />
                            </div>

                            <div className="flex gap-2 mb-4">
                                {tool.badges.map(badge => (
                                    <span key={badge} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                        {badge}
                                    </span>
                                ))}
                            </div>

                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors flex items-center justify-between">
                                {tool.title}
                                <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                {tool.description}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Feature Teasers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-10">
                <div className="bg-gradient-to-br from-blue-500/5 to-transparent border border-border p-8 rounded-3xl flex items-center gap-6">
                    <div className="p-4 bg-blue-500/10 rounded-2xl">
                        <Wand2 className="text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Toplu Resim İşleme</h4>
                        <p className="text-sm text-slate-500">Tüm ürün kataloğunuzun arka planını tek tıkla beyaz yapın.</p>
                    </div>
                    <button className="ml-auto p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowUpRight className="text-slate-400" />
                    </button>
                </div>
                <div className="bg-gradient-to-br from-purple-500/5 to-transparent border border-border p-8 rounded-3xl flex items-center gap-6">
                    <div className="p-4 bg-purple-500/10 rounded-2xl">
                        <FileText className="text-purple-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Otomatik Açıklama Yazıcı</h4>
                        <p className="text-sm text-slate-500">Sadece özellik listesi girin, AI ikna edici açıklamayı yazsın.</p>
                    </div>
                    <button className="ml-auto p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowUpRight className="text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}
