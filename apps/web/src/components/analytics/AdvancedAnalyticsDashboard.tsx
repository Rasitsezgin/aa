'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  RefreshCw,
  ShoppingCart,
  Target,
  Users,
} from 'lucide-react';

interface SalesMetrics {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  conversionRate: number;
}

interface ForecastData {
  date: string;
  predictedRevenue: number;
}

interface AnalyticsDashboardResponse {
  metrics?: DashboardMetrics;
  salesData?: SalesMetrics[];
  forecast?: ForecastData[];
}

export function useAnalyticsDashboard(period: 'week' | 'month' | 'quarter' | 'year', refreshKey: number) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesMetrics[]>([]);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics/advanced?period=${period}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Analitik verisi alınamadı.');
        }

        const data = (await response.json()) as AnalyticsDashboardResponse;

        if (cancelled) return;

        setMetrics(data.metrics ?? null);
        setSalesData(Array.isArray(data.salesData) ? data.salesData : []);
        setForecast(Array.isArray(data.forecast) ? data.forecast : []);
      } catch {
        if (cancelled) return;
        setMetrics(null);
        setSalesData([]);
        setForecast([]);
        setError('Analitik verileri yüklenemedi.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [period, refreshKey]);

  return { metrics, salesData, forecast, loading, error };
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  format = 'number',
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  format?: 'number' | 'currency' | 'percent';
}) {
  const formatted = useMemo(() => {
    switch (format) {
      case 'currency':
        return `₺${value.toLocaleString('tr-TR')}`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('tr-TR');
    }
  }, [format, value]);

  return (
    <motion.div whileHover={{ translateY: -4 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold">{formatted}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

function SimpleChart({
  title,
  data,
  valueKey,
}: {
  title: string;
  data: Array<Record<string, string | number>>;
  valueKey: string;
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="h-52 flex items-center justify-center text-sm text-gray-500">Veri bulunamadı</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => Number(item[valueKey] ?? 0)), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-between gap-1">
        {data.slice(-30).map((point, idx) => (
          <motion.div
            key={`${point.date ?? idx}-${idx}`}
            initial={{ height: 0 }}
            animate={{ height: `${(Number(point[valueKey] ?? 0) / maxValue) * 100}%` }}
            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-80 hover:opacity-100"
            title={`${point.date ?? ''}: ${Number(point[valueKey] ?? 0).toLocaleString('tr-TR')}`}
          />
        ))}
      </div>
    </div>
  );
}

export function AdvancedAnalyticsDashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshKey, setRefreshKey] = useState(0);
  const { metrics, salesData, forecast, loading, error } = useAnalyticsDashboard(period, refreshKey);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Gelişmiş Analitikler
          </h2>
          <p className="text-gray-500 mt-1">Veri kaynağından gelen metrikler ve trendler</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent"
          >
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="quarter">Bu Çeyrek</option>
            <option value="year">Bu Yıl</option>
          </select>
          <button
            onClick={() => setRefreshKey(v => v + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
          Analitik veriler yükleniyor...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 border border-red-200 dark:border-red-500/30 flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!loading && !error && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard title="Toplam Gelir" value={metrics.totalRevenue} icon={DollarSign} color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" format="currency" />
          <MetricCard title="Toplam Sipariş" value={metrics.totalOrders} icon={ShoppingCart} color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" />
          <MetricCard title="Ortalama Sipariş" value={metrics.avgOrderValue} icon={Target} color="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" format="currency" />
          <MetricCard title="Toplam Müşteri" value={metrics.totalCustomers} icon={Users} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" />
          <MetricCard title="Dönüşüm Oranı" value={metrics.conversionRate} icon={Target} color="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" format="percent" />
        </div>
      )}

      {!loading && !error && !metrics && salesData.length === 0 && forecast.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 text-sm text-gray-500">
          Bu dönem için analitik veri bulunamadı.
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleChart
            title="Günlük Satış Geliri"
            data={salesData.map(item => ({ date: item.date, revenue: item.revenue }))}
            valueKey="revenue"
          />
          <SimpleChart
            title="Günlük Sipariş Sayısı"
            data={salesData.map(item => ({ date: item.date, orders: item.orders }))}
            valueKey="orders"
          />
        </div>
      )}

      {!loading && !error && (
        <SimpleChart
          title="Gelir Tahmini"
          data={forecast.map(item => ({ date: item.date, predictedRevenue: item.predictedRevenue }))}
          valueKey="predictedRevenue"
        />
      )}
    </div>
  );
}

export default AdvancedAnalyticsDashboard;
