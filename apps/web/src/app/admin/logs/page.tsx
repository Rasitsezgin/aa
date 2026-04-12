"use client";

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, Calendar, User, Terminal } from 'lucide-react';

export default function LogsPage() {
    const logs = [
        { id: "LOG-9281", type: "security", severity: "high", action: "Failed Login Attempt", user: "Unknown (192.168.1.1)", time: "Bugün 14:42:10", details: "Multiple failed attempts detected." },
        { id: "LOG-9280", type: "system", severity: "low", action: "Cache Purge", user: "Admin (Siz)", time: "Bugün 14:30:00", details: "Manual cache clear executed." },
        { id: "LOG-9279", type: "error", severity: "medium", action: "API Timeout", user: "System", time: "Bugün 14:15:22", details: "Trendyol API response > 30s." },
        { id: "LOG-9278", type: "security", severity: "success", action: "User Login", user: "berk@test.com", time: "Bugün 14:00:05", details: "Successful login via 2FA." },
        { id: "LOG-9277", type: "system", severity: "success", action: "Backup Created", user: "Auto-Scheduler", time: "Bugün 12:00:00", details: "Daily backup completed (450MB)." },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Denetim Kayıtları</h1>
                    <p className="text-slate-600 dark:text-slate-500 font-medium">Sistem güvenliği ve hata izleme merkezi.</p>
                </div>
                <div className="flex gap-2">
                    <button className="h-10 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <Calendar size={16} /> Tarih Aralığı
                    </button>
                    <button className="h-10 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <Terminal size={16} /> Log Dışa Aktar (.csv)
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-[24px] border border-slate-200 dark:border-white/5 flex gap-4 shadow-sm dark:shadow-none">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="IP, Kullanıcı veya İşlem ara..."
                        className="w-full h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-foreground placeholder:text-slate-500 dark:placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-colors"
                    />
                </div>
                <select className="h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-blue-500/50">
                    <option>Tüm Seviyeler</option>
                    <option>Kritik (High)</option>
                    <option>Uyarı (Medium)</option>
                    <option>Bilgi (Low)</option>
                </select>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-[24px] overflow-hidden shadow-sm dark:shadow-none">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                            <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest w-24">Durum</th>
                            <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">İşlem</th>
                            <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Kullanıcı / Kaynak</th>
                            <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Detay</th>
                            <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Zaman</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                        {logs.map((log, i) => (
                            <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors font-mono text-sm">
                                <td className="p-6">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.severity === 'high' ? 'bg-red-500/10 text-red-600 dark:text-red-500' :
                                            log.severity === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500' :
                                                log.severity === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-500' :
                                                    'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                                        }`}>
                                        {log.severity === 'high' ? <ShieldAlert size={16} /> :
                                            log.severity === 'medium' ? <AlertTriangle size={16} /> :
                                                log.severity === 'success' ? <CheckCircle size={16} /> :
                                                    <Terminal size={16} />}
                                    </div>
                                </td>
                                <td className="p-6 font-bold text-foreground tracking-tight">{log.action}</td>
                                <td className="p-6 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    <User size={12} /> {log.user}
                                </td>
                                <td className="p-6 text-slate-500">{log.details}</td>
                                <td className="p-6 text-right text-slate-500 font-bold">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
