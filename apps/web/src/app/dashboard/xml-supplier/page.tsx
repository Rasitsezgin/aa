"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Link, Globe, Play, Settings2, Trash2, Tag, 
    Percent, Box, PlusCircle, ArrowRightLeft, FileCode2
} from 'lucide-react';

const mockSuppliers = [
    { id: 1, name: 'İstanbul Toptan (Giyim)', url: 'https://istanbul-toptancivari.com/export/xml', status: 'active', lastSync: '10 Dk Önce', products: 1245 },
    { id: 2, name: 'TeknoDepo Elektronik', url: 'https://teknodepo.com.tr/bayi/xml', status: 'parsing', lastSync: 'Şu an', products: 450 },
    { id: 3, name: 'Karaca Home Dropship', url: 'https://karaca.com/xml/dropship-v2', status: 'error', lastSync: '2 Gün Önce', products: 0 }
];

export default function XMLSupplierPage() {
    const [links, setLinks] = useState(mockSuppliers);
    const [showNewModal, setShowNewModal] = useState(false);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <FileCode2 className="w-8 h-8 text-primary" />
                        XML Dropshipping Merkezi
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Tedarikçilerinizin XML bağlantılarını buraya ekleyin, kar oranınızı belirleyin ve binlerce ürünü saniyeler içinde pazaryerlerine (Trendyol, HB vs.) yollayın.
                    </p>
                </div>
                <button 
                    onClick={() => setShowNewModal(!showNewModal)}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" /> Yeni Tedarikçi Bağla
                </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-surface border border-border rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                            <Box className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-500">Çekilen Aktif Ürün</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">1,695</div>
                        </div>
                    </div>
                    <div className="w-px h-12 bg-border hidden lg:block" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                            <ArrowRightLeft className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-500">Bugünki Senkronizasyon</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">24 Kez</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <Settings2 className="w-5 h-5 text-slate-400" /> 
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Otomatik Stok Güncelleme Süresi: <strong className="text-primary">Stokta her 4 Saatte Bir</strong></span>
                </div>
            </div>

            {showNewModal && (
                <div className="bg-surface border border-primary/20 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-primary/5 animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Link className="w-5 h-5 text-primary" /> Tedarikçi (XML) Ağını Tanımla
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tedarikçi Adı</label>
                                <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-primary/50" placeholder="Örn: Ayakkabı Dünyası XML" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">XML URL Bağlantısı</label>
                                <div className="relative">
                                    <Globe className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input type="url" className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 ring-primary/50" placeholder="http://..." />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-border space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Otomatik Kâr ve Fiyat Kuralları (Mark-up)</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Maliyet Üzerine (+) Kâr Marjı</label>
                                    <div className="relative">
                                        <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="number" defaultValue="30" className="w-full bg-white dark:bg-background border border-border rounded-xl pl-9 pr-4 py-3 font-bold focus:outline-none focus:ring-2 ring-blue-500" />
                                    </div>
                                </div>
                                <div className="mt-6 text-2xl text-slate-300 font-black">+</div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Sabit Kargo Gideri Ekle</label>
                                    <div className="relative">
                                        <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input type="number" defaultValue="45" className="w-full bg-white dark:bg-background border border-border rounded-xl pl-9 pr-4 py-3 font-bold focus:outline-none focus:ring-2 ring-blue-500" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-500 bg-blue-500/10 px-3 py-2 rounded-lg font-medium leading-relaxed">
                                Bu kural sayesinde tedarikçide 100₺ olan ürün, otomatik olarak pazaryerine (100 + %30) + 45₺ kargo = <strong>175₺</strong> olarak iletilir. Satın alım olduğunda asla zarar etmezsiniz.
                            </p>
                            <button className="w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity mt-4">
                                Test Et ve İçe Aktar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Links Table */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">Aktif XML Kaynakları</h3>
                {links.map((link) => (
                    <div key={link.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-border bg-surface hover:shadow-lg hover:border-primary/30 transition-all gap-4">
                        <div className="flex items-center gap-4 w-full md:w-1/3">
                            <div className={\`w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${link.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : link.status === 'parsing' ? 'bg-blue-500/10 text-blue-500 animate-pulse' : 'bg-red-500/10 text-red-500'}\`}>
                                <FileCode2 className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate">{link.name}</h4>
                                <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1">
                                    <Globe className="w-3 h-3" /> {link.url}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-6 md:w-1/3">
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Durum</div>
                                <div className={\`text-sm font-bold \${link.status === 'active' ? 'text-emerald-500' : link.status === 'parsing' ? 'text-blue-500' : 'text-red-500'}\`}>
                                    {link.status === 'active' ? 'Bağlı' : link.status === 'parsing' ? 'Derleniyor...' : 'Erişim Yok (404)'}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Listelenen Ürün</div>
                                <div className="text-lg font-black text-slate-900 dark:text-white">{link.products}</div>
                            </div>
                            <div className="text-center hidden sm:block">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Son Güncelleme</div>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{link.lastSync}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0 md:w-1/4">
                            <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-primary transition-colors hover:bg-primary/10 group relative" title="Kuyruğa Ekle / Senkronize Et">
                                <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-primary transition-colors hover:bg-primary/10 group" title="Kural Analizi">
                                <Settings2 className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                            </button>
                            <button className="p-2.5 border border-border rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
