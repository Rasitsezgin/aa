'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Play, Pause, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface BeforeAfterSliderProps {
    features?: {
        beforeAfter: {
            enabled: boolean;
            autoPlay: boolean;
            animationSpeed: number;
        };
    };
}

export const BeforeAfterSlider = ({ features }: BeforeAfterSliderProps) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const animationSpeed = features?.beforeAfter.animationSpeed || 3000;
    const autoPlay = features?.beforeAfter.autoPlay || false;

    useEffect(() => {
        if (!features?.beforeAfter.enabled) return;

        if (autoPlay && !isDragging) {
            setIsPlaying(true);
            const interval = setInterval(() => {
                setSliderPosition((prev) => {
                    if (prev >= 100) return 0;
                    return prev + 2;
                });
            }, animationSpeed / 50);

            return () => clearInterval(interval);
        }
    }, [autoPlay, isDragging, animationSpeed, features?.beforeAfter.enabled]);

    const handleMouseDown = () => {
        setIsDragging(true);
        setIsPlaying(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (autoPlay) {
            setIsPlaying(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    if (!features?.beforeAfter.enabled) return null;

    return (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-foreground">Karmaşa → Kontrol</h3>
                        <p className="text-sm text-slate-500 mt-1">Pazaryonetimi ile değişimi görün</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isPlaying ? 'Duraklat' : 'Oynat'}
                        </button>
                        <button
                            onClick={() => setSliderPosition(50)}
                            className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Slider Container */}
            <div
                ref={containerRef}
                className="relative h-[400px] cursor-col-resize select-none"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                onTouchMove={handleTouchMove}
            >
                {/* Before (Chaos) */}
                <div className="absolute inset-0 bg-red-50 dark:bg-red-950/20">
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            <h4 className="text-lg font-bold text-red-600 dark:text-red-400">Önce: Karmaşa</h4>
                        </div>
                        
                        {/* Chaos Items */}
                        <div className="space-y-4">
                            <div className="bg-white/80 dark:bg-slate-800/80 border border-red-200 dark:border-red-800/50 rounded-xl p-4 transform rotate-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-red-600">Trendyol</span>
                                    <span className="text-xs text-red-500">23 ürün</span>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">Stok: 5, Fiyat: ₺299</div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 border border-red-200 dark:border-red-800/50 rounded-xl p-4 transform -rotate-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-red-600">Hepsiburada</span>
                                    <span className="text-xs text-red-500">18 ürün</span>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">Stok: 12, Fiyat: ₺349</div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 border border-red-200 dark:border-red-800/50 rounded-xl p-4 transform rotate-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-red-600">N11</span>
                                    <span className="text-xs text-red-500">31 ürün</span>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">Stok: 0, Fiyat: ₺279</div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 border border-red-200 dark:border-red-800/50 rounded-xl p-4 transform -rotate-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-red-600">Amazon</span>
                                    <span className="text-xs text-red-500">27 ürün</span>
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">Stok: 8, Fiyat: ₺319</div>
                            </div>
                        </div>

                        {/* Chaos Indicators */}
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-red-600">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                Stok tutarsızlıkları
                            </div>
                            <div className="flex items-center gap-2 text-xs text-red-600">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                Fiyat farklılıkları
                            </div>
                            <div className="flex items-center gap-2 text-xs text-red-600">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                Manuel güncellemeler
                            </div>
                        </div>
                    </div>
                </div>

                {/* After (Control) - Clipped */}
                <div 
                    className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/20"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                            <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Sonra: Kontrol</h4>
                        </div>
                        
                        {/* Unified Dashboard */}
                        <div className="bg-white/80 dark:bg-slate-800/80 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4">
                            <div className="text-sm font-bold text-emerald-600 mb-4">Merkezi Yönetim Paneli</div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <div className="text-2xl font-bold text-emerald-600">99</div>
                                    <div className="text-xs text-emerald-500">Toplam Ürün</div>
                                </div>
                                <div className="text-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <div className="text-2xl font-bold text-emerald-600">99</div>
                                    <div className="text-xs text-emerald-500">Stok Senkronize</div>
                                </div>
                            </div>

                            <div className="text-center p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <div className="text-2xl font-bold text-emerald-600">₺299</div>
                                <div className="text-xs text-emerald-500">Birleşik Fiyat</div>
                            </div>
                        </div>

                        {/* Control Indicators */}
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-emerald-600">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Otomatik stok senkronizasyonu
                            </div>
                            <div className="flex items-center gap-2 text-xs text-emerald-600">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Akıllı fiyatlandırma
                            </div>
                            <div className="flex items-center gap-2 text-xs text-emerald-600">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Tek tıkla güncelleme
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slider Handle */}
                <motion.div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-10"
                    style={{ left: `${sliderPosition}%` }}
                    animate={{ x: '-50%' }}
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg border-2 border-primary flex items-center justify-center">
                        <ArrowLeftRight className="w-5 h-5 text-primary" />
                    </div>
                </motion.div>

                {/* Position Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full text-white text-xs">
                    {sliderPosition.toFixed(0)}%
                </div>
            </div>
        </div>
    );
};
