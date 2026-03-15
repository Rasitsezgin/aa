"use client";

import React, { useEffect, useState } from 'react';
import {
    ChevronLeft,
    Sparkles,
    Image as ImageIcon,
    Type,
    TrendingUp,
    BarChart3,
    RefreshCcw,
    Check,
    Zap,
    Maximize2,
    Palette,
    ArrowRight,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function ProductDetail() {
    const params = useParams<{ id: string }>();
    const productId = params?.id ?? '';
    const [activeTab, setActiveTab] = useState('details');
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [product, setProduct] = useState({
        id: productId,
        name: '',
        sku: '',
        price: 0,
        stock: 0,
        category: '',
        description: '',
        platforms: [] as string[],
        seoScore: 0,
        image: '',
    });
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const loadProduct = async () => {
            if (!productId) {
                setHasLoaded(true);
                return;
            }

            const candidates = [`/api/products/${productId}`, `/api/product/${productId}`];

            for (const url of candidates) {
                try {
                    const res = await fetch(url, { cache: 'no-store' });
                    if (!res.ok) continue;
                    const payload = await res.json();
                    const data = payload?.data ?? payload ?? {};

                    setProduct({
                        id: String(data.id ?? productId),
                        name: String(data.name ?? ''),
                        sku: String(data.sku ?? ''),
                        price: Number(data.price ?? 0),
                        stock: Number(data.stock ?? 0),
                        category: String(data.category ?? ''),
                        description: String(data.description ?? ''),
                        platforms: Array.isArray(data.platforms) ? data.platforms.map(String) : [],
                        seoScore: Number(data.seoScore ?? 0),
                        image: String(data.image ?? ''),
                    });
                    setHasLoaded(true);
                    return;
                } catch {
                    continue;
                }
            }

            setHasLoaded(true);
        };

        void loadProduct();
    }, [productId]);

    const handleAiSEO = async () => {
        setIsAiProcessing(true);
        try {
            await fetch('/api/ai/copilot/quick-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({
                    action: 'optimize_seo',
                    context: { page: `/dashboard/products/${productId}`, productId },
                }),
            });
        } finally {
            setIsAiProcessing(false);
        }
    };

    const hasProductData = Boolean(product.name || product.sku || product.description || product.image);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                    <ChevronLeft size={16} /> Ürün Listesine Dön
                </Link>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-xs font-bold transition-all">
                        <RefreshCcw size={14} /> Senkronize Et
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        Kaydet
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visual Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface rounded-3xl border border-border p-4 relative group overflow-hidden">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-background relative">
                            {product.image ? (
                                <Image src={product.image} alt={product.name || 'Urun'} fill className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">Gorsel verisi bulunamadi</div>
                            )}
                        </div>
                        <div className="absolute top-8 right-8 flex flex-col gap-2">
                            <button className="p-2.5 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-xl text-blue-500 hover:scale-110 transition-all border border-blue-500/20">
                                <Maximize2 size={18} />
                            </button>
                            <button className="p-2.5 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-xl text-purple-500 hover:scale-110 transition-all border border-purple-500/20">
                                <Palette size={18} />
                            </button>
                        </div>

                        {/* Background Removal Panel */}
                        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-500" />
                                <span className="text-xs font-bold lowercase tracking-tight">AI Arka Plan Silici</span>
                            </div>
                            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">Sihri Başlat</button>
                        </div>
                    </div>

                    {/* Sync Status */}
                    <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Pazaryeri Durumu</h4>
                        <div className="space-y-3">
                            {product.platforms.map(p => (
                                <div key={p} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-xs font-bold">{p}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">AKTİF</span>
                                </div>
                            ))}
                            {product.platforms.length === 0 && (
                                <div className="text-xs text-slate-500">Platform verisi bulunamadi.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Tabs */}
                    <div className="flex border-b border-border gap-8">
                        {['details', 'ai-tools', 'analytics'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary' : 'text-slate-400'}`}
                            >
                                {tab === 'details' ? 'Detaylar' : tab === 'ai-tools' ? 'AI Araçları' : 'Analitik'}
                                {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'details' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ürün Adı</label>
                                    <input value={product.name} readOnly className="w-full bg-surface border border-border rounded-xl p-4 text-xl font-black outline-none focus:border-primary transition-all shadow-sm" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fiyat</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 uppercase">₺</span>
                                            <input value={product.price} readOnly className="w-full bg-surface border border-border rounded-xl py-4 pl-10 pr-4 font-black outline-none focus:border-primary transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stok</label>
                                        <input value={product.stock} readOnly className="w-full bg-surface border border-border rounded-xl p-4 font-black outline-none focus:border-primary transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Açıklama</label>
                                    <textarea rows={5} value={product.description} readOnly className="w-full bg-surface border border-border rounded-2xl p-4 text-sm leading-relaxed outline-none focus:border-primary transition-all custom-scrollbar" />
                                </div>
                                {hasLoaded && !hasProductData && (
                                    <div className="text-xs text-slate-500">Urun verisi bulunamadi.</div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'ai-tools' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-700 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Sparkles size={20} className="text-yellow-300" />
                                            <span className="text-xs font-black uppercase tracking-widest opacity-80">AI SEO GENERATOR</span>
                                        </div>
                                        <h3 className="text-2xl font-black mb-4 leading-tight italic">Ürününüze Turbo Modu Açın.</h3>
                                        <p className="text-sm text-indigo-100/80 mb-8 leading-relaxed">Gemini AI ürün detaylarınızı analiz eder ve en yüksek dönüşüm getirecek başlıkları/anahtar kelimeleri anında üretir.</p>
                                        <button
                                            onClick={handleAiSEO}
                                            disabled={isAiProcessing}
                                            className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-xs font-black tracking-widest uppercase hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                                        >
                                            {isAiProcessing ? (
                                                <> <RefreshCcw size={16} className="animate-spin" /> ANALİZ EDİLİYOR... </>
                                            ) : (
                                                <> <Zap size={16} className="fill-indigo-600" /> SİHİRLİ DOKUNUŞ </>
                                            )}
                                        </button>
                                    </div>
                                    {/* Abstract icons pattern */}
                                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                        <Bot size={200} />
                                    </div>
                                </div>

                                <div className="bg-surface border border-border p-8 rounded-[32px] space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">SEO SKORUNUZ</span>
                                        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 flex items-center justify-center text-sm font-black text-blue-500">
                                            {product.seoScore}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { l: "Başlık Optimizasyonu", v: true },
                                            { l: "Anahtar Kelime Yoğunluğu", v: true },
                                            { l: "Görsel Alt Etiketleri", v: false },
                                            { l: "Platform Uyumluluğu", v: true }
                                        ].map((check, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{check.l}</span>
                                                {check.v ? <Check size={16} className="text-green-500" /> : <RefreshCcw size={14} className="text-orange-400" />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-[10px] text-slate-500 leading-relaxed italic">"Ürün açıklamasına 3 adet 'Kablosuz' anahtar kelimesi ekleyerek skoru %95'e çıkarabilirsiniz."</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

const Bot = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);
