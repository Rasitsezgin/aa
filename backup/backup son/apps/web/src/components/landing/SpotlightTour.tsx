'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Play, Pause, Zap, Target, Eye, MousePointer } from 'lucide-react';

interface TourStep {
    id: string;
    title: string;
    description: string;
    target: string; // CSS selector
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: () => void;
}

interface SpotlightTourProps {
    features?: {
        spotlightTour: {
            enabled: boolean;
            autoStart: boolean;
            stepDelay: number;
        };
    };
}

export const SpotlightTour = ({ features }: SpotlightTourProps) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const stepDelay = features?.spotlightTour.stepDelay || 2000;
    const autoStart = features?.spotlightTour.autoStart || false;

    const tourSteps: TourStep[] = [
        {
            id: 'welcome',
            title: 'Pazaryonetimi\'ye Hoş Geldiniz!',
            description: 'E-ticaret yönetiminizi nasıl kolaylaştıracağımızı birlikte keşfedelim.',
            target: 'body',
            position: 'center',
            action: () => {
                // Scroll to hero section
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        {
            id: 'hero',
            title: 'AI Destekli Yönetim',
            description: 'Yapay zeka ile stok, fiyat ve siparişlerinizi otomatik yönetin.',
            target: 'h1',
            position: 'bottom',
            action: () => {
                // Highlight hero section
                const hero = document.querySelector('h1');
                if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        {
            id: 'features',
            title: 'Özellikler',
            description: 'Tüm pazaryerlerinizi tek platformdan yönetin.',
            target: '[class*="bento"]',
            position: 'top',
            action: () => {
                const bento = document.querySelector('[class*="bento"]');
                if (bento) bento.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        {
            id: 'dashboard',
            title: 'Canlı Dashboard',
            description: 'Gerçek zamanlı satış verilerinizi ve analizlerinizi görün.',
            target: '[class*="dashboard"], [class*="preview"]',
            position: 'left',
            action: () => {
                const dashboard = document.querySelector('[class*="dashboard"], [class*="preview"]');
                if (dashboard) dashboard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        {
            id: 'roi',
            title: 'ROI Hesaplayıcı',
            description: 'Pazaryonetimi\'nin yatırım getirisini hesaplayın.',
            target: '[class*="roi"], [class*="calculator"]',
            position: 'right',
            action: () => {
                const roi = document.querySelector('[class*="roi"], [class*="calculator"]');
                if (roi) roi.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        {
            id: 'pricing',
            title: 'Esnek Fiyatlandırma',
            description: 'İhtiyacınıza uygun paketi seçin, istediğiniz zaman değiştirin.',
            target: '[class*="pricing"]',
            position: 'top',
            action: () => {
                const pricing = document.querySelector('[class*="pricing"]');
                if (pricing) pricing.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        },
        {
            id: 'cta',
            title: 'Başlayın!',
            description: '14 gün ücretsiz deneme ile Pazaryonetimi\'i keşfedin.',
            target: '[class*="cta"], button',
            position: 'center',
            action: () => {
                const cta = document.querySelector('[class*="cta"], button');
                if (cta) cta.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    ];

    useEffect(() => {
        if (!features?.spotlightTour.enabled) return;

        if (autoStart && !isActive) {
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 3000); // Start after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [autoStart, isActive, features?.spotlightTour.enabled]);

    useEffect(() => {
        if (!isActive || isPaused) return;

        const timer = setTimeout(() => {
            if (currentStep < tourSteps.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                setIsActive(false);
            }
        }, stepDelay);

        return () => clearTimeout(timer);
    }, [currentStep, isActive, isPaused, stepDelay]);

    useEffect(() => {
        if (!isActive) return;

        const step = tourSteps[currentStep];
        const element = document.querySelector(step.target);
        setHighlightedElement(element);
    }, [currentStep, isActive]);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsActive(false);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        setIsActive(false);
    };

    const handleStart = () => {
        setIsActive(true);
        setCurrentStep(0);
    };

    if (!features?.spotlightTour.enabled) return null;

    const currentTourStep = tourSteps[currentStep];

    return (
        <>
            {/* Start Tour Button */}
            {!isActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed bottom-8 right-8 z-40"
                >
                    <button
                        onClick={handleStart}
                        className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                        <Target className="w-4 h-4" />
                        Turu Başlat
                    </button>
                </motion.div>
            )}

            {/* Tour Overlay */}
            <AnimatePresence>
                {isActive && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                            onClick={handleSkip}
                        />

                        {/* Highlight Element */}
                        {highlightedElement && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="fixed z-50 pointer-events-none"
                                style={{
                                    top: highlightedElement.getBoundingClientRect().top - 8,
                                    left: highlightedElement.getBoundingClientRect().left - 8,
                                    width: highlightedElement.getBoundingClientRect().width + 16,
                                    height: highlightedElement.getBoundingClientRect().height + 16,
                                }}
                            >
                                <div className="absolute inset-0 border-4 border-primary rounded-lg shadow-2xl shadow-primary/50" />
                                <div className="absolute -inset-4 bg-primary/20 rounded-lg animate-pulse" />
                            </motion.div>
                        )}

                        {/* Tooltip */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed z-50 w-full max-w-md"
                            style={{
                                top: highlightedElement ? 
                                    currentTourStep.position === 'top' ? 
                                        highlightedElement.getBoundingClientRect().top - 200 :
                                    currentTourStep.position === 'bottom' ? 
                                        highlightedElement.getBoundingClientRect().bottom + 20 :
                                    currentTourStep.position === 'center' ? 
                                        '50%' :
                                        highlightedElement.getBoundingClientRect().top
                                    : '50%',
                                left: '50%',
                                transform: 'translateX(-50%)'
                            }}
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <Target className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">
                                                {currentTourStep.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>Adım {currentStep + 1}/{tourSteps.length}</span>
                                                <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-primary"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSkip}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>

                                {/* Content */}
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    {currentTourStep.description}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setIsPaused(!isPaused)}
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                                    >
                                        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                        {isPaused ? 'Devam Et' : 'Duraklat'}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {currentStep > 0 && (
                                            <button
                                                onClick={handlePrevious}
                                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                                            >
                                                <ArrowLeft className="w-3 h-3" />
                                                Önceki
                                            </button>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                                        >
                                            {currentStep === tourSteps.length - 1 ? 'Bitir' : 'Sonraki'}
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Keyboard shortcuts */}
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">→</kbd>
                                        <span>Sonraki</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">←</kbd>
                                        <span>Önceki</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">Esc</kbd>
                                        <span>Kapat</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
