'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Globe, Activity, TrendingUp, MapPin } from 'lucide-react';

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
        { country: 'ABD', flag: '🇺🇸', users: 67, growth: 18.9 }
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
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">Canlı Kullanıcılar</h3>
                            <p className="text-sm text-slate-500">Gerçek zamanlı aktivite takibi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 font-bold">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Active Users */}
                    <div className="text-center">
                        <div className="relative inline-flex items-center justify-center">
                            <Users className="w-8 h-8 text-primary/20 absolute" />
                            <motion.span 
                                key={activeUsers}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-black text-foreground relative"
                            >
                                {activeUsers.toLocaleString()}
                            </motion.span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Şu An Aktif</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-500 font-bold">
                                +{growth.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {/* Today's Users */}
                    <div className="text-center">
                        <motion.span 
                            key={todayUsers}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-black text-foreground"
                        >
                            {todayUsers.toLocaleString()}
                        </motion.span>
                        <p className="text-sm text-slate-500 mt-2">Bugün Toplam</p>
                        <div className="text-xs text-slate-400 mt-1">
                            Son 24 saat
                        </div>
                    </div>

                    {/* Global Reach */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Globe className="w-8 h-8 text-primary/20" />
                            <span className="text-4xl font-black text-foreground">
                                {countries.length}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Ülke</p>
                        <div className="text-xs text-slate-400 mt-1">
                            Global erişim
                        </div>
                    </div>
                </div>

                {/* Country Breakdown */}
                {showCountries && (
                    <div className="mt-8">
                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Ülke Bazında Aktivite
                        </h4>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {countries.map((country, index) => (
                                    <motion.div
                                        key={`${country.country}-${country.users}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{country.flag}</span>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{country.country}</p>
                                                <p className="text-xs text-slate-500">{country.users} kullanıcı</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3 text-green-500" />
                                                <span className="text-xs text-green-500 font-bold">
                                                    +{country.growth.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(country.users / 1000) * 100}%` }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Live Activity Feed */}
                <div className="mt-8">
                    <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Canlı Aktivite Akışı
                    </h4>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {[
                                { icon: '🛒', text: 'Yeni sipariş verildi', time: 'Az önce' },
                                { icon: '📦', text: 'Stok senkronize edildi', time: '1 dk önce' },
                                { icon: '💰', text: 'Ödeme alındı', time: '2 dk önce' },
                                { icon: '📈', text: 'Fiyat güncellendi', time: '3 dk önce' }
                            ].map((activity, index) => (
                                <motion.div
                                    key={`${activity.text}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-white/5 rounded-lg text-xs"
                                >
                                    <span className="text-lg">{activity.icon}</span>
                                    <span className="text-slate-600 dark:text-slate-400">{activity.text}</span>
                                    <span className="text-slate-400 ml-auto">{activity.time}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};
