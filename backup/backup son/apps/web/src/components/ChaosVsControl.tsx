"use client";

import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { GripVertical, AlertOctagon, CheckCircle2, XCircle, AlertTriangle, FileWarning, ArrowRight } from 'lucide-react';

export default function ChaosVsControl() {
    const [sliderRef, setSliderRef] = useState<HTMLDivElement | null>(null);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const controls = useAnimation();

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef) return;
        const rect = sliderRef.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !sliderRef) return;
        const rect = sliderRef.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const stopDragging = () => setIsDragging(false);

    return (
        <section className="pt-4 sm:pt-10 md:pt-16 pb-14 sm:pb-20 md:pb-32 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                {/* Ambient Glows */}
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-red-500/5 dark:bg-red-500/10 blur-[150px] rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full -translate-y-1/2" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-16 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-4 sm:mb-6">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Operasyonel Dönüşüm</span>
                </div>
                <h2 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 sm:mb-8 text-slate-900 dark:text-white">
                    Kaostan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Kontrole</span>
                </h2>
                <p className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
                    Karmaşık Excel tabloları ve kaybolan siparişler tarihe karıştı.
                    <span className="hidden sm:inline"> Tüm operasyonunuzu tek bir temiz, akıllı ekrandan yönetin.</span>
                </p>
            </div>

            <div
                className="container mx-auto px-4 md:px-6 max-w-7xl select-none"
                onMouseUp={stopDragging}
                onTouchEnd={stopDragging}
            >
                <div
                    ref={setSliderRef}
                    className="relative w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[21/9] rounded-2xl sm:rounded-[40px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 dark:shadow-none cursor-col-resize group ring-1 ring-black/5 dark:ring-white/5"
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleTouchMove}
                    onMouseDown={() => setIsDragging(true)}
                    onTouchStart={() => setIsDragging(true)}
                    onMouseLeave={stopDragging}
                >
                    {/* RIGHT SIDE: CONTROL (Dashboard) */}
                    <div className="absolute inset-0 bg-slate-50 dark:bg-[#0F172A] flex items-center justify-center">
                        <ControlUI />
                        <div className="absolute top-3 right-3 sm:top-8 sm:right-8 bg-white/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 border border-blue-500/10 dark:border-blue-500/20 backdrop-blur-md shadow-lg shadow-blue-500/10 dark:shadow-blue-900/20">
                            <CheckCircle2 size={12} className="text-blue-600 dark:text-blue-400 sm:hidden" />
                            <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 hidden sm:block" />
                            <span className="tracking-widest uppercase">PAZARYONETİMİ</span>
                        </div>
                    </div>

                    {/* LEFT SIDE: CHAOS (Excel) */}
                    <div
                        className="absolute inset-0 bg-white z-10 overflow-hidden border-r border-white/20 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_40px_rgba(0,0,0,0.3)]"
                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                        <ChaosUI />
                        <div className="absolute top-3 left-3 sm:top-8 sm:left-8 bg-red-100 text-red-600 px-2.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 border border-red-200 shadow-lg shadow-red-900/5">
                            <AlertOctagon size={12} className="sm:hidden" />
                            <AlertOctagon size={16} className="hidden sm:block" />
                            <span className="tracking-widest uppercase">ESKİ YÖNTEM</span>
                        </div>
                    </div>

                    {/* SLIDER HANDLE */}
                    <div
                        className="absolute top-0 bottom-0 w-1.5 bg-white z-30 cursor-col-resize flex items-center justify-center pointer-events-none"
                        style={{ left: `${sliderPosition}%` }}
                    >
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full text-blue-600 dark:text-blue-400 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 transition-transform cursor-grab active:cursor-grabbing border-4 border-slate-50 dark:border-slate-800 relative z-40 backdrop-blur-sm">
                            <GripVertical size={20} />
                        </div>
                        <div className="absolute inset-y-0 -left-8 w-16 bg-gradient-to-r from-transparent via-black/5 dark:via-black/20 to-transparent blur-sm h-full w-full pointer-events-none" />
                    </div>
                </div>

                <div className="flex justify-center mt-12 gap-8 md:gap-16 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <button
                        className="flex items-center gap-3 hover:text-red-500 transition-colors group"
                        onClick={() => setSliderPosition(15)}
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-100 flex items-center justify-center group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                            <XCircle size={16} className="text-slate-500 dark:text-slate-900 group-hover:text-red-500" />
                        </div>
                        Karmaşa
                    </button>
                    <button
                        className="flex items-center gap-3 hover:text-blue-500 transition-colors group"
                        onClick={() => setSliderPosition(85)}
                    >
                        Kontrol
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <ArrowRight size={16} className="text-slate-500 dark:text-slate-900 group-hover:text-blue-500" />
                        </div>
                    </button>
                </div>
            </div>
        </section>
    );
}

// --- VISUAL COMPONENTS ---

function ChaosUI() {
    return (
        <div className="w-full h-full bg-[#f1f5f9] p-4 md:p-10 font-mono text-[10px] md:text-xs overflow-hidden relative select-none">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Chaotic Excel Grid */}
            <div className="w-[140%] -ml-[10%] -mt-10 transform -rotate-2 origin-center opacity-80 filter blur-[0.5px]">
                <div className="bg-white shadow-xl rounded-sm border border-slate-300 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#1D6F42] px-2 py-1 flex items-center gap-2">
                        <FileWarning size={12} className="text-white" />
                        <span className="text-white font-bold opacity-90">Siparişler_V3_SON_KOPYA(2).xlsx [Kurtarıldı]</span>
                    </div>
                    {/* Toolbar */}
                    <div className="bg-[#f3f4f6] border-b border-slate-300 h-8 flex items-center px-2 space-x-2">
                        <div className="w-4 h-4 bg-slate-300 rounded-sm" />
                        <div className="w-4 h-4 bg-slate-300 rounded-sm" />
                        <div className="h-4 w-[1px] bg-slate-400 mx-2" />
                        <div className="w-24 h-4 bg-white border border-slate-300 rounded-sm" />
                    </div>
                    {/* Grid */}
                    <div className="grid grid-cols-6 gap-[1px] bg-slate-200 border border-slate-200">
                        {Array.from({ length: 15 }).map((_, r) => (
                            <React.Fragment key={r}>
                                <div className={`p-2 bg-white ${r === 0 ? 'font-bold bg-slate-100 text-slate-700' : 'text-slate-600'} flex items-center`}>
                                    {r === 0 ? 'Sipariş No' : `#TR-${9000 + r}`}
                                </div>
                                <div className={`p-2 bg-white ${r === 0 ? 'font-bold bg-slate-100' : ''} ${r === 4 ? 'bg-red-50' : ''}`}>
                                    {r === 0 ? 'Müşteri' : 'Ahmet Y.'}
                                </div>
                                <div className={`p-2 bg-white ${r === 0 ? 'font-bold bg-slate-100' : ''} ${r % 3 === 0 && r !== 0 ? 'text-red-600 font-bold bg-red-50' : ''}`}>
                                    {r === 0 ? 'Durum' : r % 3 === 0 ? 'HATA!' : 'Bekliyor'}
                                </div>
                                <div className={`p-2 bg-white ${r === 0 ? 'font-bold bg-slate-100' : ''}`}>
                                    {r === 0 ? 'Tutar' : '₺' + (100 * r + 50)}
                                </div>
                                <div className={`p-2 bg-white ${r === 0 ? 'font-bold bg-slate-100' : ''} ${r === 2 ? 'bg-yellow-50' : ''}`}>
                                    {r === 0 ? 'Platform' : 'Trendyol'}
                                </div>
                                <div className={`p-2 bg-white ${r === 0 ? 'font-bold bg-slate-100' : ''} truncate text-red-500`}>
                                    {r === 0 ? 'Notlar' : r % 2 === 0 ? 'STOK YOK!' : '-'}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Popups floating on top */}
            <motion.div
                className="absolute top-[30%] left-[5%] md:left-[10%] bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-red-200 text-red-600 w-48 md:w-64 z-20"
                animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase"><AlertTriangle size={14} /> Kritik Stok Hatası</div>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <p className="text-[10px] text-slate-600 leading-snug">
                    Ürün ID #420 stokta yok ama Trendyol üzerinden satış gerçekleşti. Müşteri şikayeti: "Ürünüm nerede?"
                </p>
                <div className="mt-3 flex gap-2">
                    <div className="flex-1 h-6 bg-red-50 rounded-md border border-red-100 flex items-center justify-center text-[9px] font-bold text-red-400">Yoksay</div>
                    <div className="flex-1 h-6 bg-red-600 rounded-md flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-red-500/30">Düzelt</div>
                </div>
            </motion.div>

            <motion.div
                className="absolute bottom-[20%] right-[5%] md:right-[15%] bg-[#fffde7]/95 backdrop-blur-sm p-3 md:p-4 rounded-lg shadow-xl border border-yellow-200 text-yellow-800 w-44 md:w-56 transform rotate-2 z-30"
                animate={{ rotate: [2, 0, 2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="font-bold text-xs mb-1 flex items-center gap-1"><FileWarning size={12} /> Veri Eşleşmiyor</div>
                <p className="text-[10px] leading-snug opacity-80">Excel dosyasındaki fatura tutarı ile banka kaydı uyuşmuyor. Fark: -₺1,204.50</p>
            </motion.div>
        </div>
    )
}

function ControlUI() {
    return (
        <div className="w-full h-full bg-slate-50 dark:bg-[#0F172A] relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-600/10 blur-[150px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            {/* Dashboard Mockup - Slightly Scaled Down to fit simulation elements */}
            <div className="w-[90%] max-w-4xl relative z-10 grid grid-cols-3 gap-4 md:gap-5">

                {/* Main Stats Card with Pulse */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-3 md:col-span-2 bg-white dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-blue-500/20 rounded-3xl p-6 relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-blue-900/20"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="text-slate-500 dark:text-blue-400/80 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Canlı Satış Akışı
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-2">
                                <AnimatedCounter value={142500} prefix="₺" />
                                <div className="px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold flex items-center gap-1">
                                    ↑ %24
                                </div>
                            </div>
                        </div>
                        <div className="bg-blue-500/10 p-2 rounded-xl text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                            <span className="text-xs font-bold px-2">AI Aktif</span>
                        </div>
                    </div>
                    {/* Simulated Dynamic Chart */}
                    <div className="h-28 w-full flex items-end gap-1.5 px-1 pb-2 overflow-hidden">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 95, 60, 75, 50, 85, 95, 100].map((h, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-blue-500/20 to-blue-500 rounded-t-sm relative group"
                                animate={{
                                    height: [`${h}%`, `${Math.max(20, h + ((i % 5) * 5 - 10))}%`, `${h}%`],
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                    duration: 3 + (i % 3),
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: i * 0.1
                                }}
                            >
                                {/* Scanning Line Effect */}
                                <motion.div
                                    className="absolute top-0 left-0 right-0 h-[2px] bg-blue-300 dark:bg-blue-300 shadow-[0_0_10px_rgba(59,130,246,1)]"
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Automation Log (New Simulation Element) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-3 md:col-span-1 bg-white dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 flex flex-col relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none"
                >
                    <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
                        Otopilot Günlüğü
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">CANLI</span>
                    </div>

                    <div className="space-y-3 relative">
                        {/* Gradient Mask for fade out */}
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent z-10" />

                        <SimulatedLogItem title="Trendyol Stok Eşitlendi" time="Şimdi" color="text-green-600 dark:text-green-400" border="border-green-500/20" bg="bg-green-500/10" />
                        <SimulatedLogItem title="Fiyat Optimize Edildi" time="2sn önce" color="text-blue-600 dark:text-blue-400" border="border-blue-500/20" bg="bg-blue-500/10" />
                        <SimulatedLogItem title="Kargo Barkodu Basıldı" time="5sn önce" color="text-purple-600 dark:text-purple-400" border="border-purple-500/20" bg="bg-purple-500/10" />
                        <SimulatedLogItem title="Yeni Sipariş Onaylandı" time="1dk önce" color="text-orange-600 dark:text-orange-400" border="border-orange-500/20" bg="bg-orange-500/10" />
                    </div>
                </motion.div>

                {/* Bottom Bar: Integrations */}
                <div className="col-span-3 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md shadow-sm">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-slate-600 dark:text-white font-bold relative">
                                <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-slate-900" />
                                {['T', 'H', 'N', 'A'][i - 1]}
                            </div>
                        ))}
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Anlık Senkronizasyon</div>
                        <div className="text-slate-900 dark:text-white text-xs font-bold flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Tüm Kanallar Bağlı
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Notifications (Simulated) */}
            <SimulatedNotification top="15%" right="10%" text="🔔 Yeni Sipariş: #TR-9428 (₺1.250)" delay={2} />
            <SimulatedNotification top="40%" left="5%" text="⚡ Fiyat Güncellendi: iPhone 15 Kılıf" delay={5} color="blue" />
        </div>
    )
}

function SimulatedLogItem({ title, time, color, border, bg }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex items-center justify-between p-2.5 rounded-xl border ${border} ${bg} relative overflow-hidden`}
        >
            <span className={`text-[10px] font-bold ${color}`}>{title}</span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 opacity-60">{time}</span>
            <motion.div
                className="absolute inset-0 bg-white/20 dark:bg-white/10"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            />
        </motion.div>
    )
}

function SimulatedNotification({ top, left, right, text, delay, color = 'green' }: any) {
    return (
        <motion.div
            className={`absolute z-30 px-4 py-2 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-2 ${color === 'green' ? 'bg-green-500/10 text-green-600 dark:text-green-300' : 'bg-blue-500/10 text-blue-600 dark:text-blue-300'}`}
            style={{ top, left, right }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
                opacity: [0, 1, 1, 0],
                y: [20, 0, 0, -20],
                scale: [0.9, 1, 1, 0.9]
            }}
            transition={{
                duration: 4,
                delay: delay,
                repeat: Infinity,
                repeatDelay: 5
            }}
        >
            <div className={`w-2 h-2 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-blue-500'} animate-ping`} />
            <span className={`text-xs font-bold whitespace-nowrap ${color === 'green' ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>{text}</span>
        </motion.div>
    )
}

function AnimatedCounter({ value, prefix = '' }: { value: number, prefix?: string }) {
    return (
        <span>{prefix}{value.toLocaleString()}</span>
    );
}
