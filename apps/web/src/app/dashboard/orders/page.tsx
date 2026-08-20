"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Search,
    Filter,
    Download,
    Eye,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Package,
    RefreshCw,
    ChevronDown,
    ArrowUpDown,
    Calendar,
    MapPin,
    Phone,
    User,
    CreditCard,
    MoreVertical,
    Printer,
    MessageSquare,
    ExternalLink
} from 'lucide-react';

import { useOrders, Order, OrderItem } from '@/lib/hooks';
import { OrderPipeline } from '@/components/dashboard/OrderPipeline';
import { useModules } from '@/lib/modules';

interface OrderPagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

// Platform badge colors and styles
const platformStyles: Record<string, { bg: string; border: string; text: string; badgeBg: string }> = {
    "TRENDYOL": { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-500", badgeBg: "bg-orange-500 text-white" },
    "HEPSIBURADA": { bg: "bg-orange-600/10", border: "border-orange-600/30", text: "text-orange-600", badgeBg: "bg-orange-600 text-white" },
    "N11": { bg: "bg-purple-600/10", border: "border-purple-600/30", text: "text-purple-600", badgeBg: "bg-purple-600 text-white" },
    "AMAZON": { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500", badgeBg: "bg-amber-500 text-slate-950" },
    "PAZARAMA": { bg: "bg-blue-600/10", border: "border-blue-600/30", text: "text-blue-600", badgeBg: "bg-blue-600 text-white" },
    "CICEKSEPETI": { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-500", badgeBg: "bg-rose-500 text-white" },
    "PTTAVM": { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-600", badgeBg: "bg-yellow-500 text-slate-900" },
    "IDEFIX": { bg: "bg-indigo-600/10", border: "border-indigo-600/30", text: "text-indigo-600", badgeBg: "bg-indigo-600 text-white" },
    "SHOPIFY": { bg: "bg-emerald-600/10", border: "border-emerald-600/30", text: "text-emerald-600", badgeBg: "bg-emerald-600 text-white" },
    "WOOCOMMERCE": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-500", badgeBg: "bg-purple-500 text-white" },
    "OPENCART": { bg: "bg-cyan-600/10", border: "border-cyan-600/30", text: "text-cyan-600", badgeBg: "bg-cyan-600 text-white" }
};

const statusFilters = ["Tümü", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
const platformFilters = ["Tümü", "TRENDYOL", "HEPSIBURADA", "N11", "AMAZON", "PAZARAMA", "CICEKSEPETI", "PTTAVM", "IDEFIX", "SHOPIFY", "WOOCOMMERCE", "OPENCART"];

export default function OrdersPage() {
    const { getOrders, updateStatus, loading } = useOrders();
    const { orderPipeline } = useModules();
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<OrderPagination | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Tümü');
    const [selectedPlatform, setSelectedPlatform] = useState('Tümü');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState('today');

    const fetchOrders = async () => {
        const filters: Record<string, string> = {};
        if (searchTerm) filters.search = searchTerm;
        if (selectedStatus !== 'Tümü') filters.status = selectedStatus;
        if (selectedPlatform !== 'Tümü') filters.platform = selectedPlatform;

        const response = await getOrders(filters) as { orders: Order[], pagination: OrderPagination };
        if (response) {
            setOrders(response.orders || []);
            setPagination(response.pagination);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [searchTerm, selectedStatus, selectedPlatform, dateRange]);

    // fetchOrders definition moved above

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
            PENDING: { label: 'Beklemede', color: 'text-yellow-500', icon: <Clock size={14} />, bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
            CONFIRMED: { label: 'Hazırlanıyor', color: 'text-blue-500', icon: <Package size={14} />, bgColor: 'bg-blue-500/10 border-blue-500/20' },
            SHIPPED: { label: 'Kargoda', color: 'text-purple-500', icon: <Truck size={14} />, bgColor: 'bg-purple-500/10 border-purple-500/20' },
            DELIVERED: { label: 'Teslim Edildi', color: 'text-green-500', icon: <CheckCircle size={14} />, bgColor: 'bg-green-500/10 border-green-500/20' },
            CANCELLED: { label: 'İptal', color: 'text-red-500', icon: <XCircle size={14} />, bgColor: 'bg-red-500/10 border-red-500/20' },
            RETURNED: { label: 'İade', color: 'text-orange-500', icon: <AlertTriangle size={14} />, bgColor: 'bg-orange-500/10 border-orange-500/20' }
        };
        return configs[status] || configs.PENDING;
    };

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        preparing: orders.filter(o => o.status === 'CONFIRMED').length,
        shipped: orders.filter(o => o.status === 'SHIPPED').length,
        totalRevenue: orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'RETURNED').reduce((sum, o) => sum + Number(o.totalAmount), 0)
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const toggleOrderSelect = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    const handlePipelineStatus = async (orderId: string, status: string) => {
        await updateStatus(orderId, status);
        fetchOrders();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <OrderPipeline
                orders={orders}
                counts={orderPipeline}
                loading={loading}
                onStatusChange={handlePipelineStatus}
            />
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Sipariş Yönetimi</h1>
                    <p className="text-slate-500 font-medium">Tüm pazaryerlerinden gelen siparişlerinizi yönetin</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50"
                    >
                        <option value="today">Bugün</option>
                        <option value="week">Bu Hafta</option>
                        <option value="month">Bu Ay</option>
                        <option value="custom">Özel Tarih</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <Download size={16} /> Rapor İndir
                    </button>
                    <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Senkronize Et
                    </button>
                </div>
            </div>

            {/* OzyConnect & PazarConnect Style Marketplace Ribbon Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2.5">
                {[
                    { name: 'TRENDYOL', label: 'Trendyol', text: 'text-orange-500' },
                    { name: 'HEPSIBURADA', label: 'Hepsiburada', text: 'text-orange-600' },
                    { name: 'N11', label: 'n11', text: 'text-purple-600' },
                    { name: 'AMAZON', label: 'Amazon', text: 'text-amber-500' },
                    { name: 'SHOPIFY', label: 'Shopify', text: 'text-emerald-600' },
                    { name: 'WOOCOMMERCE', label: 'WooCommerce', text: 'text-purple-500' },
                    { name: 'OPENCART', label: 'OpenCart', text: 'text-cyan-600' },
                    { name: 'PAZARAMA', label: 'Pazarama', text: 'text-blue-600' },
                    { name: 'CICEKSEPETI', label: 'ÇiçekSepeti', text: 'text-rose-500' },
                    { name: 'PTTAVM', label: 'PttAVM', text: 'text-yellow-600' },
                    { name: 'IDEFIX', label: 'Idefix', text: 'text-indigo-600' }
                ].map((m) => {
                    const count = orders.filter(o => o.platform?.toUpperCase() === m.name).length;
                    const isActive = selectedPlatform === m.name;
                    return (
                        <button
                            key={m.name}
                            onClick={() => setSelectedPlatform(isActive ? 'Tümü' : m.name)}
                            className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${isActive ? 'bg-surface border-primary ring-2 ring-primary/20 shadow-md' : 'bg-surface/60 border-border hover:border-border/80'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-black tracking-tight ${m.text}`}>{m.label}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${count > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {count} sipariş
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-5 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-blue-500/10"><ShoppingBag size={18} className="text-blue-500" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground">{stats.total}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Toplam Sipariş</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface p-5 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-yellow-500/10"><Clock size={18} className="text-yellow-500" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground">{stats.pending}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bekleyen</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface p-5 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-blue-500/10"><Package size={18} className="text-blue-500" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground">{stats.preparing}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hazırlanıyor</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface p-5 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-purple-500/10"><Truck size={18} className="text-purple-500" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground">{stats.shipped}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Kargoda</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface p-5 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10"><CreditCard size={18} className="text-emerald-500" /></div>
                    </div>
                    <div className="text-xl font-black text-foreground">₺{stats.totalRevenue.toLocaleString('tr-TR')}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Toplam Ciro</div>
                </motion.div>
            </div>

            {/* Bulk Action Bar (shows when orders are selected) */}
            {selectedOrders.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center">
                            {selectedOrders.length}
                        </span>
                        <span className="text-sm font-bold text-foreground">sipariş seçildi</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all">
                            <Printer size={14} /> Toplu GİB E-Fatura Kes
                        </button>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all">
                            <Package size={14} /> Toplu Kargo Etiketi Al
                        </button>
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all">
                            <Truck size={14} /> Kargoya Ver
                        </button>
                        <button onClick={() => setSelectedOrders([])} className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-foreground">
                            Temizle
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Sipariş no veya müşteri ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {platformFilters.map(p => (
                        <button
                            key={p}
                            onClick={() => setSelectedPlatform(p)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedPlatform === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background text-slate-500 hover:bg-background/80'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                    {statusFilters.map(s => (
                        <button
                            key={s}
                            onClick={() => setSelectedStatus(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedStatus === s ? 'bg-foreground text-surface' : 'bg-background text-slate-500 hover:bg-background/80'}`}
                        >
                            {s === 'PENDING' ? 'Bekleyen' : s === 'CONFIRMED' ? 'Hazırlanan' : s === 'SHIPPED' ? 'Kargoda' : s === 'DELIVERED' ? 'Teslim' : s === 'CANCELLED' ? 'İptal' : s === 'RETURNED' ? 'İade' : 'Tümü'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const isExpanded = expandedOrder === order.id;

                    return (
                        <motion.div
                            key={order.id}
                            layout
                            className={`bg-surface border rounded-2xl overflow-hidden transition-all ${isExpanded ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border hover:border-border/80'}`}
                        >
                            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.includes(order.id)}
                                        onChange={() => toggleOrderSelect(order.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-black text-foreground tabular-nums">#{order.marketplaceOrderId}</span>
                                </div>

                                <div className="flex items-center gap-2 w-32">
                                    <div className={`w-2 h-2 rounded-full ${platformColors[order.platform] || 'bg-slate-400'}`} />
                                    <span className="text-xs font-bold text-slate-600">{order.platform}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="text-sm font-bold text-foreground">{order.customerName}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">{formatDate(order.orderDate)}</div>
                                </div>

                                <div className="w-40">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tight ${statusConfig.bgColor} ${statusConfig.color}`}>
                                        {statusConfig.icon}
                                        {statusConfig.label}
                                    </div>
                                </div>

                                <div className="w-32 text-right">
                                    <div className="text-sm font-black text-foreground">₺{Number(order.totalAmount).toLocaleString('tr-TR')}</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{order.paymentStatus === 'PAID' ? 'ÖDENDİ' : 'BEKLİYOR'}</div>
                                </div>

                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        title="Fatura Kes (GİB E-Arşiv)"
                                        className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/30 rounded-xl text-xs font-black flex items-center gap-1 transition-all"
                                    >
                                        <Printer size={12} /> Fatura Kes
                                    </button>
                                    <button
                                        title="Kargo Etiketi Al"
                                        className="px-2.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded-xl text-xs font-black flex items-center gap-1 transition-all"
                                    >
                                        <Truck size={12} /> Etiket
                                    </button>
                                </div>

                                <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-border bg-background/50"
                                    >
                                        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            <div className="lg:col-span-8 space-y-6">
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Sipariş İçeriği</h4>
                                                    <div className="bg-surface rounded-xl border border-border overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-background/80 border-b border-border">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left text-[10px] font-black text-slate-500 uppercase">Ürün</th>
                                                                    <th className="px-4 py-2 text-center text-[10px] font-black text-slate-500 uppercase">Adet</th>
                                                                    <th className="px-4 py-2 text-right text-[10px] font-black text-slate-500 uppercase">Birim Fiyat</th>
                                                                    <th className="px-4 py-2 text-right text-[10px] font-black text-slate-500 uppercase">Toplam</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border">
                                                                {order.items?.map((item, i: number) => (
                                                                    <tr key={i}>
                                                                        <td className="px-4 py-3 font-bold text-foreground">{item.title}</td>
                                                                        <td className="px-4 py-3 text-center tabular-nums">{item.quantity}</td>
                                                                        <td className="px-4 py-3 text-right tabular-nums">₺{Number(item.unitPrice).toLocaleString()}</td>
                                                                        <td className="px-4 py-3 text-right font-black tabular-nums">₺{(item.quantity * Number(item.unitPrice)).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-4 space-y-6 text-sm">
                                                <div className="bg-surface p-4 rounded-xl border border-border space-y-4">
                                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Müşteri & Teslimat</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <User size={16} className="text-slate-400 mt-0.5" />
                                                            <div>
                                                                <div className="font-bold text-foreground">{order.customerName}</div>
                                                                <div className="text-xs text-slate-500">{order.customerEmail}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <Phone size={16} className="text-slate-400 mt-0.5" />
                                                            <div className="font-medium text-slate-600">{order.customerPhone || 'Bilgi yok'}</div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <MapPin size={16} className="text-slate-400 mt-0.5" />
                                                            <div className="text-xs text-slate-600 font-medium leading-relaxed">{order.shippingAddress}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                                                        <Printer size={14} /> Fatura Yazdır
                                                    </button>
                                                    <button className="px-4 py-2.5 bg-surface border border-border rounded-xl text-slate-600 hover:text-foreground transition-all">
                                                        <MoreVertical size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}

                {orders.length === 0 && !loading && (
                    <div className="p-20 text-center bg-surface border border-border border-dashed rounded-3xl">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-black text-foreground">Sipariş Bulunamadı</h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">Seçili kriterlere uygun herhangi bir siparişiniz bulunmamaktadır.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
