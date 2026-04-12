"use client";

import React, { useState } from 'react';
import {
    Users, CreditCard, Activity, Cpu, Zap, ArrowUpRight, Globe, Server, AlertCircle,
    TrendingUp, Clock, ShoppingBag, Sparkles, ChevronRight, BarChart3, Database, Wifi, Edit, Save, X
} from 'lucide-react';
import { saveDashboardLayout } from '@/actions/dashboard';

export default function DashboardClient({ config }: { config: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [layout, setLayout] = useState(config || {
        showStats: true,
        showRevenue: true,
        showServerStatus: true,
        showQuickActions: true,
        showLiveLogs: true,
        showPlatformStats: true
    });

    const handleSave = async () => {
        await saveDashboardLayout(layout);
        setIsEditing(false);
    };

    const toggleSection = (key: string) => {
        setLayout((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? "Günaydın" : currentHour < 18 ? "İyi günler" : "İyi akşamlar";

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative">
            {/* Edit Mode Toggle */}
            <div className="absolute top-0 right-0 z-10">
                {isEditing ? (
                    <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-lg border border-slate-200 dark:border-white/10">
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
                            <Save size={14} /> Kaydet
                        </button>
                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-200">
                            <X size={14} /> İptal
                        </button>
                    </div>
                ) : (
                    <div className="text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Son Güncelleme</div>
                        <div className="text-sm font-bold text-foreground flex items-center gap-2 justify-end">
                            <Clock size={14} className="text-slate-400" />
                            {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            <button onClick={() => setIsEditing(true)} className="ml-4 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-blue-500" title="Düzenle">
                                <Edit size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Welcome Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            Tüm Sistemler Çalışıyor
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">{greeting}, <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Admin</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Platform özeti ve kritik metrikler.</p>
                </div>
            </div>

            {/* Top Stats Row */}
            {isEditing && <label className="flex items-center gap-2 p-2 border border-dashed border-blue-500 rounded-lg mb-2 text-blue-500 font-bold text-xs"><input type="checkbox" checked={layout.showStats} onChange={() => toggleSection('showStats')} /> İstatistikleri Göster</label>}
            {layout.showStats && (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isEditing ? 'opacity-80 border-2 border-dashed border-slate-300 p-2 rounded-3xl' : ''}`}>
                    {[
                        { label: "Toplam Mağaza", value: "3,420", change: "+12%", icon: Users, color: "blue", gradient: "from-blue-500 to-cyan-500" },
                        { label: "Aylık Gelir", value: "₺2.8M", change: "+8.5%", icon: CreditCard, color: "emerald", gradient: "from-emerald-500 to-green-500" },
                        { label: "Aktif Oturum", value: "850", change: "+24%", icon: Globe, color: "purple", gradient: "from-purple-500 to-pink-500" },
                        { label: "AI İstek/Gün", value: "45K", change: "+32%", icon: Sparkles, color: "amber", gradient: "from-amber-500 to-orange-500" },
                    ].map((stat, idx) => (
                        <div key={idx} className="relative bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 space-y-4 group hover:border-slate-300 dark:hover:border-white/10 transition-all overflow-hidden shadow-sm dark:shadow-none">
                            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${stat.gradient} opacity-5 dark:opacity-10 blur-3xl group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity rounded-full pointer-events-none`} />
                            <div className="relative flex justify-between items-start">
                                <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 dark:text-${stat.color}-400`}>
                                    <stat.icon size={22} />
                                </div>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1 border border-green-500/20">
                                    <ArrowUpRight size={12} />
                                    {stat.change}
                                </span>
                            </div>
                            <div className="relative">
                                <div className="text-3xl font-black text-foreground tracking-tight">{stat.value}</div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Revenue Chart */}
                <div className="lg:col-span-8 space-y-2">
                    {isEditing && <label className="flex items-center gap-2 p-2 border border-dashed border-blue-500 rounded-lg text-blue-500 font-bold text-xs"><input type="checkbox" checked={layout.showRevenue} onChange={() => toggleSection('showRevenue')} /> Gelir Grafiğini Göster</label>}
                    {layout.showRevenue && (
                        <div className={`bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-none ${isEditing ? 'opacity-80 border-2 border-dashed border-slate-300' : ''}`}>
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider flex items-center gap-3">
                                        <BarChart3 size={20} className="text-blue-500 dark:text-blue-400" />
                                        Gelir Analizi
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Son 12 ayın ciro performansı</p>
                                </div>
                            </div>
                            <div className="flex items-end gap-2 h-56 w-full">
                                {[40, 65, 45, 80, 55, 70, 40, 90, 60, 75, 50, 95].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                                        <div style={{ height: `${h}%` }} className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500/40 rounded-t-lg group-hover:from-blue-500 group-hover:to-blue-400 transition-all duration-300 relative shadow-lg shadow-blue-500/10" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Server Status & Load */}
                <div className="lg:col-span-4 space-y-2">
                    {isEditing && <label className="flex items-center gap-2 p-2 border border-dashed border-blue-500 rounded-lg text-blue-500 font-bold text-xs"><input type="checkbox" checked={layout.showServerStatus} onChange={() => toggleSection('showServerStatus')} /> Sunucu Durumunu Göster</label>}
                    {layout.showServerStatus && (
                        <div className={`bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 flex flex-col shadow-sm dark:shadow-none h-full ${isEditing ? 'opacity-80 border-2 border-dashed border-slate-300' : ''}`}>
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-3">
                                <Activity size={20} className="text-emerald-500 dark:text-emerald-400" />
                                Sistem Sağlığı
                            </h3>
                            <div className="flex-1 flex items-center justify-center relative my-4">
                                <div className="w-44 h-44 rounded-full border-[10px] border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                                    <div className="text-center z-10">
                                        <div className="text-4xl font-black text-foreground">99.9%</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uptime</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
