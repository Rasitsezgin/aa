"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Video, Image as ImageIcon, Sparkles, Play, Pause, 
    Download, LayoutTemplate, Type, Music, Settings2,
    CheckCircle2, Wand2, Loader2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const templates = [
    { id: 'tiktok-trend', name: 'TikTok Trend', desc: 'Hızlı kesimler ve trend müziklerle viral ürün videosu.', icon: Zap },
    { id: 'insta-aesthetic', name: 'Instagram Estetik', desc: 'Yumuşak geçişler, loş ışık efekti ve modern tipografi.', icon: Sparkles },
    { id: 'classic-ad', name: 'Klasik Reklam', desc: 'Ürün özelliklerini ön plana çıkaran profesyonel tanıtım.', icon: LayoutTemplate }
];

export default function VideoStudioPage() {
    const [step, setStep] = useState(1);
    const [selectedImages, setSelectedImages] = useState<string[]>([
        'https://images.unsplash.com/photo-15df202027209-66c888d229f3?w=500&auto=format&fit=crop&q=60', // Mock product 1
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&auto=format&fit=crop&q=60'  // Mock product 2
    ]);
    const [selectedTemplate, setSelectedTemplate] = useState('tiktok-trend');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    const generateVideo = () => {
        setIsGenerating(true);
        setStep(3);

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress > 100) progress = 100;
            
            setGenerationProgress(progress);

            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => setIsGenerating(false), 500);
            }
        }, 500);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Video className="w-8 h-8 text-primary" />
                        AI Video Stüdyosu
                    </h1>
                    <p className="text-slate-500 mt-2">Ürün fotoğraflarınızdan saniyeler içinde sosyal medya ve reklam videoları oluşturun.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold border border-amber-500/20">
                        ⚡ Maliyet: 5 Kredi
                    </span>
                    <Link href="/dashboard/ai-tools">
                        <button className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-surface transition-colors">
                            Geri Dön
                        </button>
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-surface border border-border rounded-[2xl] p-6 lg:p-8 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {/* STEP 1: SELECT ASSETS & TEMPLATE */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Images */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-primary" /> Görselleri Seçin
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {selectedImages.map((img, idx) => (
                                        <div key={idx} className="w-32 h-32 rounded-xl border-2 border-primary overflow-hidden relative group">
                                            <img src={img} alt="Product" className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                                <Settings2 className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all">
                                        <Wand2 className="w-6 h-6" />
                                        <span className="text-xs font-bold">Yeni Görsel</span>
                                    </button>
                                </div>
                            </div>

                            <hr className="border-border" />

                            {/* Templates */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <LayoutTemplate className="w-5 h-5 text-primary" /> Şablon ve Müzik
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {templates.map(t => (
                                        <button 
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={`p-4 rounded-xl border text-left transition-all ${selectedTemplate === t.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                                        >
                                            <t.icon className={`w-6 h-6 mb-3 ${selectedTemplate === t.id ? 'text-primary' : 'text-slate-400'}`} />
                                            <h4 className="font-bold mb-1">{t.name}</h4>
                                            <p className="text-xs text-slate-500">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    onClick={generateVideo}
                                    className="px-8 py-4 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Video Üret (5 Kredi) <Sparkles className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: GENERATING & RESULT */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col items-center justify-center min-h-[400px]"
                        >
                            {isGenerating ? (
                                <div className="w-full max-w-md text-center space-y-6">
                                    <div className="relative w-32 h-32 mx-auto">
                                        <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                            <circle 
                                                cx="64" cy="64" r="60" 
                                                stroke="currentColor" 
                                                strokeWidth="4" 
                                                fill="none" 
                                                className="text-primary"
                                                strokeDasharray="377" 
                                                strokeDashoffset={377 - (377 * generationProgress) / 100}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-primary">
                                            {generationProgress}%
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">Video Derleniyor...</h3>
                                        <p className="text-slate-500 text-sm">Görseller hareketlendiriliyor, AI seslendirmen senkronize ediliyor ve efektler ekleniyor.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <CheckCircle2 className={`w-4 h-4 ${generationProgress >= 30 ? 'text-emerald-500' : 'text-slate-300'}`} />
                                            Görseller analiz edildi
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <CheckCircle2 className={`w-4 h-4 ${generationProgress >= 60 ? 'text-emerald-500' : 'text-slate-300'}`} />
                                            Kenar efektleri ve pan-zoom uygulandı
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <CheckCircle2 className={`w-4 h-4 ${generationProgress >= 90 ? 'text-emerald-500' : 'text-slate-300'}`} />
                                            Müzik senkronizasyonu tamamlandı
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full grid lg:grid-cols-2 gap-8">
                                    {/* Video Player Mock */}
                                    <div className="aspect-[9/16] bg-black rounded-3xl overflow-hidden relative shadow-2xl mx-auto w-full max-w-sm">
                                        {/* Fake Video Content */}
                                        <img src={selectedImages[0]} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110">
                                                <Play className="w-8 h-8 ml-1" />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                            <div className="flex gap-2 mb-3">
                                                <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded">Trend Müzik</span>
                                                <span className="px-2 py-1 bg-white/20 backdrop-blur text-white text-[10px] font-bold rounded">AI Ses</span>
                                            </div>
                                            <h4 className="text-white font-bold leading-tight">Yılın en rahat ayakkabısıyla tanışın! 🔥 Yüksek taban teknolojisi...</h4>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col justify-center space-y-6">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full self-start font-bold border border-emerald-500/20">
                                            <CheckCircle2 className="w-5 h-5" /> Video Başarıyla Üretildi
                                        </div>
                                        
                                        <h2 className="text-3xl font-black">Mükemmel bir Reels!</h2>
                                        <p className="text-slate-500">Videonuz sosyal medya platformlarında paylaşılmaya ve dikkat çekmeye hazır.</p>
                                        
                                        <div className="flex flex-col gap-3">
                                            <button className="flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                                <Download className="w-5 h-5" /> MP4 Olarak İndir (1080p)
                                            </button>
                                            <button className="flex items-center justify-center gap-2 p-4 border border-border rounded-xl font-bold hover:bg-surface transition-all">
                                                TikTok Hesabıma Gönder
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setStep(1);
                                                    setGenerationProgress(0);
                                                }}
                                                className="flex items-center justify-center gap-2 p-4 mt-4 text-slate-500 hover:text-foreground font-bold transition-all"
                                            >
                                                Yeni Video Üret
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function Zap(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
}
