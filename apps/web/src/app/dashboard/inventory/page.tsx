"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    Package,
    Search,
    Filter,
    Download,
    Plus,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    Edit,
    Trash2,
    RefreshCw,
    BarChart3,
    Box,
    Layers,
    ArrowUpDown,
    ChevronDown,
    Eye,
    History,
    Settings,
    Upload
} from 'lucide-react';
import { useInventory } from '@/lib/hooks';

interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    stock: number;
    category?: string;
    basePrice: number | string;
    cost?: number | string;
    images?: Array<{ url: string }>;
    marketplaceProducts?: Array<{
        id: string;
        platform: string;
    }>;
}

interface InventoryStats {
    totalProducts: number;
    criticalStockCount: number;
    lowStockCount: number;
    totalValue: number;
}

const categories = ["Tümü", "Aksesuar", "Kulaklık", "Laptop", "Tablet", "Akıllı Saat"];
const statusFilters = ["Tümü", "Kritik", "Düşük", "Normal"];

export default function InventoryPage() {
    const { getInventory, getStats: fetchStats, loading } = useInventory();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [selectedStatus, setSelectedStatus] = useState('Tümü');
    const [sortBy, setSortBy] = useState<'stock' | 'name' | 'trend'>('stock');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const loadData = async () => {
        const filters: Record<string, unknown> = { page: 1, limit: 50 };
        if (searchTerm) filters.search = searchTerm;
        if (selectedCategory !== 'Tümü') filters.category = selectedCategory;
        if (selectedStatus !== 'Tümü') filters.status = selectedStatus;
        filters.sortBy = sortBy;
        filters.sortOrder = sortOrder;

        try {
            const response = await getInventory(filters) as { items: InventoryItem[] } | null;
            const statsResponse = await fetchStats() as InventoryStats | null;

            if (response?.items) setItems(response.items);
            if (statsResponse) setStats(statsResponse);
        } catch (error) {
            console.error("Failed to load inventory:", error);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

    const toggleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(i => i.id));
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSort = (field: 'stock' | 'name' | 'trend') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getStatusBadge = (status: string | number) => {
        const s = typeof status === 'number' ? (status < 5 ? 'critical' : status < 20 ? 'low' : 'ok') : status;
        switch (s) {
            case 'critical':
                return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">KRİTİK</span>;
            case 'low':
                return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">DÜŞÜK</span>;
            default:
                return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">NORMAL</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Stok Yönetimi</h1>
                    <p className="text-slate-500 font-medium">Tüm pazaryerlerinizdeki envanterinizi tek panelden yönetin</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <Download size={16} /> Dışa Aktar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <Plus size={16} /> Yeni Ürün
                    </button>
                    <button onClick={loadData} className="p-2.5 bg-surface border border-border rounded-xl text-foreground hover:bg-surface/80">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface p-6 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Box size={20} /></div>
                    </div>
                    <div className="text-3xl font-black text-foreground tabular-nums">{stats?.totalProducts || items.length}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Toplam SKU</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface p-6 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-500"><AlertTriangle size={20} /></div>
                    </div>
                    <div className="text-3xl font-black text-foreground tabular-nums">{stats?.criticalStockCount || 0}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Kritik Stok</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface p-6 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500"><BarChart3 size={20} /></div>
                    </div>
                    <div className="text-3xl font-black text-foreground tabular-nums">{stats?.lowStockCount || 0}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Düşük Stok</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface p-6 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><TrendingUp size={20} /></div>
                    </div>
                    <div className="text-3xl font-black text-foreground tabular-nums">₺{stats?.totalValue?.toLocaleString('tr-TR') || 0}</div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Envanter Değeri</div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-surface p-4 rounded-2xl border border-border flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Ürün adı, SKU veya barkod ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                    />
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => setSelectedCategory(c)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === c ? 'bg-primary text-white' : 'bg-background text-slate-500 hover:bg-background/80'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-background/50 border-b border-border">
                            <tr>
                                <th className="p-4 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === items.length && items.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="p-4 text-left font-black text-slate-500 uppercase tracking-widest text-[10px] cursor-pointer" onClick={() => toggleSort('name')}>
                                    <div className="flex items-center gap-2">Ürün Bilgisi <ArrowUpDown size={12} /></div>
                                </th>
                                <th className="p-4 text-left font-black text-slate-500 uppercase tracking-widest text-[10px]">Kategori</th>
                                <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest text-[10px] cursor-pointer" onClick={() => toggleSort('stock')}>
                                    <div className="flex items-center justify-center gap-2">Stok Durumu <ArrowUpDown size={12} /></div>
                                </th>
                                <th className="p-4 text-right font-black text-slate-500 uppercase tracking-widest text-[10px]">Satış Fiyatı</th>
                                <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">Pazaryerleri</th>
                                <th className="p-4 text-center font-black text-slate-500 uppercase tracking-widest text-[10px]">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => toggleSelectItem(item.id)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden relative">
                                                {item.images?.[0] ? (
                                                    <Image src={item.images[0].url} alt={item.name} fill className="object-cover" />
                                                ) : (
                                                    <Box size={20} className="text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground line-clamp-1">{item.name}</div>
                                                <div className="text-[10px] font-black text-slate-400 tabular-nums uppercase">{item.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {item.category || 'Genel'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-foreground tabular-nums text-base">{item.stock}</span>
                                                {getStatusBadge(item.stock)}
                                            </div>
                                            <div className="w-24 h-1 bg-background rounded-full overflow-hidden border border-border">
                                                <div
                                                    className={`h-full rounded-full ${item.stock < 5 ? 'bg-red-500' : item.stock < 20 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min((item.stock / 50) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="font-black text-foreground tabular-nums">₺{Number(item.basePrice).toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-400 font-bold">Maliyet: ₺{Number(item.cost || 0).toLocaleString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-1">
                                            {item.marketplaceProducts?.map((mp) => (
                                                <div key={mp.id} className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center" title={mp.platform}>
                                                    <span className="text-[8px] font-black">{mp.platform[0]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit size={16} /></button>
                                            <button className="p-2 text-slate-400 hover:text-foreground hover:bg-background rounded-xl transition-all"><History size={16} /></button>
                                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border flex items-center justify-between bg-background/30 text-xs font-bold text-slate-500">
                    <div>Toplam {items.length} ürün gösteriliyor</div>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 border border-border rounded-xl hover:bg-background transition-all">Önceki</button>
                        <button className="bg-primary text-white px-4 py-2 rounded-xl shadow-lg shadow-primary/20">1</button>
                        <button className="px-4 py-2 border border-border rounded-xl hover:bg-background transition-all">Sonraki</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
