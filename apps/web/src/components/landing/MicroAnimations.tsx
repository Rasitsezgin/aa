'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
    Sparkles, 
    Zap, 
    Target, 
    TrendingUp, 
    Heart, 
    Star,
    ArrowRight,
    MousePointer,
    Eye,
    Lightbulb,
    Brain
} from 'lucide-react';

interface MicroAnimationsProps {
    features?: {
        microAnimations?: {
            enabled: boolean;
            scrollReveal: boolean;
            hoverEffects: boolean;
            floatingElements: boolean;
            morphingText: boolean;
            particleTrails: boolean;
        };
    };
}

interface FloatingElement {
    id: number;
    icon: React.ElementType;
    x: number;
    y: number;
    delay: number;
    duration: number;
    size: number;
}

export const MicroAnimations = ({ features }: MicroAnimationsProps) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [activeText, setActiveText] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const { scrollYProgress } = useScroll({
        container: containerRef,
        offset: ["start end", "end start"]
    });

    const scrollReveal = features?.microAnimations?.scrollReveal !== false;
    const hoverEffects = features?.microAnimations?.hoverEffects !== false;
    const floatingElements = features?.microAnimations?.floatingElements !== false;
    const morphingText = features?.microAnimations?.morphingText !== false;
    const particleTrails = features?.microAnimations?.particleTrails !== false;

    // Transform values for scroll-based animations
    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]));

    // Floating elements data
    const floatingElementsData: FloatingElement[] = [
        { id: 1, icon: Sparkles, x: 10, y: 20, delay: 0, duration: 4, size: 20 },
        { id: 2, icon: Zap, x: 85, y: 15, delay: 0.5, duration: 3.5, size: 24 },
        { id: 3, icon: Target, x: 15, y: 70, delay: 1, duration: 4.5, size: 18 },
        { id: 4, icon: TrendingUp, x: 80, y: 75, delay: 1.5, duration: 3, size: 22 },
        { id: 5, icon: Heart, x: 50, y: 10, delay: 2, duration: 5, size: 16 },
        { id: 6, icon: Star, x: 45, y: 85, delay: 2.5, duration: 3.8, size: 20 }
    ];

    // Morphing text data
    const morphingTexts = [
        { text: 'AI Destekli', icon: Brain },
        { text: 'Otomatik Senkronizasyon', icon: Zap },
        { text: 'Akıllı Fiyatlandırma', icon: TrendingUp },
        { text: 'Gerçek Zamanlı Analiz', icon: Target },
        { text: 'Çoklu Platform', icon: Star }
    ];

    useEffect(() => {
        if (!features?.microAnimations?.enabled) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        if (hoverEffects || particleTrails) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        // Text morphing animation
        if (morphingText) {
            const interval = setInterval(() => {
                setActiveText(prev => (prev + 1) % morphingTexts.length);
            }, 3000);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                clearInterval(interval);
            };
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [hoverEffects, particleTrails, morphingText, features?.microAnimations?.enabled]);

    useEffect(() => {
        if (!scrollReveal) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [scrollReveal]);

    if (!features?.microAnimations?.enabled) return null;

    return (
        <div ref={containerRef} className="relative py-20 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

            {/* Particle Trail Effect */}
            {particleTrails && (
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-primary/30 rounded-full blur-sm"
                            animate={{
                                x: mousePosition.x - 10,
                                y: mousePosition.y - 10,
                                opacity: [0, 0.6, 0]
                            }}
                            transition={{
                                duration: 2,
                                delay: i * 0.1,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Floating Elements */}
            {floatingElements && (
                <div className="absolute inset-0 pointer-events-none">
                    {floatingElementsData.map((element) => {
                        const Icon = element.icon;
                        return (
                            <motion.div
                                key={element.id}
                                className="absolute"
                                style={{
                                    left: `${element.x}%`,
                                    top: `${element.y}%`
                                }}
                                animate={{
                                    y: [0, -20, 0],
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: element.duration,
                                    delay: element.delay,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <div 
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full p-3 shadow-lg border border-white/20 dark:border-white/10"
                                    style={{ width: element.size * 2, height: element.size * 2 }}
                                >
                                    <Icon 
                                        className="w-full h-full text-primary" 
                                        style={{ width: element.size, height: element.size }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Main Content */}
            <motion.div
                style={{ y, opacity, scale }}
                className="relative z-10 text-center px-8"
            >
                {/* Morphing Text */}
                {morphingText && (
                    <div className="mb-12">
                        <motion.div
                            key={activeText}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10 shadow-xl"
                        >
                            {React.createElement(morphingTexts[activeText].icon, {
                                className: "w-6 h-6 text-primary"
                            })}
                            <span className="text-lg font-bold text-foreground">
                                {morphingTexts[activeText].text}
                            </span>
                        </motion.div>
                    </div>
                )}

                {/* Main Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl font-black text-foreground mb-6"
                >
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Mikro Animasyonlar
                    </span>
                    <br />
                    <span className="text-3xl md:text-4xl text-foreground/80">
                        Büyüleyici Deneyim
                    </span>
                </motion.h2>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12"
                >
                    Scroll-triggered animasyonlar, hover efektleri ve interaktif elementlerle 
                    ziyaretçilerinizi büyüleyin. Modern web teknolojileriyle unutulmaz UX deneyimi.
                </motion.p>

                {/* Interactive Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {[
                        { icon: MousePointer, title: 'Hover Effects', desc: 'Mouse hareketlerine tepki veren akıllı animasyonlar', color: 'from-blue-500 to-cyan-500' },
                        { icon: Eye, title: 'Scroll Reveal', desc: 'Scroll ile tetiklenen reveal animasyonları', color: 'from-purple-500 to-pink-500' },
                        { icon: Lightbulb, title: 'Smart Transitions', desc: 'Akıllı geçişler ve morphing efektler', color: 'from-emerald-500 to-green-500' }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isVisible ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                            }}
                            className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-lg"
                        >
                            <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                                <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Interactive Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 1 }}
                    className="mt-12"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                    >
                        <Sparkles className="w-5 h-5" />
                        Animasyonları Keşfet
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>

                {/* Performance Indicator */}
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/10 backdrop-blur-xl rounded-full text-xs text-slate-600 dark:text-slate-400"
                    >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        60fps smooth animations
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
