"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Sparkles, Target, Mic2, Tag, 
    ArrowRight, Save, Copy, CheckCircle2, FileText
} from 'lucide-react';
import Link from 'next/link';

export default function BlogStudioPage() {
    const [step, setStep] = useState(1);
    const [productLink, setProductLink] = useState('https://pazaryonetimi.com/urun/kosu-ayakkabisi-x1');
    const [audience, setAudience] = useState('Sporcular');
    const [tone, setTone] = useState('İlham Verici');
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [blogTitle, setBlogTitle] = useState('');
    const [blogContent, setBlogContent] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const targetAudiences = ['Genel', 'Sporcular', 'Öğrenciler', 'Bebekli Aileler', 'Profesyoneller'];
    const tones = ['Samimi', 'Kurumsal', 'İlham Verici', 'Eğlenceli', 'Aciliyet Yaratan'];

    const finalTitle = 'Bu Yılın En İyi Koşu Ayakkabısı: Performansınızı Neden Artıracak?';
    const finalContent = 'Her sabah koşuya çıkarken sizi motive eden şey nedir? Sadece temiz hava mı yoksa her adımda hissettiğiniz o kusursuz konfor mu? Yeni CloudWalker X1 modeli, sadece bir ayakkabı değil, koşu deneyiminizi tamamen değiştirecek bir mühendislik harikası.\n\n### 1. Ultra Hafif Yapı ile Yer Çekimine Meydan Okuyun\nPek çok sporcu, uzun mesafe koşularında ayakkabılarının bir süre sonra ağırlaştığını hisseder. Bu modelde kullanılan mikro-köpük teknolojisi...\n\n### 2. Gelişmiş Zemin Tutuşu\nYağmurlu havalarda koşmaktan çekinmeyin! Özel olarak tasarlanmış kauçuk dış taban, ıslak zeminlerde bile mükemmel tutuş sağlayarak sakatlanma riskini minimuma indirir.\n\n### 3. Nefes Alan Yüzey\nTüm gün ayağınızda kalsa bile koku ve terleme yapmayan örgü kumaşı sayesinde...';

    const generateBlog = () => {
        setIsGenerating(true);
        setStep(2);
        setBlogTitle('');
        setBlogContent('');

        setTimeout(() => {
            let titleIdx = 0;
            const titleInterval = setInterval(() => {
                setBlogTitle(finalTitle.substring(0, titleIdx + 1));
                titleIdx++;
                if (titleIdx === finalTitle.length) {
                    clearInterval(titleInterval);
                    
                    let contentIdx = 0;
                    const contentInterval = setInterval(() => {
                        setBlogContent(finalContent.substring(0, contentIdx + 1));
                        contentIdx += 2; // Write 2 chars at a time for speed
                        
                        if (contentIdx >= finalContent.length) {
                            setBlogContent(finalContent); // Ensure it ends exactly
                            clearInterval(contentInterval);
                            setIsGenerating(false);
                        }
                    }, 20); // Faster typing effect for long blog
                }
            }, 30);
        }, 800);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`# ${blogTitle}\n\n${blogContent}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary" />
                        E-Ticaret Blog Jeneratörü
                    </h1>
                    <p className="text-slate-500 mt-2">Ürünlerinizi anlatan SEO uyumlu makaleleri saniyeler içinde yazdırın, organik trafiğinizi patlatın.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold border border-amber-500/20">
                        ⚡ Maliyet: 2 Kredi / Makale
                    </span>
                    <Link href="/dashboard/ai-tools">
                        <button className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-surface transition-colors">
                            Geri Dön
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* SETTINGS PANEL (Left Sidebar) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface border border-border rounded-[2xl] p-6 space-y-6">
                        <h3 className="font-bold flex items-center gap-2 border-b border-border pb-4">
                            <Settings2 className="w-5 h-5 text-primary" /> Makale Ayarları
                        </h3>
                        
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500">Ürün Linki veya Adı</label>
                            <div className="relative">
                                <Tag className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    value={productLink}
                                    onChange={(e) => setProductLink(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 ring-primary/50"
                                    placeholder="Ürün adı veya mağaza linki..."
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500">Hedef Kitle</label>
                            <div className="flex flex-wrap gap-2">
                                {targetAudiences.map(aud => (
                                    <button
                                        key={aud}
                                        onClick={() => setAudience(aud)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${audience === aud ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background border border-border text-slate-500 hover:bg-white/5'}`}
                                    >
                                        {aud}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-500">Yazım Tonu</label>
                            <div className="flex flex-wrap gap-2">
                                {tones.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTone(t)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${tone === t ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-background border border-border text-slate-500 hover:bg-white/5'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={generateBlog}
                            disabled={step === 2 && isGenerating}
                            className="w-full py-4 mt-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            <Sparkles className="w-5 h-5" /> 
                            Makaleyi Yaz (2 Kredi)
                        </button>
                    </div>
                </div>

                {/* EDITOR / OUTPUT PANEL (Right Side) */}
                <div className="lg:col-span-8">
                    <div className="bg-surface border border-border rounded-[2xl] p-6 lg:p-10 min-h-[600px] flex flex-col relative">
                        {step === 1 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <FileText className="w-20 h-20 text-slate-300 dark:text-slate-700" />
                                <h3 className="text-xl font-bold">Boş Sayfa</h3>
                                <p className="text-slate-500 max-w-sm">Sol taraftaki ayarları tamamlayıp makale üret butonuna basarak ilk blog yazınızı oluşturun.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-8 animate-in slide-in-from-right-4 duration-500">
                                {/* Title Area */}
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-foreground leading-tight min-h-[40px]">
                                        {blogTitle}
                                        {isGenerating && blogTitle.length < finalTitle.length && (
                                            <span className="inline-block w-3 h-8 bg-primary ml-1 animate-pulse align-middle" />
                                        )}
                                    </h2>
                                </div>

                                {/* Content Area */}
                                <div className="prose prose-slate dark:prose-invert max-w-none w-full flex-1">
                                    <div className="whitespace-pre-wrap text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                        {blogContent}
                                        {isGenerating && blogTitle.length === finalTitle.length && (
                                            <span className="inline-block w-2.5 h-6 bg-primary ml-1 animate-pulse align-middle" />
                                        )}
                                    </div>
                                </div>

                                {/* Actions Base */}
                                {!isGenerating && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="pt-8 border-t border-border flex flex-wrap gap-4"
                                    >
                                        <button 
                                            onClick={copyToClipboard}
                                            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex-1"
                                        >
                                            {isCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                            {isCopied ? 'Kopyalandı!' : 'Metni Kopyala'}
                                        </button>
                                        
                                        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex-1">
                                            <Save className="w-5 h-5" /> Blog'a Kaydet
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
