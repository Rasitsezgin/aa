'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Handshake, Package, Factory, Warehouse, Users, ArrowRight,
  TrendingDown, Plus, CheckCircle, Sparkles, MapPin
} from 'lucide-react';

interface B2BDeal {
  id: string;
  category: 'packaging' | 'manufacturing' | 'warehouse' | 'groupbuy';
  title: string;
  creator: string;
  location: string;
  targetCount: string;
  savedPercent: number;
  joinedCount: number;
  badge: string;
}

const SAMPLE_B2B_DEALS: B2BDeal[] = [
  {
    id: 'b2b-1',
    category: 'packaging',
    title: '10.000 Adet E-Ticaret Kilitli Koli (20x15x10) Toplu Alım Grubu',
    creator: 'Burak Özkan (Trendyol Pro)',
    location: 'İstanbul / Gebze',
    targetCount: '10.000 Adet',
    savedPercent: 38,
    joinedCount: 7,
    badge: 'Koli & Ambalaj',
  },
  {
    id: 'b2b-2',
    category: 'manufacturing',
    title: 'Organik Bebek Zıbını ve Tulum Fason Dikim Atölyesi Arayanlar',
    creator: 'Gizem Yurt',
    location: 'Bursa / Yıldırım',
    targetCount: '500 - 2000 Adet',
    savedPercent: 25,
    joinedCount: 4,
    badge: 'Fason Üretim',
  },
  {
    id: 'b2b-3',
    category: 'warehouse',
    title: 'İkitelli OSB 250 m² Ortak E-Ticaret Deposu & Paketleme Paylaşımı',
    creator: 'Mert Karaca (Lojistik)',
    location: 'İstanbul / İkitelli',
    targetCount: '2 Satıcı',
    savedPercent: 50,
    joinedCount: 3,
    badge: 'Depo Paylaşımı',
  },
];

export default function ForumB2BHubWidget() {
  const [filter, setFilter] = useState<'all' | 'packaging' | 'manufacturing' | 'warehouse'>('all');

  const filteredDeals = SAMPLE_B2B_DEALS.filter(
    (d) => filter === 'all' || d.category === filter
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Handshake size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>B2B Ticari Dayanışma & Toplu Alım</span>
              <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                Yeni
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Koli, fason üretim ve depo maliyetlerini %40&apos;a varan oranda düşürün
            </p>
          </div>
        </div>

        <Link
          href="/forum/new-topic?board=b16"
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 shrink-0"
        >
          <Plus size={14} /> İlan Aç
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          Tümü
        </button>
        <button
          type="button"
          onClick={() => setFilter('packaging')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            filter === 'packaging'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          📦 Koli & Ambalaj
        </button>
        <button
          type="button"
          onClick={() => setFilter('manufacturing')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            filter === 'manufacturing'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          🏭 Fason Üretim
        </button>
        <button
          type="button"
          onClick={() => setFilter('warehouse')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            filter === 'warehouse'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          🏬 Depo Paylaşımı
        </button>
      </div>

      {/* Deals List */}
      <div className="space-y-2.5">
        {filteredDeals.map((deal) => (
          <div
            key={deal.id}
            className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  {deal.badge}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin size={11} /> {deal.location}
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                  %{deal.savedPercent} Tasarruf
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {deal.title}
              </h4>
              <div className="text-[11px] text-slate-400">
                Oluşturan: <strong className="text-slate-600 dark:text-slate-300">{deal.creator}</strong> • Hedef: {deal.targetCount}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {deal.joinedCount} Katılımcı
              </span>
              <Link
                href="/forum/topic/e-ticarette-xml-dropshipping-guvenilir-tedarikci-secimi-ve-stok-patlamalarini-onleme"
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors inline-flex items-center gap-1"
              >
                <span>İncele</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
