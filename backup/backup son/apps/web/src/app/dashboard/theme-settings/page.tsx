"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Palette, Check, Eye, Paintbrush, Sliders, RotateCcw, Sparkles } from 'lucide-react';

type ThemeMode = 'dark' | 'light' | 'system';

const colorSchemes = [
    { id: 'indigo', name: 'İndigo', primary: '#6366f1', accent: '#818cf8', bg: '#0a0a0f', surface: '#111118', preview: ['#6366f1', '#818cf8', '#4f46e5'] },
    { id: 'emerald', name: 'Zümrüt', primary: '#10b981', accent: '#34d399', bg: '#0a0f0a', surface: '#111811', preview: ['#10b981', '#34d399', '#059669'] },
    { id: 'rose', name: 'Gül', primary: '#f43f5e', accent: '#fb7185', bg: '#0f0a0a', surface: '#181111', preview: ['#f43f5e', '#fb7185', '#e11d48'] },
    { id: 'amber', name: 'Amber', primary: '#f59e0b', accent: '#fbbf24', bg: '#0f0d0a', surface: '#181611', preview: ['#f59e0b', '#fbbf24', '#d97706'] },
    { id: 'cyan', name: 'Cyan', primary: '#06b6d4', accent: '#22d3ee', bg: '#0a0d0f', surface: '#111518', preview: ['#06b6d4', '#22d3ee', '#0891b2'] },
    { id: 'violet', name: 'Mor', primary: '#8b5cf6', accent: '#a78bfa', bg: '#0d0a0f', surface: '#151118', preview: ['#8b5cf6', '#a78bfa', '#7c3aed'] },
];

export default function ThemeSettingsPage() {
    const [mode, setMode] = useState<ThemeMode>('dark');
    const [selectedScheme, setSelectedScheme] = useState('indigo');
    const [fontSize, setFontSize] = useState(14);
    const [borderRadius, setBorderRadius] = useState(12);
    const [compactMode, setCompactMode] = useState(false);
    const currentScheme = colorSchemes.find(s => s.id === selectedScheme)!;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Palette className="w-8 h-8 text-pink-500" /> Tema Ayarları
                    </h1>
                    <p className="text-slate-500 mt-1">Arayüzü kendi zevkinize göre özelleştirin</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-300"><RotateCcw className="w-4 h-4" /> Varsayılana Dön</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Mode */}
                    <div className="bg-surface rounded-2xl border border-border p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4"><Sparkles className="w-5 h-5 inline mr-2 text-slate-400" />Tema Modu</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {([{ id: 'dark', icon: Moon, label: 'Koyu' }, { id: 'light', icon: Sun, label: 'Açık' }, { id: 'system', icon: Monitor, label: 'Sistem' }] as const).map(m => (
                                <button key={m.id} onClick={() => setMode(m.id)}
                                    className={`p-4 rounded-xl border text-center transition-all ${mode === m.id ? 'bg-indigo-500/20 border-indigo-500' : 'border-border'}`}>
                                    <m.icon className={`w-6 h-6 mx-auto mb-2 ${mode === m.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                                    <div className="text-sm">{m.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Color */}
                    <div className="bg-surface rounded-2xl border border-border p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4"><Paintbrush className="w-5 h-5 inline mr-2 text-slate-400" />Renk Şeması</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {colorSchemes.map(s => (
                                <button key={s.id} onClick={() => setSelectedScheme(s.id)}
                                    className={`p-4 rounded-xl border text-center ${selectedScheme === s.id ? 'border-white/20 ring-2' : 'border-border'}`}
                                    style={{ '--tw-ring-color': selectedScheme === s.id ? s.primary : undefined } as any}>
                                    <div className="flex justify-center gap-1 mb-2">{s.preview.map((c, i) => (<div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />))}</div>
                                    <div className="text-sm text-foreground">{s.name}</div>
                                    {selectedScheme === s.id && <Check className="w-4 h-4 mx-auto mt-1" style={{ color: s.primary }} />}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Fine tune */}
                    <div className="bg-surface rounded-2xl border border-border p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4"><Sliders className="w-5 h-5 inline mr-2 text-slate-400" />İnce Ayarlar</h2>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2"><span className="text-sm text-foreground">Yazı Boyutu</span><span className="text-sm text-slate-400">{fontSize}px</span></div>
                                <input type="range" min={12} max={18} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-indigo-500" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2"><span className="text-sm text-foreground">Köşe Yuvarlaklığı</span><span className="text-sm text-slate-400">{borderRadius}px</span></div>
                                <input type="range" min={0} max={20} value={borderRadius} onChange={e => setBorderRadius(+e.target.value)} className="w-full accent-indigo-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div><div className="text-sm text-foreground">Kompakt Mod</div><div className="text-xs text-slate-500">Daha sıkı yerleşim</div></div>
                                <button onClick={() => setCompactMode(!compactMode)} className={`w-12 h-6 rounded-full ${compactMode ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${compactMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Preview */}
                <div className="bg-surface rounded-2xl border border-border p-6 sticky top-4 h-fit">
                    <h2 className="text-lg font-bold text-foreground mb-4"><Eye className="w-5 h-5 inline mr-2 text-slate-400" />Önizleme</h2>
                    <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: currentScheme.bg, borderRadius: `${borderRadius}px` }}>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: currentScheme.surface }}>
                            <div className="w-20 h-2 rounded mb-2" style={{ backgroundColor: currentScheme.primary }} /><div className="w-full h-2 rounded bg-white/5 mb-1" /><div className="w-3/4 h-2 rounded bg-white/5" />
                        </div>
                        <div className="flex gap-2">
                            {[currentScheme.primary, currentScheme.accent].map((c, i) => (
                                <div key={i} className="flex-1 p-3 rounded-lg" style={{ backgroundColor: currentScheme.surface }}><div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: c, opacity: 0.2 }} /><div className="w-12 h-2 rounded bg-white/10" /></div>
                            ))}
                        </div>
                        <button className="w-full py-2 text-white text-xs font-medium" style={{ backgroundColor: currentScheme.primary, borderRadius: `${borderRadius}px` }}>Kaydet</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
