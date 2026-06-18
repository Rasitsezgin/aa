'use client';

import { Megaphone, Star, AlertTriangle } from 'lucide-react';
import {
  deriveMarketingInsights,
  getProductsWithoutReviews,
  getTopProductsByReviews,
  type PortfolioProduct,
} from '@/lib/analysis-portfolio-insights';

type Props = {
  products: PortfolioProduct[];
  keywords?: string[];
  metrics?: {
    stockHealth?: number;
    imageOptimization?: number;
    avgProductPrice?: number;
    rating?: number;
  } | null;
};

const THEME_CARD =
  'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none';

const priorityStyles = {
  Yüksek: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  Orta: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  Düşük: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
};

export function MarketingInsightsPanel({ products, keywords = [], metrics }: Props) {
  const insights = deriveMarketingInsights(products, keywords, metrics);
  const topByReviews = getTopProductsByReviews(products, 3);
  const noReviews = getProductsWithoutReviews(products, 3);

  if (products.length === 0) {
    return (
      <div className={`${THEME_CARD} rounded-[32px] p-6 md:p-8`}>
        <p className="text-sm text-slate-500">Pazarlama önerileri için ürün verisi gerekli.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`${THEME_CARD} rounded-[32px] p-6 md:p-8`}>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Megaphone className="text-pink-500" size={24} />
          Pazarlama Önerileri
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mevcut ürün ve mağaza metriklerinden türetilmiş aksiyonlar. Satış tahmini veya simülasyon içermez.
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((item) => (
          <div
            key={item.title}
            className={`${THEME_CARD} rounded-2xl p-4 flex items-start gap-4`}
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
              <Megaphone size={18} className="text-pink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityStyles[item.priority]}`}>
                  {item.priority}
                </span>
                {item.metric && (
                  <span className="text-[10px] font-mono text-slate-400">{item.metric}</span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {(topByReviews.length > 0 || noReviews.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topByReviews.length > 0 && (
            <div className={`${THEME_CARD} rounded-2xl p-5`}>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                En çok değerlendirilen
              </h4>
              <ul className="space-y-2 text-sm">
                {topByReviews.map((p) => (
                  <li key={p.name} className="flex justify-between gap-2 text-slate-600 dark:text-slate-400">
                    <span className="truncate">{p.name}</span>
                    <span className="font-bold shrink-0">{p.reviews}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {noReviews.length > 0 && (
            <div className={`${THEME_CARD} rounded-2xl p-5`}>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Değerlendirme bekleyen
              </h4>
              <ul className="space-y-2 text-sm">
                {noReviews.map((p) => (
                  <li key={p.name} className="truncate text-slate-600 dark:text-slate-400">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
