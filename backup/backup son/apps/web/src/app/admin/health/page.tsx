"use client";

import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, AlertTriangle, CheckCircle, Clock, Cpu, Database, 
  Wifi, Zap, BarChart3, RefreshCw, AlertCircle
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  details?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: { used: number; total: number; percentage: number };
  uptime: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  responseTime: number;
}

export default function SystemHealthPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
    if (autoRefresh) {
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      const [servicesRes, metricsRes] = await Promise.all([
        fetch('/api/system/services'),
        fetch('/api/system/metrics'),
      ]);
      if (!servicesRes.ok || !metricsRes.ok) {
        throw new Error('Sistem sağlık verileri alınamadı');
      }
      const [servicesData, metricsData] = await Promise.all([
        servicesRes.json(),
        metricsRes.json(),
      ]);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setMetrics(metricsData ?? null);
    } catch (error) {
      console.error('Sistem sağlık verileri yüklenemedi:', error);
      setServices([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}g ${hours}s`;
  };

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'degraded': return 'text-yellow-500 bg-yellow-500/10';
      case 'down': return 'text-red-500 bg-red-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4" />;
      case 'down': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const overallStatus = services.length === 0
    ? 'down'
    : healthyCount === services.length
      ? 'healthy'
      : healthyCount > services.length * 0.8
        ? 'degraded'
        : 'down';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            Sistem Sağlığı
          </h1>
          <p className="text-slate-500 mt-1">Tüm servislerin durumu ve performans metrikleri</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-slate-600 dark:text-slate-400">Otomatik yenile</span>
          </label>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={16} />
            Yenile
          </button>
        </div>
      </div>

      {services.length === 0 && !metrics ? (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 text-sm text-slate-500">
          Sistem sağlık verisi alınamadı. Endpoint yanıt verdiğinde veriler burada gösterilecek.
        </div>
      ) : (
      <>
      {/* Overall Status */}
      <div className={`p-6 rounded-2xl border ${
        overallStatus === 'healthy' 
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/20'
          : overallStatus === 'degraded'
          ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-500/20'
          : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${getStatusColor(overallStatus)}`}>
            {getStatusIcon(overallStatus)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {overallStatus === 'healthy' 
                ? 'Tüm Sistemler Çalışıyor' 
                : overallStatus === 'degraded'
                ? 'Bazı Servisler Yavaş'
                : 'Sistem Sorunları Tespit Edildi'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {healthyCount}/{services.length} servis sağlıklı
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'CPU', value: `${metrics.cpu}%`, icon: Cpu, color: metrics.cpu > 80 ? 'text-red-500' : 'text-blue-500' },
            { label: 'RAM', value: `${metrics.memory.percentage}%`, icon: Server, color: metrics.memory.percentage > 80 ? 'text-red-500' : 'text-purple-500' },
            { label: 'Uptime', value: formatUptime(metrics.uptime), icon: Clock, color: 'text-green-500' },
            { label: 'Bağlantı', value: metrics.activeConnections.toString(), icon: Wifi, color: 'text-cyan-500' },
            { label: 'İstek/dk', value: metrics.requestsPerMinute.toString(), icon: Zap, color: 'text-amber-500' },
            { label: 'Hata Oranı', value: `${metrics.errorRate}%`, icon: AlertTriangle, color: metrics.errorRate > 1 ? 'text-red-500' : 'text-slate-500' },
            { label: 'Yanıt Süresi', value: `${metrics.responseTime}ms`, icon: BarChart3, color: metrics.responseTime > 100 ? 'text-yellow-500' : 'text-emerald-500' },
          ].map((metric, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.label}</span>
              </div>
              <div className="text-xl font-black text-foreground">{metric.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service, idx) => (
          <div 
            key={idx}
            className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                {service.name.includes('Database') ? <Database className="w-4 h-4" /> :
                 service.name.includes('Redis') ? <Zap className="w-4 h-4" /> :
                 service.name.includes('API') ? <Wifi className="w-4 h-4" /> :
                 <Server className="w-4 h-4" />}
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
                {service.status === 'healthy' ? 'Sağlıklı' : service.status === 'degraded' ? 'Yavaş' : 'Çalışmıyor'}
              </div>
            </div>
            <h3 className="font-bold text-foreground text-sm">{service.name}</h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span>{service.responseTime}ms</span>
              {service.details && (
                <span className="text-yellow-600">{service.details}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
