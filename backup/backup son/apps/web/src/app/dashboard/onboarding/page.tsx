"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, ArrowRight, ArrowLeft, Check, Store, Package,
    Globe, CreditCard, Bell, Users, Sparkles, ChevronRight, Truck
} from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Hoş Geldiniz', icon: Rocket, description: 'PazarYönetimi.com hesabınızı kuralım' },
    { id: 2, title: 'Mağaza Bilgileri', icon: Store, description: 'Mağazanız hakkında bilgi verin' },
    { id: 3, title: 'Platform Bağlantısı', icon: Globe, description: 'Pazaryeri hesaplarınızı bağlayın' },
    { id: 4, title: 'Servis Entegrasyonları', icon: Truck, description: 'Kargo, ödeme ve e-fatura servislerini yapılandırın' },
    { id: 5, title: 'Ürün İçe Aktarım', icon: Package, description: 'İlk ürünlerinizi ekleyin' },
    { id: 6, title: 'Bildirim Ayarları', icon: Bell, description: 'Bildirim tercihlerinizi belirleyin' },
    { id: 7, title: 'Hazırsınız!', icon: Sparkles, description: 'Her şey tamam, başlayalım' },
];

const platforms = [
    { id: 'trendyol', name: 'Trendyol', connected: false },
    { id: 'hepsiburada', name: 'Hepsiburada', connected: false },
    { id: 'amazon', name: 'Amazon', connected: false },
    { id: 'n11', name: 'N11', connected: false },
    { id: 'ciceksepeti', name: 'Çiçeksepeti', connected: false },
];

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [storeName, setStoreName] = useState('');
    const [storeCategory, setStoreCategory] = useState('');
    const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
    const [importMethod, setImportMethod] = useState<string>('');
    const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });

    const currentStep = STEPS.find(s => s.id === step)!;
    const Icon = currentStep.icon;
    const progress = ((step - 1) / (STEPS.length - 1)) * 100;

    const togglePlatform = (id: string) => {
        setConnectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const canNext = () => {
        if (step === 2) return storeName.length > 0;
        return true;
    };

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center animate-in fade-in duration-500">
            {/* Progress */}
            <div className="w-full max-w-2xl mb-8">
                <div className="flex items-center justify-between mb-3">
                    {STEPS.map(s => (
                        <div key={s.id} className={`flex items-center gap-1.5 ${s.id <= step ? 'text-indigo-400' : 'text-slate-600'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${s.id < step ? 'bg-indigo-600 border-indigo-600 text-white' : s.id === step ? 'border-indigo-500 text-indigo-400' : 'border-slate-700 text-slate-600'}`}>
                                {s.id < step ? <Check className="w-4 h-4" /> : s.id}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-1.5 bg-background rounded-full">
                    <motion.div className="h-full bg-indigo-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
            </div>

            {/* Card */}
            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                    className="w-full max-w-2xl bg-surface rounded-2xl border border-border p-8">

                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-indigo-500/20 rounded-2xl mb-4">
                            <Icon className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">{currentStep.title}</h2>
                        <p className="text-slate-500 mt-1">{currentStep.description}</p>
                    </div>

                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-slate-400 max-w-md mx-auto">
                                Bu kurulum sihirbazı sizi adım adım yönlendirecek. Hesabınızı birkaç dakika içinde hazırlayabilirsiniz.
                            </p>
                            <div className="grid grid-cols-3 gap-3 mt-6">
                                {['Kolay Kurulum', 'Hızlı Entegrasyon', 'Anında Başla'].map((t, i) => (
                                    <div key={i} className="p-4 bg-background rounded-xl text-center">
                                        <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                                        <div className="text-xs text-foreground">{t}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Store Info */}
                    {step === 2 && (
                        <div className="space-y-4 max-w-md mx-auto">
                            <div>
                                <label className="text-sm text-slate-400 block mb-2">Mağaza Adı *</label>
                                <input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Mağazanızın adı"
                                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none placeholder:text-slate-500" />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 block mb-2">Kategori</label>
                                <select value={storeCategory} onChange={e => setStoreCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground border border-border">
                                    <option value="">Seçin...</option>
                                    <option>Elektronik</option>
                                    <option>Giyim</option>
                                    <option>Ev & Yaşam</option>
                                    <option>Kozmetik</option>
                                    <option>Spor</option>
                                    <option>Diğer</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Platform Connection */}
                    {step === 3 && (
                        <div className="space-y-3 max-w-md mx-auto">
                            {platforms.map(p => (
                                <button key={p.id} onClick={() => togglePlatform(p.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${connectedPlatforms.includes(p.id) ? 'bg-emerald-500/10 border-emerald-500/30' : 'border-border hover:border-indigo-500/30'}`}>
                                    <span className="text-sm text-foreground font-medium">{p.name}</span>
                                    {connectedPlatforms.includes(p.id) ? (
                                        <span className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Bağlı</span>
                                    ) : (
                                        <span className="text-xs text-slate-500">Bağla →</span>
                                    )}
                                </button>
                            ))}
                            <p className="text-xs text-slate-600 text-center mt-3">Daha sonra da bağlayabilirsiniz</p>
                        </div>
                    )}

                    {/* Step 4: Service Integrations */}
                    {step === 4 && (
                        <div className="space-y-4 max-w-md mx-auto">
                            <p className="text-xs text-slate-400 text-center">
                                Bir veya birden fazla servis ekleyin. Daha sonra <strong>Ayarlar → Servis Entegrasyonları</strong> sayfasından değiştirebilirsiniz.
                            </p>
                            {[
                                { id: 'SHIPPING_ARAS', label: 'Aras Kargo', category: 'Kargo', color: 'blue' },
                                { id: 'SHIPPING_YURTICI', label: 'Yurtiçi Kargo', category: 'Kargo', color: 'blue' },
                                { id: 'SHIPPING_MNG', label: 'MNG Kargo', category: 'Kargo', color: 'blue' },
                                { id: 'PAYMENT_IYZICO', label: 'iyzico', category: 'Ödeme', color: 'green' },
                                { id: 'EINVOICE_FORIBA', label: 'Foriba E-Fatura', category: 'E-Fatura', color: 'purple' },
                            ].map((svc) => (
                                <div key={svc.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                                    <div>
                                        <span className="text-sm font-medium text-foreground">{svc.label}</span>
                                        <span className={`ml-2 text-xs ${
                                            svc.color === 'blue' ? 'text-blue-400 bg-blue-400/10' :
                                            svc.color === 'green' ? 'text-green-400 bg-green-400/10' :
                                            'text-purple-400 bg-purple-400/10'
                                        } px-1.5 py-0.5 rounded`}>{svc.category}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">Ayarlardan ekle →</span>
                                </div>
                            ))}
                            <button
                                onClick={() => setStep(s => s + 1)}
                                className="w-full text-center text-sm text-slate-500 hover:text-slate-300 py-2"
                            >
                                Şimdi atla, daha sonra ekleyeyim
                            </button>
                        </div>
                    )}

                    {/* Step 5: Import */}
                    {step === 5 && (
                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                            {[
                                { id: 'platform', label: 'Platformdan Çek', desc: 'Bağlı platformlardan otomatik aktar' },
                                { id: 'csv', label: 'CSV/Excel Yükle', desc: 'Dosyadan toplu içe aktar' },
                                { id: 'manual', label: 'Manuel Ekle', desc: 'Tek tek ürün ekle' },
                                { id: 'skip', label: 'Sonra Yapacağım', desc: 'Bu adımı atla' },
                            ].map(m => (
                                <button key={m.id} onClick={() => setImportMethod(m.id)}
                                    className={`p-4 rounded-xl border text-left transition-all ${importMethod === m.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'border-border hover:border-indigo-500/30'}`}>
                                    <div className="text-sm font-medium text-foreground">{m.label}</div>
                                    <div className="text-xs text-slate-500 mt-1">{m.desc}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 6: Notifications */}
                    {step === 6 && (
                        <div className="space-y-4 max-w-md mx-auto">
                            {[
                                { key: 'email', label: 'E-posta Bildirimleri', desc: 'Sipariş ve stok bildirimleri' },
                                { key: 'push', label: 'Push Bildirimleri', desc: 'Tarayıcı anlık bildirimleri' },
                                { key: 'sms', label: 'SMS Bildirimleri', desc: 'Kritik uyarılar için SMS' },
                            ].map(n => (
                                <div key={n.key} className="flex items-center justify-between p-4 bg-background rounded-xl">
                                    <div>
                                        <div className="text-sm text-foreground">{n.label}</div>
                                        <div className="text-xs text-slate-500">{n.desc}</div>
                                    </div>
                                    <button onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                                        className={`w-12 h-6 rounded-full ${notifications[n.key as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications[n.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 7: Done */}
                    {step === 7 && (
                        <div className="text-center space-y-4">
                            <div className="text-6xl mb-4">🎉</div>
                            <p className="text-sm text-slate-400 max-w-sm mx-auto">Kurulum tamamlandı! Dashboard&apos;unuza yönlendirileceksiniz.</p>
                            <div className="grid grid-cols-3 gap-3 mt-6">
                                <div className="p-3 bg-background rounded-xl text-center">
                                    <div className="text-lg font-bold text-foreground">{connectedPlatforms.length}</div>
                                    <div className="text-xs text-slate-500">Platform</div>
                                </div>
                                <div className="p-3 bg-background rounded-xl text-center">
                                    <div className="text-lg font-bold text-foreground">{storeName || '-'}</div>
                                    <div className="text-xs text-slate-500">Mağaza</div>
                                </div>
                                <div className="p-3 bg-background rounded-xl text-center">
                                    <div className="text-lg font-bold text-emerald-400">✓</div>
                                    <div className="text-xs text-slate-500">Hazır</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                        {step > 1 ? (
                            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-foreground">
                                <ArrowLeft className="w-4 h-4" /> Geri
                            </button>
                        ) : <div />}
                        {step < STEPS.length ? (
                            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
                                Devam <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
                                Dashboard&apos;a Git <Sparkles className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
