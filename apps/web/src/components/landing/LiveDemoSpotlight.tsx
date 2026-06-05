'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Play, Pause, Maximize2, MousePointer, Sparkles } from 'lucide-react';

interface LiveDemoSpotlightProps {
    features?: {
        liveDemo: {
            enabled: boolean;
            spotlightIntensity: number;
            mouseFollow: boolean;
        };
    };
}

export const LiveDemoSpotlight = ({ features }: LiveDemoSpotlightProps) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Mouse tracking için motion values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    // Spring animasyonları
    const spotlightX = useSpring(mouseX, { stiffness: 300, damping: 30 });
    const spotlightY = useSpring(mouseY, { stiffness: 300, damping: 30 });

    useEffect(() => {
        if (!features?.liveDemo.enabled || !features?.liveDemo.mouseFollow) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            mouseX.set(x);
            mouseY.set(y);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [features?.liveDemo.enabled, features?.liveDemo.mouseFollow, mouseX, mouseY]);

    const spotlightIntensity = features?.liveDemo.spotlightIntensity || 70;
    const spotlightSize = 200 + (spotlightIntensity / 100) * 100;
    const spotlightOpacity = 0.3 + (spotlightIntensity / 100) * 0.4;

    if (!features?.liveDemo.enabled) return null;

    return (
        <div className="relative bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Live Demo Mode</h3>
                            <p className="text-sm text-white/70">Dashboard'u interaktif olarak keşfedin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Interactive Dashboard Container */}
            <div
                ref={containerRef}
                className={`relative ${isFullscreen ? 'h-[600px]' : 'h-[400px]'} bg-slate-900 overflow-hidden`}
            >
                {/* Spotlight Effect */}
                {features.liveDemo.mouseFollow && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{
                            background: `radial-gradient(circle ${spotlightSize}px at ${spotlightX}px ${spotlightY}px, transparent 0%, rgba(0,0,0,${spotlightOpacity}) 50%, rgba(0,0,0,0.8) 100%)`
                        }}
                    />
                )}

                {/* Mock Dashboard Content */}
                <div className="absolute inset-0 p-8 pt-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Stats Cards */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
                            <div className="text-sm text-slate-400 mb-2">Toplam Gelir</div>
                            <div className="text-2xl font-bold text-white">₺124,500</div>
                            <div className="text-xs text-green-400 mt-1">+12.5%</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
                            <div className="text-sm text-slate-400 mb-2">Aktif Ürünler</div>
                            <div className="text-2xl font-bold text-white">1,247</div>
                            <div className="text-xs text-orange-400 mt-1">+23 yeni</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
                            <div className="text-sm text-slate-400 mb-2">Siparişler</div>
                            <div className="text-2xl font-bold text-white">847</div>
                            <div className="text-xs text-amber-400 mt-1">Beklemede: 23</div>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="mt-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 h-48">
                        <div className="text-sm text-slate-400 mb-2">Satış Grafiği</div>
                        <div className="flex items-end justify-between h-32">
                            {[40, 65, 30, 80, 55, 90, 70].map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: isPlaying ? `${height}%` : 0 }}
                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                    className="w-8 bg-gradient-to-t from-primary to-primary/50 rounded-t-lg"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="mt-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
                        <div className="text-sm text-slate-400 mb-2">Son Aktiviteler</div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-white/70">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Yeni sipariş: #1234 - ₺2,340
                            </div>
                                <div className="flex items-center gap-2 text-xs text-white/70">
                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                Stok güncellendi: iPhone 15 Pro
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/70">
                                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                                Fiyat güncellendi: Samsung Galaxy S24
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Hint */}
                <div className="absolute bottom-4 right-4 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-3 py-2 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-lg text-white text-xs"
                    >
                        <MousePointer className="w-3 h-3" />
                        Mouse ile keşfedin
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
