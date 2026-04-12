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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/admin/login";
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check if dark mode is stored in localStorage
        const isDarkMode = localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDark(isDarkMode);
        applyTheme(isDarkMode);
    }, []);

    const applyTheme = (dark: boolean) => {
        const html = document.documentElement;
        if (dark) {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        applyTheme(newDark);
    };

    const menuItems = [
        { icon: Activity, label: "Sistem Durumu", href: "/admin" },
        { icon: Users, label: "Kiracılar (Tenants)", href: "/admin/tenants" },
        { icon: Package, label: "Paket Siparişleri", href: "/admin/subscriptions", badge: 3 },
        { icon: ShoppingBag, label: "Ürün Siparişleri", href: "/admin/orders" },
        { icon: Mail, label: "E-posta Raporları", href: "/admin/reports" },
        { icon: Layers, label: "Modül Yönetimi", href: "/admin/modules" },
        { icon: Sparkles, label: "AI Model Yönetimi", href: "/admin/ai-models" },
        { icon: Link2, label: "Entegrasyonlar", href: "/admin/integrations" },
        { icon: CreditCard, label: "Finans & Gelir", href: "/admin/finance" },
        { icon: Bell, label: "Bildirim & Duyuru", href: "/admin/notifications" },
        { icon: MessageSquare, label: "Destek Merkezi", href: "/admin/support" },
        { icon: UserCog, label: "Rol Yönetimi", href: "/admin/roles" },
        { icon: ShieldCheck, label: "Denetim Kayıtları", href: "/admin/logs" },
        { icon: Globe, label: "Ana Sayfa İçerik", href: "/admin/homepage" },
        { icon: Lock, label: "Giriş & Kimlik", href: "/admin/settings/auth" },
        { icon: Settings, label: "Sistem Ayarları", href: "/admin/settings" },
    ];

    if (isLoginPage) {
        return <div className="min-h-screen bg-slate-100 dark:bg-[#020617]">{children}</div>;
    }

    return (
        <div className="flex min-h-screen bg-slate-100 dark:bg-[#020617] text-slate-800 dark:text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 flex flex-col fixed inset-y-0 shadow-sm dark:shadow-none">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/20">A</div>
                        <span className="text-sm font-black tracking-tighter uppercase whitespace-nowrap text-slate-900 dark:text-white">PLATFORM ADMIN</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold relative ${isActive
                                    ? 'bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 ml-64">
                <header className="h-16 border-b border-slate-200 dark:border-white/5 px-8 flex items-center justify-between bg-white dark:bg-transparent">
                    <h2 className="text-sm font-black tracking-widest text-slate-500 dark:text-slate-500 uppercase">SİSTEM KONTROL MERKEZİ</h2>
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            {isDark ? (
                                <Sun size={18} className="text-yellow-500" />
                            ) : (
                                <Moon size={18} className="text-slate-600" />
                            )}
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold border border-green-200 dark:border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                            SERVER: ONLINE
                        </div>
                        <ShieldCheck className="text-slate-400 dark:text-slate-500" size={20} />
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
