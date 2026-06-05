'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Zap, Gift, Sparkles, Clock, MousePointer2 } from 'lucide-react';
import Image from 'next/image';

interface PopupData {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    ctaText: string;
    ctaUrl: string;
    type: 'EXIT_INTENT' | 'TIMED' | 'SCROLL' | 'IMMEDIATE';
    delay: number;
    scroll: number;
    theme: 'light' | 'dark' | 'brand';
    bgColor?: string;
    textColor?: string;
    size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function DynamicPopupSystem() {
    const [popups, setPopups] = useState<PopupData[]>([]);
    const [currentPopup, setCurrentPopup] = useState<PopupData | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasShownId, setHasShownId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPopups = async () => {
            try {
                // Get current path to check for page-specific popups
                const slug = window.location.pathname.split('/').pop() || 'homepage';
                const res = await fetch(`/api/popups?slug=${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setPopups(data);
                }
            } catch (error) {
                console.error("Popup fetch error:", error);
            }
        };
        fetchPopups();
    }, []);

    const showPopup = useCallback((popup: PopupData) => {
        // Prevent showing the same popup twice in a session
        const shownPopups = JSON.parse(sessionStorage.getItem('shown_popups') || '[]');
        if (shownPopups.includes(popup.id)) return;

        setCurrentPopup(popup);
        setIsVisible(true);
        
        // Mark as shown
        shownPopups.push(popup.id);
        sessionStorage.setItem('shown_popups', JSON.stringify(shownPopups));
    }, []);

    useEffect(() => {
        if (popups.length === 0 || isVisible) return;

        const popup = popups[0]; // For now show the most recent one
        const isHomepage = window.location.pathname === '/';

        // Ana sayfada agresif popup'lari engelle (FloatingCTA ile cakismasin)
        if (isHomepage && (popup.type === 'IMMEDIATE' || popup.type === 'TIMED')) {
            return;
        }

        if (popup.type === 'IMMEDIATE') {
            showPopup(popup);
        } else if (popup.type === 'TIMED') {
            const timer = setTimeout(() => showPopup(popup), popup.delay * 1000);
            return () => clearTimeout(timer);
        } else if (popup.type === 'EXIT_INTENT') {
            const handleMouseLeave = (e: MouseEvent) => {
                if (e.clientY <= 0) {
                    showPopup(popup);
                }
            };
            document.addEventListener('mouseleave', handleMouseLeave);
            return () => document.removeEventListener('mouseleave', handleMouseLeave);
        } else if (popup.type === 'SCROLL') {
            const handleScroll = () => {
                const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                if (scrolled >= popup.scroll) {
                    showPopup(popup);
                    window.removeEventListener('scroll', handleScroll);
                }
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [popups, isVisible, showPopup]);

    if (!currentPopup || !isVisible) return null;

    const handleClose = () => setIsVisible(false);

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Popup Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none" style={{ perspective: "1200px" }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50, rotateX: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30, rotateX: -5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className={`relative w-full max-w-${currentPopup.size === 'md' ? 'md' : currentPopup.size === 'sm' ? 'sm' : 'lg'} pointer-events-auto overflow-hidden bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10`}
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-red-500 transition-all z-20"
                            >
                                <X size={16} />
                            </button>

                            {/* Popup Content */}
                            <div className="flex flex-col">
                                {/* Header with Icon/Style */}
                                <div className="h-24 bg-primary relative overflow-hidden flex items-center px-8">
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                                    </div>
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <Sparkles className="text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">Fırsatı Yakala!</h3>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    {currentPopup.imageUrl && (
                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5">
                                            <img src={currentPopup.imageUrl} alt={currentPopup.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                            {currentPopup.title}
                                        </h4>
                                        {currentPopup.description && (
                                            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                                                {currentPopup.description}
                                            </p>
                                        )}
                                    </div>

                                    <a 
                                        href={currentPopup.ctaUrl}
                                        className="group relative w-full h-14 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <span>{currentPopup.ctaText}</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    </a>

                                    <button 
                                        onClick={handleClose}
                                        className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                    >
                                        Kapat
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
