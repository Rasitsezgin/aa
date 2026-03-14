"use client";

import React, { useState, useEffect } from 'react';
import {
    Save, Eye, RefreshCcw, Type, MessageSquare, BarChart3, Sparkles, Check,
    Palette, Image, Link2, Plus, Trash2, Layout, EyeOff, GripVertical, Box, DollarSign, LucideIcon
} from 'lucide-react';
import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

export default function HomepageAdmin() {
    const [activeTab, setActiveTab] = useState<'layout' | 'hero' | 'bento' | 'pricing' | 'faq'>('layout');
    const [saved, setSaved] = useState(false);

    // Modular Layout State
    const [sections, setSections] = useState([
        { id: 'hero', label: 'Ana Giriş (Hero)', isActive: true },
        { id: 'stats', label: 'Canlı İstatistikler', isActive: true },
        { id: 'social-proof', label: 'Sosyal Kanıt (Logolar)', isActive: true },
        { id: 'chaos-control', label: 'Karmaşa vs Kontrol', isActive: true },
        { id: 'preview', label: 'Dashboard Önizleme', isActive: true },
        { id: 'map', label: 'Küresel Harita', isActive: true },
        { id: 'roi', label: 'ROI Hesaplayıcı', isActive: true },
        { id: 'ecosystem', label: 'Ekosistem Bulutu', isActive: true },
        { id: 'bento', label: 'Özellik Bento Grid', isActive: true },
        { id: 'testimonials', label: 'Müşteri Yorumları', isActive: true },
        { id: 'comparison', label: 'Karşılaştırma Tablosu', isActive: true },
        { id: 'pricing', label: 'Fiyatlandırma Paketleri', isActive: true },
        { id: 'faq', label: 'SSS Bölümü', isActive: true },
        { id: 'cta', label: 'Son Çağrı (CTA)', isActive: true },
    ]);

    // Content State (initialized with default texts)
    const [texts, setTexts] = useState(HOMEPAGE_TEXTS);

    useEffect(() => {
        // Load Layout
        const savedLayout = localStorage.getItem('homepage_config');
        if (savedLayout) {
            try {
                const parsed = JSON.parse(savedLayout);
                // Use setTimeout to avoid synchronous setState in effect
                setTimeout(() => {
                    setSections(prev => prev.map(s => {
                        const match = parsed.find((p: { id: string, isActive: boolean }) => p.id === s.id);
                        return match ? { ...s, isActive: match.isActive } : s;
                    }));
                }, 0);
            } catch (e) {
            }
        }

        // Load Texts
        const savedTexts = localStorage.getItem('homepage_texts');
        if (savedTexts) {
            try {
                const parsed = JSON.parse(savedTexts);
                setTimeout(() => {
                    setTexts(parsed);
                }, 0);
            } catch (e) { }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('homepage_config', JSON.stringify(sections));
        localStorage.setItem('homepage_texts', JSON.stringify(texts));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleSection = (id: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    };

    const tabs: { id: 'layout' | 'hero' | 'bento' | 'pricing' | 'faq', label: string, icon: LucideIcon }[] = [
        { id: 'layout', label: 'Modül Yönetimi', icon: Layout },
        { id: 'hero', label: 'Hero', icon: Type },
        { id: 'bento', label: 'Özellikler', icon: Box },
        { id: 'pricing', label: 'Fiyatlandırma', icon: DollarSign },
        { id: 'faq', label: 'SSS (FAQ)', icon: MessageSquare },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Ana Sayfa Yönetimi</h1>
                    <p className="text-sm text-slate-500 mt-1">Dinamik içerik ve modül kontrol merkezi.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-foreground hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                        <Eye size={16} /> Önizle
                    </a>
                    <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white hover:bg-primary/80 shadow-primary/20'}`}>
                        {saved ? <Check size={16} /> : <Save size={16} />} {saved ? 'Kaydedildi!' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-foreground hover:bg-white dark:hover:bg-white/5'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Panels */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/10 p-8 backdrop-blur-xl">
                {activeTab === 'layout' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sections.map((section) => (
                                <div
                                    key={section.id}
                                    onClick={() => toggleSection(section.id)}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${section.isActive
                                        ? 'bg-blue-600/10 border-blue-500/30 hover:border-blue-500/50 shadow-lg shadow-blue-500/5'
                                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-50 grayscale hover:opacity-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${section.isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-500'}`}>
                                            {section.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${section.isActive ? 'text-foreground' : 'text-slate-500'}`}>{section.label}</p>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{section.id}</p>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${section.isActive ? 'bg-green-500' : 'bg-slate-700'}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'hero' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditorInput label="Rozet Metni" value={texts.hero.badge} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, badge: v } })} />
                            <EditorInput label="Rozet Etiketi" value={texts.hero.badgeLabel} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, badgeLabel: v } })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditorInput label="Başlık Ön Ek (Normal)" value={texts.hero.titlePrefix} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, titlePrefix: v } })} />
                            <EditorInput label="Başlık Son Ek (Gradient)" value={texts.hero.titleSuffix} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, titleSuffix: v } })} />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Alt Başlık Parçaları</label>
                            <div className="grid grid-cols-1 gap-4">
                                <EditorTextarea label="Normal Metin (Baş)" value={texts.hero.subtitlePrefix} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, subtitlePrefix: v } })} />
                                <EditorInput label="Vurgulu Metin" value={texts.hero.subtitleHighlight} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, subtitleHighlight: v } })} />
                                <EditorTextarea label="Normal Metin (Son)" value={texts.hero.subtitleSuffix} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, subtitleSuffix: v } })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditorInput label="Analyzer Placeholder" value={texts.hero.analyzerPlaceholder} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, analyzerPlaceholder: v } })} />
                            <EditorInput label="Analyzer Buton" value={texts.hero.analyzerButton} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, analyzerButton: v } })} />
                        </div>
                        <EditorInput label="Analyzer Notu" value={texts.hero.analyzerNote} onChange={(v) => setTexts({ ...texts, hero: { ...texts.hero, analyzerNote: v } })} />
                    </div>
                )}

                {activeTab === 'bento' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditorInput label="Bölüm Başlığı" value={texts.bento.title} onChange={(v) => setTexts({ ...texts, bento: { ...texts.bento, title: v } })} />
                            <EditorInput label="Başlık Vurgu" value={texts.bento.titleHighlight} onChange={(v) => setTexts({ ...texts, bento: { ...texts.bento, titleHighlight: v } })} />
                        </div>
                        <EditorTextarea label="Açıklama" value={texts.bento.subtitle} onChange={(v) => setTexts({ ...texts, bento: { ...texts.bento, subtitle: v } })} />

                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Özellik Kartları</h3>
                            {texts.bento.cards.map((card, idx) => (
                                <div key={card.id} className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-primary uppercase">Kart #{idx + 1} ({card.id})</span>
                                    </div>
                                    <EditorInput label="Kart Başlığı" value={card.title} onChange={(v) => {
                                        const newCards = [...texts.bento.cards];
                                        newCards[idx].title = v;
                                        setTexts({ ...texts, bento: { ...texts.bento, cards: newCards } });
                                    }} />
                                    <EditorTextarea label="Kart Açıklaması" value={card.description} onChange={(v) => {
                                        const newCards = [...texts.bento.cards];
                                        newCards[idx].description = v;
                                        setTexts({ ...texts, bento: { ...texts.bento, cards: newCards } });
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EditorInput label="Rozet" value={texts.pricing.badge} onChange={(v) => setTexts({ ...texts, pricing: { ...texts.pricing, badge: v } })} />
                            <EditorInput label="Başlık" value={texts.pricing.title} onChange={(v) => setTexts({ ...texts, pricing: { ...texts.pricing, title: v } })} />
                        </div>
                        <EditorTextarea label="Açıklama" value={texts.pricing.subtitle} onChange={(v) => setTexts({ ...texts, pricing: { ...texts.pricing, subtitle: v } })} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {texts.pricing.plans.map((plan, idx) => (
                                <div key={plan.id} className="p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-4">
                                    <h3 className="text-sm font-black text-primary uppercase">{plan.name} Paketi</h3>
                                    <EditorInput label="Paket İsmi" value={plan.name} onChange={(v) => {
                                        const newPlans = [...texts.pricing.plans];
                                        newPlans[idx].name = v;
                                        setTexts({ ...texts, pricing: { ...texts.pricing, plans: newPlans } });
                                    }} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <EditorInput label="Aylık Fiyat" value={plan.priceMonthly} onChange={(v) => {
                                            const newPlans = [...texts.pricing.plans];
                                            newPlans[idx].priceMonthly = v;
                                            setTexts({ ...texts, pricing: { ...texts.pricing, plans: newPlans } });
                                        }} />
                                        <EditorInput label="Yıllık Fiyat" value={plan.priceAnnual} onChange={(v) => {
                                            const newPlans = [...texts.pricing.plans];
                                            newPlans[idx].priceAnnual = v;
                                            setTexts({ ...texts, pricing: { ...texts.pricing, plans: newPlans } });
                                        }} />
                                    </div>
                                    <EditorTextarea label="Açıklama" value={plan.description} onChange={(v) => {
                                        const newPlans = [...texts.pricing.plans];
                                        newPlans[idx].description = v;
                                        setTexts({ ...texts, pricing: { ...texts.pricing, plans: newPlans } });
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'faq' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <EditorInput label="Rozet" value={texts.faq.badge} onChange={(v) => setTexts({ ...texts, faq: { ...texts.faq, badge: v } })} />
                            <EditorInput label="Başlık" value={texts.faq.title} onChange={(v) => setTexts({ ...texts, faq: { ...texts.faq, title: v } })} />
                            <EditorInput label="Alt Başlık" value={texts.faq.subtitle} onChange={(v) => setTexts({ ...texts, faq: { ...texts.faq, subtitle: v } })} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Soru & Cevaplar</h3>
                                <button className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-foreground transition-all">
                                    <Plus size={12} /> Yeni Soru Ekle
                                </button>
                            </div>
                            {texts.faq.items.map((item, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-4 relative group">
                                    <button className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={14} />
                                    </button>
                                    <EditorInput label={`Soru #${idx + 1}`} value={item.q} onChange={(v) => {
                                        const newItems = [...texts.faq.items];
                                        newItems[idx].q = v;
                                        setTexts({ ...texts, faq: { ...texts.faq, items: newItems } });
                                    }} />
                                    <EditorTextarea label="Cevap" value={item.a} onChange={(v) => {
                                        const newItems = [...texts.faq.items];
                                        newItems[idx].a = v;
                                        setTexts({ ...texts, faq: { ...texts.faq, items: newItems } });
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Tip Card */}
            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-[32px] flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500 shadow-lg shadow-blue-500/20"><Sparkles size={24} /></div>
                <div>
                    <h3 className="text-lg font-bold text-blue-400">Pro İpucu: Gerçek Zamanlı Güncelleme</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                        Burada yaptığınız değişiklikler &quot;Kaydet&quot; butonuna bastığınız anda ana sayfanıza yansır. Karmaşa kod yapısı ile uğraşmadan, sanki bir dokümanı düzenler gibi sitenizi güncel tutabilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function EditorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
            />
        </div>
    );
}

function EditorTextarea({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                className="w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
            />
        </div>
    );
}
