"use client";

import React from 'react';
import { Sparkles, ArrowRight, MousePointer2, Bot, Target, Zap, ChevronRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[640px] sm:min-h-screen flex items-start sm:items-center justify-center overflow-hidden pt-20 sm:pt-32 pb-12 sm:pb-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Floating 3D Elements (Conceptual) */}
      <div className="absolute top-1/4 left-10 w-64 h-64 glass rounded-3xl float-intense rotate-12 flex items-center justify-center border-white/5 opacity-50 blur-[2px]">
        <Zap size={100} className="text-primary opacity-20" />
      </div>
      <div className="absolute bottom-1/4 right-10 w-72 h-48 glass rounded-3xl float-intense -rotate-6 flex flex-col p-6 border-white/5 opacity-40 blur-[1px]">
        <div className="w-1/2 h-4 bg-white/10 rounded mb-4" />
        <div className="w-3/4 h-2 bg-white/5 rounded" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center sm:max-w-5xl">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass mb-10 border-white/10 float-intense">
            <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Yapay Zeka Devrimi Başladı</span>
          </div>

          {/* Main Title with staggered animation (conceptual CSS) */}
          <h1 className="text-4xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-4 sm:mb-8 leading-tight sm:leading-[0.85]">
            <span className="inline-block hover:scale-105 transition-transform cursor-default">Pazaryerlerinizi</span>
            <br />
            <span className="gradient-text italic bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500">AI ile Otomatik Yönetin.</span>
          </h1>

          {/* Impactful Description */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-400 mb-6 sm:mb-12 font-light leading-relaxed">
            Pazaryonetimi, tüm pazaryeri operasyonlarını tek bir merkezden
            <span className="text-white font-medium"> yapay zeka destekli</span> olarak otomatik yönetir.
          </p>

          {/* Compact Search / Analyze Card for Mobile-first */}
          <div className="mx-auto w-full sm:w-3/4 lg:w-2/3 mb-6">
            <div className="bg-white/6 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-md border border-white/6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-bold bg-emerald-400 text-white rounded-full">YENİ</span>
                  <input aria-label="Mağaza linki" placeholder="Mağaza linkinizi yapıştırın..." className="bg-transparent placeholder:text-slate-300 text-white flex-1 outline-none" />
                </div>
                <button className="ml-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition">Analiz</button>
              </div>
              <div className="mt-3 text-[12px] text-slate-400">Analiz tamamen ücretsizdir ve kredi kartı gerektirmez.</div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-24">
            <button className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-600 text-white font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-lg ring-1 ring-emerald-700/20">
              Ücretsiz Başla
            </button>

            <button className="w-full sm:w-auto px-8 py-3 rounded-2xl glass hover:bg-white/5 text-white font-bold text-lg border-white/10 transition-all">
              Demo İzle
            </button>
          </div>

          {/* Small stats row to make hero 'dolu' */}
          <div className="flex flex-wrap justify-center gap-6 items-center text-slate-300 text-sm font-medium">
            <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-300" /> 256-bit SSL</div>
            <div className="flex items-center gap-2"><MousePointer2 className="w-5 h-5 text-cyan-300" /> 200ms Senkron</div>
            <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-violet-300" /> KVKK Uyumu</div>
          </div>

          {/* Integration Showcase - Marquee */}
          <div className="relative mt-20">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase">GÜÇLÜ PAZARYERİ ENTEGRASYONLARI</p>
              <div className="flex items-center justify-center gap-12 grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                {['AMAZON', 'TRENDYOL', 'HEPSIBURADA', 'N11', 'ETSY', 'ALIEXPRESS'].map(brand => (
                  <span key={brand} className="text-2xl font-black tracking-tighter">{brand}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
        <span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase rotate-90 origin-left ml-4">SCROLL</span>
        <div className="w-px h-20 bg-gradient-to-b from-primary via-transparent to-transparent" />
      </div>
    </section>
  );
}
