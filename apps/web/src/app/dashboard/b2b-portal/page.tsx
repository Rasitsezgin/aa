"use client";

import React, { useState, useEffect } from 'react';
import { 
    Users, Link as LinkIcon, Building2, Store, CreditCard,
    ArrowUpRight, Share2, Search, PlusCircle, CheckCircle2, RefreshCw, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubDealers, createSubDealer, deleteSubDealer } from '../../actions/b2b-portal';

const DEMO_TENANT_ID = 'demo-tenant-123';

export default function B2BPortalPage() {
    const [subStoreLink] = useState('https://b2b.pazaryonetimi.com/m/SizinMagazaniz');
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [dealers, setDealers] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    // Form
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');

    useEffect(() => {
        fetchDealers();
    }, []);

    const fetchDealers = async () => {
        setIsLoading(true);
        const data = await getSubDealers(DEMO_TENANT_ID);
        setDealers(data.dealers);
        setGroups(data.groups);
        if (data.groups.length > 0) setSelectedGroupId(data.groups[0].id);
        setIsLoading(false);
    };

    const handleCreateDealer = async () => {
        if (!companyName || !email || !selectedGroupId) return;
        setIsPosting(true);
        const res = await createSubDealer(DEMO_TENANT_ID, companyName, email, selectedGroupId);
        if (res.success) {
            setCompanyName('');
            setEmail('');
            setIsModalOpen(false);
            fetchDealers();
        }
        setIsPosting(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bayiyi tamamen kaldırmak istediğinize emin misiniz?")) return;
        await deleteSubDealer(id);
        fetchDealers();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(subStoreLink);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-500" />
                        B2B Bayi Portalı (Veritabanı)
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Toptan satış ağınızı kurun. Alt bayilerinize özel indirim grupları tanımlayın ve Prisma veritabanında yönetin.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Yeni Bayi Ekle
                    </button>
                    <Link href="/dashboard/settings" className="px-4 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-surface transition-colors">
                        Ayarlar
                    </Link>
                </div>
            </div>

            {/* Sub-Dealer Magic Link */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                <Store className="w-64 h-64 absolute -right-10 -bottom-20 opacity-10" />
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-4">
                        <LinkIcon className="w-4 h-4" /> Müşterilere Gönderilecek Link
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black mb-2">B2B Mağazanız Yayında!</h2>
                    <p className="text-indigo-100 mb-6 font-medium leading-relaxed">
                        Bayileriniz bu link üzerinden kendi hesabı ile girdiğinde iskonto oranını hesaba katarak toptan fiyatları görürler.
                    </p>
                    
                    <div className="flex max-w-md bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-1 items-center">
                        <div className="px-4 text-white/90 font-mono text-sm truncate flex-1 select-all">
                            {subStoreLink}
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="w-24 px-4 py-3 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isLinkCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                            {isLinkCopied ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                    </div>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl w-full md:w-72 shrink-0">
                    <div className="text-sm font-bold text-indigo-100 mb-2 uppercase tracking-widest text-center">Bu Ayki B2B Cironuz</div>
                    <div className="text-4xl font-black text-white text-center mb-1">₺240.500</div>
                    <div className="text-xs text-indigo-200 text-center flex items-center justify-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-300" /> +%12 (Geçen Aya Göre)
                    </div>
                </div>
            </div>

            {/* Dealers List */}
            <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Kayıtlı Bayileriniz (Prisma API) <span className="px-2 py-0.5 bg-border rounded-full text-xs text-slate-500">{dealers.length}</span>
                    </h3>
                </div>

                <div className="overflow-x-auto min-h-[250px]">
                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-[200px] text-slate-500">
                            <RefreshCw className="w-6 h-6 animate-spin mb-4" />
                            Veritabanından Çekiliyor...
                        </div>
                    ) : dealers.length === 0 ? (
                        <div className="text-center py-10 opacity-60">Sisteme henüz bayi eklemediniz.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <th className="px-6 py-4 border-b border-border">Firma Detayı</th>
                                    <th className="px-6 py-4 border-b border-border">Bayi Grubu / İskonto</th>
                                    <th className="px-6 py-4 border-b border-border">Sipariş / Ciro</th>
                                    <th className="px-6 py-4 border-b border-border text-center">Ödeme Yöntemi</th>
                                    <th className="px-6 py-4 border-b border-border text-right">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {dealers.map(dealer => (
                                    <tr key={dealer.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white text-base">{dealer.name}</div>
                                            <div className="text-sm text-slate-500 mt-0.5">{dealer.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1 ${
                                                dealer.group.includes('Platin') ? 'bg-purple-500/10 text-purple-600' : 
                                                dealer.group.includes('Gold') ? 'bg-amber-500/10 text-amber-600' : 
                                                'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}>
                                                {dealer.group}
                                            </div>
                                            <div className="text-xs font-bold text-slate-500">+% {Number(dealer.discount).toString()} Sabit İndirim</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{dealer.total}</div>
                                            <div className="text-xs text-slate-500">{dealer.orders} Başarılı Sipariş</div>
                                        </td>
                                        <td className="px-6 py-4 flex justify-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center" title="Kredi Kartı (Vpos)">
                                                <CreditCard className="w-4 h-4" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 border px-3 py-1.5 rounded-lg border-indigo-200">Düzenle</button>
                                                <button onClick={() => handleDelete(dealer.id)} className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border px-3 py-1.5 rounded-lg border-red-200 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Quick Pricing Mockup Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-surface relative z-10 w-full max-w-lg rounded-3xl p-8 border border-border shadow-2xl"
                        >
                            <h2 className="text-2xl font-black mb-6">Yeni Bayi Hesabı Oluştur</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Firma Ünvanı</label>
                                    <input value={companyName} onChange={e=>setCompanyName(e.target.value)} type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Giriş E-postası</label>
                                    <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Atanacak Bayi Grubu</label>
                                    <select value={selectedGroupId} onChange={e=>setSelectedGroupId(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name} (%{Number(g.discountRate).toString()} İskonto)</option>
                                        ))}
                                    </select>
                                </div>
                                <button onClick={handleCreateDealer} disabled={isPosting} className="w-full mt-4 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 flex items-center justify-center gap-2 transition-colors">
                                    {isPosting ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Değerleri Kaydet"}
                                </button>
                                <button onClick={() => setIsModalOpen(false)} className="w-full py-3 bg-transparent text-slate-500 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    Vazgeç Ekleme
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
