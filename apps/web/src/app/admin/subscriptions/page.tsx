"use client";

import React from 'react';
import { CreditCard, TrendingUp, Users, DollarSign, Download, CheckCircle, AlertCircle, Package } from 'lucide-react';
import PackageSubscriptions from '@/components/admin/PackageSubscriptions';

export default function SubscriptionsPage() {
    const [activeTab, setActiveTab] = React.useState<'orders' | 'finance'>('orders');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Abonelik & Finans</h1>
                    <p className="text-slate-600 dark:text-slate-500 font-medium">Paket siparişleri ve gelir takibi.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
                            activeTab === 'orders'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Package size={18} /> Paket Siparişleri
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`px-6 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
                            activeTab === 'finance'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                        }`}
                    >
                        <DollarSign size={18} /> Finans
                    </button>
                </div>
            </div>

            {/* Package Subscriptions Tab */}
            {activeTab === 'orders' && (
                <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-sm dark:shadow-none">
                    <PackageSubscriptions />
                </div>
            )}

            {/* Finance Tab */}
            {activeTab === 'finance' && (
                <>
                    {/* Financial Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Aylık Tekrar Eden Gelir (MRR)", value: "₺245,000", change: "+12.4%", trend: "up", color: "text-emerald-400" },
                            { label: "Yıllık Gelir Tahmini (ARR)", value: "₺2.9M", change: "+8.1%", trend: "up", color: "text-blue-400" },
                            { label: "Aktif Aboneler", value: "3,420", change: "+124", trend: "up", color: "text-purple-400" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 relative overflow-hidden group shadow-sm dark:shadow-none">
                                <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br from-${stat.color.split('-')[1]}-500/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`} />
                                <div className="relative z-10">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</div>
                                    <div className="text-4xl font-black text-foreground tracking-tight mb-4">{stat.value}</div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                    {stat.change}
                                </span>
                                <span className="text-xs font-bold text-slate-500">geçen aya göre</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue Growth Chart */}
            <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Büyüme Grafiği</h3>
                    <div className="flex gap-2">
                        {['1A', '3A', '6A', '1Y', 'Tümü'].map((p, i) => (
                            <button key={i} className={`px-3 py-1 rounded-lg text-xs font-bold ${i === 2 ? 'bg-blue-600 dark:bg-white text-white dark:text-black' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-64 flex items-end justify-between gap-1 w-full px-2">
                    {[35, 42, 45, 40, 50, 55, 60, 58, 65, 75, 80, 95].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                            <div
                                style={{ height: `${h}%` }}
                                className="w-full bg-gradient-to-t from-blue-600/20 to-blue-500 rounded-t-md relative group-hover:from-blue-500 group-hover:to-blue-400 transition-all duration-300"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    ₺{h * 2.5}K
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase px-2">
                    <span>Oca 23</span>
                    <span>Tem 23</span>
                    <span>Oca 24</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plan Management */}
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Paket Yönetimi</h3>
                    {[
                        { name: "Basic Plan", users: 1250, price: "₺199", color: "blue" },
                        { name: "Pro Plan", users: 840, price: "₺499", color: "purple" },
                        { name: "Enterprise", users: 45, price: "₺2499", color: "emerald" },
                    ].map((plan, i) => (
                        <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group shadow-sm dark:shadow-none">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-xl font-bold text-foreground">{plan.name}</h4>
                                    <p className="text-sm font-bold text-slate-500">{plan.users} aktif kullanıcı</p>
                                </div>
                                <span className="text-lg font-black text-foreground">{plan.price}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full bg-${plan.color}-500 rounded-full w-2/3`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider mb-6">Son İşlemler</h3>
                    <div className="space-y-2">
                        {[
                            { id: "#INV-2024-001", company: "Tech World Ltd.", amount: "₺499.00", date: "Bugün 14:30", status: "success" },
                            { id: "#INV-2024-002", company: "Mega Store A.Ş.", amount: "₺2,499.00", date: "Bugün 11:20", status: "success" },
                            { id: "#INV-2024-003", company: "Butik Moda", amount: "₺199.00", date: "Dün 16:45", status: "failed" },
                            { id: "#INV-2024-004", company: "Spor Center", amount: "₺199.00", date: "Dün 09:15", status: "pending" },
                            { id: "#INV-2024-005", company: "Ev & Yaşam", amount: "₺499.00", date: "29 Oca 2024", status: "success" },
                        ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${tx.status === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                            tx.status === 'failed' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        }`}>
                                        {tx.status === 'success' ? <CheckCircle size={18} /> : tx.status === 'failed' ? <AlertCircle size={18} /> : <TrendingUp size={18} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground text-sm">{tx.company}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">{tx.id} • {tx.date}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-foreground">{tx.amount}</div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${tx.status === 'success' ? 'text-green-600 dark:text-green-500' :
                                            tx.status === 'failed' ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'
                                        }`}>
                                        {tx.status === 'success' ? 'Ödendi' : tx.status === 'failed' ? 'Başarısız' : 'Bekliyor'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
                </>
            )}
        </div>
    );
}
