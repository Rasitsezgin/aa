"use client";

import React, { useState, useEffect } from 'react';
import { Save, Eye, Plus, Trash2, GripVertical, Layout, Settings, Sparkles, Check, Edit2, X } from 'lucide-react';

interface DashboardWidget {
    id: string;
    type: 'metric' | 'chart' | 'table' | 'custom';
    title: string;
    description?: string;
    icon: string;
    position: { x: number; y: number; w: number; h: number };
    config: Record<string, any>;
    enabled: boolean;
    category: string;
}

interface DashboardSection {
    id: string;
    title: string;
    description: string;
    widgets: DashboardWidget[];
    layout: 'grid' | 'flex' | 'custom';
    columns: number;
    enabled: boolean;
}

export default function DashboardAdminClient() {
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'layout' | 'widgets' | 'content'>('layout');
    
    const [sections, setSections] = useState<DashboardSection[]>([
        {
            id: 'overview',
            title: 'Genel Bakış',
            description: 'Dashboard ana bölümü',
            widgets: [],
            layout: 'grid',
            columns: 4,
            enabled: true
        },
        {
            id: 'analytics',
            title: 'Analitikler',
            description: 'Grafikler ve raporlar',
            widgets: [],
            layout: 'grid',
            columns: 2,
            enabled: true
        },
        {
            id: 'activity',
            title: 'Aktivite Akışı',
            description: 'Son aktiviteler ve bildirimler',
            widgets: [],
            layout: 'flex',
            columns: 1,
            enabled: true
        },
        {
            id: 'quick-actions',
            title: 'Hızlı İşlemler',
            description: 'Kısayol ve butonlar',
            widgets: [],
            layout: 'grid',
            columns: 4,
            enabled: true
        }
    ]);

    const [availableWidgets] = useState<DashboardWidget[]>([
        // Metric Widgets
        {
            id: 'revenue-metric',
            type: 'metric',
            title: 'Toplam Gelir',
            description: 'Aylık gelir metriği',
            icon: 'DollarSign',
            position: { x: 0, y: 0, w: 1, h: 1 },
            config: {
                period: 'monthly',
                format: 'currency',
                showChange: true,
                changePeriod: 'last_month'
            },
            enabled: true,
            category: 'Finansal'
        },
        {
            id: 'orders-metric',
            type: 'metric',
            title: 'Sipariş Sayısı',
            description: 'Toplam sipariş sayısı',
            icon: 'ShoppingCart',
            position: { x: 1, y: 0, w: 1, h: 1 },
            config: {
                period: 'daily',
                showChange: true,
                changePeriod: 'yesterday'
            },
            enabled: true,
            category: 'Siparişler'
        },
        {
            id: 'users-metric',
            type: 'metric',
            title: 'Aktif Kullanıcılar',
            description: 'Aktif müşteri sayısı',
            icon: 'Users',
            position: { x: 2, y: 0, w: 1, h: 1 },
            config: {
                period: 'realtime',
                showChange: true,
                changePeriod: 'last_hour'
            },
            enabled: true,
            category: 'Müşteriler'
        },
        {
            id: 'conversion-metric',
            type: 'metric',
            title: 'Dönüşüm Oranı',
            description: 'Site dönüşüm oranı',
            icon: 'Target',
            position: { x: 3, y: 0, w: 1, h: 1 },
            config: {
                period: 'weekly',
                format: 'percentage',
                showChange: true,
                changePeriod: 'last_week'
            },
            enabled: true,
            category: 'Analitik'
        },
        
        // Chart Widgets
        {
            id: 'revenue-chart',
            type: 'chart',
            title: 'Gelir Grafiği',
            description: 'Zamana bağlı gelir grafiği',
            icon: 'LineChart',
            position: { x: 0, y: 1, w: 2, h: 2 },
            config: {
                chartType: 'line',
                period: '30d',
                showGrid: true,
                showLegend: true,
                colors: ['#3b82f6', '#8b5cf6']
            },
            enabled: true,
            category: 'Finansal'
        },
        {
            id: 'sales-chart',
            type: 'chart',
            title: 'Satış Dağılımı',
            description: 'Kategori bazlı satışlar',
            icon: 'BarChart',
            position: { x: 2, y: 1, w: 2, h: 2 },
            config: {
                chartType: 'bar',
                period: '7d',
                showGrid: true,
                showLegend: true,
                colors: ['#10b981', '#f59e0b']
            },
            enabled: true,
            category: 'Satış'
        },
        {
            id: 'platform-chart',
            type: 'chart',
            title: 'Platform Performansı',
            description: 'Pazaryeri performans karşılaştırması',
            icon: 'PieChart',
            position: { x: 0, y: 3, w: 2, h: 2 },
            config: {
                chartType: 'pie',
                showLegend: true,
                colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
            },
            enabled: true,
            category: 'Platformlar'
        },
        
        // Table Widgets
        {
            id: 'recent-orders',
            type: 'table',
            title: 'Son Siparişler',
            description: 'En son siparişler listesi',
            icon: 'ShoppingBag',
            position: { x: 2, y: 3, w: 2, h: 2 },
            config: {
                limit: 10,
                columns: ['id', 'customer', 'amount', 'status', 'date'],
                sortable: true,
                filterable: true
            },
            enabled: true,
            category: 'Siparişler'
        },
        {
            id: 'top-products',
            type: 'table',
            title: 'Popüler Ürünler',
            description: 'En çok satan ürünler',
            icon: 'Package',
            position: { x: 0, y: 5, w: 2, h: 2 },
            config: {
                limit: 8,
                columns: ['name', 'sales', 'revenue', 'rating'],
                sortable: true,
                showImages: true
            },
            enabled: true,
            category: 'Ürünler'
        },
        {
            id: 'stock-alerts',
            type: 'table',
            title: 'Stok Uyarıları',
            description: 'Düşük stoklu ürünler',
            icon: 'AlertTriangle',
            position: { x: 2, y: 5, w: 2, h: 2 },
            config: {
                limit: 15,
                columns: ['product', 'current_stock', 'min_stock', 'status'],
                filterable: true,
                colorCode: true
            },
            enabled: true,
            category: 'Stok'
        },
        
        // Custom Widgets
        {
            id: 'ai-insights',
            type: 'custom',
            title: 'AI Analizleri',
            description: 'Yapay zeka destekli analizler',
            icon: 'Brain',
            position: { x: 0, y: 7, w: 4, h: 1 },
            config: {
                showRecommendations: true,
                showPredictions: true,
                refreshInterval: 30000
            },
            enabled: true,
            category: 'AI'
        },
        {
            id: 'quick-actions',
            type: 'custom',
            title: 'Hızlı İşlemler',
            description: 'Sık kullanılan işlemler',
            icon: 'Zap',
            position: { x: 0, y: 8, w: 4, h: 1 },
            config: {
                actions: ['new_order', 'add_product', 'view_reports', 'export_data'],
                layout: 'horizontal',
                showLabels: true
            },
            enabled: true,
            category: 'Genel'
        },
        {
            id: 'activity-feed',
            type: 'custom',
            title: 'Aktivite Akışı',
            description: 'Son aktivite kayıtları',
            icon: 'Activity',
            position: { x: 0, y: 9, w: 4, h: 2 },
            config: {
                limit: 20,
                autoRefresh: true,
                refreshInterval: 10000,
                showTimestamps: true
            },
            enabled: true,
            category: 'Aktivite'
        }
    ]);

    useEffect(() => {
        // Load dashboard config from localStorage
        const savedConfig = localStorage.getItem('dashboard_config');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setSections(parsed.sections || sections);
            } catch (e) {
                console.error('Failed to load dashboard config', e);
            }
        }
    }, []);

    const handleSave = () => {
        const config = {
            sections,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('dashboard_config', JSON.stringify(config));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const toggleSection = (sectionId: string) => {
        setSections(prev => prev.map(section => 
            section.id === sectionId 
                ? { ...section, enabled: !section.enabled }
                : section
        ));
    };

    const updateSection = (sectionId: string, updates: Partial<DashboardSection>) => {
        setSections(prev => prev.map(section => 
            section.id === sectionId 
                ? { ...section, ...updates }
                : section
        ));
    };

    const addWidgetToSection = (sectionId: string, widgetId: string) => {
        const widget = availableWidgets.find(w => w.id === widgetId);
        if (!widget) return;

        setSections(prev => prev.map(section => {
            if (section.id === sectionId) {
                const newWidget = { 
                    ...widget, 
                    id: `${widget.id}-${Date.now()}`,
                    position: { 
                        x: section.widgets.length % section.columns, 
                        y: Math.floor(section.widgets.length / section.columns), 
                        w: widget.position.w, 
                        h: widget.position.h 
                    }
                };
                return { ...section, widgets: [...section.widgets, newWidget] };
            }
            return section;
        }));
    };

    const removeWidgetFromSection = (sectionId: string, widgetId: string) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId) {
                return { ...section, widgets: section.widgets.filter(w => w.id !== widgetId) };
            }
            return section;
        }));
    };

    const updateWidget = (sectionId: string, widgetId: string, updates: Partial<DashboardWidget>) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    widgets: section.widgets.map(widget =>
                        widget.id === widgetId ? { ...widget, ...updates } : widget
                    )
                };
            }
            return section;
        }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Dashboard Yönetimi</h1>
                    <p className="text-sm text-slate-500 mt-1">Dashboard widget'larını ve layout'ını dinamik olarak yönetin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <a href="/dashboard" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-foreground hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                        <Eye size={16} /> Önizle
                    </a>
                    <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white hover:bg-primary/80 shadow-primary/20'}`}>
                        {saved ? <Check size={16} /> : <Save size={16} />} {saved ? 'Kaydedildi!' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 w-fit">
                {[
                    { id: 'layout', label: 'Layout', icon: Layout },
                    { id: 'widgets', label: 'Widget\'lar', icon: Sparkles },
                    { id: 'content', label: 'İçerik', icon: Settings }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-foreground hover:bg-white dark:hover:bg-white/5'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/10 p-8 backdrop-blur-xl">
                {activeTab === 'layout' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-black text-foreground mb-4">Bölüm Layout</h2>
                        <div className="space-y-4">
                            {sections.map((section) => (
                                <div key={section.id} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleSection(section.id)}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                                    section.enabled 
                                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                                                        : 'bg-slate-800 text-slate-500'
                                                }`}
                                            >
                                                {section.enabled ? <Eye size={20} /> : <X size={20} />}
                                            </button>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                                                <p className="text-sm text-slate-500">{section.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={section.layout}
                                                onChange={(e) => updateSection(section.id, { layout: e.target.value as any })}
                                                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm"
                                                disabled={!section.enabled}
                                            >
                                                <option value="grid">Grid</option>
                                                <option value="flex">Flex</option>
                                                <option value="custom">Custom</option>
                                            </select>
                                            <input
                                                type="number"
                                                value={section.columns}
                                                onChange={(e) => updateSection(section.id, { columns: parseInt(e.target.value) })}
                                                className="w-16 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-center"
                                                disabled={!section.enabled}
                                                min="1"
                                                max="6"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Widget Preview */}
                                    {section.enabled && (
                                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${section.columns}, 1fr)` }}>
                                            {section.widgets.map((widget) => (
                                                <div
                                                    key={widget.id}
                                                    className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 text-center"
                                                >
                                                    <div className="text-xs font-bold text-foreground truncate">{widget.title}</div>
                                                    <div className="text-xs text-slate-500">{widget.type}</div>
                                                </div>
                                            ))}
                                            {section.widgets.length === 0 && (
                                                <div className={`col-span-${section.columns} p-4 text-center text-slate-500 text-sm`}>
                                                    Bu bölüme widget eklenmemiş
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'widgets' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-black text-foreground mb-4">Widget Yönetimi</h2>
                        
                        {/* Available Widgets */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Mevcut Widget'lar</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availableWidgets.map((widget) => (
                                    <div key={widget.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <span className="text-xs">{widget.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-foreground">{widget.title}</h4>
                                                    <p className="text-xs text-slate-500">{widget.description}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                                {widget.type}
                                            </span>
                                        </div>
                                        
                                        {/* Add to Section */}
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="flex-1 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded text-xs"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        addWidgetToSection(e.target.value, widget.id);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            >
                                                <option value="">Bölüm seç...</option>
                                                {sections.filter(s => s.enabled).map(section => (
                                                    <option key={section.id} value={section.id}>
                                                        {section.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section Widgets */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Bölüm Widget'ları</h3>
                            <div className="space-y-4">
                                {sections.filter(s => s.enabled && s.widgets.length > 0).map((section) => (
                                    <div key={section.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                        <h4 className="text-sm font-bold text-foreground mb-3">{section.title}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {section.widgets.map((widget) => (
                                                <div key={widget.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                                                            <span className="text-xs">{widget.icon}</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground truncate">{widget.title}</div>
                                                            <div className="text-xs text-slate-500">{widget.type}</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeWidgetFromSection(section.id, widget.id)}
                                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-black text-foreground mb-4">Widget İçerik Ayarları</h2>
                        <div className="text-center py-12 text-slate-500">
                            <Settings size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Widget içerik düzenleme özelliği yakında eklenecek...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
