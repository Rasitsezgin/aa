'use client';

import { Clock, Database, Info, Loader2, RefreshCw } from 'lucide-react';

type Props = {
  analyzedAt?: string;
  cached?: boolean;
  productSampleSize?: number;
  totalProducts?: number;
  confidenceScore?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export function DataFreshnessBar({
  analyzedAt,
  cached,
  productSampleSize,
  totalProducts,
  confidenceScore,
  onRefresh,
  refreshing,
}: Props) {
  const formatted = analyzedAt
    ? new Date(analyzedAt).toLocaleString('tr-TR')
    : null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
      {formatted && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <Clock size={12} />
          Son analiz: {formatted}
          {cached && ' (önbellek)'}
        </span>
      )}
      {hasSampleInfo(productSampleSize, totalProducts) && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <Database size={12} />
          Örneklenen ürün: {productSampleSize} / {totalProducts}
        </span>
      )}
      {confidenceScore !== undefined && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <Info size={12} />
          Güven: %{confidenceScore}
        </span>
      )}
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 font-medium hover:bg-orange-100 dark:hover:bg-orange-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {refreshing ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RefreshCw size={12} />
          )}
          {refreshing ? 'Yenileniyor…' : 'Yenile'}
        </button>
      )}
    </div>
  );
}

function hasSampleInfo(sample?: number, total?: number): boolean {
  return (
    typeof sample === 'number' &&
    sample > 0 &&
    typeof total === 'number' &&
    total > 0
  );
}
