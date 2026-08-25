'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, CheckCircle, Truck, Package, XCircle, RefreshCw } from 'lucide-react';
import type { Order } from '@/lib/hooks';

const COLUMNS = [
  { key: 'PENDING', label: 'Bekleyen', icon: Clock, color: 'border-amber-500/20 bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', iconColor: 'text-amber-500' },
  { key: 'CONFIRMED', label: 'Onaylı', icon: CheckCircle, color: 'border-blue-500/20 bg-blue-500/5', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', iconColor: 'text-blue-500' },
  { key: 'SHIPPED', label: 'Kargoda', icon: Truck, color: 'border-violet-500/20 bg-violet-500/5', badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', iconColor: 'text-violet-500' },
  { key: 'DELIVERED', label: 'Teslim Edildi', icon: Package, color: 'border-emerald-500/20 bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', iconColor: 'text-emerald-500' },
  { key: 'CANCELLED', label: 'İptal / İade', icon: XCircle, color: 'border-rose-500/20 bg-rose-500/5', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', iconColor: 'text-rose-500' },
] as const;

interface OrderPipelineProps {
  orders: Order[];
  counts?: Record<string, number>;
  onStatusChange?: (orderId: string, status: string) => void;
  loading?: boolean;
}

export function OrderPipeline({ orders = [], counts, onStatusChange, loading }: OrderPipelineProps) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const byStatus = COLUMNS.map((col) => ({
    ...col,
    count: counts?.[col.key] ?? safeOrders.filter((o) => o.status === col.key).length,
    items: safeOrders.filter((o) => o.status === col.key).slice(0, 5),
  }));

  return (
    <div className="dash-card p-4 sm:p-5 lg:p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">Sipariş Pipeline</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Durum bazlı sipariş akış takibi</p>
        </div>
        <Link href="/dashboard/orders" className="text-xs font-semibold text-primary hover:underline shrink-0">
          Tüm siparişler →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-8 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin" /> Yükleniyor...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {byStatus.map((col) => {
            const Icon = col.icon;
            return (
              <div key={col.key} className={`rounded-xl border p-3 sm:p-3.5 flex flex-col justify-between min-w-0 ${col.color}`}>
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${col.iconColor}`} />
                    <span className="text-xs font-semibold text-foreground truncate">{col.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0 tabular-nums ${col.badge}`}>
                    {col.count}
                  </span>
                </div>

                <div className="space-y-1.5 min-h-[44px]">
                  {col.items.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        const idx = COLUMNS.findIndex((c) => c.key === col.key);
                        const next = COLUMNS[idx + 1];
                        if (next && onStatusChange) onStatusChange(String(order.id), next.key);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-surface/90 border border-border/80 hover:border-primary/40 transition-all shadow-xs"
                      title="Sonraki aşamaya taşı"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] font-bold text-foreground truncate">#{order.marketplaceOrderId || order.id}</p>
                        <p className="text-[10px] font-semibold text-primary shrink-0">₺{Number(order.totalAmount || 0).toLocaleString('tr-TR')}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{order.customerName || order.platform}</p>
                    </button>
                  ))}
                  {col.items.length === 0 && (
                    <div className="flex items-center justify-center h-full py-2 text-[11px] text-slate-400 font-medium">
                      Sipariş yok
                    </div>
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
