'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Package, TrendingUp, Brain, Activity,
  AlertTriangle, LayoutGrid, Percent,
} from 'lucide-react';
import {
  useDashboardStats,
  useRecentOrders,
  useAiInsights,
  usePlatformPerformance,
  useActivityFeed,
  useStockAlerts,
  useGoals,
  useMarketplaceHealth,
} from '@/lib/hooks';
import {
  loadDashboardWidgets,
  loadDashboardWidgetsFromApi,
  isWidgetVisible,
  type DashboardPeriod,
} from '@/lib/dashboard-layout';
import {
  DashboardCard,
  KPICard,
  buildSparkSeries,
  buildRevenueTrend,
  CHART_COLORS,
} from './dashboard-ui';
import { AnimatedAreaChart, AnimatedPieChart } from '@/components/ui/AnimatedCharts';
import { IntegrationStatusCard } from './IntegrationStatusCard';
import { DashboardOrdersTable } from './DashboardOrdersTable';
import GoalTracker from './GoalTracker';
import MarketplaceHealthMap from './MarketplaceHealthMap';
import { GhostStockWidget } from './GhostStockWidget';
import { OrderPipeline } from './OrderPipeline';
import { SyncQueuePanel } from './SyncQueuePanel';
import { useModules } from '@/lib/modules';

interface DynamicDashboardProps {
  period?: DashboardPeriod;
  editable?: boolean;
}

export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ period = '30d' }) => {
  const [widgets, setWidgets] = useState(loadDashboardWidgets);

  useEffect(() => {
    (async () => {
      const remote = await loadDashboardWidgetsFromApi();
      setWidgets(remote || loadDashboardWidgets());
    })();
    const onStorage = () => setWidgets(loadDashboardWidgets());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const { data: stats, loading: statsLoading } = useDashboardStats(period);
  const comparison = stats?.periodComparison;
  const { data: ordersRaw, loading: ordersLoading } = useRecentOrders(8);
  const orders = ordersRaw ?? [];
  const { data: insights, loading: insightsLoading } = useAiInsights();
  const { data: platforms, loading: platformsLoading } = usePlatformPerformance();
  const { data: activities, loading: activitiesLoading } = useActivityFeed(8);
  const { data: stockAlerts, loading: stockLoading } = useStockAlerts();
  const { data: goals, loading: goalsLoading } = useGoals();
  const { data: marketplaceHealth, loading: healthLoading } = useMarketplaceHealth();
  const { syncQueue, orderPipeline, retrySyncIntegration } = useModules();

  const pieData = useMemo(
    () =>
      (platforms || []).map((p: any) => ({
        name: p.platform,
        value: Math.round(p.revenue || p.orders || 1),
      })),
    [platforms],
  );

  const revenueTrend = useMemo(
    () =>
      buildRevenueTrend(
        stats?.totalRevenue || 0,
        stats?.totalOrders || 0,
        comparison?.revenueChange || 0,
        period,
      ),
    [stats, comparison, period],
  );

  const show = (id: Parameters<typeof isWidgetVisible>[1]) => isWidgetVisible(widgets, id);

  return (
    <div className="space-y-6">
      {show('kpis') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          <KPICard title="Toplam Ciro" value={stats?.totalRevenue} trend={comparison?.revenueChange ?? 0} icon={DollarSign} format="currency" sparkData={buildSparkSeries(stats?.totalRevenue || 0, comparison?.revenueChange ?? 0)} loading={statsLoading} />
          <KPICard title="Sipariş" value={stats?.totalOrders} trend={comparison?.ordersChange ?? 0} icon={ShoppingCart} sparkData={buildSparkSeries(stats?.totalOrders || 0, comparison?.ordersChange ?? 0)} loading={statsLoading} glow="bg-blue-500" accent="text-blue-500" />
          <KPICard title="Aktif Ürün" value={stats?.activeProducts} trend={comparison?.productsChange ?? 0} icon={Package} loading={statsLoading} glow="bg-violet-500" accent="text-violet-500" />
          <KPICard title="Dönüşüm" value={stats?.conversionRate} trend={comparison?.conversionChange ?? 0} icon={TrendingUp} format="percentage" loading={statsLoading} glow="bg-emerald-500" accent="text-emerald-500" />
          <KPICard title="Net Kâr" value={stats?.netProfit} trend={comparison?.profitChange ?? 0} icon={DollarSign} format="currency" loading={statsLoading} glow="bg-amber-500" accent="text-amber-500" />
          <KPICard title="Kâr Marjı" value={stats?.profitMargin} trend={comparison?.marginChange ?? 0} icon={Percent} format="percentage" loading={statsLoading} glow="bg-pink-500" accent="text-pink-500" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {show('revenue-chart') && (
          <div className="xl:col-span-7">
            <DashboardCard title="Gelir & Sipariş Trendi" icon={TrendingUp} loading={statsLoading}>
              <div className="h-[280px]">
                <AnimatedAreaChart data={revenueTrend} colors={[CHART_COLORS[0], CHART_COLORS[1]]} />
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-2">Turuncu: ciro · Amber: sipariş ({period})</p>
            </DashboardCard>
          </div>
        )}

        {show('platform-chart') && (
          <div className="xl:col-span-5">
            <DashboardCard title="Platform Dağılımı" icon={Package} loading={platformsLoading}>
              <div className="h-[280px]">
                {pieData.length > 0 ? (
                  <AnimatedPieChart data={pieData} />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-500">Platform verisi bekleniyor</div>
                )}
              </div>
            </DashboardCard>
          </div>
        )}

        {show('integration-status') && (
          <div className="xl:col-span-4">
            <IntegrationStatusCard platforms={platforms as any[]} loading={platformsLoading} />
          </div>
        )}

        {show('orders') && (
          <div className="xl:col-span-8">
            <DashboardOrdersTable orders={orders} loading={ordersLoading} />
          </div>
        )}
      </div>

      {show('ai-hero') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden p-6 lg:p-8 rounded-[18px] border border-indigo-500/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 text-white shadow-lg"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/15 to-transparent pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-orange-600 rounded-xl shadow-lg shadow-orange-500/30">
                  <Brain className="w-6 h-6" />
                </div>
                <h2 className="text-xl lg:text-2xl font-black tracking-tight">AI-Pilot Kontrol Merkezi</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Yapay zeka mağazanızı izliyor; fiyat, stok ve kampanya önerilerini gerçek zamanlı üretiyor.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:col-span-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Doğruluk</p>
                <p className="text-2xl font-black text-orange-400">%{stats?.aiMetrics?.accuracy?.toFixed(1) || '94.5'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Otomatik İşlem</p>
                <p className="text-2xl font-black">{stats?.aiMetrics?.automatedActions || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-orange-500/15 border border-orange-500/25 col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-200 mb-1">AI Tasarruf</p>
                <p className="text-2xl font-black">₺{(stats?.aiMetrics?.savingsGenerated || 0).toLocaleString('tr-TR')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {show('profitability') && (
          <DashboardCard title="Kârlılık Analizi" icon={TrendingUp} loading={statsLoading}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Brüt Ciro</span><span className="font-bold">₺{(stats?.totalRevenue || 0).toLocaleString('tr-TR')}</span></div>
              <div className="flex justify-between text-red-500/90 text-xs"><span>Ürün Maliyeti</span><span>- ₺{(stats?.financialAnalytics?.totalProductCost || 0).toLocaleString('tr-TR')}</span></div>
              <div className="flex justify-between text-red-500/90 text-xs"><span>Komisyon</span><span>- ₺{(stats?.financialAnalytics?.totalCommission || 0).toLocaleString('tr-TR')}</span></div>
              <div className="flex justify-between text-red-500/90 text-xs"><span>Kargo</span><span>- ₺{(stats?.financialAnalytics?.totalShipping || 0).toLocaleString('tr-TR')}</span></div>
              <div className="pt-3 mt-3 border-t border-dashed border-border flex justify-between items-center">
                <span className="font-black">Net Kâr</span>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-500">₺{(stats?.netProfit || 0).toLocaleString('tr-TR')}</div>
                  <div className="text-[10px] font-bold text-emerald-600">%{stats?.profitMargin || 0} marj</div>
                </div>
              </div>
            </div>
          </DashboardCard>
        )}

        {show('ai-insights') && (
          <DashboardCard title="AI Önerileri" icon={Brain} loading={insightsLoading}>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(insights || []).slice(0, 4).map((insight: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                  <p className="text-[10px] font-black uppercase text-orange-600 mb-1">{insight.type || insight.title || 'Öneri'}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{insight.message || insight.description}</p>
                </div>
              ))}
              {!insights?.length && !insightsLoading && <p className="text-sm text-slate-500">Henüz öneri yok</p>}
            </div>
          </DashboardCard>
        )}

        {show('stock-alerts') && (
          <DashboardCard title="Stok Uyarıları" icon={AlertTriangle} loading={stockLoading}>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(stockAlerts || []).slice(0, 5).map((alert: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <Package className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{alert.productName}</p>
                    <p className="text-xs text-slate-500">Kalan: {alert.currentStock ?? alert.stock} adet</p>
                  </div>
                </div>
              ))}
              {!stockAlerts?.length && !stockLoading && <p className="text-sm text-slate-500">Kritik stok yok</p>}
            </div>
          </DashboardCard>
        )}
      </div>

      {(show('order-pipeline') || show('sync-queue')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {show('order-pipeline') && (
            <OrderPipeline
              orders={orders}
              counts={orderPipeline}
              loading={ordersLoading}
            />
          )}
          {show('sync-queue') && (
            <SyncQueuePanel items={syncQueue} onRetry={retrySyncIntegration} />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {show('ghost-stock') && (
          <div className="lg:col-span-1">
            <GhostStockWidget />
          </div>
        )}
        {show('goals') && (
          <div className="lg:col-span-1">
            <GoalTracker goals={(goalsLoading ? [] : goals || []) as any} />
          </div>
        )}
        {show('marketplace-health') && (
          <div className="lg:col-span-1">
            <MarketplaceHealthMap data={(healthLoading ? [] : marketplaceHealth || []) as any} />
          </div>
        )}
      </div>

      {show('activity') && (
        <DashboardCard title="Son Aktiviteler" icon={Activity} loading={activitiesLoading}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(activities || []).map((activity: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border">
                <Activity className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      <div className="flex justify-end">
        <Link
          href="/dashboard/widget-editor"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-xs font-black text-slate-500 hover:text-orange-600 hover:border-orange-500/30 transition-all"
        >
          <LayoutGrid size={14} /> Paneli Özelleştir
        </Link>
      </div>
    </div>
  );
};
