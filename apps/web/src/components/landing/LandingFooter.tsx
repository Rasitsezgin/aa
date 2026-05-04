"use client";

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 w-full border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#020617] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              Pazaryonetimi
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modern e-ticaret yönetimi.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="/kurumsal/gizlilik-politikasi" className="hover:text-primary transition-colors">Gizlilik</Link>
            <Link href="/kurumsal/kullanim-sartlari" className="hover:text-primary transition-colors">Kullanım Şartları</Link>
            <Link href="/kurumsal/kvkk" className="hover:text-primary transition-colors">KVKK</Link>
            <Link href="/iletisim" className="hover:text-primary transition-colors">İletişim</Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <button
                key={i}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white transition-all"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            &copy; {currentYear} Pazaryonetimi. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Sistemler Aktif
          </div>
        </div>
      </div>
    </footer>
  );
}
