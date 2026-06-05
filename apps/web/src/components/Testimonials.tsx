"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HOMEPAGE_TESTIMONIALS, type HomepageTestimonial } from '@/config/homepage-testimonials';

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<HomepageTestimonial[]>(HOMEPAGE_TESTIMONIALS);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch('/api/testimonials');
                if (!res.ok) throw new Error('Testimonials verisi alınamadı');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setTestimonials(data);
                }
            } catch (error) {
                console.error("Testimonials fetch error:", error);
            }
        };

        fetchTestimonials();
    }, []);

    const row1 = useMemo(
        () => [...testimonials, ...testimonials, ...testimonials],
        [testimonials],
    );
    const row2 = useMemo(() => {
        const reversed = [...testimonials].reverse();
        return [...reversed, ...reversed, ...reversed];
    }, [testimonials]);

    return (
        <section className="py-20 sm:py-32 relative overflow-hidden bg-white dark:bg-[#0F172A] transition-colors duration-500">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16 sm:mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 mb-6"
                    >
                        <Star size={14} className="text-orange-600 dark:text-orange-400 fill-current" />
                        <span className="text-[11px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-widest">Satıcı Yorumları</span>
                    </motion.div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                        Operasyonu Kolaylaştıran <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-400">
                            Gerçek Hikayeler
                        </span>
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Çok kanallı satış yapan işletmeler stok, sipariş ve kargo süreçlerini
                        nasıl tek panele taşıdıklarını anlatıyor.
                    </p>
                    <Link
                        href="/basari-hikayeleri"
                        className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                        Tüm başarı hikayelerini gör
                    </Link>
                </div>

                <div className="relative w-full -mx-4 sm:mx-0">
                    <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-white dark:from-[#0F172A] via-white/80 dark:via-[#0F172A]/80 to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-white dark:from-[#0F172A] via-white/80 dark:via-[#0F172A]/80 to-transparent z-20 pointer-events-none" />

                    <motion.div
                        className="flex gap-6 sm:gap-8 w-max mb-6 sm:mb-8"
                        animate={{ x: [0, -2000] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
                    >
                        {row1.map((t, i) => (
                            <TestimonialCard key={`row1-${t.id}-${i}`} data={t} />
                        ))}
                    </motion.div>

                    <motion.div
                        className="flex gap-6 sm:gap-8 w-max"
                        animate={{ x: [-2000, 0] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 70 }}
                    >
                        {row2.map((t, i) => (
                            <TestimonialCard key={`row2-${t.id}-${i}`} data={t} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function TestimonialCard({ data }: { data: HomepageTestimonial }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.3 }}
            className="relative group w-[300px] sm:w-[380px] p-8 rounded-[28px] bg-white dark:bg-white/[0.03] backdrop-blur-xl border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none"
        >
            <Quote size={40} className="absolute top-8 right-8 text-orange-100 dark:text-orange-500/20" fill="currentColor" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            className={i < data.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
                        />
                    ))}
                </div>

                {data.marketplace && (
                    <span className="inline-flex self-start mb-3 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/10 text-[10px] font-bold text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-500/20">
                        {data.marketplace}
                    </span>
                )}

                <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium mb-8 line-clamp-5">
                    &ldquo;{data.content}&rdquo;
                </p>

                <div className="mt-auto flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-[2px] shadow-lg shadow-orange-500/20">
                        <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                            {data.avatarUrl ? (
                                <Image src={data.avatarUrl} alt={data.name} fill className="object-cover" />
                            ) : (
                                <span className="font-bold text-orange-600 dark:text-orange-400 text-lg">{data.name.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{data.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{data.title}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
