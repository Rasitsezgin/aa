"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Wand2,
    FileText,
    CheckCircle2,
    UploadCloud,
    X,
    Loader2,
    Sparkles,
    Settings2,
    Share2,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const steps = [
    { id: 1, title: 'Görsel Yükle', icon: ImageIcon, description: 'Ham ürün fotoğrafı' },
    { id: 2, title: 'AI Stüdyo', icon: Wand2, description: 'Arka plan & kalite' },
    { id: 3, title: 'İçerik Üretimi', icon: FileText, description: 'Başlık & açıklama' },
    { id: 4, title: 'Yayınla', icon: Share2, description: 'Mağazalara gönder' }
];

export default function AiWizardPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [imageProgress, setImageProgress] = useState(0);
    const [imageStatus, setImageStatus] = useState('');
    
    // Content Generation State
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [generatedDesc, setGeneratedDesc] = useState('');
    const [generatedTags, setTags] = useState<string[]>([]);
    
    // Sample final mock data
    const mockProcessedImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'; // Clean shoe image
    const finalTitle = 'Premium Erkek Koşu Ayakkabısı - CloudWalker X1';
    const finalDesc = 'Ultra hafif tasarımı ve nefes alabilen özel dokuma üst yüzeyi ile gün boyu konfor sağlar. Gelişmiş taban teknolojisi sayesinde her adımda maksimum yastıklama sunarken, kaymaz kauçuk dış tabanı ile her zeminde güvenli tutuş garanti eder. Spor ve günlük kullanım için idealdir.';
    const finalTags = ['Spor Ayakkabı', 'Koşu', 'Erkek', 'Konfor', 'Premium'];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simulated upload (in a real app, upload via FileReader or directly to server)
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = () => {
        setIsProcessingImage(true);
        setCurrentStep(2);
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setImageProgress(progress);
            
            if (progress <= 30) setImageStatus('Netlik artırılıyor...');
            else if (progress <= 60) setImageStatus('Arka plan temizleniyor...');
            else if (progress <= 90) setImageStatus('Stüdyo ışığı ekleniyor...');
            else setImageStatus('Tamamlanıyor...');

            if (progress >= 100) {
                clearInterval(interval);
                setIsProcessingImage(false);
            }
        }, 300);
    };

    const generateContent = () => {
        setIsGeneratingContent(true);
        setCurrentStep(3);
        setGeneratedTitle('');
        setGeneratedDesc('');
        setTags([]);

        // Simulate typing effect for AI generation
        setTimeout(() => {
            let titleIdx = 0;
            const titleInterval = setInterval(() => {
                setGeneratedTitle(finalTitle.substring(0, titleIdx + 1));
                titleIdx++;
                if (titleIdx === finalTitle.length) {
                    clearInterval(titleInterval);
                    
                    let descIdx = 0;
                    const descInterval = setInterval(() => {
                        setGeneratedDesc(finalDesc.substring(0, descIdx + 1));
                        descIdx++;
                        if (descIdx === finalDesc.length) {
                            clearInterval(descInterval);
                            setTags(finalTags);
                            setIsGeneratingContent(false);
                        }
                    }, 50); // Speed of description typing
                }
            }, 50); // Speed of title typing
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Wand2 className="w-8 h-8 text-primary" />
                        AI Ürün Sihirbazı
                    </h1>
                    <p className="text-slate-500 mt-2">Tek bir fotoğrafla stüdyo kalitesinde görseller ve SEO uyumlu içerikler üretin.</p>
                </div>
                <Link href="/dashboard/ai-tools">
                    <button className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        Vazgeç
                    </button>
                </Link>
            </div>

            {/* Stepper */}
            <div className="bg-surface border border-border rounded-[2rem] p-6">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
                        style={{ width: \`\${((currentStep - 1) / (steps.length - 1)) * 100}%\` }}
                    />
                    
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 \${
                                    isActive 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                    : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400'
                                }\`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="text-center absolute top-14 w-32 -mx-10 hidden sm:block">
                                    <div className={\`text-xs font-bold \${isActive ? 'text-primary' : 'text-slate-500'}\`}>{step.title}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{step.description}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-surface border border-border rounded-[2rem] p-8 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {/* STEP 1: UPLOAD */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center justify-center h-full min-h-[400px]"
                        >
                            <label className="w-full max-w-2xl aspect-video border-2 border-dashed border-primary/30 rounded-3xl flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group relative overflow-hidden">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageUpload}
                                />
                                
                                {selectedImage ? (
                                    <img src={selectedImage} alt="Selected" className="absolute inset-0 w-full h-full object-contain p-4" />
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform mb-6">
                                            <UploadCloud className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">Ürün Görselini Yükle</h3>
                                        <p className="text-slate-500 text-center max-w-sm">
                                            Sürükleyip bırakın veya bilgisayarınızdan seçin. Kötü ışık veya karışık arka plan sorun değil, AI halledecek.
                                        </p>
                                    </>
                                )}
                            </label>

                            {selectedImage && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 flex gap-4"
                                >
                                    <button 
                                        onClick={() => setSelectedImage(null)}
                                        className="px-6 py-3 border border-border rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Tekrar Seç
                                    </button>
                                    <button 
                                        onClick={processImage}
                                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                                    >
                                        Sihire Başla <Sparkles className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: IMAGE PROCESSING */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col lg:flex-row gap-12 items-center min-h-[400px]"
                        >
                            <div className="flex-1 w-full relative">
                                <div className="aspect-square rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 relative border border-border">
                                    {isProcessingImage ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-sm z-10">
                                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                                            <h3 className="text-xl font-bold mb-2">{imageProgress}%</h3>
                                            <p className="text-slate-500 font-medium">{imageStatus}</p>
                                        </div>
                                    ) : null}
                                    
                                    <img 
                                        src={!isProcessingImage ? mockProcessedImage : selectedImage!} 
                                        alt="Processing" 
                                        className="w-full h-full object-cover" 
                                    />
                                    
                                    {/* Scanline effect during processing */}
                                    {isProcessingImage && (
                                        <motion.div 
                                            className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent blur-md"
                                            animate={{ y: ['-100%', '300%'] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        />
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full space-y-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-bold mb-4">
                                        <Settings2 className="w-4 h-4" /> Optimizasyon Ayarları
                                    </div>
                                    <h3 className="text-3xl font-black mb-4">Mükemmel Stüdyo Çekimi</h3>
                                    <p className="text-slate-500 mb-8">Yapay zeka aracımız görseldeki gereksiz detayları sildi, ürününüzü merkeze aldı ve profesyonel e-ticaret sitelerindeki beyaz arka plan standardına uyarladı.</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span>Arka plan temizlendi (Alpha Kanalı eklendi)</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span>Renk ve kontrast dengelendi</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span>Görüntü kalitesi 4K çözünürlüğe yükseltildi</span>
                                    </div>
                                </div>

                                {!isProcessingImage && (
                                    <button 
                                        onClick={generateContent}
                                        className="w-full py-4 mt-8 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                                    >
                                        İçerik Üretimine Geç <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: CONTENT GENERATION */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col lg:flex-row gap-12 min-h-[400px]"
                        >
                            <div className="w-full lg:w-1/3">
                                <div className="aspect-square rounded-3xl overflow-hidden border border-border sticky top-8">
                                    <img src={mockProcessedImage} alt="Final" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full">
                                {isGeneratingContent ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                                        <h3 className="text-2xl font-bold mb-2">Yapay Zeka İçeriği Yazıyor</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto">Görsel analiz ediliyor, en çok aranan anahtar kelimeler bulunuyor ve satış odaklı açıklama oluşturuluyor...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-primary" /> Üretilen Başlık
                                            </label>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-lg font-bold min-h-[60px] flex items-center">
                                                {generatedTitle}
                                                <span className="w-2 h-5 bg-primary ml-1 animate-pulse" style={{ opacity: generatedTitle.length === finalTitle.length ? 0 : 1 }} />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-primary" /> Üretilen Açıklama
                                            </label>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 min-h-[140px] leading-relaxed">
                                                {generatedDesc}
                                                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse align-middle" style={{ opacity: generatedDesc.length === finalDesc.length ? 0 : 1 }} />
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">SEO Etiketleri (Keywords)</label>
                                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                                {generatedTags.map((tag, i) => (
                                                    <motion.span 
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        key={tag} 
                                                        className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium"
                                                    >
                                                        {tag}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>

                                        {generatedDesc.length === finalDesc.length && (
                                            <div className="pt-6 flex gap-4 border-t border-border mt-8">
                                                <button className="flex-1 py-4 border border-border rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                    Yeniden Yaz
                                                </button>
                                                <button 
                                                    onClick={() => setCurrentStep(4)}
                                                    className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                                                >
                                                    Onayla ve Listele
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS / PUBLISH */}
                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center min-h-[400px] max-w-2xl mx-auto space-y-6"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-black text-foreground">Başarıyla Hazırlandı!</h2>
                            <p className="text-slate-500 text-lg">Ürününüz yapay zeka tarafından 1 dakikadan kısa sürede optimize edildi ve pazaryerlerinde listelenmek üzere veritabanına kaydedildi.</p>
                            
                            <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-left my-8">
                                <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-4 mb-4">
                                    <img src={mockProcessedImage} className="w-16 h-16 rounded-lg object-cover" alt="Thumb" />
                                    <div>
                                        <h4 className="font-bold">{finalTitle}</h4>
                                        <p className="text-sm text-emerald-500 font-medium">Satışa Hazır - %98 SEO Skoru</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-md text-xs font-bold">Trendyol</div>
                                    <div className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-md text-xs font-bold">Hepsiburada</div>
                                    <div className="px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-md text-xs font-bold">Shopify</div>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full">
                                <button 
                                    onClick={() => {
                                        setCurrentStep(1);
                                        setSelectedImage(null);
                                    }}
                                    className="flex-1 py-4 border border-border rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Yeni Ürün Ekle
                                </button>
                                <Link href="/dashboard/products" className="flex-1">
                                    <button className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                                        Ürünlere Git
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
