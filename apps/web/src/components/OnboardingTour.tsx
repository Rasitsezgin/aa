"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Zap } from 'lucide-react';

export default function OnboardingTour() {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const steps = [
        {
            targetId: 'sidebar-nav',
            title: 'Navigasyon Merkezi',
            description: 'Ürünlerinizi, müşterilerinizi ve tüm operasyonu buradan yönetin.',
            position: 'right'
        },
        {
            targetId: 'global-search',
            title: 'Her Şeyi Ara',
            description: 'Siparişler, ürünler veya ayarlar... CMD+K ile ışık hızında ulaşın.',
            position: 'bottom'
        },
        {
            targetId: 'live-feed-sidebar',
            title: 'Canlı Akış',
            description: 'İşletmenizde ne olup bittiğini anlık olarak takip edin. Bildirimleri kaçırmayın.',
            position: 'left'
        }
    ];

    useEffect(() => {
        // Show tour after a slight delay
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Find target element and get its coordinates
        if (!isVisible || step >= steps.length) return;

        const updateRect = () => {
            const el = document.getElementById(steps[step].targetId);
            if (el) {
                setTargetRect(el.getBoundingClientRect());
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [step, isVisible]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            setIsVisible(false); // Finish
        }
    };

    const handleSkip = () => setIsVisible(false);

    if (!isVisible || !targetRect) return null;

    return (
        <div className="fixed inset-0 z-[99999] pointer-events-auto">
            {/* Backdrop with cutout effect using SVG clippath or simpler just localized overlay */}
            {/* For simplicity and performance, we'll use a full backdrop with a transparent 'hole' technique 
                or just highlight the box on top. Let's use a spotlight box approach. */}

            {/* Dimmed Background */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-all duration-500" />

            {/* Spotlight Box */}
            <motion.div
                initial={false}
                animate={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="absolute border-2 border-primary rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-50 pointer-events-none"
            />

            {/* Tooltip Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    top: steps[step].position === 'bottom' ? targetRect.bottom + 20 : targetRect.top,
                    left: steps[step].position === 'right' ? targetRect.right + 20 :
                        steps[step].position === 'left' ? targetRect.left - 340 : targetRect.left
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="absolute w-80 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-white/10 z-50 overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={100} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                            ADIM {step + 1}/{steps.length}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{steps[step].title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                        {steps[step].description}
                    </p>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleSkip}
                            className="text-xs font-bold text-slate-400 hover:text-foreground transition-colors"
                        >
                            Turu Geç
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:scale-105 transition-all"
                        >
                            {step === steps.length - 1 ? "Bitir" : "İlerle"} <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
