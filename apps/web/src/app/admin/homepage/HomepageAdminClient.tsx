"use client";

import React, { useState, useEffect } from 'react';
import {
    Save, Eye, RefreshCcw, Type, MessageSquare, BarChart3, Sparkles, Check,
    Palette, Image, Link2, Plus, Trash2, Layout, EyeOff, GripVertical, Box, DollarSign, LucideIcon
} from 'lucide-react';
import { HOMEPAGE_TEXTS } from '@/config/homepage-texts';

export default function HomepageAdminClient() {
    const [activeTab, setActiveTab] = useState<'layout' | 'hero' | 'bento' | 'pricing' | 'faq' | 'features'>('layout');
    const [saved, setSaved] = useState(false);

    // Modular Layout State
    const [sections, setSections] = useState([
        { id: 'hero', label: 'Ana Giriş (Hero)', isActive: true },
        { id: 'stats', label: 'Canlı İstatistikler', isActive: true },
        { id: 'social-proof', label: 'Sosyal Kanıt (Logolar)', isActive: true },
        { id: 'chaos-control', label: 'Karmaşa vs Kontrol', isActive: true },
        { id: 'before-after', label: 'Before/After Slider', isActive: true },
        { id: 'preview', label: 'Dashboard Önizleme', isActive: true },
        { id: 'live-demo', label: 'Live Demo Spotlight', isActive: true },
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

    // Features State - yeni özellikler için kontrol
    const [features, setFeatures] = useState({
        liveDemo: { enabled: true, spotlightIntensity: 70, mouseFollow: true },
        beforeAfter: { enabled: true, autoPlay: true, animationSpeed: 3000 },
        particles: { enabled: true, particleCount: 50, triggerScroll: true },
        realTimeCounter: { enabled: true, showCountries: true, updateInterval: 5000 },
        exitIntent: { enabled: true, discountPercent: 20, triggerDelay: 1000 },
        commandPalette: { enabled: true, shortcutKey: 'cmd+k' },
        spotlightTour: { enabled: true, autoStart: false, stepDelay: 2000 },
        hero3D: { enabled: true, particleCount: 150, waveIntensity: 0.5, interactive: true },
        showcase: { enabled: true, autoRotate: true, rotationSpeed: 1, showHotspots: true, allowZoom: true },
        aiPersonalization: { enabled: true, showRecommendations: true, behaviorTracking: true, dynamicContent: true },
        microAnimations: { enabled: true, scrollReveal: true, hoverEffects: true, floatingElements: true, morphingText: true, particleTrails: true },
        socialProofLive: { enabled: true, showRealTime: true, showTestimonials: true, showMetrics: true, updateInterval: 3000 },
        pricingCalculator: { enabled: true, showProjections: true, showComparison: true, showROI: true },
        gamification: { enabled: true, showProgress: true, showAchievements: true, showLeaderboard: true, allowInteraction: true },
        voiceSearch: { enabled: true, autoListen: false, showCommands: true, language: 'tr-TR' },
        analyticsDashboard: { enabled: true, showRealTime: true, showCharts: true, showMetrics: true, allowInteraction: true },
    });

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

        // Load Features
        const savedFeatures = localStorage.getItem('homepage_features');
        if (savedFeatures) {
            try {
                const parsed = JSON.parse(savedFeatures);
                setTimeout(() => {
                    setFeatures(parsed);
                }, 0);
            } catch (e) { }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('homepage_config', JSON.stringify(sections));
        localStorage.setItem('homepage_texts', JSON.stringify(texts));
        localStorage.setItem('homepage_features', JSON.stringify(features));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleSection = (id: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    };

    const tabs: { id: 'layout' | 'hero' | 'bento' | 'pricing' | 'faq' | 'features', label: string, icon: LucideIcon }[] = [
        { id: 'layout', label: 'Modül Yönetimi', icon: Layout },
        { id: 'hero', label: 'Hero', icon: Type },
        { id: 'bento', label: 'Özellikler', icon: Box },
        { id: 'pricing', label: 'Fiyatlandırma', icon: DollarSign },
        { id: 'faq', label: 'SSS (FAQ)', icon: MessageSquare },
        { id: 'features', label: 'Yeni Özellikler', icon: Sparkles },
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

                {activeTab === 'features' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h3 className="text-lg font-black text-foreground mb-4">Yeni Özellikler</h3>
                        <div className="space-y-4">
                            {Object.entries(features).map(([key, config]) => (
                                <div key={key} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={config.enabled}
                                                onChange={(e) => setFeatures(prev => ({
                                                    ...prev,
                                                    [key]: { ...prev[key as keyof typeof prev], enabled: e.target.checked }
                                                }))}
                                                className="w-4 h-4 text-primary rounded"
                                            />
                                            <span className="text-sm font-medium">Aktif</span>
                                        </label>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {Object.entries(config).filter(([k]) => k !== 'enabled').map(([k, v]) => (
                                            <div key={k} className="flex justify-between py-1">
                                                <span className="capitalize">{k}:</span>
                                                <span className="font-mono">{String(v)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'hero' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="text-center py-12 text-slate-500">
                            <Type size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Hero metin düzenleme özelliği yakında eklenecek...</p>
                        </div>
                    </div>
                )}

                {activeTab === 'bento' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="text-center py-12 text-slate-500">
                            <Box size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Bento grid düzenleme özelliği yakında eklenecek...</p>
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="text-center py-12 text-slate-500">
                            <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Fiyatlandırma düzenleme özelliği yakında eklenecek...</p>
                        </div>
                    </div>
                )}

                {activeTab === 'faq' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="text-center py-12 text-slate-500">
                            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                            <p>SSS düzenleme özelliği yakında eklenecek...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
