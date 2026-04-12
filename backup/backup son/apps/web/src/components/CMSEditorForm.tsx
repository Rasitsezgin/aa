"use client";

import React, { useState } from 'react';
import { saveCMSData } from '@/app/actions/cms-actions';
import { Save, Loader2, CheckCircle, Layout, Phone, Zap } from 'lucide-react';
import { CMSData } from '@/lib/cms-service';

export default function CMSEditorForm({ initialData }: { initialData: CMSData }) {
    const [activeTab, setActiveTab] = useState<'features' | 'solutions' | 'contact'>('features');
    const [formData, setFormData] = useState<CMSData>(initialData);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const ok = await saveCMSData(formData);
        setSaving(false);
        if (ok) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        }
    };

    const updateNested = (section: keyof CMSData, sub: string, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [sub]: {
                    ...(prev[section] as any)[sub],
                    [field]: value
                }
            }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">İçerik Yönetimi (CMS)</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${success ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : success ? <CheckCircle size={18} /> : <Save size={18} />}
                    {success ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}
                </button>
            </div>

            <div className="flex gap-4 border-b border-border pb-1">
                <button onClick={() => setActiveTab('features')} className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'features' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
                    <Zap size={16} /> Özellikler Sayfası
                </button>
                <button onClick={() => setActiveTab('solutions')} className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'solutions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
                    <Layout size={16} /> Çözümler Sayfası
                </button>
                <button onClick={() => setActiveTab('contact')} className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'contact' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
                    <Phone size={16} /> İletişim Sayfası
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 space-y-8">
                {activeTab === 'features' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Hero Alanı</h3>
                        <div className="grid gap-4">
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">Başlık</span>
                                <input
                                    value={formData.features.hero.title}
                                    onChange={e => updateNested('features', 'hero', 'title', e.target.value)}
                                    className="w-full p-2 rounded-md bg-background border border-input"
                                />
                            </label>
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">Açıklama</span>
                                <textarea
                                    value={formData.features.hero.description}
                                    onChange={e => updateNested('features', 'hero', 'description', e.target.value)}
                                    className="w-full p-2 rounded-md bg-background border border-input h-24"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'solutions' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Hero Alanı</h3>
                        <div className="grid gap-4">
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">Başlık</span>
                                <input
                                    value={formData.solutions.hero.title}
                                    onChange={e => updateNested('solutions', 'hero', 'title', e.target.value)}
                                    className="w-full p-2 rounded-md bg-background border border-input"
                                />
                            </label>
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">Açıklama</span>
                                <textarea
                                    value={formData.solutions.hero.description}
                                    onChange={e => updateNested('solutions', 'hero', 'description', e.target.value)}
                                    className="w-full p-2 rounded-md bg-background border border-input h-24"
                                />
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Hero Alanı</h3>
                        <div className="grid gap-4">
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">Başlık</span>
                                <input
                                    value={formData.contact.hero.title}
                                    onChange={e => updateNested('contact', 'hero', 'title', e.target.value)}
                                    className="w-full p-2 rounded-md bg-background border border-input"
                                />
                            </label>
                        </div>
                        <h3 className="text-lg font-semibold border-b border-border pb-2 mt-8">İletişim Bilgileri</h3>
                        <div className="grid gap-4">
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">E-posta</span>
                                <input
                                    value={formData.contact.info.email}
                                    onChange={e => updateNested('contact', 'info', 'email', e.target.value)}
                                    className="w-full p-2 rounded-md bg-background border border-input"
                                />
                            </label>
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">Telefon</span>
                                <input
                                    value={formData.contact.info.phone}
                                    onChange={e => updateNested('contact', 'info', 'phone', e.target.value)}
                                    className="w-full p-2 rounded-md bg-background border border-input"
                                />
                            </label>
                            <label className="block space-y-2">
                                <span className="text-sm font-medium">Adres</span>
                                <input
                                    value={formData.contact.info.address}
                                    onChange={e => updateNested('contact', 'info', 'address', e.target.value)}
                                    className="w-full p-2 rounded-md bg-background border border-input"
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
                Not: Sadece temel başlıklar ve bilgiler buradan düzenlenebilir. Daha karmaşık yapısal değişiklikler için geliştirici ile görüşün.
            </p>
        </div>
    );
}
