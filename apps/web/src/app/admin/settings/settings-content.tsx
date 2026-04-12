"use client";

import React, { useState, useActionState } from 'react';
import { Settings, Globe, Shield, Mail, Bell, Key, Save, Server, ToggleLeft, ToggleRight, Smartphone, Wifi, WifiOff, Download } from 'lucide-react';
import { updatePwaSettings } from '@/actions/pwa-settings';
// import TwoFactorSettings from './security/two-factor-settings';

export interface PwaSettings {
    pwa_enabled?: boolean;
    pwa_install_prompt_enabled?: boolean;
    pwa_offline_enabled?: boolean;
    pwa_push_notifications_enabled?: boolean;
    pwa_app_name?: string;
    pwa_short_name?: string;
    pwa_description?: string;
    pwa_theme_color?: string;
    pwa_bg_color?: string;
    pwa_display?: 'standalone' | 'fullscreen' | 'minimal-ui';
    pwa_start_url?: string;
    pwa_install_prompt_delay?: number;
}

export default function SettingsContent({
    userTwoFactorEnabled,
    pwaSettings = {}
}: {
    userTwoFactorEnabled: boolean;
    pwaSettings?: PwaSettings;
}) {
    const [activeTab, setActiveTab] = useState('general');
    const [pwaState, pwaAction, pwaPending] = useActionState(updatePwaSettings, null);

    // PWA toggle states
    const [pwaEnabled, setPwaEnabled] = useState(pwaSettings.pwa_enabled ?? true);
    const [installPromptEnabled, setInstallPromptEnabled] = useState(pwaSettings.pwa_install_prompt_enabled ?? true);
    const [offlineEnabled, setOfflineEnabled] = useState(pwaSettings.pwa_offline_enabled ?? true);
    const [pushEnabled, setPushEnabled] = useState(pwaSettings.pwa_push_notifications_enabled ?? false);

    const tabs = [
        { id: 'general', label: 'Genel', icon: Globe },
        { id: 'pwa', label: 'PWA / Uygulama', icon: Smartphone },
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

                    {activeTab === 'pwa' && (
                        <form action={pwaAction}>
                            <div className="space-y-6">
                                {/* PWA Durum Kartı */}
                                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
                                        <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">PWA Ayarları</h3>
                                        <button
                                            type="submit"
                                            disabled={pwaPending}
                                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-60"
                                        >
                                            {pwaPending ? (
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {pwaPending ? 'Kaydediliyor...' : 'Kaydet'}
                                        </button>
                                    </div>

                                    {pwaState && (
                                        <div className={`p-4 rounded-2xl text-sm font-bold ${pwaState.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                                            {pwaState.message}
                                        </div>
                                    )}

                                    {/* Ana PWA Switch */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/20 text-blue-600 rounded-xl">
                                                <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground">PWA (Progressive Web App)</h4>
                                                <p className="text-xs text-slate-500 font-medium">Uygulamanın ana ekrana yüklenebilmesini ve offline çalışmasını aktif eder.</p>
                                            </div>
                                        </div>
                                        <input type="hidden" name="pwa_enabled" value={pwaEnabled ? 'on' : 'off'} />
                                        <button type="button" onClick={() => setPwaEnabled(!pwaEnabled)} className={`transition-colors ${pwaEnabled ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {pwaEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Uygulama Bilgileri */}
                                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-6">
                                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">Uygulama Bilgileri</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Uygulama Adı</label>
                                            <input
                                                type="text"
                                                name="pwa_app_name"
                                                defaultValue={pwaSettings.pwa_app_name || 'PazarYonetimi - E-ticaret Yönetim Platformu'}
                                                className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Kısa Ad</label>
                                            <input
                                                type="text"
                                                name="pwa_short_name"
                                                defaultValue={pwaSettings.pwa_short_name || 'PazarYonetimi'}
                                                className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div className="col-span-full space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Uygulama Açıklaması</label>
                                            <textarea
                                                name="pwa_description"
                                                rows={2}
                                                defaultValue={pwaSettings.pwa_description || 'Tüm pazaryerlerinizi tek platformdan yönetin. Trendyol, Hepsiburada, Amazon, N11 entegrasyonları.'}
                                                className="w-full p-4 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-foreground text-sm font-medium outline-none focus:border-blue-500/50 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Görünüm Ayarları */}
                                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-6">
                                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">Görünüm & Davranış</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Tema Rengi</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    name="pwa_theme_color"
                                                    defaultValue={pwaSettings.pwa_theme_color || '#2563eb'}
                                                    className="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    readOnly
                                                    defaultValue={pwaSettings.pwa_theme_color || '#2563eb'}
                                                    className="flex-1 h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-mono font-bold outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Arka Plan Rengi</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    name="pwa_bg_color"
                                                    defaultValue={pwaSettings.pwa_bg_color || '#ffffff'}
                                                    className="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    readOnly
                                                    defaultValue={pwaSettings.pwa_bg_color || '#ffffff'}
                                                    className="flex-1 h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-mono font-bold outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Görüntüleme Modu</label>
                                            <select
                                                name="pwa_display"
                                                defaultValue={pwaSettings.pwa_display || 'standalone'}
                                                className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50"
                                            >
                                                <option value="standalone">Bağımsız Uygulama (Standalone)</option>
                                                <option value="fullscreen">Tam Ekran (Fullscreen)</option>
                                                <option value="minimal-ui">Minimal Arayüz (Minimal UI)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Başlangıç URL</label>
                                            <input
                                                type="text"
                                                name="pwa_start_url"
                                                defaultValue={pwaSettings.pwa_start_url || '/dashboard'}
                                                className="w-full h-12 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Özellikler */}
                                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-4">
                                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">Özellikler</h3>

                                    {/* Yükleme Promptu */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-green-500/20 text-green-600 rounded-xl">
                                                <Download size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground">Yükleme Bildirimi</h4>
                                                <p className="text-xs text-slate-500 font-medium">&quot;Uygulamayı Yükle&quot; pop-up&apos;ını kullanıcılara göster.</p>
                                            </div>
                                        </div>
                                        <input type="hidden" name="pwa_install_prompt_enabled" value={installPromptEnabled ? 'on' : 'off'} />
                                        <button type="button" onClick={() => setInstallPromptEnabled(!installPromptEnabled)} className={`transition-colors ${installPromptEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                                            {installPromptEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>

                                    {installPromptEnabled && (
                                        <div className="ml-16 space-y-2">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Gecikme (saniye)</label>
                                            <input
                                                type="number"
                                                name="pwa_install_prompt_delay"
                                                min="0"
                                                max="300"
                                                defaultValue={pwaSettings.pwa_install_prompt_delay || 0}
                                                className="w-32 h-10 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-foreground font-bold outline-none focus:border-blue-500/50 text-sm"
                                            />
                                            <p className="text-[10px] text-slate-400 font-medium">Sayfa yüklenmesinden sonra yükleme bildiriminin gösterilme gecikmesi.</p>
                                        </div>
                                    )}

                                    {/* Offline Modu */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-orange-500/20 text-orange-600 rounded-xl">
                                                <WifiOff size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground">Offline Çalışma</h4>
                                                <p className="text-xs text-slate-500 font-medium">İnternet bağlantısı olmadan temel özelliklerin çalışmasını sağlar.</p>
                                            </div>
                                        </div>
                                        <input type="hidden" name="pwa_offline_enabled" value={offlineEnabled ? 'on' : 'off'} />
                                        <button type="button" onClick={() => setOfflineEnabled(!offlineEnabled)} className={`transition-colors ${offlineEnabled ? 'text-orange-600' : 'text-slate-400'}`}>
                                            {offlineEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>

                                    {/* Push Bildirimleri */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-purple-500/20 text-purple-600 rounded-xl">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-foreground">Push Bildirimleri</h4>
                                                <p className="text-xs text-slate-500 font-medium">Sipariş, stok ve önemli uyarılar için push bildirimleri gönder.</p>
                                            </div>
                                        </div>
                                        <input type="hidden" name="pwa_push_notifications_enabled" value={pushEnabled ? 'on' : 'off'} />
                                        <button type="button" onClick={() => setPushEnabled(!pushEnabled)} className={`transition-colors ${pushEnabled ? 'text-purple-600' : 'text-slate-400'}`}>
                                            {pushEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Önizleme */}
                                <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-200 dark:border-white/5 space-y-6">
                                    <h3 className="text-lg font-bold text-foreground uppercase tracking-wider border-b border-slate-200 dark:border-white/5 pb-4">Önizleme</h3>

                                    <div className="flex items-center gap-6">
                                        {/* Ikon Önizleme */}
                                        <div className="text-center space-y-2">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-xl shadow-blue-900/30 mx-auto">
                                                <span className="text-white text-xl font-black">PZ</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-500">Ana Ekran İkonu</p>
                                        </div>

                                        {/* Yükleme Kartı Önizleme */}
                                        <div className="flex-1 max-w-sm">
                                            <div className="bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white text-sm font-black">PZ</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-bold text-foreground">Uygulamayı Yükle</p>
                                                        <p className="text-[10px] text-slate-500 mt-0.5">Ana ekranınıza ekleyin</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg">Yükle</span>
                                                            <span className="px-3 py-1 text-slate-500 text-[10px] font-medium">Daha sonra</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 text-center mt-2">Yükleme Bildirimi Önizleme</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
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

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
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
