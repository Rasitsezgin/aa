"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Package, Sparkles, ChevronRight, Zap, ChevronDown, Lock, Crown } from 'lucide-react';
import { getSidebarSections, getPageTitle } from '@/lib/navigation.config';
import { filterNavSections } from '@/lib/rbac/nav-access';
import { resolveNavIcon } from '@/lib/navigation-icons';
import { DashboardRouteGuard } from '@/components/dashboard/DashboardRouteGuard';
import LiveFeed from '@/components/LiveFeed';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ModuleProvider, useModules, useAnnouncements } from '@/lib/modules';
import { useOrderStats } from '@/lib/hooks';
import { AnnouncementBanner } from '@/components/announcements/AnnouncementComponents';
import { DashboardHeaderBar } from '@/components/dashboard/DashboardHeaderBar';
import { useTheme } from '@/providers/theme-provider';
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/components/dashboard/KeyboardShortcuts';
import { WebSocketProvider } from '@/providers/websocket-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import MobileSidebar from '@/components/dashboard/MobileSidebar';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { QuickActionsProvider, useQuickActions } from '@/providers/quick-actions-provider';
import AICopilot from '@/components/dashboard/AICopilot';
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";


function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [expandedSection, setExpandedSection] = useState<string | null>('Günlük');
    const { hasModuleAccess, tenantPlan, enabledModules, allModules, panelRole, criticalStockCount } = useModules();
    const sidebarSections = useMemo(() => filterNavSections(getSidebarSections(), panelRole), [panelRole]);
    const { data: orderStats } = useOrderStats();
    const { active: activeAnnouncements, unreadCount, markAsRead, dismiss } = useAnnouncements();
    const { theme, toggleTheme, resolvedMode } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isCompactHeader, setIsCompactHeader] = useState(false);
    const [showLiveFeed, setShowLiveFeed] = useState(true);
    const [platformTransitionDuration, setPlatformTransitionDuration] = useState(0.24);
    const prefersReducedMotion = useReducedMotion();
    const shouldReduceMotion = prefersReducedMotion || !theme.animations;
    const { openQuickSale, openAddProduct } = useQuickActions();
    const [creditMenuOpen, setCreditMenuOpen] = useState(false);
    useKeyboardShortcuts();

    const currentPageTitle = useMemo(() => getPageTitle(pathname ?? '/dashboard'), [pathname]);

    const activeModuleCount = useMemo(() => {
        if (enabledModules.length > 0) return enabledModules.length;
        return allModules.filter((m) => hasModuleAccess(m.key)).length;
    }, [enabledModules, allModules, hasModuleAccess]);

    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(8);
        }
    };

    // Auth guard - redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login?callbackUrl=' + encodeURIComponent(pathname ?? '/dashboard'));
        }
    }, [status, router, pathname]);

    // Sayfa yüklendiğinde aktif olan bölümü açık getir
    useEffect(() => {
        const activeSection = sidebarSections.find(s => s.items.some(i => i.href === pathname || (pathname?.startsWith(i.href) && i.href !== '/dashboard')));
        if (activeSection) {
            const timer = setTimeout(() => setExpandedSection(activeSection.title), 0);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

    // Persist LiveFeed preference
    useEffect(() => {
        const saved = localStorage.getItem('dashboard_show_live_feed');
        if (saved !== null) {
            setShowLiveFeed(saved === 'true');
        }
    }, []);

    const toggleLiveFeed = () => {
        const newVal = !showLiveFeed;
        setShowLiveFeed(newVal);
        localStorage.setItem('dashboard_show_live_feed', String(newVal));
        triggerHaptic();
    };

    useEffect(() => {
        const onScroll = () => {
            setIsCompactHeader(window.scrollY > 24);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);

        if (isIOS) {
            setPlatformTransitionDuration(0.3);
            return;
        }

        if (isAndroid) {
            setPlatformTransitionDuration(0.22);
            return;
        }

        setPlatformTransitionDuration(0.24);
    }, []);

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
        <div className="dashboard-mobile-shell flex min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden">
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
                    {sidebarSections.map((section) => (
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
                                            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard');
                                            const ItemIcon = resolveNavIcon(item.icon);
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group mb-1 ${isActive
                                                        ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-lg shadow-orange-500/5'
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-foreground'
                                                        }`}
                                                >
                                                    <ItemIcon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'group-hover:text-orange-500 transition-colors'}`} />
                                                    <span className="text-sm font-medium flex-1">{item.label}</span>
                                                    {item.label === 'Siparişler' ? (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                                            {orderStats?.today?.total || '0'}
                                                        </span>
                                                    ) : item.id === 'inventory' && criticalStockCount > 0 ? (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                                                            {criticalStockCount}
                                                        </span>
                                                    ) : item.badge && (
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
                            <div
                                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.round((activeModuleCount / Math.max(allModules.length, 1)) * 100))}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{activeModuleCount}/{allModules.length} Modül</span>
                            <Link href="/dashboard/upgrade" className="text-orange-500 font-bold hover:underline">Yükselt →</Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72 flex flex-col min-h-[100dvh]">
                <DashboardHeaderBar
                    currentPageTitle={currentPageTitle}
                    isCompactHeader={isCompactHeader}
                    session={session}
                    tenantPlan={tenantPlan}
                    creditMenuOpen={creditMenuOpen}
                    setCreditMenuOpen={setCreditMenuOpen}
                    profileMenuOpen={profileMenuOpen}
                    setProfileMenuOpen={setProfileMenuOpen}
                    showLiveFeed={showLiveFeed}
                    toggleLiveFeed={toggleLiveFeed}
                    resolvedMode={resolvedMode}
                    toggleTheme={toggleTheme}
                    triggerHaptic={triggerHaptic}
                    activeAnnouncements={activeAnnouncements}
                    unreadCount={unreadCount}
                    markAsRead={markAsRead}
                    dismiss={dismiss}
                />

                {/* Content with Sidebar */}
                <div className="flex flex-1 flex-col lg:flex-row min-h-0">
                    <main id="main-content" role="main" aria-label="Ana içerik" className="dashboard-mobile-content flex-1 p-4 lg:p-8 overflow-x-hidden pb-40 lg:pb-8">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={pathname}
                                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.995 }}
                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                                exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.995 }}
                                transition={{ duration: shouldReduceMotion ? 0.01 : platformTransitionDuration, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* Announcement Banner - Sabit Duyurular */}
                                <AnnouncementBanner
                                    announcements={activeAnnouncements}
                                    onDismiss={dismiss}
                                    onRead={markAsRead}
                                />
                                <DashboardRouteGuard>{children}</DashboardRouteGuard>
                            </motion.div>
                        </AnimatePresence>
                    </main>
                    <LiveFeed isOpen={showLiveFeed} onToggle={toggleLiveFeed} />
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav onMenuOpen={() => setMobileMenuOpen(true)} onHaptic={triggerHaptic} />

            {/* Mobile Sidebar Drawer */}
            <MobileSidebar
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                onHaptic={triggerHaptic}
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
                            <OnboardingProvider>
                                <DashboardLayoutContent>{children}</DashboardLayoutContent>
                            </OnboardingProvider>
                        </ErrorBoundary>
                    </QuickActionsProvider>
                </ToastProvider>
            </WebSocketProvider>
        </ModuleProvider>
    );
}
