"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, User, Phone, Mail, Calendar, DollarSign,
    ShoppingBag, RotateCcw, LifeBuoy, PackageOpen, Award, CheckCircle
} from 'lucide-react';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function Customer360Page() {
    const params = useParams();
    const router = useRouter();

    if (!params) return null;
    const email = decodeURIComponent(params.email as string);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-customer-detail', email],
        queryFn: () => adminApi.getCustomerDetail(email),
    });

    const formatCurrency = (amount: number) => {
        return `₺${(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (ds: string) => {
        if (!ds) return '—';
        return new Date(ds).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Müşteri 360 Portalı Yükleniyor...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 font-bold">Müşteri bilgileri bulunamadı.</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-500 text-sm font-bold">Geri Dön</button>
            </div>
        );
    }

    const { profile, orders, returns, supportTickets } = data;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Top Header & Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin/customers')}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Müşteri 360 Görünümü</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tüm sipariş, iade ve destek geçmişi</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Profile Card */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/20 mb-4">
                            {profile.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{profile.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-6">
                            <Mail size={14} /> {profile.email}
                        </div>

                        <div className="w-full space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Phone size={14} /> Telefon
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{profile.phone || 'Girilmemiş'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Calendar size={14} /> İlk Sipariş
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{formatDate(profile.firstOrderDate)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Award size={14} /> Son Sipariş
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{formatDate(profile.lastOrderDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* LTV & Financials */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Finansal Özet</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Yaşam Boyu Değer (LTV)</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(profile.ltv)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                                    <RotateCcw size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Toplam İade Tutarı</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(profile.returnTotal)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Toplam Sipariş Adedi</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{orders.length} Adet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Timelines & Data */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Orders Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <PackageOpen size={20} className="text-blue-500" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Son Siparişler</h3>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                                {orders.length} Sipariş
                            </span>
                        </div>

                        <div className="space-y-3">
                            {orders.slice(0, 5).map((order: any) => (
                                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 rounded-xl gap-4 hover:border-blue-500/30 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">Sipariş #{order.platform}-{order.id.slice(0, 6).toUpperCase()}</span>
                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{order.status}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span>{formatDate(order.orderDate)}</span>
                                            <span>•</span>
                                            <span>{order.items?.length || 0} Ürün</span>
                                        </div>
                                    </div>
                                    <div className="font-black text-slate-900 dark:text-white text-right">
                                        {formatCurrency(order.totalAmount)}
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && <p className="text-sm text-slate-500">Sipariş geçmişi bulunmuyor.</p>}
                        </div>
                    </div>

                    {/* Support Tickets Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <LifeBuoy size={20} className="text-purple-500" />
                                <h3 className="font-bold text-slate-900 dark:text-white">Destek Talepleri</h3>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                                {supportTickets.length} Talep
                            </span>
                        </div>

                        <div className="space-y-3">
                            {supportTickets.slice(0, 5).map((ticket: any) => (
                                <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5 rounded-xl gap-4 hover:border-purple-500/30 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[200px]">{ticket.subject}</span>
                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-600' : ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>{ticket.status}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span>{formatDate(ticket.createdAt)}</span>
                                            <span>•</span>
                                            <span>{ticket.messages?.length || 0} Mesaj</span>
                                        </div>
                                    </div>
                                    <button onClick={() => router.push(`/admin/support-tickets`)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        İncele
                                    </button>
                                </div>
                            ))}
                            {supportTickets.length === 0 && <p className="text-sm text-slate-500">Destek talebi bulunmuyor.</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
