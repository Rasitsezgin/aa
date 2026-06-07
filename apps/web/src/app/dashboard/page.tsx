"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw, Download, Loader2, LayoutGrid } from 'lucide-react';
import { useDashboardStats, useRecentOrders, useAiInsights } from '@/lib/hooks';
import type { DashboardPeriod } from '@/lib/dashboard-layout';
import { PeriodSelector } from '@/components/dashboard/dashboard-ui';
import { MorningBriefing } from '@/components/dashboard/MorningBriefing';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

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

      <div className="space-y-6 animate-in fade-in duration-500 pb-20" data-dashboard>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1.5">
              Genel Bakış
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl lg:text-[1.75rem] font-semibold text-foreground tracking-tight">
                Kontrol Merkezi
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Canlı veri
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1.5 max-w-xl">
              Satış, stok ve finans metriklerinizi tek ekrandan izleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PeriodSelector value={period} onChange={setPeriod} />

            <Link
              href="/dashboard/widget-editor"
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-border rounded-[10px] text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Özelleştir</span>
            </Link>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-border rounded-[10px] text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-white/8 transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Yenile
            </button>

            <button
              type="button"
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-3.5 py-2 dash-btn-primary text-sm shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Rapor</span>
            </button>
          </div>
        </div>

        <ErrorBoundary>
          <DynamicDashboard period={period} />
        </ErrorBoundary>
      </div>
    </>
  );
}
