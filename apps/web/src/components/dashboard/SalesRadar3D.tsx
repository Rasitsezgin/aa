'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';

interface Pulse {
    id: number;
    platform: string;
    value: number;
    angle: number;
}

export const SalesRadar3D = () => {
    const [pulses, setPulses] = useState<Pulse[]>([]);
    const [scanAngle, setScanAngle] = useState(0);

    useEffect(() => {
        // Simüle edilmiş canlı veri akışı
        const interval = setInterval(() => {
            const id = Date.now();
            const platform = ['Trendyol', 'Amazon', 'Hepsiburada'][Math.floor(Math.random() * 3)];
            const value = Math.floor(Math.random() * 1000) + 100;
            const angle = Math.random() * 360;

            setPulses(prev => [...prev, { id, platform, value, angle }].slice(-5));
        }, 3000);

        const scanInterval = setInterval(() => {
            setScanAngle(prev => (prev + 2) % 360);
        }, 30);

        return () => {
            clearInterval(interval);
            clearInterval(scanInterval);
        };
    }, []);

    return (
        <div className="bg-surface rounded-3xl border border-border p-8 relative overflow-hidden h-[400px] flex items-center justify-center group">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5" />

            {/* Radar Lines */}
            <div className="relative w-[300px] h-[300px] rounded-full border border-indigo-500/20 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full border border-indigo-500/10" />
                <div className="absolute inset-16 rounded-full border border-indigo-500/10" />
                <div className="absolute inset-32 rounded-full border border-indigo-500/10" />

                {/* Axis Lines */}
                <div className="absolute w-full h-[1px] bg-indigo-500/5" />
                <div className="absolute w-[1px] h-full bg-indigo-500/5" />

                {/* Scanning Beam */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(99, 102, 241, 0.2) 60deg, transparent 61deg)',
                        transform: `rotate(${scanAngle}deg)`
                    }}
                />

                {/* Pulses (Sales) */}
                <AnimatePresence>
                    {pulses.map((pulse) => (
                        <motion.div
                            key={pulse.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: [0, 1, 0] }}
                            exit={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 4, ease: "easeOut" }}
                            className="absolute flex flex-col items-center"
                            style={{
                                transform: `rotate(${pulse.angle}deg) translateY(-100px) rotate(-${pulse.angle}deg)`
                            }}
                        >
                            <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                            <div className="mt-2 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 px-2 py-1 rounded text-[8px] font-black text-indigo-400 whitespace-nowrap">
                                {pulse.platform}: ₺{pulse.value}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Center Core */}
                <div className="w-8 h-8 rounded-full bg-surface border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] z-10 flex items-center justify-center animate-pulse">
                    <Target className="w-4 h-4 text-indigo-500" />
                </div>
            </div>

            {/* Sidebar Stats (Glassmorphism) */}
            <div className="absolute right-8 top-8 bottom-8 w-32 flex flex-col gap-3 justify-center">
                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">CANLI NABIZ</div>
                    <div className="text-sm font-black text-indigo-400">AKTİF</div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">RAKİP TEHDİDİ</div>
                    <div className="text-sm font-black text-pink-500 flex items-center gap-1">
                        DÜŞÜK <Zap size={10} />
                    </div>
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <div className="text-[10px] font-bold text-white uppercase tracking-tighter">İşlem Hızı</div>
                    <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <motion.div
                            animate={{ width: ['20%', '90%', '40%'] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="h-full bg-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute left-8 bottom-8 flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Satış</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Anomali</span>
                </div>
            </div>

            {/* Header Text */}
            <div className="absolute left-8 top-8">
                <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                    Holografik Satış Radarı
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] rounded-full">v2.0 Beta</span>
                </h3>
                <p className="text-xs text-slate-500">Pazaryeri sinyalleri anlık işleniyor.</p>
            </div>
        </div>
    );
};
