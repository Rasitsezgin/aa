import { useRef, useState, useEffect } from 'react';
import { Bot, Zap, Globe, ArrowRight, CheckCircle2, ShoppingBag, BarChart3, TrendingUp, Search, Code2 } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion';

// Combined 3D Tilt + Spotlight Component (Enhanced)
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Spotlight Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Tilt Values (driven by drag)
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [12, -12]); // Slightly reduced for smoother feel
    const rotateY = useTransform(x, [-100, 100], [-12, 12]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <motion.div
            ref={divRef}
            style={{ x, y, rotateX, rotateY, z: 100, perspective: 1000 }}
            drag
            dragElastic={0.16}
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            whileTap={{ cursor: "grabbing", scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={`relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl transition-colors duration-500 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20 group ${className}`}
        >
            {/* Spotlight Gradient (Enhanced with larger radius) */}
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 z-10"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                          800px circle at ${mouseX}px ${mouseY}px,
                          rgba(59, 130, 246, 0.18),
                          rgba(139, 92, 246, 0.08),
                          transparent 80%
                        )
                      `,
                }}
            />

            {/* Animated border glow on hover */}
            <motion.div 
                className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 50%, rgba(236,72,153,0.1) 100%)',
                }}
            />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

            <div className="relative h-full z-20 pointer-events-auto">{children}</div>
        </motion.div>
    );
};

import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

export default function BentoGrid({ texts = HOMEPAGE_TEXTS.bento }: { texts?: typeof HOMEPAGE_TEXTS.bento }) {
    return (
        <section className="py-20 sm:py-32 relative overflow-hidden transition-colors duration-500">
            {/* Note: Background is now handled globally in page.tsx */}

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16 sm:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 dark:border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                        <Zap size={14} />
                        Süper Güçleriniz
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 tracking-tight text-slate-900 dark:text-white"
                    >
                        {texts.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">{texts.titleHighlight}</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        {texts.subtitle}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 lg:gap-8 max-w-7xl mx-auto h-auto md:h-[900px]">

                    {/* Card 1: Main AI Feature (Large) */}
                    <div className="md:col-span-2 md:row-span-2 h-full">
                        <SpotlightCard className="p-8 sm:p-12 h-full flex flex-col justify-between group bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-white/20">
                            {/* Decorative Code Snippets */}
                            <div className="absolute top-10 right-10 opacity-20 dark:opacity-40 pointer-events-none hidden lg:block">
                                <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 space-y-1">
                                    <div>const analyze = async (product) ={'>'} {'{'}</div>
                                    <div className="pl-4">await ai.optimize(product.seo);</div>
                                    <div className="pl-4">return {'{'} rank: 'top-10' {'}'};</div>
                                    <div>{'}'}</div>
                                </div>
                            </div>

                            <div className="space-y-6 sm:space-y-8 max-w-xl relative z-20">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] shadow-lg shadow-blue-500/20">
                                    <div className="w-full h-full rounded-[15px] bg-white dark:bg-[#0a0f1c] flex items-center justify-center relative overflow-hidden">
                                        <Bot size={32} className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 relative z-10" />
                                        <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 blur-xl" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">{texts.cards[0].title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg sm:text-xl leading-relaxed">
                                        {texts.cards[0].description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {(texts.cards[0].features || []).map((feat, i) => (
                                        <div key={i} className="px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 shadow-sm">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ultra-Rich Visualization */}
                            <div className="mt-10 sm:mt-16 relative h-[240px] sm:h-[320px] w-full bg-slate-50/50 dark:bg-[#0a0f1c]/50 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl group-hover:shadow-blue-500/10 transition-all">
                                {/* Grid Background */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                                {/* Floating Elements */}
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-10 right-10 z-20"
                                >
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400">Tahmini Ciro</div>
                                            <div className="text-lg font-black text-slate-900 dark:text-white">+₺45.2K</div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-10 left-10 z-20"
                                >
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Search size={16} />
                                        </div>
                                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            "kablosuz kulaklık" <span className="text-green-500 font-bold">#1. Sıra</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Central Scanner */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-80 h-48 bg-white dark:bg-[#161b2c] rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-2xl flex flex-col gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                                <div className="h-3 w-1/2 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                                                <div className="h-3 w-5/6 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
                                            </div>
                                        </div>
                                        {/* Scanner Beam */}
                                        <motion.div
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)] z-30 opacity-80"
                                        />
                                        <div className="mt-auto flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                                            <span className="text-xs font-mono text-slate-400">AI_ANALYSIS_V2.0</span>
                                            <span className="text-xs font-bold text-green-500">OPTIMIZED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>

                    {/* Card 2: Instant Sync (Enhanced) */}
                    <SpotlightCard className="p-8 flex flex-col justify-between group overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-2xl">
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"
                        />

                        <motion.div 
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5 }}
                            className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 shadow-lg shadow-orange-500/10"
                        >
                            <Zap size={28} />
                        </motion.div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{texts.cards[1].title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                {texts.cards[1].description}
                            </p>
                        </div>
                        {/* Network Pulse Animation (Enhanced) */}
                        <div className="mt-10 relative h-24 flex items-center justify-center gap-6">
                            {['amazon.png', 'trendyol.png', 'hepsiburada.png'].map((logo, i) => (
                                <motion.div 
                                    key={i} 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                                    className="relative z-10 w-12 h-12 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                                    {/* Enhanced Ripple */}
                                    <motion.div 
                                        className="absolute inset-0 rounded-full border border-orange-500/30"
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                    />
                                </motion.div>
                            ))}
                            {/* Connection Lines with enhanced animation */}
                            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-100 dark:bg-white/5 -z-0">
                                <motion.div
                                    animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                />
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* Card 3: Global Sales (Enhanced) */}
                    <SpotlightCard className="p-8 flex flex-col justify-between group overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-2xl">
                        <motion.div 
                            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
                        />

                        <motion.div 
                            whileHover={{ rotate: [0, 10, -10, 10, 0] }}
                            transition={{ duration: 0.5 }}
                            className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/10 dark:to-pink-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 shadow-lg shadow-purple-500/10"
                        >
                            <Globe size={28} />
                        </motion.div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{texts.cards[2].title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                {texts.cards[2].description}
                            </p>
                        </div>
                        {/* 3D Globe Visual with Currencies (Enhanced) */}
                        <div className="mt-6 flex justify-center relative h-32">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="relative w-28 h-28 rounded-full border border-purple-200 dark:border-purple-500/20 flex items-center justify-center bg-purple-50/50 dark:bg-purple-900/10 backdrop-blur-sm shadow-xl"
                            >
                                <motion.div 
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-t border-purple-500/50"
                                />
                                <div className="text-[10px] font-black tracking-widest text-purple-600 dark:text-purple-300">GLOBAL</div>

                                {/* Orbiting Currencies with enhanced animation */}
                                {[
                                    { s: '$', color: 'text-green-500', d: 0 },
                                    { s: '€', color: 'text-blue-500', d: 2 },
                                    { s: '£', color: 'text-indigo-500', d: 4 },
                                ].map((curr, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: curr.d }}
                                        className="absolute inset-0"
                                    >
                                        <motion.div 
                                            whileHover={{ scale: 1.3 }}
                                            className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center font-bold text-xs ${curr.color}`}
                                        >
                                            {curr.s}
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </SpotlightCard>

                </div>
            </div>
        </section>
    );
}
