"use client";

import React from 'react';
import { Target, TrendingDown, ArrowUpRight, AlertCircle, BarChart3, Loader2 } from 'lucide-react';
import { useCompetitors, Competitor as CompetitorType } from '@/lib/hooks';

export default function Competitor() {
    const { data: competitors, loading, error } = useCompetitors();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                        <Target className="w-8 h-8 text-primary" />
                        Pazar İstihbaratı
                    </h2>
                    <p className="text-slate-500 font-medium">Rakiplerin hamlelerini izleyin ve stratejinizi veriyle şekillendirin.</p>
                </div>
                <button className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all">
                    Yeni Rakip Takibi Başlat
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Competitor List */}
                <div className="xl:col-span-2 bg-surface p-8 rounded-[32px] border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold">Aktif Takipteki Rakipler</h3>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                            {competitors?.length || 0} MAĞAZA
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-slate-500 font-medium">Rakipler yükleniyor...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/20">
                            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                            <p className="text-sm text-red-500 font-bold">Veriler alınırken bir hata oluştu.</p>
                        </div>
                    ) : competitors && competitors.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-[10px] text-slate-500 font-black uppercase tracking-widest border-b border-border">
                                        <th className="pb-4">Rakip Mağaza</th>
                                        <th className="pb-4">Platform</th>
                                        <th className="pb-4">Rating</th>
                                        <th className="pb-4">Yorum</th>
                                        <th className="pb-4 text-right">Aksiyon</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {competitors.map((comp: CompetitorType) => (
                                        <tr key={comp.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                            <td className="py-6">
                                                <div className="font-bold text-foreground">{comp.name}</div>
                                                <div className="text-[10px] text-slate-500 lowercase">{comp.storeUrl || 'URL yok'}</div>
                                            </td>
                                            <td className="py-6">
                                                <span className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-500 text-[10px] font-black border border-orange-500/20">
                                                    {comp.platform}
                                                </span>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex items-center gap-1 font-bold text-sm">
                                                    <ArrowUpRight size={14} className="text-green-500" />
                                                    {comp.rating ? Number(comp.rating).toFixed(1) : '-'}
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="text-sm font-medium text-slate-500">{comp.reviewCount}</div>
                                            </td>
                                            <td className="py-6 text-right">
                                                <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter">
                                                    Analizi Aç →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-500">
                            <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Henüz takip edilen rakip yok.</p>
                            <p className="text-xs">Yeni bir rakip ekleyerek pazar analizine başlayın.</p>
                        </div>
                    )}
                </div>

                {/* AI Pricing Strategy Card */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
                            <BarChart3 className="text-white w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 tracking-tight">Akıllı Fiyatlandırma</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-8 font-medium">
                            AI motorumuz rakip stoklarını ve pazar eğilimlerini anlık analiz ederek kârlılığınızı optimize eder.
                        </p>

                        <div className="space-y-6">
                            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                <div className="text-[10px] text-white/60 font-black tracking-widest mb-2 uppercase">GÜNCEL DURUM</div>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-black font-mono">₺1.399</div>
                                    <span className="text-[10px] font-black px-2 py-1 bg-red-400/20 text-red-200 rounded-lg">Pazarın %10 Üzerinde</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-5 rounded-2xl border border-white/20 bg-white/5">
                                <AlertCircle className="w-6 h-6 text-yellow-300 shrink-0" />
                                <p className="text-xs text-indigo-50 leading-relaxed font-medium">
                                    <span className="font-black text-yellow-300 italic">KRİTİK:</span> Rakip stokları %20 azaldı. Fiyatınızı sabit tutup talebi karşılayarak kârınızı artırabilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-4 mt-8 rounded-2xl bg-white text-indigo-600 font-bold text-sm hover:shadow-xl hover:scale-[1.02] transition-all relative z-10">
                        AI Önerilerini Uygula
                    </button>

                    {/* Background decor */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
