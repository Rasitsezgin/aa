'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  MessageSquare, Search, Plus, Home, Users, Crown, Calendar,
  LogIn, UserPlus, LogOut, User, Mail, Settings,
} from 'lucide-react';
import type { ReactNode } from 'react';
import MarketingPageShell from '@/components/landing/MarketingPageShell';

interface ForumShellProps {
  children: ReactNode;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onlineCount?: number;
}

export default function ForumShell({
  children,
  searchQuery = '',
  onSearchChange,
  onlineCount = 0,
}: ForumShellProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const [dmUnread, setDmUnread] = useState(0);

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
    <MarketingPageShell padded={false} className="pb-12">
      <div className="border-b border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              <span className="text-orange-600 dark:text-orange-400 font-bold">{onlineCount}</span> çevrimiçi üye
            </span>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-slate-600 dark:text-slate-300 hidden sm:inline-flex items-center gap-1.5">
                    <User size={14} />
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/forum' })}
                    className="text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 inline-flex items-center gap-1 font-medium"
                  >
                    <LogOut size={14} /> Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login?callbackUrl=/forum" className="text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 inline-flex items-center gap-1 font-medium">
                    <LogIn size={14} /> Giriş
                  </Link>
                  <Link href="/signup" className="text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 inline-flex items-center gap-1 font-medium">
                    <UserPlus size={14} /> Kayıt
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className="bg-gradient-to-r from-orange-600 to-amber-500 border-b border-orange-500/30 shadow-lg shadow-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            <Link href="/forum" className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center ring-2 ring-white/20">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="font-black text-2xl text-white tracking-tight">PAZARYÖNETİMİ</span>
                <span className="block text-xs text-orange-100">Topluluk Forumu</span>
              </div>
            </Link>

            <div className="flex items-center gap-3 flex-1 justify-end">
              {onSearchChange && (
                <div className="relative hidden md:block max-w-sm w-full">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-100" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Forumda ara..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/15 backdrop-blur border border-white/25 rounded-xl text-sm text-white placeholder-orange-100 focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                </div>
              )}
              {isAuthenticated ? (
                <Link
                  href="/forum/new-topic"
                  className="px-5 py-2.5 bg-white text-orange-700 font-bold rounded-xl text-sm hover:bg-orange-50 transition-all inline-flex items-center gap-2 shadow-lg shrink-0"
                >
                  <Plus size={18} /> Yeni Konu
                </Link>
              ) : (
                <Link
                  href="/login?callbackUrl=/forum/new-topic"
                  className="px-5 py-2.5 bg-white text-orange-700 font-bold rounded-xl text-sm hover:bg-orange-50 transition-all inline-flex items-center gap-2 shadow-lg shrink-0"
                >
                  <LogIn size={18} /> Giriş & Konu Aç
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-12 overflow-x-auto scrollbar-none">
            <Link href="/" className="px-4 py-2 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 text-sm font-semibold inline-flex items-center gap-2 shrink-0">
              <Home size={16} /> Ana Sayfa
            </Link>
            <Link href="/forum" className="px-4 py-2 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 text-sm font-bold inline-flex items-center gap-2 shrink-0">
              <MessageSquare size={16} /> Forum
            </Link>
            <Link href="/community" className="px-4 py-2 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 text-sm font-semibold inline-flex items-center gap-2 shrink-0">
              <Users size={16} /> Topluluk
            </Link>
            <Link href="/community/leaderboard" className="px-4 py-2 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 text-sm font-semibold inline-flex items-center gap-2 shrink-0">
              <Crown size={16} /> Liderlik
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/forum/messages" className="px-4 py-2 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 text-sm font-semibold inline-flex items-center gap-2 relative shrink-0">
                  <Mail size={16} /> Mesajlar
                  {dmUnread > 0 && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {dmUnread > 99 ? '99+' : dmUnread}
                    </span>
                  )}
                </Link>
                <Link href="/forum/settings" className="px-4 py-2 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 text-sm font-semibold inline-flex items-center gap-2 shrink-0">
                  <Settings size={16} /> Ayarlar
                </Link>
              </>
            )}
            <Link href="/webinars" className="px-4 py-2 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 text-sm font-semibold inline-flex items-center gap-2 shrink-0">
              <Calendar size={16} /> Etkinlikler
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </MarketingPageShell>
  );
}
