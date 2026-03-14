"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, TrendingUp, TrendingDown, Users, AlertTriangle, Calendar,
  Clock, CheckCircle, XCircle, DollarSign, PieChart, BarChart3, ArrowUpRight
} from 'lucide-react';

interface BillingData {
  summary: {
    totalTenants: number;
    paidSubscriptions: number;
    trialSubscriptions: number;
    conversionRate: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
    projected: number;
  };
  overduePayments: Array<{
    tenantId: string;
    tenantName: string;
    amount: number;
    daysOverdue: number;
  }>;
  upcomingRenewals: Array<{
    tenantId: string;
    tenantName: string;
    plan: string;
    renewalDate: Date;
    amount: number;
  }>;
  planDistribution: Array<{
    plan: string;
    count: number;
  }>;
}

export default function BillingDashboardPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const res = await fetch('/api/admin/billing');
      const billingData = await res.json();
      setData(billingData);
    } catch (error) {
      // Mock data
      setData({
        summary: {
          totalTenants: 3420,
          paidSubscriptions: 2150,
          trialSubscriptions: 1270,
          conversionRate: 62.8,
        },
        revenue: {
          thisMonth: 2850000,
          lastMonth: 2620000,
          growthRate: 8.8,
          projected: 3135000,
        },
        overduePayments: [
          { tenantId: 't1', tenantName: 'Acme Corp', amount: 2500, daysOverdue: 15 },
          { tenantId: 't2', tenantName: 'Tech Store', amount: 1800, daysOverdue: 7 },
          { tenantId: 't3', tenantName: 'Fashion Hub', amount: 3200, daysOverdue: 3 },
        ],
        upcomingRenewals: [
          { tenantId: 't4', tenantName: 'Digital Shop', plan: 'PRO', renewalDate: new Date(Date.now() + 3 * 86400000), amount: 1500 },
          { tenantId: 't5', tenantName: 'Home Goods', plan: 'ENTERPRISE', renewalDate: new Date(Date.now() + 7 * 86400000), amount: 5000 },
          { tenantId: 't6', tenantName: 'Sport Center', plan: 'PRO', renewalDate: new Date(Date.now() + 14 * 86400000), amount: 1500 },
        ],
        planDistribution: [
          { plan: 'STARTER', count: 1270 },
          { plan: 'PRO', count: 1650 },
          { plan: 'ENTERPRISE', count: 500 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const totalPlans = data.planDistribution.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <CreditCard className="w-6 h-6 text-emerald-500" />
          </div>
          Finans & Gelir
        </h1>
        <p className="text-slate-500 mt-1">Abonelik gelirleri ve fatura takibi</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight size={12} />
              +{data.revenue.growthRate}%
            </span>
          </div>
          <div className="text-2xl font-black text-foreground">{formatCurrency(data.revenue.thisMonth)}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Bu Ay Gelir</div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{formatCurrency(data.revenue.projected)}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Tahmini Gelir</div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">{data.summary.paidSubscriptions}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Ücretli Abonelik</div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <PieChart className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl font-black text-foreground">%{data.summary.conversionRate}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Dönüşüm Oranı</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overdue Payments */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Geciken Ödemeler
            </h3>
            <span className="text-xs font-bold text-red-600 bg-red-500/10 px-2 py-1 rounded-full">
              {data.overduePayments.length} Bekliyor
            </span>
          </div>
          <div className="space-y-4">
            {data.overduePayments.map((payment) => (
              <div 
                key={payment.tenantId}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-500/20"
              >
                <div>
                  <div className="font-bold text-foreground">{payment.tenantName}</div>
                  <div className="text-xs text-red-600 dark:text-red-400">
                    {payment.daysOverdue} gün gecikmiş
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">{formatCurrency(payment.amount)}</div>
                  <button className="text-xs text-slate-500 hover:text-slate-700">Hatırlat</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Yaklaşan Yenilemeler
            </h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-1 rounded-full">
              {data.upcomingRenewals.length} Bu Hafta
            </span>
          </div>
          <div className="space-y-4">
            {data.upcomingRenewals.map((renewal) => (
              <div 
                key={renewal.tenantId}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                <div>
                  <div className="font-bold text-foreground">{renewal.tenantName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{renewal.plan}</span>
                    <span className="text-xs text-blue-600">{formatDate(renewal.renewalDate)}</span>
                  </div>
                </div>
                <div className="font-bold text-emerald-600">{formatCurrency(renewal.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-6">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          Plan Dağılımı
        </h3>
        <div className="flex gap-4">
          {data.planDistribution.map((plan) => {
            const percentage = (plan.count / totalPlans) * 100;
            const colors: Record<string, string> = {
              STARTER: 'bg-slate-500',
              PRO: 'bg-blue-500',
              ENTERPRISE: 'bg-purple-500',
            };
            return (
              <div key={plan.plan} className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground">{plan.plan}</span>
                  <span className="text-sm text-slate-500">{plan.count}</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colors[plan.plan] || 'bg-slate-500'} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">%{percentage.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
