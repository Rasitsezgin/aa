"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Zap, ArrowRight, Wallet, Users, ShoppingBag, Calculator, PieChart, BarChart3, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function RoiCalculator() {
    const [monthlyOrders, setMonthlyOrders] = useState(750);
    const [avgOrderValue, setAvgOrderValue] = useState(1200);
    const [currentEmployees, setCurrentEmployees] = useState(2);

    // ROI Math
    // 1. Time Savings: Automating order processing, stock sync, invoicing
    const timeSavedHoursPerMonth = Math.round((monthlyOrders * 0.15) + (currentEmployees * 10)); // 9 mins per order + 10h admin per employee

    // 2. Labor Savings: Time saved * Avg hourly rate (assuming 200 TL/hr base cost)
    const laborCostSavingsMonthly = timeSavedHoursPerMonth * 200;

    // 3. Revenue Boost: AI SEO + repricing + stock availability = ~15% boost
    const aiRevenueBoostMonthly = (monthlyOrders * avgOrderValue) * 0.15;

    // 4. Total Value
    const totalMonthlyValue = laborCostSavingsMonthly + aiRevenueBoostMonthly;
    const yearlyValue = totalMonthlyValue * 12;

    // Animated Numbers
    const [displayYearlyValue, setDisplayYearlyValue] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setDisplayYearlyValue(prev => {
                const diff = yearlyValue - prev;
                if (Math.abs(diff) < 100) return yearlyValue;
                return prev + diff * 0.1;
            });
        }, 16);
        return () => clearInterval(timer);
    }, [yearlyValue]);

    return (
        <section className="py-12 md:py-24 relative overflow-hidden bg-slate-50 dark:bg-[#02040a] min-h-[800px] flex items-center justify-center transition-colors duration-500">
            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 dark:bg-green-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* LEFT: Inputs */}
                    <div className="space-y-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-6">
                                <Calculator size={14} className="text-green-600 dark:text-green-400" />
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">KAZANÇ SİMÜLASYONU</span>
                            </div>

                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
                                Potansiyel <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-500">Kazancını</span> <br />
                                Keşfet.
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-lg">
                                İşletme verilerinizi girin, yapay zeka ve otomasyonun size
                                yıllık ne kadar tasarruf ve ekstra gelir sağlayacağını görün.
                            </p>
                        </div>

                        <div className="space-y-8 bg-white dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none backdrop-blur-sm">
                            <SliderInput
                                label="Aylık Sipariş Hacmi"
                                value={monthlyOrders}
                                setValue={setMonthlyOrders}
                                min={50} max={5000} step={50}
                                unit="Adet"
                                icon={ShoppingBag}
                                color="blue"
                            />
                            <SliderInput
                                label="Ortalama Sepet Tutarı"
                                value={avgOrderValue}
                                setValue={setAvgOrderValue}
                                min={100} max={10000} step={100}
                                unit="₺"
                                icon={Wallet}
                                color="green"
                            />
                            <SliderInput
                                label="Personel Sayısı"
                                value={currentEmployees}
                                setValue={setCurrentEmployees}
                                min={1} max={50} step={1}
                                unit="Kişi"
                                icon={Users}
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* RIGHT: Results */}
                    <div className="relative">
                        {/* Glow Behind */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-amber-500/20 blur-3xl opacity-30 rounded-[48px] transform rotate-3" />

                        <div className="relative bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 p-8 sm:p-10 rounded-[40px] shadow-2xl overflow-hidden group">

                            {/* Card Header */}
                            <div className="text-center mb-10">
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">TAHMİNİ YILLIK KAZANÇ</div>
                                <div className="flex items-center justify-center gap-1 text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    <span className="text-green-500 dark:text-green-400 text-3xl sm:text-5xl align-top mt-2">₺</span>
                                    {Math.round(displayYearlyValue).toLocaleString()}
                                </div>
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-bold">
                                    <TrendingUp size={14} />
                                    Yatırımın Geri Dönüşü (ROI): %{Math.round((yearlyValue / (currentEmployees * 40000 * 12)) * 100) + 100}
                                </div>
                            </div>

                            {/* Detailed Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                                        <Clock size={16} />
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">AYLIK TASARRUF</div>
                                    <div className="text-xl font-black text-slate-900 dark:text-white mb-1">₺{Math.round(laborCostSavingsMonthly).toLocaleString()}</div>
                                    <div className="text-[10px] font-medium text-slate-400">{Math.round(timeSavedHoursPerMonth)} saat iş gücü</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                                        <Zap size={16} />
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">EKSTRA GELİR</div>
                                    <div className="text-xl font-black text-slate-900 dark:text-white mb-1">₺{Math.round(aiRevenueBoostMonthly).toLocaleString()}</div>
                                    <div className="text-[10px] font-medium text-slate-400">AI Satış Artışı</div>
                                </div>
                            </div>

                            {/* Efficiency Bar */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-8 border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verimlilik Skoru</span>
                                    <span className="text-xs font-black text-green-600 dark:text-green-400">Mükemmel</span>
                                </div>
                                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '92%' }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                                    <span>Manuel</span>
                                    <span>AI Destekli</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <Link href="/iletisim?ref=roi_calculator" className="block w-full">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 group shadow-xl shadow-slate-900/20"
                                >
                                    DETAYLI RAPOR AL
                                    <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </motion.button>
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function SliderInput({ label, value, setValue, min, max, step, unit, icon: Icon, color = "blue" }: any) {
    const percentage = ((value - min) / (max - min)) * 100;

    const colorClasses = {
        blue: "from-orange-500 to-amber-500",
        green: "from-green-500 to-emerald-500",
        purple: "from-purple-500 to-violet-500",
    }[color as "blue" | "green" | "purple"];

    return (
        <div className="group">
            <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-700`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
                        <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                            {unit === '₺' ? '₺' : ''}{value.toLocaleString()}{unit !== '₺' ? ` ${unit}` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative h-6 flex items-center cursor-pointer">
                {/* Track Background */}
                <div className="absolute w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    {/* Active Track */}
                    <div
                        className={`h-full bg-gradient-to-r ${colorClasses}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Range Input */}
                <input
                    type="range" min={min} max={max} step={step}
                    value={value}
                    onChange={(e) => setValue(parseInt(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                />

                {/* Custom Thumb */}
                <div
                    className="absolute w-5 h-5 bg-white shadow-md border-[3px] border-slate-900 dark:border-white rounded-full pointer-events-none z-10 transition-transform group-hover:scale-125 group-active:scale-95"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                />
            </div>
        </div>
    )
}
