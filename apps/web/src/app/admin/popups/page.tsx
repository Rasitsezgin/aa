"use client";

import React, { useState, useEffect } from 'react';
import { 
    Save, Plus, Trash2, Eye, EyeOff, Layout, Type, Image as ImageIcon, 
    Link2, Settings, Sparkles, X, Check, ArrowRight, Zap, Clock, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Popup {
    id?: string;
    title: string;
    description: string;
    imageUrl: string;
    ctaText: string;
    ctaUrl: string;
    type: 'EXIT_INTENT' | 'TIMED' | 'SCROLL' | 'IMMEDIATE';
    delay: number;
    scroll: number;
    theme: 'light' | 'dark' | 'brand';
    bgColor: string;
    textColor: string;
    size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    isActive: boolean;
    isGlobal: boolean;
    pageSlugs: string[];
}

export default function PopupStudio() {
    const [popups, setPopups] = useState<Popup[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        try {
            const res = await fetch('/api/admin/popups');
            const data = await res.json();
            setPopups(data);
            if (data.length > 0) setSelectedPopup(data[0]);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        const newPopup: Popup = {
            title: "Yeni Kampanya",
            description: "Harika bir fırsatı kaçırmayın!",
            imageUrl: "",
            ctaText: "Hemen İncele",
            ctaUrl: "/",
            type: 'EXIT_INTENT',
            delay: 0,
            scroll: 0,
            theme: 'light',
            bgColor: '#ffffff',
            textColor: '#000000',
            size: 'md',
            isActive: false,
            isGlobal: true,
            pageSlugs: []
        };
        setSelectedPopup(newPopup);
    };

    const handleSave = async () => {
        if (!selectedPopup) return;
        setIsSaving(true);
        try {
            const method = selectedPopup.id ? 'PUT' : 'POST';
            const url = selectedPopup.id ? `/api/admin/popups/${selectedPopup.id}` : '/api/admin/popups';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedPopup)
            });

            if (res.ok) {
                await fetchPopups();
                alert("Başarıyla kaydedildi!");
            }
        } catch (error) {
            alert("Kaydedilirken bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu popup'ı silmek istediğinize emin misiniz?")) return;
        setIsDeleting(id);
        try {
            const res = await fetch(`/api/admin/popups/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPopups(popups.filter(p => p.id !== id));
                if (selectedPopup?.id === id) setSelectedPopup(null);
            }
        } catch (error) {
            alert("Silinirken hata oluştu.");
        } finally {
            setIsDeleting(null);
        }
    };

    if (loading) return <div className="p-8">Yükleniyor...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Popup Studio</h1>
                    <p className="text-sm text-slate-500">Kampanyalarınızı ve bildirimlerinizi tasarlayın.</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> Yeni Popup
                </button>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Left: Popup List */}
                <div className="w-80 flex flex-col bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-white/10">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Aktif Popup'lar</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {popups.map(popup => (
                            <div 
                                key={popup.id}
                                onClick={() => setSelectedPopup(popup)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedPopup?.id === popup.id ? 'bg-primary/5 border-primary shadow-sm' : 'border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${popup.isActive ? 'bg-green-500/10 text-green-600' : 'bg-slate-500/10 text-slate-500'}`}>
                                        {popup.isActive ? 'AKTİF' : 'PASİF'}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">{popup.type}</span>
                                </div>
                                <h3 className="text-sm font-bold truncate">{popup.title}</h3>
                                <div className="mt-3 flex items-center justify-end gap-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(popup.id!); }}
                                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: Editor Form */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden">
                    {selectedPopup ? (
                        <>
                            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                        <Settings size={20} />
                                    </div>
                                    <h2 className="text-lg font-black">{selectedPopup.id ? 'Popup Düzenle' : 'Yeni Popup Tasarla'}</h2>
                                </div>
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSaving ? 'Kaydediliyor...' : <><Save size={18} /> Kaydet</>}
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Basic Info */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Type size={18} />
                                        <h3 className="text-sm font-bold uppercase tracking-widest">İçerik Ayarları</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Popup Başlığı</label>
                                            <input 
                                                value={selectedPopup.title}
                                                onChange={e => setSelectedPopup({...selectedPopup, title: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                                                placeholder="Örn: %20 İndirim Fırsatı"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">CTA Buton Yazısı</label>
                                            <input 
                                                value={selectedPopup.ctaText}
                                                onChange={e => setSelectedPopup({...selectedPopup, ctaText: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Açıklama Metni</label>
                                        <textarea 
                                            value={selectedPopup.description}
                                            onChange={e => setSelectedPopup({...selectedPopup, description: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl h-24"
                                        />
                                    </div>
                                </section>

                                {/* Visuals */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <ImageIcon size={18} />
                                        <h3 className="text-sm font-bold uppercase tracking-widest">Görsel ve Stil</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Görsel URL (İsteğe bağlı)</label>
                                            <input 
                                                value={selectedPopup.imageUrl}
                                                onChange={e => setSelectedPopup({...selectedPopup, imageUrl: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Yönlendirme Linki (CTA URL)</label>
                                            <input 
                                                value={selectedPopup.ctaUrl}
                                                onChange={e => setSelectedPopup({...selectedPopup, ctaUrl: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Trigger Settings */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Zap size={18} />
                                        <h3 className="text-sm font-bold uppercase tracking-widest">Tetikleyici (Trigger)</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Tetiklenme Tipi</label>
                                            <select 
                                                value={selectedPopup.type}
                                                onChange={e => setSelectedPopup({...selectedPopup, type: e.target.value as any})}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                                            >
                                                <option value="EXIT_INTENT">Çıkış Niyetinde (Exit Intent)</option>
                                                <option value="TIMED">Zaman Ayarlı (Timed)</option>
                                                <option value="SCROLL">Kaydırma Mesafesi (Scroll)</option>
                                                <option value="IMMEDIATE">Anında (Immediate)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Durum</label>
                                            <div className="flex items-center gap-4 py-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedPopup.isActive}
                                                        onChange={e => setSelectedPopup({...selectedPopup, isActive: e.target.checked})}
                                                        className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-sm font-bold">Yayına Al</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <Sparkles size={48} className="mb-4 opacity-20" />
                            <p>Düzenlemek için bir popup seçin veya yeni bir tane oluşturun.</p>
                        </div>
                    )}
                </div>

                {/* Right: Live Preview */}
                <div className="w-[450px] flex flex-col bg-slate-100 dark:bg-black/20 rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Canlı Önizleme</h2>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                        </div>
                    </div>
                    <div className="flex-1 p-8 flex items-center justify-center relative">
                        {/* Simulation of Frontend Render */}
                        {selectedPopup ? (
                            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                                <div className="relative p-6 bg-primary">
                                    <div className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-lg text-white">
                                        <X size={14} />
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-white/20 rounded-xl">
                                            <Zap size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-xl font-black text-white leading-tight">Canlı Önizleme</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {selectedPopup.imageUrl && (
                                        <div className="aspect-video bg-slate-100 dark:bg-white/5 rounded-2xl overflow-hidden relative border border-slate-100 dark:border-white/5">
                                            <img src={selectedPopup.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-lg font-black text-foreground">{selectedPopup.title}</h4>
                                        <p className="text-sm text-slate-500 mt-1">{selectedPopup.description}</p>
                                    </div>
                                    <button className="w-full py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                        {selectedPopup.ctaText}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-400 text-sm font-medium">Önizleme bulunmuyor</div>
                        )}
                        
                        {/* Status badge floating */}
                        <div className="absolute top-4 left-4">
                            <span className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-500">
                                <div className={`w-1.5 h-1.5 rounded-full ${selectedPopup?.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                {selectedPopup?.isActive ? 'YAYINDA' : 'TASLAK'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
