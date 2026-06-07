'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from 'next-auth';
import {
  Zap,
  Sparkles,
  HelpCircle,
  Sun,
  Moon,
  Activity,
} from 'lucide-react';
import { CommandPalette } from '@/components/CommandPalette';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { AnnouncementDropdown } from '@/components/announcements/AnnouncementComponents';
import { DashboardUserMenu } from './DashboardUserMenu';
import { useModules } from '@/lib/modules';

interface DashboardHeaderBarProps {
  currentPageTitle: string;
  isCompactHeader: boolean;
  session: Session | null;
  tenantPlan?: string;
  creditMenuOpen: boolean;
  setCreditMenuOpen: (open: boolean) => void;
  profileMenuOpen: boolean;
  setProfileMenuOpen: (open: boolean) => void;
  showLiveFeed: boolean;
  toggleLiveFeed: () => void;
  resolvedMode: 'light' | 'dark';
  toggleTheme: () => void;
  triggerHaptic: () => void;
  activeAnnouncements: any[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  dismiss: (id: string) => void;
}

function HeaderIconButton({
  onClick,
  label,
  active,
  children,
  className = '',
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all duration-200 haptic-tap group ${
        active
          ? 'bg-orange-500/12 text-orange-600 border border-orange-500/20'
          : 'text-slate-400 hover:text-foreground hover:bg-background/80 border border-transparent'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function DashboardHeaderBar({
  currentPageTitle,
  isCompactHeader,
  session,
  tenantPlan,
  creditMenuOpen,
  setCreditMenuOpen,
  profileMenuOpen,
  setProfileMenuOpen,
  showLiveFeed,
  toggleLiveFeed,
  resolvedMode,
  toggleTheme,
  triggerHaptic,
  activeAnnouncements,
  unreadCount,
  markAsRead,
  dismiss,
}: DashboardHeaderBarProps) {
  const { aiCredits } = useModules();
  const creditPct = aiCredits.limit > 0 ? Math.round((aiCredits.used / aiCredits.limit) * 100) : 0;

  return (
    <header
      role="banner"
      aria-label="Üst menü"
      className={`dashboard-header dashboard-mobile-header sticky top-0 z-40 safe-area-top ${
        isCompactHeader ? 'dashboard-mobile-header-compact' : ''
      }`}
    >
      <div className="dashboard-header-inner h-[4.25rem] lg:h-[4.5rem] px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-3 max-w-screen-2xl mx-auto w-full">
        {/* Sol: arama / sayfa başlığı */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="dashboard-search-shell w-full">
              <CommandPalette />
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <span className="text-sm font-black italic text-white">P</span>
            </div>
            <div className="dashboard-mobile-title-chip flex flex-col leading-tight min-w-0">
              <span
                className={`text-[10px] font-black uppercase tracking-widest text-orange-600/80 transition-all duration-200 ${
                  isCompactHeader ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                Pazar Yönetimi
              </span>
              <span className="text-sm font-black text-foreground truncate">{currentPageTitle}</span>
            </div>
          </div>
        </div>

        {/* Sağ: aksiyonlar */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <div className="lg:hidden">
            <CommandPalette />
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/6 border border-emerald-500/15">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Canlı
            </span>
          </div>

          {/* AI Kredileri */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setCreditMenuOpen(!creditMenuOpen)}
              className={`flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-xl border transition-all duration-200 ${
                creditMenuOpen
                  ? 'bg-amber-500/12 border-amber-500/30 shadow-md shadow-amber-500/10'
                  : 'bg-gradient-to-r from-amber-500/8 to-orange-500/8 border-amber-500/20 hover:border-amber-500/35'
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Zap size={14} className="text-amber-500 fill-amber-500/40" />
              </span>
              <div className="text-left leading-none">
                <span className="text-xs font-black text-amber-700 dark:text-amber-300">{aiCredits.limit - aiCredits.used}</span>
                <span className="text-[9px] font-bold text-slate-500 block">AI Kredi</span>
              </div>
            </button>

            <AnimatePresence>
              {creditMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setCreditMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 mt-3 w-72 bg-surface/95 backdrop-blur-xl border border-border rounded-[1.35rem] shadow-2xl z-[61] overflow-hidden"
                  >
                    <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-b border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black text-foreground">AI Üretim Kredisi</span>
                        <Zap size={16} className="text-amber-500" />
                      </div>
                      <div className="flex items-end gap-1.5 mb-3">
                        <span className="text-3xl font-black text-amber-600">{aiCredits.limit - aiCredits.used}</span>
                        <span className="text-xs font-medium text-slate-500 mb-1">/ {aiCredits.limit} aylık</span>
                      </div>
                      <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all" style={{ width: `${100 - creditPct}%` }} />
                      </div>
                      <p className="text-[10px] text-slate-500">{aiCredits.used} kredi kullanıldı</p>
                    </div>
                    <div className="p-3">
                      <Link href="/dashboard/upgrade" onClick={() => setCreditMenuOpen(false)}>
                        <button
                          type="button"
                          className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                          <Sparkles size={14} /> Paketi Yükselt
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* İkon grubu */}
          <div className="flex items-center gap-0.5 p-1 rounded-2xl bg-surface/70 border border-border/80 backdrop-blur-sm">
            <NotificationBell />
            <AnnouncementDropdown
              announcements={activeAnnouncements}
              unreadCount={unreadCount}
              onRead={markAsRead}
              onDismiss={dismiss}
            />
            <HeaderIconButton
              onClick={triggerHaptic}
              label="Yardım"
              className="hidden sm:flex"
            >
              <HelpCircle className="w-[1.15rem] h-[1.15rem] group-hover:scale-110 transition-transform" />
            </HeaderIconButton>
            <HeaderIconButton
              onClick={() => {
                triggerHaptic();
                toggleTheme();
              }}
              label="Tema değiştir"
            >
              {resolvedMode === 'dark' ? (
                <Sun className="w-[1.15rem] h-[1.15rem] group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-[1.15rem] h-[1.15rem] group-hover:-rotate-12 transition-transform" />
              )}
            </HeaderIconButton>
            <HeaderIconButton
              onClick={() => {
                triggerHaptic();
                toggleLiveFeed();
              }}
              label="Canlı akış"
              active={showLiveFeed}
              className="hidden xl:flex"
            >
              <Activity className={`w-[1.15rem] h-[1.15rem] ${showLiveFeed ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
            </HeaderIconButton>
          </div>

          <div className="hidden lg:block w-px h-9 bg-border/70" />

          <DashboardUserMenu
            session={session}
            tenantPlan={tenantPlan}
            open={profileMenuOpen}
            onToggle={() => setProfileMenuOpen(!profileMenuOpen)}
            onClose={() => setProfileMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
