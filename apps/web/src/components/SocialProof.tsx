"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const brands = [
    { name: "Trendyol", logo: "/images/pazaryeri/Trendyol.png" },
    { name: "Hepsiburada", logo: "/images/pazaryeri/Hepsiburada.png" },
    { name: "Amazon", logo: "/images/pazaryeri/Amazon.png" },
    { name: "N11", logo: "/images/pazaryeri/N11.png" },
    { name: "Etsy", logo: "/images/pazaryeri/Etsy.png" },
    { name: "Shopify", logo: "/images/pazaryeri/Shopify.png" },
    { name: "Pazarama", logo: "/images/pazaryeri/Pazarama.png" },
    { name: "Çiçeksepeti", logo: "/images/pazaryeri/ciceksepeti.png" },
    { name: "TikTok Shop", logo: "/images/pazaryeri/tiktok-shop.png" },
    { name: "eBay", logo: "/images/pazaryeri/EBay.png" },
    { name: "Walmart", logo: "/images/pazaryeri/walmart.png" },
    { name: "WooCommerce", logo: "/images/pazaryeri/WooCommerce.png" },
    { name: "Magento", logo: "/images/pazaryeri/magento.png" },
    { name: "Ikas", logo: "/images/pazaryeri/ikas.png" },
    { name: "Ticimax", logo: "/images/pazaryeri/ticimax.webp" },
    { name: "Ideasoft", logo: "/images/pazaryeri/ideasoft-logo.webp" },
    { name: "BigCommerce", logo: "/images/pazaryeri/bigcommerce.webp" },
    { name: "OpenCart", logo: "/images/pazaryeri/opencart.webp" },
    { name: "PrestaShop", logo: "/images/pazaryeri/prestashop.webp" },
    { name: "Akinon", logo: "/images/pazaryeri/akinon.webp" },
    { name: "T-Soft", logo: "/images/pazaryeri/tsoft.webp" },
    { name: "PlatinMarket", logo: "/images/pazaryeri/platinmarketlogo.png" },
    { name: "Faprika", logo: "/images/pazaryeri/faprika.png" },
    { name: "Inveon", logo: "/images/pazaryeri/inveon.webp" },
    { name: "Facebook Marketplace", logo: "/images/pazaryeri/facebook-marketplace.png" },
    { name: "Instagram", logo: "/images/pazaryeri/Insta_Logo.webp" },
    { name: "Pinterest", logo: "/images/pazaryeri/pinterest.webp" },
    { name: "VTEX", logo: "/images/pazaryeri/VTEX_logo.png" },
    { name: "Salesforce", logo: "/images/pazaryeri/Salesforce.png" },
    { name: "Oracle Commerce", logo: "/images/pazaryeri/oracle-commerce-cloud.webp" },
    { name: "SAP Commerce", logo: "/images/pazaryeri/sap-commerce-cloud.webp" },
    { name: "Paraşüt", logo: "/images/muhasebe/parasut.png" },
    { name: "BirFatura", logo: "/images/muhasebe/birfatura.png" },
    { name: "Logo Yazılım", logo: "/images/muhasebe/logo.png" },
    { name: "EDM Bilişim", logo: "/images/muhasebe/edm.png" },
    { name: "Mikro Yazılım", logo: "/images/muhasebe/mikro.png" },
    { name: "Zirve Yazılım", logo: "/images/muhasebe/zirve.png" },
    { name: "Yurtiçi Kargo", logo: "/images/kargo/yurtici.png" },
    { name: "Aras Kargo", logo: "/images/kargo/aras.png" },
    { name: "MNG Kargo", logo: "/images/kargo/mng.png" },
    { name: "PTT Kargo", logo: "/images/kargo/ptt.png" },
];

const row1 = brands.slice(0, Math.ceil(brands.length / 2));
const row2 = brands.slice(Math.ceil(brands.length / 2));

export default function SocialProof() {
    return (
        <section className="py-10 sm:py-20 bg-white dark:bg-[#020617] overflow-hidden relative transition-colors duration-500">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 sm:mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-full mb-4 sm:mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className="text-[10px] sm:text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                            5.000+ İşletme Tarafından Güveniliyor
                        </p>
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                        Türkiye&apos;nin Lider <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">E-ticaret Platformları</span>
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance">
                        Tüm büyük pazaryerleri ve e-ticaret altyapıları ile tam entegre çalışıyoruz.
                        Satışlarınızı tek panelden yönetmenin özgürlüğünü yaşayın.
                    </p>
                </motion.div>

                {/* Mobile Static Grid with hover effects */}
                <div className="sm:hidden grid grid-cols-2 gap-3">
                    {brands.slice(0, 10).map((brand) => (
                        <motion.div
                            key={`mobile-${brand.name}`}
                            whileTap={{ scale: 0.95 }}
                            className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-100 dark:border-white/10 flex items-center justify-center min-h-[62px] active:bg-white dark:active:bg-white/10 transition-colors duration-200"
                        >
                            <Image
                                src={brand.logo}
                                alt={brand.name}
                                width={96}
                                height={28}
                                className="h-6 w-auto max-w-[112px] object-contain opacity-90"
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Logo Carousel Container */}
                <div className="relative hidden sm:flex flex-col gap-8 sm:gap-12 mask-linear-fade">
                    {/* Gradient Fades with enhanced blur */}
                    <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-white dark:from-[#020617] via-white/80 dark:via-[#020617]/80 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-white dark:from-[#020617] via-white/80 dark:via-[#020617]/80 to-transparent z-10 pointer-events-none" />

                    {/* Row 1: Left to Right */}
                    <motion.div 
                        className="flex overflow-hidden -rotate-1 hover:rotate-0 transition-transform duration-700"
                        whileHover={{ scale: 1.01 }}
                    >
                        <motion.div
                            className="flex min-w-full gap-8 sm:gap-16 pr-8 sm:pr-16 items-center"
                            animate={{ x: "-50%" }}
                            transition={{
                                duration: 40,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                        >
                            {[...row1, ...row1, ...row1].map((brand, i) => (
                                <BrandLogo key={`${brand.name}-1-${i}`} brand={brand} />
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Row 2: Right to Left */}
                    <motion.div 
                        className="flex overflow-hidden rotate-1 hover:rotate-0 transition-transform duration-700"
                        whileHover={{ scale: 1.01 }}
                    >
                        <motion.div
                            className="flex min-w-full gap-8 sm:gap-16 pr-8 sm:pr-16 items-center"
                            animate={{ x: "0%" }}
                            initial={{ x: "-50%" }}
                            transition={{
                                duration: 45,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                        >
                            {[...row2, ...row2, ...row2].map((brand, i) => (
                                <BrandLogo key={`${brand.name}-2-${i}`} brand={brand} />
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function BrandLogo({ brand }: { brand: { name: string; logo: string } }) {
    return (
        <div className="flex-shrink-0 group">
            <motion.div 
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-slate-200 dark:hover:border-white/10 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
            >
                <motion.div
                    whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                >
                    <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={120}
                        height={32}
                        className="h-6 sm:h-8 w-auto max-w-[100px] sm:max-w-[120px] object-contain transition-all duration-300 grayscale group-hover:grayscale-0 group-hover:scale-110 opacity-40 dark:opacity-70 group-hover:opacity-100 dark:group-hover:opacity-100"
                    />
                </motion.div>
                {/* Glow effect on hover */}
                <motion.div 
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-colors duration-300 pointer-events-none"
                />
            </motion.div>
        </div>
    );
}
