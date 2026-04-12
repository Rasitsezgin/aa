"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, Download, Brain, Loader2 } from 'lucide-react';
import { useDashboardStats, useRecentOrders, useAiInsights } from '@/lib/hooks';

// Dynamic import for the dashboard component
const DynamicDashboard = dynamic(() => import('@/components/dashboard/DynamicDashboard').then(mod => ({ default: mod.DynamicDashboard })), {
    ssr: false,
    loading: () => <DashboardSkeleton />
});

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-48 bg-surface rounded-lg" />
                    <div className="h-4 w-64 bg-surface rounded-lg mt-2" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-surface rounded-xl" />
                    <div className="h-10 w-24 bg-surface rounded-xl" />
                </div>
            </div>
            <div className="h-20 bg-surface rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-surface rounded-2xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-surface rounded-2xl" />
                <div className="h-80 bg-surface rounded-2xl" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { refetch: refetchStats } = useDashboardStats('30d');
    const { refetch: refetchOrders } = useRecentOrders(5);
    const { refetch: refetchInsights } = useAiInsights();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchStats(), refetchOrders(), refetchInsights()]);
        setIsRefreshing(false);
    };

    const handleDownloadReport = () => {
        window.open('/api/reports/dashboard-export', '_blank');
    };

    return (
        <>
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                {/* Page Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 lg:gap-3 mb-2 flex-wrap">
                            <h1 className="text-xl lg:text-3xl font-black text-foreground tracking-tight">Kontrol Merkezi</h1>
                            <div className="flex items-center gap-2 px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                <Brain className="w-4 h-4 text-purple-500" />
                                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">AI Aktif</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium">Gerçek zamanlı satış, stok ve finans yönetimi</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
                            Yenile
                        </button>

                        <button 
                            onClick={handleDownloadReport}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Download className="w-4 h-4" /> Rapor İndir
                        </button>
                    </div>
                </div>

                {/* Dynamic Dashboard - Gerçek Veri */}
                <DynamicDashboard editable={false} />
            </div>
        </>
    );
}
