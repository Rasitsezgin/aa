'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Crown,
  CreditCard,
  Shield,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

function getInitials(name?: string | null) {
  if (!name) return 'PY';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const menuItems = [
  { href: '/dashboard/settings/profile', label: 'Profilim', icon: User, accent: 'text-blue-500 bg-blue-500/10' },
  { href: '/dashboard/settings', label: 'Hesap Ayarları', icon: Settings, accent: 'text-slate-500 bg-slate-500/10' },
  { href: '/dashboard/payments', label: 'Ödemeler & Plan', icon: CreditCard, accent: 'text-emerald-500 bg-emerald-500/10' },
  { href: '/dashboard/security', label: 'Güvenlik', icon: Shield, accent: 'text-violet-500 bg-violet-500/10' },
];

interface DashboardUserMenuProps {
  session: Session | null;
  tenantPlan?: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function DashboardUserMenu({ session, tenantPlan = 'Pro', open, onToggle, onClose }: DashboardUserMenuProps) {
  const name = session?.user?.name || 'Kullanıcı';
  const email = session?.user?.email || '';
  const initials = getInitials(session?.user?.name);
  const planLabel = tenantPlan || 'Pro';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`group flex items-center gap-2 lg:gap-3 pl-1 pr-2 lg:pr-3 py-1 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
          open
            ? 'bg-orange-500/8 border-orange-500/25 shadow-lg shadow-orange-500/10'
            : 'bg-surface/60 border-border/80 hover:border-orange-500/20 hover:bg-surface'
        }`}
      >
        <div className="relative">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center text-xs lg:text-sm font-black text-white shadow-md shadow-orange-500/25 ring-2 ring-background group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        </div>

        <div className="text-left hidden lg:block min-w-0 max-w-[140px]">
          <div className="text-sm font-black text-foreground truncate leading-tight group-hover:text-orange-600 transition-colors">
            {name}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Crown size={10} className="text-amber-500 shrink-0" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{planLabel}</span>
          </div>
        </div>

        <ChevronDown
          size={14}
          className={`text-slate-400 shrink-0 transition-transform duration-200 hidden sm:block ${open ? 'rotate-180 text-orange-500' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={onClose} aria-hidden="true" />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 mt-3 w-[min(100vw-2rem,18rem)] sm:w-72 bg-surface/95 backdrop-blur-xl border border-border rounded-[1.35rem] shadow-2xl shadow-black/20 z-[61] overflow-hidden"
            >
              <div className="relative p-4 border-b border-border overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/12 via-transparent to-amber-500/8 pointer-events-none" />
                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-orange-500/20">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-foreground truncate">{name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-600 uppercase tracking-wider">
                      <Sparkles size={10} />
                      {planLabel} Plan
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-background/80 text-sm font-semibold text-foreground transition-all group"
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.accent}`}>
                      <item.icon size={15} />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <ExternalLink size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>

              <div className="px-3 pb-3">
                <Link
                  href="/dashboard/upgrade"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black shadow-lg shadow-orange-500/20 hover:from-orange-500 hover:to-amber-500 transition-all"
                >
                  <Crown size={14} />
                  Planı Yükselt
                </Link>
              </div>

              <div className="p-2 border-t border-border bg-background/40">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm font-semibold text-red-500 transition-all"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <LogOut size={15} />
                  </span>
                  Çıkış Yap
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
