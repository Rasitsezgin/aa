"use client";

import React, { useEffect, useState } from 'react';
import { Star, Quote, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Testimonial {
    id: string;
    name: string;
    title: string | null;
    content: string;
    rating: number;
    avatarUrl: string | null;
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch('/api/testimonials');
                if (!res.ok) throw new Error('Testimonials verisi alınamadı');
                const data = await res.json();
                setTestimonials(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Testimonials fetch error:", error);
                setTestimonials([]);
            }
        };

        fetchTestimonials();
    }, []);

    const marqueeTestimonials = [...testimonials, ...testimonials, ...testimonials];

    return (
        <section className="py-20 sm:py-32 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent dark:from-indigo-900/10" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16 sm:mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-6"
                    >
                        <Star size={14} className="text-indigo-600 dark:text-indigo-400 fill-current" />
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Başarı Hikayeleri</span>
                    </motion.div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                        Binlerce Mutlu <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                            E-ticaret Mağazası
                        </span>
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Pazaryeri yönetiminde devrim yaratan teknolojimizle tanışın.
                        İşletmelerini büyüten girişimcilerin gerçek hikayeleri.
                    </p>
                </div>

                {/* Marquee Container */}
                <div className="relative w-full -mx-4 sm:mx-0">
                    <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-white dark:from-[#02040a] via-white/80 dark:via-[#02040a]/80 to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-white dark:from-[#02040a] via-white/80 dark:via-[#02040a]/80 to-transparent z-20 pointer-events-none" />

                    {/* Top Row - Right to Left */}
                    <motion.div
                        className="flex gap-6 sm:gap-8 w-max mb-6 sm:mb-8"
                        animate={{ x: [0, -2000] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 60,
                        }}
                        whileHover={{ animationPlayState: 'paused' }}
                    >
                        {marqueeTestimonials.map((t, i) => (
                            <TestimonialCard key={`row1-${i}`} data={t} index={i} />
                        ))}
                    </motion.div>

                    {/* Bottom Row - Left to Right (slower) */}
                    <motion.div
                        className="flex gap-6 sm:gap-8 w-max"
                        animate={{ x: [-2000, 0] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 70,
                        }}
                        whileHover={{ animationPlayState: 'paused' }}
                    >
                        {marqueeTestimonials.reverse().map((t, i) => (
                            <TestimonialCard key={`row2-${i}`} data={t} index={i} variant="alt" />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ data, index, variant = 'default' }: { data: Testimonial; index: number; variant?: 'default' | 'alt' }) {
    return (
        <motion.div 
            whileHover={{ scale: 1.03, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative group w-[300px] sm:w-[380px] p-8 rounded-[32px] bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
            {/* Glass Effect Gradient Overlay */}
            <motion.div 
                className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/50 to-transparent dark:from-white/[0.08] dark:to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.05) 50%, transparent 100%)'
                }}
            />

            {/* Animated Quote Icon */}
            <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 right-8 text-indigo-100 dark:text-indigo-500/20 group-hover:text-indigo-200 dark:group-hover:text-indigo-500/40 transition-colors"
            >
                <Quote size={48} fill="currentColor" />
            </motion.div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Rating with hover animation */}
                <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.3, rotate: 15 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Star
                                size={16}
                                className={`${i < data.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                            />
                        </motion.div>
                    ))}
                </div>

                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium mb-8 line-clamp-4">
                    "{data.content}"
                </p>

                <div className="mt-auto flex items-center gap-4">
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg shadow-blue-500/20"
                    >
                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                            {data.avatarUrl ? (
                                <Image src={data.avatarUrl} alt={data.name} fill className="object-cover" />
                            ) : (
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{data.name.charAt(0)}</span>
                            )}
                        </div>
                    </motion.div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{data.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                            {data.title || 'Onaylı Mağaza'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
