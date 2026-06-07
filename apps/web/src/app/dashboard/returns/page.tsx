"use client";

import React, { useState, useEffect } from 'react';
import { 
    Undo2, ScanLine, Box, ArrowUpCircle, AlertTriangle, 
    CheckCircle2, Search, PackageOpen, Truck, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReturns, processReturnScan } from '../../actions/returns';
import { useTenantId } from '@/lib/tenant';

export default function ReturnsManagementPage() {
    const tenantId = useTenantId();
    const [barcode, setBarcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [scanResult, setScanResult] = useState<null | 'success' | 'not_found' | 'already_processed'>(null);
    const [returns, setReturns] = useState<any[]>([]);
    
    // Stats
    const pendingCount = returns.filter(r => r.status === 'PENDING').length;
    const completedCount = returns.filter(r => r.status === 'COMPLETED' || r.status === 'REFUNDED').length;

    useEffect(() => {
        if (tenantId) fetchData();
        else setIsLoading(false);
    }, [tenantId]);

    const fetchData = async () => {
        if (!tenantId) return;
        setIsLoading(true);
        const data = await getReturns(tenantId);
        setReturns(data);
        setIsLoading(false);
    };

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!barcode.trim()) return;
        
        setIsScanning(true);
        setScanResult(null);
        
        if (!tenantId) return;
        const response = await processReturnScan(tenantId, barcode.trim());
        
        setIsScanning(false);
        if (response.success) {
            setScanResult('success');
            fetchData();
        } else {
            setScanResult(response.error as any);
        }
        setBarcode('');
    };

    const handleManualProcess = async (id: string) => {
        setIsScanning(true);
        if (!tenantId) return;
        const response = await processReturnScan(tenantId, id);
        setIsScanning(false);
        if(response.success) {
            fetchData();
        }
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
                        Pazaryerlerinden dönen iadelerin barkodunu okutarak Prisma DB üzerinden onaylayın ve stokları anında eski haline getirin.
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
                                <ScanLine className={`w-8 h-8 text-slate-500 ${isScanning ? 'animate-pulse text-orange-500' : ''}`} />
                            </div>
                            <h2 className="text-xl font-bold">Kargo Barkodu Okutun</h2>
                            <p className="text-xs text-slate-500 mt-2">Takip numarası veya Sipariş No taratın.</p>
                        </div>

                        <form onSubmit={handleScan} className="relative mb-6">
                            <input 
                                type="text"
                                autoFocus
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Barkod veya İade Kodu..."
                                disabled={isScanning}
                                className="w-full bg-slate-50 dark:bg-background border-2 border-border rounded-xl px-4 py-4 font-mono text-center text-lg focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                            />
                            <button type="submit" className="hidden">Tara</button>
                        </form>

                        <AnimatePresence>
                            {scanResult === 'success' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">İade Eşleşti & Stok İşlendi</div>
                                        <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Veritabanına iade onaylandı bilgisi düşüldü.</div>
                                    </div>
                                </motion.div>
                            )}
                            {scanResult === 'not_found' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-bold text-red-600 dark:text-red-400">Kayıt Bulunamadı</div>
                                        <div className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Sistemde bu koda ait bir iade işlemi bulunamadı.</div>
                                    </div>
                                </motion.div>
                            )}
                            {scanResult === 'already_processed' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">Zaten Onaylanmış</div>
                                        <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Bu ürün iadesi zaten sisteme başarılı girilmiştir.</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
                            <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                {isLoading ? '-' : pendingCount}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bekleyen İade</div>
                        </div>
                        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
                            <div className="text-2xl font-black text-emerald-500 mb-1">
                                {isLoading ? '-' : completedCount}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geri Kazanılan Stok</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Log Data */}
                <div className="lg:col-span-8">
                    <div className="bg-surface border border-border rounded-[2rem] overflow-hidden flex flex-col h-full min-h-[400px]">
                        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                Gelen İade Beklemeleri (Prisma DB)
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
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                                    Veritabanından İadeler Çekiliyor...
                                </div>
                            ) : returns.length === 0 ? (
                                <div className="text-center py-20 text-slate-500">
                                    <PackageOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="font-bold">Henüz kaydedilmiş bir iade yok.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                            <th className="px-6 py-4 border-b border-border">Sipariş (ID)</th>
                                            <th className="px-6 py-4 border-b border-border">İade Sebebi</th>
                                            <th className="px-6 py-4 border-b border-border text-center">Durum</th>
                                            <th className="px-6 py-4 border-b border-border text-right">Manuel Aksiyon</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {returns.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        {item.orderId}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-1">
                                                        <Box className="w-3 h-3" /> Trk: {item.trackingNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.reason}</div>
                                                    <div className="text-xs text-slate-400 mt-1">{item.marketplace} ({item.date})</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.status === 'PENDING' ? (
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
                                                    {item.status === 'PENDING' && (
                                                        <button disabled={isScanning} onClick={() => handleManualProcess(item.id)} className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 transition-colors flex items-center gap-2 ml-auto disabled:opacity-50">
                                                            <ArrowUpCircle className="w-4 h-4" /> Elle Kurtar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
