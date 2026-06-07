'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, AlertCircle, CheckCircle2, Globe } from 'lucide-react';

export type SyncQueueItem = {
  id: string;
  platform: string;
  isActive: boolean;
  lastSync: string;
  status: string;
};

interface SyncQueuePanelProps {
  items: SyncQueueItem[];
  loading?: boolean;
  onRetry?: (id: string) => void;
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

export function SyncQueuePanel({ items, loading, onRetry }: SyncQueuePanelProps) {
  return (
    <div className="dash-card p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] dash-kpi-icon flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">Senkron Kuyruğu</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Platform bağlantıları</p>
          </div>
        </div>
        <Link href="/dashboard/settings/integrations" className="text-[10px] font-black text-orange-600 hover:underline">
          Yönet →
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
          Yükleniyor...
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-semibold text-foreground mb-1">Entegrasyon yok</p>
          <p className="text-xs text-slate-500 mb-4">Pazaryeri bağlantısı ekleyerek senkron başlatın.</p>
          <Link
            href="/dashboard/settings/integrations"
            className="inline-flex px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            Entegrasyon Ekle
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const healthy = item.isActive && item.status === 'connected';
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-background/60 border border-border hover:border-orange-500/20 transition-all"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${healthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{item.platform}</p>
                  <p className="text-[10px] text-slate-500">Son sync: {formatRelative(item.lastSync)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {healthy ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                  {onRetry && (
                    <button
                      type="button"
                      onClick={() => onRetry(item.id)}
                      className="p-1.5 rounded-lg hover:bg-orange-500/10 text-orange-600"
                      title="Yeniden dene"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
