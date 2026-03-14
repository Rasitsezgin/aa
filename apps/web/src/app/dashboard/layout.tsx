"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard, Package, Sparkles, Settings, Users,
    TrendingUp, LogOut, ChevronRight, Bell, Calculator,
    Search, HelpCircle, Briefcase, ShoppingCart, BarChart3,
    Warehouse, Receipt, Globe, CreditCard, FileText,
    Target, Megaphone, MessageSquare, MessageCircle,
    Shield, Boxes, Truck, Tags, PieChart, Zap, Bot,
    LineChart, Store, ChevronDown, Lock, Crown,
    Palette, Workflow, Webhook, Activity, LayoutGrid,
    Image as ImageIcon, Sun, Moon, User, FileCode2,
    Printer, Gamepad2, Link as LinkIcon, Key,
    RefreshCw, Navigation, Star, ShieldAlert, Edit2,
    FlaskConical, Layers
} from 'lucide-react';
import LiveFeed from '@/components/LiveFeed';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleProvider, useModules, useAnnouncements } from '@/lib/modules';
import { AnnouncementBanner, AnnouncementDropdown } from '@/components/announcements/AnnouncementComponents';
import { CommandPalette } from '@/components/CommandPalette';
import { useTheme } from '@/providers/theme-provider';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/components/dashboard/KeyboardShortcuts';
import { WebSocketProvider } from '@/providers/websocket-provider';
import { ToastProvider } from '@/providers/toast-provider';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import MobileSidebar from '@/components/dashboard/MobileSidebar';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { QuickActionsProvider, useQuickActions } from '@/providers/quick-actions-provider';
import AICopilot from '@/components/dashboard/AICopilot';

interface MenuItem {
    icon: React.ComponentType<{ className?: string; size?: number }>;
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
            { icon: ShoppingCart, label: "Siparişler", href: "/dashboard/orders", badge: "12", moduleKey: "ORDERS" },
            { icon: RefreshCw, label: "İadeler", href: "/dashboard/returns", moduleKey: "ORDERS" },
            { icon: MessageSquare, label: "Değerlendirmeler", href: "/dashboard/reviews", moduleKey: "REVIEWS" },
            { icon: Package, label: "Ürünler", href: "/dashboard/products", moduleKey: "PRODUCTS" },
            { icon: Warehouse, label: "Stok Yönetimi", href: "/dashboard/inventory", badge: "!", moduleKey: "INVENTORY" },
            { icon: Users, label: "Müşteriler", href: "/dashboard/customers", moduleKey: "CUSTOMERS" },
            { icon: Target, label: "Müşteri Segmentleri", href: "/dashboard/customer-segments", moduleKey: "CUSTOMERS" },
        ]
    },
    {
        title: "AI & Pazarlama",
        items: [
            { icon: ImageIcon, label: "Görsel Editör", href: "/dashboard/image-editor", pro: true, moduleKey: "AI_CONTENT" },
            { icon: Bot, label: "AI Danışman", href: "/dashboard/ai-consultant", pro: true, moduleKey: "AI_INSIGHTS" },
            { icon: Megaphone, label: "Kampanyalar", href: "/dashboard/ad-campaigns", moduleKey: "MARKETING" },
            { icon: MessageCircle, label: "WhatsApp Ticaret", href: "/dashboard/whatsapp", moduleKey: "MARKETING" },
            { icon: Zap, label: "Fiyat Optimizasyonu", href: "/dashboard/price-optimization", pro: true, moduleKey: "PRICING_ENGINE" },
            { icon: ShieldAlert, label: "Rakip Takibi", href: "/dashboard/competitor-tracking", pro: true, moduleKey: "COMPETITOR_INTELLIGENCE" },
            { icon: FlaskConical, label: "İçerik Stüdyosu", href: "/dashboard/ai-tools/content-studio", pro: true, moduleKey: "AI_CONTENT" },
            { icon: Layers, label: "Toplu Optimizasyon", href: "/dashboard/ai-tools/batch-optimizer", pro: true, moduleKey: "AI_CONTENT" },
        ]
    },
    {
        title: "Finansal Araçlar",
        items: [
            { icon: Briefcase, label: "Finans & Karlılık", href: "/dashboard/finance", moduleKey: "PAYMENTS" },
            { icon: Calculator, label: "Komisyon Hesabı", href: "/dashboard/commission-calculator", moduleKey: "FINANCE" },
            { icon: LinkIcon, label: "Muhasebe", href: "/dashboard/accounting", moduleKey: "FINANCE" },
            { icon: Target, label: "Bütçe Planlama", href: "/dashboard/budget", moduleKey: "FINANCE" },
            { icon: CreditCard, label: "Ödemeler", href: "/dashboard/payments", moduleKey: "PAYMENTS" },
            { icon: FileText, label: "E-Fatura", href: "/dashboard/e-invoice", moduleKey: "FINANCE" },
            { icon: RefreshCw, label: "Döviz Kurları", href: "/dashboard/currency", moduleKey: "FINANCE" },
        ]
    },
    {
        title: "Mağaza & Lojistik",
        items: [
            { icon: Store, label: "Mağazalarım", href: "/dashboard/stores", moduleKey: "STORE_MANAGEMENT" },
            { icon: Globe, label: "Entegrasyonlar", href: "/dashboard/settings/integrations", moduleKey: "INTEGRATIONS" },
            { icon: Boxes, label: "Toplu İşlemler", href: "/dashboard/bulk-actions", pro: true, moduleKey: "BULK_ACTIONS" },
            { icon: Navigation, label: "Kargo Takip", href: "/dashboard/shipping-tracking", moduleKey: "STORE_MANAGEMENT" },
            { icon: Truck, label: "Kargo Ayarları", href: "/dashboard/shipping", moduleKey: "STORE_MANAGEMENT" },
            { icon: Truck, label: "Servis Entegrasyonları", href: "/dashboard/settings/service-integrations", moduleKey: "SETTINGS" },
        ]
    },
    {
        title: "Sistem",
        items: [
            { icon: Workflow, label: "Otomasyonlar", href: "/dashboard/automation", pro: true, moduleKey: "INTEGRATIONS" },
            { icon: Zap, label: "Akış Oluşturucu", href: "/dashboard/workflow-builder", pro: true, moduleKey: "INTEGRATIONS" },
            { icon: Activity, label: "Canlı Analitik", href: "/dashboard/live-analytics", moduleKey: "DASHBOARD" },
            { icon: Webhook, label: "Webhooks", href: "/dashboard/webhooks", pro: true, moduleKey: "INTEGRATIONS" },
            { icon: BarChart3, label: "Aktivite Logu", href: "/dashboard/activity", moduleKey: "DASHBOARD" },
            { icon: LayoutGrid, label: "Widget'lar", href: "/dashboard/widgets", moduleKey: "DASHBOARD" },
            { icon: Palette, label: "Tema", href: "/dashboard/theme", moduleKey: "SETTINGS" },
            { icon: Shield, label: "Güvenlik", href: "/dashboard/security", moduleKey: "SECURITY" },
            { icon: Settings, label: "Ayarlar", href: "/dashboard/settings", moduleKey: "SETTINGS" },
        ]
    }
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [expandedSection, setExpandedSection] = useState<string | null>('Genel');
    const { hasModuleAccess, tenantPlan } = useModules();
    const { active: activeAnnouncements, unreadCount, markAsRead, dismiss } = useAnnouncements();
    const { toggleTheme, resolvedMode } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const { openQuickSale, openAddProduct } = useQuickActions();
    useKeyboardShortcuts();

    // Auth guard - redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login?callbackUrl=' + encodeURIComponent(pathname ?? '/dashboard'));
        }
    }, [status, router, pathname]);

    // Sayfa yüklendiğinde aktif olan bölümü açık getir
    useEffect(() => {
        const activeSection = sections.find(s => s.items.some(i => i.href === pathname));
        if (activeSection) {
            const timer = setTimeout(() => setExpandedSection(activeSection.title), 0);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    // Show loading skeleton while checking auth status
    if (status !== 'authenticated' || !session) {
        return (
            <div className="min-h-screen bg-[#0B1121] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-[3px] border-slate-800" />
                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-slate-400 animate-pulse">
                        Yetkilendiriliyor...
                    </p>
                </div>
            </div>
        );
    }

    const toggleSection = (title: string) => {
        setExpandedSection(prev => prev === title ? null : title);
    };

    return (
        <div className="flex min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
            {/* Sidebar - sadece desktop'ta görünür */}
            <aside
                role="navigation"
                aria-label="Ana menü"
                className="hidden lg:flex w-72 bg-surface border-r border-border flex-col fixed inset-y-0 z-50"
            >
                <div className="p-6 border-b border-border">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="text-xl font-black italic text-white">P</span>
                        </div>
                        <div>
                            <span className="text-lg font-black tracking-tight text-white">PAZARYONETIMI</span>
                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Pro Dashboard</div>
                        </div>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-4 border-b border-border">
                    <div className="flex gap-2">
                        <button
                            onClick={openQuickSale}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-xs font-bold text-primary transition-all"
                        >
                            <Zap size={14} /> Hızlı Satış
                        </button>
                        <button
                            onClick={openAddProduct}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl text-xs font-bold text-green-500 transition-all"
                        >
                            <Package size={14} /> Ürün Ekle
                        </button>
                    </div>
                </div>

                <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {sections.map((section) => (
                        <div key={section.title} className="mb-1">
                            <button
                                onClick={() => toggleSection(section.title)}
                                aria-expanded={expandedSection === section.title}
                                aria-controls={`nav-section-${section.title}`}
                                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-400 transition-colors"
                            >
                                {section.title}
                                <ChevronDown
                                    size={14}
                                    aria-hidden="true"
                                    className={`transition-transform duration-200 ${expandedSection === section.title ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <AnimatePresence>
                                {expandedSection === section.title && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        {section.items.map((item) => {
                                            const isActive = pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group mb-1 ${isActive
                                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-foreground'
                                                        }`}
                                                >
                                                    <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                                                    <span className="text-sm font-medium flex-1">{item.label}</span>
                                                    <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-primary transition-all shadow-sm">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    {item.badge && (
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badge === '!'
                                                            ? 'bg-orange-500/20 text-orange-400'
                                                            : 'bg-primary/20 text-primary'
                                                            }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {item.pro && !hasModuleAccess(item.moduleKey || '') && (
                                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-white uppercase flex items-center gap-1">
                                                            <Lock size={8} /> Pro
                                                        </span>
                                                    )}
                                                    {item.pro && hasModuleAccess(item.moduleKey || '') && (
                                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-green-500 to-emerald-500 text-white uppercase flex items-center gap-1">
                                                            <Crown size={8} /> Aktif
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="p-4 mt-auto border-t border-border">
                    {/* Subscription Card */}
                    <div className="bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl p-4 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-xs font-black text-primary uppercase">{tenantPlan} Plan</span>
                        </div>
                        <div className="text-sm font-bold text-foreground mb-3">Tüm özelliklere erişin</div>
                        <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden mb-2">
                            <div className="bg-gradient-to-r from-primary to-purple-500 w-3/4 h-full rounded-full" />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>75/100 Modül</span>
                            <Link href="/dashboard/upgrade" className="text-primary font-bold hover:underline">Yükselt →</Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-[100dvh]">
                {/* Header */}
                <header role="banner" aria-label="Üst menü" className="h-20 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40 safe-area-top">
                    <div className="h-full px-4 lg:px-8 flex items-center justify-between max-w-screen-2xl mx-auto w-full">
                        {/* Mobile: Page title area / Desktop: Command Palette */}
                        <div className="hidden lg:block flex-1 max-w-md">
                            <CommandPalette />
                        </div>
                        <div className="lg:hidden flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-sm font-black italic text-white">P</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">Pazar Yönetimi</span>
                        </div>

                        <div className="flex items-center gap-4 lg:gap-8">
                            {/* System Status - sadece desktop */}
                            <div className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 transition-all hover:bg-emerald-500/10">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                <span className="text-[11px] font-black text-emerald-500 uppercase tracking-wider">Sistemler Aktif</span>
                            </div>

                            <div className="flex items-center gap-1.5 lg:gap-2">
                                <NotificationBell />
                                <AnnouncementDropdown
                                    announcements={activeAnnouncements}
                                    unreadCount={unreadCount}
                                    onRead={markAsRead}
                                    onDismiss={dismiss}
                                />
                                <button aria-label="Yardım" className="hidden sm:flex p-2.5 rounded-xl hover:bg-surface text-slate-400 hover:text-foreground transition-all group">
                                    <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={toggleTheme}
                                    aria-label="Tema değiştir"
                                    className="p-2.5 rounded-xl hover:bg-surface text-slate-400 hover:text-foreground transition-all group"
                                    title={resolvedMode === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
                                >
                                    {resolvedMode === 'dark' ?
                                        <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" /> :
                                        <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                                    }
                                </button>
                            </div>

                            <div className="hidden lg:block h-8 w-px bg-border/60 mx-1" />

                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-2 lg:gap-4 group p-1 lg:p-1.5 lg:pr-3 rounded-2xl hover:bg-surface transition-all active:scale-95 border border-transparent hover:border-border"
                                >
                                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs lg:text-sm font-black text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform ring-2 ring-background">
                                        {session?.user?.name ?
                                            (session.user.name as string).split(' ').map((n: string) => n[0]).join('').toUpperCase() :
                                            'AY'}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <div className="text-sm font-black text-foreground group-hover:text-primary transition-colors leading-tight">{session?.user?.name || 'Kullanıcı'}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Yönetici</div>
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''} hidden sm:block`} />
                                </button>

                                <AnimatePresence>
                                    {profileMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-[60]"
                                                onClick={() => setProfileMenuOpen(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-2xl shadow-2xl z-[61] overflow-hidden"
                                            >
                                                <div className="p-4 bg-background/50 border-b border-border">
                                                    <div className="text-sm font-bold text-foreground">{session.user?.name}</div>
                                                    <div className="text-xs text-slate-500 truncate">{session.user?.email}</div>
                                                </div>
                                                <div className="p-2">
                                                    <Link
                                                        href="/dashboard/settings/profile"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-medium text-slate-400 hover:text-foreground transition-all"
                                                    >
                                                        <User size={16} /> Profil Düzenle
                                                    </Link>
                                                    <Link
                                                        href="/dashboard/settings"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm font-medium text-slate-400 hover:text-foreground transition-all"
                                                    >
                                                        <Settings size={16} /> Hesap Ayarları
                                                    </Link>
                                                    <div className="h-px bg-border my-2 mx-1" />
                                                    <button
                                                        onClick={() => signOut()}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm font-medium text-red-400 transition-all"
                                                    >
                                                        <LogOut size={16} /> Çıkış Yap
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content with Sidebar */}
                <div className="flex flex-1 flex-col lg:flex-row min-h-0">
                    <main id="main-content" role="main" aria-label="Ana içerik" className="flex-1 p-4 lg:p-8 overflow-x-hidden pb-40 lg:pb-8">
                        {/* Announcement Banner - Sabit Duyurular */}
                        <AnnouncementBanner
                            announcements={activeAnnouncements}
                            onDismiss={dismiss}
                            onRead={markAsRead}
                        />
                        {children}
                    </main>
                    <LiveFeed />
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav onMenuOpen={() => setMobileMenuOpen(true)} />

            {/* Mobile Sidebar Drawer */}
            <MobileSidebar
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <KeyboardShortcutsHelp />
            <AICopilot />
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ModuleProvider>
            <WebSocketProvider>
                <ToastProvider>
                    <QuickActionsProvider>
                        <ErrorBoundary>
                            <DashboardLayoutContent>{children}</DashboardLayoutContent>
                        </ErrorBoundary>
                    </QuickActionsProvider>
                </ToastProvider>
            </WebSocketProvider>
        </ModuleProvider>
    );
}
