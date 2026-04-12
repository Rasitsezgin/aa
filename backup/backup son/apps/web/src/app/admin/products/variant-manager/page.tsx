"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import {
    Search, Package, Save, Plus, Trash2,
    AlertCircle, CheckCircle2, Loader2, ChevronRight, Layers
} from 'lucide-react';

interface Product {
    id: string;
    title: string;
    sku: string;
    price: number;
    stock: number;
}

interface Variant {
    id?: string;
    sku: string;
    price: number;
    costPrice: number;
    stock: number;
    options: any; // { "Renk": "Kırmızı", "Beden": "XL" }
}

export default function VariantManagerPage() {
    const queryClient = useQueryClient();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [search, setSearch] = useState('');
    const [localVariants, setLocalVariants] = useState<Variant[]>([]);

    // Fetch products for selection
    const { data: productData, isLoading: productsLoading } = useQuery({
        queryKey: ['admin-products-minimal', search],
        queryFn: () => adminApi.getProducts({ search, limit: 10 }),
        enabled: true,
    });

    // Fetch variants when product selected
    const { data: remoteVariants, isLoading: variantsLoading } = useQuery({
        queryKey: ['admin-product-variants', selectedProduct?.id],
        queryFn: () => adminApi.getProductVariants(selectedProduct!.id),
        enabled: !!selectedProduct,
    });

    useEffect(() => {
        if (remoteVariants) {
            setLocalVariants(remoteVariants);
        }
    }, [remoteVariants]);

    const saveMutation = useMutation({
        mutationFn: () => adminApi.bulkUpdateVariants(selectedProduct!.id, localVariants),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-product-variants', selectedProduct?.id] });
            alert('Varyantlar başarıyla kaydedildi.');
        }
    });

    const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
        const next = [...localVariants];
        next[index] = { ...next[index], [field]: value };
        setLocalVariants(next);
    };

    const addVariant = () => {
        setLocalVariants([...localVariants, {
            id: `new_${Date.now()}`,
            sku: `${selectedProduct?.sku}-VAR-${localVariants.length + 1}`,
            price: selectedProduct?.price || 0,
            costPrice: 0,
            stock: 0,
            options: {}
        }]);
    };

    const removeVariant = (index: number) => {
        if (confirm('Bu varyantı silmek istediğinize emin misiniz?')) {
            const next = localVariants.filter((_, i) => i !== index);
            setLocalVariants(next);
            // Note: Backend currently doesn't handle deletion in the bulk endpoint 
            // but we could extend it if needed.
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Varyant Yöneticisi</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Ürün varyantlarını (beden, renk vb.) hızlı ve toplu bir şekilde düzenleyin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Product Selection sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                            <Package size={16} className="text-purple-500" /> Ürün Seçin
                        </h3>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Ürün ara..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-purple-500/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {productData?.products?.map((p: Product) => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedProduct(p)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedProduct?.id === p.id
                                            ? 'bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/30'
                                            : 'bg-white dark:bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.title}</div>
                                    <div className="text-[10px] text-slate-500 mt-1 font-medium">{p.sku}</div>
                                </button>
                            ))}
                            {productsLoading && <div className="text-center py-4 text-xs text-slate-400">Yükleniyor...</div>}
                        </div>
                    </div>
                </div>

                {/* Variant Editor Area */}
                <div className="lg:col-span-3">
                    {selectedProduct ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Layers size={18} className="text-purple-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{selectedProduct.title}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedProduct.sku}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={addVariant}
                                        className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border border-slate-200 dark:border-white/10"
                                    >
                                        <Plus size={14} /> Yeni Varyant
                                    </button>
                                    <button
                                        onClick={() => saveMutation.mutate()}
                                        disabled={saveMutation.isPending}
                                        className="px-4 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm shadow-purple-500/20 disabled:opacity-50"
                                    >
                                        {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Kaydet
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/5">
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Özellikler (JSON)</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiyat (₺)</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Maliyet (₺)</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {localVariants.map((v, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        className="bg-transparent w-full p-2 border border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 rounded-lg text-xs font-bold transition-all focus:bg-white dark:focus:bg-slate-800"
                                                        value={v.sku}
                                                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        className="bg-transparent w-full p-2 border border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 rounded-lg text-xs font-medium transition-all focus:bg-white dark:focus:bg-slate-800"
                                                        value={JSON.stringify(v.options)}
                                                        onChange={(e) => {
                                                            try {
                                                                handleVariantChange(idx, 'options', JSON.parse(e.target.value));
                                                            } catch (e) { }
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-2 w-28">
                                                    <input
                                                        type="number"
                                                        className="bg-transparent w-full p-2 border border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 rounded-lg text-xs font-black text-blue-600 dark:text-blue-400 transition-all focus:bg-white dark:focus:bg-slate-800"
                                                        value={v.price}
                                                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2 w-28">
                                                    <input
                                                        type="number"
                                                        className="bg-transparent w-full p-2 border border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 rounded-lg text-xs font-bold text-slate-500 transition-all focus:bg-white dark:focus:bg-slate-800"
                                                        value={v.costPrice}
                                                        onChange={(e) => handleVariantChange(idx, 'costPrice', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2 w-24">
                                                    <input
                                                        type="number"
                                                        className="bg-transparent w-full p-2 border border-transparent group-hover:border-slate-200 dark:group-hover:border-white/10 rounded-lg text-xs font-black text-purple-600 transition-all focus:bg-white dark:focus:bg-slate-800 text-center"
                                                        value={v.stock}
                                                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        onClick={() => removeVariant(idx)}
                                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {localVariants.length === 0 && !variantsLoading && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-slate-400 text-sm font-medium">
                                                    Bu ürün için henüz varyant tanımlanmamış.
                                                </td>
                                            </tr>
                                        )}
                                        {variantsLoading && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl h-[500px] flex flex-col items-center justify-center text-center p-10">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                <Package size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Ürün Seçilmedi</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs font-medium">
                                Varyantlarını düzenlemek istediğiniz ürünü soldaki listeden seçerek başlayın.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
