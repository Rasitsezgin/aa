"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sun,
    Moon,
    Monitor,
    Check,
    Sliders,
    Eye,
    Type,
    Droplet,
    Sparkles,
    RotateCcw,
    Circle,
    Square,
    Hexagon
} from 'lucide-react';
import {
    useTheme,
    colorPalettes,
    radiusMap,
    fontMap,
    type ThemeColor,
    type ThemeFont,
    type ThemeRadius,
    type ThemeMode,
    type ThemeSettings,
    defaultThemeSettings,
} from '@/providers/theme-provider';

// Tema renkleri (UI için label/gradient)
const themeColors: { id: ThemeColor; name: string; gradient: string }[] = [
    { id: 'blue', name: 'Mavi', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'purple', name: 'Mor', gradient: 'from-purple-500 to-pink-500' },
    { id: 'green', name: 'Yeşil', gradient: 'from-green-500 to-emerald-500' },
    { id: 'orange', name: 'Turuncu', gradient: 'from-orange-500 to-amber-500' },
    { id: 'red', name: 'Kırmızı', gradient: 'from-red-500 to-rose-500' },
    { id: 'pink', name: 'Pembe', gradient: 'from-pink-500 to-fuchsia-500' },
    { id: 'teal', name: 'Turkuaz', gradient: 'from-teal-500 to-cyan-500' },
    { id: 'indigo', name: 'İndigo', gradient: 'from-indigo-500 to-violet-500' },
];

// Font seçenekleri
const fontOptions: { id: ThemeFont; name: string; sample: string }[] = [
    { id: 'inter', name: 'Inter', sample: 'Aa' },
    { id: 'poppins', name: 'Poppins', sample: 'Aa' },
    { id: 'roboto', name: 'Roboto', sample: 'Aa' },
    { id: 'open-sans', name: 'Open Sans', sample: 'Aa' },
    { id: 'montserrat', name: 'Montserrat', sample: 'Aa' },
    { id: 'lato', name: 'Lato', sample: 'Aa' },
];

// Köşe yuvarlama seçenekleri
const radiusOptions: { id: ThemeRadius; name: string; value: string; icon: any }[] = [
    { id: 'none', name: 'Yok', value: '0px', icon: Square },
    { id: 'sm', name: 'Küçük', value: '4px', icon: Square },
    { id: 'md', name: 'Orta', value: '8px', icon: Square },
    { id: 'lg', name: 'Büyük', value: '12px', icon: Square },
    { id: 'xl', name: 'Çok Büyük', value: '16px', icon: Circle },
    { id: 'full', name: 'Tam Yuvarlak', value: '9999px', icon: Circle },
];

// Hazır tema preset'leri
const presetThemes: { name: string; icon: string; settings: Partial<ThemeSettings> }[] = [
    {
        name: 'Profesyonel',
        icon: '💼',
        settings: { mode: 'dark', color: 'blue', font: 'inter', radius: 'lg', compactMode: false, animations: true },
    },
    {
        name: 'Enerji',
        icon: '⚡',
        settings: { mode: 'dark', color: 'orange', font: 'montserrat', radius: 'md', compactMode: false, animations: true },
    },
    {
        name: 'Doğa',
        icon: '🌿',
        settings: { mode: 'dark', color: 'green', font: 'poppins', radius: 'xl', compactMode: false, animations: true },
    },
    {
        name: 'Lüks',
        icon: '👑',
        settings: { mode: 'dark', color: 'purple', font: 'montserrat', radius: 'lg', compactMode: false, animations: true },
    },
    {
        name: 'Minimal',
        icon: '🎯',
        settings: { mode: 'light', color: 'blue', font: 'inter', radius: 'sm', compactMode: true, animations: false },
    },
    {
        name: 'Gece',
        icon: '🌙',
        settings: { mode: 'dark', color: 'indigo', font: 'lato', radius: 'lg', compactMode: false, animations: true },
    },
];

export default function ThemePage() {
    const { theme, setThemeSettings, resetTheme, resolvedMode } = useTheme();
    const [saved, setSaved] = useState(false);

    // "Kaydedildi" efekti - her değişiklik anında uygulandığı için gösterim amaçlı
    useEffect(() => {
        if (saved) {
            const t = setTimeout(() => setSaved(false), 2000);
            return () => clearTimeout(t);
        }
    }, [saved]);

    const applyPreset = (settings: Partial<ThemeSettings>) => {
        setThemeSettings(settings);
        setSaved(true);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Tema Özelleştirme</h1>
                    <p className="text-slate-500 mt-1">Dashboard görünümünü kişiselleştirin — değişiklikler anında uygulanır</p>
                </div>
                <div className="flex items-center gap-3">
                    {saved && (
                        <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-green-500 font-medium flex items-center gap-1"
                        >
                            <Check size={14} /> Kaydedildi
                        </motion.span>
                    )}
                    <button
                        onClick={() => { resetTheme(); setSaved(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border hover:border-red-500/30 text-slate-400 hover:text-red-500 rounded-xl font-medium transition-all"
                    >
                        <RotateCcw size={16} />
                        Sıfırla
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Sol Panel - Ayarlar */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Mod Seçimi */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Sun size={20} className="text-primary" />
                            Görünüm Modu
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {([
                                { id: 'light' as ThemeMode, label: 'Açık', icon: Sun, desc: 'Aydınlık ortamlar için' },
                                { id: 'dark' as ThemeMode, label: 'Koyu', icon: Moon, desc: 'Göz yorgunluğunu azaltır' },
                                { id: 'system' as ThemeMode, label: 'Sistem', icon: Monitor, desc: 'Cihaz ayarını takip et' },
                            ]).map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setThemeSettings({ mode: option.id })}
                                    className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                                        theme.mode === option.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/30 bg-background/50'
                                    }`}
                                >
                                    {theme.mode === option.id && (
                                        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-xl ${theme.mode === option.id ? 'bg-primary/10' : 'bg-white/5'}`}>
                                        <option.icon size={28} className={theme.mode === option.id ? 'text-primary' : 'text-slate-400'} />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-foreground">{option.label}</div>
                                        <div className="text-xs text-slate-500 mt-1">{option.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Renk Seçimi */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Droplet size={20} className="text-primary" />
                            Tema Rengi
                        </h2>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                            {themeColors.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setThemeSettings({ color: color.id })}
                                    className={`relative aspect-square rounded-xl transition-all hover:scale-110 ${
                                        theme.color === color.id ? 'ring-2 ring-offset-2 ring-offset-surface ring-white scale-110' : ''
                                    }`}
                                    style={{ backgroundColor: colorPalettes[color.id].primary }}
                                    title={color.name}
                                >
                                    {theme.color === color.id && (
                                        <Check size={20} className="absolute inset-0 m-auto text-white drop-shadow-md" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500">Gradient Önizleme:</span>
                                <div className={`flex-1 h-8 rounded-xl bg-gradient-to-r ${themeColors.find(c => c.id === theme.color)?.gradient}`} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Font Seçimi */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Type size={20} className="text-primary" />
                            Yazı Tipi
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {fontOptions.map((font) => (
                                <button
                                    key={font.id}
                                    onClick={() => setThemeSettings({ font: font.id })}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                        theme.font === font.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/30 bg-background/50'
                                    }`}
                                    style={{ fontFamily: fontMap[font.id] }}
                                >
                                    <span className="font-medium text-foreground">{font.name}</span>
                                    <span className="text-2xl text-slate-400">{font.sample}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Köşe Yuvarlama */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Hexagon size={20} className="text-primary" />
                            Köşe Yuvarlama
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {radiusOptions.map((radius) => (
                                <button
                                    key={radius.id}
                                    onClick={() => setThemeSettings({ radius: radius.id })}
                                    className={`flex flex-col items-center gap-2 p-4 border-2 transition-all ${
                                        theme.radius === radius.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/30 bg-background/50'
                                    }`}
                                    style={{ borderRadius: radius.value }}
                                >
                                    <div
                                        className="w-8 h-8 bg-primary/20"
                                        style={{ borderRadius: radius.value }}
                                    />
                                    <span className="text-xs font-medium text-foreground">{radius.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Diğer Ayarlar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-surface border border-border rounded-2xl p-6"
                    >
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Sliders size={20} className="text-primary" />
                            Diğer Ayarlar
                        </h2>
                        <div className="space-y-4">
                            {/* Kompakt Mod */}
                            <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                                <div>
                                    <div className="font-medium text-foreground">Kompakt Mod</div>
                                    <div className="text-sm text-slate-500">Daha sıkışık bir görünüm</div>
                                </div>
                                <button
                                    onClick={() => setThemeSettings({ compactMode: !theme.compactMode })}
                                    className={`relative w-12 h-6 rounded-full transition-all ${
                                        theme.compactMode ? 'bg-primary' : 'bg-slate-700'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                                            theme.compactMode ? 'left-7' : 'left-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Animasyonlar */}
                            <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                                <div>
                                    <div className="font-medium text-foreground">Animasyonlar</div>
                                    <div className="text-sm text-slate-500">Geçiş ve hover efektleri</div>
                                </div>
                                <button
                                    onClick={() => setThemeSettings({ animations: !theme.animations })}
                                    className={`relative w-12 h-6 rounded-full transition-all ${
                                        theme.animations ? 'bg-primary' : 'bg-slate-700'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                                            theme.animations ? 'left-7' : 'left-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Sidebar Pozisyonu */}
                            <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                                <div>
                                    <div className="font-medium text-foreground">Sidebar Pozisyonu</div>
                                    <div className="text-sm text-slate-500">Menü konumu</div>
                                </div>
                                <div className="flex gap-2">
                                    {(['left', 'right'] as const).map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => setThemeSettings({ sidebarPosition: pos })}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                theme.sidebarPosition === pos
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white/5 text-slate-400 hover:text-foreground'
                                            }`}
                                        >
                                            {pos === 'left' ? 'Sol' : 'Sağ'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sağ Panel - Önizleme + Preset'ler */}
                <div className="space-y-6">
                    {/* Canlı Önizleme */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface border border-border rounded-2xl p-6 sticky top-24"
                    >
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Eye size={20} className="text-primary" />
                            Canlı Önizleme
                        </h2>

                        {/* Mini Dashboard Preview */}
                        <div className="bg-background rounded-xl border border-border overflow-hidden">
                            {/* Mini Header */}
                            <div className="h-8 bg-surface border-b border-border flex items-center px-3 gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                            </div>

                            <div className="flex h-48">
                                {/* Mini Sidebar */}
                                <div className={`w-12 bg-surface border-r border-border p-2 space-y-2 ${
                                    theme.sidebarPosition === 'right' ? 'order-last border-r-0 border-l' : ''
                                }`}>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={`w-full aspect-square bg-white/5 ${i === 1 ? 'bg-primary/20' : ''}`}
                                            style={{ borderRadius: radiusMap[theme.radius] }}
                                        />
                                    ))}
                                </div>

                                {/* Mini Content */}
                                <div className="flex-1 p-3 space-y-2">
                                    <div
                                        className="h-6 rounded"
                                        style={{
                                            borderRadius: radiusMap[theme.radius],
                                            backgroundImage: `linear-gradient(to right, ${colorPalettes[theme.color].primary}, transparent)`,
                                        }}
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="h-12 bg-surface border border-border"
                                                style={{ borderRadius: radiusMap[theme.radius] }}
                                            />
                                        ))}
                                    </div>
                                    <div
                                        className="h-16 bg-surface border border-border"
                                        style={{ borderRadius: radiusMap[theme.radius] }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Current Theme Info */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Mod:</span>
                                <span className="font-medium text-foreground capitalize">
                                    {theme.mode === 'dark' ? 'Koyu' : theme.mode === 'light' ? 'Açık' : 'Sistem'}
                                    {theme.mode === 'system' && <span className="text-xs text-slate-500 ml-1">({resolvedMode === 'dark' ? 'Koyu' : 'Açık'})</span>}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Renk:</span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: colorPalettes[theme.color].primary }}
                                    />
                                    <span className="font-medium text-foreground">
                                        {themeColors.find(c => c.id === theme.color)?.name}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Font:</span>
                                <span className="font-medium text-foreground">
                                    {fontOptions.find(f => f.id === theme.font)?.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Köşeler:</span>
                                <span className="font-medium text-foreground">
                                    {radiusOptions.find(r => r.id === theme.radius)?.name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Kompakt:</span>
                                <span className="font-medium text-foreground">{theme.compactMode ? 'Açık' : 'Kapalı'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Animasyonlar:</span>
                                <span className="font-medium text-foreground">{theme.animations ? 'Açık' : 'Kapalı'}</span>
                            </div>
                        </div>

                        {/* Preset Themes */}
                        <div className="mt-6 pt-6 border-t border-border">
                            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                <Sparkles size={14} className="text-primary" />
                                Hazır Temalar
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {presetThemes.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyPreset(preset.settings)}
                                        className="flex items-center gap-2 p-2.5 rounded-lg bg-background/50 hover:bg-white/5 border border-border hover:border-primary/30 transition-all group"
                                    >
                                        <span className="text-lg">{preset.icon}</span>
                                        <span className="text-xs font-medium text-slate-400 group-hover:text-foreground transition-colors">
                                            {preset.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
