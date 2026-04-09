"use client";

import React, { useState } from 'react';
import { Layers, Search, Link as LinkIcon, Plus, Info, Store, Package } from 'lucide-react';
import Link from 'next/link';

// Mock variants
const mockVariants = [
    { id: '101', sku: 'HB-TSHOT-BLK-L', title: 'Hepsiburada Siyah Tişört L', platform: 'Hepsiburada', stock: 40 },
    { id: '102', sku: 'TY-TSRT-S-01-L', title: 'Trendyol Siyah Basic L', platform: 'Trendyol', stock: 40 },
    { id: '103', sku: 'AMZ-BLCK-TEE-L', title: 'Amazon Black Tee L', platform: 'Amazon', stock: 40 },
];

export default function GroupMappingPage() {
    const [masterSku, setMasterSku] = useState('MASTER-TSH-BLK-L');
    const [masterStock, setMasterStock] = useState(40);
    const [linkedVariants, setLinkedVariants] = useState(mockVariants);
    const [newVariantModal, setNewVariantModal] = useState(false);

    // Provide a simple drag-drop mock or list view.
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Layers className="w-8 h-8 text-primary" />
                        Grup Ürün & Varyant Eşleştirme
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Farklı pazaryerlerindeki farklı barkodlu ürünleri tek bir merkez stoka bağlayın. 
                        Bir platformda satıldığında diğer platformlardan otomatik düşsün.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                {/* Left Side: Master SKU Definition */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-primary to-purple-600 rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                            <Package className="w-6 h-6" /> Ana (Master) Stok
                        </h2>

                        <div className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Master SKU</label>
                                <input 
                                    type="text" 
                                    value={masterSku}
                                    onChange={(e) => setMasterSku(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 ring-white/50 text-white placeholder-white/50"
                                    placeholder="Örn: ANA-KOD-01"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Ortak Stok Miktarı</label>
                                <input 
                                    type="number" 
                                    value={masterStock}
                                    onChange={(e) => setMasterStock(Number(e.target.value))}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 ring-white/50 text-white text-3xl"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-3 relative z-10">
                            <Info className="w-5 h-5 text-white/70 shrink-0" />
                            <p className="text-sm text-white/80 leading-relaxed font-medium">
                                Sağ tarafa ekleyeceğiniz tüm pazaryeri varyantları bu stok miktarını (<strong className="text-white">{masterStock} adet</strong>) ortak olarak kullanacaktır.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Linked Variants List */}
                <div className="lg:col-span-8">
                    <div className="bg-surface border border-border rounded-[2rem] flex flex-col h-full overflow-hidden">
                        <div className="p-6 lg:p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold">Bağlı Pazaryeri Ürünleri</h3>
                                <p className="text-sm text-slate-500">Master koda bağlanmış alt ürünler (Varyantlar)</p>
                            </div>
                            <button 
                                onClick={() => setNewVariantModal(!newVariantModal)}
                                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Yeni Ürün Bağla
                            </button>
                        </div>

                        {newVariantModal && (
                            <div className="p-6 bg-primary/5 border-b border-primary/10 animate-in slide-in-from-top-4">
                                <div className="flex gap-4">
                                    <div className="relative flex-1">
                                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input 
                                            type="text" 
                                            className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 ring-primary/50"
                                            placeholder="Pazaryerlerindeki ürünlerinizi SKU ile arayın..."
                                        />
                                    </div>
                                    <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                        Ara ve Bağla
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="p-6 lg:p-8 flex-1">
                            <div className="space-y-4">
                                {linkedVariants.map((variant) => (
                                    <div key={variant.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors">
                                        <div className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 w-4 sm:w-6 h-px bg-border group-hover:bg-primary/30 hidden sm:block" />
                                        
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <Store className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {variant.sku}
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500">
                                                        {variant.platform}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-500 mt-0.5">{variant.title}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Şu anki Stok</div>
                                                <div className="font-bold text-slate-900 dark:text-white">{variant.stock}</div>
                                            </div>
                                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors group">
                                                <LinkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Visual connector graphic */}
                                <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-px bg-border hidden sm:block -z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end pt-4">
                <button className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-lg">
                    Senkronizasyonu Başlat (Aktar)
                </button>
            </div>
        </div>
    );
}
