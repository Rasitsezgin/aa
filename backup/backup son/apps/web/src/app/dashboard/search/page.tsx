"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Command, FileText, Package, ShoppingCart, Users,
    Settings, BarChart3, Truck, ArrowRight, Clock, Star,
    Hash, X, Keyboard
} from 'lucide-react';

interface SearchResult {
    id: string;
    type: 'product' | 'order' | 'customer' | 'page' | 'setting';
    title: string;
    subtitle: string;
    icon: React.ElementType;
    url: string;
}

const allResults: SearchResult[] = [
    { id: '1', type: 'product', title: 'iPhone 15 Pro Max Kılıf', subtitle: 'SKU: IP15PM-001 · ₺89.90', icon: Package, url: '/dashboard/products/1' },
    { id: '2', type: 'product', title: 'Galaxy S24 Ekran Koruyucu', subtitle: 'SKU: GS24-EC-01 · ₺49.90', icon: Package, url: '/dashboard/products/2' },
    { id: '3', type: 'product', title: 'AirPods Pro 2 Kılıf', subtitle: 'SKU: APP2-K-01 · ₺69.90', icon: Package, url: '/dashboard/products/3' },
    { id: '4', type: 'order', title: 'Sipariş #ORD-2025-001245', subtitle: 'Ahmet Yılmaz · ₺342.00 · Kargoda', icon: ShoppingCart, url: '/dashboard/orders/1245' },
    { id: '5', type: 'order', title: 'Sipariş #ORD-2025-001244', subtitle: 'Fatma Demir · ₺189.00 · Teslim Edildi', icon: ShoppingCart, url: '/dashboard/orders/1244' },
    { id: '6', type: 'customer', title: 'Ahmet Yılmaz', subtitle: 'ahmet@email.com · 12 sipariş', icon: Users, url: '/dashboard/customers/1' },
    { id: '7', type: 'customer', title: 'Fatma Demir', subtitle: 'fatma@email.com · 8 sipariş', icon: Users, url: '/dashboard/customers/2' },
    { id: '8', type: 'page', title: 'Dashboard', subtitle: 'Ana sayfa', icon: BarChart3, url: '/dashboard' },
    { id: '9', type: 'page', title: 'Ürünler', subtitle: 'Ürün listesi', icon: Package, url: '/dashboard/products' },
    { id: '10', type: 'page', title: 'Siparişler', subtitle: 'Sipariş yönetimi', icon: ShoppingCart, url: '/dashboard/orders' },
    { id: '11', type: 'page', title: 'Raporlar', subtitle: 'Gelişmiş raporlama', icon: BarChart3, url: '/dashboard/advanced-reports' },
    { id: '12', type: 'page', title: 'Tedarikçiler', subtitle: 'Tedarikçi yönetimi', icon: Truck, url: '/dashboard/suppliers' },
    { id: '13', type: 'page', title: 'Ayarlar', subtitle: 'Hesap ayarları', icon: Settings, url: '/dashboard/settings' },
    { id: '14', type: 'setting', title: 'Bildirim Ayarları', subtitle: 'E-posta ve push bildirimleri', icon: Settings, url: '/dashboard/settings#notifications' },
    { id: '15', type: 'setting', title: 'API Anahtarları', subtitle: 'API erişim yönetimi', icon: Settings, url: '/dashboard/settings#api' },
];

const recentSearches = ['iPhone kılıf', 'sipariş #1245', 'stok kontrol', 'fatma demir'];

const typeLabels: Record<string, string> = { product: 'Ürün', order: 'Sipariş', customer: 'Müşteri', page: 'Sayfa', setting: 'Ayar' };

export default function AdvancedSearchPage() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = query.length > 0
        ? allResults.filter(r => {
            if (typeFilter && r.type !== typeFilter) return false;
            const q = query.toLowerCase();
            return r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q);
        })
        : [];

    const groupedResults = results.reduce((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {} as Record<string, SearchResult[]>);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSelectedIndex(0);
        }, 0);
        return () => clearTimeout(timer);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => Math.min(prev + 1, results.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => Math.max(prev - 1, 0)); }
        if (e.key === 'Escape') setQuery('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Search className="w-8 h-8 text-cyan-500" /> Gelişmiş Arama
                </h1>
                <p className="text-slate-500 mt-1">Ürün, sipariş, müşteri ve sayfaları hızlıca arayın</p>
            </div>

            {/* Search Box */}
            <div className="bg-surface rounded-2xl border border-border p-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ürün, sipariş, müşteri veya sayfa ara... (Ctrl+K)"
                        className="w-full pl-12 pr-20 py-4 bg-transparent text-lg text-foreground placeholder:text-slate-600 focus:outline-none"
                        autoFocus
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {query && <button onClick={() => setQuery('')} className="p-1 hover:bg-background rounded text-slate-500"><X className="w-4 h-4" /></button>}
                        <kbd className="px-2 py-1 bg-background rounded text-xs text-slate-500 border border-border">Ctrl+K</kbd>
                    </div>
                </div>

                {/* Type Filters */}
                <div className="flex items-center gap-2 px-2 pb-2">
                    <span className="text-xs text-slate-600">Filtre:</span>
                    {[null, 'product', 'order', 'customer', 'page', 'setting'].map(t => (
                        <button key={t ?? 'all'} onClick={() => setTypeFilter(t)}
                            className={`px-2.5 py-1 text-xs rounded-lg transition-all ${typeFilter === t ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-foreground hover:bg-background'}`}>
                            {t ? typeLabels[t] : 'Tümü'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            {query.length > 0 && results.length > 0 && (
                <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                    {Object.entries(groupedResults).map(([type, items]) => (
                        <div key={type}>
                            <div className="px-4 py-2 bg-background/50 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {typeLabels[type]} ({items.length})
                            </div>
                            {items.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-background/50 cursor-pointer transition-colors border-b border-border/30"
                                >
                                    <item.icon className="w-5 h-5 text-slate-500" />
                                    <div className="flex-1">
                                        <div className="text-sm text-foreground font-medium">{item.title}</div>
                                        <div className="text-xs text-slate-500">{item.subtitle}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-600" />
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {query.length > 0 && results.length === 0 && (
                <div className="bg-surface rounded-2xl border border-border p-12 text-center">
                    <Search className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">&quot;{query}&quot; için sonuç bulunamadı</p>
                </div>
            )}

            {/* Recent & Shortcuts */}
            {query.length === 0 && (
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-surface rounded-2xl border border-border p-5">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-slate-400" /> Son Aramalar</h3>
                        <div className="space-y-2">
                            {recentSearches.map((s, i) => (
                                <button key={i} onClick={() => setQuery(s)} className="w-full text-left px-3 py-2 hover:bg-background rounded-lg text-sm text-slate-400 hover:text-foreground flex items-center gap-2 transition-colors">
                                    <Clock className="w-3.5 h-3.5" /> {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-surface rounded-2xl border border-border p-5">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4"><Keyboard className="w-4 h-4 text-slate-400" /> Kısayollar</h3>
                        <div className="space-y-2">
                            {[
                                { keys: 'Ctrl+K', desc: 'Aramayı aç' },
                                { keys: '↑ ↓', desc: 'Sonuçlarda gezin' },
                                { keys: 'Enter', desc: 'Seçili sonuca git' },
                                { keys: 'Esc', desc: 'Aramayı temizle' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <span className="text-slate-400">{s.desc}</span>
                                    <kbd className="px-2 py-0.5 bg-background rounded text-xs text-slate-500 border border-border">{s.keys}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
