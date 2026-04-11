"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowRight, Moon, Sun, Menu, X, ChevronDown, ChevronRight,
    Zap, BarChart3, Package, Users, Globe, Shield, Layers, Cpu,
    BookOpen, Video, Calendar, Award, FileText, HelpCircle, GraduationCap,
    Building2, Newspaper, Briefcase, Gift, MessageCircle, Heart, Target,
    ShoppingBag, Store, Boxes, TrendingUp, PieChart, ClipboardList,
    Truck, CreditCard, Bell, Settings, Sparkles, Play, ArrowUpRight,
    ExternalLink, Rocket, Star, Hexagon, Brain, DollarSign, Shirt,
    Laptop, Apple, LayoutDashboard, LogOut
} from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

// ─── Types ────────────────────────────────────────────
interface MegaMenuColumn {
    title: string;
    icon?: React.ElementType;
    items: {
        label: string;
        href: string;
        description?: string;
        icon?: React.ElementType;
        badge?: string;
        isNew?: boolean;
        color?: string;
    }[];
}

interface MegaMenuItem {
    label: string;
    megaMenu?: {
        columns: MegaMenuColumn[];
        featured?: {
            title: string;
            description: string;
            href: string;
            image?: string;
            badge?: string;
            gradient?: string;
        };
        bottomCTA?: {
            label: string;
            href: string;
            icon?: React.ElementType;
        };
    };
    href?: string;
}

// ─── Color Maps for Icons ─────────────────────────────
const iconColorMap: Record<string, { bg: string; text: string; hoverBg: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', hoverBg: 'group-hover/item:bg-blue-600' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', hoverBg: 'group-hover/item:bg-purple-600' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', hoverBg: 'group-hover/item:bg-emerald-600' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', hoverBg: 'group-hover/item:bg-orange-600' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', hoverBg: 'group-hover/item:bg-pink-600' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', hoverBg: 'group-hover/item:bg-teal-600' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', hoverBg: 'group-hover/item:bg-amber-600' },
    red: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', hoverBg: 'group-hover/item:bg-red-600' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', hoverBg: 'group-hover/item:bg-indigo-600' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', hoverBg: 'group-hover/item:bg-cyan-600' },
};

// ─── Navigation Data ──────────────────────────────────
const navLinks: MegaMenuItem[] = [
    {
        label: 'Platform',
        megaMenu: {
            columns: [
                {
                    title: 'Pazaryeri Yönetimi',
                    icon: Globe,
                    items: [
                        { label: 'Çoklu Pazaryeri', href: '/entegrasyonlar', description: 'Trendyol, Hepsiburada, Amazon, N11', icon: Globe, color: 'blue' },
                        { label: 'Ürün Yönetimi', href: '/features', description: 'Toplu ürün ve varyant kontrolü', icon: Package, color: 'purple' },
                        { label: 'Sipariş Merkezi', href: '/features#automation', description: 'Tüm siparişler tek ekranda', icon: ShoppingBag, color: 'green' },
                        { label: 'Stok Senkronizasyonu', href: '/features#inventory', description: 'Gerçek zamanlı stok takibi', icon: Boxes, color: 'orange' },
                        { label: 'Ürün Yönetimi', href: '/features/inventory', description: 'Toplu ürün ve varyant kontrolü', icon: Package, color: 'purple' },
                        { label: 'Sipariş Merkezi', href: '/features/automation', description: 'Tüm siparişler tek ekranda', icon: ShoppingBag, color: 'green' },
                        { label: 'Stok Senkronizasyonu', href: '/features/inventory', description: 'Gerçek zamanlı stok takibi', icon: Boxes, color: 'orange' },
                    ]
                },
                {
                    title: 'İşletme Araçları',
                    icon: BarChart3,
                    items: [
                        { label: 'Analitik & Raporlama', href: '/features/analytics', description: 'Satış performansı ve trendler', icon: BarChart3, color: 'teal' },
                        { label: 'Fiyatlandırma Motoru', href: '/features/pricing', description: 'Dinamik fiyat optimizasyonu', icon: TrendingUp, color: 'amber' },
                        { label: 'Kargo Yönetimi', href: '/features/integration', description: 'Entegre kargo çözümleri', icon: Truck, color: 'cyan' },
                        { label: 'Muhasebe Entegrasyonu', href: '/features/integration', description: 'e-Fatura ve e-Arşiv', icon: CreditCard, color: 'indigo' },
                    ]
                },
                {
                    title: 'Akıllı Araçlar',
                    items: [
                        { label: 'Yapay Zeka Asistanı', href: '/features/ai', description: 'SEO ve içerik optimizasyonu', icon: Brain, color: 'purple' },
                        { label: 'Dinamik Fiyatlandırma', href: '/features/pricing', description: 'Otomatik rakip takibi', icon: DollarSign, color: 'orange' },
                        { label: 'Gelişmiş Analitik', href: '/features/analytics', description: 'Satış ve karlılık raporları', icon: BarChart3, color: 'blue' },
                        { label: 'İş Akış Otomasyonu', href: '/features/automation', description: 'Tekrarlayan işleri sıfırlayın', icon: Zap, badge: 'Yeni', color: 'green' },
                    ]
                }
            ],
            featured: {
                title: 'Yapay Zeka Pulse',
                description: 'Tüm mağazalarınızın nabzını AI ile tutun. Fırsatları ve riskleri saniyeler içinde tespit edin.',
                href: '/features/ai',
                image: '/images/mega-featured-ai.jpg'
            },
            bottomCTA: {
                label: 'Tüm özellikleri keşfedin',
                href: '/features'
            }
        }
    },
    {
        label: 'Çözümler',
        megaMenu: {
            columns: [
                {
                    title: 'İşletme Ölçeği',
                    icon: Target,
                    items: [
                        { label: 'Başlangıç', href: '/solutions/startup', description: 'Yeni e-ticaret girişimleri', icon: Rocket, color: 'green' },
                        { label: 'Büyüyen İşletmeler', href: '/solutions/sme', description: 'Ölçekleme aşamasındakiler', icon: TrendingUp, color: 'blue' },
                        { label: 'Kurumsal', href: '/solutions/enterprise', description: '1000+ SKU işletmeler', icon: Building2, badge: 'Özel', color: 'purple' },
                    ]
                },
                {
                    title: 'Sektörel Çözümler',
                    icon: Store,
                    items: [
                        { label: 'Moda & Tekstil', href: '/solutions/moda', description: 'Varyant ve sezon yönetimi', icon: Shirt, color: 'pink' },
                        { label: 'Elektronik', href: '/solutions/elektronik', description: 'Seri no ve garanti takibi', icon: Laptop, color: 'blue' },
                        { label: 'Kozmetik', href: '/solutions/kozmetik', description: 'SKT ve parti yönetimi', icon: Sparkles, color: 'purple' },
                        { label: 'Gıda', href: '/solutions/gida', description: 'Soğuk zincir ve FIFO', icon: Apple, color: 'green' },
                    ]
                },
                {
                    title: 'Kullanım Senaryoları',
                    icon: Layers,
                    items: [
                        { label: 'Dropshipping', href: '/solutions/dropshipping', description: 'Tedarikçi entegrasyonu', icon: Truck, color: 'orange' },
                        { label: 'Marka Satıcısı', href: '/solutions/brand', description: 'Tek marka çok kanal', icon: Award, color: 'amber' },
                        { label: 'Toptancı', href: '/solutions/wholesale', description: 'B2B ve B2C birlikte', icon: Layers, color: 'teal' },
                    ]
                }
            ],
            featured: {
                title: 'Başarı Hikayeleri',
                description: 'Müşterilerimizin %300 büyüme hikayelerini okuyun.',
                href: '/case-studies',
                badge: '50+ Hikaye',
                gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
            }
        }
    },
    {
        label: 'Kaynaklar',
        megaMenu: {
            columns: [
                {
                    title: 'Öğrenin',
                    icon: BookOpen,
                    items: [
                        { label: 'Blog', href: '/blog', description: 'E-ticaret stratejileri', icon: FileText, color: 'blue' },
                        { label: 'Rehberler', href: '/resources', description: 'Detaylı kılavuzlar', icon: BookOpen, color: 'green' },
                        { label: 'Video Eğitimler', href: '/video-library', description: '50+ eğitim videosu', icon: Video, color: 'red' },
                        { label: 'Webinarlar', href: '/webinars', description: 'Canlı ve kayıtlı', icon: Calendar, isNew: true, color: 'purple' },
                    ]
                },
                {
                    title: 'Destek',
                    icon: HelpCircle,
                    items: [
                        { label: 'Yardım Merkezi', href: '/destek', description: 'SSS ve dökümanlar', icon: HelpCircle, color: 'teal' },
                        { label: 'API Dökümanları', href: '/docs/api', description: 'Geliştirici kaynakları', icon: ClipboardList, color: 'indigo' },
                        { label: 'Durum Sayfası', href: '/status', description: 'Sistem durumu', icon: Bell, color: 'amber' },
                        { label: 'İletişim', href: '/iletisim', description: '7/24 destek', icon: MessageCircle, color: 'cyan' },
                    ]
                },
                {
                    title: 'Topluluk',
                    icon: Users,
                    items: [
                        { label: 'Satıcı Topluluğu', href: '/community', description: '25K+ aktif üye', icon: Users, color: 'blue' },
                        { label: 'Partner Programı', href: '/partner', description: 'İş ortağımız olun', icon: Heart, color: 'pink' },
                        { label: 'Referans Programı', href: '/referral', description: '%20 komisyon kazanın', icon: Gift, color: 'orange' },
                    ]
                }
            ],
            featured: {
                title: '2026 E-ticaret Raporu',
                description: 'Türkiye e-ticaret trendleri ve pazaryeri analizleri.',
                href: '/resources/2026-rapor',
                badge: 'Yeni',
                gradient: 'from-orange-600 via-red-600 to-pink-600',
            }
        }
    },
    {
        label: 'Kurumsal',
        megaMenu: {
            columns: [
                {
                    title: 'Hakkımızda',
                    icon: Building2,
                    items: [
                        { label: 'Hikayemiz', href: '/kurumsal/hakkimizda', description: 'Vizyonumuz ve misyonumuz', icon: Building2, color: 'blue' },
                        { label: 'Ekibimiz', href: '/team', description: 'Arkamızdaki insanlar', icon: Users, color: 'purple' },
                        { label: 'Kariyer', href: '/careers', description: 'Bize katılın', icon: Briefcase, badge: '8 pozisyon', color: 'green' },
                    ]
                },
                {
                    title: 'Medya',
                    icon: Newspaper,
                    items: [
                        { label: 'Basın Odası', href: '/press', description: 'Haberler ve duyurular', icon: Newspaper, color: 'indigo' },
                        { label: 'Medya Kiti', href: '/press#media-kit', description: 'Logo ve görseller', icon: FileText, color: 'teal' },
                        { label: 'Başarı Hikayeleri', href: '/case-studies', description: 'Müşteri referansları', icon: Award, color: 'amber' },
                    ]
                },
                {
                    title: 'İletişim',
                    icon: MessageCircle,
                    items: [
                        { label: 'Bize Ulaşın', href: '/iletisim', description: 'Sorularınız için', icon: MessageCircle, color: 'cyan' },
                        { label: 'Demo Talep', href: '/demo', description: 'Ürünü görün', icon: Play, color: 'red' },
                    ]
                }
            ],
            featured: {
                title: 'Ekibimize Katılın!',
                description: 'Türkiye\'nin en hızlı büyüyen SaaS şirketinde kariyer fırsatları.',
                href: '/careers',
                badge: 'Hiring',
                gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
            }
        }
    },
    { href: '/pricing', label: 'Fiyatlandırma' },
    { href: '/entegrasyonlar', label: 'Entegrasyonlar' },
];

// ─── Animations ───────────────────────────────────────
const megaMenuVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.2, ease: 'easeIn' as const } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
};

const staggerItem = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

const contentVariants = {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], staggerChildren: 0.04, delayChildren: 0.04 } },
    exit: { opacity: 0, x: -8, transition: { duration: 0.15 } }
};

const contentItem = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } }
};

// Gradient map for icon hover states
const iconGradientMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    teal: 'from-teal-500 to-teal-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
    cyan: 'from-cyan-500 to-cyan-600',
};

// ─── Mega Menu Item Card (Premium) ───────────────────
function MegaMenuItemCard({ item, onClick }: { item: MegaMenuColumn['items'][0]; onClick: () => void }) {
    const colors = iconColorMap[item.color || 'blue'];
    const gradient = iconGradientMap[item.color || 'blue'];

    return (
        <motion.div variants={contentItem}>
            <Link
                href={item.href}
                onClick={onClick}
                className="group/item flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.05] border border-transparent hover:border-slate-100 dark:hover:border-white/[0.07] transition-all duration-300 cursor-pointer"
            >
                {item.icon && (
                    <div className={`relative w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 transition-all duration-300 group-hover/item:scale-[1.08] group-hover/item:shadow-lg overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover/item:opacity-100 transition-opacity duration-300`} />
                        <item.icon size={18} className={`relative z-10 ${colors.text} group-hover/item:text-white transition-colors duration-300`} />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                            {item.label}
                        </span>
                        {item.badge && (
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r ${gradient} text-white rounded-full shadow-sm`}>
                                {item.badge}
                            </span>
                        )}
                        {item.isNew && (
                            <span className="relative flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Yeni
                            </span>
                        )}
                    </div>
                    {item.description && (
                        <p className="text-[12px] text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-1">
                            {item.description}
                        </p>
                    )}
                </div>
                <div className="w-7 h-7 rounded-lg bg-transparent group-hover/item:bg-blue-500/10 dark:group-hover/item:bg-blue-500/10 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/item:opacity-100 shrink-0">
                    <ArrowRight size={13} className="text-blue-500" />
                </div>
            </Link>
        </motion.div>
    );
}

// ─── Desktop Mega Menu Panel ──────────────────────────
function DesktopMegaMenuPanel({
    megaMenu,
    onClose
}: {
    megaMenu: NonNullable<MegaMenuItem['megaMenu']>;
    onClose: () => void;
}) {
    const [activeCol, setActiveCol] = React.useState(0);
    const activeColumn = megaMenu.columns[activeCol];

    return (
        <div className="relative bg-white/98 dark:bg-[#0a0f1e]/98 backdrop-blur-3xl rounded-2xl overflow-hidden border border-slate-200/70 dark:border-white/[0.08] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.6)]">
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />

            <div className="flex">
                {/* ── Left Sidebar ── */}
                <div className="w-[220px] shrink-0 bg-slate-50/60 dark:bg-white/[0.02] border-r border-slate-100/80 dark:border-white/[0.05] p-3 flex flex-col gap-1">
                    {megaMenu.columns.map((col, idx) => {
                        const isActive = activeCol === idx;
                        return (
                            <button
                                key={idx}
                                onMouseEnter={() => setActiveCol(idx)}
                                onClick={() => setActiveCol(idx)}
                                className={`group w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 ${
                                    isActive
                                        ? 'bg-white dark:bg-white/[0.08] shadow-sm border border-slate-200/80 dark:border-white/[0.1] text-blue-600 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {col.icon && (
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                                        isActive
                                            ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                            : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/[0.08]'
                                    }`}>
                                        <col.icon size={15} />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-bold leading-tight truncate">{col.title}</div>
                                    <div className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">{col.items.length} özellik</div>
                                </div>
                                <ChevronRight size={13} className={`shrink-0 transition-all duration-200 ${isActive ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-60'}`} />
                            </button>
                        );
                    })}

                    {/* Bottom CTA in sidebar */}
                    {megaMenu.bottomCTA && (
                        <div className="mt-auto pt-3 border-t border-slate-100/80 dark:border-white/[0.05]">
                            <Link
                                href={megaMenu.bottomCTA.href}
                                onClick={onClose}
                                className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-bold transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30"
                            >
                                <Rocket size={13} className="shrink-0" />
                                <span className="flex-1 truncate">{megaMenu.bottomCTA.label}</span>
                                <ArrowRight size={11} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Right Content Panel ── */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 p-5">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCol}
                                variants={contentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="grid grid-cols-2 gap-1.5"
                            >
                                {activeColumn?.items.map((item, idx) => (
                                    <MegaMenuItemCard key={idx} item={item} onClick={onClose} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Featured Card Footer ── */}
                    {megaMenu.featured && (
                        <div className="border-t border-slate-100/80 dark:border-white/[0.06] p-4">
                            <Link
                                href={megaMenu.featured.href}
                                onClick={onClose}
                                className={`group/feat relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${megaMenu.featured.gradient || 'from-blue-600 to-indigo-600'} overflow-hidden hover:scale-[1.01] transition-all duration-300 hover:shadow-lg`}
                            >
                                {/* Animated shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/feat:translate-x-full transition-transform duration-700" />
                                {/* Decorative circles */}
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />

                                <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <div className="relative z-10 flex-1 min-w-0">
                                    {megaMenu.featured.badge && (
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Star size={10} className="text-yellow-300 fill-yellow-300" />
                                            <span className="text-[10px] font-black text-white/80 uppercase tracking-wider">{megaMenu.featured.badge}</span>
                                        </div>
                                    )}
                                    <div className="text-[14px] font-bold text-white leading-snug">{megaMenu.featured.title}</div>
                                    <div className="text-[12px] text-white/70 mt-0.5 line-clamp-1">{megaMenu.featured.description}</div>
                                </div>
                                <div className="relative z-10 flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[12.5px] font-bold transition-colors shrink-0 group-hover/feat:gap-2.5">
                                    İncele
                                    <ArrowRight size={12} className="group-hover/feat:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Navbar ───────────────────────────────────────────
export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { theme, resolvedMode, toggleTheme } = useTheme();
    const { data: session, status } = useSession();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    const handleMouseEnter = useCallback((label: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveDropdown(label);
    }, []);

    const handleMouseLeave = useCallback(() => {
        timeoutRef.current = setTimeout(() => setActiveDropdown(null), 180);
    }, []);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-3'}`}>
                <div className="container mx-auto px-4">
                    <div className={`flex items-center justify-between px-3 sm:px-5 lg:px-6 py-2.5 rounded-2xl transition-all duration-500 ${scrolled
                        ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-lg shadow-slate-900/5 dark:shadow-black/30 border border-slate-200/50 dark:border-white/[0.06]'
                        : 'bg-transparent'
                        }`}>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold italic text-sm group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-600/25 group-hover:shadow-blue-600/40">
                                P
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                                Pazar<span className="text-blue-600 dark:text-blue-400">yonetimi</span>
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden lg:flex items-center gap-0.5" ref={dropdownRef}>
                            {navLinks.map((link) =>
                                link.megaMenu ? (
                                    <div
                                        key={link.label}
                                        className="relative"
                                        onMouseEnter={() => handleMouseEnter(link.label)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <button
                                            aria-expanded={activeDropdown === link.label}
                                            aria-haspopup="true"
                                            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${activeDropdown === link.label
                                                ? 'text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-500/10'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            {link.label}
                                            <ChevronDown
                                                size={13}
                                                className={`transition-transform duration-300 ${activeDropdown === link.label ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* ── Mega Menu Dropdown (Premium) ── */}
                                        <AnimatePresence>
                                            {activeDropdown === link.label && (
                                                <motion.div
                                                    variants={megaMenuVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3.5 w-[820px] max-w-[calc(100vw-2rem)]"
                                                >
                                                    {/* Hover bridge */}
                                                    <div className="absolute -top-4 left-0 right-0 h-4" />

                                                    {/* Ambient glow */}
                                                    <div className="absolute -inset-3 bg-gradient-to-b from-blue-500/[0.07] via-purple-500/[0.04] to-transparent rounded-3xl blur-2xl pointer-events-none" />

                                                    <DesktopMegaMenuPanel
                                                        megaMenu={link.megaMenu}
                                                        onClose={() => setActiveDropdown(null)}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link
                                        key={link.href}
                                        href={link.href!}
                                        className="px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/[0.04] rounded-xl transition-all duration-200"
                                    >
                                        {link.label}
                                    </Link>
                                )
                            )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={toggleTheme}
                                className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                aria-label="Tema değiştir"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={resolvedMode}
                                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {resolvedMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                    </motion.div>
                                </AnimatePresence>
                            </button>

                            {status === 'authenticated' && session ? (
                                <>
                                    <Link
                                        href="/dashboard/support"
                                        className="hidden md:flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <HelpCircle size={16} />
                                        <span>Destek Talebi</span>
                                    </Link>

                                    <Link
                                        href="/dashboard"
                                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all border border-blue-200/50 dark:border-blue-500/20 shadow-sm"
                                    >
                                        <LayoutDashboard size={16} />
                                        <span>Panel</span>
                                    </Link>

                                    <div className="relative" ref={profileRef}>
                                        <button
                                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[11px] font-black text-white shadow-lg shadow-blue-600/20 ring-2 ring-white dark:ring-slate-900 transition-transform group-hover:scale-105">
                                                {session.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                                            </div>
                                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''} hidden xs:block`} />
                                        </button>

                                        <AnimatePresence>
                                            {profileMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-white/[0.08] overflow-hidden z-[60]"
                                                >
                                                    <div className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/[0.05]">
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.user?.name}</div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{session.user?.email}</div>
                                                    </div>
                                                    <div className="p-2">
                                                        <Link
                                                            href="/dashboard"
                                                            onClick={() => setProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
                                                        >
                                                            <LayoutDashboard size={16} /> Admin Paneli
                                                        </Link>
                                                        <Link
                                                            href="/dashboard/settings"
                                                            onClick={() => setProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
                                                        >
                                                            <Settings size={16} /> Hesap Ayarları
                                                        </Link>
                                                        <div className="h-px bg-slate-100 dark:bg-white/[0.05] my-2 mx-1" />
                                                        <button
                                                            onClick={() => signOut()}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium text-red-500 dark:text-red-400 transition-all"
                                                        >
                                                            <LogOut size={16} /> Çıkış Yap
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        Giriş Yap
                                    </Link>

                                    <Link
                                        href="/demo"
                                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 relative overflow-hidden group/demo"
                                    >
                                        <span className="relative z-10">Demo İste</span>
                                        <ArrowRight size={14} className="relative z-10 group-hover/demo:translate-x-0.5 transition-transform hidden sm:block" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover/demo:opacity-100 transition-opacity" />
                                    </Link>
                                </>
                            )}

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all text-slate-600 dark:text-white"
                                aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                                aria-expanded={mobileMenuOpen}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={mobileMenuOpen ? 'close' : 'menu'}
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Mobile Fullscreen Menu ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-40 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-2xl pt-20 overflow-y-auto lg:hidden"
                    >
                        {/* Premium Background Effects */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-3xl opacity-50" />
                            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] opacity-30" />
                        </div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.05 } }
                            }}
                            className="relative container mx-auto px-4 pb-10 space-y-1"
                        >
                            <div className="flex flex-col gap-2">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.label}
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
                                        }}
                                    >
                                        {link.megaMenu ? (
                                            <MobileMegaMenu
                                                label={link.label}
                                                megaMenu={link.megaMenu}
                                                onClose={() => setMobileMenuOpen(false)}
                                            />
                                        ) : (
                                            <Link
                                                href={link.href!}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="group flex items-center justify-between p-4 text-lg font-bold text-slate-900 dark:text-white bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
                                            >
                                                {link.label}
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                    <ArrowRight size={14} />
                                                </div>
                                            </Link>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { delay: 0.2 } }
                                }}
                                className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    {status === 'authenticated' ? (
                                        <>
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex flex-col items-center justify-center py-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white gap-1 col-span-2 overflow-hidden relative group"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                <LayoutDashboard size={20} />
                                                <span className="text-base font-bold">Admin Paneli</span>
                                            </Link>
                                            <Link
                                                href="/dashboard/support"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex flex-col items-center justify-center py-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors gap-1"
                                            >
                                                <HelpCircle size={18} className="text-blue-500" />
                                                <span className="text-sm font-bold text-slate-800 dark:text-white">Destek</span>
                                            </Link>
                                            <button
                                                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                                className="flex flex-col items-center justify-center py-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-colors gap-1"
                                            >
                                                <LogOut size={18} className="text-red-500" />
                                                <span className="text-sm font-bold text-red-600 dark:text-red-400">Çıkış</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center justify-center py-4 text-base font-bold text-slate-800 dark:text-white bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                                            >
                                                Giriş Yap
                                            </Link>
                                            <Link
                                                href="/demo"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center justify-center py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                                            >
                                                Demo İste
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* Status & Contact */}
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sistemler Aktif</span>
                                    </div>
                                    <Link href="/iletisim" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                        Destek Al
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Mobile Mega Menu Component ───────────────────────
function MobileMegaMenu({
    label,
    megaMenu,
    onClose
}: {
    label: string;
    megaMenu: MegaMenuItem['megaMenu'];
    onClose: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState<number | null>(null);

    // Initial animation for columns
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    if (!megaMenu) return null;

    return (
        <div className={`overflow-hidden rounded-2xl transition-all duration-300 border ${isOpen ? 'bg-white/80 dark:bg-slate-900/80 border-blue-100 dark:border-blue-500/20 shadow-lg shadow-blue-500/5' : 'bg-white/50 dark:bg-white/5 border-slate-200/50 dark:border-white/5'}`}>
            <button
                onClick={() => { setIsOpen(!isOpen); setActiveColumn(null); }}
                className="flex items-center justify-between w-full p-4 text-left transition-colors"
                aria-expanded={isOpen}
            >
                <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {label}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-blue-50 dark:bg-blue-500/10 rotate-180' : 'bg-transparent'}`}>
                    <ChevronDown size={18} className={`transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-3 pb-4 space-y-3 pt-2">
                            {megaMenu.columns.map((column, colIdx) => (
                                <div key={colIdx} className="bg-slate-50/50 dark:bg-white/[0.02] rounded-xl overflow-hidden border border-slate-100 dark:border-white/5">
                                    <button
                                        onClick={() => setActiveColumn(activeColumn === colIdx ? null : colIdx)}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-slate-100/50 dark:hover:bg-white/5"
                                    >
                                        {column.icon && (
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                <column.icon size={14} />
                                            </div>
                                        )}
                                        <span className="flex-1 font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                            {column.title}
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            className={`text-slate-400 transition-transform duration-300 ${activeColumn === colIdx ? 'rotate-90 text-blue-500' : ''}`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {activeColumn === colIdx && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-2 pb-2 space-y-1">
                                                    {column.items.map((item, itemIdx) => {
                                                        const colors = iconColorMap[item.color || 'blue'];
                                                        return (
                                                            <Link
                                                                key={itemIdx}
                                                                href={item.href}
                                                                onClick={onClose}
                                                                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-white/5 transition-all"
                                                            >
                                                                <div className={`mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors`} />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                                            {item.label}
                                                                        </span>
                                                                        {item.badge && (
                                                                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded">
                                                                                {item.badge}
                                                                            </span>
                                                                        )}
                                                                        {item.isNew && (
                                                                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded">
                                                                                Yeni
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {item.description && (
                                                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                                                                            {item.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}

                            {/* Mobile Featured Card */}
                            {megaMenu.featured && (
                                <Link
                                    href={megaMenu.featured.href}
                                    onClick={onClose}
                                    className={`relative block p-5 rounded-xl bg-gradient-to-br ${megaMenu.featured.gradient || 'from-blue-600 to-indigo-600'} overflow-hidden shadow-lg shadow-blue-500/25`}
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-20">
                                        <Sparkles size={48} className="text-white rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        {megaMenu.featured.badge && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm rounded-full mb-3">
                                                <Star size={10} fill="currentColor" />
                                                {megaMenu.featured.badge}
                                            </span>
                                        )}
                                        <h4 className="font-bold text-lg text-white mb-1.5">{megaMenu.featured.title}</h4>
                                        <p className="text-sm text-white/90 leading-relaxed mb-4">{megaMenu.featured.description}</p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-sm font-bold text-blue-700 rounded-lg shadow-sm">
                                            İncele <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
