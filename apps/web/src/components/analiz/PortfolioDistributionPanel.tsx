'use client';

import { BarChart3, Info } from 'lucide-react';
import {
  computePriceDistribution,
  computeRatingDistribution,
  computeReviewDistribution,
  computeStockDistribution,
  type DistributionBucket,
  type PortfolioProduct,
} from '@/lib/analysis-portfolio-insights';

type Props = {
  products: PortfolioProduct[];
};

const THEME_CARD =
  'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none';

function DistributionChart({
  title,
  buckets,
  accentClass,
}: {
  title: string;
  buckets: DistributionBucket[];
  accentClass: string;
}) {
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className={`${THEME_CARD} rounded-2xl p-5`}>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{title}</h4>
      <div className="space-y-3">
        {buckets.map((bucket) => (
          <div key={bucket.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">{bucket.label}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {bucket.count} ({bucket.percent}%)
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${accentClass}`}
                style={{ width: `${(bucket.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortfolioDistributionPanel({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className={`${THEME_CARD} rounded-[32px] p-6 md:p-8`}>
        <p className="text-sm text-slate-500">Dağılım için ürün verisi gerekli.</p>
      </div>
    );
  }

  const priceDist = computePriceDistribution(products);
  const ratingDist = computeRatingDistribution(products);
  const reviewDist = computeReviewDistribution(products);
  const stockDist = computeStockDistribution(products);

  return (
    <div className="space-y-4">
      <div className={`${THEME_CARD} rounded-[32px] p-6 md:p-8`}>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <BarChart3 className="text-orange-500" size={24} />
          Portföy Dağılımı
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          {products.length} ürün örneğinden hesaplanan anlık dağılım. Tarihsel trend verisi yoktur.
        </p>
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Info size={12} />
          Kaynak: canlı platform ürün listesi · AI Hesaplanmış
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DistributionChart title="Fiyat aralığı" buckets={priceDist} accentClass="bg-orange-500" />
        <DistributionChart title="Stok durumu" buckets={stockDist} accentClass="bg-green-500" />
        <DistributionChart title="Ürün puanı" buckets={ratingDist} accentClass="bg-yellow-500" />
        <DistributionChart title="Değerlendirme sayısı" buckets={reviewDist} accentClass="bg-purple-500" />
      </div>
    </div>
  );
}
