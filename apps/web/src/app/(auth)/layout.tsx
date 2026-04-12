"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Command, ShieldCheck, Zap, Award, Star, Globe2, BarChart3, ChevronRight, Activity, Users, Shield } from 'lucide-react';

const testimonials = [
    {
        quote: "Satışlarımızı %340 artırdık. Pazaryonetimi olmadan bu mümkün olmazdı.",
        name: "Ahmet Yılmaz",
        role: "CEO, TechnoMarket",
        rating: 5,
    },
    {
        quote: "Tüm pazaryeri operasyonlarımızı tek panelden yönetiyoruz. Muhteşem bir deneyim.",
        name: "Elif Kaya",
        role: "E-Ticaret Direktörü, ModaHane",
        rating: 5,
    },
    {
        quote: "AI destekli fiyatlandırma ile rakiplerimizin bir adım önündeyiz.",
        name: "Mehmet Demir",
        role: "COO, Elektro Plus",
        rating: 5,
    },
];

const stats = [
    { value: "15K+", label: "Aktif Mağaza", icon: <Globe2 className="w-4 h-4" /> },
    { value: "%99.9", label: "Uptime", icon: <Activity className="w-4 h-4" /> },
    { value: "2M+", label: "İşlem", icon: <BarChart3 className="w-4 h-4" /> },
];

// Particle Component for branding panel
const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        opacity: 0,
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{
                        opacity: [0, 0.3, 0],
                        y: [null, "-20%"],
                        x: [null, `${(Math.random() - 0.5) * 10}%`]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 10
                    }}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
                />
            ))}
        </div>
    );
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parallax motion values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

    // Background parallax transformations
    const bgX = useTransform(springX, [-500, 500], [20, -20]);
    const bgY = useTransform(springY, [-500, 500], [20, -20]);
    const orb1X = useTransform(springX, [-500, 500], [40, -40]);
    const orb2X = useTransform(springX, [-500, 500], [-30, 30]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 6000);

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const { innerWidth, innerHeight } = window;
            mouseX.set(e.clientX - innerWidth / 2);
            mouseY.set(e.clientY - innerHeight / 2);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            clearInterval(interval);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [mouseX, mouseY]);

    return (
        <div
            ref={containerRef}
            className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#FDFDFD] dark:bg-[#030712] selection:bg-blue-600/20 overflow-hidden relative font-sans"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.02),transparent)] pointer-events-none" />

            {/* Left Panel: Branding & Visuals (The Polished Carousel) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative flex-col overflow-hidden bg-[#020617] p-10 xl:p-14">

                {/* Visual Background Layer with Parallax */}
                <motion.div
                    style={{ x: bgX, y: bgY }}
                    className="absolute inset-[-10%] z-0"
                >
                    <Image
                        src="/images/auth-bg-3d.png"
                        alt="Background"
                        fill
                        className="object-cover opacity-30 scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617]/80 to-blue-950/30" />
                </motion.div>

                {/* Animated Gradient Orbs with Parallax */}
                <motion.div
                    style={{ x: orb1X }}
                    className="absolute top-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.08] blur-[120px] pointer-events-none"
                />
                <motion.div
                    style={{ x: orb2X }}
                    className="absolute bottom-[5%] right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-600/[0.05] blur-[100px] pointer-events-none"
                />

                <FloatingParticles />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Header: Logo */}
                    <Link href="/" className="inline-block group w-fit">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 relative overflow-hidden">
                                <Sparkles className="text-white relative z-10" size={24} />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black tracking-tighter text-white leading-none">PAZARYONETIMI</span>
                                <span className="text-[10px] font-bold tracking-[0.3em] text-blue-400 uppercase mt-1">Enterprise AI Systems</span>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Main Content Area */}
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="mb-12"
                        >
                            <h1 className="text-5xl xl:text-7xl font-black text-white tracking-tighter leading-[0.85] mb-8">
                                Ticaretin <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Yeni Nesil</span>
                                <br /> Mimarisi.
                            </h1>
                            <p className="text-lg text-slate-400/90 leading-relaxed font-medium max-w-md border-l-2 border-blue-500/20 pl-6 py-1">
                                Yapay zeka ile optimize edilmiş, otonom yönetim ekosistemi ile global ölçekte operasyonlarınızı kusursuzlaştırın.
                            </p>
                        </motion.div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-4 mb-14">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md hover:bg-white/[0.05] transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <div className="text-lg font-black text-white leading-none">{stat.value}</div>
                                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Testimonial Section (The Carousel) */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentTestimonial}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] backdrop-blur-xl relative overflow-hidden"
                                >
                                    {/* Quote Icon Background */}
                                    <div className="absolute -top-10 -right-10 opacity-[0.03] text-white">
                                        <Star size={200} fill="currentColor" />
                                    </div>

                                    <div className="flex gap-1 mb-5">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                                    </div>
                                    <blockquote className="text-xl font-bold text-white/90 leading-relaxed mb-6 italic tracking-tight">
                                        "{testimonials[currentTestimonial].quote}"
                                    </blockquote>

                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs">
                                            {testimonials[currentTestimonial].name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white tracking-wide">{testimonials[currentTestimonial].name}</div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{testimonials[currentTestimonial].role}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Dots */}
                            <div className="flex gap-2 mt-6 ml-1">
                                {testimonials.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentTestimonial(i)}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${i === currentTestimonial ? 'w-8 bg-blue-500' : 'w-2 bg-white/10 hover:bg-white/20'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise ISO Certified</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Systems Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Flow (Refined Form Container) */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-[#030712] overflow-hidden min-h-screen min-h-[100dvh]">
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{
                            x: [0, 20, -10, 0],
                            y: [0, -10, 20, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/[0.04] blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            x: [0, -20, 10, 0],
                            y: [0, 10, -20, 0],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/[0.03] blur-[120px]"
                    />
                    <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] [background-image:linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none" />
                </div>

                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-6 relative z-20 shrink-0 border-b border-slate-100 dark:border-white/5">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">PAZARYONETIMI</span>
                    </Link>
                </div>

                <main className="flex-1 flex items-center justify-center px-6 sm:px-12 xl:px-24 py-12 relative z-10 w-full overflow-y-auto">
                    <div className="w-full max-w-[520px] relative">
                        {/* Subtle atmospheric glow behind the card */}
                        <div className="absolute -inset-10 bg-blue-500/[0.03] blur-[80px] rounded-full pointer-events-none" />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Inner Glow Border */}
                            <div className="absolute -inset-[1px] rounded-[2.5rem] bg-gradient-to-b from-blue-500/10 via-white/5 to-indigo-500/5 dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none" />

                            {/* The Form Card */}
                            <div className="relative rounded-[2.5rem] border border-slate-200/60 dark:border-white/[0.06] bg-white dark:bg-[#0b1220]/50 backdrop-blur-3xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] p-8 sm:p-14">
                                {children}
                            </div>
                        </motion.div>

                        {/* Social Verification Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-col items-center gap-5 mt-10"
                        >
                            <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex-wrap justify-center">
                                <div className="flex items-center gap-1.5">
                                    <Shield size={12} className="text-emerald-500/60" />
                                    <span>256-bit AES</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                                <span className="hover:text-blue-500 transition-colors cursor-default">SOC 2 TYPE II</span>
                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
                                <span className="hover:text-blue-500 transition-colors cursor-default">GDPR READY</span>
                            </div>

                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                <Users className="w-3.5 h-3.5 text-blue-500/70" />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">12.4k+ Kuruluş Tarafından Kullanılıyor</span>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}
