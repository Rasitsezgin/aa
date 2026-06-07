"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import Image from 'next/image';

// Types
type City = {
    name: string;
    cx: number;
    cy: number;
    delay: number;
    labelAlign: 'top' | 'bottom' | 'left' | 'right';
};

// Adjusted coordinates for the Raster Map Image
const CITIES: City[] = [
    { name: "NEW YORK", cx: 26, cy: 22, delay: 0, labelAlign: 'top' },
    { name: "LON", cx: 47, cy: 17, delay: 1, labelAlign: 'top' },
    { name: "BERLIN", cx: 51, cy: 16, delay: 1.5, labelAlign: 'top' },
    { name: "IST", cx: 55, cy: 20, delay: 0.5, labelAlign: 'bottom' },
    { name: "TOKYO", cx: 88, cy: 22, delay: 3, labelAlign: 'top' },
    { name: "LA", cx: 14, cy: 24, delay: 2, labelAlign: 'bottom' },
    { name: "SAO PAULO", cx: 31, cy: 43, delay: 4, labelAlign: 'bottom' },
    { name: "SYDNEY", cx: 91, cy: 47, delay: 5, labelAlign: 'top' },
    { name: "DUBAI", cx: 62, cy: 25, delay: 2.5, labelAlign: 'bottom' },
];

export default function GlobalMap() {
    const [activeCity, setActiveCity] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section className="py-12 md:py-24 relative overflow-hidden bg-[#FAFAF9] dark:bg-[#0B1120] flex items-center justify-center min-h-[400px] sm:min-h-[600px] md:min-h-[900px] transition-colors duration-500">
            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                {/* Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 blur-[200px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-8 sm:mb-12 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full mb-6 shadow-sm dark:shadow-none"
                    >
                        <Globe size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">Global Altyapı</span>
                    </motion.div>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 sm:mb-6 relative z-10 dark:drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Network</span>
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-xl font-medium max-w-2xl mx-auto">
                        Dünyanın her noktasına anlık erişim sağlayan altyapımız ile sınırları ortadan kaldırın.
                    </p>
                </div>

                {/* The Map Image Container */}
                <div className="relative w-full max-w-7xl mx-auto aspect-[16/10] md:aspect-[1.9/1] rounded-[16px] sm:rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20 group border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-xl">

                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 dark:from-white/5 to-transparent opacity-50 dark:opacity-10 pointer-events-none z-20" />

                    {/* Background Map Image */}
                    <div className="absolute inset-0">
                        {/* Light Mode Map (inverted/styled differently) */}
                        <Image
                            src="/images/dark_future_world_map.png"
                            alt="Global Map"
                            fill
                            className="w-full h-full object-cover opacity-40 dark:opacity-80 invert dark:invert-0 dark:mix-blend-screen"
                        />
                        {/* Vignette to blend edges */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,#0B1120_100%)]" />
                    </div>

                    {/* Interactive Shell/Overlay for Animations */}
                    <div className="absolute inset-0 z-10">
                        {/* SVG Overlay for Animations */}
                        {mounted && (
                            <svg viewBox="0 0 100 55" className="w-full h-full preserve-3d">
                                <defs>
                                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgba(96, 165, 250, 0)" />
                                        <stop offset="50%" stopColor="#60a5fa" />
                                        <stop offset="100%" stopColor="rgba(96, 165, 250, 0)" />
                                    </linearGradient>
                                    <linearGradient id="pathGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="rgba(37, 99, 235, 0)" />
                                        <stop offset="50%" stopColor="#2563eb" />
                                        <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="1" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                {/* Connections */}
                                <g filter="url(#glow)">
                                    {/* Major routes */}
                                    <Connection start={CITIES[0]} end={CITIES[1]} curvature={-5} /> {/* NY -> LON */}
                                    <Connection start={CITIES[1]} end={CITIES[2]} curvature={1} />  {/* LON -> BER */}
                                    <Connection start={CITIES[2]} end={CITIES[3]} curvature={2} />  {/* BER -> IST */}
                                    <Connection start={CITIES[3]} end={CITIES[8]} curvature={5} />  {/* IST -> DXB */}
                                    <Connection start={CITIES[8]} end={CITIES[4]} curvature={-10} /> {/* DXB -> TKY */}
                                    <Connection start={CITIES[0]} end={CITIES[5]} curvature={3} />  {/* NY -> LA */}
                                </g>

                                {/* City Markers */}
                                {CITIES.map((city, i) => (
                                    <g
                                        key={i}
                                        transform={`translate(${city.cx}, ${city.cy})`}
                                        className="cursor-pointer group"
                                        onMouseEnter={() => setActiveCity(city.name)}
                                        onMouseLeave={() => setActiveCity(null)}
                                    >
                                        {/* Pulse */}
                                        <motion.circle
                                            fill="none"
                                            stroke="#60a5fa"
                                            strokeWidth="0.1"
                                            initial={{ r: 0.5, opacity: 1 }}
                                            animate={{ r: 2.5, opacity: 0 }}
                                            transition={{ duration: 2, repeat: Infinity, delay: city.delay }}
                                        />

                                        {/* Core */}
                                        <circle r="0.6" className="fill-blue-600 dark:fill-white group-hover:fill-blue-400 transition-colors" filter="url(#glow)" />

                                        {/* Label (Hover) */}
                                        <AnimatePresence>
                                            {activeCity === city.name && (
                                                <motion.g
                                                    initial={{ opacity: 0, y: 1 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 0.5 }}
                                                >
                                                    <rect x="-6" y={city.labelAlign === 'top' ? -5 : 2} width="12" height="3" rx="1.5" className="fill-slate-900/90 dark:fill-slate-900/90" />
                                                    <text
                                                        y={city.labelAlign === 'top' ? -2.8 : 4.2}
                                                        className="text-[1.5px] fill-white font-bold select-none"
                                                        textAnchor="middle"
                                                        fontSize="1.5"
                                                    >
                                                        {city.name}
                                                    </text>
                                                </motion.g>
                                            )}
                                        </AnimatePresence>
                                    </g>
                                ))}
                            </svg>
                        )}
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-16 mt-8 sm:mt-12 md:mt-16">
                    {[
                        { label: "Canlı Veri Merkezi", value: "12" },
                        { label: "Günlük İşlem", value: "85M+" },
                        { label: "Uptime", value: "%99.9" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center group"
                        >
                            <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-1 sm:mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Connection({ start, end, curvature = 0 }: any) {
    if (!start || !end || !('cx' in start) || !('cx' in end)) {
        return null;
    }

    const midX = (start.cx + end.cx) / 2;
    const midY = (start.cy + end.cy) / 2 + curvature;
    const pathD = `M ${start.cx} ${start.cy} Q ${midX} ${midY} ${end.cx} ${end.cy}`;

    const config = useRef({
        duration: 3 + Math.abs(start.cx - end.cx) * 0.05,
        repeatDelay: Math.abs(start.cy - end.cy) * 0.02
    }).current;

    return (
        <motion.path
            d={pathD}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="0.2"
            strokeLinecap="round"
            strokeDasharray="1 100"
            animate={{ strokeDashoffset: [-101, 0] }}
            transition={{
                duration: config.duration,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: config.repeatDelay
            }}
        />
    )
}
