'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  Zap,
  AlertTriangle,
  Eye,
  Filter as FilterIcon,
} from 'lucide-react';

// Types
interface SalesMetrics {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  conversionRate: number;
  customerRetention: number;
  churnRate: number;
}

interface ForecastData {
  date: string;
  predictedRevenue: number;
  confidence: number;
}

// Demo data generators
function generateSalesData(days: number = 30): SalesMetrics[] {
  const data: SalesMetrics[] = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const baseRevenue = 10000 + Math.random() * 5000;
    const baseOrders = 20 + Math.floor(Math.random() * 30);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(baseRevenue * (1 + (Math.random() - 0.5) * 0.3)),
      orders: baseOrders + Math.floor((Math.random() - 0.5) * 10),
      averageOrderValue: Math.round(baseRevenue / baseOrders),
      conversionRate: 2.5 + Math.random() * 2,
    });
  }
  
  return data;
}

function generateForecastData(days: number = 30): ForecastData[] {
  const data: ForecastData[] = [];
  const now = new Date();
  let baseValue = 12000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    baseValue += (Math.random() - 0.4) * 2000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      predictedRevenue: Math.max(8000, Math.round(baseValue)),
      confidence: 75 + Math.random() * 20,
    });
  }
  
  return data;
}

// Hooks
export function useAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesMetrics[]>([]);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      const sales = generateSalesData(30);
      setSalesData(sales);
      setForecast(generateForecastData(30));
      
      const totalRevenue = sales.reduce((sum, d) => sum + d.revenue, 0);
      const totalOrders = sales.reduce((sum, d) => sum + d.orders, 0);
      
      setMetrics({
        totalRevenue,
        totalOrders,
        avgOrderValue: Math.round(totalRevenue / totalOrders),
        totalCustomers: 1250 + Math.floor(Math.random() * 500),
        conversionRate: 3.2,
        customerRetention: 65.5,
        churnRate: 5.2,
      });
      setLoading(false);
    }, 500);
  }, []);
  
  return { metrics, salesData, forecast, loading };
}

// Metric Card Component
function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  format = 'number'
}: {
  title: string;
  value: number;
  change?: number;
  icon: any;
  color: string;
  format?: 'number' | 'currency' | 'percent';
}) {
  const isPositive = (change ?? 0) >= 0;
  
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return `₺${(value / 1000).toFixed(0)}K`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('tr-TR');
    }
  };
  
  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold">{formatValue()}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

// Chart Component (Placeholder)
function SimpleChart({
  title,
  data,
  type = 'line'
}: {
  title: string;
  data: any[];
  type?: 'line' | 'bar' | 'area';
}) {
  const maxValue = Math.max(...data.map((d: any) => d.value || d.revenue || 0));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-between gap-1">
        {data.slice(0, 30).map((point: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ height: 0 }}
            animate={{ height: `${((point.value || point.revenue) / maxValue) * 100}%` }}
            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-80 hover:opacity-100 cursor-pointer group relative"
          >
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {(point.value || point.revenue || 0).toLocaleString('tr-TR')}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Main Analytics Dashboard Component
export function AdvancedAnalyticsDashboard() {
  const { metrics, salesData, forecast, loading } = useAnalyticsDashboard();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [compareEnabled, setCompareEnabled] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Gelişmiş Analitikler
          </h2>
          <p className="text-gray-500 mt-1">
            Detaylı satış analizi, tahminler ve KPI'lar
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent"
          >
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="quarter">Bu Çeyrek</option>
            <option value="year">Bu Yıl</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Dışa Aktar
          </button>
        </div>
      </div>
      
      {/* Metrics Grid */}
      {!loading && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Toplam Gelir"
            value={metrics.totalRevenue}
            change={12.5}
            icon={DollarSign}
            color="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
            format="currency"
          />
          <MetricCard
            title="Toplam Sipariş"
            value={metrics.totalOrders}
            change={8.3}
            icon={ShoppingCart}
            color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
          />
          <MetricCard
            title="Ortalama Sipariş Değeri"
            value={metrics.avgOrderValue}
            change={3.2}
            icon={Target}
            color="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
            format="currency"
          />
          <MetricCard
            title="Dönüşüm Oranı"
            value={metrics.conversionRate}
            change={-1.5}
            icon={Zap}
            color="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
            format="percent"
          />
          <MetricCard
            title="Müşteri Tutma"
            value={metrics.customerRetention}
            change={5.2}
            icon={Users}
            color="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
            format="percent"
          />
          <MetricCard
            title="Ayrılma Oranı"
            value={metrics.churnRate}
            change={-2.1}
            icon={AlertTriangle}
            color="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
            format="percent"
          />
          <MetricCard
            title="Toplam Müşteri"
            value={metrics.totalCustomers}
            change={15.7}
            icon={Users}
            color="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
          />
        </div>
      )}
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Günlük Satış Trendi"
          data={salesData.map(d => ({ ...d, value: d.revenue }))}
          type="area"
        />
        <SimpleChart
          title="Sipariş Sayısı"
          data={salesData.map(d => ({ ...d, value: d.orders }))}
          type="bar"
        />
      </div>
      
      {/* Forecast */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Gelir Tahmini (30 Gün)
          </h3>
          <span className="text-sm text-gray-500">Ortalama Güven: 82%</span>
        </div>
        <div className="h-64 flex items-end justify-between gap-1">
          {forecast.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              animate={{ height: `${(point.predictedRevenue / 20000) * 100}%` }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-70 hover:opacity-100"
              title={`${point.date}: ₺${point.predictedRevenue.toLocaleString('tr-TR')}`}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4">En Çok Satan Ürünler</h3>
          <div className="space-y-3">
            {[
              { name: 'Ürün A', sales: 245, revenue: 12500 },
              { name: 'Ürün B', sales: 189, revenue: 9450 },
              { name: 'Ürün C', sales: 156, revenue: 7800 },
            ].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} satış</p>
                </div>
                <p className="font-semibold text-green-600">₺{(product.revenue / 1000).toFixed(0)}K</p>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Customer Segments */}
        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4">Müşteri Segmentleri</h3>
          <div className="space-y-3">
            {[
              { segment: 'VIP', count: 45, value: 45000, color: 'bg-purple-100 text-purple-700' },
              { segment: 'Düzenli', count: 320, value: 85000, color: 'bg-blue-100 text-blue-700' },
              { segment: 'Yeni', count: 180, value: 18000, color: 'bg-green-100 text-green-700' },
            ].map((seg, idx) => (
              <div key={idx} className={`p-3 rounded ${seg.color.split(' ')[0]} ${seg.color.split(' ')[1]}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{seg.segment}</span>
                  <span className="text-sm">{seg.count} müşteri</span>
                </div>
                <p className="text-sm mt-1">₺{(seg.value / 1000).toFixed(0)}K değer</p>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Trends & Alerts */}
        <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Uyarılar & Trendler
          </h3>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded">
              ⚠️ Stok 5 ürünün bitme noktasında
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded">
              📊 Pazartesi satışları ortalamanın %15 altında
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded">
              ✅ Mobil satışlar +23% büyüdü
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded">
              💡 Email kampanyasının CTR artmış
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdvancedAnalyticsDashboard;
