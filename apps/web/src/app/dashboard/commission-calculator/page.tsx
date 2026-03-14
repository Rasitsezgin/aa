"use client";

import React, { useState, useEffect } from 'react';
import { motion as m } from 'framer-motion';
import {
    Calculator, DollarSign, PieChart, ShoppingCart,
    ArrowRight, Info, AlertTriangle, CheckCircle2,
    Store, Truck, TrendingUp, Download, RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface CalculationResult {
    platform: string;
    commissionRate: number;
    commissionAmount: number;
    shippingFee: number;
    vatAmount: number;
    serviceFee: number;
    netProfit: number;
    margin: number;
}

const platforms = [
    { id: 'trendyol', name: 'Trendyol', logo: 'https://cdn.dsmcdn.com/sfid/production/trendyol-logo-2.png' },
    { id: 'hepsiburada', name: 'Hepsiburada', logo: 'https://images.hepsiburada.net/assets/sfid/production/hepsiburada-logo.png' },
    { id: 'amazon', name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { id: 'n11', name: 'N11', logo: 'https://n11scdn.akamaized.net/a1/org/logo/n11-logo.svg' }
];

export default function CommissionCalculatorPage() {
    const [price, setPrice] = useState<string>('500');
    const [cost, setCost] = useState<string>('200');
    const [category, setCategory] = useState<string>('Elektronik');
    const [isCalculating, setIsCalculating] = useState(false);
    const [results, setResults] = useState<CalculationResult[]>([]);

    const calculate = async () => {
        setIsCalculating(true);
        try {
            // In a real scenario, this would be an API call
            // const data = await apiClient.request('/finance/calculate-commission', { method: 'POST', body: JSON.stringify({ price, cost, category }) });

            // For now, simulating API response with realistic formulas
            await new Promise(r => setTimeout(r, 600));

            const pVal = parseFloat(price) || 0;
            const cVal = parseFloat(cost) || 0;

            const mockResults: CalculationResult[] = [
                { platform: 'Trendyol', commissionRate: 18, commissionAmount: pVal * 0.18, shippingFee: 45, vatAmount: pVal * 0.20, serviceFee: 5, netProfit: 0, margin: 0 },
                { platform: 'Hepsiburada', commissionRate: 15, commissionAmount: pVal * 0.15, shippingFee: 42, vatAmount: pVal * 0.20, serviceFee: 4, netProfit: 0, margin: 0 },
                { platform: 'Amazon', commissionRate: 12, commissionAmount: pVal * 0.12, shippingFee: 38, vatAmount: pVal * 0.20, serviceFee: 0, netProfit: 0, margin: 0 },
                { platform: 'N11', commissionRate: 20, commissionAmount: pVal * 0.20, shippingFee: 40, vatAmount: pVal * 0.20, serviceFee: 2, netProfit: 0, margin: 0 },
            ].map(res => {
                const totalExp = res.commissionAmount + res.shippingFee + res.vatAmount + res.serviceFee + cVal;
                const net = pVal - totalExp;
                return { ...res, netProfit: net, margin: (net / pVal) * 100 };
            });

            setResults(mockResults);
        } catch { /* error */ }
        setIsCalculating(false);
    };

    useEffect(() => {
        calculate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                    <Calculator className="w-8 h-8 text-indigo-500" /> Komisyon Tahminleyici
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Satış fiyatı ve maliyet üzerinden net kârınızı hesaplayın</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-4">Girdi Bilgileri</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Satış Fiyatı (₺)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Ürün Maliyeti (₺)</label>
                                <div className="relative">
                                    <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 text-foreground focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Ürün Kategorisi</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:border-indigo-500/50"
                                >
                                    <option>Elektronik</option>
                                    <option>Moda & Giyim</option>
                                    <option>Ev & Yaşam</option>
                                    <option>Kozmetik</option>
                                    <option>Anne & Bebek</option>
                                </select>
                            </div>
                            <button
                                onClick={calculate}
                                disabled={isCalculating}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                            >
                                {isCalculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                                {isCalculating ? 'Hesaplanıyor...' : 'Kar Karşılaştır'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                        <Info className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-600/80 leading-relaxed font-medium">
                            Hesaplamalar pazaryerlerinin standart komisyon oranları ve ortalama kargo maliyetleri üzerinden yapılmaktadır. Sözleşmenize özel oranlar farklılık gösterebilir.
                        </p>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-foreground">Karşılaştırmalı Analiz</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((res, i) => (
                            <m.div
                                key={res.platform}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-surface rounded-2xl border border-border overflow-hidden group hover:border-indigo-500/30 transition-all"
                            >
                                <div className="p-5 border-b border-border bg-background/30 flex items-center justify-between">
                                    <div className="font-black text-foreground">{res.platform}</div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${res.margin > 20 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        %{res.margin.toFixed(1)} Marj
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Komisyon (%{res.commissionRate})</span>
                                        <span className="font-bold text-red-400">-₺{res.commissionAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Kargo Maliyeti</span>
                                        <span className="font-bold text-red-400">-₺{res.shippingFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">KDV (%20)</span>
                                        <span className="font-bold text-red-400">-₺{res.vatAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-border pt-3 flex justify-between">
                                        <span className="font-bold text-foreground">Net Kâr</span>
                                        <span className={`text-xl font-black ${res.netProfit > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            ₺{res.netProfit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </m.div>
                        ))}
                    </div>

                    <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <PieChart size={120} className="text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-4">Gider Dağılımı</h3>
                        <div className="space-y-4 relative z-10">
                            {results[0] && [
                                { label: 'Komisyon', val: results[0].commissionAmount, color: 'bg-indigo-500' },
                                { label: 'Kargo', val: results[0].shippingFee, color: 'bg-blue-500' },
                                { label: 'Vergi', val: results[0].vatAmount, color: 'bg-purple-500' }
                            ].map(item => {
                                const total = results[0].commissionAmount + results[0].shippingFee + results[0].vatAmount;
                                const pct = (item.val / total) * 100;
                                return (
                                    <div key={item.label} className="space-y-1">
                                        <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-500">
                                            <span>{item.label}</span>
                                            <span>%{pct.toFixed(0)}</span>
                                        </div>
                                        <div className="h-2 bg-background rounded-full overflow-hidden">
                                            <m.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                className={`h-full ${item.color}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
