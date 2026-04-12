"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Bookmark, Plus, Star, Trash2, ExternalLink, ArrowRight,
    Package, ShoppingCart, BarChart3, Settings, Truck, Users,
    Globe, DollarSign, GripVertical, FolderOpen
} from 'lucide-react';

interface Favorite {
    id: string;
    title: string;
    url: string;
    icon: React.ElementType;
    category: string;
    color: string;
}

interface Shortcut {
    id: string;
    label: string;
    keys: string;
    action: string;
}

const defaultFavorites: Favorite[] = [
    { id: '1', title: 'Dashboard', url: '/dashboard', icon: BarChart3, category: 'Sayfa', color: 'blue' },
    { id: '2', title: 'Ürünler', url: '/dashboard/products', icon: Package, category: 'Sayfa', color: 'purple' },
    { id: '3', title: 'Siparişler', url: '/dashboard/orders', icon: ShoppingCart, category: 'Sayfa', color: 'emerald' },
    { id: '4', title: 'Raporlar', url: '/dashboard/advanced-reports', icon: BarChart3, category: 'Sayfa', color: 'cyan' },
    { id: '5', title: 'Tedarikçiler', url: '/dashboard/suppliers', icon: Truck, category: 'Sayfa', color: 'orange' },
];

const allPages = [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'Ürünler', url: '/dashboard/products', icon: Package },
    { title: 'Siparişler', url: '/dashboard/orders', icon: ShoppingCart },
    { title: 'Müşteriler', url: '/dashboard/customers', icon: Users },
    { title: 'Raporlar', url: '/dashboard/advanced-reports', icon: BarChart3 },
    { title: 'Tedarikçiler', url: '/dashboard/suppliers', icon: Truck },
    { title: 'Kampanyalar', url: '/dashboard/campaign-manager', icon: Globe },
    { title: 'Fiyat Optimizasyonu', url: '/dashboard/price-optimization', icon: DollarSign },
    { title: 'Ayarlar', url: '/dashboard/settings', icon: Settings },
];

const shortcuts: Shortcut[] = [
    { id: '1', label: 'Yeni Ürün', keys: 'Alt+N', action: 'Ürün ekleme sayfasını aç' },
    { id: '2', label: 'Arama', keys: 'Ctrl+K', action: 'Global arama' },
    { id: '3', label: 'Dashboard', keys: 'Alt+D', action: 'Dashboard\'a git' },
    { id: '4', label: 'Siparişler', keys: 'Alt+O', action: 'Siparişlere git' },
    { id: '5', label: 'Bildirimler', keys: 'Alt+B', action: 'Bildirim panelini aç' },
];

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState(defaultFavorites);
    const [showAddModal, setShowAddModal] = useState(false);
    const [tab, setTab] = useState<'favorites' | 'shortcuts'>('favorites');

    const removeFav = (id: string) => setFavorites(prev => prev.filter(f => f.id !== id));
    const addFav = (page: typeof allPages[0]) => {
        if (favorites.some(f => f.url === page.url)) return;
        setFavorites(prev => [...prev, { id: `f${Date.now()}`, title: page.title, url: page.url, icon: page.icon, category: 'Sayfa', color: 'indigo' }]);
        setShowAddModal(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Bookmark className="w-8 h-8 text-yellow-500" /> Favoriler & Kısayollar
                    </h1>
                    <p className="text-slate-500 mt-1">Sık kullandığınız sayfaları ve kısayolları yönetin</p>
                </div>
            </div>

            <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
                <button onClick={() => setTab('favorites')} className={`flex-1 py-2.5 text-sm rounded-lg font-medium ${tab === 'favorites' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500'}`}>
                    <Star className="w-4 h-4 inline mr-2" />Favoriler ({favorites.length})
                </button>
                <button onClick={() => setTab('shortcuts')} className={`flex-1 py-2.5 text-sm rounded-lg font-medium ${tab === 'shortcuts' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500'}`}>
                    Klavye Kısayolları ({shortcuts.length})
                </button>
            </div>

            {tab === 'favorites' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favorites.map((fav, i) => (
                            <motion.div key={fav.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                className="bg-surface rounded-2xl border border-border p-5 group hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-${fav.color}-500/20 rounded-xl`}>
                                            <fav.icon className={`w-5 h-5 text-${fav.color}-500`} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">{fav.title}</h3>
                                            <p className="text-xs text-slate-500">{fav.url}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 hover:bg-background rounded-lg text-slate-400"><ExternalLink className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => removeFav(fav.id)} className="p-1.5 hover:bg-background rounded-lg text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <button onClick={() => setShowAddModal(true)}
                            className="border-2 border-dashed border-border rounded-2xl p-5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-yellow-400 hover:border-yellow-500/30 transition-colors">
                            <Plus className="w-5 h-5" /> Favori Ekle
                        </button>
                    </div>

                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-surface rounded-2xl w-full max-w-md border border-border p-6" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-bold text-foreground mb-4">Sayfa Ekle</h3>
                                <div className="space-y-2">
                                    {allPages.filter(p => !favorites.some(f => f.url === p.url)).map((page, i) => (
                                        <button key={i} onClick={() => addFav(page)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-background rounded-xl transition-colors text-left">
                                            <page.icon className="w-5 h-5 text-slate-400" />
                                            <span className="text-sm text-foreground">{page.title}</span>
                                            <ArrowRight className="w-4 h-4 text-slate-600 ml-auto" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </>
            )}

            {tab === 'shortcuts' && (
                <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                    {shortcuts.map((sc, i) => (
                        <div key={sc.id} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
                            <div>
                                <div className="text-sm font-medium text-foreground">{sc.label}</div>
                                <div className="text-xs text-slate-500">{sc.action}</div>
                            </div>
                            <kbd className="px-3 py-1.5 bg-background rounded-lg text-sm text-slate-400 border border-border font-mono">{sc.keys}</kbd>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
