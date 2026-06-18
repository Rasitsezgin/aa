'use client';

import { useState } from 'react';
import { Loader2, BarChart3, ArrowRight } from 'lucide-react';
import {
  compareStoreSnapshots,
  snapshotFromAnalysis,
  type ComparisonStoreSnapshot,
} from '@/lib/analysis-comparison';

type Props = {
  currentUrl: string;
  currentData: {
    metrics?: Record<string, unknown>;
    seoScore?: number;
  };
};

export function StoreComparisonPanel({ currentUrl, currentData }: Props) {
  const [compareUrl, setCompareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareSnapshot, setCompareSnapshot] = useState<ComparisonStoreSnapshot | null>(null);
  const [compareName, setCompareName] = useState('');

  const currentSnapshot = snapshotFromAnalysis(currentData);
  if (!currentSnapshot) return null;

  const runCompare = async () => {
    const trimmed = compareUrl.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      let plat = 'trendyol';
      let storeId = 'store';
      if (trimmed.includes('trendyol.com')) {
        const m = trimmed.match(/-m-(\d+)/) || trimmed.match(/mid=(\d+)/);
        storeId = m?.[1] || 'store';
      } else if (trimmed.includes('hepsiburada.com')) {
        plat = 'hepsiburada';
        const m = trimmed.match(/\/magaza\/([^/?]+)/);
        storeId = m?.[1] || 'store';
      } else {
        throw new Error('Yalnızca Trendyol veya Hepsiburada mağaza linki girin.');
      }

      const res = await fetch(
        `/api/marketplace/analyze/${plat}/${encodeURIComponent(storeId)}?url=${encodeURIComponent(trimmed)}`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Karşılaştırma analizi başarısız.');
      }
      const data = await res.json();
      const snap = snapshotFromAnalysis(data);
      if (!snap) throw new Error('Karşılaştırma verisi alınamadı.');
      setCompareSnapshot(snap);
      setCompareName(snap.storeName);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hata oluştu.');
      setCompareSnapshot(null);
    } finally {
      setLoading(false);
    }
  };

  const rows = compareSnapshot
    ? compareStoreSnapshots(currentSnapshot, compareSnapshot)
    : [];

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <BarChart3 className="text-orange-500" size={24} />
        Mağaza Karşılaştırması
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        İki gerçek mağaza verisini yan yana karşılaştırın. Her iki analiz de canlı platform kaynağından çekilir.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="url"
          value={compareUrl}
          onChange={(e) => setCompareUrl(e.target.value)}
          placeholder="Rakip mağaza URL'si (Trendyol / Hepsiburada)"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm"
        />
        <button
          type="button"
          onClick={runCompare}
          disabled={loading || !compareUrl.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
          Karşılaştır
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
      )}

      {compareSnapshot && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="text-left py-3 font-bold text-slate-500">Metrik</th>
                <th className="text-right py-3 font-bold text-orange-600">{currentSnapshot.storeName}</th>
                <th className="text-right py-3 font-bold text-purple-600">{compareName}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 dark:border-white/5">
                  <td className="py-3 text-slate-700 dark:text-slate-300">{row.label}</td>
                  <td className={`text-right py-3 font-bold ${row.better === 'current' ? 'text-green-600' : ''}`}>
                    {row.current}
                  </td>
                  <td className={`text-right py-3 font-bold ${row.better === 'compare' ? 'text-green-600' : ''}`}>
                    {row.compare}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!compareSnapshot && !loading && (
        <p className="text-xs text-slate-400 text-center py-4">
          Mevcut mağaza: <strong>{currentSnapshot.storeName}</strong> · Karşılaştırmak için rakip URL girin
        </p>
      )}
    </div>
  );
}
