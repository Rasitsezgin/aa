"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Key, UploadCloud, Copy, Send, CheckCircle2,
    ShieldCheck, Smartphone, Mail, AlertTriangle, FileText, Search, PlusCircle, X
} from 'lucide-react';
import { getVaultPools, createVaultPool, addPinsToPool } from '../../actions/digital-vault';

// Note: In a real app, tenantId is fetched from session.
const DEMO_TENANT_ID = 'demo-tenant-123';

export default function DigitalVaultPage() {
    const [activeTab, setActiveTab] = useState<'pool' | 'logs'>('pool');
    const [isUploading, setIsUploading] = useState(false);
    const [pools, setPools] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal states
    const [isNewPoolModalOpen, setNewPoolModalOpen] = useState(false);
    const [newPoolTitle, setNewPoolTitle] = useState('');
    
    const [isAddPinsModalOpen, setAddPinsModalOpen] = useState(false);
    const [activePoolId, setActivePoolId] = useState('');
    const [pinCodes, setPinCodes] = useState('');

    useEffect(() => {
        fetchPools();
    }, []);

    const fetchPools = async () => {
        setIsLoading(true);
        const data = await getVaultPools(DEMO_TENANT_ID);
        setPools(data);
        setIsLoading(false);
    };

    const handleCreatePool = async () => {
        if (!newPoolTitle) return;
        const res = await createVaultPool(DEMO_TENANT_ID, newPoolTitle, 'Genel', 'Mail');
        if (res.success) {
            setNewPoolTitle('');
            setNewPoolModalOpen(false);
            fetchPools();
        }
    };

    const handleAddPins = async () => {
        if (!pinCodes || !activePoolId) return;
        setIsUploading(true);
        const codeArray = pinCodes.split('\n').map(c => c.trim()).filter(c => c.length > 0);
        
        const res = await addPinsToPool(activePoolId, codeArray);
        if (res.success) {
            setPinCodes('');
            setAddPinsModalOpen(false);
            fetchPools();
        }
        setIsUploading(false);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Key className="w-8 h-8 text-primary" />
                        Dijital Kasa (E-Pin & Lisans)
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Kargo operasyonu olmadan dijital kod ve lisanslarınızı Prisma DB'de AES ile saklayın, siparişte sunucuya iletin.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setNewPoolModalOpen(true)}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Yeni Havuz
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface border border-border rounded-[1.5rem] p-5 flex flex-col justify-center">
                    <div className="text-sm font-bold text-slate-500 mb-1">Kasada Saklanan Şifre</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {isLoading ? '...' : pools.reduce((acc, p) => acc + p.stock, 0)}
                    </div>
                </div>
                <div className="bg-surface border border-border rounded-[1.5rem] p-5 flex flex-col justify-center">
                    <div className="text-sm font-bold text-slate-500 mb-1">Aktif Havuz Sayısı</div>
                    <div className="text-3xl font-black text-emerald-500">{pools.length}</div>
                </div>
                <div className="bg-surface border border-border rounded-[1.5rem] p-5 flex flex-col justify-center">
                    <div className="text-sm font-bold text-slate-500 mb-1">Teslim Edilen (Bugün)</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">0</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] p-5 text-white flex flex-col justify-center relative overflow-hidden">
                    <ShieldCheck className="w-20 h-20 absolute -right-4 -top-4 opacity-10" />
                    <div className="text-sm font-bold text-white/70 mb-1">Veritabanı Motoru</div>
                    <div className="text-xl font-black">PostgreSQL (Prisma)</div>
                </div>
            </div>

            {/* Main Tabs UI */}
            <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
                <div className="flex border-b border-border">
                    <button onClick={() => setActiveTab('pool')} className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'pool' ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-slate-500'}`}>Aksiyon Havuzları (Gerçek Veri)</button>
                    <button onClick={() => setActiveTab('logs')} className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-slate-500'}`}>Teslimat Logları</button>
                </div>

                <div className="p-6 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'pool' && (
                            <motion.div key="pool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                {isLoading ? (
                                    <div className="text-center py-20 opacity-50"><RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" /> Veritabanından Yükleniyor...</div>
                                ) : pools.length === 0 ? (
                                    <div className="text-center py-10 opacity-60">Henüz veritabanında oluşturulmuş bir E-Pin havuzu yok.</div>
                                ) : pools.map(vault => (
                                    <div key={vault.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-border bg-background hover:border-primary/30 transition-all gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <Key className="w-6 h-6 text-slate-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-base leading-none mb-1">{vault.name}</h4>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1">
                                                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md">ID: {vault.id.split('-')[0]}</span>
                                                    <span>• Otomatik İletim: Aktif</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-center">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mevcut Stok</div>
                                                <div className={`font-black text-xl ${vault.stock === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {vault.stock} Adet
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => { setActivePoolId(vault.id); setAddPinsModalOpen(true); }}
                                                className="px-4 py-2 bg-slate-100 items-center gap-2 dark:bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition flex"
                                            >
                                                <UploadCloud className="w-4 h-4 inline-block" /> Toplu Kod (.TXT)
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        {activeTab === 'logs' && <div className="text-center py-10 opacity-60">Log kaydı bulunamadı. Aktif sipariş geldiğinde buraya düşecektir.</div>}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal: New Pool */}
            <AnimatePresence>
                {isNewPoolModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-surface w-full max-w-md p-6 rounded-3xl border border-border">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Yeni E-Pin Havuzu <Key className="w-5 h-5"/></h3>
                            <input 
                                value={newPoolTitle} onChange={(e) => setNewPoolTitle(e.target.value)}
                                placeholder="Örn: Steam 100TL Kodu" 
                                className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:border-primary mb-4"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setNewPoolModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold w-full">İptal</button>
                                <button onClick={handleCreatePool} className="px-4 py-2 bg-primary text-white rounded-xl font-bold w-full">Oluştur</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Add Pins Bulk */}
            <AnimatePresence>
                {isAddPinsModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-surface w-full max-w-lg p-6 rounded-3xl border border-border">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><UploadCloud /> Kod(Pin) Yükle</h3>
                            <p className="text-xs text-slate-500 mb-4">Her satıra bir kod gelecek şekilde yapıştırın.</p>
                            <textarea 
                                value={pinCodes} onChange={(e) => setPinCodes(e.target.value)}
                                rows={8}
                                placeholder="XXXX-XXXX-XXXX\nYYYY-YYYY-YYYY" 
                                className="w-full bg-background border border-border p-3 rounded-xl outline-none focus:border-primary mb-4 font-mono text-sm"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setAddPinsModalOpen(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold w-full">İptal</button>
                                <button onClick={handleAddPins} disabled={isUploading} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold w-full flex items-center justify-center gap-2">
                                    {isUploading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4" />}
                                    {isUploading ? 'Veritabanına Yazılıyor...' : 'Prisma DB Kaydet'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function RefreshCw(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
}
