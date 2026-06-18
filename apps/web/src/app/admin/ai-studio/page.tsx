'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Image as ImageIcon,
    Video,
    Palette,
    Download,
    Share2,
    Wand2,
    CheckCircle2,
    RefreshCw,
} from 'lucide-react';

const THEMES = [
    { id: 'minimalist', name: 'Minimalist', color: 'bg-zinc-100', text: 'text-zinc-800' },
    { id: 'luxury', name: 'Luxury', color: 'bg-amber-100', text: 'text-amber-800' },
    { id: 'nature', name: 'Nature', color: 'bg-emerald-100', text: 'text-emerald-800' },
    { id: 'urban', name: 'Urban', color: 'bg-blue-100', text: 'text-blue-800' },
    { id: 'cozy', name: 'Cozy', color: 'bg-orange-100', text: 'text-orange-800' },
];

type HistoryItem = {
    id: string;
    theme: string;
    resultUrl: string;
    createdAt: string;
};

export default function AiStudioPage() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState('minimalist');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = async () => {
        try {
            const res = await fetch('/api/admin/ai-studio/generate');
            if (res.ok) {
                const data = await res.json();
                setHistory(data.history || []);
            }
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleGenerate = async () => {
        if (!selectedImage) return;
        setIsProcessing(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/ai-studio/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    theme: selectedTheme,
                    originalImageUrl: selectedImage,
                    productDescription: 'e-commerce product',
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Oluşturma başarısız');

            setResultImage(data.url);
            if (data.item) {
                setHistory((prev) => [data.item, ...prev].slice(0, 20));
            } else {
                await loadHistory();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = async () => {
        if (!resultImage) return;
        try {
            const res = await fetch(resultImage);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-studio-${selectedTheme}-${Date.now()}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            window.open(resultImage, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] p-8">
            <div className="max-w-6xl mx-auto mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight dark:text-white">
                            AI STUDIO <span className="text-purple-600">2.0</span>
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            Ürün fotoğraflarınızı premium lifestyle içeriklere dönüştürün.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setActiveTab('image')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all
                ${activeTab === 'image' ? 'bg-white dark:bg-zinc-700 shadow-sm text-purple-600' : 'text-zinc-500'}`}
                            >
                                <ImageIcon className="w-4 h-4" /> GÖRSEL
                            </button>
                            <button
                                onClick={() => setActiveTab('video')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all
                ${activeTab === 'video' ? 'bg-white dark:bg-zinc-700 shadow-sm text-purple-600' : 'text-zinc-500'}`}
                            >
                                <Video className="w-4 h-4" /> VİDEO
                            </button>
                        </div>

                        {activeTab === 'video' ? (
                            <p className="text-sm text-zinc-500 text-center py-8">
                                Video üretimi yakında aktif olacak.
                            </p>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400">
                                        Ürün Fotoğrafı
                                    </label>
                                    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                                        {!selectedImage ? (
                                            <>
                                                <ImageIcon className="w-8 h-8 text-zinc-300 group-hover:text-purple-400 transition-colors mb-2" />
                                                <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-500">
                                                    Yüklemek için tıklayın
                                                </span>
                                            </>
                                        ) : (
                                            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const reader = new FileReader();
                                                reader.onload = () => setSelectedImage(reader.result as string);
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 mt-6">
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-400">
                                        Konsept Seçimi
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {THEMES.map((theme) => (
                                            <button
                                                key={theme.id}
                                                onClick={() => setSelectedTheme(theme.id)}
                                                className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] font-bold uppercase
                      ${selectedTheme === theme.id ? 'border-purple-500 bg-purple-500/10 text-purple-600' : 'border-transparent bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                                            >
                                                {theme.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && (
                                    <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
                                )}

                                <button
                                    onClick={handleGenerate}
                                    disabled={isProcessing || !selectedImage}
                                    className={`w-full mt-8 py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-3
              ${isProcessing || !selectedImage ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-purple-600/30'}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" /> OLUŞTURULUYOR...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-5 h-5" /> ŞİMDİ OLUŞTUR
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-purple-100 to-transparent dark:from-purple-900/20 dark:to-transparent rounded-3xl p-6 border border-purple-200 dark:border-purple-800/30">
                        <h3 className="text-sm font-black text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2">
                            <Palette className="w-4 h-4" /> AI İPUCU
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                            Farklı konseptler deneyerek ürününüz için en yüksek satışı getiren arka planı
                            bulabilirsiniz. Luxury konsepti genellikle takı ve saat kategorilerinde %40 daha
                            fazla tıklama alıyor.
                        </p>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-8 flex flex-col">
                    <div className="flex-1 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden min-h-[500px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {!resultImage && !isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center"
                                >
                                    <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon className="w-10 h-10 text-zinc-300" />
                                    </div>
                                    <h2 className="text-xl font-bold text-zinc-400">Sonuç burada görünecek</h2>
                                    <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2 italic">
                                        Bir görsel yükleyin ve otonom stüdyonun sihrini başlatın.
                                    </p>
                                </motion.div>
                            )}

                            {isProcessing && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6 text-center z-10"
                                >
                                    <div className="relative w-48 h-1 overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-full mx-auto">
                                        <motion.div
                                            className="absolute inset-y-0 bg-purple-600"
                                            initial={{ left: '-100%', width: '100%' }}
                                            animate={{ left: '100%' }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black animate-pulse uppercase tracking-[0.2em] text-purple-500">
                                            Lifestyle sahne oluşturuluyor...
                                        </p>
                                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">
                                            AI görsel üretimi devam ediyor
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {resultImage && !isProcessing && (
                                <motion.div
                                    key="result"
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-full h-full relative"
                                >
                                    <img
                                        src={resultImage}
                                        alt="Result"
                                        className="w-full h-full object-contain rounded-2xl shadow-2xl"
                                    />

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20"
                                    >
                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                                        >
                                            <Download className="w-4 h-4" /> İndir
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigator.clipboard.writeText(resultImage)}
                                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform"
                                        >
                                            <Share2 className="w-4 h-4" /> Kopyala
                                        </button>
                                        <div className="w-px h-6 bg-white/20 mx-1" />
                                        <button
                                            type="button"
                                            onClick={handleGenerate}
                                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </motion.div>

                                    <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3" /> AI Optimized
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 pointer-events-none opacity-[0.03]">
                            {Array.from({ length: 64 }).map((_, i) => (
                                <div key={i} className="border-[0.5px] border-zinc-900" />
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="flex-shrink-0 w-full text-center text-zinc-400 text-sm py-4">
                                Henüz oluşturulmuş görsel yok
                            </div>
                        ) : (
                            history.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setResultImage(item.resultUrl)}
                                    className="flex-shrink-0 w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-purple-500/50 transition-all group overflow-hidden"
                                >
                                    <img
                                        src={item.resultUrl}
                                        alt={item.theme}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 10px;
        }
      `}</style>
        </div>
    );
}
