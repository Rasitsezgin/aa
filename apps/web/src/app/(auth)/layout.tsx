"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Command, ShieldCheck } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#02040a] selection:bg-blue-500/30 overflow-hidden relative font-sans">

            {/* Left Panel: Branding & Visuals */}
            <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 overflow-hidden bg-[#02040a]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/auth-bg-3d.png"
                        alt="Background"
                        fill
                        sizes="50vw"
                        className="object-cover opacity-80 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#02040a]/80 via-[#02040a]/40 to-[#02040a]/80" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Logo */}
                    <Link href="/" className="inline-block group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                <Sparkles className="text-white" size={20} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">
                                Pazaryonetimi
                            </span>
                        </div>
                    </Link>

                    {/* Main Text */}
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tight mb-8">
                                Geleceğin <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ticaretine</span>
                                <br /> Yön Verin.
                            </h1>
                            <p className="text-lg text-slate-400 leading-relaxed font-medium max-w-md">
                                Yapay zeka destekli altyapımız ile tüm pazaryeri operasyonlarınızı tek bir merkezden, hatasız ve zahmetsizce yönetin.
                            </p>
                        </motion.div>

                        {/* Features Grid */}
                        <div className="mt-12 grid grid-cols-2 gap-6">
                            {[
                                {
                                    title: "AI Otonomasyon",
                                    desc: "Kendi kendine çalışan sistemler"
                                },
                                {
                                    title: "Merkezi Yönetim",
                                    desc: "Tüm pazaryerleri tek ekranda"
                                },
                                {
                                    title: "Gelişmiş Analitik",
                                    desc: "Veriye dayalı büyüme stratejileri"
                                }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + (i * 0.1) }}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                                >
                                    <h4 className="font-bold text-white text-sm mb-1">{feature.title}</h4>
                                    <p className="text-xs text-slate-400">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>© 2024 Pazaryonetimi Inc.</span>
                        <div className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>Istanbul, TR</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Auth Flow */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0B0F19] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-28 right-[-8rem] w-[26rem] h-[26rem] rounded-full bg-cyan-400/15 blur-[120px]" />
                    <div className="absolute -bottom-24 left-[-8rem] w-[24rem] h-[24rem] rounded-full bg-blue-500/15 blur-[120px]" />
                    <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] [background-size:22px_22px]" />
                </div>
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-6 absolute top-0 left-0 right-0 z-20">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Sparkles className="text-white" size={16} />
                        </div>
                        <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">
                            Pazaryonetimi
                        </span>
                    </Link>
                </div>

                <main className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10 w-full">
                    <div className="w-full max-w-[440px] relative">
                        {/* Decorative Background Blur */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/10 dark:bg-blue-500/15 blur-[110px] rounded-full pointer-events-none" />

                        <div className="relative rounded-[2rem] border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-[#0b1220]/80 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(15,23,42,0.4)] p-5 sm:p-7">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

