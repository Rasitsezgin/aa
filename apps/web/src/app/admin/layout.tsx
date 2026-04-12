"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from '@/providers/theme-provider';
import "@/app/globals.css";
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';

    // Login page renders its own full-screen layout
    if (isLoginPage) {
        return (
            <html lang="tr" suppressHydrationWarning>
                <body className="antialiased">
                    <ThemeProvider>
                        <SessionProvider>
                            {children}
                        </SessionProvider>
                    </ThemeProvider>
                </body>
            </html>
        );
    }

    return (
        <html lang="tr" suppressHydrationWarning>
            <body className="antialiased">
                <ThemeProvider>
                    <SessionProvider>
                        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                            {/* Simple Admin Header */}
                            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                    <div className="flex items-center justify-between h-16">
                                        <div className="flex items-center gap-4">
                                            <Link
                                                href="/"
                                                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                <span className="text-sm font-medium">Ana Sayfa</span>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                                    <Shield className="w-4 h-4 text-white" />
                                                </div>
                                                <h1 className="text-lg font-black text-foreground">Admin Panel</h1>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <Link
                                                href="/dashboard"
                                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                Dashboard
                                            </Link>
                                            <div className="text-xs text-slate-500">
                                                Admin Girişi
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            {/* Main Content */}
                            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                {children}
                            </main>
                        </div>
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
