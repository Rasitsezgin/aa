'use client';

import Link from 'next/link';
import { Calculator, Package, FileText, RefreshCw, Wrench } from 'lucide-react';
import { downloadTextReport, type ExportableAnalysis } from '@/lib/analysis-export';

type Props = {
  platform: string;
  avgPrice?: number;
  exportData: ExportableAnalysis;
  onRefresh?: () => void;
  refreshing?: boolean;
};

const THEME_CARD =
  'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none';

export function AnalysisToolsPanel({
  platform,
  avgPrice,
  exportData,
  onRefresh,
  refreshing,
}: Props) {
  const commissionHref =
    avgPrice && avgPrice > 0
      ? `/tools/komisyon-hesaplama?price=${Math.round(avgPrice)}&platform=${platform.toLowerCase()}`
      : '/tools/komisyon-hesaplama';

  const tools = [
    {
      label: 'Komisyon Hesapla',
      desc: avgPrice
        ? `Ortalama fiyat (${avgPrice.toLocaleString('tr-TR')}₺) ile ön doldurulmuş`
        : 'Net kâr ve komisyon hesabı',
      href: commissionHref,
      icon: Calculator,
      external: false,
    },
    {
      label: 'Desi Hesapla',
      desc: 'Kargo desi ve hacim hesabı',
      href: '/tools/desi-hesaplama',
      icon: Package,
      external: false,
    },
    {
      label: 'Rapor İndir',
      desc: 'TXT formatında analiz özeti',
      href: null,
      icon: FileText,
      action: () => downloadTextReport(exportData),
    },
  ];

  return (
    <div className="space-y-4">
      <div className={`${THEME_CARD} rounded-[32px] p-6 md:p-8`}>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Wrench className="text-slate-600" size={24} />
          Analiz Araçları
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mağaza verinizle bağlantılı gerçek hesaplama ve dışa aktarma araçları.
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-bold disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Analizi yenile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const inner = (
            <>
              <tool.icon size={22} className="text-orange-500 mb-2" />
              <p className="font-bold text-slate-900 dark:text-white">{tool.label}</p>
              <p className="text-xs text-slate-500 mt-1">{tool.desc}</p>
            </>
          );

          if (tool.action) {
            return (
              <button
                key={tool.label}
                type="button"
                onClick={tool.action}
                className={`${THEME_CARD} rounded-2xl p-5 text-left hover:border-orange-300 dark:hover:border-orange-500/30 transition-colors`}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={tool.label}
              href={tool.href!}
              className={`${THEME_CARD} rounded-2xl p-5 block hover:border-orange-300 dark:hover:border-orange-500/30 transition-colors`}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
