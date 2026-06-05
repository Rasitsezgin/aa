'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Target, Play } from 'lucide-react';

interface Hero3DProps {
    features?: {
        hero3D?: {
            enabled: boolean;
            particleCount: number;
            waveIntensity: number;
            interactive: boolean;
        };
    };
}

export const Hero3D = ({ features }: Hero3DProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    // Motion values for smooth interactions
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { stiffness: 100, damping: 30 });
    const smoothY = useSpring(mouseY, { stiffness: 100, damping: 30 });

    const particleCount = features?.hero3D?.particleCount || 150;
    const waveIntensity = features?.hero3D?.waveIntensity || 0.5;
    const interactive = features?.hero3D?.interactive !== false;

    useEffect(() => {
        if (!canvasRef.current || !features?.hero3D?.enabled) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle system
        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            life: number;
            maxLife: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 3 + 1;
                this.color = [
                    'rgba(59, 130, 246, 0.6)',  // blue
                    'rgba(147, 51, 234, 0.6)',  // purple
                    'rgba(34, 197, 94, 0.6)',   // emerald
                    'rgba(251, 146, 60, 0.6)'   // orange
                ][Math.floor(Math.random() * 4)];
                this.life = 0;
                this.maxLife = Math.random() * 100 + 100;
            }

            update(mouseX: number, mouseY: number) {
                // Basic movement
                this.x += this.vx;
                this.y += this.vy;

                // Mouse interaction
                if (interactive) {
                    const dx = mouseX - this.x;
                    const dy = mouseY - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        const force = (100 - distance) / 100;
                        this.vx -= (dx / distance) * force * 0.5;
                        this.vy -= (dy / distance) * force * 0.5;
                    }
                }

                // Wave effect
                this.vy += Math.sin(Date.now() * 0.001 + this.x * 0.01) * waveIntensity * 0.1;

                // Damping
                this.vx *= 0.99;
                this.vy *= 0.99;

                // Boundaries
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Life cycle
                this.life++;
                if (this.life > this.maxLife) {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.life = 0;
                    this.maxLife = Math.random() * 100 + 100;
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                const opacity = 1 - (this.life / this.maxLife);
                ctx.globalAlpha = opacity * 0.6;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Glow effect
                ctx.globalAlpha = opacity * 0.2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create particles
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        let animationId: number;
        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            ctx.globalAlpha = 0.1;
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.lineWidth = 1;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.globalAlpha = (1 - distance / 100) * 0.2;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Update and draw particles
            particles.forEach(particle => {
                particle.update(mousePosition.x, mousePosition.y);
                particle.draw(ctx);
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();
        setIsLoaded(true);

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeCanvas);
            if (interactive) {
                window.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [particleCount, waveIntensity, interactive, mouseX, mouseY, features?.hero3D?.enabled]);

    if (!features?.hero3D?.enabled) return null;

    return (
        <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-black">
            {/* 3D Canvas Background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ mixBlendMode: 'screen' }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-center max-w-6xl mx-auto"
                >
                    {/* Floating Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 rounded-full mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-bold text-white">AI-Powered E-commerce Revolution</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 bg-clip-text text-transparent">
                            Pazaryonetimi
                        </span>
                        <br />
                        <span className="text-4xl md:text-6xl lg:text-7xl text-white/90">
                            AI Destekli
                        </span>
                        <br />
                        <span className="text-3xl md:text-5xl lg:text-6xl text-white/70">
                            E-ticaret Devrimi
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                        className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        Trendyol, Hepsiburada, Amazon, N11, Çiçeksepeti — tüm pazaryerlerinizi 
                        <span className="text-transparent bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text font-bold">
                            {' '}tek platformdan{' '}
                        </span>
                        yönetin. AI destekli stok senkronizasyonu, akıllı fiyatlandırma ve satış tahminleri.
                    </motion.p>

                    {/* Interactive CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-orange-500/25 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center gap-3">
                                <Zap className="w-5 h-5" />
                                <span>14 Gün Ücretsiz Dene</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-2xl transition-all hover:bg-white/20"
                        >
                            <div className="flex items-center gap-3">
                                <Play className="w-5 h-5" />
                                <span>Demo İzle</span>
                            </div>
                        </motion.button>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-8 justify-center items-center text-white/60"
                    >
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-400" />
                            <span className="text-sm">1,247+ Aktif Satıcı</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-400 rounded-full" />
                            <span className="text-sm">₺50M+ İşlem Hacmi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple-400 rounded-full" />
                            <span className="text-sm">99.9% Uptime</span>
                        </div>
                    </motion.div>

                    {/* Interactive Mouse Follower */}
                    {interactive && (
                        <motion.div
                            style={{
                                x: smoothX,
                                y: smoothY,
                                translateX: "-50%",
                                translateY: "-50%"
                            }}
                            className="pointer-events-none fixed z-50 hidden lg:block"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-purple-500 rounded-full opacity-50 blur-xl" />
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Loading State */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
                    />
                </div>
            )}
        </div>
    );
};
