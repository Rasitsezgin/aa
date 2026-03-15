"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Zap, Clock, AlertTriangle, BarChart3, Shield,
    ArrowUpRight, ArrowDownRight, RefreshCw, Server
} from 'lucide-react';

const endpointStats: Array<{ path: string; method: string; used: number; limit: number; avgMs: number; status: string }> = [];

const hourlyUsage: number[] = [];

const statusColors: Record<string, string> = {
    normal: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
};

const statusBg: Record<string, string> = {
    normal: 'bg-emerald-500/10',
    warning: 'bg-amber-500/10',
    critical: 'bg-red-500/10',
};

export default function ApiRateLimitPage() {
    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

    const totalUsed = endpointStats.reduce((a, e) => a + e.used, 0);
    const totalLimit = endpointStats.reduce((a, e) => a + e.limit, 0);
    const criticalCount = endpointStats.filter(e => e.status === 'critical').length;
    const avgLatency = endpointStats.length > 0
        ? Math.round(endpointStats.reduce((a, e) => a + e.avgMs, 0) / endpointStats.length)
        : 0;
    const maxHourly = hourlyUsage.length > 0 ? Math.max(...hourlyUsage) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Activity className="w-7 h-7 text-indigo-400" /> API Rate Limit Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">API kullanım oranları ve rate limit durumları</p>
                </div>
                <div className="flex items-center gap-2">
                    {(['1h', '24h', '7d'] as const).map(r => (
                        <button key={r} onClick={() => setTimeRange(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${timeRange === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-foreground'}`}>
                            {r}
                        </button>
                    ))}
                    <button className="p-2 text-slate-400 hover:text-foreground">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Toplam İstek', value: totalUsed.toLocaleString(), sub: `/ ${totalLimit.toLocaleString()}`, icon: Zap, color: 'text-blue-400', change: '+12%', up: true },
                    { label: 'Kullanım Oranı', value: totalLimit > 0 ? `${Math.round((totalUsed / totalLimit) * 100)}%` : '--', sub: 'kapasite', icon: BarChart3, color: 'text-indigo-400', change: '+5%', up: true },
                    { label: 'Ort. Latency', value: `${avgLatency}ms`, sub: 'ortalama', icon: Clock, color: 'text-emerald-400', change: '-8%', up: false },
                    { label: 'Kritik Endpoint', value: criticalCount.toString(), sub: 'limit yakın', icon: AlertTriangle, color: 'text-red-400', change: '+2', up: true },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className={`text-xs flex items-center gap-0.5 ${stat.up ? 'text-red-400' : 'text-emerald-400'}`}>
                                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Hourly Chart */}
            <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Saatlik API Kullanımı</h3>
                {hourlyUsage.length === 0 && (
                    <div className="mb-4 text-sm text-slate-500">Saatlik API kullanım verisi bulunamadı</div>
                )}
                <div className="flex items-end gap-1 h-32">
                    {hourlyUsage.map((val, i) => (
                        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(val / maxHourly) * 100}%` }}
                            transition={{ delay: i * 0.02 }}
                            className={`flex-1 rounded-t ${val / maxHourly > 0.85 ? 'bg-red-500/60' : val / maxHourly > 0.6 ? 'bg-amber-500/60' : 'bg-indigo-500/60'}`}
                            title={`${i}:00 - ${val} istek`} />
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                    {[0, 6, 12, 18, 23].map(h => <span key={h}>{h}:00</span>)}
                </div>
            </div>

            {/* Endpoints Table */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Endpoint Kullanımları</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Server className="w-3.5 h-3.5" /> Son güncelleme: 12 sn önce
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-slate-500 text-xs border-b border-border">
                            <th className="text-left px-6 py-3 font-medium">Endpoint</th>
                            <th className="text-left px-4 py-3 font-medium">Method</th>
                            <th className="text-left px-4 py-3 font-medium">Kullanım</th>
                            <th className="text-left px-4 py-3 font-medium">Kapasite</th>
                            <th className="text-left px-4 py-3 font-medium">Ort. Latency</th>
                            <th className="text-left px-4 py-3 font-medium">Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {endpointStats.length === 0 && (
                            <tr>
                                <td className="px-6 py-6 text-sm text-slate-500" colSpan={6}>Endpoint kullanım verisi bulunamadı</td>
                            </tr>
                        )}
                        {endpointStats.map((ep, i) => {
                            const pct = Math.round((ep.used / ep.limit) * 100);
                            return (
                                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                    className="border-b border-border/50 hover:bg-background/50">
                                    <td className="px-6 py-3 font-mono text-xs text-foreground">{ep.path}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {ep.method}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-foreground">{ep.used.toLocaleString()} / {ep.limit.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs text-slate-400">{pct}%</span>
                                        </div>
                                    </td>
                                    <td className={`px-4 py-3 text-xs ${ep.avgMs > 1000 ? 'text-red-400' : ep.avgMs > 500 ? 'text-amber-400' : 'text-slate-400'}`}>
                                        {ep.avgMs}ms
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusBg[ep.status]} ${statusColors[ep.status]}`}>
                                            <Shield className="w-3 h-3" /> {ep.status === 'normal' ? 'Normal' : ep.status === 'warning' ? 'Uyarı' : 'Kritik'}
                                        </span>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
