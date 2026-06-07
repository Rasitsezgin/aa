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

// Platform labels
const platformColors: Record<string, string> = {
    "TRENDYOL": "bg-orange-500",
    "AMAZON": "bg-amber-500",
    "HEPSIBURADA": "bg-orange-600",
    "N11": "bg-purple-500",
    "GITTIGIDIYOR": "bg-yellow-500"
};

const statusFilters = ["Tümü", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
const platformFilters = ["Tümü", "TRENDYOL", "AMAZON", "HEPSIBURADA", "N11"];

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
