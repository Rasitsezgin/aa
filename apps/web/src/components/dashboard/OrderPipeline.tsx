'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, Truck, Package, XCircle, RefreshCw } from 'lucide-react';
import type { Order } from '@/lib/hooks';

const COLUMNS = [
  { key: 'PENDING', label: 'Bekleyen', icon: Clock, color: 'border-amber-500/30 bg-amber-500/5' },
  { key: 'CONFIRMED', label: 'Onaylı', icon: CheckCircle, color: 'border-blue-500/30 bg-blue-500/5' },
  { key: 'SHIPPED', label: 'Kargoda', icon: Truck, color: 'border-violet-500/30 bg-violet-500/5' },
  { key: 'DELIVERED', label: 'Teslim', icon: Package, color: 'border-emerald-500/30 bg-emerald-500/5' },
  { key: 'CANCELLED', label: 'İptal', icon: XCircle, color: 'border-red-500/30 bg-red-500/5' },
] as const;

interface OrderPipelineProps {
  orders: Order[];
  counts?: Record<string, number>;
  onStatusChange?: (orderId: string, status: string) => void;
  loading?: boolean;
}

export function OrderPipeline({ orders, counts, onStatusChange, loading }: OrderPipelineProps) {
  const byStatus = COLUMNS.map((col) => ({
    ...col,
    count: counts?.[col.key] ?? orders.filter((o) => o.status === col.key).length,
    items: orders.filter((o) => o.status === col.key).slice(0, 5),
  }));

  return (
    <div className="bg-surface border border-border rounded-[1.75rem] p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-foreground">Sipariş Pipeline</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Durum bazlı akış</p>
        </div>
        <Link href="/dashboard/orders" className="text-[10px] font-black text-orange-600 hover:underline">
          Tüm siparişler →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-8 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin" /> Yükleniyor...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {byStatus.map((col) => {
            const Icon = col.icon;
            return (
              <div key={col.key} className={`rounded-2xl border p-3 ${col.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{col.label}</span>
                  </div>
                  <span className="text-lg font-black text-foreground">{col.count}</span>
                </div>
                <div className="space-y-1.5">
                  {col.items.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        const idx = COLUMNS.findIndex((c) => c.key === col.key);
                        const next = COLUMNS[idx + 1];
                        if (next && onStatusChange) onStatusChange(String(order.id), next.key);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-background/70 border border-border/60 hover:border-orange-500/30 transition-all"
                      title="Sonraki aşamaya taşı"
                    >
                      <p className="text-[10px] font-bold text-foreground truncate">#{order.id}</p>
                      <p className="text-[9px] text-slate-500 truncate">{order.platform}</p>
                    </button>
                  ))}
                  {col.items.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-2">Boş</p>
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
