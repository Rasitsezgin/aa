"use client";

import React, { useState, useEffect } from 'react';
import {
  Activity, BarChart3, AlertTriangle, TrendingUp, Zap, Clock,
  Users, Server, Filter, ChevronDown, ChevronUp
} from 'lucide-react';

interface TenantUsage {
  tenantId: string;
  tenantName: string;
  requests: number;
  limit: number;
  percentage: number;
}

interface HourlyStat {
  hour: number;
  requests: number;
  errors: number;
}

interface EndpointStat {
  endpoint: string;
  count: number;
  avgResponseTime: number;
}

interface AbuseAlert {
  tenantId: string;
  reason: string;
  severity: 'warning' | 'critical';
}

export default function ApiUsagePage() {
  const [data, setData] = useState<{
    tenantUsage: TenantUsage[];
    hourlyStats: HourlyStat[];
    topEndpoints: EndpointStat[];
    totalRequests: number;
    abuseAlerts: AbuseAlert[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'requests' | 'percentage'>('percentage');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/proxy/admin/api-usage');
      if (!res.ok) throw new Error('API kullanım verileri alınamadı');
      const usageData = await res.json();
      setData(usageData);
    } catch (error) {
      console.error('API kullanım verileri yüklenemedi:', error);
      setData({
        tenantUsage: [],
        hourlyStats: [],
        topEndpoints: [],
        totalRequests: 0,
        abuseAlerts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const sortedUsage = data?.tenantUsage.slice().sort((a, b) => {
    const multiplier = sortDir === 'desc' ? -1 : 1;
    return multiplier * (a[sortBy] - b[sortBy]);
  }) || [];

  const toggleSort = (field: 'requests' | 'percentage') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl">
            <Activity className="w-6 h-6 text-cyan-500" />
          </div>
          API Kullanım Paneli
        </h1>
        <p className="text-slate-500 mt-1">Tenant bazında API kullanım metrikleri ve limitler</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-cyan-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam İstek</span>
          </div>
          <div className="text-3xl font-black text-foreground">{formatNumber(data.totalRequests)}</div>
          <div className="text-xs text-slate-500 mt-1">Son 24 saat</div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ortalama/Saat</span>
          </div>
          <div className="text-3xl font-black text-foreground">{formatNumber(Math.round(data.totalRequests / 24))}</div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aktif Tenant</span>
          </div>
          <div className="text-3xl font-black text-foreground">{data.tenantUsage.length}</div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uyarı</span>
          </div>
          <div className="text-3xl font-black text-red-600">{data.abuseAlerts.length}</div>
        </div>
      </div>

      {/* Abuse Alerts */}
      {data.abuseAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6">
          <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" />
            Kullanım Uyarıları
          </h3>
          <div className="space-y-3">
            {data.abuseAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${alert.severity === 'critical'
                    ? 'bg-red-100 dark:bg-red-900/20'
                    : 'bg-yellow-100 dark:bg-yellow-900/20'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                  <span className="font-medium text-foreground">
                    {data.tenantUsage.find(t => t.tenantId === alert.tenantId)?.tenantName}
                  </span>
                </div>
                <span className={`text-sm ${alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                  {alert.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tenant Usage */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-purple-500" />
            Tenant Kullanımı
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-white/5">
              <span>Tenant</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleSort('requests')}
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  İstek
                  {sortBy === 'requests' && (sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
                </button>
                <button
                  onClick={() => toggleSort('percentage')}
                  className="flex items-center gap-1 hover:text-slate-700"
                >
                  Kullanım
                  {sortBy === 'percentage' && (sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
                </button>
              </div>
            </div>
            {sortedUsage.map((tenant) => (
              <div key={tenant.tenantId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{tenant.tenantName}</span>
                  <span className="text-sm text-slate-500">
                    {formatNumber(tenant.requests)} / {formatNumber(tenant.limit)}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${tenant.percentage >= 90 ? 'bg-red-500' :
                        tenant.percentage >= 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                      }`}
                    style={{ width: `${tenant.percentage}%` }}
                  />
                </div>
                <div className="text-right text-xs text-slate-500">%{tenant.percentage}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Endpoints */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-6">
            <Server className="w-5 h-5 text-cyan-500" />
            En Çok Kullanılan Endpoint&apos;ler
          </h3>
          <div className="space-y-4">
            {data.topEndpoints.map((endpoint, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                <div>
                  <code className="text-sm font-mono text-foreground">{endpoint.endpoint}</code>
                  <div className="text-xs text-slate-500 mt-1">{formatNumber(endpoint.count)} istek</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${endpoint.avgResponseTime > 200 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                    {endpoint.avgResponseTime}ms
                  </div>
                  <div className="text-xs text-slate-500">ort. yanıt</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Chart */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Saatlik Dağılım
        </h3>
        <div className="flex items-end gap-1 h-40">
          {data.hourlyStats.map((stat, idx) => {
            const maxRequests = Math.max(...data.hourlyStats.map(s => s.requests));
            const height = (stat.requests / maxRequests) * 100;
            return (
              <div
                key={idx}
                className="flex-1 group cursor-pointer relative"
              >
                <div
                  className="bg-blue-500 hover:bg-blue-600 rounded-t transition-all"
                  style={{ height: `${height}%` }}
                />
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  {stat.hour}:00 - {formatNumber(stat.requests)} istek
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  );
}
