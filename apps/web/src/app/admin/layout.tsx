"use client";

import React from 'react';
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
    Database,
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
    Eye,
    HardDrive,
    Upload,
    Terminal
} from 'lucide-react';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from '@/providers/theme-provider';
import "@/app/globals.css";

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Kullanıcılar', href: '/admin/users', icon: Users },
    { name: 'Müşteriler', href: '/admin/customers', icon: Users },
    { name: 'Ürünler', href: '/admin/products', icon: Package },
    { name: 'Siparişler', href: '/admin/orders', icon: CreditCard },
    { name: 'Finans', href: '/admin/finance', icon: BarChart3 },
    { name: 'İçerik', href: '/admin/blog', icon: FileText },
    { name: 'Forum', href: '/admin/forum', icon: MessageSquare },
    { name: 'Bildirimler', href: '/admin/notifications', icon: Bell },
    { name: 'Entegrasyonlar', href: '/admin/integrations', icon: Globe },
    { name: 'Modüller', href: '/admin/modules', icon: Layers },
    { name: 'Güvenlik', href: '/admin/security', icon: ShieldIcon },
    { name: 'Yedekler', href: '/admin/backups', icon: HardDrive },
    { name: 'Sistem Yönetimi', href: '/admin/system-management', icon: Server },
    { name: 'Görevler', href: '/admin/tasks', icon: FolderOpen },
    { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    return (
        <html lang="tr" suppressHydrationWarning>
            <body className="antialiased">
                <ThemeProvider>
                    <SessionProvider>
                        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${isLoginPage ? '' : 'flex'}`}>
                            {/* Sidebar - Only show if not login page */}
                            {!isLoginPage && (
                                <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                                    <div className="flex flex-col h-full">
                                        {/* Header */}
                                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-lg font-black text-foreground">Admin Panel</h1>
                                                    <p className="text-xs text-slate-500">Sistem Yönetimi</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation */}
                                        <nav className="flex-1 p-4 space-y-1">
                                            {navigation.map((item) => {
                                                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            isActive
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        <item.icon className="w-5 h-5" />
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}
                                        </nav>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                            <Link
                                                href="/"
                                                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Ana Sayfa
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Content */}
                            <div className={`flex-1 flex flex-col ${isLoginPage ? '' : ''}`}>
                                {/* Top Bar - Only show if not login page */}
                                {!isLoginPage && (
                                    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <div className="px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-slate-500">
                                                    {pathname === '/admin' ? 'Dashboard' : navigation.find(item => pathname.startsWith(item.href))?.name || 'Admin Panel'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    Admin Girişi
                                                </div>
                                            </div>
                                        </div>
                                    </header>
                                )}

                                {/* Page Content */}
                                <main className={`${isLoginPage ? 'min-h-screen' : 'flex-1'} ${isLoginPage ? '' : 'p-6'}`}>
                                    {children}
                                </main>
                            </div>
                        </div>
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
