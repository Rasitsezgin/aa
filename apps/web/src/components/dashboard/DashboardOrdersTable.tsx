'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { DashboardCard, PLATFORM_COLORS, StatusPill } from './dashboard-ui';

type OrderRow = {
  id: string | number;
  platform: string;
  price?: number;
  status: string;
  customer?: string;
  product?: string;
};

export function DashboardOrdersTable({
  orders,
  loading,
}: {
  orders?: OrderRow[];
  loading?: boolean;
}) {
  const rows = orders || [];

  return (
    <DashboardCard
      title="Son Siparişler"
      icon={ShoppingCart}
      loading={loading}
      action={
        <Link href="/dashboard/orders" className="text-[10px] font-black text-orange-600 hover:text-orange-500 flex items-center gap-1">
          Tümü <ExternalLink size={10} />
        </Link>
      }
      className="lg:col-span-2"
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-border">
              <th className="text-left py-2 px-2">Sipariş</th>
              <th className="text-left py-2 px-2">Platform</th>
              <th className="text-left py-2 px-2 hidden sm:table-cell">Müşteri</th>
              <th className="text-right py-2 px-2">Tutar</th>
              <th className="text-left py-2 px-2">Durum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order, i) => (
              <tr key={`${order.id}-${i}`} className="border-b border-border/60 hover:bg-background/60 transition-colors">
                <td className="py-3 px-2 font-bold text-foreground">#{order.id}</td>
                <td className="py-3 px-2">
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${PLATFORM_COLORS[order.platform] || 'bg-slate-400'}`} />
                    <span className="font-medium">{order.platform}</span>
                  </span>
                </td>
                <td className="py-3 px-2 text-slate-500 hidden sm:table-cell truncate max-w-[140px]">
                  {order.customer || order.product || '—'}
                </td>
                <td className="py-3 px-2 text-right font-black text-foreground">
                  ₺{(order.price ?? 0).toLocaleString('tr-TR')}
                </td>
                <td className="py-3 px-2">
                  <StatusPill status={order.status} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500 text-sm">
                  Henüz sipariş bulunmuyor
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
