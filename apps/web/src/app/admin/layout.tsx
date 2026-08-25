"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ArrowLeft,
    Shield,
    LayoutDashboard,
    Users,
    CreditCard,
    Activity,
    Settings,
    Server,
    FileText,
    BarChart3,
    Layers,
    Shield as ShieldIcon,
    Globe,
    Package,
    MessageSquare,
    Bell,
    FolderOpen,
    Zap,
    HardDrive,
    Terminal,
    Calendar,
    BookOpen,
    Search,
    Sparkles,
    Building2,
    ShieldCheck,
    Cpu,
    TrendingUp,
    Tag,
    Clock,
    Store,
    ExternalLink,
    Menu,
    X,
    Sliders
} from 'lucide-react';
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { ThemeProvider } from '@/providers/theme-provider';
import "@/app/globals.css";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: 'Genel & Yönetim',
        items: [
            { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
            { name: 'Savaş Odası (War Room)', href: '/admin/war-room', icon: Activity, badge: 'Canlı' },
            { name: 'Sistem Sağlığı', href: '/admin/health', icon: Server },
            { name: 'Finansal Röntgen', href: '/admin/finance', icon: BarChart3 },
        ],
    },
    {
        title: 'Ticaret & Pazaryeri',
        items: [
            { name: 'Ürün Yönetimi', href: '/admin/products', icon: Package },
            { name: 'Siparişler', href: '/admin/orders', icon: CreditCard },
            { name: 'Müşteriler', href: '/admin/customers', icon: Users },
            { name: 'Pazaryeri Kataloğu', href: '/admin/integrations', icon: Globe },
            { name: 'Fiyatlandırma & Paketler', href: '/admin/pricing', icon: Tag },
        ],
    },
    {
        title: 'Kullanıcılar & Mağazalar',
        items: [
            { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
            { name: 'Kiracılar (Mağazalar)', href: '/admin/tenants', icon: Building2 },
            { name: 'Roller & Yetkiler', href: '/admin/roles', icon: ShieldCheck },
            { name: 'Abonelikler', href: '/admin/subscriptions', icon: Layers },
            { name: 'Teklifler', href: '/admin/offers', icon: Sparkles },
        ],
    },
    {
        title: 'İçerik & Topluluk',
        items: [
            { name: 'Blog & Makaleler', href: '/admin/blog', icon: FileText },
            { name: 'Yardım Merkezi', href: '/admin/help', icon: BookOpen },
            { name: 'Forum Yönetimi', href: '/admin/forum', icon: MessageSquare },
            { name: 'Forum Moderasyon', href: '/admin/forum/moderation', icon: Shield },
            { name: 'Topluluk Etkinlikleri', href: '/admin/community/events', icon: Calendar },
            { name: 'Duyurular', href: '/admin/announcements', icon: Bell },
            { name: 'Popuplar', href: '/admin/popups', icon: Zap },
        ],
    },
    {
        title: 'AI Stüdyo & Araçlar',
        items: [
            { name: 'AI Studio', href: '/admin/ai-studio', icon: Sparkles, badge: 'AI' },
            { name: 'AI Modelleri', href: '/admin/ai-models', icon: Cpu },
            { name: 'Toplu İşlemler', href: '/admin/bulk', icon: FolderOpen },
            { name: 'Senaryo Analizi (What-If)', href: '/admin/what-if', icon: TrendingUp },
            { name: 'SEO & Sayfa Yönetimi', href: '/admin/seo', icon: Search },
        ],
    },
    {
        title: 'Sistem & Güvenlik',
        items: [
            { name: 'Sistem Yönetimi', href: '/admin/system-management', icon: Terminal },
            { name: 'Güvenlik & Audit', href: '/admin/security', icon: ShieldIcon },
            { name: 'Arka Plan Görevleri', href: '/admin/tasks', icon: Clock },
            { name: 'Veritabanı Yedekleri', href: '/admin/backups', icon: HardDrive },
            { name: 'Sistem Logları', href: '/admin/logs', icon: Activity },
            { name: 'API & Rate Limit', href: '/admin/api-usage', icon: Sliders },
            { name: 'SaaS Modülleri', href: '/admin/modules', icon: Layers },
            { name: 'Sistem Ayarları', href: '/admin/settings', icon: Settings },
        ],
    },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const { data: session } = useSession();

    const allNavItems = useMemo(() => navGroups.flatMap(g => g.items), []);

    // Aktif sayfa başlığını en uzun eşleşen rotaya göre bul
    const activeItem = useMemo(() => {
        const matching = allNavItems.filter(item =>
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
        );
        matching.sort((a, b) => b.href.length - a.href.length);
        return matching[0] || { name: 'Admin Panel', href: '/admin' };
    }, [pathname, allNavItems]);

    // Arama filtreli gruplar
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return navGroups;
        const q = searchQuery.toLowerCase();
        return navGroups.map(group => ({
            ...group,
            items: group.items.filter(it => it.name.toLowerCase().includes(q) || it.href.toLowerCase().includes(q)),
        })).filter(group => group.items.length > 0);
    }, [searchQuery]);

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${isLoginPage ? '' : 'flex'}`}>
            {/* Sidebar Desktop */}
            {!isLoginPage && (
                <aside className="hidden lg:flex w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-screen sticky top-0 z-30 shadow-sm">
                    {/* Header Logo */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <Link href="/admin" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-rose-500 rounded-xl flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">PazarYönetimi</h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SuperAdmin Paneli</span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="px-4 pt-4 pb-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Menüde hızlı ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Scrollable */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        {filteredGroups.map((group) => (
                            <div key={group.title} className="space-y-1">
                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {group.title}
                                </div>
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                                    isActive
                                                        ? 'bg-white/20 text-white'
                                                        : item.badge === 'Canlı'
                                                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    {/* Quick Link Footer */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1 bg-slate-50/50 dark:bg-slate-900/50">
                        <Link
                            href="/dashboard"
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-indigo-500" />
                                <span>Satıcı Paneli</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Ana Sayfaya Dön</span>
                        </Link>
                    </div>
                </aside>
            )}

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar Header */}
                {!isLoginPage && (
                    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
                        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
                            {/* Mobile Hamburger & Breadcrumb */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMobileOpen(!mobileOpen)}
                                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                                >
                                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Link href="/admin" className="hover:text-blue-500">Admin</Link>
                                        <span>/</span>
                                        <span className="text-slate-600 dark:text-slate-300 font-medium">{activeItem.name}</span>
                                    </div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{activeItem.name}</h2>
                                </div>
                            </div>

                            {/* Topbar Actions */}
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                >
                                    <Store className="w-3.5 h-3.5" />
                                    <span>Mağaza Paneline Geç</span>
                                </Link>

                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                                {/* User profile preview */}
                                <div className="flex items-center gap-2.5 pl-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                        {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                            {session?.user?.name || session?.user?.email?.split('@')[0] || 'Admin'}
                                        </div>
                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Süper Yetkili
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Mobile Drawer */}
                {mobileOpen && !isLoginPage && (
                    <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex">
                        <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 font-black text-sm">
                                    <Shield className="w-5 h-5 text-red-500" />
                                    <span>Admin Menüsü</span>
                                </div>
                                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="space-y-4">
                                {navGroups.map(group => (
                                    <div key={group.title} className="space-y-1">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{group.title}</div>
                                        {group.items.map(it => (
                                            <Link
                                                key={it.href}
                                                href={it.href}
                                                onClick={() => setMobileOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <it.icon className="w-4 h-4 text-slate-400" />
                                                <span>{it.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-1" onClick={() => setMobileOpen(false)}></div>
                    </div>
                )}

                {/* Page Content */}
                <main className={`${isLoginPage ? 'min-h-screen' : 'flex-1'} ${isLoginPage ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
                    {isLoginPage ? children : <AdminRouteGuard>{children}</AdminRouteGuard>}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <SessionProvider>
                <AdminLayoutInner>{children}</AdminLayoutInner>
            </SessionProvider>
        </ThemeProvider>
    );
}
