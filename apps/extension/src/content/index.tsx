"use client";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    LayoutDashboard,
    BarChart3,
    Zap,
    Copy,
    History,
    X,
    TrendingUp,
    AlertCircle
} from "lucide-react";

const AssistantOverlay = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [productInfo, setProductInfo] = useState<{ title: string; price: string; sku?: string } | null>(null);

    const handleScrape = () => {
        const data = {
            title: productInfo?.title,
            price: productInfo?.price,
            url: window.location.href,
            platform: window.location.hostname.includes('trendyol') ? 'TRENDYOL' :
                window.location.hostname.includes('amazon') ? 'AMAZON' : 'HEPSIBURADA',
            timestamp: new Date().toISOString()
        };

        chrome.runtime.sendMessage({ type: "SCRAPE_PRODUCT", data }, (response) => {
            if (response?.success) {
                alert("Ürün verisi başarıyla platforma aktarıldı!");
            }
        });
    };

    useEffect(() => {
        const detect = () => {
            const title = (document.querySelector('h1') as HTMLElement)?.innerText;

            // Trendyol specific
            let price = (document.querySelector('.prc-dsc') as HTMLElement)?.innerText;

            // Hepsiburada specific
            if (!price) price = (document.querySelector('[data-test-id="price-current-price"]') as HTMLElement)?.innerText;

            // Amazon specific
            if (!price) price = (document.querySelector('.a-price-whole') as HTMLElement)?.innerText;

            if (title) {
                setProductInfo({ title, price: price || 'Tespit edilemedi' });
            }
        };

        detect();
        // Re-detect on dynamic changes if needed
    }, []);

    if (!isVisible) return (
        <button
            onClick={() => setIsVisible(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 bg-orange-600 text-white p-3 rounded-l-2xl shadow-2xl z-[99999] hover:bg-orange-700 transition-all font-bold flex items-center gap-2"
        >
            <LayoutDashboard size={20} />
            <span className="hidden group-hover:block">Asistan</span>
        </button>
    );

    return (
        <div className="fixed right-4 top-20 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 z-[99999] overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 bg-orange-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LayoutDashboard size={18} />
                    <span className="font-black text-sm uppercase tracking-wider">Pazaryönetimi Asistanı</span>
                </div>
                <button onClick={() => setIsVisible(false)} className="hover:bg-orange-500 p-1 rounded-lg transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5 flex-1 overflow-auto">
                {productInfo ? (
                    <>
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tespit Edilen Ürün</h3>
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-tight">
                                {productInfo.title}
                            </div>
                            <div className="text-lg font-black text-orange-600 mt-1">
                                {productInfo.price}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all gap-2 group">
                                <History size={20} className="text-slate-500 group-hover:text-orange-500" />
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Fiyat Takibi</span>
                            </button>
                            <button
                                onClick={handleScrape}
                                className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all gap-2 group"
                            >
                                <Copy size={20} className="text-slate-500 group-hover:text-orange-500" />
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Veriyi Kopyala</span>
                            </button>
                        </div>

                        <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-200 dark:border-orange-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle size={14} className="text-orange-600" />
                                <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase">AI Analizi</span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                Analiz verisi yok. Gercek analiz icin panelden analiz baslatin.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="py-10 text-center space-y-3">
                        <TrendingUp size={32} className="mx-auto text-slate-300" />
                        <p className="text-xs font-bold text-slate-500">Ürün sayfası tespit edilemedi.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 flex items-center justify-between">
                <button className="text-[10px] font-black text-slate-500 uppercase hover:text-orange-600 transition-colors flex items-center gap-1">
                    <Zap size={12} /> Panele Git
                </button>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">v1.0.0</div>
            </div>
        </div>
    );
};

// Injection logic
const inject = () => {
    const root = document.createElement("div");
    root.id = "pazaryonetimi-asistan-root";
    document.body.appendChild(root);
    createRoot(root).render(<AssistantOverlay />);
};

// Ensure styles are available
const style = document.createElement("style");
style.textContent = `
    @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
    #pazaryonetimi-asistan-root {
        all: initial;
    }
    #pazaryonetimi-asistan-root * {
        font-family: 'Inter', sans-serif;
    }
`;
document.head.appendChild(style);

inject();
