'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/providers/theme-provider';
import { useOrderStats } from '@/lib/hooks';
import { getBottomNavItems } from '@/lib/navigation.config';
import { resolveNavIcon } from '@/lib/navigation-icons';

interface MobileBottomNavProps {
  onMenuOpen: () => void;
  onHaptic?: () => void;
}

export default function MobileBottomNav({ onMenuOpen, onHaptic }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { data: orderStats } = useOrderStats();
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = prefersReducedMotion || !theme.animations;
  const currentPath = pathname ?? '';
  const navItems = getBottomNavItems();

  const isActive = (href: string) => {
    if (href === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(href);
  };

  return (
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-[100] lg:hidden px-2 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]">
      <div className="mobile-bottom-nav-inner relative mx-auto flex items-end justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = resolveNavIcon(item.icon);
          const badge = item.id === 'orders' ? orderStats?.today?.total : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onHaptic}
              className="flex flex-col items-center justify-center min-w-[64px] py-1 relative group active:scale-90 transition-transform duration-150 haptic-tap"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-orange-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                className="relative"
                animate={active && !shouldReduceMotion ? { y: [0, -3, 0], scale: [1, 1.08, 1] } : { y: 0, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.34, ease: 'easeOut' }}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`transition-colors duration-200 ${active ? 'text-orange-500' : 'text-slate-400'}`}
                />
                {badge !== undefined && Number(badge) > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </motion.div>
              <span className={`text-[10px] font-bold mt-1 transition-colors ${active ? 'text-orange-500' : 'text-slate-500'}`}>
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => {
            onHaptic?.();
            onMenuOpen();
          }}
          aria-label="Menüyü aç"
          className="flex flex-col items-center justify-center min-w-[64px] py-1 active:scale-90 transition-transform haptic-tap"
        >
          <Menu size={22} className="text-slate-400" />
          <span className="text-[10px] font-bold mt-1 text-slate-500">Menü</span>
        </button>
      </div>
    </nav>
  );
}
