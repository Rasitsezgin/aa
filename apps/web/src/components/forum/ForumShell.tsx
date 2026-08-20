'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageSquare, Search, Plus, Home, Users, Crown, Calendar,
  Sparkles, Layers, CheckCircle2, TrendingUp, Mail, Settings, ArrowRight,
  Calculator, Send, Handshake
} from 'lucide-react';
import type { ReactNode } from 'react';
import MarketingPageShell from '@/components/landing/MarketingPageShell';
import ForumCalculatorsModal from '@/components/forum/ForumCalculatorsModal';
import ForumTelegramBotModal from '@/components/forum/ForumTelegramBotModal';

interface ForumShellProps {
  children: ReactNode;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onlineCount?: number;
  activeTab?: 'all' | 'categories' | 'popular' | 'solved';
  onTabChange?: (tab: 'all' | 'categories' | 'popular' | 'solved') => void;
}

const POPULAR_TAGS = [
  { label: 'Trendyol Komisyon', tag: 'trendyol' },
  { label: 'Buybox Taktikleri', tag: 'buybox' },
  { label: 'Amazon FBA', tag: 'amazonfba' },
  { label: 'Genç Girişimci', tag: 'gencgirisimci' },
  { label: 'Dinamik Repricer', tag: 'repricer' },
  { label: 'Mikro İhracat (ETGB)', tag: 'mikro-ihracat' },
  { label: 'Kargo Desi Tasarrufu', tag: 'kargo' },
];

export default function ForumShell({
  children,
  searchQuery = '',
  onSearchChange,
  onlineCount = 0,
  activeTab = 'all',
  onTabChange,
}: ForumShellProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const [dmUnread, setDmUnread] = useState(0);

  // Modals state
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [calcModalTab, setCalcModalTab] = useState<'profit' | 'shipping' | 'etgb'>('profit');
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  const openCalculator = (tab: 'profit' | 'shipping' | 'etgb' = 'profit') => {
    setCalcModalTab(tab);
    setIsCalcModalOpen(true);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setDmUnread(0);
      return;
    }
    fetch('/api/forum/messages', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDmUnread(data?.unreadCount ?? 0))
      .catch(() => setDmUnread(0));
  }, [isAuthenticated]);

  return (
    <MarketingPageShell padded={false} className="pb-16 bg-slate-50/50 dark:bg-slate-950">
      {/* Hero Community Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-b border-slate-800">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Title & Badge */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-3">
                <Sparkles size={13} className="text-orange-400" />
                <span>Pazaryeri & E-İhracat Satıcı Topluluğu</span>
                {onlineCount > 0 && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-300 font-normal">{onlineCount} çevrimiçi</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Satıcı Bilgi & Strateji Forumu
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
                Trendyol, Hepsiburada, Amazon TR/Global, Etsy ve e-ihracat operasyonlarında binlerce satıcıyla canlı yardımlaşın ve cironuzu artırın.
              </p>
            </div>

            {/* Quick CTA Actions */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => openCalculator('profit')}
                className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold rounded-xl text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <Calculator size={16} className="text-orange-400" />
                <span>Hesaplayıcılar</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBotModalOpen(true)}
                className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold rounded-xl text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <Send size={15} className="text-sky-400" />
                <span>Bot Bildirimi</span>
              </button>

              <Link
                href={isAuthenticated ? '/forum/new-topic' : '/login?callbackUrl=/forum/new-topic'}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={18} /> Yeni Konu Başlat
              </Link>
            </div>
          </div>

          {/* Search & Hot Tags Bar */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {onSearchChange && (
                <div className="relative flex-1 max-w-2xl">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Konu, pazar yeri, algoritma veya hata kodu ara... (Örn: Buybox, 150 TL kargo, ETGB)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-700 px-1.5 py-0.5 rounded"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              )}

              {/* Popular Tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                <span className="text-xs font-semibold text-slate-400 shrink-0 hidden sm:inline">Popüler:</span>
                {POPULAR_TAGS.map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    onClick={() => onSearchChange && onSearchChange(t.label)}
                    className="px-2.5 py-1 bg-slate-800/80 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 border border-slate-700/60 rounded-lg text-xs text-slate-300 transition-colors shrink-0"
                  >
                    #{t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Sub Navigation Bar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/forum"
                className="px-3.5 py-1.5 rounded-lg text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 text-sm font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare size={16} /> Forum Ana Sayfa
              </Link>
              <Link
                href="/community"
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Users size={16} /> Topluluk
              </Link>
              <Link
                href="/community/leaderboard"
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Crown size={16} /> Liderlik & Rozetler
              </Link>
              <button
                type="button"
                onClick={() => openCalculator('profit')}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Calculator size={15} /> Komisyon Hesaplayıcı
              </button>
              <Link
                href="/webinars"
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Calendar size={16} /> Canlı Eğitimler
              </Link>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href="/forum/messages"
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 text-sm font-medium inline-flex items-center gap-1.5 relative transition-colors"
                >
                  <Mail size={16} /> Mesajlar
                  {dmUnread > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                      {dmUnread > 99 ? '99+' : dmUnread}
                    </span>
                  )}
                </Link>
                <Link
                  href="/forum/settings"
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 text-sm font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Settings size={16} /> Profil Ayarları
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Forum Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Interactive Modals */}
      <ForumCalculatorsModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        defaultTab={calcModalTab}
      />
      <ForumTelegramBotModal
        isOpen={isBotModalOpen}
        onClose={() => setIsBotModalOpen(false)}
      />
    </MarketingPageShell>
  );
}


