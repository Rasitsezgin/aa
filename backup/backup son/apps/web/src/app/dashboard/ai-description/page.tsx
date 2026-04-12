"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wand2, Sparkles, Copy, RefreshCw, Settings, Globe, Tag,
    FileText, Image, Loader2, Check, ChevronDown, Star
} from 'lucide-react';

const PLATFORMS = ['Trendyol', 'Hepsiburada', 'Amazon', 'N11', 'Çiçeksepeti'];
const TONES = [
    { id: 'professional', label: 'Profesyonel', emoji: '💼' },
    { id: 'friendly', label: 'Samimi', emoji: '😊' },
    { id: 'luxury', label: 'Lüks', emoji: '✨' },
    { id: 'fun', label: 'Eğlenceli', emoji: '🎉' },
    { id: 'technical', label: 'Teknik', emoji: '🔧' },
];

const SAMPLE_DESCRIPTIONS: Record<string, string> = {
    professional: `**iPhone 15 Pro Max Premium Silikon Kılıf**

📱 Apple iPhone 15 Pro Max modeline özel tasarlanmış yüksek kaliteli silikon kılıf ile telefonunuzu maksimum koruma altına alın.

**Ürün Özellikleri:**
• Hassas kalıp teknolojisi ile birebir uyum
• MagSafe uyumlu tasarım
• Askeri standartlara uygun darbe emici yapı (MIL-STD-810G)
• Yükseltilmiş kenar koruması ile kamera ve ekran güvenliği
• Kir tutmayan, kolay temizlenen premium silikon malzeme
• Ultra ince profil (1.2mm) - cep dostu tasarım

**Teknik Detaylar:**
- Malzeme: Sıvı silikon + PC çerçeve
- Ağırlık: 28g
- Renk: Gece Mavisi
- Garanti: 1 yıl üretici garantisi

📦 Aynı gün kargo | 🔄 14 gün koşulsuz iade | ⭐ 4.8/5 müşteri puanı`,

    friendly: `Hey! 👋 iPhone 15 Pro Max'in için harika bir kılıf buldun! 🎉

Bu kılıf tam sana göre çünkü:
✅ Telefonunu her açıdan koruyor
✅ MagSafe ile uyumlu (şarj cihazın yapışacak!)
✅ Süper ince, cebin şişmiyor
✅ Elinden kayıp düşmüyor (kaymaz yüzey!)

Renk seçenekleri de çok güzel - favorini seç ve telefonuna şıklık kat! 💫

Hem de süper hızlı kargo ile yarın elinde! Beğenmezsen 14 gün içinde iade edebilirsin, hiç sorun yok 😉`,

    luxury: `✨ **Premium Collection — iPhone 15 Pro Max Signature Case**

Uncompromising elegance meets unparalleled protection.

Her detayı özenle tasarlanmış bu özel koleksiyon kılıf, iPhone 15 Pro Max'iniz için en prestijli korumayı sunar. El yapımı kalitesiyle dokunduğunuz an farkı hissedeceksiniz.

🔹 İtalyan tasarım felsefesi
🔹 Sınırlı sayıda üretim
🔹 Premium hediye kutusu ile teslim
🔹 Asıl deri iç kaplama

_"Mükemmellik bir detay değil, bir bütündür."_

🎁 Özel hediye paketi seçeneği mevcut`,
};

export default function AIDescriptionPage() {
    const [productName, setProductName] = useState('iPhone 15 Pro Max Silikon Kılıf');
    const [keywords, setKeywords] = useState('silikon, kılıf, darbe emici, MagSafe, ince');
    const [platform, setPlatform] = useState('Trendyol');
    const [tone, setTone] = useState('professional');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [copied, setCopied] = useState(false);
    const [showSEO, setShowSEO] = useState(false);

    const generate = () => {
        setIsGenerating(true);
        setGeneratedText('');
        setTimeout(() => {
            setGeneratedText(SAMPLE_DESCRIPTIONS[tone] || SAMPLE_DESCRIPTIONS.professional);
            setIsGenerating(false);
        }, 2000);
    };

    const copyText = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const seoScore = generatedText ? 87 : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                        <Wand2 className="w-6 h-6 text-white" />
                    </div>
                    AI Ürün Açıklaması Üretici
                </h1>
                <p className="text-slate-500 mt-1">Yapay zeka ile SEO uyumlu, platforma özel ürün açıklamaları oluşturun</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Panel */}
                <div className="space-y-4">
                    <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Settings className="w-5 h-5 text-slate-400" /> Ayarlar
                        </h2>

                        {/* Product Name */}
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Ürün Adı *</label>
                            <input
                                type="text"
                                value={productName}
                                onChange={e => setProductName(e.target.value)}
                                className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border focus:border-amber-500 focus:outline-none"
                                placeholder="Ürün adını girin..."
                            />
                        </div>

                        {/* Keywords */}
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Anahtar Kelimeler</label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={e => setKeywords(e.target.value)}
                                className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border focus:border-amber-500 focus:outline-none"
                                placeholder="virgülle ayırarak yazın..."
                            />
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {keywords.split(',').filter(Boolean).map((kw, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full">{kw.trim()}</span>
                                ))}
                            </div>
                        </div>

                        {/* Platform */}
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">
                                <Globe className="w-4 h-4 inline mr-1" /> Platform
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PLATFORMS.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPlatform(p)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${platform === p ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-border text-slate-500 hover:text-foreground'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tone */}
                        <div>
                            <label className="text-sm font-medium text-slate-400 block mb-2">Ton</label>
                            <div className="grid grid-cols-3 gap-2">
                                {TONES.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTone(t.id)}
                                        className={`p-3 rounded-xl border text-center transition-all ${tone === t.id ? 'bg-amber-500/20 border-amber-500' : 'border-border hover:border-amber-500/50'}`}
                                    >
                                        <div className="text-lg mb-1">{t.emoji}</div>
                                        <div className="text-xs text-foreground">{t.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generate}
                            disabled={!productName || isGenerating}
                            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Oluşturuluyor...</>
                            ) : (
                                <><Sparkles className="w-4 h-4" /> Açıklama Oluştur</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="space-y-4">
                    <div className="bg-surface rounded-2xl border border-border p-6 min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-400" /> Sonuç
                            </h2>
                            {generatedText && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => generate()} className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-foreground" title="Yeniden oluştur">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button onClick={copyText} className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-foreground" title="Kopyala">
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {isGenerating ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-slate-400">AI ürün açıklaması oluşturuyor...</p>
                                    <p className="text-xs text-slate-600 mt-1">Platform: {platform} · Ton: {TONES.find(t => t.id === tone)?.label}</p>
                                </div>
                            </div>
                        ) : generatedText ? (
                            <div className="flex-1">
                                <div className="prose prose-invert prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
                                    {generatedText}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center">
                                <div>
                                    <Wand2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500">Ürün bilgilerini girin ve</p>
                                    <p className="text-sm text-slate-500">&quot;Açıklama Oluştur&quot; butonuna tıklayın</p>
                                </div>
                            </div>
                        )}

                        {/* SEO Score */}
                        {generatedText && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <button onClick={() => setShowSEO(!showSEO)} className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold ${seoScore >= 80 ? 'border-emerald-500 text-emerald-400' : seoScore >= 60 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'}`}>
                                            {seoScore}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-medium text-foreground">SEO Skoru</div>
                                            <div className="text-xs text-slate-500">{seoScore >= 80 ? 'Çok iyi' : seoScore >= 60 ? 'İyi' : 'Geliştirilebilir'}</div>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showSEO ? 'rotate-180' : ''}`} />
                                </button>
                                {showSEO && (
                                    <div className="mt-3 space-y-2">
                                        {[
                                            { label: 'Anahtar kelime yoğunluğu', score: 92, text: 'Optimal' },
                                            { label: 'Karakter sayısı', score: 85, text: '1.245 / 1.500' },
                                            { label: 'Okunabilirlik', score: 88, text: 'Kolay okunur' },
                                            { label: 'Emoji kullanımı', score: 75, text: 'İyi, fazla değil' },
                                            { label: 'Madde işaretleri', score: 95, text: 'Mükemmel yapılandırma' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400">{item.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-500">{item.text}</span>
                                                    <div className="w-16 h-1.5 bg-background rounded-full">
                                                        <div className={`h-full rounded-full ${item.score >= 80 ? 'bg-emerald-500' : item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${item.score}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
