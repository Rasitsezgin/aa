"use client";

import React, { useState, useMemo } from 'react';
import {
    Plus, Search, Filter, MoreVertical, Image as ImageIcon, Sparkles,
    ArrowUpDown, ExternalLink, CheckCircle2, AlertCircle, Download,
    Eye, Edit3, Trash2, Copy, TrendingUp, TrendingDown,
    Package, BarChart3, RefreshCw, ChevronLeft, ChevronRight, X, Loader2,
    Star, Layers
} from 'lucide-react';
import Image from 'next/image';
import { useProducts, useProductStats, Product } from '@/lib/hooks';
import { useQuickActions } from '@/providers/quick-actions-provider';
import { apiClient } from '@/lib/api-client';




const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    'active': { label: 'Aktif', className: 'bg-green-500/10 text-green-600 dark:text-green-400' },
    'inactive': { label: 'Pasif', className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
    'draft': { label: 'Taslak', className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
    'out-of-stock': { label: 'Stok Yok', className: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

const PLATFORM_COLORS: Record<string, string> = {
    'TRENDYOL': 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'AMAZON': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    'HEPSIBURADA': 'bg-red-500/10 text-red-600 dark:text-red-400',
    'N11': 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'CICEKSEPETI': 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
};

export default function ProductList() {
    const [currentPage, setCurrentPage] = useState(1);
    const { data: statsData, loading: statsLoading } = useProductStats();
    const { data: productsData, loading: productsLoading, refetch: fetchProducts } = useProducts(currentPage, 20);
    const { openAddProduct } = useQuickActions();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [actionMenu, setActionMenu] = useState<string | null>(null);
    const [optimizing, setOptimizing] = useState<string | null>(null);
    const [bulkOptimizing, setBulkOptimizing] = useState(false);

    const products = useMemo(() => {
        const rawItems = (productsData as any)?.data || [];
        return rawItems.map((p: any): Product => ({
            ...p,
            name: p.title || p.name,
            images: Array.isArray(p.images) && typeof p.images[0] === 'object' 
                ? p.images.map((img: any) => img.url) 
                : p.images || [],
            platform: Array.isArray(p.marketplaceLinks) 
                ? [...new Set(p.marketplaceLinks.map((l: any) => l.platform))] 
                : p.platform || [],
            sales: p.sales || 0,
            revenue: Number(p.revenue || 0),
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0
        }));
    }, [productsData]);

    const loading = statsLoading || productsLoading;
    const pagination = (productsData as any) || { page: 1, limit: 20, total: 0, totalPages: 1 };
    const categories = useMemo(() => Array.from(new Set(products.map((p: Product) => p.category))) as string[], [products]);
    const platforms = useMemo(() => Array.from(new Set(products.flatMap((p: Product) => p.platform))) as string[], [products]);

    const filteredProducts = useMemo(() => {
        let filtered = products.filter((p: Product) => {
            const nameMatch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const skuMatch = !searchTerm || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchSearch = nameMatch || skuMatch;
            const matchStatus = statusFilter === 'all' || p.status === statusFilter;
            const matchPlatform = platformFilter === 'all' || p.platform.includes(platformFilter);
            const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
            return matchSearch && matchStatus && matchPlatform && matchCategory;
        });
        filtered.sort((a: Product, b: Product) => {
            let cmp = 0;
            switch (sortBy) { 
                case 'name': cmp = a.name.localeCompare(b.name); break; 
                case 'price': cmp = a.price - b.price; break; 
                case 'stock': cmp = a.stock - b.stock; break; 
                case 'sales': cmp = a.sales - b.sales; break; 
                case 'revenue': cmp = a.revenue - b.revenue; break; 
                case 'rating': cmp = a.rating - b.rating; break; 
                case 'seoScore': cmp = (a.seoScore || 0) - (b.seoScore || 0); break; 
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return filtered;
    }, [products, searchTerm, statusFilter, platformFilter, categoryFilter, sortBy, sortDir]);

    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const stats = useMemo(() => {
        const s = statsData as any;
        return {
            total: s?.total || 0,
            active: s?.active || 0,
            outOfStock: s?.outOfStock || 0,
            totalRevenue: s?.totalRevenue || 0,
            avgRating: s?.avgRating || 0,
            lowStock: s?.lowStock || 0,
        };
    }, [statsData]);

    const toggleSelect = (id: string) => setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleSelectAll = () => setSelectedProducts(prev => prev.length === products.length ? [] : products.map((p: Product) => p.id));
    const handleOptimize = async (productId: string) => { 
        setOptimizing(productId); 
        try { 
            const tenantId = (productsData as any)?.tenantId || '';
            await apiClient.optimizeProduct(tenantId, productId); 
        } catch { } finally { setOptimizing(null); } 
    };
    const handleBulkOptimize = async () => { 
        setBulkOptimizing(true); 
        try { 
            await apiClient.bulkAnalyze(); 
        } catch { } finally { setBulkOptimizing(false); } 
    };
    const handleSort = (field: string) => { if (sortBy === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc'); else { setSortBy(field); setSortDir('asc'); } };
    const formatCurrency = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Toplam Ürün', value: stats.total, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Aktif', value: stats.active, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Stok Yok', value: stats.outOfStock, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                    { label: 'Düşük Stok', value: stats.lowStock, icon: TrendingDown, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                    { label: 'Toplam Ciro', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Ort. Puan', value: stats.avgRating.toFixed(1), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-4 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div><div><div className="text-xs font-medium text-slate-500">{stat.label}</div><div className="text-lg font-black text-foreground">{stat.value}</div></div></div>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Ürün Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{filteredProducts.length} ürün listeleniyor</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchProducts()} className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                    <button onClick={handleBulkOptimize} disabled={bulkOptimizing} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500/10 to-primary/10 border border-violet-500/20 rounded-xl text-sm font-bold text-violet-600 dark:text-violet-400 hover:from-violet-500/20 hover:to-primary/20 transition-all disabled:opacity-50">{bulkOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Toplu Optimizasyon</button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><Download className="w-4 h-4" /> Dışa Aktar</button>
                    <button onClick={openAddProduct} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all"><Plus className="w-4 h-4" /> Yeni Ürün</button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input type="text" placeholder="Ürün adı, SKU veya barkod ile ara..." className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-400" /></button>}
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${showFilters ? 'bg-primary text-white' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'}`}><Filter className="w-4 h-4" /> Filtrele</button>
                        <div className="flex bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
                            <button onClick={() => setViewMode('table')} className={`px-3 py-2.5 text-sm ${viewMode === 'table' ? 'bg-primary text-white' : 'text-slate-500'}`}><Layers className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('grid')} className={`px-3 py-2.5 text-sm ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-500'}`}><BarChart3 className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-white/5">
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-4 text-sm text-foreground focus:outline-none focus:border-primary/50"><option value="all">Tüm Durumlar</option><option value="active">Aktif</option><option value="inactive">Pasif</option><option value="draft">Taslak</option><option value="out-of-stock">Stok Yok</option></select>
                        <select value={platformFilter} onChange={e => { setPlatformFilter(e.target.value); setCurrentPage(1); }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-4 text-sm text-foreground focus:outline-none focus:border-primary/50"><option value="all">Tüm Platformlar</option>{platforms.map((p: string) => <option key={p} value={p}>{p}</option>)}</select>
                        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-4 text-sm text-foreground focus:outline-none focus:border-primary/50"><option value="all">Tüm Kategoriler</option>{categories.map((c: string) => <option key={c} value={c}>{c}</option>)}</select>
                        <select value={sortBy} onChange={e => handleSort(e.target.value)} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 px-4 text-sm text-foreground focus:outline-none focus:border-primary/50"><option value="name">Ada Göre</option><option value="price">Fiyata Göre</option><option value="stock">Stoğa Göre</option><option value="sales">Satışa Göre</option><option value="revenue">Ciroya Göre</option><option value="rating">Puana Göre</option><option value="seoScore">SEO Skoruna Göre</option></select>
                    </div>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary">{selectedProducts.length} ürün seçildi</span>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-white dark:bg-white/10 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all">Toplu Fiyat Güncelle</button>
                        <button className="px-4 py-2 bg-white dark:bg-white/10 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all">Toplu Stok Güncelle</button>
                        <button className="px-4 py-2 bg-red-500/10 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-500/20 transition-all">Seçilenleri Sil</button>
                        <button onClick={() => setSelectedProducts([])} className="px-4 py-2 text-sm font-semibold text-slate-500">Temizle</button>
                    </div>
                </div>
            )}

            {loading && <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-sm text-slate-500 ml-3">Ürünler yükleniyor...</p></div>}

            {/* Table View */}
            {!loading && viewMode === 'table' && (
                <div className="bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                                    <th className="px-6 py-4 w-12"><input type="checkbox" checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300" /></th>
                                    <th onClick={() => handleSort('name')} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[280px] cursor-pointer hover:text-primary">Ürün {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform</th>
                                    <th onClick={() => handleSort('seoScore')} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center cursor-pointer hover:text-primary">AI Skor</th>
                                    <th onClick={() => handleSort('price')} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-primary">Fiyat</th>
                                    <th onClick={() => handleSort('stock')} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-primary">Stok</th>
                                    <th onClick={() => handleSort('sales')} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-primary">Satış</th>
                                    <th onClick={() => handleSort('rating')} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-primary">Puan</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Durum</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {products.map((product: Product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all group">
                                        <td className="px-6 py-5"><input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleSelect(product.id)} className="rounded border-slate-300" /></td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-400 group-hover:border-primary/30 transition-all shrink-0 relative overflow-hidden">
                                                    {product.images.length > 0 ? (
                                                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                                    ) : (
                                                        <ImageIcon size={20} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.name}</div>
                                                    <div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] font-black text-slate-500 uppercase">{product.sku}</span>{product.category && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-slate-500">{product.category}</span>}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><div className="flex flex-wrap gap-1">{product.platform.map((mp: string) => <span key={mp} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[mp] || 'bg-slate-100 text-slate-500'}`}>{mp}</span>)}</div></td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-sm font-black ${(product.seoScore || 0) > 85 ? 'text-green-500' : (product.seoScore || 0) > 65 ? 'text-primary' : 'text-orange-500'}`}>{product.seoScore || '-'}</span>
                                                <div className="w-12 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${(product.seoScore || 0) > 85 ? 'bg-green-500' : (product.seoScore || 0) > 65 ? 'bg-primary' : 'bg-orange-500'}`} style={{ width: `${product.seoScore || 0}%` }} /></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><div className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(product.price)}</div>{product.costPrice && <div className="text-[10px] text-slate-500 mt-0.5">Maliyet: {formatCurrency(product.costPrice)}</div>}</td>
                                        <td className="px-6 py-5"><span className={`text-sm font-bold ${product.stock === 0 ? 'text-red-500' : product.stock < 20 ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>{product.stock}</span></td>
                                        <td className="px-6 py-5"><div className="text-sm font-bold text-slate-900 dark:text-white">{product.sales.toLocaleString('tr-TR')}</div><div className="text-[10px] text-slate-500">{formatCurrency(product.revenue)}</div></td>
                                        <td className="px-6 py-5"><div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /><span className="text-sm font-bold">{product.rating}</span><span className="text-[10px] text-slate-500">({product.reviewCount})</span></div></td>
                                        <td className="px-6 py-5"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${STATUS_LABELS[product.status]?.className}`}>{product.status === 'active' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}{STATUS_LABELS[product.status]?.label}</span></td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="relative">
                                                <button onClick={() => setActionMenu(actionMenu === product.id ? null : product.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"><MoreVertical size={16} /></button>
                                                {actionMenu === product.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 py-2 z-50">
                                                        <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"><Eye className="w-4 h-4" /> Görüntüle</button>
                                                        <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"><Edit3 className="w-4 h-4" /> Düzenle</button>
                                                        <button onClick={() => { handleOptimize(product.id); setActionMenu(null); }} className="w-full px-4 py-2 text-left text-sm text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 flex items-center gap-2">{optimizing === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} AI Optimize</button>
                                                        <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"><Copy className="w-4 h-4" /> Kopyala</button>
                                                        <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Platformda Gör</button>
                                                        <hr className="my-1 border-slate-200 dark:border-white/10" />
                                                        <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Sil</button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/5">
                            <span className="text-sm text-slate-500">{pagination.total} üründen {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} gösteriliyor</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p: number) => <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-sm font-bold ${p === currentPage ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-500'}`}>{p}</button>)}
                                <button onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Grid View */}
            {!loading && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product: Product) => (
                        <div key={product.id} className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 p-5 hover:border-primary/30 hover:shadow-lg transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center relative overflow-hidden">
                                    {product.images.length > 0 ? (
                                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${STATUS_LABELS[product.status]?.className}`}>{STATUS_LABELS[product.status]?.label}</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{product.name}</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase mb-3">{product.sku}</p>
                            <div className="flex flex-wrap gap-1 mb-3">{product.platform.map((mp: string) => <span key={mp} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[mp] || 'bg-slate-100 text-slate-500'}`}>{mp}</span>)}</div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2"><div className="text-[10px] text-slate-500">Fiyat</div><div className="text-sm font-bold text-foreground">{formatCurrency(product.price)}</div></div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2"><div className="text-[10px] text-slate-500">Stok</div><div className={`text-sm font-bold ${product.stock === 0 ? 'text-red-500' : 'text-foreground'}`}>{product.stock}</div></div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2"><div className="text-[10px] text-slate-500">Satış</div><div className="text-sm font-bold text-foreground">{product.sales.toLocaleString('tr-TR')}</div></div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-2"><div className="text-[10px] text-slate-500">Puan</div><div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /><span className="text-sm font-bold">{product.rating}</span></div></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all">Düzenle</button>
                                <button onClick={() => handleOptimize(product.id)} className="flex-1 px-3 py-2 bg-primary/10 rounded-lg text-xs font-semibold text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-1">{optimizing === product.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Optimize</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5">
                    <Package className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ürün bulunamadı</h3>
                    <p className="text-sm text-slate-500 mb-4">Arama kriterlerinize uygun ürün yok</p>
                    <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPlatformFilter('all'); setCategoryFilter('all'); }} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">Filtreleri Temizle</button>
                </div>
            )}
        </div>
    );
}
