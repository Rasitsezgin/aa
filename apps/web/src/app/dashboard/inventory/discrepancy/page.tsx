"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    AlertTriangle, RefreshCw, CheckCircle2, Search, XCircle, ChevronRight, Store, Database
} from 'lucide-react';
import Link from 'next/link';

// Mock data for discrepancies
const mockDiscrepancies = [
    { id: 1, sku: 'TSH-BLK-M', name: 'Siyah Tişört (Medium)', localStock: 45, marketStock: 50, marketplace: 'Trendyol', status: 'critical' },
    { id: 2, sku: 'SNK-WHT-42', name: 'Beyaz Sneaker (42 Nu.)', localStock: 12, marketStock: 12, marketplace: 'Hepsiburada', status: 'synced' },
    { id: 3, sku: 'SNK-WHT-43', name: 'Beyaz Sneaker (43 Nu.)', localStock: 0, marketStock: 2, marketplace: 'N11', status: 'critical' },
    { id: 4, sku: 'JCK-BLU-L', name: 'Mavi Ceket (Large)', localStock: 15, marketStock: 14, marketplace: 'Amazon', status: 'warning' }
];

export default function DiscrepancyManagerPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [lastScan, setLastScan] = useState('2 Saat Önce');
    const [results, setResults] = useState(mockDiscrepancies);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setLastScan('Şimdi');
            // Simulate resolving items randomly
            setResults(prev => prev.map(item => ({ ...item, marketStock: item.localStock, status: 'synced' })));
        }, 3000);
    };

    const handleSyncSpecific = (id: number) => {
        setResults(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, marketStock: item.localStock, status: 'synced' };
            }
            return item;
        }));
    };

    const criticalCount = results.filter(r => r.status === 'critical').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-orange-500" />
                        Ürün Farklılık Kontrolü
                    </h1>
                    <p className="text-slate-500 mt-2">Yerel stoklarınız ile pazaryerlerindeki stoklarınızı tarar, olası kaymaları ve hataları engeller.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">Son Tarama: {lastScan}</span>
                    <button 
                        onClick={handleScan}
                        disabled={isScanning}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw className={\`w-4 h-4 \${isScanning ? 'animate-spin' : ''}\`} /> 
                        {isScanning ? 'Stoklar Taranıyor...' : 'Yeni Tarama Başlat'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface border border-border rounded-3xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-sm font-bold text-slate-500 mb-2">Yüksek Risk(Kritik)</div>
                        <div className="text-4xl font-black text-red-500 flex items-center gap-2">
                            {criticalCount} <span className="text-sm text-red-500/50 mb-1">Ürün</span>
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-3xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-sm font-bold text-slate-500 mb-2">Düşük Risk (Uyarı)</div>
                        <div className="text-4xl font-black text-amber-500 flex items-center gap-2">
                            {warningCount} <span className="text-sm text-amber-500/50 mb-1">Ürün</span>
                        </div>
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-3xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-sm font-bold text-slate-500 mb-2">Eşitlenen Stoklar</div>
                        <div className="text-4xl font-black text-emerald-500 flex items-center gap-2">
                            {results.filter(r => r.status === 'synced').length} <span className="text-sm text-emerald-500/50 mb-1">Ürün</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanning Logic Board */}
            <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-bold">Risk Raporu ve Eşleştirme Detayları</h3>
                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-primary/50"
                            placeholder="SKU veya Ürün Ara..."
                        />
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase tracking-widest leading-loose">
                                <th className="px-6 py-4 font-bold">Stok Kodu (SKU)</th>
                                <th className="px-6 py-4 font-bold">Pazaryeri</th>
                                <th className="px-6 py-4 font-bold text-center">Yerel Stok (Sistem)</th>
                                <th className="px-6 py-4 font-bold text-center">Uzak Stok (Mağaza)</th>
                                <th className="px-6 py-4 font-bold">Durum</th>
                                <th className="px-6 py-4 font-bold text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {results.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{item.sku}</div>
                                        <div className="text-xs text-slate-500">{item.name}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold flex items-center gap-2 mt-2">
                                        <Store className="w-4 h-4 text-slate-400" /> {item.marketplace}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-bold text-slate-700 dark:text-slate-300">
                                            <Database className="w-3 h-3 text-slate-400" /> {item.localStock}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-bold \${
                                            item.status === 'critical' ? 'bg-red-500/10 text-red-500' :
                                            item.status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-emerald-500/10 text-emerald-500'
                                        }\`}>
                                            <Store className="w-3 h-3 opacity-50" /> {item.marketStock}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status === 'synced' && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500"><CheckCircle2 className="w-4 h-4" /> Senkron</span>}
                                        {item.status === 'warning' && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500"><AlertTriangle className="w-4 h-4" /> 1 Stok Fark</span>}
                                        {item.status === 'critical' && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500"><XCircle className="w-4 h-4" /> Tehlikeli Hata</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.status !== 'synced' ? (
                                            <button 
                                                onClick={() => handleSyncSpecific(item.id)}
                                                className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-primary/10 hover:text-primary transition-colors hover:border-primary/20"
                                            >
                                                Sistemi Eşitle
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">Güncel</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    );
}
