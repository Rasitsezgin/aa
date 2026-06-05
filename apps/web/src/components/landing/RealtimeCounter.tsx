'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Globe, Activity, TrendingUp, MapPin, Zap, ArrowUpRight } from 'lucide-react';

interface CountryData {
    country: string;
    flag: string;
    users: number;
    growth: number;
}

interface RealtimeCounterProps {
    features?: {
        realTimeCounter: {
            enabled: boolean;
            showCountries: boolean;
            updateInterval: number;
        };
    };
}

export const RealtimeCounter = ({ features }: RealtimeCounterProps) => {
    const [activeUsers, setActiveUsers] = useState(1247);
    const [todayUsers, setTodayUsers] = useState(8934);
    const [growth, setGrowth] = useState(12.5);
    const [countries, setCountries] = useState<CountryData[]>([
        { country: 'Türkiye', flag: '🇹🇷', users: 892, growth: 15.2 },
        { country: 'Almanya', flag: '🇩🇪', users: 234, growth: 8.7 },
        { country: 'Hollanda', flag: '🇳🇱', users: 156, growth: 12.3 },
        { country: 'Fransa', flag: '🇫🇷', users: 98, growth: 6.4 },
        { country: 'ABD', flag: '🇺🇸', users: 67, growth: 18.9 },
        { country: 'İngiltere', flag: '🇬🇧', users: 45, growth: 22.1 },
        { country: 'İtalya', flag: '🇮🇹', users: 38, growth: 14.5 },
        { country: 'İspanya', flag: '🇪🇸', users: 32, growth: 9.8 },
        { country: 'Avusturya', flag: '🇦🇹', users: 28, growth: 11.2 },
        { country: 'Belçika', flag: '🇧🇪', users: 24, growth: 7.5 }
    ]);

    const updateInterval = features?.realTimeCounter.updateInterval || 5000;
    const showCountries = features?.realTimeCounter.showCountries !== false; // default true

    useEffect(() => {
        if (!features?.realTimeCounter.enabled) return;

        const interval = setInterval(() => {
            // Simulate real-time updates
            setActiveUsers(prev => {
                const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
                return Math.max(1000, prev + change);
            });

            setTodayUsers(prev => prev + Math.floor(Math.random() * 5) + 1);
            
            setGrowth(prev => {
                const change = (Math.random() - 0.5) * 2; // -1 to +1
                return Math.max(0, prev + change);
            });

            // Update countries
            if (showCountries) {
                setCountries(prev => prev.map(country => ({
                    ...country,
                    users: Math.max(10, country.users + Math.floor(Math.random() * 11) - 5),
                    growth: Math.max(0, country.growth + (Math.random() - 0.5) * 3)
                })));
            }
        }, updateInterval);

        return () => clearInterval(interval);
    }, [updateInterval, showCountries, features?.realTimeCounter.enabled]);

    if (!features?.realTimeCounter.enabled) return null;

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-xl shadow-primary/5">
            {/* Enhanced Header with Gradient */}
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-pink-500/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg shadow-primary/20"
                        >
                            <Activity className="w-4 h-4 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-base font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Canlı Kullanıcılar</h3>
                            <p className="text-xs text-slate-500">Gerçek zamanlı aktivite takibi</p>
                        </div>
                    </div>
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20"
                    >
                        <motion.div 
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                        />
                        <span className="text-[10px] text-green-600 font-black">LIVE</span>
                    </motion.div>
                </div>
            </div>

            {/* Enhanced Stats with Cards */}
            <div className="px-6 py-5">
                <div className="grid grid-cols-3 gap-4">
                    {/* Active Users */}
                    <motion.div 
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="text-center p-3 rounded-2xl bg-gradient-to-b from-orange-500/5 to-transparent border border-orange-200/50 dark:border-orange-500/10"
                    >
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className="w-4 h-4 text-orange-500/50" />
                        </div>
                        <motion.span 
                            key={activeUsers}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-xl font-black text-foreground block"
                        >
                            {activeUsers.toLocaleString()}
                        </motion.span>
                        <p className="text-[10px] text-slate-500">Şu An Aktif</p>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            className="flex items-center justify-center gap-0.5 mt-1.5"
                        >
                            <ArrowUpRight className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] text-green-500 font-black">
                                +{growth.toFixed(1)}%
                            </span>
                        </motion.div>
                    </motion.div>

                    {/* Today's Users */}
                    <motion.div 
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="text-center p-3 rounded-2xl bg-gradient-to-b from-purple-500/5 to-transparent border border-purple-200/50 dark:border-purple-500/10"
                    >
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Zap className="w-4 h-4 text-purple-500/50" />
                        </div>
                        <motion.span 
                            key={todayUsers}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-xl font-black text-foreground block"
                        >
                            {todayUsers.toLocaleString()}
                        </motion.span>
                        <p className="text-[10px] text-slate-500">Bugün Toplam</p>
                        <p className="text-[10px] text-slate-400 mt-1">Son 24 saat</p>
                    </motion.div>

                    {/* Global Reach */}
                    <motion.div 
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="text-center p-3 rounded-2xl bg-gradient-to-b from-emerald-500/5 to-transparent border border-emerald-200/50 dark:border-emerald-500/10"
                    >
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Globe className="w-4 h-4 text-emerald-500/50" />
                        </div>
                        <span className="text-xl font-black text-foreground block">
                            {countries.length}
                        </span>
                        <p className="text-[10px] text-slate-500">Ülke</p>
                        <p className="text-[10px] text-slate-400 mt-1">Global erişim</p>
                    </motion.div>
                </div>

                {/* Enhanced Country Cards - Horizontal Scroll */}
                {showCountries && (
                    <div className="mt-5 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Ülke Bazında Aktivite</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <AnimatePresence>
                                {countries.map((country, index) => (
                                    <motion.div
                                        key={`${country.country}-${country.users}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.08, y: -4 }}
                                        className="flex-shrink-0 w-[90px] p-3 bg-gradient-to-b from-slate-50 to-white dark:from-white/10 dark:to-white/5 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">{country.flag}</span>
                                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{country.country.substring(0, 3)}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-sm font-black text-foreground block">{country.users}</span>
                                            <div className="flex items-center gap-0.5">
                                                <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                                                <span className="text-[9px] text-green-500 font-bold">+{country.growth.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min((country.users / 1000) * 100, 100)}%` }}
                                                    transition={{ delay: index * 0.08 + 0.2, duration: 0.4 }}
                                                    className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
