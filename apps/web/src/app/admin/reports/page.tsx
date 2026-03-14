"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, DollarSign, TrendingUp, Users, Target, Package, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { PageTransition } from '@/components/admin/PageTransition';

export default function AnalyticsDashboard() {
  // ═══════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ═══════════════════════════════════════════════════════════════════

  const { data: pnlData, isLoading: pnlLoading } = useQuery({
    queryKey: ['admin', 'reports', 'pnl'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reports/pnl');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const { data: cohortData, isLoading: cohortLoading } = useQuery({
    queryKey: ['admin', 'reports', 'cohort'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reports/cohort');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const { data: bestSellers, isLoading: bsLoading } = useQuery({
    queryKey: ['admin', 'reports', 'bestsellers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reports/bestsellers');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  const { data: geoData, isLoading: geoLoading } = useQuery({
    queryKey: ['admin', 'reports', 'geo'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reports/geo');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₺${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₺${(value / 1000).toFixed(1)}K`;
    return `₺${value}`;
  };

  const isLoading = pnlLoading || cohortLoading || bsLoading || geoLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <RefreshCcw className="w-8 h-8 animate-spin" />
          <p className="font-medium animate-pulse">Analiz verileri derleniyor...</p>
        </div>
      </div>
    );
  }

  // Prepare P&L Data for charts (Reverse to show chronological)
  const chartData = pnlData ? [...pnlData].reverse() : [];
  const currentMonthPnl = pnlData?.[0] || { revenue: 0, profit: 0, costs: 0 };
  const prevMonthPnl = pnlData?.[1] || { revenue: 0, profit: 0, costs: 0 };

  const revenueGrowth = prevMonthPnl.revenue ? ((currentMonthPnl.revenue - prevMonthPnl.revenue) / prevMonthPnl.revenue) * 100 : 0;
  const profitGrowth = prevMonthPnl.profit ? ((currentMonthPnl.profit - prevMonthPnl.profit) / prevMonthPnl.profit) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Gelişmiş Analitik</h1>
          <p className="text-sm text-slate-500 mt-1">Platform geneli kar/zarar, müşteri sadakati ve performans metrikleri.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            PDF Olarak Dışa Aktar
          </button>
          <button className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all">
            Rapor Oluştur
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Bu Ayki Net Ciro"
          value={`₺${currentMonthPnl.revenue.toLocaleString('tr-TR')}`}
          trend={revenueGrowth}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Bu Ayki Net Kar"
          value={`₺${currentMonthPnl.profit.toLocaleString('tr-TR')}`}
          trend={profitGrowth}
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Toplam Operasyon Gideri"
          value={`₺${currentMonthPnl.costs.toLocaleString('tr-TR')}`}
          trend={5.2} // Dummy trend for costs
          icon={Activity}
          color="orange"
          inverseTrend // Higher costs = bad (red arrow)
        />
        <MetricCard
          title="Aktif Cohort Sayısı"
          value={cohortData?.length?.toString() || "0"}
          trend={12.5}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Main P&L Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Kar/Zarar (P&L) Trendi</h3>
              <p className="text-xs text-slate-500">Son 6 aylık gelir, maliyet ve kar dağılımı</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '13px' }}
                  formatter={(value: any) => `₺${Number(value).toLocaleString('tr-TR')}`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area type="monotone" name="Brüt Gelir" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" name="Net Kar" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Çok Satanlar (Hacim)</h3>
              <p className="text-xs text-slate-500">Adet bazında en çok satan ilk 5 ürün</p>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            {bestSellers?.slice(0, 5).map((item: any, idx: number) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                  idx === 1 ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300' :
                    idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                  }`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Package size={12} /> {item.sales} sat.</span>
                    <span className="flex items-center gap-1 text-red-500"><RotateCcw size={12} /> %{item.returnRate} iade</span>
                  </div>
                </div>
              </div>
            ))}
            {(!bestSellers || bestSellers.length === 0) && (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">Veri bulunamadı</div>
            )}
          </div>
        </div>
      </div>

      {/* Cohort Analysis / Retention Heatmap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm overflow-x-auto">
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white">Kohort Analizi (Müşteri Sadakati)</h3>
          <p className="text-xs text-slate-500">Sipariş veren müşterilerin sonraki aylardaki geri dönüş (retention) oranları</p>
        </div>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th className="py-3 px-4 font-semibold w-32">Kohort (Ay)</th>
              <th className="py-3 px-4 font-semibold w-24">Boyut</th>
              <th className="py-3 px-4 font-medium text-center">Ay 1</th>
              <th className="py-3 px-4 font-medium text-center">Ay 2</th>
              <th className="py-3 px-4 font-medium text-center">Ay 3</th>
              <th className="py-3 px-4 font-medium text-center">Ay 4</th>
              <th className="py-3 px-4 font-medium text-center">Ay 5</th>
              <th className="py-3 px-4 font-medium text-center">Ay 6</th>
            </tr>
          </thead>
          <tbody>
            {cohortData?.map((row: any, i: number) => (
              <tr key={i} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{row.cohort}</td>
                <td className="py-3 px-4 text-slate-500">{row.size} Kş.</td>
                <CohortCell val={row.m1} />
                <CohortCell val={row.m2} />
                <CohortCell val={row.m3} />
                <CohortCell val={row.m4} />
                <CohortCell val={row.m5} />
                <CohortCell val={row.m6} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Geographic Distribution (Horizontal Bar / Density) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white">Coğrafi Sipariş Dağılımı</h3>
          <p className="text-xs text-slate-500">En çok sipariş alınan şehirler ve sipariş yoğunluğu</p>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={geoData} margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: any) => [`${value} Sipariş`, 'Yoğunluk']}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                {
                  geoData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#60a5fa' : index === 2 ? '#93c5fd' : '#bfdbfe'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUB COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function MetricCard({ title, value, trend, icon: Icon, color, inverseTrend = false }: any) {
  const isPositive = trend >= 0;
  const isGood = inverseTrend ? !isPositive : isPositive;

  const colors = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm group hover:border-slate-300 dark:hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${colors[color as keyof typeof colors]}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isGood ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      </div>
      <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h3>
      <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
    </div>
  );
}

function CohortCell({ val }: { val?: number }) {
  if (val === undefined) return <td className="py-3 px-4 text-center text-slate-300 dark:text-slate-700">-</td>;

  // Calculate opacity based on retention rate (100% = dark blue, 0% = white)
  // Dark mode requires a slightly different approach as white text on light blue is hard to read.
  const opacity = val / 100;
  const bgOpacity = opacity * 0.8 + 0.1; // Ensure background is somewhat visible

  return (
    <td className="py-1 px-1 text-center">
      <div
        className="mx-auto w-full h-10 rounded flex items-center justify-center text-xs font-bold transition-all hover:scale-105"
        style={{
          backgroundColor: `rgba(59, 130, 246, ${bgOpacity})`,
          color: opacity > 0.4 ? 'white' : 'var(--foreground)'
        }}
      >
        {val}%
      </div>
    </td>
  );
}

function RotateCcw(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
}
