"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Image as ImageIcon,
    Sparkles,
    Trash2,
    Download,
    RefreshCw,
    Maximize2,
    Wand2,
    Check,
    AlertCircle,
    Brain,
    Palette,
    Zap
} from 'lucide-react';
import { useAiImage } from '@/lib/hooks';

export default function ImageStudioPage() {
    const [prompt, setPrompt] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const { generate, removeBg, loading } = useAiImage();
    const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
    const [history, setHistory] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!prompt) return;
        const res = await generate(prompt);
        if (res?.url) {
            setGeneratedUrl(res.url);
            setHistory([res.url, ...history]);
        }
    };

    const handleRemoveBg = async () => {
        if (!generatedUrl) return;
        const res = await removeBg(generatedUrl);
        if (res?.url) {
            setGeneratedUrl(res.url);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-blue-500" />
                        AI Görsel Stüdyosu
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        DALL-E 3 ile ürün fotoğrafları üretin ve düzenleyin
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tools Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
                        <div className="flex p-1 bg-background rounded-xl border border-border mb-6">
                            <button
                                onClick={() => setActiveTab('generate')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'generate'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-foreground'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4 inline-block mr-2" />
                                Üret
                            </button>
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'edit'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-foreground'
                                    }`}
                            >
                                <Palette className="w-4 h-4 inline-block mr-2" />
                                Düzenle
                            </button>
                        </div>

                        {activeTab === 'generate' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-400 mb-2 block">Resim Açıklaması (Prompt)</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Örn: Beyaz minimalist bir arka planda duran şık siyah kablosuz kulaklık, stüdyo aydınlatması, 8k..."
                                        rows={5}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="px-4 py-2 bg-background border border-border rounded-lg text-xs font-medium hover:border-blue-500/50 transition-colors">
                                        1024x1024
                                    </button>
                                    <button className="px-4 py-2 bg-background border border-border rounded-lg text-xs font-medium hover:border-blue-500/50 transition-colors">
                                        Modern Stil
                                    </button>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !prompt}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            Görseli Oluştur
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-xs text-slate-500 mb-4">
                                    Mevcut görsel üzerinde AI araçlarını kullanarak düzenleme yapın.
                                </p>
                                <button
                                    onClick={handleRemoveBg}
                                    disabled={loading || !generatedUrl}
                                    className="w-full py-3 bg-background border border-border hover:border-blue-500/50 text-foreground rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    <Wand2 className="w-4 h-4" />
                                    Arka Planı Temizle
                                </button>
                                <button
                                    disabled={loading || !generatedUrl}
                                    className="w-full py-3 bg-background border border-border hover:border-blue-500/50 text-foreground rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                    Kaliteyi Artır (Upscale)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="bg-surface rounded-2xl border border-border p-6">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Geçmiş
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {history.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setGeneratedUrl(url)}
                                        className="aspect-square rounded-lg overflow-hidden border border-border hover:border-blue-500 transition-all"
                                    >
                                        <img src={url} alt={`History ${i}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-8">
                    <div className="bg-surface rounded-3xl border border-border p-4 h-full min-h-[500px] flex flex-col relative group">
                        {!generatedUrl && !loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                                <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-6">
                                    <ImageIcon size={40} />
                                </div>
                                <p className="text-lg font-medium">Görsel Önizleme</p>
                                <p className="text-sm">Henüz bir görsel üretilmedi.</p>
                            </div>
                        ) : loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="relative w-24 h-24 mb-6">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                                    <div className="relative bg-blue-600 rounded-full w-full h-full flex items-center justify-center">
                                        <Brain className="w-10 h-10 text-white animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-xl font-bold">AI İşleme Alıyor...</p>
                                <p className="text-slate-500 mt-2">Pikseller stüdyo kalitesinde işleniyor.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 rounded-2xl overflow-hidden bg-background border border-border relative">
                                    <img
                                        src={generatedUrl!}
                                        alt="Generated"
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all">
                                            <Download size={18} />
                                        </button>
                                        <button className="p-2 bg-red-500/80 backdrop-blur-md rounded-lg text-white hover:bg-red-600 transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Check className="w-4 h-4 text-green-500" />
                                        Görsel hazır (1024x1024)
                                    </div>
                                    <button className="px-6 py-2 bg-foreground text-background rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                                        Ürüne Ata
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Clock } from 'lucide-react';
