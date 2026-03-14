'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2, CheckCircle2, AlertCircle, Plus, Trash2, Search, Package, ArrowRight } from 'lucide-react';
import { useQuickSale } from '@/hooks/useQuickSale';

interface QuickSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickSaleModal({ isOpen, onClose }: QuickSaleModalProps) {
    const {
        status,
        errorMessage,
        searchQuery,
        setSearchQuery,
        selectedItems,
        customerData,
        setCustomerData,
        focusedProductIndex,
        filteredProducts,
        totalAmount,
        orderLoading,
        handleClose,
        addItem,
        removeItem,
        updateQuantity,
        handleSubmit,
        handleKeyDown // Make sure this is returned from the hook!
    } = useQuickSale(onClose);

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Handle keyboard shortcuts for the entire modal
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') handleClose();
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isOpen, handleClose]);


    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-surface rounded-2xl w-full max-w-4xl overflow-hidden border border-border shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border bg-background/50 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Hızlı Satış Terminali</h2>
                                    <p className="text-sm text-slate-500">Klavye ile süper hızlı sipariş oluşturun</p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="p-2 hover:bg-background rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto flex-1 bg-surface-50">
                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center h-full py-20 space-y-6"
                                >
                                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-foreground">Satış Başarılı!</h3>
                                        <p className="text-slate-500 mt-2">Sipariş sisteme işlendi.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                                    {/* Left: Product Selection (7 cols) */}
                                    <div className="lg:col-span-7 p-6 border-r border-border flex flex-col gap-6">

                                        {/* Search Bar */}
                                        <div className="relative z-20">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    ref={searchInputRef}
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        // Pass to hook's handler
                                                        // @ts-ignore
                                                        if (typeof handleKeyDown === 'function') handleKeyDown(e);
                                                    }}
                                                    className="w-full bg-background border-2 border-border focus:border-primary/50 list-none rounded-2xl pl-12 pr-4 py-4 text-lg font-medium text-foreground placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                                    placeholder="Ürün ara... (Enter ile ekle)"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-lg text-xs text-slate-400 font-sans">
                                                        <span>↑</span><span>↓</span>
                                                    </kbd>
                                                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-lg text-xs text-slate-400 font-sans">
                                                        <span>↵</span>
                                                    </kbd>
                                                </div>
                                            </div>

                                            {/* Dropdown Results */}
                                            <AnimatePresence>
                                                {searchQuery && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
                                                    >
                                                        {filteredProducts.length > 0 ? (
                                                            filteredProducts.map((p, index) => (
                                                                <button
                                                                    key={p.id}
                                                                    onClick={() => addItem(p)}
                                                                    className={`w-full p-4 text-left flex items-center justify-between border-b border-border last:border-0 transition-colors ${index === focusedProductIndex ? 'bg-primary/10' : 'hover:bg-background'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${index === focusedProductIndex ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                                                            <Package className="w-5 h-5" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-base font-bold text-foreground">{p.name}</div>
                                                                            <div className="text-xs text-slate-500 font-mono">{p.sku}</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-base font-bold text-primary">{p.price.toLocaleString('tr-TR')} TL</div>
                                                                        {index === focusedProductIndex && <ArrowRight className="w-4 h-4 text-primary animate-pulse" />}
                                                                    </div>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-8 text-center text-slate-500">
                                                                <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                                <p>Ürün bulunamadı.</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Selected Items List */}
                                        <div className="flex-1 flex flex-col min-h-0 bg-background/50 rounded-2xl border border-border/50 overflow-hidden">
                                            <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
                                                <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Sepet ({selectedItems.length})</h3>
                                                {selectedItems.length > 0 && (
                                                    <button onClick={() => selectedItems.forEach(i => removeItem(i.productId))} className="text-xs text-red-500 hover:underline">Sepeti Temizle</button>
                                                )}
                                            </div>

                                            <div className="overflow-y-auto p-2 space-y-2 flex-1">
                                                <AnimatePresence mode='popLayout'>
                                                    {selectedItems.length > 0 ? (
                                                        selectedItems.map(item => (
                                                            <motion.div
                                                                layout
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 20 }}
                                                                key={item.productId}
                                                                className="flex items-center gap-3 p-3 bg-surface hover:bg-surface-hover rounded-xl border border-border group transition-colors shadow-sm"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-bold text-foreground truncate">{item.name}</div>
                                                                    <div className="text-xs text-slate-500 font-mono">{item.price.toLocaleString('tr-TR')} TL x {item.quantity}</div>
                                                                </div>

                                                                <div className="flex items-center bg-background rounded-lg border border-border overflow-hidden">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.productId, -1)}
                                                                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                                                                    >-</button>
                                                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.productId, 1)}
                                                                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
                                                                    >+</button>
                                                                </div>

                                                                <div className="text-right min-w-[80px]">
                                                                    <div className="font-bold text-primary">{(item.price * item.quantity).toLocaleString('tr-TR')}</div>
                                                                    <div className="text-[10px] text-slate-400">TL</div>
                                                                </div>

                                                                <button
                                                                    onClick={() => removeItem(item.productId)}
                                                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        <div className="h-40 flex flex-col items-center justify-center text-slate-400 opacity-60">
                                                            <Package className="w-10 h-10 mb-2 stroke-1" />
                                                            <p className="text-sm">Henüz ürün eklenmedi</p>
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Footer Totals */}
                                            {selectedItems.length > 0 && (
                                                <div className="p-4 bg-surface border-t border-border mt-auto">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm text-slate-500">Ara Toplam</span>
                                                        <span className="text-foreground font-medium">{totalAmount.toLocaleString('tr-TR')} TL</span>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-lg font-bold text-foreground">Genel Toplam</span>
                                                        <span className="text-2xl font-black text-primary tracking-tight">{totalAmount.toLocaleString('tr-TR')} <span className="text-sm font-normal text-slate-500">TL</span></span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Customer Form & Actions (5 cols) */}
                                    <div className="lg:col-span-5 p-6 bg-surface shadow-inner flex flex-col h-full">
                                        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Müşteri & Ödeme</h3>

                                        <form id="quick-sale-form" onSubmit={(e) => handleSubmit(e)} className="space-y-4 flex-1 overflow-y-auto pr-1">
                                            <div className="space-y-4">
                                                <div className="group">
                                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block group-focus-within:text-primary transition-colors">Ad Soyad</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={customerData.name}
                                                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                                                        placeholder="Müşteri adı"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="group">
                                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block group-focus-within:text-primary transition-colors">Telefon</label>
                                                        <input
                                                            type="tel"
                                                            value={customerData.phone}
                                                            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                                                            placeholder="05..."
                                                        />
                                                    </div>
                                                    <div className="group">
                                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block group-focus-within:text-primary transition-colors">E-posta</label>
                                                        <input
                                                            type="email"
                                                            value={customerData.email}
                                                            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                                                            placeholder="mail@"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="group">
                                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block group-focus-within:text-primary transition-colors">Adres</label>
                                                    <textarea
                                                        value={customerData.address}
                                                        onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                                        rows={3}
                                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all resize-none"
                                                        placeholder="Teslimat adresi..."
                                                    />
                                                </div>
                                            </div>

                                            {status === 'error' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500"
                                                >
                                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                    {errorMessage}
                                                </motion.div>
                                            )}
                                        </form>

                                        <div className="pt-4 border-t border-border mt-auto">
                                            <button
                                                form="quick-sale-form"
                                                disabled={orderLoading || selectedItems.length === 0}
                                                type="submit"
                                                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 disabled:opacity-50 disabled:grayscale text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98]"
                                            >
                                                {orderLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
                                                Satışı Onayla
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
