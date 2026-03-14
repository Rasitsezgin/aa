'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Bot,
    Menu,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
    onMenuOpen: () => void;
}

const navItems = [
    { icon: LayoutDashboard, label: 'Ana Sayfa', href: '/dashboard' },
    { icon: ShoppingCart, label: 'Siparişler', href: '/dashboard/orders', badge: '12' },
    { icon: Package, label: 'Ürünler', href: '/dashboard/products' },
    { icon: Bot, label: 'AI Danışman', href: '/dashboard/ai-advisor' },
];

export default function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
    const pathname = usePathname();
    const currentPath = pathname ?? '';

    const isActive = (href: string) => {
        if (href === '/dashboard') return currentPath === '/dashboard';
        return currentPath.startsWith(href);
    };

    return (
        <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-[100] lg:hidden">
            {/* Frosted glass background */}
            <div className="absolute inset-0 bg-surface/90 backdrop-blur-2xl border-t border-border" />

            <div className="relative flex items-end justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center min-w-[64px] py-1 relative group active:scale-90 transition-transform duration-150"
                        >
                            {/* Active indicator pill */}
                            {active && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}

                            <div className="relative">
                                <item.icon
                                    size={22}
                                    strokeWidth={active ? 2.5 : 1.8}
                                    className={`transition-colors duration-200 ${active ? 'text-primary' : 'text-slate-400'
                                        }`}
                                />
                                {/* Badge */}
                                {item.badge && (
                                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center px-1 text-[9px] font-black text-white bg-red-500 rounded-full leading-none">
                                        {item.badge}
                                    </span>
                                )}
                            </div>

                            <span
                                className={`text-[10px] mt-1 font-semibold transition-colors duration-200 ${active ? 'text-primary' : 'text-slate-500'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* More/Menu button */}
                <button
                    onClick={onMenuOpen}
                    className="flex flex-col items-center justify-center min-w-[64px] py-1 active:scale-90 transition-transform duration-150"
                >
                    <Menu size={22} strokeWidth={1.8} className="text-slate-400" />
                    <span className="text-[10px] mt-1 font-semibold text-slate-500">Menü</span>
                </button>
            </div>
        </nav>
    );
}
