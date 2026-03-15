'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Sparkles,
    Settings,
    Users,
    TrendingUp,
    LogOut,
    Bell,
    X,
    Briefcase,
    ShoppingCart,
    BarChart3,
    Warehouse,
    Receipt,
    Globe,
    CreditCard,
    FileText,
    Target,
    Megaphone,
    MessageSquare,
    Shield,
    Boxes,
    Truck,
    Tags,
    PieChart,
    Zap,
    Bot,
    LineChart,
    Store,
    Lock,
    Crown,
    Palette,
    Workflow,
    Webhook,
    Activity,
    LayoutGrid,
    Image as ImageIcon,
    ChevronRight,
    ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useModules } from '@/lib/modules';
import { useOrderStats } from '@/lib/hooks';
import { useQuickActions } from '@/providers/quick-actions-provider';

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onHaptic?: () => void;
}

interface MenuItem {
    icon: any;
    label: string;
    href: string;
    badge?: string;
    pro?: boolean;
    moduleKey?: string;
}

interface Section {
    title: string;
    items: MenuItem[];
}

const sections: Section[] = [
    {
        title: "Genel",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", moduleKey: "DASHBOARD" },
            { icon: ShoppingCart, label: "Siparişler", href: "/dashboard/orders", moduleKey: "ORDERS" },
            { icon: Package, label: "Ürünler", href: "/dashboard/products", moduleKey: "PRODUCTS" },
            { icon: Warehouse, label: "Stok Yönetimi", href: "/dashboard/inventory", badge: "!", moduleKey: "INVENTORY" },
            { icon: Users, label: "Müşteriler", href: "/dashboard/customers", moduleKey: "CUSTOMERS" },
            { icon: Bell, label: "Bildirimler", href: "/dashboard/notifications", moduleKey: "DASHBOARD" },
        ]
    },
    {
        title: "AI Araçları",
        items: [
            { icon: Bot, label: "AI Danışman", href: "/dashboard/ai-advisor", pro: true, moduleKey: "AI_ADVISOR" },
            { icon: ImageIcon, label: "Görsel Stüdyo", href: "/dashboard/ai-tools/image-studio", pro: true, moduleKey: "IMAGE_AI" },
            { icon: Sparkles, label: "İçerik Editörü", href: "/dashboard/ai-tools/content-optimizer", pro: true, moduleKey: "AI_CONTENT" },
            { icon: Target, label: "SEO Denetleyici", href: "/dashboard/seo", pro: true, moduleKey: "AI_SEO" },
            { icon: TrendingUp, label: "Rakip Analizi", href: "/dashboard/competitor", pro: true, moduleKey: "COMPETITOR_ANALYSIS" },
            { icon: PieChart, label: "Satış Tahminleri", href: "/dashboard/predictions", pro: true, moduleKey: "PREDICTIONS" },
        ]
    },
    {
        title: "Pazaryeri",
        items: [
            { icon: Store, label: "Mağazalarım", href: "/dashboard/stores", moduleKey: "STORE_MANAGEMENT" },
            { icon: Globe, label: "Entegrasyonlar", href: "/dashboard/settings/integrations", moduleKey: "INTEGRATIONS" },
            { icon: Boxes, label: "Toplu İşlemler", href: "/dashboard/bulk-actions", pro: true, moduleKey: "BULK_ACTIONS" },
            { icon: Tags, label: "Fiyat Yönetimi", href: "/dashboard/pricing", pro: true, moduleKey: "PRICING_ENGINE" },
            { icon: Truck, label: "Kargo Ayarları", href: "/dashboard/shipping", moduleKey: "STORE_MANAGEMENT" },
            { icon: Truck, label: "Servis Entegrasyonları", href: "/dashboard/settings/service-integrations", moduleKey: "SETTINGS" },
        ]
    },
    {
        title: "Finans & Raporlar",
        items: [
            { icon: Briefcase, label: "Finans & Karlılık", href: "/dashboard/finance", moduleKey: "PAYMENTS" },
            { icon: CreditCard, label: "Ödemeler", href: "/dashboard/payments", moduleKey: "PAYMENTS" },
            { icon: Receipt, label: "Faturalar", href: "/dashboard/invoices", moduleKey: "PAYMENTS" },
            { icon: LineChart, label: "Analitik", href: "/dashboard/analytics", moduleKey: "DASHBOARD" },
            { icon: BarChart3, label: "Finansal Raporlar", href: "/dashboard/reports", pro: true, moduleKey: "FINANCIAL_REPORTS" },
        ]
    },
    {
        title: "Pazarlama",
        items: [
            { icon: Megaphone, label: "Kampanyalar", href: "/dashboard/campaigns", pro: true, moduleKey: "CAMPAIGNS" },
            { icon: MessageSquare, label: "Yorumlar", href: "/dashboard/reviews", moduleKey: "REVIEWS" },
        ]
    },
    {
        title: "Sistem",
        items: [
            { icon: Workflow, label: "Otomasyonlar", href: "/dashboard/automation", pro: true, moduleKey: "INTEGRATIONS" },
            { icon: Webhook, label: "Webhooks", href: "/dashboard/webhooks", pro: true, moduleKey: "INTEGRATIONS" },
            { icon: Activity, label: "Aktivite Logu", href: "/dashboard/activity", moduleKey: "DASHBOARD" },
            { icon: LayoutGrid, label: "Widget'lar", href: "/dashboard/widgets", moduleKey: "DASHBOARD" },
            { icon: Sparkles, label: "Geri Bildirim", href: "/dashboard/feedback", moduleKey: "DASHBOARD" },
            { icon: Palette, label: "Tema", href: "/dashboard/theme", moduleKey: "SETTINGS" },
            { icon: Shield, label: "Güvenlik", href: "/dashboard/security", moduleKey: "SECURITY" },
            { icon: Settings, label: "Ayarlar", href: "/dashboard/settings", moduleKey: "SETTINGS" },
        ]
    }
];

export default function MobileSidebar({ isOpen, onClose, onHaptic }: MobileSidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { hasModuleAccess, tenantPlan } = useModules();
    const { data: orderStats } = useOrderStats();
    const { openQuickSale, openAddProduct } = useQuickActions();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Path değiştiğinde drawer'ı kapat
    useEffect(() => {
        onClose();
    }, [pathname]);

    // Body scroll'u kilitle
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] lg:hidden"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Drawer - sağdan açılan iOS/Android tarzı */}
                    <motion.div
                        ref={sidebarRef}
                        role="navigation"
                        aria-label="Mobil menü"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                        className="fixed inset-y-0 right-0 w-[85vw] max-w-[380px] bg-background z-[201] lg:hidden flex flex-col safe-area-top"
                    >
                        {/* Drawer Handle */}
                        <div className="flex items-center justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-border" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                                    <span className="text-lg font-black italic text-white">P</span>
                                </div>
                                <div>
                                    <span className="text-base font-black tracking-tight text-foreground">PAZAR</span>
                                    <span className="text-base font-black tracking-tight text-primary">YÖNETİMİ</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    onHaptic?.();
                                    onClose();
                                }}
                                aria-label="Menüyü kapat"
                                className="p-2 rounded-xl bg-surface border border-border text-slate-400 hover:text-foreground active:scale-90 transition-all haptic-tap"
                            >
                                <X size={18} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="px-5 py-4 border-b border-border">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        onHaptic?.();
                                        onClose();
                                        openQuickSale();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl text-xs font-bold text-primary transition-all active:scale-95 haptic-tap"
                                >
                                    <Zap size={15} /> Hızlı Satış
                                </button>
                                <button
                                    onClick={() => {
                                        onHaptic?.();
                                        onClose();
                                        openAddProduct();
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-2xl text-xs font-bold text-green-500 transition-all active:scale-95 haptic-tap"
                                >
                                    <Package size={15} /> Ürün Ekle
                                </button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-4 mobile-scroll">
                            {sections.map((section) => (
                                <div key={section.title}>
                                    <div className="px-2 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {section.title}
                                    </div>
                                    <div className="space-y-0.5">
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={onHaptic}
                                                    className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all active:scale-[0.98] haptic-tap ${isActive
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : 'text-slate-400 hover:bg-surface active:bg-surface'
                                                        }`}
                                                >
                                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                                                    <span className="text-sm font-medium flex-1">{item.label}</span>
                                                    {item.label === 'Siparişler' ? (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                                            {orderStats?.today?.total || '0'}
                                                        </span>
                                                    ) : item.badge && (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badge === '!'
                                                            ? 'bg-orange-500/20 text-orange-400'
                                                            : 'bg-primary/20 text-primary'
                                                            }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {item.pro && !hasModuleAccess(item.moduleKey || '') && (
                                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white uppercase flex items-center gap-1">
                                                            <Lock size={8} /> Pro
                                                        </span>
                                                    )}
                                                    {item.pro && hasModuleAccess(item.moduleKey || '') && (
                                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white uppercase flex items-center gap-1">
                                                            <Crown size={8} /> Aktif
                                                        </span>
                                                    )}
                                                    <ChevronRight size={14} className={`flex-shrink-0 ${isActive ? 'text-primary/60' : 'text-slate-600'}`} />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer - User & Plan */}
                        <div className="border-t border-border p-4 space-y-3 safe-area-bottom">
                            {/* Plan */}
                            <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 rounded-2xl p-3 border border-primary/20">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles size={13} className="text-primary" />
                                        <span className="text-[10px] font-black text-primary uppercase">{tenantPlan} Plan</span>
                                    </div>
                                    <Link href="/dashboard/upgrade" className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                                        Yükselt <ArrowUpRight size={10} />
                                    </Link>
                                </div>
                                <div className="w-full bg-background/50 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-primary to-purple-500 w-3/4 h-full rounded-full" />
                                </div>
                            </div>

                            {/* User */}
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                    {session?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'AY'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-foreground truncate">{session?.user?.name || 'Kullanıcı'}</div>
                                    <div className="text-[10px] text-slate-500 truncate">{session?.user?.email}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
