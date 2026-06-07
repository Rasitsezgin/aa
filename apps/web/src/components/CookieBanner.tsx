"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Cookie, X, Settings, Check, ChevronRight, ShieldCheck, Sparkles, Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = { necessary: true, analytics: true, marketing: true };
        saveConsent(allAccepted);
    };

    const handleAcceptSelected = () => {
        saveConsent(preferences);
    };

    const handleRejectAll = () => {
        const onlyNecessary = { necessary: true, analytics: false, marketing: false };
        saveConsent(onlyNecessary);
    };

    const saveConsent = (data: CookiePreferences) => {
        localStorage.setItem('cookie-consent', JSON.stringify(data));
        localStorage.setItem('cookie-consent-date', new Date().toISOString());
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="fixed bottom-4 left-4 right-4 z-[100] w-auto md:w-[calc(100%-4rem)] md:max-w-lg md:bottom-8 md:left-8"
                    layout
                >
                    {/* Luxury Outer Container */}
                    <div className="relative group p-[1px] rounded-[32px] overflow-hidden">
                        {/* Animated Border Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />

                        {/* Layered Glass Body */}
                        <div className="relative rounded-[31px] bg-white/80 dark:bg-[#0B1120]/85 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)] overflow-hidden">

                            {/* Animated Mesh Background */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 90, 0],
                                        x: [-20, 20, -20],
                                        y: [-20, 20, -20]
                                    }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-orange-500/30 blur-[100px] rounded-full"
                                />
                                <motion.div
                                    animate={{
                                        scale: [1.2, 1, 1.2],
                                        rotate: [0, -90, 0],
                                        x: [20, -20, 20],
                                        y: [20, -20, 20]
                                    }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-amber-500/30 blur-[100px] rounded-full"
                                />
                            </div>

                            <div className="relative z-10 p-8">
                                <AnimatePresence mode="wait">
                                    {!showSettings ? (
                                        <motion.div
                                            key="banner"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            {/* Luxury Header */}
                                            <div className="flex items-center gap-6">
                                                <div className="relative shrink-0">
                                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 p-[1px] shadow-lg shadow-orange-500/20">
                                                        <div className="w-full h-full rounded-[23px] bg-[#FAFAF9] dark:bg-[#0B1120] flex items-center justify-center relative overflow-hidden">
                                                            <Cookie className="w-8 h-8 text-orange-600 dark:text-orange-400 relative z-10" />
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                                className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-500/5 to-transparent"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 bg-[#FAFAF9] dark:bg-[#0B1120] p-1 rounded-full border border-orange-500/20 shadow-sm">
                                                        <Sparkles size={14} className="text-yellow-500" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                                        Gizliliğiniz <span className="text-orange-600 dark:text-orange-400 underline decoration-orange-500/30 underline-offset-4">Önemli</span>
                                                    </h3>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-[280px]">
                                                        Size özel bir e-ticaret deneyimi sunmak için akıllı çerezler kullanıyoruz.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Primary Action Button */}
                                            <button
                                                onClick={handleAcceptAll}
                                                className="w-full relative group/btn h-14"
                                            >
                                                <div className="absolute inset-0 bg-orange-600 rounded-2xl blur-md opacity-20 group-hover/btn:opacity-40 transition-opacity" />
                                                <div className="relative h-full w-full bg-orange-600 hover:bg-orange-500 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-colors overflow-hidden">
                                                    <Check size={20} className="text-white relative z-10" />
                                                    <span className="text-white font-black tracking-tight relative z-10">Tümünü Kabul Et ve Başla</span>

                                                    {/* Shine Effect */}
                                                    <motion.div
                                                        animate={{ x: ['-100%', '200%'] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                                                        className="absolute top-0 bottom-0 w-20 bg-white/20 skew-x-12 relative z-20"
                                                    />
                                                </div>
                                            </button>

                                            {/* Secondary Actions */}
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setShowSettings(true)}
                                                    className="flex-1 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Settings size={16} className="text-orange-500" />
                                                    Ayarlar
                                                </button>
                                                <Link
                                                    href="/kurumsal/cerez-politikasi"
                                                    className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    Politika
                                                    <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="settings"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => setShowSettings(false)}
                                                    className="text-sm font-black text-orange-600 dark:text-orange-400 flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
                                                >
                                                    <ChevronRight size={18} className="rotate-180" />
                                                    Geri
                                                </button>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Veri Denetimi</span>
                                            </div>

                                            <div className="space-y-3">
                                                <PremiumOption
                                                    icon={Lock}
                                                    label="Gerekli"
                                                    desc="Sistemin güvenliği için aktif olması şart"
                                                    checked={true}
                                                    disabled={true}
                                                    color="blue"
                                                />
                                                <PremiumOption
                                                    icon={TrendingUp}
                                                    label="Analiz"
                                                    desc="Deneyimi iyileştirmek için anonim veriler"
                                                    checked={preferences.analytics}
                                                    onChange={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                                                    color="purple"
                                                />
                                                <PremiumOption
                                                    icon={Sparkles}
                                                    label="Pazarlama"
                                                    desc="Size özel kampanya ve teklifler"
                                                    checked={preferences.marketing}
                                                    onChange={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                                                    color="indigo"
                                                />
                                            </div>

                                            <button
                                                onClick={handleAcceptSelected}
                                                className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] transition-all"
                                            >
                                                Tercihlerimi Kaydet
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Decorative Bottom Glow */}
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function PremiumOption({ icon: Icon, label, desc, checked, onChange, disabled, color }: any) {
    const colors: any = {
        blue: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        indigo: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    };

    return (
        <div
            onClick={!disabled ? onChange : undefined}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${checked
                ? 'bg-white dark:bg-white/5 border-orange-500/30 shadow-sm'
                : 'bg-slate-50/50 dark:bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.02]'
                }`}
        >
            <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{label}</span>
                    {disabled && <span className="text-[9px] font-black bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-slate-500 uppercase">Zorunlu</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{desc}</p>
            </div>
            {!disabled && (
                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-500 ${checked ? 'bg-orange-600' : 'bg-slate-300 dark:bg-white/10'}`}>
                    <motion.div
                        animate={{ x: checked ? 16 : 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 400 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                </div>
            )}
        </div>
    )
}
