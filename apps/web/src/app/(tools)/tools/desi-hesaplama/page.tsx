"use client";

import React, { useState } from 'react';
import { Package, Scale, MoveDiagonal, MoveHorizontal, MoveVertical, HelpCircle, Truck } from 'lucide-react';
import Head from 'next/head';

export default function DesiCalculatorPage() {
    const [weight, setWeight] = useState<number>(2);
    const [width, setWidth] = useState<number>(20);
    const [length, setLength] = useState<number>(30);
    const [height, setHeight] = useState<number>(15);

    // Compute desi using the formula: (Width * Length * Height) / 3000
    const volumetricWeight = (width * length * height) / 3000;
    
    // Billed weight is the larger of the actual weight and the volumetric weight (desi)
    const desi = Math.max(weight, volumetricWeight);

    return (
        <div className="space-y-8">
            <Head>
                <title>Ücretsiz Kargo Desi Hesaplama Aracı | Pazaryonetimi</title>
                <meta name="description" content="Kargo gönderileriniz için hacimsel ağırlık (Desi) hesaplama işlemini saniyeler içinde gerçekleştirin." />
            </Head>

            <div className="bg-white dark:bg-surface border border-border rounded-3xl p-8 lg:p-10 shadow-sm">
                <div className="mb-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-bold mb-4">
                        <Truck className="w-4 h-4" /> E-Ticaret Aracı
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        Kargo Desi (Hacimsel Ağırlık) <br /> Hesaplayıcı
                    </h1>
                    <p className="text-slate-500 max-w-2xl text-base leading-relaxed">
                        Kargo firmalarının fiyatlandırmada kullandığı "büyük olan geçerlidir" mantığına göre ürünlerinizin kaç desi/kg sayılacağını anında öğrenin.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Geçerli Ağırlık (kg)</label>
                            <div className="relative">
                                <Scale className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="number" min="0" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-background border border-border rounded-xl pl-10 pr-4 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50"
                                    placeholder="Örn: 2 kg"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Koli / Paket Boyutları</h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">En (cm)</label>
                                    <div className="relative">
                                        <MoveHorizontal className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input 
                                            type="number" min="0" value={width} onChange={(e) => setWidth(Number(e.target.value))}
                                            className="w-full bg-white dark:bg-background border border-border rounded-xl pl-10 pr-4 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Boy (cm)</label>
                                    <div className="relative">
                                        <MoveDiagonal className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input 
                                            type="number" min="0" value={length} onChange={(e) => setLength(Number(e.target.value))}
                                            className="w-full bg-white dark:bg-background border border-border rounded-xl pl-10 pr-4 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500">Yükseklik (cm)</label>
                                    <div className="relative">
                                        <MoveVertical className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input 
                                            type="number" min="0" value={height} onChange={(e) => setHeight(Number(e.target.value))}
                                            className="w-full bg-white dark:bg-background border border-border rounded-xl pl-10 pr-4 py-3 font-bold focus:outline-none focus:ring-2 ring-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 lg:p-10 border border-border flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px]" />
                        
                        <div className="text-center space-y-6 relative z-10">
                            <Package className="w-16 h-16 text-blue-500 mx-auto opacity-80" />
                            
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    Kargo Faturasına Yansıyacak Desi
                                </h3>
                                <div className="text-6xl font-black text-slate-900 dark:text-white mb-2">
                                    {desi.toFixed(2)}
                                </div>
                                <p className="text-sm font-medium text-slate-500">
                                    {weight > volumetricWeight 
                                        ? "Ağırlık (kg), hacimsel ağırlıktan daha büyüktür. Fiziksel ağırlık baz alındı." 
                                        : "Hacimsel ağırlık (Desi), ağırlıktan daha büyüktür. Hacim baz alındı."}
                                </p>
                            </div>
                            
                            <div className="pt-8 border-t border-border mt-8 flex justify-around">
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Ağırlık</div>
                                    <div className="text-xl font-bold">{weight} kg</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Hacim Formülü</div>
                                    <div className="text-xl font-bold">{volumetricWeight.toFixed(2)} D</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Content Text */}
            <div className="prose prose-slate dark:prose-invert max-w-4xl mx-auto pt-10 px-4">
                <h2>Önemli: Desi Nedir ve Nasıl Hesaplanır?</h2>
                <p>Kargo şirketleri kolilerin gönderim maliyetini belirlerken, gönderinin sadece ağırlığını dikkate almaz. Paketin kargo aracında ne kadar yer kapladığı da hayati bir unsurdur. Desi işlemi, (En x Boy x Yükseklik) / 3000 standart formülü ile hesaplanır. Kargo firması, ağırlık ile desi'yi kıyaslayarak hangisi büyükse faturayı ona göre keser.</p>
                <p>Sürekli e-ticaret kargolarınızı teker teker tasarlamak yerine, <strong>Pazaryonetimi</strong> gelişmiş paket optimizasyonuyla desi hesaplarınızı ürün listenize bir kez tanımlayabilir ve tüm sipariş faturası kesme işlemlerinde saniyeler kazanabilirsiniz.</p>
            </div>
        </div>
    );
}
