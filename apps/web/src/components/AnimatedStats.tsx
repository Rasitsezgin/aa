"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
    Store, Package, Zap, TrendingUp, Users, Globe, Shield, 
    Award, Clock, BarChart3, Sparkles, ArrowUpRight
} from 'lucide-react';

const stats = [
    {
        icon: Users,
        value: 5000,
        suffix: "+",
        label: "Aktif Mağaza",
        description: "Her gün büyüyen topluluğumuz",
        color: "from-orange-500 to-amber-500",
        bgColor: "bg-orange-50 dark:bg-orange-500/10"
    },
    {
        icon: Package,
        value: 2.5,
        suffix: "M+",
        label: "Yönetilen Ürün",
        description: "Milyonlarca ürün tek panelde",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50 dark:bg-purple-500/10"
    },
    {
        icon: TrendingUp,
        value: 40,
        suffix: "%",
        label: "Satış Artışı",
        description: "Ortalama müşteri performansı",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50 dark:bg-green-500/10"
    },
    {
        icon: Zap,
        value: 99.9,
        suffix: "%",
        label: "Uptime",
        description: "Kesintisiz hizmet garantisi",
        color: "from-orange-500 to-amber-500",
        bgColor: "bg-orange-50 dark:bg-orange-500/10"
    }
];

const features = [
    { icon: Globe, text: "15+ Pazaryeri Entegrasyonu" },
    { icon: Clock, text: "Anlık Senkronizasyon" },
    { icon: Shield, text: "KVKK Uyumlu" },
    { icon: Award, text: "7/24 Türkçe Destek" },
];

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!inView) return;

        const duration = 2000;
        const startTime = Date.now();
        const isDecimal = value % 1 !== 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutExpo = 1 - Math.pow(2, -10 * progress);
            const currentValue = value * easeOutExpo;

            setDisplayValue(isDecimal ? parseFloat(currentValue.toFixed(1)) : Math.floor(currentValue));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }, [inView, value]);

    return <span>{displayValue}{suffix}</span>;
}

export default function AnimatedStats() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-14 sm:py-24 relative overflow-hidden bg-slate-50 dark:bg-[#020617]/50 transition-colors duration-500">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-10 sm:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-4 sm:mb-6"
                    >
                        <BarChart3 size={14} className="text-green-600 dark:text-green-400" />
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Rakamlarla Pazaryonetimi</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 sm:mb-4"
                    >
                        Güvenin Adresi
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2"
                    >
                        Binlerce e-ticaret işletmesi operasyonlarını Pazaryonetimi ile yönetiyor
                    </motion.p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10 sm:mb-16">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative"
                        >
                            {/* Glow */}
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity`} />
                            
                            <div className="relative p-4 sm:p-8 bg-white dark:bg-white/5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 hover:border-transparent transition-all h-full">
                                {/* Icon */}
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${stat.bgColor} flex items-center justify-center mb-3 sm:mb-6`}>
                                    <stat.icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: stat.color.includes('blue') ? '#ea580c' : stat.color.includes('purple') ? '#a855f7' : stat.color.includes('green') ? '#22c55e' : '#f97316' }} />
                                </div>

                                {/* Value */}
                                <div className="text-2xl sm:text-5xl font-black text-slate-900 dark:text-white mb-1 sm:mb-2">
                                    <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={isInView} />
                                </div>

                                {/* Label */}
                                <div className="text-sm sm:text-lg font-bold text-slate-700 dark:text-slate-200 mb-0 sm:mb-1">
                                    {stat.label}
                                </div>

                                {/* Description */}
                                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                                    {stat.description}
                                </div>

                                {/* Hover Arrow */}
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight size={20} className="text-slate-400" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Features Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-2 sm:gap-4"
                >
                    {features.map((feature, i) => (
                        <div 
                            key={i}
                            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10"
                        >
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                <feature.icon size={12} className="text-green-600 dark:text-green-400 sm:hidden" />
                                <feature.icon size={16} className="text-green-600 dark:text-green-400 hidden sm:block" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{feature.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
