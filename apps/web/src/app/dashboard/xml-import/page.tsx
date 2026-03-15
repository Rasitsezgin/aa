"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileCode2, Plus, RefreshCw, CheckCircle, AlertTriangle,
    Upload, Eye, X, ArrowRight, ChevronRight, Loader2,
    Globe, Check, Package, Clock, Trash2
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useProducts } from '@/lib/hooks';

interface FeedItem {
    id: string; name: string; url: string;
    status: 'active' | 'error'; lastSync?: string;
    productCount: number; supplier?: string;
}

const marketplaces = [
    { id: 'trendyol', name: 'Trendyol', color: 'bg-orange-500' },
    { id: 'hepsiburada', name: 'Hepsiburada', color: 'bg-red-500' },
    { id: 'amazon', name: 'Amazon', color: 'bg-yellow-500' },
    { id: 'n11', name: 'N11', color: 'bg-purple-500' },
    { id: 'ciceksepeti', name: 'Çiçeksepeti', color: 'bg-pink-500' },
];

type Tab = 'feeds' | 'products' | 'wizard';
type WizardStep = 1 | 2 | 3 | 4;

export default function XmlImportPage() {
    const [activeTab, setActiveTab] = useState<Tab>('feeds');
    const [feeds, setFeeds] = useState<FeedItem[]>([]);
    const [feedsLoading, setFeedsLoading] = useState(true);
    const [feedsError, setFeedsError] = useState<string | null>(null);
    const [showAddFeed, setShowAddFeed] = useState(false);
    const [feedUrl, setFeedUrl] = useState('');
    const [feedName, setFeedName] = useState('');
    const [addingFeed, setAddingFeed] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
    const [wizardStep, setWizardStep] = useState<WizardStep>(1);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [syncing, setSyncing] = useState<string | null>(null);

    const { products, loading: productsLoading, fetchProducts } = useProducts();

    useEffect(() => { loadFeeds(); }, []);

    const loadFeeds = async () => {
        setFeedsLoading(true);
        setFeedsError(null);
        try {
            const result = await apiClient.request<FeedItem[]>('/xml-feeds');
            setFeeds(result || []);
        } catch {
            setFeedsError('XML feedler yüklenemedi.');
            setFeeds([]);
        } finally {
            setFeedsLoading(false);
        }
    };

    const addFeed = async () => {
        if (!feedUrl || !feedName) return;
        setAddingFeed(true);
        try {
            await apiClient.request('/xml-feeds', {
                method: 'POST',
                body: JSON.stringify({ name: feedName, url: feedUrl }),
            });
            setFeedName('');
            setFeedUrl('');
            setShowAddFeed(false);
            await loadFeeds();
        } catch { /* ignore */ }
        setAddingFeed(false);
    };

    const deleteFeed = async (id: string) => {
        try {
            await apiClient.request(`/xml-feeds/${id}`, { method: 'DELETE' });
            setFeeds(prev => prev.filter(f => f.id !== id));
        } catch { /* ignore */ }
    };

    const handleSync = async (feedId: string) => {
        setSyncing(feedId);
        try {
            await apiClient.request(`/xml-feeds/${feedId}/sync`, { method: 'POST' });
            await loadFeeds();
        } catch { /* ignore */ }
        setSyncing(null);
    };

    const handleImport = async () => {
        setImportError(null);
        setImporting(true);
        try {
            await apiClient.request('/xml-feeds/import', {
                method: 'POST',
                body: JSON.stringify({
                    productIds: selectedProducts,
                    marketplaces: selectedMarketplaces,
                }),
            });
            setWizardStep(4);
        } catch {
            setImportError('Yükleme işlemi tamamlanamadı. Lütfen tekrar deneyin.');
        } finally {
            setImporting(false);
        }
    };

    const toggleProduct = (id: string) =>
        setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleMarketplace = (id: string) =>
        setSelectedMarketplaces(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const activeFeeds = feeds.filter(f => f.status === 'active').length;
    const totalProducts = feeds.reduce((s, f) => s + (f.productCount || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <FileCode2 className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">XML İçe Aktarma</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-14">Tedarikçi XML feedlerinden ürünleri içe aktarın, pazaryerlerine toplu yükleyin</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={loadFeeds}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all">
                        <RefreshCw size={15} className={feedsLoading ? "animate-spin" : ""} />
                    </button>
                    <button onClick={() => setShowAddFeed(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                        <Plus size={16} /> Feed Ekle
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Aktif Feed', value: activeFeeds.toString(), icon: FileCode2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Toplam Ürün (Feed)', value: totalProducts.toLocaleString('tr-TR'), icon: Package, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Katalog Ürünleri', value: products.length.toString(), icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Toplam Feed', value: feeds.length.toString(), icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                ].map(s => (
                    <div key={s.label} className="bg-surface rounded-2xl border border-border p-5">
                        <div className={`p-2.5 rounded-xl ${s.bg} w-fit mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                        <div className="text-2xl font-black text-foreground">{s.value}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-surface border border-border rounded-2xl p-1.5 w-fit">
                {(['feeds', 'products', 'wizard'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-foreground hover:bg-white/5'}`}>
                        {tab === 'feeds' ? 'XML Feedler' : tab === 'products' ? 'Ürün Önizleme' : 'Yükleme Sihirbazı'}
                    </button>
                ))}
            </div>

            {/* Feeds Tab */}
            {activeTab === 'feeds' && (
                <div className="space-y-4">
                    {feedsLoading && (
                        <div className="bg-surface border border-border rounded-2xl py-16 flex items-center justify-center gap-3 text-slate-500">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm font-medium">XML feedler yükleniyor...</span>
                        </div>
                    )}

                    {!feedsLoading && feedsError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 flex items-center justify-between">
                            <span className="text-sm text-red-400">{feedsError}</span>
                            <button onClick={loadFeeds} className="text-xs font-bold text-red-400 hover:text-red-300">Tekrar Dene</button>
                        </div>
                    )}

                    {!feedsLoading && feeds.map((feed, idx) => (
                        <motion.div key={feed.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
                            className="bg-surface border border-border rounded-2xl p-5">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${feed.status === 'error' ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}>
                                        <FileCode2 className={`w-5 h-5 ${feed.status === 'error' ? 'text-red-500' : 'text-indigo-500'}`} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground flex items-center gap-2">
                                            {feed.name}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${feed.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {feed.status === 'active' ? 'Aktif' : 'Hata'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{feed.url}</div>
                                        {feed.supplier && <div className="text-[10px] text-slate-600 mt-1">{feed.supplier}</div>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-lg font-black text-foreground">{feed.productCount.toLocaleString('tr-TR')}</div>
                                        <div className="text-[10px] text-slate-500">Ürün</div>
                                    </div>
                                    {feed.lastSync && (
                                        <div className="text-center">
                                            <div className="text-xs font-bold text-foreground">{feed.lastSync}</div>
                                            <div className="text-[10px] text-slate-500">Son Sync</div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleSync(feed.id)} disabled={syncing === feed.id}
                                            className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl text-xs font-bold text-foreground hover:bg-surface transition-all disabled:opacity-50">
                                            <RefreshCw size={13} className={syncing === feed.id ? 'animate-spin' : ''} />
                                            {syncing === feed.id ? 'Senkronize...' : 'Senkronize Et'}
                                        </button>
                                        <button onClick={() => setActiveTab('products')}
                                            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all">
                                            <Eye size={13} /> Ürünleri Gör
                                        </button>
                                        <button onClick={() => deleteFeed(feed.id)}
                                            className="p-2 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {!feedsLoading && feeds.length === 0 && !feedsError && (
                        <div className="bg-surface border border-dashed border-border rounded-2xl py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <FileCode2 size={40} className="text-slate-300" />
                            <div className="text-center">
                                <p className="font-bold text-foreground">Henüz XML feed yok</p>
                                <p className="text-sm mt-1">İlk tedarikçi XML feed'inizi ekleyin.</p>
                            </div>
                        </div>
                    )}

                    <button onClick={() => setShowAddFeed(true)}
                        className="w-full bg-surface border border-dashed border-border rounded-2xl p-6 flex items-center justify-center gap-3 text-slate-500 hover:text-foreground hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all">
                        <Plus size={18} /> <span className="text-sm font-bold">Yeni XML Feed Ekle</span>
                    </button>
                </div>
            )}

            {/* Products Tab — uses real products from useProducts */}
            {activeTab === 'products' && (
                <div className="space-y-4">
                    {productsLoading && (
                        <div className="bg-surface border border-border rounded-2xl py-16 flex items-center justify-center gap-3 text-slate-500">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Ürünler yükleniyor...</span>
                        </div>
                    )}
                    {!productsLoading && (
                        <>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <span className="text-sm text-slate-500">{products.length} ürün listeleniyor</span>
                                <button onClick={() => setActiveTab('wizard')} disabled={selectedProducts.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all disabled:opacity-40">
                                    <Upload size={13} /> Seçilenleri Yükle ({selectedProducts.length})
                                </button>
                            </div>
                            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                                {products.length === 0 && (
                                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                                        <Package size={40} className="text-slate-300" />
                                        <p className="font-bold text-foreground text-sm">Henüz ürün yok</p>
                                    </div>
                                )}
                                {products.map((product, idx) => (
                                    <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                                        className={`grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-center px-5 py-4 border-b border-border last:border-0 hover:bg-white/2 transition-colors ${selectedProducts.includes(product.id) ? 'bg-indigo-500/5' : ''}`}>
                                        <div className="lg:col-span-1">
                                            <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleProduct(product.id)} className="rounded" />
                                        </div>
                                        <div className="lg:col-span-5">
                                            <div className="font-bold text-sm text-foreground">{product.name}</div>
                                            <div className="text-[10px] text-slate-500">{product.brand} · {product.category}</div>
                                        </div>
                                        <div className="lg:col-span-2 font-mono text-xs text-slate-400">{product.barcode}</div>
                                        <div className="lg:col-span-1 text-sm font-bold text-foreground">{product.stock}</div>
                                        <div className="lg:col-span-2 text-sm font-bold text-foreground">₺{product.price.toLocaleString('tr-TR')}</div>
                                        <div className="lg:col-span-1">
                                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                                                Katalog
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Wizard Tab */}
            {activeTab === 'wizard' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        {[{ step: 1, label: 'Ürün Seç' }, { step: 2, label: 'Kanal Seç' }, { step: 3, label: 'Eşleştir' }, { step: 4, label: 'Bitti' }].map((s, idx) => (
                            <React.Fragment key={s.step}>
                                <button onClick={() => !importing && setWizardStep(s.step as WizardStep)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${wizardStep === s.step ? 'bg-indigo-600 text-white' : wizardStep > s.step ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-surface border border-border text-slate-500'}`}>
                                    {wizardStep > s.step ? <Check size={12} /> : s.step} {s.label}
                                </button>
                                {idx < 3 && <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />}
                            </React.Fragment>
                        ))}
                    </div>

                    {wizardStep === 1 && (
                        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                            <h3 className="font-bold text-foreground text-lg">Hangi ürünleri yüklemek istiyorsunuz?</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'all', label: 'Tüm Ürünler', count: products.length },
                                    { id: 'selected', label: 'Seçili Ürünler', count: selectedProducts.length },
                                    { id: 'new', label: 'Yeni Gelenler', count: feeds.reduce((s, f) => s + f.productCount, 0) },
                                ].map(o => (
                                    <button key={o.id} className="flex flex-col items-center gap-2 p-5 bg-background border-2 border-indigo-500/30 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/5 transition-all">
                                        <div className="font-bold text-foreground">{o.label}</div>
                                        <div className="text-2xl font-black text-indigo-500">{o.count.toLocaleString('tr-TR')}</div>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setWizardStep(2)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all">
                                Devam Et <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {wizardStep === 2 && (
                        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                            <h3 className="font-bold text-foreground text-lg">Hangi pazaryerlerine yüklensin?</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {marketplaces.map(mp => (
                                    <button key={mp.id} onClick={() => toggleMarketplace(mp.id)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${selectedMarketplaces.includes(mp.id) ? 'border-indigo-500 bg-indigo-500/10' : 'border-border bg-background hover:border-border/80'}`}>
                                        <div className={`w-10 h-10 rounded-xl ${mp.color} flex items-center justify-center`}><Globe size={18} className="text-white" /></div>
                                        <span className="text-xs font-bold text-foreground">{mp.name}</span>
                                        {selectedMarketplaces.includes(mp.id) && <CheckCircle size={14} className="text-indigo-500" />}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setWizardStep(1)} className="px-6 py-3 bg-background border border-border rounded-xl font-bold text-foreground hover:bg-surface transition-all">Geri</button>
                                <button onClick={() => setWizardStep(3)} disabled={selectedMarketplaces.length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-40">
                                    Devam Et <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {wizardStep === 3 && (
                        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                            <h3 className="font-bold text-foreground text-lg">Kategori Eşleştirme (AI Destekli)</h3>
                            <div className="space-y-2">
                                {[
                                    { feed: 'Telefon', platform: 'Trendyol > Cep Telefonu', conf: 98 },
                                    { feed: 'Kulaklık', platform: 'Trendyol > Kulaklık & Headset', conf: 94 },
                                    { feed: 'Aksesuar', platform: 'Trendyol > Bilgisayar Aksesuarları', conf: 87 },
                                ].map(m => (
                                    <div key={m.feed} className="flex items-center gap-4 p-4 bg-background border border-border rounded-xl">
                                        <span className="text-sm font-bold text-foreground w-32">{m.feed}</span>
                                        <ArrowRight size={14} className="text-slate-500" />
                                        <span className="text-sm text-slate-400 flex-1">{m.platform}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${m.conf > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${m.conf}%` }} />
                                            </div>
                                            <span className={`text-xs font-bold ${m.conf > 90 ? 'text-green-500' : 'text-yellow-500'}`}>%{m.conf}</span>
                                        </div>
                                        <CheckCircle size={14} className="text-green-500" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setWizardStep(2)} className="px-6 py-3 bg-background border border-border rounded-xl font-bold text-foreground hover:bg-surface transition-all">Geri</button>
                                <button onClick={handleImport} disabled={importing}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-70">
                                    {importing ? <><Loader2 size={16} className="animate-spin" /> Yükleniyor...</> : <><Upload size={16} /> Pazaryerlerine Yükle</>}
                                </button>
                            </div>
                            {importing && (
                                <div className="w-full h-2 bg-indigo-500/10 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
                                </div>
                            )}
                            {importError && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                    {importError}
                                </div>
                            )}
                        </div>
                    )}

                    {wizardStep === 4 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-surface border border-green-500/30 rounded-2xl p-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground">Yükleme Tamamlandı!</h3>
                            <p className="text-slate-500">{selectedProducts.length > 0 ? selectedProducts.length : products.length} ürün seçili pazaryerlerine başarıyla yüklendi.</p>
                            <div className="flex justify-center gap-3">
                                <button onClick={() => { setWizardStep(1); setSelectedMarketplaces([]); setSelectedProducts([]); }}
                                    className="px-6 py-3 bg-background border border-border rounded-xl font-bold text-foreground hover:bg-surface transition-all">Yeni Yükleme</button>
                                <button onClick={() => setActiveTab('products')}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all">
                                    Ürünleri Gör <ArrowRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Add Feed Modal */}
            <AnimatePresence>
                {showAddFeed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAddFeed(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-foreground">XML Feed Ekle</h3>
                                <button onClick={() => setShowAddFeed(false)} className="p-1.5 rounded-lg hover:bg-background text-slate-400"><X size={18} /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Feed Adı</label>
                                    <input value={feedName} onChange={e => setFeedName(e.target.value)} placeholder="Örn: Ana Tedarikçi"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">XML Feed URL</label>
                                    <input value={feedUrl} onChange={e => setFeedUrl(e.target.value)} placeholder="https://supplier.com/products.xml"
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder-slate-600 focus:border-indigo-500 outline-none transition-colors" />
                                </div>
                                <button onClick={addFeed} disabled={!feedName || !feedUrl || addingFeed}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                    {addingFeed ? <><Loader2 size={16} className="animate-spin" /> Ekleniyor...</> : 'Feed Ekle'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
