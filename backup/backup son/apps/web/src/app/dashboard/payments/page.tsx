"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    Download,
    Filter,
    ChevronDown,
    Building2,
    Receipt,
    Clock,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    PieChart,
    BarChart3,
    LineChart,
    Target,
    Percent
} from 'lucide-react';
import { usePayments, Payment, PaymentStats as HookPaymentStats, PendingPayment } from '@/lib/hooks';

interface Transaction extends Payment {
    type: 'income' | 'expense' | 'refund';
    description: string;
}

export default function PaymentsPage() {
    const [dateRange, setDateRange] = useState('month');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [apiPayments, setApiPayments] = useState<Transaction[]>([]);
    const [paymentStats, setPaymentStats] = useState<HookPaymentStats | null>(null);
    const [pendingPaymentsList, setPendingPaymentsList] = useState<PendingPayment[]>([]);

    const { fetchPayments: getPayments, fetchStats: getPaymentStats, fetchPending: getPending, loading } = usePayments();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [paymentsData, statsData, pendingData] = await Promise.allSettled([
                    getPayments(),
                    getPaymentStats(),
                    getPending()
                ]);
                if (paymentsData.status === 'fulfilled' && paymentsData.value) setApiPayments(paymentsData.value as Transaction[]);
                if (statsData.status === 'fulfilled' && statsData.value) setPaymentStats(statsData.value);
                if (pendingData.status === 'fulfilled' && pendingData.value) setPendingPaymentsList(pendingData.value);
            } catch (error) {
                console.error('Ödemeler yüklenirken hata:', error);
            }
        };
        fetchData();
    }, []);

    const payments = apiPayments;

    const financialSummary = paymentStats || {
        totalRevenue: 0,
        netProfit: 0,
        pendingPayments: 0,
        expectedPayments: 0,
        platformFees: 0,
        shippingCosts: 0,
        refunds: 0,
        profitMargin: 0
    };

    const platformBreakdown: { platform: string; revenue: number; fees: number; net: number; color: string; percentage: number }[] = (paymentStats?.platformBreakdown || []).map((p: any, idx: number) => ({
        platform: p.platform,
        revenue: p.revenue || 0,
        fees: p.commission || 0,
        net: p.net || 0,
        color: ['bg-orange-500', 'bg-amber-500', 'bg-orange-600', 'bg-purple-500'][idx] || 'bg-slate-500',
        percentage: p.revenue && financialSummary.totalRevenue ? Math.round((p.revenue / financialSummary.totalRevenue) * 100) : 0
    }));

    const upcomingPayments = pendingPaymentsList;

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'income':
                return <ArrowDownLeft size={14} className="text-green-500" />;
            case 'expense':
                return <ArrowUpRight size={14} className="text-red-500" />;
            case 'refund':
                return <RefreshCw size={14} className="text-orange-500" />;
            default:
                return <DollarSign size={14} />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">Tamamlandı</span>;
            case 'pending':
                return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Beklemede</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Ödemeler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Finans & Ödemeler</h1>
                    <p className="text-slate-500 font-medium">Tüm pazaryerlerinden gelir ve giderlerinizi takip edin</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50"
                    >
                        <option value="week">Bu Hafta</option>
                        <option value="month">Bu Ay</option>
                        <option value="quarter">Bu Çeyrek</option>
                        <option value="year">Bu Yıl</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <Download size={16} /> Rapor İndir
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-6 rounded-2xl border border-green-500/20"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-green-500/10">
                            <DollarSign size={20} className="text-green-500" />
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-500">
                            <TrendingUp size={12} /> +12.5%
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">₺{(financialSummary.totalRevenue / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Gelir</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                            <Wallet size={20} className="text-blue-500" />
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-green-500">
                            <TrendingUp size={12} /> +8.3%
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">₺{(financialSummary.netProfit / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-slate-500 mt-1">Net Kar</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-yellow-500/10">
                            <Clock size={20} className="text-yellow-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">₺{(financialSummary.pendingPayments / 1000).toFixed(1)}K</div>
                    <div className="text-xs text-slate-500 mt-1">Bekleyen Ödemeler</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-surface p-6 rounded-2xl border border-border"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10">
                            <Percent size={20} className="text-purple-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-foreground">%{financialSummary.profitMargin}</div>
                    <div className="text-xs text-slate-500 mt-1">Kar Marjı</div>
                </motion.div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-surface p-4 rounded-xl border border-border flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-red-500/10">
                        <ArrowUpRight size={16} className="text-red-500" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Platform Komisyonları</div>
                        <div className="text-lg font-bold text-foreground">₺{(financialSummary.platformFees / 1000).toFixed(1)}K</div>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                        <Receipt size={16} className="text-orange-500" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Kargo Maliyetleri</div>
                        <div className="text-lg font-bold text-foreground">₺{(financialSummary.shippingCosts / 1000).toFixed(1)}K</div>
                    </div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-slate-500/10">
                        <RefreshCw size={16} className="text-slate-500" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">İadeler</div>
                        <div className="text-lg font-bold text-foreground">₺{(financialSummary.refunds / 1000).toFixed(1)}K</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Platform Breakdown */}
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6">
                    <h3 className="font-bold text-foreground mb-4">Pazaryeri Bazlı Gelir</h3>
                    <div className="space-y-4">
                        {platformBreakdown.map((item, idx) => (
                            <motion.div
                                key={item.platform}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-background p-4 rounded-xl"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                                            <span className="text-white text-xs font-black">{item.platform[0]}</span>
                                        </div>
                                        <span className="font-medium text-foreground">{item.platform}</span>
                                    </div>
                                    <span className="text-lg font-black text-foreground">₺{(item.revenue / 1000).toFixed(1)}K</span>
                                </div>
                                <div className="h-2 bg-surface rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                                        className={`h-full ${item.color}`}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                                    <span>Komisyon: ₺{(item.fees / 1000).toFixed(1)}K</span>
                                    <span>Net: ₺{(item.net / 1000).toFixed(1)}K</span>
                                    <span>{item.percentage}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Payments */}
                <div className="bg-surface rounded-2xl border border-border p-6">
                    <h3 className="font-bold text-foreground mb-4">Yaklaşan Ödemeler</h3>
                    <div className="space-y-3">
                        {upcomingPayments.map((payment, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-background p-4 rounded-xl"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-foreground">{payment.platform}</span>
                                    <span className="text-lg font-black text-green-500">₺{(payment.amount / 1000).toFixed(1)}K</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={10} /> {payment.expectedDate}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full ${payment.daysLeft <= 3 ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                        {payment.daysLeft} gün
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="text-xs text-slate-500 mb-1">Toplam Beklenen</div>
                        <div className="text-xl font-black text-primary">
                            ₺{(upcomingPayments.reduce((sum, p) => sum + p.amount, 0) / 1000).toFixed(1)}K
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-foreground">Son İşlemler</h3>
                    <button className="text-xs font-bold text-primary hover:text-primary/80 transition-all">
                        Tümünü Gör
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-background/50">
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">İşlem</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Açıklama</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Tarih</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">Durum</th>
                                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">Tutar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {payments.map((tx, idx) => (
                                <motion.tr
                                    key={tx.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-background/50 transition-all"
                                >
                                    <td className="px-4 py-4">
                                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${tx.type === 'income' ? 'bg-green-500/10' :
                                            tx.type === 'expense' ? 'bg-red-500/10' : 'bg-orange-500/10'
                                            }`}>
                                            {getTransactionIcon(tx.type)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-sm font-medium text-foreground">{tx.description}</div>
                                        <div className="text-xs text-slate-500">{tx.id}</div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-500">{tx.date}</td>
                                    <td className="px-4 py-4">{getStatusBadge(tx.status)}</td>
                                    <td className={`px-4 py-4 text-right text-sm font-bold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {tx.amount >= 0 ? '+' : ''}₺{Math.abs(tx.amount).toLocaleString('tr-TR')}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
