"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    Users,
    TrendingUp,
    ShoppingBag,
    DollarSign,
    Search,
    Bell,
    CheckCircle2,
    Activity,
    Globe,
    Zap
} from 'lucide-react';

export default function DashboardPreview() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"]
    });

    // Transforms for "assembling" effect
    const sidebarX = useTransform(scrollYProgress, [0.2, 0.8], [-100, 0]);
    const sidebarOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);

    const headerY = useTransform(scrollYProgress, [0.3, 0.9], [-50, 0]);
    const headerOpacity = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);

    const statsScale = useTransform(scrollYProgress, [0.4, 1], [0.8, 1]);
    const statsOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);

    const chartY = useTransform(scrollYProgress, [0.6, 1], [100, 0]);
    const chartOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 1]);

    return (
        <section ref={containerRef} className="pt-2 pb-12 relative overflow-hidden bg-slate-50 dark:bg-[#02040a] transition-colors duration-500">

            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                {/* Ambient Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">

                {/* Title Section */}
                <div className="text-center mb-10 sm:mb-20">
                    <motion.div style={{ opacity: statsOpacity, y: headerY }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-6 relative overflow-hidden shadow-sm dark:shadow-none">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 relative z-10">CANLI YAYIN</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 dark:via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 sm:mb-6 text-slate-900 dark:text-white">
                        Tüm Operasyon <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Tek Ekranda</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Siz kahvenizi yudumlarken, Pazaryönetimi arka planda milyonlarca veriyi işler
                        ve ekranınıza canlı olarak yansıtır.
                    </p>
                </div>

                {/* Dashboard Window */}
                <div className="max-w-6xl mx-auto rounded-[20px] sm:rounded-[32px] md:rounded-[40px] bg-white dark:bg-[#0F172A] border-[4px] sm:border-[6px] md:border-[8px] border-slate-200 dark:border-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 relative overflow-hidden h-[350px] sm:h-[500px] md:h-[650px] flex ring-1 ring-slate-900/5 dark:ring-white/10">

                    {/* Sidebar: Slides in from left */}
                    <motion.div
                        style={{ x: sidebarX, opacity: sidebarOpacity }}
                        className="w-72 border-r border-slate-100 dark:border-white/5 bg-white dark:bg-[#0F172A] p-6 hidden md:flex flex-col gap-8 z-20 relative"
                    >
                        <div className="flex items-center gap-3 pl-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <Activity size={20} />
                            </div>
                            <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Pazaryonetimi</span>
                        </div>

                        <div className="space-y-2">
                            {[
                                { i: LayoutDashboard, l: "Genel Bakış", a: true },
                                { i: Package, l: "Ürün Yönetimi", a: false },
                                { i: ShoppingBag, l: "Siparişler", a: false, badge: 12 },
                                { i: Users, l: "Müşteriler", a: false },
                                { i: Globe, l: "Pazar Yerleri", a: false },
                                { i: Zap, l: "Otomasyonlar", a: false },
                            ].map((Item, idx) => (
                                <div key={idx} className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all cursor-pointer group ${Item.a ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                                    <div className="flex items-center gap-3">
                                        <Item.i size={18} />
                                        <span className="text-sm font-bold">{Item.l}</span>
                                    </div>
                                    {Item.badge && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md animate-pulse">{Item.badge}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Server Status in Sidebar */}
                        <div className="mt-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Sunucu Durumu</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <div className="flex gap-1 h-1">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 rounded-full bg-green-500/50"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, delay: i * 0.05, repeat: Infinity }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col relative z-10 bg-slate-50/50 dark:bg-[#0F172A]/50">
                        {/* Header: Slides down from top */}
                        <motion.div
                            style={{ y: headerY, opacity: headerOpacity }}
                            className="h-12 sm:h-16 md:h-24 flex items-center justify-between px-3 sm:px-4 md:px-8 border-b border-transparent dark:border-transparent md:border-slate-100 md:dark:border-white/5"
                        >
                            <div className="flex items-center gap-2 sm:gap-4 w-full max-w-[160px] sm:max-w-sm md:max-w-96 bg-white dark:bg-slate-900/50 px-3 sm:px-5 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500 text-xs sm:text-sm focus-within:border-blue-500/50 focus-within:text-slate-600 dark:focus-within:text-white transition-colors shadow-sm dark:shadow-none">
                                <Search size={14} />
                                <span className="font-medium truncate">Sipariş, ürün veya müşteri ara...</span>
                            </div>
                            <div className="flex items-center gap-6 hidden md:flex">
                                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
                                    <div className="relative">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute inset-0" />
                                        <div className="w-2 h-2 rounded-full bg-green-500 relative" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest">Sistem Aktif</span>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center relative hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer group shadow-sm dark:shadow-none">
                                    <Bell size={20} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
                                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0F172A]" />
                                </div>
                            </div>
                        </motion.div>

                        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-4 md:space-y-6 flex flex-col h-full overflow-hidden">
                            {/* Stats: Scale up and fade in */}
                            <motion.div
                                style={{ scale: statsScale, opacity: statsOpacity }}
                                className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6"
                            >
                                <StatsCard
                                    label="GÜNLÜK SATIŞ"
                                    value="₺42.500"
                                    trend="+%12"
                                    icon={DollarSign}
                                    color="green"
                                    delay={0}
                                />
                                <StatsCard
                                    label="BEKLEYEN SİPARİŞ"
                                    value="84"
                                    trend="+5"
                                    icon={ShoppingBag}
                                    color="blue"
                                    delay={0.1}
                                />
                                <StatsCard
                                    label="İADE ORANI"
                                    value="%1.2"
                                    trend="-%0.4"
                                    icon={TrendingUp}
                                    color="purple"
                                    delay={0.2}
                                />
                            </motion.div>

                            {/* Charts: Slide up from bottom */}
                            <motion.div
                                style={{ y: chartY, opacity: chartOpacity }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 flex-1 min-h-0"
                            >
                                <div className="md:col-span-2 p-4 sm:p-8 rounded-[20px] sm:rounded-[32px] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 flex flex-col relative overflow-hidden group hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-lg shadow-slate-200/50 dark:shadow-none">
                                    <div className="mb-4 sm:mb-8 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-sm sm:text-xl text-slate-900 dark:text-white mb-1">Satış Performansı</h3>
                                            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Son 12 saatlik canlı veriler</p>
                                        </div>
                                        <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-500 dark:text-slate-400">Canlı</div>
                                    </div>
                                    <div className="flex-1 flex items-end gap-2 relative">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                            {[...Array(4)].map((_, i) => <div key={i} className="w-full h-px bg-slate-400 dark:bg-white/10 dashed" />)}
                                        </div>

                                        {[40, 65, 50, 80, 60, 90, 70, 95, 80, 60, 85, 90, 100, 75, 85].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                whileInView={{
                                                    height: [`${h}%`, `${Math.min(100, h + 10)}%`, `${h}%`],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    repeatType: "reverse",
                                                    ease: "easeInOut",
                                                    delay: i * 0.1
                                                }}
                                                className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-xl relative group hover:from-blue-600/40 hover:to-blue-400 transition-colors"
                                            >
                                                {/* Bar Tops */}
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-300 opacity-50" />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Scanning Line Effect on Chart */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent pointer-events-none"
                                        animate={{ x: ['-100%', '200%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>

                                <div className="md:col-span-1 p-4 sm:p-8 rounded-[20px] sm:rounded-[32px] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 relative overflow-hidden hidden sm:block shadow-lg shadow-slate-200/50 dark:shadow-none">
                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6">Son İşlemler</h3>
                                    <div className="space-y-3 relative z-10">
                                        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10" />
                                        {[
                                            { t: "Sipariş #9012", s: "Onaylandı", c: "text-green-500 dark:text-green-400", bg: "bg-green-500" },
                                            { t: "Stok Eşitlendi", s: "Trendyol", c: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500" },
                                            { t: "Fiyat Analizi", s: "Tamamlandı", c: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500" },
                                            { t: "Yeni Müşteri", s: "Kaydedildi", c: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500" },
                                            { t: "Kargo Fişi", s: "Yazdırıldı", c: "text-slate-500 dark:text-slate-400", bg: "bg-slate-500" },
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div className={`w-10 h-10 rounded-full ${item.bg}/10 flex items-center justify-center border border-${item.bg}/20 shrink-0`}>
                                                    <div className={`w-3 h-3 rounded-full ${item.bg}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-slate-900 dark:text-white font-bold">{item.t}</div>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.s}</div>
                                                </div>
                                                <CheckCircle2 size={16} className={`${item.c}`} />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Floating Notifications Simulation */}
                    <SimulatedToast text="🚀 Yeni Sipariş" top="15%" right="5%" delay={2} />
                    <SimulatedToast text="📦 Kargo Takip Girildi" top="25%" right="5%" delay={5} color="blue" />

                </div>

            </div>
        </section>
    );
}

function StatsCard({ label, value, trend, icon: Icon, color, delay }: any) {
    const colors: any = {
        green: 'text-green-500 dark:text-green-400 bg-green-500/10 border-green-500/20',
        blue: 'text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
        purple: 'text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    };

    return (
        <div className="p-4 sm:p-8 rounded-[20px] sm:rounded-[32px] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all group relative overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Icon size={48} className={`opacity-10 ${colors[color].split(' ')[0]}`} />
            </div>

            <div className="flex justify-between items-start mb-3 sm:mb-6 relative z-10">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${colors[color]} flex items-center justify-center border shadow-lg`}>
                    <Icon size={16} className={colors[color].split(' ')[0]} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 sm:mb-2 tracking-tight relative z-10">{value}</div>
            <div className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">{label}</div>

            {/* Hover Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color === 'green' ? 'from-green-500/5' : color === 'blue' ? 'from-blue-500/5' : 'from-purple-500/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
    )
}

function SimulatedToast({ text, top, right, delay, color = 'green' }: any) {
    return (
        <motion.div
            className={`absolute z-50 px-3 md:px-5 py-2 md:py-3 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl flex items-center gap-2 md:gap-3 bg-white/80 dark:bg-slate-900/90 text-slate-900 dark:text-white max-w-[200px] md:max-w-none`}
            style={{ top, right }}
            initial={{ opacity: 0, x: 50 }}
            animate={{
                opacity: [0, 1, 1, 0],
                x: [50, 0, 0, 20],
            }}
            transition={{
                duration: 4,
                delay: delay,
                repeat: Infinity,
                repeatDelay: 8
            }}
        >
            <div className={`w-2 h-2 rounded-full ${color === 'green' ? 'bg-green-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(96,165,250,0.5)]'} animate-ping`} />
            <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">{text}</span>
        </motion.div>
    )
}
