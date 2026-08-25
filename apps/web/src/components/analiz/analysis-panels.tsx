'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Crown,
  DollarSign,
  FileJson,
  FileText,
  Globe,
  Heart,
  ImageIcon,
  Info,
  Layers,
  Lock,
  Package,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { stockStatusLabel, type UiStoreProduct } from '@/lib/analysis-display-utils';
import { PLATFORM_LOGOS } from '@/components/analiz/platform-logos';

export type StoreMetrics = {
  storeName?: string;
  rating?: number;
  followers?: number;
  totalProducts?: number;
  titleOptimization?: number;
  imageOptimization?: number;
  priceCompetitiveness?: number;
  stockHealth?: number;
  customerSatisfaction?: number;
};

export type StoreDataShape = {
  metrics?: StoreMetrics;
  dataSources?: {
    overall?: string;
    metrics?: Record<string, string>;
    reasons?: Record<string, string>;
    evidence?: Record<string, string | number | boolean | null>;
  };
  confidence?: {
    score?: number;
    breakdown?: Record<string, number>;
  };
  timestamp?: string;
};

const THEME = {
  card: 'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none',
  cardHover:
    'hover:shadow-xl hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10 hover:border-orange-500/20 dark:hover:border-orange-500/20 transition-all duration-300',
};

const hasNumericValue = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const getSourceBadgeLabel = (source?: string): string | null => {
  if (!source) return null;
  if (source === 'api' || source === 'scraped' || source === 'api_or_scraped') return 'Gerçek';
  if (source === 'calculated') return 'AI Hesaplanmış';
  if (source === 'estimated' || source === 'scraped_or_unknown') return 'Tahmini';
  if (source === 'not_available') return 'Yok';
  return source;
};

export function KeywordAnalysisPanel({
  extractedKeywords = [],
}: {
  storeName?: string;
  isPremium?: boolean;
  extractedKeywords?: string[];
}) {
  if (!extractedKeywords.length) return null;

  return (
    <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
      <div className="relative z-10">
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-4">
          <Target className="text-purple-500" size={24} />
          Anahtar Kelime Analizi
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          {extractedKeywords.length} anahtar kelime — ürün başlıklarından çıkarıldı
        </p>
        <div className="flex flex-wrap gap-2">
          {extractedKeywords.map((keyword, i) => (
            <span
              key={`${keyword}-${i}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              <Tag size={14} className="text-slate-400" />
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SEOAnalysisPanel({
  metrics,
  dataSources,
}: {
  metrics?: StoreMetrics | null;
  dataSources?: StoreDataShape['dataSources'];
}) {
  if (!metrics) return null;

  const sourceMap = dataSources?.metrics || {};
  const sourceLabel = (key: string) => getSourceBadgeLabel(sourceMap[key]);

  const seoMetrics = [
    { label: 'Başlık Optimizasyonu', score: metrics.titleOptimization ?? 0, icon: FileText, color: 'blue', desc: 'Ürün başlıklarının uzunluk ve anahtar kelime uyumu', key: 'titleOptimization' },
    { label: 'Görsel Kalitesi', score: metrics.imageOptimization ?? 0, icon: ImageIcon, color: 'purple', desc: 'Görseli olan ürün oranı', key: 'imageOptimization' },
    { label: 'Fiyat Verisi', score: metrics.priceCompetitiveness ?? 0, icon: DollarSign, color: 'green', desc: 'Geçerli fiyat bilgisi olan ürün oranı', key: 'priceCompetitiveness' },
    { label: 'Stok Sağlığı', score: metrics.stockHealth ?? 0, icon: Package, color: 'orange', desc: 'Stokta görünen ürün oranı', key: 'stockHealth' },
    { label: 'Müşteri Memnuniyeti', score: metrics.customerSatisfaction ?? 0, icon: Heart, color: 'red', desc: 'Ortalama ürün puanından türetilmiş skor', key: 'customerSatisfaction' },
  ].filter((m) => sourceMap[m.key] && sourceMap[m.key] !== 'not_available');

  const colorMap: Record<string, string> = {
    blue: 'from-orange-500 to-amber-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-amber-500',
    red: 'from-red-500 to-rose-500',
  };

  if (seoMetrics.length === 0) return null;

  return (
    <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-1">SEO Analizi</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
        {seoMetrics.length} metrik — ürün verisinden hesaplanan skorlar
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seoMetrics.map((metric, i) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl border bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[metric.color]} flex items-center justify-center`}>
                <metric.icon size={18} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block">{metric.label}</span>
                {sourceLabel(metric.key) && (
                  <span className="inline-flex mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10">
                    {sourceLabel(metric.key)}
                  </span>
                )}
                <span className="text-[11px] text-slate-500 block mt-1">{metric.desc}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.score}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">{metric.score}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  isPremium = false,
}: {
  products: UiStoreProduct[];
  isPremium?: boolean;
}) {
  if (!products.length) return null;
  const freeLimit = 2;

  return (
    <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Ürün Performansı</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {products.length} ürün — canlı platform verisi
            </p>
          </div>
          {!isPremium && products.length > freeLimit && (
            <Link href="/signup" className="text-xs font-bold text-orange-600">
              Tümünü görmek için kayıt olun
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.slice(0, isPremium ? 12 : 6).map((product, i) => {
            const isLocked = !isPremium && i >= freeLimit;
            const stock = stockStatusLabel(product.stockStatus);
            return (
              <div
                key={`${product.name}-${i}`}
                className={`flex items-center gap-4 p-4 rounded-2xl border relative ${isLocked ? 'opacity-60' : ''} bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5`}
              >
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 z-10 rounded-2xl">
                    <Lock size={16} className="text-slate-500" />
                  </div>
                )}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <Package size={24} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate text-slate-900 dark:text-white">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <span className="font-black text-orange-600">{isLocked ? '***' : `${product.price}₺`}</span>
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-slate-500">{product.rating}</span>
                    <span className="text-xs text-slate-400">({product.reviews})</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${stock.className}`}>{stock.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function QuickActionsPanel({ platform }: { platform: string }) {
  const actions = [
    { label: 'Dashboard', icon: TrendingUp, href: '/dashboard' },
    { label: 'Entegrasyonlar', icon: Layers, href: '/entegrasyonlar' },
    { label: 'Fiyatlandırma', icon: DollarSign, href: '/pricing' },
    { label: 'Kayıt Ol', icon: Zap, href: '/signup' },
  ];

  return (
    <div className={`${THEME.card} rounded-[32px] p-6`}>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Zap className="text-yellow-500" size={20} />
        Hızlı İşlemler
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 transition-colors"
          >
            <action.icon size={20} />
            {action.label}
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-3 text-center">Aktif platform: {platform}</p>
    </div>
  );
}

export function SupportedPlatformsWidget({ currentPlatform }: { currentPlatform: string }) {
  const free = ['TRENDYOL', 'HEPSIBURADA'];
  const premium = ['AMAZON', 'N11', 'CICEKSEPETI', 'ETSY'];

  return (
    <div className={`${THEME.card} rounded-[32px] p-6`}>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Globe className="text-green-500" size={20} />
        Platformlar
      </h3>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {free.map((platform) => {
          const info = PLATFORM_LOGOS[platform];
          const isActive = platform === currentPlatform;
          return (
            <div
              key={platform}
              title={`${info.name} — ücretsiz analiz`}
              className={`p-2 rounded-xl border flex items-center justify-center ${isActive ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-white/10'}`}
            >
              <Image src={info.logo} alt={info.name} width={28} height={28} className="object-contain" unoptimized />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {premium.map((platform) => {
          const info = PLATFORM_LOGOS[platform];
          return (
            <div key={platform} title={`${info.name} — PRO`} className="p-2 rounded-xl border border-slate-200 dark:border-white/10 opacity-50 relative">
              <Image src={info.logo} alt={info.name} width={28} height={28} className="object-contain grayscale" unoptimized />
              <Crown size={10} className="absolute top-0 right-0 text-amber-500" />
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 mt-4 text-center">
        Ücretsiz: Trendyol & Hepsiburada · Diğerleri PRO
      </p>
    </div>
  );
}

export function RawEvidencePanel({ storeData }: { storeData: StoreDataShape | null }) {
  const [showHelp, setShowHelp] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!storeData?.dataSources) return null;

  const overall = getSourceBadgeLabel(storeData.dataSources.overall);
  const confidenceScore = storeData.confidence?.score;
  const breakdown = storeData.confidence?.breakdown;
  const reasons = storeData.dataSources.reasons || {};
  const evidence = storeData.dataSources.evidence || {};
  const timestamp = mounted && storeData.timestamp
    ? new Date(storeData.timestamp).toLocaleString('tr-TR')
    : null;

  return (
    <div className={`${THEME.card} rounded-[32px] p-6`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileJson className="text-orange-500" size={20} />
          Veri Kaynağı Detayı
        </h3>
        <button type="button" onClick={() => setShowHelp((p) => !p)} className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <Info size={13} /> Nasıl hesaplanır?
        </button>
      </div>
      {showHelp && (
        <p className="text-xs text-slate-500 mb-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
          Gerçek veri platformdan çekilir; SEO alt metrikleri ürün listesinden hesaplanır. Güven skoru kaynak ağırlıklarının ortalamasıdır.
        </p>
      )}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Genel kaynak</span>
          <span className="font-bold">{overall || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Güven skoru</span>
          <span className="font-black">{hasNumericValue(confidenceScore) ? `%${confidenceScore}` : '—'}</span>
        </div>
        {breakdown && (
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            {Object.entries(breakdown).map(([k, v]) => (
              <div key={k} className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <p className="uppercase font-bold text-slate-500">{k}</p>
                <p className="font-black">{v}</p>
              </div>
            ))}
          </div>
        )}
        {Object.entries(evidence).map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs pt-1">
            <span className="text-slate-500">{k}</span>
            <span className="font-mono">{String(v)}</span>
          </div>
        ))}
        {Object.entries(reasons).map(([k, v]) => (
          <p key={k} className="text-xs text-amber-700 dark:text-amber-300">{k}: {v}</p>
        ))}
        {timestamp && <p className="text-xs text-slate-400 pt-2">Son analiz: {timestamp}</p>}
      </div>
    </div>
  );
}
