'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, RefreshCw, Plug } from 'lucide-react';
import { DashboardCard, PLATFORM_COLORS } from './dashboard-ui';

type PlatformRow = {
  platform: string;
  revenue?: number;
  orders?: number;
  growth?: number;
  share?: number;
};

export function IntegrationStatusCard({
  platforms,
  loading,
}: {
  platforms?: PlatformRow[];
  loading?: boolean;
}) {
  const items = platforms || [];

  return (
    <DashboardCard title="Entegrasyon Durumu" icon={Plug} loading={loading}>
      {items.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-sm font-semibold text-foreground">Henüz platform verisi yok</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Pazaryeri entegrasyonlarını bağlayın.</p>
          <Link
            href="/dashboard/settings/integrations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 transition-colors"
          >
            Entegrasyon Ekle
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((p) => {
            const growth = p.growth ?? 0;
            const healthy = growth >= 0;
            const dot = PLATFORM_COLORS[p.platform] || 'bg-slate-400';
            const share = Math.min(100, Math.max(4, p.share ?? (p.revenue ? 20 : 10)));

            return (
              <div key={p.platform} className="p-3 rounded-2xl bg-background/50 border border-border">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                    <span className="text-sm font-bold text-foreground truncate">{p.platform}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-black ${healthy ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {healthy ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {healthy ? 'Senkron' : 'İzle'}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-200/80 dark:bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dot} transition-all duration-700`}
                    style={{ width: `${share}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 font-bold">
                  <span>{p.orders ?? 0} sipariş</span>
                  <span className="flex items-center gap-1">
                    <RefreshCw size={10} />
                    ₺{(p.revenue ?? 0).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
