'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
}

interface ScrollParticlesProps {
    features?: {
        particles: {
            enabled: boolean;
            particleCount: number;
            triggerScroll: boolean;
        };
    };
}

export const ScrollParticles = ({ features }: ScrollParticlesProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const particleCount = features?.particles.particleCount || 50;
    const triggerScroll = features?.particles.triggerScroll || true;

    useEffect(() => {
        if (!features?.particles.enabled) return;

        // Generate particles
        const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            color: [
                'bg-blue-400',
                'bg-purple-400', 
                'bg-emerald-400',
                'bg-pink-400',
                'bg-amber-400'
            ][Math.floor(Math.random() * 5)]
        }));

        setParticles(newParticles);
    }, [particleCount, features?.particles.enabled]);

    useEffect(() => {
        if (!triggerScroll || !containerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(containerRef.current);

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [triggerScroll]);

    // If not enabled, don't render
    if (!features?.particles.enabled) return null;

    // If scroll trigger is disabled, always show
    const shouldShow = !triggerScroll || isVisible;

    return (
        <div ref={containerRef} className="relative py-20">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-emerald-950/20" />
            
            {/* Content */}
            <div className="relative z-10 text-center px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={shouldShow ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Sparkles className="w-8 h-8 text-primary" />
                        <h2 className="text-3xl md:text-4xl font-black text-foreground">
                            Büyüleyici Deneyim
                        </h2>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Scroll-triggered animasyonlar ve interaktif partiküllerle ziyaretçilerinizi etkileyin.
                        Modern web teknolojileriyle unutulmaz bir kullanıcı deneyimi sunun.
                    </p>
                </motion.div>
            </div>

            {/* Particle Container */}
            <AnimatePresence>
                {shouldShow && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {particles.map((particle) => (
                            <motion.div
                                key={particle.id}
                                initial={{ 
                                    opacity: 0,
                                    scale: 0,
                                    x: `${particle.x}%`,
                                    y: `${particle.y}%`
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    x: [`${particle.x}%`, `${particle.x + (Math.random() - 0.5) * 20}%`],
                                    y: [`${particle.y}%`, `${particle.y - 20}%`]
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    duration: particle.duration,
                                    delay: particle.delay,
                                    repeat: triggerScroll ? Infinity : 0,
                                    repeatDelay: Math.random() * 3
                                }}
                                className={`absolute w-2 h-2 ${particle.color} rounded-full blur-sm`}
                                style={{
                                    width: `${particle.size}px`,
                                    height: `${particle.size}px`
                                }}
                            />
                        ))}

                        {/* Floating orbs */}
                        {Array.from({ length: 5 }, (_, i) => (
                            <motion.div
                                key={`orb-${i}`}
                                initial={{ 
                                    opacity: 0,
                                    scale: 0,
                                    x: `${20 + i * 15}%`,
                                    y: '80%'
                                }}
                                animate={{
                                    opacity: [0, 0.3, 0],
                                    scale: [0, 1, 0],
                                    y: ['80%', '20%', '80%']
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    duration: 8 + i * 2,
                                    delay: i * 0.5,
                                    repeat: triggerScroll ? Infinity : 0,
                                    repeatDelay: 2
                                }}
                                className={`absolute w-32 h-32 ${
                                    ['bg-blue-400', 'bg-purple-400', 'bg-emerald-400', 'bg-pink-400', 'bg-amber-400'][i]
                                } rounded-full blur-3xl`}
                            />
                        ))}

                        {/* Connection lines */}
                        <svg className="absolute inset-0 w-full h-full">
                            {particles.slice(0, 10).map((particle, i) => (
                                <motion.line
                                    key={`line-${i}`}
                                    x1={`${particle.x}%`}
                                    y1={`${particle.y}%`}
                                    x2={`${particles[i + 1]?.x || 50}%`}
                                    y2={`${particles[i + 1]?.y || 50}%`}
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    className="text-primary/20"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ 
                                        pathLength: [0, 1, 0],
                                        opacity: [0, 0.5, 0]
                                    }}
                                    exit={{ pathLength: 0, opacity: 0 }}
                                    transition={{
                                        duration: 3,
                                        delay: particle.delay,
                                        repeat: triggerScroll ? Infinity : 0,
                                        repeatDelay: 5
                                    }}
                                />
                            ))}
                        </svg>
                    </div>
                )}
            </AnimatePresence>

            {/* Performance indicator */}
            {shouldShow && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 right-4 z-20"
                >
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/10 backdrop-blur-xl rounded-full text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {particleCount} particles active
                    </div>
                </motion.div>
            )}
        </div>
    );
};
