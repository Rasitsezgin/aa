"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FlaskConical, PlusCircle, Play, Pause, BarChart3, TrendingUp,
    Eye, ShoppingCart, DollarSign, CheckCircle2, Clock, XCircle,
    Percent, ArrowUpRight, ArrowDownRight, Target
} from 'lucide-react';

type TestStatus = 'running' | 'completed' | 'draft' | 'paused';

const statusConfig: Record<TestStatus, { label: string; color: string; bg: string }> = {
    running: { label: 'Çalışıyor', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    completed: { label: 'Tamamlandı', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    draft: { label: 'Taslak', color: 'text-slate-400', bg: 'bg-slate-500/10' },
    paused: { label: 'Duraklatıldı', color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

import { useAbTesting } from '@/lib/hooks';

export default function ABTestPage() {
    const { data: testsData, loading } = useAbTesting();
    const [selectedTest, setSelectedTest] = useState<number | null>(1);

    const mockTests = (testsData as any[]) || [];

    const runningCount = mockTests.filter(t => t.status === 'running').length;
    const completedCount = mockTests.filter(t => t.status === 'completed').length;
    const avgConfidence = mockTests.length > 0
        ? Math.round(mockTests.reduce((a, t) => a + t.confidence, 0) / mockTests.length)
        : 0;

    const selected = mockTests.find(t => t.id === selectedTest);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <FlaskConical className="w-7 h-7 text-indigo-400" /> A/B Test Modülü
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Ürün sayfalarınızı test ederek dönüşüm oranlarını artırın</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm transition-colors">
                    <PlusCircle className="w-4 h-4" /> Yeni Test
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Aktif Test', value: runningCount, icon: Play, color: 'text-emerald-400' },
                    { label: 'Tamamlanan', value: completedCount, icon: CheckCircle2, color: 'text-blue-400' },
                    { label: 'Ort. Güvenilirlik', value: `%${avgConfidence}`, icon: Target, color: 'text-indigo-400' },
                    { label: 'Toplam Test', value: mockTests.length, icon: FlaskConical, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-surface rounded-xl border border-border p-5">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Test List */}
                <div className="space-y-3">
                    {mockTests.map((test, i) => {
                        const cfg = statusConfig[test.status as TestStatus];
                        return (
                            <motion.div key={test.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedTest(test.id)}
                                className={`bg-surface rounded-xl border p-4 cursor-pointer transition-all ${selectedTest === test.id ? 'border-indigo-500/50' : 'border-border hover:border-indigo-500/20'}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                    <span className="text-[10px] text-slate-500">{test.type}</span>
                                </div>
                                <h4 className="text-sm font-medium text-foreground mb-2">{test.name}</h4>
                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span>{test.startDate}</span>
                                    <span>Güven: %{test.confidence}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Test Detail */}
                <div className="col-span-2">
                    {selected ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="bg-surface rounded-xl border border-border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">{selected.name}</h3>
                                    <div className="flex gap-2">
                                        {selected.status === 'running' && (
                                            <button className="flex items-center gap-1 px-3 py-1.5 text-amber-400 border border-amber-500/30 rounded-lg text-xs">
                                                <Pause className="w-3 h-3" /> Duraklat
                                            </button>
                                        )}
                                        {selected.status === 'paused' && (
                                            <button className="flex items-center gap-1 px-3 py-1.5 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs">
                                                <Play className="w-3 h-3" /> Devam Et
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Variants Comparison */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[selected.variantA, selected.variantB].map((v, vi) => {
                                        const isWinner = selected.winner === (vi === 0 ? 'A' : 'B');
                                        const label = vi === 0 ? 'A' : 'B';
                                        return (
                                            <div key={vi} className={`rounded-xl border p-5 ${isWinner ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${vi === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{label}</span>
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">{v.name}</div>
                                                            <div className="text-[10px] text-slate-500">{v.desc}</div>
                                                        </div>
                                                    </div>
                                                    {isWinner && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Kazanan</span>}
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="text-center p-3 bg-background rounded-lg">
                                                        <Eye className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                                        <div className="text-sm font-bold text-foreground">{v.visitors.toLocaleString()}</div>
                                                        <div className="text-[10px] text-slate-500">Ziyaretçi</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-background rounded-lg">
                                                        <ShoppingCart className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                                        <div className="text-sm font-bold text-foreground">{v.conversions}</div>
                                                        <div className="text-[10px] text-slate-500">Dönüşüm</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-background rounded-lg">
                                                        <Percent className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                                        <div className={`text-sm font-bold ${isWinner ? 'text-emerald-400' : 'text-foreground'}`}>{v.rate}%</div>
                                                        <div className="text-[10px] text-slate-500">Oran</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Confidence */}
                            <div className="bg-surface rounded-xl border border-border p-5">
                                <h4 className="text-sm font-semibold text-foreground mb-3">İstatistiksel Güvenilirlik</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="h-3 bg-background rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${selected.confidence}%` }}
                                                className={`h-full rounded-full ${selected.confidence >= 95 ? 'bg-emerald-500' : selected.confidence >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                        </div>
                                    </div>
                                    <span className={`text-lg font-bold ${selected.confidence >= 95 ? 'text-emerald-400' : selected.confidence >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                                        %{selected.confidence}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {selected.confidence >= 95 ? 'İstatistiksel olarak anlamlı sonuç elde edildi.' : selected.confidence >= 80 ? 'Sonuçlar umut verici, daha fazla veri gerekli.' : 'Henüz yeterli veri toplanmadı.'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-surface rounded-xl border border-border p-8 text-center">
                            <FlaskConical className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">Detay görmek için bir test seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
