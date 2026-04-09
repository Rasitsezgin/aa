"use client";

import React, { useState } from 'react';
import { 
    Undo2, ScanLine, Box, ArrowUpCircle, AlertTriangle, 
    CheckCircle2, Search, PackageOpen, Truck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockReturns = [
    { id: 'RT-142', order: 'TY-92144', sku: 'TSH-WHT-M', status: 'pending', date: 'Bugün 14:30', marketplace: 'Trendyol', reason: 'Beden Uymadı' },
    { id: 'RT-141', order: 'HB-11002', sku: 'SNK-BLK-42', status: 'restocked', date: 'Bugün 11:15', marketplace: 'Hepsiburada', reason: 'Vazgeçildi' },
    { id: 'RT-140', order: 'AMZ-551', sku: 'MUG-RED-01', status: 'restocked', date: 'Dün', marketplace: 'Amazon', reason: 'Hasarlı Kutu (Stok Artırımı İptal)' }
];

export default function ReturnsManagementPage() {
    const [barcode, setBarcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<null | 'success' | 'not_found'>(null);

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        if(!barcode) return;
        setIsScanning(true);
        setScanResult(null);
        
        // Simüle edilmiş sorgu süresi
        setTimeout(() => {
            setIsScanning(false);
            if(barcode.includes('RT')) {
                setScanResult('success');
            } else {
                setScanResult('not_found');
            }
            setBarcode(''); // input'u temizle
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Undo2 className="w-8 h-8 text-orange-500" />
                        Gelişmiş İade & Stok Yönetimi
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Pazaryerlerinden dönen iade kargolarınızın barkodunu okutun. Sistem sağlam iadeleri tespit edip stokları her platformda otomatik arttırsın.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Scanner UI */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface border border-border rounded-[2rem] p-6 lg:p-8 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4">
                                <ScanLine className={\`w-8 h-8 text-slate-500 \${isScanning ? 'animate-pulse text-orange-500' : ''}\`} />
                            </div>
                            <h2 className="text-xl font-bold">Kargo Barkodu Okutun</h2>
                            <p className="text-xs text-slate-500 mt-2">Barkod okuyucunuzla kargo poşetindeki iade onay kodunu tarayın.</p>
                        </div>

                        <form onSubmit={handleScan} className="relative mb-6">
                            <input 
                                type="text"
                                autoFocus
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Barkod veya İade Kodu..."
                                className="w-full bg-slate-50 dark:bg-background border-2 border-border rounded-xl px-4 py-4 font-mono text-center text-lg focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <button type="submit" className="hidden">Tara</button>
                        </form>

                        <AnimatePresence>
                            {scanResult === 'success' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">İade Eşleşti & Stok Arttırıldı</div>
                                        <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">TY-92144 nolu sipariş için 1 adet stok Trendyol ve Hepsiburada'ya geri gönderildi.</div>
                                    </div>
                                </motion.div>
                            )}
                            {scanResult === 'not_found' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-bold text-red-600 dark:text-red-400">Barkod Bulunamadı</div>
                                        <div className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Bu kargo takip numarasına ait bir iade talebi bulunamadı. Lütfen kargo firmasıyla teyit edin.</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
                            <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">12</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bekleyen İade</div>
                        </div>
                        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
                            <div className="text-2xl font-black text-emerald-500 mb-1">145</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geri Kazanılan Stok</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Log Data */}
                <div className="lg:col-span-8">
                    <div className="bg-surface border border-border rounded-[2rem] overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                Gelen İade Beklemeleri
                            </h3>
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-orange-500/50"
                                    placeholder="Sipariş no ara..."
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto p-0">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                        <th className="px-6 py-4 border-b border-border">Sipariş / Ürün</th>
                                        <th className="px-6 py-4 border-b border-border">İade Sebebi</th>
                                        <th className="px-6 py-4 border-b border-border text-center">Durum</th>
                                        <th className="px-6 py-4 border-b border-border text-right">Manuel Aksiyon</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {mockReturns.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {item.order}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-1">
                                                    <Box className="w-3 h-3" /> {item.sku}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.reason}</div>
                                                <div className="text-xs text-slate-400 mt-1">{item.marketplace}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.status === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold">
                                                        <Truck className="w-3 h-3" /> Kargo Bekleniyor
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">
                                                        <CheckCircle2 className="w-3 h-3" /> Stoklara Eklendi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.status === 'pending' && (
                                                    <button className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 transition-colors flex items-center gap-2 ml-auto">
                                                        <ArrowUpCircle className="w-4 h-4" /> Elle Kurtar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
