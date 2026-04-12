"use client";

import React from 'react';
import { Bot, Zap, Target, BarChart3, Globe, ShieldCheck } from 'lucide-react';

export default function FeaturesShowcase() {
    const features = [
        {
            title: "Yapay Zeka SEO",
            desc: "Ürünlerinizin başlık ve açıklamalarını Gemini API ile anlık optimize eder.",
            icon: Bot,
            color: "from-blue-500/20 to-cyan-500/20"
        },
        {
            title: "Rakip Takibi",
            desc: "Rakiplerinizin fiyat hamlelerini saniyelik izler ve karşı hamle önerir.",
            icon: Target,
            color: "from-purple-500/20 to-pink-500/20"
        },
        {
            title: "Akıllı Analiz",
            desc: "Satış trendlerinizi yapay zeka ile tahmin eder, stok risklerini yönetir.",
            icon: BarChart3,
            color: "from-emerald-500/20 to-teal-500/20"
        },
        {
            title: "Tek API Köprüsü",
            desc: "Tüm pazaryerlerini tek bir köprü üzerinden, sıfır gecikme ile yönetin.",
            icon: Zap,
            color: "from-orange-500/20 to-yellow-500/20"
        },
        {
            title: "Global Vizyon",
            desc: "Dünyanın her yerine yerel dilde ve para biriminde satış yapın.",
            icon: Globe,
            color: "from-indigo-500/20 to-blue-500/20"
        },
        {
            title: "Maksimum Güvenlik",
            desc: "Multi-tenant RLS mimarisi ile verileriniz sadece size özeldir.",
            icon: ShieldCheck,
            color: "from-slate-500/20 to-slate-800/20"
        }
    ];

    return (
        <section className="py-32 relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">Neden <span className="gradient-text">Pazaryonetimi?</span></h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">Sıradan bir yazılım değil, e-ticaret imparatorluğunuzun akıllı motoru.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className={`glass-card p-10 rounded-[40px] border border-white/5 bg-gradient-to-br ${feature.color} group`}>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                                <feature.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.desc}</p>

                            <div className="mt-8 flex items-center gap-2 text-xs font-bold tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                DAHA FAZLA BİLGİ <Zap size={12} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
