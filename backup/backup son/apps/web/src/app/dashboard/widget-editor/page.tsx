"use client";

import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
    LayoutGrid, Plus, X, GripVertical, Settings, Eye,
    BarChart3, TrendingUp, Package, ShoppingCart, DollarSign,
    Users, AlertTriangle, Activity, Globe, Target, Maximize2, Minimize2
} from 'lucide-react';

interface Widget {
    id: string;
    type: string;
    title: string;
    size: 'small' | 'medium' | 'large';
    visible: boolean;
}

const WIDGET_TYPES = [
    { type: 'revenue', title: 'Gelir Özeti', icon: DollarSign, color: 'emerald' },
    { type: 'orders', title: 'Sipariş Durumu', icon: ShoppingCart, color: 'blue' },
    { type: 'products', title: 'Ürün İstatistikleri', icon: Package, color: 'purple' },
    { type: 'customers', title: 'Müşteri Analizi', icon: Users, color: 'indigo' },
    { type: 'trending', title: 'Trend Ürünler', icon: TrendingUp, color: 'orange' },
    { type: 'platforms', title: 'Platform Performansı', icon: Globe, color: 'cyan' },
    { type: 'alerts', title: 'Stok Uyarıları', icon: AlertTriangle, color: 'red' },
    { type: 'activity', title: 'Son Aktiviteler', icon: Activity, color: 'slate' },
    { type: 'targets', title: 'Hedefler', icon: Target, color: 'yellow' },
    { type: 'chart', title: 'Satış Grafiği', icon: BarChart3, color: 'pink' },
];

const defaultWidgets: Widget[] = [
    { id: 'w1', type: 'revenue', title: 'Gelir Özeti', size: 'medium', visible: true },
    { id: 'w2', type: 'orders', title: 'Sipariş Durumu', size: 'medium', visible: true },
    { id: 'w3', type: 'products', title: 'Ürün İstatistikleri', size: 'small', visible: true },
    { id: 'w4', type: 'customers', title: 'Müşteri Analizi', size: 'small', visible: true },
    { id: 'w5', type: 'trending', title: 'Trend Ürünler', size: 'large', visible: true },
    { id: 'w6', type: 'platforms', title: 'Platform Performansı', size: 'medium', visible: true },
    { id: 'w7', type: 'alerts', title: 'Stok Uyarıları', size: 'small', visible: false },
    { id: 'w8', type: 'activity', title: 'Son Aktiviteler', size: 'medium', visible: false },
];

function WidgetCard({ widget, onToggleSize, onRemove, editMode }: { widget: Widget; onToggleSize: () => void; onRemove: () => void; editMode: boolean }) {
    const widgetType = WIDGET_TYPES.find(w => w.type === widget.type);
    const Icon = widgetType?.icon || BarChart3;

    const colSpan = widget.size === 'large' ? 'lg:col-span-3' : widget.size === 'medium' ? 'lg:col-span-2' : 'lg:col-span-1';

    return (
        <motion.div
            layout
            className={`bg-surface rounded-2xl border border-border p-5 ${colSpan} relative group ${editMode ? 'ring-2 ring-indigo-500/20 ring-dashed' : ''}`}
        >
            {editMode && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onToggleSize}
                        className="p-1.5 bg-background rounded-lg hover:bg-slate-700 transition-colors"
                        title="Boyutu değiştir"
                    >
                        {widget.size === 'small' ? <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> : <Minimize2 className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <button
                        onClick={onRemove}
                        className="p-1.5 bg-background rounded-lg hover:bg-red-900/50 transition-colors"
                        title="Kaldır"
                    >
                        <X className="w-3.5 h-3.5 text-red-400" />
                    </button>
                </div>
            )}

            {editMode && (
                <div className="absolute top-2 left-2 cursor-grab">
                    <GripVertical className="w-4 h-4 text-slate-500" />
                </div>
            )}

            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 bg-${widgetType?.color || 'slate'}-500/20 rounded-xl`}>
                    <Icon className={`w-5 h-5 text-${widgetType?.color || 'slate'}-500`} />
                </div>
                <h3 className="text-sm font-bold text-foreground">{widget.title}</h3>
            </div>

            {/* Widget content placeholder */}
            <div className="space-y-3">
                {widget.type === 'revenue' && (
                    <>
                        <div className="text-3xl font-black text-foreground">₺284.520</div>
                        <div className="text-sm text-emerald-500">+12.5% bu ay</div>
                        <div className="h-16 bg-background rounded-xl" />
                    </>
                )}
                {widget.type === 'orders' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-background rounded-xl"><div className="text-lg font-bold text-foreground">45</div><div className="text-xs text-slate-500">Bekleyen</div></div>
                        <div className="p-3 bg-background rounded-xl"><div className="text-lg font-bold text-foreground">128</div><div className="text-xs text-slate-500">İşlenen</div></div>
                        <div className="p-3 bg-background rounded-xl"><div className="text-lg font-bold text-foreground">892</div><div className="text-xs text-slate-500">Tamamlanan</div></div>
                        <div className="p-3 bg-background rounded-xl"><div className="text-lg font-bold text-foreground">12</div><div className="text-xs text-slate-500">İptal</div></div>
                    </div>
                )}
                {widget.type === 'products' && (
                    <>
                        <div className="text-2xl font-bold text-foreground">1,245</div>
                        <div className="text-xs text-slate-500">aktif ürün</div>
                        <div className="flex items-center gap-2"><span className="text-xs text-red-400">23 stoksuz</span><span className="text-xs text-yellow-400">45 düşük stok</span></div>
                    </>
                )}
                {widget.type === 'customers' && (
                    <>
                        <div className="text-2xl font-bold text-foreground">8,432</div>
                        <div className="text-xs text-slate-500">toplam müşteri</div>
                        <div className="text-xs text-emerald-400">+234 yeni bu ay</div>
                    </>
                )}
                {widget.type === 'trending' && (
                    <div className="space-y-2">
                        {['iPhone 15 Pro Max Kılıf', 'Galaxy S24 Ekran Koruyucu', 'AirPods Pro 2 Kılıf'].map((name, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-background rounded-lg">
                                <span className="text-sm text-foreground">{name}</span>
                                <span className="text-xs text-emerald-500">+{45 - i * 12}%</span>
                            </div>
                        ))}
                    </div>
                )}
                {(widget.type === 'platforms' || widget.type === 'activity' || widget.type === 'chart') && (
                    <div className="h-24 bg-background rounded-xl flex items-center justify-center text-sm text-slate-500">
                        {widget.title} içeriği
                    </div>
                )}
                {widget.type === 'alerts' && (
                    <div className="space-y-2">
                        <div className="text-sm text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 5 ürün stoksuz</div>
                        <div className="text-sm text-yellow-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 12 ürün düşük stok</div>
                    </div>
                )}
                {widget.type === 'targets' && (
                    <>
                        <div className="text-sm text-slate-500">Aylık hedef: ₺500.000</div>
                        <div className="w-full bg-background rounded-full h-3">
                            <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '57%' }} />
                        </div>
                        <div className="text-xs text-slate-400">%57 tamamlandı</div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

export default function WidgetEditorPage() {
    const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
    const [editMode, setEditMode] = useState(false);
    const [showAddPanel, setShowAddPanel] = useState(false);

    const visibleWidgets = widgets.filter(w => w.visible);

    const toggleSize = (id: string) => {
        setWidgets(prev => prev.map(w => {
            if (w.id !== id) return w;
            const sizes: Widget['size'][] = ['small', 'medium', 'large'];
            const nextIdx = (sizes.indexOf(w.size) + 1) % sizes.length;
            return { ...w, size: sizes[nextIdx] };
        }));
    };

    const removeWidget = (id: string) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: false } : w));
    };

    const addWidget = (type: string) => {
        const wType = WIDGET_TYPES.find(w => w.type === type);
        if (!wType) return;
        const existing = widgets.find(w => w.type === type);
        if (existing) {
            setWidgets(prev => prev.map(w => w.id === existing.id ? { ...w, visible: true } : w));
        } else {
            setWidgets(prev => [...prev, {
                id: `w${Date.now()}`,
                type,
                title: wType.title,
                size: 'medium',
                visible: true,
            }]);
        }
        setShowAddPanel(false);
    };

    const saveLayout = () => {
        localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
        setEditMode(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-indigo-500" />
                        Dashboard Widget Editörü
                    </h1>
                    <p className="text-slate-500 mt-1">Dashboard&apos;ınızı özelleştirin — widget ekleyin, kaldırın, boyutlandırın</p>
                </div>
                <div className="flex items-center gap-3">
                    {editMode ? (
                        <>
                            <button
                                onClick={() => setShowAddPanel(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-300 hover:text-foreground transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Widget Ekle
                            </button>
                            <button
                                onClick={saveLayout}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Kaydet
                            </button>
                            <button
                                onClick={() => setEditMode(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-300 hover:text-foreground transition-colors"
                            >
                                İptal
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-300 hover:text-foreground transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Düzenle
                        </button>
                    )}
                </div>
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleWidgets.map(widget => (
                    <WidgetCard
                        key={widget.id}
                        widget={widget}
                        editMode={editMode}
                        onToggleSize={() => toggleSize(widget.id)}
                        onRemove={() => removeWidget(widget.id)}
                    />
                ))}
            </div>

            {/* Add Widget Panel */}
            {showAddPanel && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface rounded-2xl w-full max-w-md border border-border"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground">Widget Ekle</h3>
                            <button onClick={() => setShowAddPanel(false)} className="p-2 hover:bg-background rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-3">
                            {WIDGET_TYPES.map(wt => {
                                const isActive = widgets.some(w => w.type === wt.type && w.visible);
                                return (
                                    <button
                                        key={wt.type}
                                        onClick={() => addWidget(wt.type)}
                                        disabled={isActive}
                                        className={`p-4 rounded-xl border text-left transition-all ${isActive ? 'border-border opacity-40 cursor-not-allowed' : 'border-border hover:border-indigo-500 bg-background hover:bg-indigo-500/5'}`}
                                    >
                                        <wt.icon className={`w-5 h-5 text-${wt.color}-500 mb-2`} />
                                        <div className="text-sm font-medium text-foreground">{wt.title}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
