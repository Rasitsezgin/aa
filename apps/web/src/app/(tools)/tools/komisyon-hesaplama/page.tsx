"use client";

import React, { useState } from 'react';
import { Calculator, Tag, Percent, Banknote, HelpCircle, Building2 } from 'lucide-react';
import Head from 'next/head';

export default function CommissionCalculatorPage() {
    const [price, setPrice] = useState<number>(100);
    const [cost, setCost] = useState<number>(50);
    const [commissionRate, setCommissionRate] = useState<number>(15);
    const [shippingCost, setShippingCost] = useState<number>(30);
    const [kdvRate, setKdvRate] = useState<number>(20);

    const marketplaces = [
        { name: 'Trendyol', rate: 15, color: 'bg-orange-500' },
        { name: 'Hepsiburada', rate: 12, color: 'bg-orange-600' },
        { name: 'N11', rate: 10, color: 'bg-red-600' },
        { name: 'Çiçeksepeti', rate: 18, color: 'bg-emerald-600' },
        { name: 'Özel', rate: 0, color: 'bg-slate-500' }
    ];

    // Compute
    const commissionCost = (price * commissionRate) / 100;
    const kdvCost = (price - (price / (1 + (kdvRate / 100))));
    const totalDeductions = commissionCost + shippingCost + cost + kdvCost;
    const netProfit = price - totalDeductions;
    const margin = price > 0 ? (netProfit / price) * 100 : 0;

    return (
        <div className="space-y-8">
            <Head>
                <title>Ücretsiz Trendyol ve Pazaryeri Komisyon Hesaplama Aracı | Pazaryonetimi</title>
                <meta name="description" content="Ürün satış fiyatı üzerinden kesilecek komisyon, kargo ve KDV dahil net karınızı saniyeler içinde anında hesaplayın." />
            </Head>

            <div className="bg-white dark:bg-surface border border-border rounded-3xl p-8 lg:p-10 shadow-sm">
                <div className="mb-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold mb-4">
                        <Calculator className="w-4 h-4" /> E-Ticaret Aracı
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        Pazaryeri Komisyon & <br /> Net Kâr Hesaplayıcı
                    </h1>
                    <p className="text-slate-500 max-w-2xl text-base leading-relaxed">
                        Pazaryerlerinde yaptığınız satışlardan elinize tam olarak ne kadar geçeceğini önceden görün. Sürpriz kesintiler yüzünden para kaybetmeyin.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Inputs */}
                    <div className="space-y-6">
                        {/* Marketplace Presets */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" /> Platform / Pazaryeri Seçin
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {marketplaces.map((mk) => (
                                    <button
                                        key={mk.name}
                                        onClick={() => setCommissionRate(mk.rate)}
                                        className={\`px-4 py-2 rounded-xl text-sm font-bold transition-all \${
                                            commissionRate === mk.rate 
                                            ? '\${mk.color} text-white shadow-lg' 
                                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                        }\`}
                                    >
                                        {mk.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Satış Fiyatı (TL)</label>
                                <div className="relative">
                                    <Tag className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-background border border-border rounded-xl pl-10 pr-4 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Maliyet (TL)</label>
                                <div className="relative">
                                    <Banknote className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="number" min="0" value={cost} onChange={(e) => setCost(Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-background border border-border rounded-xl pl-10 pr-4 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Komisyon (%)</label>
                                <div className="relative">
                                    <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="number" min="0" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-background border border-border rounded-xl pl-9 pr-2 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">KDV (%)</label>
                                <div className="relative">
                                    <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <select 
                                        value={kdvRate} onChange={(e) => setKdvRate(Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-background border border-border rounded-xl pl-9 pr-2 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50 text-sm appearance-none"
                                    >
                                        <option value={20}>20%</option>
                                        <option value={10}>10%</option>
                                        <option value={1}>1%</option>
                                        <option value={0}>0%</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 text-xs truncate">Kargo (TL)</label>
                                <div className="relative">
                                    <Banknote className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-background border border-border rounded-xl pl-9 pr-2 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 lg:p-8 border border-border flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]" />
                        
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6 relative z-10">
                            Hesap Özeti <HelpCircle className="w-4 h-4" />
                        </h3>

                        <div className="space-y-3 mb-8 relative z-10">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                <span>Satış Fiyatı</span>
                                <span className="font-bold text-slate-900 dark:text-white">{price.toFixed(2)} TL</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                <span>Ürün Maliyeti</span>
                                <span className="font-bold text-red-500">-{cost.toFixed(2)} TL</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                <span>Pazaryeri Komisyonu (%{commissionRate})</span>
                                <span className="font-bold text-red-500">-{commissionCost.toFixed(2)} TL</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                <span>Kargo Ücreti</span>
                                <span className="font-bold text-red-500">-{shippingCost.toFixed(2)} TL</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                                <span>Hesaplanan KDV (%{kdvRate})</span>
                                <span className="font-bold text-red-500">-{kdvCost.toFixed(2)} TL</span>
                            </div>
                        </div>

                        <div className="border-t border-border pt-6 relative z-10">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-sm font-bold text-slate-500">Net Kârınız</div>
                                    <div className={\`text-4xl lg:text-5xl font-black mt-1 \${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}\`}>
                                        {netProfit.toFixed(2)} TL
                                    </div>
                                </div>
                                <div className={\`px-3 py-1.5 rounded-xl text-sm font-bold \${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}\`}>
                                    % {margin.toFixed(1)} Marj
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Content Text */}
            <div className="prose prose-slate dark:prose-invert max-w-4xl mx-auto pt-10 px-4">
                <h2>Pazaryeri Komisyonu Nasıl Paketlenip Hesaplanır?</h2>
                <p>Türkiye'nin önde gelen e-ticaret siteleri (Trendyol, Hepsiburada, N11, Amazon) ürününüzün listeleme kategorisine göre sizden ortalama %10 ila %25 aralığında komisyon kesmektedir. Bu aracı kullanarak kdv ve kargo bedellerini kâr-zarar marjınızdan gerçek zamanlı düşüp ürün satış performansınızı önceden görebilirsiniz.</p>
                <p>İşletmenizi her siparişte kârlı tutmak, sadece güçlü bir e-ticaret stratejisi değil, doğru entegrasyonlar yönetimiyle mümkündür. <strong>Pazaryonetimi</strong> yazılımını kullanarak tüm kâr-zarar hesaplarınızı tek panelden otomatikleştirebilirsiniz.</p>
            </div>
        </div>
    );
}
