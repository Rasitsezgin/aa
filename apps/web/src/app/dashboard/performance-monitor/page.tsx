"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Cpu, MemoryStick, HardDrive, Gauge, Clock,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    RefreshCw, Zap, Server, Globe, Database, AlertTriangle
} from 'lucide-react';

import { useSystemPerformance } from '@/lib/hooks';

export default function PerformanceMonitorPage() {
    const { data: metricsData, loading } = useSystemPerformance();
    const [timeRange, setTimeRange] = useState<'5m' | '1h' | '24h' | '7d'>('1h');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const metrics = metricsData || {
        cpu: 0,
        memory: 0,
        disk: 0,
        uptime: 'Yükleniyor...',
        responseTime: 0,
        requestsPerSec: 0,
        errorRate: 0,
        activeConnections: 0,
        timeSeries: [],
        memoryTimeSeries: [],
    };

    const timeSeries = metrics.timeSeries || [];
    const memoryTimeSeries = metrics.memoryTimeSeries || [];
    const maxCpu = timeSeries.length > 0 ? Math.max(...timeSeries) : 100;

    const endpointPerf = [
        { path: '/api/products', avg: 42, p95: 120, p99: 250, rpm: 450, errors: 0 },
        { path: '/api/orders', avg: 67, p95: 180, p99: 380, rpm: 320, errors: 2 },
        { path: '/api/sync', avg: 540, p95: 1100, p99: 2500, rpm: 45, errors: 5 },
        { path: '/api/reports', avg: 1450, p95: 3200, p99: 5800, rpm: 12, errors: 0 },
        { path: '/api/customers', avg: 55, p95: 140, p99: 290, rpm: 180, errors: 1 },
        { path: '/api/auth', avg: 28, p95: 65, p99: 120, rpm: 560, errors: 0 },
    ];

    const alerts = [
        { message: 'API yanıt süresi normal seyrediyor', severity: 'info', time: 'Şimdi' },
        { message: 'SSL sertifikası 7 gün sonra sona erecek', severity: 'info', time: '3 saat önce' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Activity className="w-7 h-7 text-indigo-400" /> Performans Monitörü
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Sistem performansını gerçek zamanlı izleyin</p>
                </div>
                <div className="flex items-center gap-2">
                    {(['5m', '1h', '24h', '7d'] as const).map(r => (
                        <button key={r} onClick={() => setTimeRange(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${timeRange === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-foreground'}`}>
                            {r}
                        </button>
                    ))}
                    <button onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`p-2 rounded-lg border ${autoRefresh ? 'border-emerald-500/30 text-emerald-400' : 'border-border text-slate-500'}`}>
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                    </button>
                </div>
            </div>

            {/* Main Gauges */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'CPU Kullanımı', value: metrics.cpu, suffix: '%', icon: Cpu, color: metrics.cpu > 80 ? 'text-red-400' : metrics.cpu > 60 ? 'text-amber-400' : 'text-emerald-400', barColor: metrics.cpu > 80 ? 'bg-red-500' : metrics.cpu > 60 ? 'bg-amber-500' : 'bg-emerald-500' },
                    { label: 'Bellek', value: metrics.memory, suffix: '%', icon: MemoryStick, color: metrics.memory > 80 ? 'text-red-400' : metrics.memory > 60 ? 'text-amber-400' : 'text-emerald-400', barColor: metrics.memory > 80 ? 'bg-red-500' : metrics.memory > 60 ? 'bg-amber-500' : 'bg-emerald-500' },
                    { label: 'Disk', value: metrics.disk, suffix: '%', icon: HardDrive, color: 'text-emerald-400', barColor: 'bg-emerald-500' },
                    { label: 'Uptime', value: metrics.uptime, suffix: '', icon: Clock, color: 'text-blue-400', barColor: 'bg-blue-500' },
                ].map((g, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-3">
                            <g.icon className={`w-5 h-5 ${g.color}`} />
                            {typeof g.value === 'number' && (
                                <span className={`text-xs ${g.color}`}>{g.value > 60 ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}</span>
                            )}
                        </div>
                        <div className={`text-2xl font-bold ${g.color}`}>{g.value}{g.suffix}</div>
                        <div className="text-xs text-slate-500 mb-2">{g.label}</div>
                        {typeof g.value === 'number' && (
                            <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${g.value}%` }}
                                    className={`h-full rounded-full ${g.barColor}`} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Yanıt Süresi', value: `${metrics.responseTime}ms`, icon: Gauge, color: 'text-indigo-400', change: '-12ms' },
                    { label: 'İstek/sn', value: metrics.requestsPerSec.toString(), icon: Zap, color: 'text-blue-400', change: '+18' },
                    { label: 'Hata Oranı', value: `%${metrics.errorRate}`, icon: AlertTriangle, color: metrics.errorRate > 1 ? 'text-red-400' : 'text-emerald-400', change: '-0.1%' },
                    { label: 'Aktif Bağlantı', value: metrics.activeConnections.toString(), icon: Globe, color: 'text-amber-400', change: '+5' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <span className="text-xs text-emerald-400">{stat.change}</span>
                        </div>
                        <div className="text-lg font-bold text-foreground mt-1">{stat.value}</div>
                        <div className="text-[10px] text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl border border-border p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-indigo-400" /> CPU Kullanım Grafiği
                    </h3>
                    <div className="flex items-end gap-1 h-24">
                        {timeSeries.map((val: number, i: number) => (
                            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(val / maxCpu) * 100}%` }}
                                transition={{ delay: i * 0.02 }}
                                className={`flex-1 rounded-t ${val > 70 ? 'bg-red-500/60' : val > 50 ? 'bg-amber-500/60' : 'bg-emerald-500/60'}`} />
                        ))}
                    </div>
                </div>
                <div className="bg-surface rounded-xl border border-border p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MemoryStick className="w-4 h-4 text-blue-400" /> Bellek Kullanım Grafiği
                    </h3>
                    <div className="flex items-end gap-1 h-24">
                        {memoryTimeSeries.map((val: number, i: number) => (
                            <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${val}%` }}
                                transition={{ delay: i * 0.02 }}
                                className={`flex-1 rounded-t ${val > 80 ? 'bg-red-500/60' : val > 65 ? 'bg-amber-500/60' : 'bg-blue-500/60'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Endpoint Performance */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-foreground">Endpoint Performansı</h3>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-slate-500 text-xs border-b border-border">
                            <th className="text-left px-6 py-3 font-medium">Endpoint</th>
                            <th className="text-left px-4 py-3 font-medium">Ort. (ms)</th>
                            <th className="text-left px-4 py-3 font-medium">P95 (ms)</th>
                            <th className="text-left px-4 py-3 font-medium">P99 (ms)</th>
                            <th className="text-left px-4 py-3 font-medium">İstek/dk</th>
                            <th className="text-left px-4 py-3 font-medium">Hata</th>
                        </tr>
                    </thead>
                    <tbody>
                        {endpointPerf.map((ep, i) => (
                            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                className="border-b border-border/50 hover:bg-background/50">
                                <td className="px-6 py-3 font-mono text-xs text-indigo-400">{ep.path}</td>
                                <td className={`px-4 py-3 text-xs ${ep.avg > 500 ? 'text-red-400' : ep.avg > 200 ? 'text-amber-400' : 'text-emerald-400'}`}>{ep.avg}</td>
                                <td className={`px-4 py-3 text-xs ${ep.p95 > 1000 ? 'text-red-400' : 'text-slate-400'}`}>{ep.p95}</td>
                                <td className={`px-4 py-3 text-xs ${ep.p99 > 3000 ? 'text-red-400' : 'text-slate-400'}`}>{ep.p99}</td>
                                <td className="px-4 py-3 text-xs text-foreground">{ep.rpm}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs ${ep.errors > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{ep.errors}</span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="bg-surface rounded-xl border border-border p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" /> Uyarılar
                    </h3>
                    <div className="space-y-2">
                        {alerts.map((alert, i) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${alert.severity === 'warning' ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-blue-500/5 border border-blue-500/10'}`}>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className={`w-4 h-4 ${alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                                    <span className="text-xs text-foreground">{alert.message}</span>
                                </div>
                                <span className="text-[10px] text-slate-500">{alert.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
