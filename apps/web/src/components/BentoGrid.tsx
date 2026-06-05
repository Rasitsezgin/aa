import { useRef, useState, useEffect } from 'react';
import { Bot, Zap, Package, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
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
            className={`relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl transition-colors duration-500 hover:border-orange-300 dark:hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:shadow-orange-900/20 group ${className}`}
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
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 border border-orange-100 dark:border-orange-500/20"
                    >
                        <Zap size={14} />
                        Temel Özellikler
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 tracking-tight text-slate-900 dark:text-white"
                    >
                        {texts.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-400">{texts.titleHighlight}</span>
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

                    {/* Card 1: Stok senkronizasyonu (Large) */}
                    <div className="md:col-span-2 md:row-span-2 h-full">
                        <SpotlightCard className="p-8 sm:p-12 h-full flex flex-col justify-between group bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-white/20">
                            <div className="space-y-6 sm:space-y-8 max-w-xl relative z-20">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-[1px] shadow-lg shadow-orange-500/20">
                                    <div className="w-full h-full rounded-[15px] bg-white dark:bg-[#0a0f1c] flex items-center justify-center relative overflow-hidden">
                                        <Zap size={32} className="text-orange-600 dark:text-orange-400 relative z-10" />
                                        <div className="absolute inset-0 bg-orange-500/10 dark:bg-orange-500/20 blur-xl" />
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

                            <div className="mt-10 sm:mt-16 relative h-[240px] sm:h-[280px] w-full bg-slate-50/50 dark:bg-[#0a0f1c]/50 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl group-hover:shadow-orange-500/10 transition-all">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                                <div className="absolute inset-0 flex items-center justify-center gap-8 px-8">
                                    {['Trendyol', 'Hepsiburada', 'Amazon'].map((name, i) => (
                                        <motion.div
                                            key={name}
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                                            className="flex flex-col items-center gap-2"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg flex items-center justify-center">
                                                <ShoppingBag size={22} className="text-orange-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500">{name}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    animate={{ left: ['10%', '90%', '10%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-1/2 left-[10%] w-10 h-10 -translate-y-1/2 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 z-20"
                                >
                                    <Zap size={18} />
                                </motion.div>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs font-mono text-slate-400 border-t border-slate-200/60 dark:border-white/5 pt-3">
                                    <span>STOCK_SYNC</span>
                                    <span className="text-orange-500 font-bold">200ms</span>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>

                    {/* Card 2: Sipariş & Kargo */}
                    <SpotlightCard className="p-8 flex flex-col justify-between group overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-2xl">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"
                        />

                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 shadow-lg shadow-orange-500/10">
                            <Package size={28} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{texts.cards[1].title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                {texts.cards[1].description}
                            </p>
                        </div>
                        <div className="mt-8 space-y-2">
                            {['Sipariş toplama', 'Etiket basımı', 'Kargo takibi'].map((step, i) => (
                                <div key={step} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                    <CheckCircle2 size={14} className="text-orange-500" />
                                    <span>{step}</span>
                                    {i < 2 && <ArrowRight size={12} className="text-slate-300 ml-auto" />}
                                </div>
                            ))}
                        </div>
                    </SpotlightCard>

                    {/* Card 3: AI SEO */}
                    <SpotlightCard className="p-8 flex flex-col justify-between group overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-2xl">
                        <motion.div
                            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-10 -bottom-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"
                        />

                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/10 dark:to-purple-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6 shadow-lg shadow-violet-500/10">
                            <Bot size={28} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{texts.cards[2].title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                {texts.cards[2].description}
                            </p>
                        </div>
                        <div className="mt-6 flex items-end gap-2 h-20">
                            {[35, 55, 45, 70, 90].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    whileInView={{ height: `${h}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.1 }}
                                    className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500 to-purple-400 opacity-80"
                                />
                            ))}
                        </div>
                    </SpotlightCard>

                </div>
            </div>
        </section>
    );
}
