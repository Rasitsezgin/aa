'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProducts } from '@/lib/hooks';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
    const { createProduct, loading } = useProducts();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        description: ''
    });

    const reset = () => {
        setFormData({
            name: '',
            sku: '',
            barcode: '',
            price: '',
            stock: '',
            category: '',
            brand: '',
            description: ''
        });
        setStatus('idle');
        setErrorMessage('');
    };

    const handleClose = () => {
        if (status !== 'idle') reset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProduct({
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock, 10),
                status: 'active'
            });
            setStatus('success');
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.message || 'Ürün oluşturulurken bir hata oluştu.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-surface rounded-2xl w-full max-w-xl overflow-hidden border border-border shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-xl">
                            <Package className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Yeni Ürün Ekle</h2>
                            <p className="text-sm text-slate-500">Kataloğunuza manuel ürün ekleyin</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-background rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Ürün Oluşturuldu</h3>
                            <p className="text-slate-500 text-center">Ürün başarıyla kataloğa eklendi.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Ürün Adı</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        placeholder="Örn: iPhone 15 Pro Max"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">SKU / Model Kodu</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        placeholder="IP15-PRO-256"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Barkod (EAN)</label>
                                    <input
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        placeholder="8680000000000"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Fiyat (TL)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Stok Adedi</label>
                                    <input
                                        required
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Kategori</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        placeholder="Elektronik"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Marka</label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        placeholder="Apple"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Açıklama</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                                        placeholder="Ürün açıklaması..."
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {errorMessage}
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-3 bg-background rounded-xl text-slate-500 hover:text-foreground transition-all border border-border font-bold text-sm"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                                    Ürün Oluştur
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
