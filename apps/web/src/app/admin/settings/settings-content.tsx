"use client";

import React, { useState } from 'react';
import { Settings, Globe, Shield, Mail, Bell, Key, Save, Server, ToggleLeft, ToggleRight } from 'lucide-react';
// import TwoFactorSettings from './security/two-factor-settings';

export default function SettingsContent({
    userTwoFactorEnabled
}: {
    userTwoFactorEnabled: boolean
}) {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'Genel', icon: Globe },
        { id: 'integrations', label: 'Entegrasyonlar', icon: Key },
        { id: 'email', label: 'E-posta & SMTP', icon: Mail },
        { id: 'security', label: 'Güvenlik & Bakım', icon: Shield },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Sistem Ayarları</h1>
                    <p className="text-slate-500 font-medium">Platformun temel yapılandırmasını yönetin.</p>
                </div>
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2">
                    <Save size={18} /> Değişiklikleri Kaydet
                </button>
            </div>

            {/* Content Wrapper with Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">

                    {activeTab === 'general' && (
                        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-8">
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">Genel Ayarlar</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Site Başlığı</label>
                                    <input type="text" defaultValue="Pazaryonetimi | E-ticaret Paneli" className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Destek E-postası</label>
                                    <input type="email" defaultValue="destek@pazaryonetimi.com" className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                                </div>
                                <div className="col-span-full space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Site Açıklaması (Meta Description)</label>
                                    <textarea rows={3} defaultValue="Türkiye'nin lider pazaryeri entegrasyon sistemi." className="w-full p-4 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-foreground text-sm font-medium outline-none focus:border-blue-500/50 resize-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-8">
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">API Entegrasyonları</h3>

                            {[
                                { name: "OpenAI API", icon: Key, placeholder: "sk-proj-...", connected: true },
                                { name: "Stripe Payment", icon: CreditCard, placeholder: "pk_live_...", connected: true },
                                { name: "Trendyol API", icon: Globe, placeholder: "Mağaza ID...", connected: false },
                            ].map((api, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-end p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                    <div className="flex-1 w-full space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                <api.icon size={12} /> {api.name}
                                            </label>
                                            {api.connected && <span className="text-[10px] font-black text-green-500 uppercase bg-green-500/10 px-2 py-0.5 rounded">Bağlı</span>}
                                        </div>
                                        <div className="relative">
                                            <input type="password" defaultValue="************************" className={`w-full h-12 bg-slate-100 dark:bg-black/20 border ${api.connected ? 'border-green-500/30' : 'border-slate-200 dark:border-white/10'} rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50 tracking-widest`} />
                                        </div>
                                    </div>
                                    <button className="h-12 px-6 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl font-bold text-sm text-foreground border border-slate-200 dark:border-white/10 transition-colors">
                                        Yenile
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-8">
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">SMTP Yapılandırması</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">SMTP Host</label>
                                    <input type="text" defaultValue="smtp.sendgrid.net" className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Port</label>
                                    <input type="text" defaultValue="587" className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-8">
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">Güvenlik ve Bakım</h3>

                            <div className="space-y-4">
                                {/* <TwoFactorSettings defaultEnabled={userTwoFactorEnabled} /> */}

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-500/20 text-red-500 rounded-xl">
                                            <Server size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">Bakım Modu</h4>
                                            <p className="text-xs text-slate-500 font-medium">Siteyi ziyaretçilere kapatır ve bakım sayfasını gösterir.</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-500 hover:text-foreground transition-colors">
                                        <ToggleLeft size={32} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CreditCard(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    )
}
