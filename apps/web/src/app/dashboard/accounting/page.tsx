"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Link as LinkIcon, RefreshCw, CheckCircle2, AlertTriangle,
    Database, Receipt, FileText, Settings, ShieldCheck,
    Cloud, ArrowRight, Activity, Clock
} from 'lucide-react';

const softwareList = [
    {
        id: 'parasut',
        name: 'Paraşüt',
        description: 'Bulut tabanlı ön muhasebe yazılımı',
        logo: 'https://www.parasut.com/assets/images/logo/brand/logo.svg',
        connected: true,
        lastSync: '10 dakika önce',
        status: 'active'
    },
    {
        id: 'logo',
        name: 'Logo GO',
        description: 'KOBİ’ler için ERP ve muhasebe yazılımı',
        logo: 'https://www.logo.com.tr/Assets/img/logo-dark-new.png',
        connected: false,
        status: 'disconnected'
    },
    {
        id: 'mikro',
        name: 'Mikro Yazılım',
        description: 'Kurumsal kaynak planlama ve muhasebe',
        connected: false,
        status: 'disconnected'
    },
    {
        id: 'izibiz',
        name: 'iZİBİZ',
        description: 'e-Dönüşüm ve özel entegratörlük',
        connected: false,
        status: 'disconnected'
    }
];

export default function AccountingIntegrationPage() {
    const [integrations, setIntegrations] = useState(softwareList);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsSyncing(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <LinkIcon className="w-8 h-8 text-blue-500" /> Muhasebe Entegrasyonu
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Sipariş verilerini muhasebe ve e-fatura sistemlerinize senkronize edin</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Senkronize Ediliyor...' : 'Tümünü Senkronize Et'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {integrations.map((app, i) => (
                    <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-surface rounded-2xl border p-6 flex flex-col justify-between transition-all ${app.connected ? 'border-primary/20 bg-primary/[0.02]' : 'border-border grayscale-[0.5] hover:grayscale-0'}`}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center p-3 shadow-sm border border-border">
                                    <div className="text-xs font-black text-slate-400">{app.name}</div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{app.name}</h3>
                                    <p className="text-sm text-slate-500">{app.description}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${app.connected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                {app.connected ? 'BAĞLI' : 'BAĞLI DEĞİL'}
                            </span>
                        </div>

                        {app.connected ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-background/50 rounded-xl border border-border/50">
                                        <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Fatura Durumu</div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                                            <CheckCircle2 size={14} className="text-emerald-500" /> Otomatik
                                        </div>
                                    </div>
                                    <div className="p-3 bg-background/50 rounded-xl border border-border/50">
                                        <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Son Sync</div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                                            <Clock size={14} className="text-blue-500" /> {app.lastSync}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="flex-1 py-2.5 bg-background border border-border rounded-xl text-xs font-bold text-foreground hover:bg-surface transition-all flex items-center justify-center gap-2">
                                        <Settings size={14} /> Yapılandır
                                    </button>
                                    <button className="flex-1 py-2.5 bg-background border border-border rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2">
                                        Bağlantıyı Kes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                                <Cloud className="w-4 h-4" /> Entegrasyonu Başlat
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Sync Logs */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between bg-background/30">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Senkronizasyon Akışı
                    </h3>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                        Tümünü Gör
                    </button>
                </div>
                <div className="divide-y divide-border">
                    {[
                        { time: '14:20', type: 'invoice', msg: 'Paraşüt: 12 adet fatura başarıyla aktarıldı', status: 'success' },
                        { time: '12:05', type: 'inventory', msg: 'Logo GO: Stok miktarları güncellendi (44 ürün)', status: 'success' },
                        { time: '10:15', type: 'error', msg: 'Zirve: API bağlantı hatası (Timeout)', status: 'error' },
                        { time: '09:00', type: 'sync', msg: 'Sistem: Günlük veriler hazırlandı', status: 'success' },
                    ].map((log, i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-background/20 transition-all">
                            <div className="text-xs font-bold text-slate-500 w-12">{log.time}</div>
                            <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'} shrink-0`} />
                            {log.type === 'invoice' ? <Receipt size={14} className="text-blue-400" /> : <Database size={14} className="text-indigo-400" />}
                            <div className="text-sm text-foreground flex-1 font-medium">{log.msg}</div>
                            <ArrowRight size={14} className="text-slate-300" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Note */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><ShieldCheck size={24} /></div>
                <div>
                    <h4 className="font-bold text-foreground">Güvenli Veri Aktarımı</h4>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                        Muhasebe verileriniz 256-bit AES şifreleme ve TLS 1.3 güvenlik protokolleri ile korunur. Pazaryönetimi, muhasebe şifrelerinizi asla saklamaz; güvenli API anahtarları kullanarak iletişim kurar.
                    </p>
                </div>
            </div>
        </div>
    );
}
