"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    MessageCircle, Settings, Send, CheckCircle2, XCircle,
    Eye, Phone, Bell, Zap, Shield, Clock, ChevronRight,
    AlertCircle, Loader2, MessageSquare, BarChart3,
    Smartphone, QrCode, Plus, RefreshCw, Smartphone as MobileIcon,
    ShieldCheck, ShoppingCart, UserCheck, Search, Filter,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';

import { useWhatsAppData, Message as WhatsAppMessage, Template as WhatsAppTemplate, WhatsAppStats, WhatsAppData } from '@/lib/hooks';

const notificationOptions = [
    { key: 'orderConfirmation', label: 'Sipariş Onayı', desc: 'Yeni sipariş alındığında müşteriye bildirim', icon: CheckCircle2 },
    { key: 'shippingUpdate', label: 'Kargo Güncelleme', desc: 'Kargo durumu değiştiğinde müşteriye bildirim', icon: Send },
    { key: 'deliveryConfirmation', label: 'Teslimat Onayı', desc: 'Ürün teslim edildiğinde müşteriye bildirim', icon: CheckCircle2 },
    { key: 'abandonedCart', label: 'Terk Edilmiş Sepet', desc: 'Sepette ürün bırakanlara hatırlatma', icon: ShoppingCart },
    { key: 'lowStock', label: 'Düşük Stok Uyarısı', desc: 'Stok kritik seviyeye düşünce bildirim', icon: AlertCircle },
];



export default function WhatsAppPage() {
    const { data: whatsappData, loading: isLoading } = useWhatsAppData();
    const [activeTab, setActiveTab] = useState<'engagement' | 'settings' | 'templates'>('engagement');
    const [enabled, setEnabled] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    const messages = whatsappData?.messages || [];
    const stats = whatsappData?.stats || { sent: 0, readRate: 0, conversion: 0, avgResponse: 0 };
    const templates = whatsappData?.templates || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-emerald-500" /> WhatsApp Ticaret
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Satışlarınızı artırmak için WhatsApp Business API gücünü kullanın</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80">
                        <Settings size={16} /> API Yapılandırma
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20">
                        <Plus size={18} /> Yeni Otomasyon
                    </button>
                </div>
            </div>

            {/* Connection Status Detail */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg border border-emerald-500/20 relative group">
                        <QrCode size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-foreground">WhatsApp Business API Bağlı</h3>
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-sm">AKTİF</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Bağlı Numara: +90 532 *** ** 00 • Entegrasyon: Meta Official</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-initial px-4 py-2 bg-white dark:bg-slate-800 border border-border rounded-xl text-xs font-bold text-foreground hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <RefreshCw size={14} className={isSyncing || isLoading ? 'animate-spin' : ''} /> Bağlantıyı Kontrol Et
                    </button>
                </div>
            </div>

            {/* Stats Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Gönderilen Mesaj', value: stats.sent.toLocaleString(), icon: Send, color: 'text-blue-500', trend: '+12%' },
                    { label: 'Okunma Oranı', value: `%${stats.readRate}`, icon: ShieldCheck, color: 'text-emerald-500', trend: '+2%' },
                    { label: 'Sepet Dönüşümü', value: `₺${stats.conversion.toLocaleString()}`, icon: ShoppingCart, color: 'text-orange-500', trend: '+15%' },
                    { label: 'Yanıt Süresi', value: `${stats.avgResponse} dk`, icon: Clock, color: 'text-purple-500', trend: '-10%' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-surface border border-border rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between mb-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <stat.icon size={14} className={stat.color} /> {stat.label}
                            </div>
                            <span className={stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-blue-500'}>{stat.trend}</span>
                        </div>
                        <div className="text-2xl font-black text-foreground">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* View Switcher Tabs */}
            <div className="flex gap-1 bg-background p-1 rounded-xl border border-border w-fit">
                {[
                    { key: 'engagement' as const, label: 'Etkileşim Akışı', icon: MessageSquare },
                    { key: 'templates' as const, label: 'Otomasyonlar', icon: Zap },
                    { key: 'settings' as const, label: 'Ayarlar', icon: Settings },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-foreground'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Contextual Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4 shadow-sm">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Popüler Şablonlar</h3>
                        <div className="space-y-3">
                            {templates.map((tmpl) => (
                                <div key={tmpl.name} className="p-3 bg-background rounded-xl border border-border flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
                                    <div>
                                        <div className="text-sm font-bold text-foreground">{tmpl.name}</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase">{tmpl.count} kullanım</div>
                                    </div>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${tmpl.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {tmpl.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 opacity-10">
                            <MobileIcon size={120} />
                        </div>
                        <h4 className="text-lg font-black mb-2 relative z-10">Mobil Uygulama</h4>
                        <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-4 relative z-10">
                            Müşteri sorularını yoldayken bile saniyeler içinde yanıtlayın. Bildirimleri asla kaçırmayın.
                        </p>
                        <div className="flex gap-2 relative z-10 transition-transform active:scale-95">
                            <Image
                                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                className="h-8 w-auto"
                                alt="App Store"
                                width={120}
                                height={32}
                                unoptimized
                            />
                            <Image
                                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                className="h-8 w-auto"
                                alt="Play Store"
                                width={120}
                                height={32}
                                unoptimized
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Active View */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'engagement' && (
                            <motion.div
                                key="engagement"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm"
                            >
                                <div className="p-5 border-b border-border bg-background/30 flex items-center justify-between">
                                    <h3 className="font-bold text-foreground flex items-center gap-2">
                                        <MessageSquare size={18} className="text-emerald-500" /> Son Etkileşimler
                                    </h3>
                                    <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">Tümünü Gör</button>
                                </div>
                                <div className="divide-y divide-border">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className="p-5 hover:bg-background/20 transition-all flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 shrink-0 border border-border">
                                                {msg.customer[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-bold text-foreground">{msg.customer}</h4>
                                                    <span className="text-[10px] text-slate-400 font-bold">{msg.time}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium truncate mb-2">{msg.message}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${msg.status === 'delivered' || msg.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'}`}>
                                                        {msg.status}
                                                    </span>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{msg.type.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-300 mt-2" />
                                        </div>
                                    ))}
                                    {messages.length === 0 && !isLoading && (
                                        <div className="p-10 text-center text-slate-500">
                                            Henüz bir etkileşim bulunmuyor.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'templates' && (
                            <motion.div
                                key="templates"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {notificationOptions.map((opt) => (
                                    <div key={opt.key} className="bg-surface rounded-2xl p-5 border border-border flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                <opt.icon size={22} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground">{opt.label}</h4>
                                                <p className="text-xs text-slate-500">{opt.desc}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button className="text-[10px] font-black text-slate-400 hover:text-foreground uppercase tracking-widest">Düzenle</button>
                                            <div className="w-10 h-5 bg-emerald-500 rounded-full relative shadow-inner">
                                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-surface rounded-2xl border border-border p-6 space-y-6"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <Shield size={20} className="text-emerald-500" /> Güvenlik & API Yapılandırması
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Access Token</label>
                                            <input type="password" value="********************************" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" readOnly />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Phone Number ID</label>
                                                <input type="text" value="10544258963214" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" readOnly />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">WhatsApp Account ID</label>
                                                <input type="text" value="9856423214589" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" readOnly />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                            WhatsApp Business API verileriniz uçtan uca şifrelenir. Pazaryönetimi, Meta yetkili entegrasyon ortağıdır.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
