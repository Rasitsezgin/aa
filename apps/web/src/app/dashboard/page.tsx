"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Brain, Loader2, LayoutGrid } from 'lucide-react';
import { useDashboardStats, useRecentOrders, useAiInsights } from '@/lib/hooks';
import type { DashboardPeriod } from '@/lib/dashboard-layout';
import { PeriodSelector } from '@/components/dashboard/dashboard-ui';
import { MorningBriefing } from '@/components/dashboard/MorningBriefing';

const DynamicDashboard = dynamic(
  () => import('@/components/dashboard/DynamicDashboard').then((mod) => ({ default: mod.DynamicDashboard })),
  {
    ssr: false,
    loading: () => <DashboardSkeleton />,
  },
);

const BRIEFING_KEY = 'pazaryonetimi-briefing-seen';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
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
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  const { refetch: refetchStats } = useDashboardStats(period);
  const { refetch: refetchOrders } = useRecentOrders(8);
  const { refetch: refetchInsights } = useAiInsights();

  useEffect(() => {
    const today = new Date().toDateString();
    const seen = localStorage.getItem(BRIEFING_KEY);
    if (seen !== today) setShowBriefing(true);
  }, []);

  const dismissBriefing = () => {
    localStorage.setItem(BRIEFING_KEY, new Date().toDateString());
    setShowBriefing(false);
  };

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
      <AnimatePresence>{showBriefing && <MorningBriefing onClose={dismissBriefing} />}</AnimatePresence>

      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 lg:gap-3 mb-2 flex-wrap">
              <h1 className="text-xl lg:text-3xl font-black text-foreground tracking-tight">Kontrol Merkezi</h1>
              <div className="flex items-center gap-2 px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                <Brain className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">AI Aktif</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
            <p className="text-slate-500 font-medium">Gerçek zamanlı satış, stok ve finans yönetimi</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PeriodSelector value={period} onChange={setPeriod} />

            <Link
              href="/dashboard/widget-editor"
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-slate-500 hover:text-orange-600 hover:border-orange-500/30 transition-all"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Özelleştir</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Yenile
            </button>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20"
            >
              <Download className="w-4 h-4" /> Rapor İndir
            </button>
          </div>
        </div>

        <DynamicDashboard period={period} />
      </div>
    </>
  );
}
