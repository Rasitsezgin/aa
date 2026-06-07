'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Loader2, Minus } from 'lucide-react';
import type { DashboardPeriod } from '@/lib/dashboard-layout';
import { PERIOD_LABELS } from '@/lib/dashboard-layout';

export const PLATFORM_COLORS: Record<string, string> = {
  Trendyol: 'bg-orange-500',
  TRENDYOL: 'bg-orange-500',
  Hepsiburada: 'bg-blue-500',
  HEPSIBURADA: 'bg-blue-500',
  Amazon: 'bg-amber-500',
  AMAZON: 'bg-amber-500',
  N11: 'bg-purple-500',
  Çiçeksepeti: 'bg-pink-500',
};

export const CHART_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#10b981', '#0ea5e9', '#8b5cf6'];

export function DashboardCard({
  children,
  className = '',
  title,
  icon: Icon,
  action,
  loading,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  action?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dash-card p-5 lg:p-6 relative overflow-hidden ${className}`}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-[10px] dash-kpi-icon flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            {title && <h3 className="text-sm font-semibold text-foreground tracking-tight truncate">{title}</h3>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
            {action}
          </div>
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function PeriodSelector({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (p: DashboardPeriod) => void;
}) {
  return (
    <div className="inline-flex p-1 rounded-[10px] bg-slate-100/80 dark:bg-white/5 border border-border">
      {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            value === p
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-foreground'
          }`}
        >
          {PERIOD_LABELS[p]}
        </button>
      ))}
    </div>
  );
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = (value - display) / steps;
    let current = display;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        current = value;
        clearInterval(timer);
      }
      setDisplay(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export function TrendBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  return (
    <div
      className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${
        isPositive ? 'bg-emerald-500/10 text-emerald-500' : isNeutral ? 'bg-slate-500/10 text-slate-400' : 'bg-red-500/10 text-red-400'
      }`}
    >
      {isPositive ? <ArrowUpRight size={10} /> : isNeutral ? <Minus size={10} /> : <ArrowDownRight size={10} />}
      {isPositive ? '+' : ''}
      {value.toFixed(1)}
      {suffix}
    </div>
  );
}

export function Sparkline({ data, color = '#ea580c', height = 36 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div className="h-9" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(' ');
  const areaPoints = `0,${height} ${points} ${w},${height}`;
  const gradId = `spark-${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full h-9" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export function KPICard({
  title,
  value,
  format = 'number',
  trend,
  icon: Icon,
  sparkData,
  loading,
  accent = 'text-indigo-600 dark:text-indigo-400',
  glow = 'bg-indigo-500',
}: {
  title: string;
  value?: number;
  format?: 'number' | 'currency' | 'percentage';
  trend?: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  sparkData?: number[];
  loading?: boolean;
  accent?: string;
  glow?: string;
}) {
  const formatValue = (val: number) => {
    if (format === 'currency') return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val || 0);
    if (format === 'percentage') return `${(val || 0).toFixed(1)}%`;
    return (val || 0).toLocaleString('tr-TR');
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="dash-card p-4 lg:p-5 relative overflow-hidden group"
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${glow}`} />
      {loading ? (
        <div className="flex items-center gap-2 py-6">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-sm text-slate-500">Yükleniyor...</span>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent} bg-current/10 border border-current/15`}>
              <Icon className={`w-5 h-5 ${accent}`} />
            </div>
            {trend !== undefined && trend !== null && <TrendBadge value={trend} />}
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight tabular-nums">
            {typeof value === 'number' ? <AnimatedNumber value={value} prefix={format === 'currency' ? '₺' : ''} decimals={format === 'percentage' ? 1 : 0} /> : '—'}
            {format === 'currency' && typeof value !== 'number' && '₺0'}
            {format === 'percentage' && typeof value === 'number' && '%'}
            {format === 'number' && typeof value !== 'number' && '0'}
          </p>
          {sparkData && sparkData.length > 1 && (
            <div className="mt-3 opacity-80">
              <Sparkline data={sparkData} />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export function buildSparkSeries(base: number, change = 0, points = 8): number[] {
  const safe = Math.max(base, 1);
  return Array.from({ length: points }, (_, i) => {
    const progress = i / (points - 1);
    const wave = Math.sin(i * 0.9) * 0.06;
    const trendFactor = 1 + (change / 100) * progress * 0.5;
    return Math.round((safe / points) * (0.75 + progress * 0.5 + wave) * trendFactor * points);
  });
}

export function buildRevenueTrend(revenue = 0, orders = 0, change = 0, period: DashboardPeriod) {
  const len = period === '7d' ? 7 : period === '90d' ? 12 : 10;
  return Array.from({ length: len }, (_, i) => {
    const progress = (i + 1) / len;
    const factor = 0.65 + progress * 0.35 + (change / 100) * progress * 0.25;
    return {
      name: period === '7d' ? `G${i + 1}` : `H${i + 1}`,
      value: Math.round((revenue / len) * factor),
      value2: Math.round((orders / len) * factor),
    };
  });
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || '';
  const cls =
    normalized.includes('tamam') || normalized.includes('deliver') || normalized === 'completed'
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : normalized.includes('kargo') || normalized.includes('ship')
        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
        : normalized.includes('iptal') || normalized.includes('cancel')
          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${cls}`}>{status}</span>;
}
