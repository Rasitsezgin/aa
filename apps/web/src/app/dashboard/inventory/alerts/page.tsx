"use client";

import React, { useState } from 'react';
import { 
    BellRing, AlertTriangle, PlusCircle, Settings2,
    Mail, Smartphone, Search, Trash2, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockAlerts = [
    { id: 1, rule: 'Tişört Grubu (Tüm Bedenler)', condition: '< 5 Adet', channels: ['SMS', 'Mail'], status: 'active', lastTrigger: '2 Saat Önce' },
    { id: 2, rule: 'iPhone 15 Pro Kılıfları', condition: '< 10 Adet', channels: ['Mail'], status: 'active', lastTrigger: 'Hiç Tetiklenmedi' },
    { id: 3, rule: 'Tüm Elektronik Ürünler', condition: '< 2 Adet', channels: ['SMS'], status: 'paused', lastTrigger: '3 Gün Önce' }
];

export default function CriticalStockAlertsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <BellRing className="w-8 h-8 text-rose-500" />
                        Kritik Stok Alarm Merkezi
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Yok satan ürünlerinizi kaçırmayın. Belirlediğiniz stok seviyesinin altına düşen ürünleri anında SMS veya E-Posta ile size bildirelim.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
                >
                    <PlusCircle className="w-4 h-4" /> Yeni Alarm Kuralı
                </button>
            </div>

            {/* Quick Warning Banner */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30 animate-pulse">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-rose-600 dark:text-rose-400 text-lg">Şu an 4 ürününüz tükenmek üzere!</h3>
                        <p className="text-sm text-rose-600/80 dark:text-rose-400/80">Belirlediğiniz kurallara göre "Tişört Grubu" sınırın altında işlem görüyor.</p>
                    </div>
                </div>
                <button className="px-6 py-2 bg-white dark:bg-surface border border-border rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:shadow-md transition-all whitespace-nowrap">
                    Tükenenleri Listele
                </button>
            </div>

            {/* Rules List */}
            <div className="bg-surface border border-border rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        Aktif Alarm Kuralları
                    </h3>
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 ring-rose-500/50"
                            placeholder="Kural ara..."
                        />
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {mockAlerts.map(alert => (
                        <div key={alert.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-border bg-background hover:border-rose-500/30 transition-all gap-4">
                            <div className="flex items-center gap-4 w-full md:w-1/3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${alert.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                    <BellRing className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{alert.rule}</h4>
                                    <div className="text-xs font-bold text-rose-500 mt-1">Eşik: Stok {alert.condition}</div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-8 md:w-1/3">
                                <div className="flex gap-2">
                                    {alert.channels.map(ch => (
                                        <span key={ch} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {ch === 'SMS' ? <Smartphone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                                            {ch}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-xs text-slate-500">
                                    <span className="font-bold block text-slate-400">Son Tetiklenme</span>
                                    {alert.lastTrigger}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 shrink-0 md:w-1/4">
                                <label className="relative inline-flex items-center cursor-pointer mr-2">
                                    <input type="checkbox" className="sr-only peer" defaultChecked={alert.status === 'active'} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                </label>
                                <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-primary transition-colors">
                                    <Settings2 className="w-4 h-4" />
                                </button>
                                <button className="p-2.5 border border-border rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Rule Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-surface relative z-10 w-full max-w-lg rounded-3xl p-8 border border-border flex flex-col gap-6">
                            <h2 className="text-2xl font-black">Yeni Alarm Kuralı</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Kural Adı</label>
                                    <input type="text" placeholder="Örn: Yeni Sezon Ayakkabılar" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Stok Eşik Değeri</label>
                                    <div className="flex items-center gap-4">
                                        <select className="bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none text-sm w-32">
                                            <option>Küçüktür (&lt;)</option>
                                            <option>Eşittir (=)</option>
                                        </select>
                                        <input type="number" defaultValue="5" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Bildirim Kanalları</label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-rose-500 bg-rose-500/5 rounded-xl cursor-pointer">
                                            <input type="checkbox" defaultChecked className="hidden" />
                                            <Mail className="w-4 h-4 text-rose-500" />
                                            <span className="font-bold text-rose-600">E-Posta</span>
                                        </label>
                                        <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-border hover:border-slate-300 dark:hover:border-slate-700 rounded-xl cursor-pointer transition-colors">
                                            <input type="checkbox" className="hidden" />
                                            <Smartphone className="w-4 h-4 text-slate-500" />
                                            <span className="font-bold text-slate-600 dark:text-slate-300">SMS (0.1 Kredi)</span>
                                        </label>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold mt-2 hover:bg-rose-600 transition-colors">Kuralı Kaydet ve Başlat</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
