"use client";

import React, { useEffect } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'lucide-react';
import Image from 'next/image';

const ORBITS = [
    {
        radius: 300,
        duration: 80,
        items: [
            { name: "Trendyol", logo: "/images/pazaryeri/Trendyol.png" },
            { name: "Hepsiburada", logo: "/images/pazaryeri/Hepsiburada.png" },
            { name: "Amazon", logo: "/images/pazaryeri/Amazon.png" },
            { name: "N11", logo: "/images/pazaryeri/N11.png" },
            { name: "Çiçeksepeti", logo: "/images/pazaryeri/ciceksepeti.png" },
            { name: "Etsy", logo: "/images/pazaryeri/Etsy.png" },
        ]
    },
    {
        radius: 460,
        duration: 120,
        items: [
            { name: "Shopify", logo: "/images/pazaryeri/Shopify.png" },
            { name: "WooCommerce", logo: "/images/pazaryeri/WooCommerce.png" },
            { name: "Ideasoft", logo: "/images/pazaryeri/ideasoft-logo.webp" },
            { name: "Ticimax", logo: "/images/pazaryeri/ticimax.webp" },
            { name: "Ikas", logo: "/images/pazaryeri/ikas.png" },
            { name: "T-Soft", logo: "/images/pazaryeri/tsoft.webp" },
            { name: "Opencart", logo: "/images/pazaryeri/opencart.webp" },
            { name: "Magento", logo: "/images/pazaryeri/magento.png" },
        ]
    },
    {
        radius: 640,
        duration: 160,
        items: [
            { name: "TikTok", logo: "/images/pazaryeri/tiktok-shop.png" },
            { name: "Instagram", logo: "/images/pazaryeri/Insta_Logo.webp" },
            { name: "Pinterest", logo: "/images/pazaryeri/pinterest.webp" },
            { name: "eBay", logo: "/images/pazaryeri/EBay.png" },
            { name: "Walmart", logo: "/images/pazaryeri/walmart.png" },
            { name: "AliExpress", logo: "/images/pazaryeri/akinon.webp" },
            { name: "Inveon", logo: "/images/pazaryeri/inveon.webp" },
            { name: "PlatinMarket", logo: "/images/pazaryeri/platinmarketlogo.png" },
            { name: "BigCommerce", logo: "/images/pazaryeri/bigcommerce.webp" },
            { name: "PrestaShop", logo: "/images/pazaryeri/prestashop.webp" },
        ]
    }
];

// ... imports

export default function EcosystemCloud() {
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="py-14 md:py-32 relative overflow-hidden bg-[#FAFAF9] dark:bg-[#0B1120] min-h-[350px] sm:min-h-[500px] md:min-h-[900px] flex flex-col items-center justify-center transition-colors duration-500">
            {/* Unified Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Subtle Dot Grid */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                {/* Ambient Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-orange-500/5 dark:bg-orange-500/10 blur-[200px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-500/5 dark:bg-orange-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 text-center mb-6 sm:mb-12 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100/50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/30 rounded-full mb-8"
                >
                    <Link size={14} className="text-orange-600 dark:text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">ECOSYSTEM GALAXY</span>
                </motion.div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 sm:mb-6">
                    Merkezi <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-500">Çekim Gücü.</span>
                </h2>
            </div>

            {/* Solar System Container - Pure 2D calculation */}
            <div className="w-full flex items-center justify-center overflow-visible perspective-[1000px]">
                <div className="relative flex-shrink-0 flex items-center justify-center w-[1200px] h-[600px] origin-center transform-gpu scale-[0.3] xs:scale-[0.35] sm:scale-[0.5] md:scale-[0.75] lg:scale-100">

                    {/* Visual Orbit Rings */}
                    {ORBITS.map((orbit, i) => (
                        <div
                            key={`ring-${i}`}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/30 dark:border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.02)_inset] dark:shadow-[0_0_30px_rgba(255,255,255,0.02)_inset]"
                            style={{
                                width: orbit.radius * 2,
                                height: orbit.radius * 2 * 0.4, // Squashed height for perspective illusion
                            }}
                        />
                    ))}

                    {/* Central Sun/Core */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-32 h-32 rounded-full flex items-center justify-center">
                        {/* Core Glow */}
                        <div className="absolute inset-0 rounded-full bg-orange-500/20 dark:bg-orange-600 blur-[80px] dark:opacity-60 animate-pulse" />

                        {/* Main Circle */}
                        <div className="relative z-10 w-full h-full bg-white rounded-full flex items-center justify-center border-[6px] border-slate-100 dark:border-white/20 shadow-[0_0_50px_rgba(234,88,12,0.3)] dark:shadow-[0_0_50px_rgba(234,88,12,0.6)]">
                            <div className="w-24 h-24 bg-[#FAFAF9] dark:bg-[#0B1120] rounded-full flex items-center justify-center border border-slate-200 dark:border-white/10">
                                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">P</span>
                            </div>
                        </div>

                        {/* Orbital Ripples */}
                        <div className="absolute inset-0 border border-orange-500/30 rounded-full animate-ping [animation-duration:3s]" />
                    </div>

                    {/* Planets using Trigonometry - Client Side Only */}
                    {mounted && ORBITS.map((orbit, orbitIndex) => (
                        <React.Fragment key={`orbit-group-${orbitIndex}`}>
                            {orbit.items.map((item, i) => {
                                const startAngle = (i / orbit.items.length) * 360;
                                // Alternate direction for variety
                                const direction = orbitIndex % 2 === 0 ? 1 : -1;

                                return (
                                    <Planet
                                        key={i}
                                        item={item}
                                        radius={orbit.radius}
                                        startAngle={startAngle}
                                        duration={orbit.duration}
                                        direction={direction}
                                    />
                                )
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Vignette - Adjusted Z-index to allow front planets to pop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#f8fafc_80%)] dark:bg-[radial-gradient(circle_at_center,transparent_30%,#0B1120_80%)] pointer-events-none z-30 transition-colors duration-500" />
        </section>
    );
}

function Planet({ item, radius, startAngle, duration, direction }: any) {
    const angle = useMotionValue(startAngle);

    // Animate angle from startAngle to startAngle + 360 (or -360) infinitely
    useEffect(() => {
        const controls = animate(angle, angle.get() + (360 * direction), {
            duration: duration,
            ease: "linear",
            repeat: Infinity
        });

        return () => controls.stop();
    }, [angle, duration, direction]);

    // Calculate Position based on angle
    const x = useTransform(angle, (a) => radius * Math.cos((a * Math.PI) / 180));
    const y = useTransform(angle, (a) => (radius * 0.4) * Math.sin((a * Math.PI) / 180)); // 0.4 squashes Y for pseudo-3D

    // Calculate Scale and ZIndex based on Y position (sin(a))
    // sin(a) is 1 at bottom (front), -1 at top (back)
    const scale = useTransform(angle, (a) => {
        const sin = Math.sin((a * Math.PI) / 180); // -1 to 1
        return 0.8 + (sin + 1) * 0.2; // roughly 0.8 to 1.2
    });

    const zIndex = useTransform(angle, (a) => {
        const sin = Math.sin((a * Math.PI) / 180);
        return sin > 0 ? 50 : 20; // Front vs Back z-index (Front > Vignette z-30 > Back)
    });

    // We also want to dim items in the back
    const opacity = useTransform(angle, (a) => {
        const sin = Math.sin((a * Math.PI) / 180);
        return 0.5 + (sin + 1) * 0.25; // 0.5 to 1.0
    });

    return (
        <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-2 border-slate-200 dark:border-white/50 cursor-pointer group"
            style={{
                x,
                y,
                scale,
                zIndex,
                opacity
            }}
            whileHover={{ scale: 1.5, zIndex: 50, opacity: 1 }}
        >
            {/* Planet Body */}
            <div className="relative w-full h-full z-10">
                <Image
                    src={item.logo}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    unoptimized
                />
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.2)] rounded-full pointer-events-none" />

            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20 backdrop-blur-md whitespace-nowrap shadow-xl pointer-events-none">
                {item.name}
            </div>
        </motion.div>
    )
}
