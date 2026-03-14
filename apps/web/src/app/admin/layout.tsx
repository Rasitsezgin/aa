"use client";

import React from 'react';
import {
    ShieldCheck,
    Users,
    Layers,
    Settings,
    CreditCard,
    Activity,
    Bell,
    Globe,
    Sparkles,
    MessageSquare,
    Link2,
    Package,
    ShoppingBag,
    Mail,
    Sun,
    Moon,
    Lock,
    UserCog,
    Flag,
    Megaphone,
    Rocket,
    Zap,
    TrendingUp,
    Target,
    RefreshCcw,
    Server,
    Database,
    FileText,
    PieChart,
    BarChart3,
    Terminal,
    Search,
    ChevronDown,
    Menu,
    X,
    LogOut,
    Plus,
    Filter,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from '@/components/admin/CommandPalette';

interface SidebarItem {
    icon: any;
    label: string;
    href: string;
    badge?: string;
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const sections: SidebarSection[] = [
        {
            title: "Genel",
            items: [
                { icon: Activity, label: "Dashboard", href: "/admin" },
                { icon: Target, label: "Stratejik Savaş Odası", href: "/admin/war-room" },
                { icon: ShoppingBag, label: "Siparişler", href: "/admin/orders", badge: "12" },
                { icon: Package, label: "Ürünler", href: "/admin/products" },
                { icon: Users, label: "Müşteriler", href: "/admin/customers" },
            ],
        },
        {
            title: "Yönetim",
            items: [
                { icon: PieChart, label: "Raporlar", href: "/admin/reports" },
                { icon: Megaphone, label: "Kampanyalar", href: "/admin/campaigns" },
                { icon: Mail, label: "E-Bülten", href: "/admin/newsletter" },
                { icon: MessageSquare, label: "Yorumlar", href: "/admin/reviews" },
            ],
        },
        {
            title: "Sistem",
            items: [
                { icon: Globe, label: "Mağazalar", href: "/admin/stores" },
                { icon: Server, label: "Depo Yönetimi", href: "/admin/warehouse" },
                { icon: Layers, label: "Kategoriler", href: "/admin/categories" },
                { icon: CreditCard, label: "Ödemeler", href: "/admin/payments" },
            ],
        },
        {
            title: "Teknik",
            items: [
                { icon: Zap, label: "API Kullanımı", href: "/admin/api-usage" },
                { icon: Sparkles, label: "AI Studio 2.0", href: "/admin/ai-studio" },
                { icon: TrendingUp, label: "What-If Simulator", href: "/admin/what-if" },
                { icon: Flag, label: "Feature Flags", href: "/admin/feature-flags" },
                { icon: Sparkles, label: "AI Modelleri", href: "/admin/ai-models" },
                { icon: Link2, label: "Entegrasyonlar", href: "/admin/integrations" },
                { icon: Database, label: "Veritabanı", href: "/admin/database" },
                { icon: Terminal, label: "Audit Logları", href: "/admin/audit-logs" },
            ],
        },
        {
            title: "Ayarlar",
            items: [
                { icon: Settings, label: "Genel Ayarlar", href: "/admin/settings" },
                { icon: ShieldCheck, label: "Güvenlik", href: "/admin/security" },
                { icon: Lock, label: "Yetkilendirme", href: "/admin/roles" },
                { icon: UserCog, label: "Profilim", href: "/admin/profile" },
            ],
        },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#050505]">
            {/* Command Palette */}
            <CommandPalette />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#090909]
                ${isSidebarOpen ? 'w-64' : 'w-20'} 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            {isSidebarOpen && (
                                <span className="font-black text-lg tracking-tighter dark:text-white">PAZAR<span className="text-zinc-400">YONETIMI</span></span>
                            )}
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 custom-scrollbar">
                        {sections.map((section, idx) => (
                            <div key={idx} className="space-y-2">
                                {isSidebarOpen && (
                                    <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                        {section.title}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {section.items.map((item, itemIdx) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={itemIdx}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group relative
                                                ${isActive
                                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                                        : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
                                                    }`}
                                            >
                                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'group-hover:scale-110 transition-transform'}`} />
                                                {isSidebarOpen && (
                                                    <span className="text-sm font-bold tracking-tight whitespace-nowrap">{item.label}</span>
                                                )}
                                                {item.badge && isSidebarOpen && (
                                                    <span className="ml-auto bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-md">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {/* Tooltip for collapsed mode */}
                                                {!isSidebarOpen && (
                                                    <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-xl border border-white/5">
                                                        {item.label}
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={toggleSidebar}
                            className="w-full h-10 flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-all text-zinc-500"
                        >
                            <RefreshCcw className={`w-4 h-4 transition-transform duration-500 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
                            {isSidebarOpen && <span className="text-xs font-bold">Paneli Daralt</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`transition-all duration-300 min-h-screen pt-16
                ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}
            >
                {/* Header Overlay */}
                <header className="fixed top-0 right-0 left-0 lg:left-auto lg:right-0 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 z-30 transition-all duration-300"
                    style={{ left: isSidebarOpen && window.innerWidth >= 1024 ? '16rem' : window.innerWidth >= 1024 ? '5rem' : '0' }}>
                    <div className="h-16 px-8 flex items-center justify-between">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-zinc-500"
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>

                        <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-zinc-400">
                            <span>Sistem Durumu: <span className="text-emerald-500">Aktif</span></span>
                            <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                            <span>Son Senkronizasyon: 2 dk önce</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#050505]" />
                            </button>
                            <div className="flex items-center gap-3 pl-6 border-l border-zinc-200 dark:border-zinc-800">
                                <div className="text-right flex flex-col items-end">
                                    <span className="text-sm font-black dark:text-white">Erdem Eroğlu</span>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Super Admin</span>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black">
                                    EE
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.05);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.05);
                }
            `}</style>
        </div>
    );
}
