'use client';

import React, { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    ShieldAlert,
    TrendingUp,
    Target,
    Activity,
    AlertTriangle,
    ChevronRight,
    RefreshCcw,
    Maximize2
} from 'lucide-react';
import { StrategicMatrix } from '@/components/admin/StrategicMatrix';

export default function WarRoomPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [anomalies, setAnomalies] = useState([
        {
            id: '1',
            title: 'Kritik Fiyat Farkı',
            type: 'PRICE_DROP',
            details: 'Rakip X, Apple iPhone 15 için fiyatı %30 düşürdü.',
            severity: 'CRITICAL',
            time: '2 dk önce',
            platform: 'Trendyol'
        },
        {
            id: '2',
            title: 'Stok Erime Riski',
            type: 'STOCKOUT_RISK',
            details: 'Deri Ceket (L) satış hızı %200 arttı. 12 saat içinde stok bitebilir.',
            severity: 'WARNING',
            time: '15 dk önce',
            platform: 'Hepsiburada'
        }
    ]);

    const [stats, setStats] = useState({
        velocity: '₺12.4K/saat',
        anomalies: '2 Aktif',
        competitiveness: '%94.2',
        prediction: 'Kuvvetli Yükseliş'
    });

    const [isLaunching, setIsLaunching] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    const handleLaunch = async () => {
        setIsLaunching(true);
        setLastAction('AI Ajanı piyasayı tarıyor...');

        try {
            // Simulating API call for now or using absolute URL if needed
            const res = await fetch('/api/ai/satis-pilotu/run', {
                method: 'POST',
                headers: { 'x-tenant-id': 'default' } // Real tenant-id should come from session
            });
            const data = await res.json();

            if (data.launchedActions > 0) {
                setLastAction(`${data.launchedActions} otonom aksiyon başarıyla alındı!`);
            } else {
                setLastAction('Her şey yolunda, müdahaleye gerek duyulmadı.');
            }
        } catch (error) {
            setLastAction('Savunma hattı başlatılamadı. Lütfen API kontrolü yapın.');
        } finally {
            setTimeout(() => {
                setIsLaunching(false);
                setLastAction(null);
            }, 5000);
        }
    };

    useEffect(() => {
        let phi = 0;
        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.1],
            markerColor: [0.1, 0.8, 0.8],
            glowColor: [0.1, 0.2, 0.3],
            markers: [
                { location: [41.0082, 28.9784], size: 0.1 }, // Istanbul
                { location: [39.9334, 32.8597], size: 0.05 }, // Ankara
                { location: [38.4192, 27.1287], size: 0.05 }, // Izmir
                { location: [40.7128, -74.0060], size: 0.07 }, // Global
            ],
            onRender: (state) => {
                state.phi = phi;
                phi += 0.005;
            },
        });

        return () => globe.destroy();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-sans overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <Target className="w-8 h-8 text-cyan-400 animate-pulse" />
                        STRATEJİK SAVAŞ ODASI <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">BETA 2.0</span>
                    </h1>
                    <p className="text-white/40 text-xs mt-1 font-mono uppercase tracking-widest">Live Market Intelligence & Autonomous Defense System</p>
                </div>
                <div className="flex gap-4">
                    <AnimatePresence>
                        {lastAction && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-20 right-10 bg-cyan-500 text-black px-4 py-2 rounded font-black text-xs shadow-xl z-50"
                            >
                                {lastAction}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-all text-sm font-bold">
                        <RefreshCcw className="w-4 h-4" /> REFRESH ANALYSIS
                    </button>
                    <button
                        onClick={handleLaunch}
                        disabled={isLaunching}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-black shadow-[0_0_20px_rgba(34,211,238,0.4)]
                            ${isLaunching ? 'bg-cyan-800 cursor-not-allowed' : 'bg-cyan-500 text-black hover:scale-105'}`}
                    >
                        <Zap className={`w-4 h-4 fill-current ${isLaunching ? 'animate-bounce' : ''}`} />
                        {isLaunching ? 'DEFENSE ACTIVE...' : 'LAUNCH AI DEFENSE'}
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">

                {/* Left Column: Anomalies & Strategic Matrix */}
                <div className="col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-white/60 mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" /> AKTİF ANOMALİLER
                        </h2>
                        <AnimatePresence>
                            {anomalies.map((anomaly) => (
                                <motion.div
                                    key={anomaly.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className={`p-4 rounded-xl border-l-4 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 group cursor-pointer
                    ${anomaly.severity === 'CRITICAL' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-yellow-500'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-white/40">{anomaly.platform}</span>
                                        <span className="text-[10px] text-white/40">{anomaly.time}</span>
                                    </div>
                                    <h3 className="text-sm font-bold mb-1">{anomaly.title}</h3>
                                    <p className="text-xs text-white/60 leading-relaxed mb-3">{anomaly.details}</p>
                                    <div className="flex gap-2">
                                        <button className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold border border-red-500/20 hover:bg-red-500/40 transition-colors uppercase">
                                            Savunmaya Geç
                                        </button>
                                        <button className="text-[10px] bg-white/10 text-white/60 px-2 py-1 rounded font-bold hover:bg-white/20 transition-colors uppercase">
                                            İncele
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        <h2 className="text-sm font-black text-white/60 mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-500" /> STRATEJİK MATRİS
                        </h2>
                        <StrategicMatrix
                            nodes={[
                                { id: '1', name: 'iPhone 15 Case', risk: 85, opportunity: 90, type: 'product', status: 'critical' },
                                { id: '2', name: 'USB-C Cable', risk: 40, opportunity: 60, type: 'product', status: 'optimal' },
                                { id: '3', name: 'Screen Protector', risk: 70, opportunity: 30, type: 'product', status: 'warning' },
                                { id: '4', name: 'Leather Jacket', risk: 20, opportunity: 85, type: 'product', status: 'optimal' },
                            ]}
                        />
                    </div>
                </div>

                {/* Center: 3D Globe */}
                <div className="col-span-6 flex flex-col items-center justify-center relative">
                    <div className="absolute top-10 flex gap-12 z-10">
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="text-center group">
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest group-hover:text-cyan-400 transition-colors">{key}</p>
                                <p className="text-2xl font-black tracking-tighter group-hover:scale-110 transition-transform">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="w-[600px] h-[600px] relative">
                        <canvas
                            ref={canvasRef}
                            style={{
                                width: 600,
                                height: 600,
                                maxWidth: "100%",
                                aspectRatio: "1",
                            }}
                        />
                        {/* Overlay Rings */}
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                            <div className="w-[450px] h-[450px] rounded-full border border-cyan-500/10 animate-[spin_10s_linear_infinite]" />
                            <div className="absolute w-[500px] h-[500px] rounded-full border border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
                        </div>
                    </div>

                    <div className="absolute bottom-10 flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                            <span className="text-xs font-bold text-green-400">CANLI VERİ AKIŞI AKTİF</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <span className="text-xs text-white/60">Son Güncelleme: 2 saniye önce</span>
                    </div>
                </div>

                {/* Right Column: Live Feed & Performance */}
                <div className="col-span-3 flex flex-col gap-6">
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-5 backdrop-blur-md flex-1 overflow-hidden flex flex-col">
                        <h2 className="text-sm font-black text-white/60 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-cyan-400" /> SİSTEM AKTİVİTESİ
                            </div>
                            <Maximize2 className="w-3 h-3 cursor-pointer hover:text-cyan-400" />
                        </h2>
                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {[
                                { icon: <ChevronRight className="text-green-400" />, text: "Amazon Fiyat Eşitleme Tamamlandı", time: "Az önce" },
                                { icon: <ChevronRight className="text-cyan-400" />, text: "Yapay Zeka SEO Raporu Üretti (iPhone 15)", time: "1 dk" },
                                { icon: <ChevronRight className="text-yellow-400" />, text: "Hepsiburada API Kotası %80 Kullanıldı", time: "5 dk" },
                                { icon: <ChevronRight className="text-green-400" />, text: "Trendyol 5 Yeni Sipariş Çekildi", time: "8 dk" },
                                { icon: <ChevronRight className="text-red-400" />, text: "Fiyat Uyuşmazlığı Tespit Edildi (SKU-500)", time: "12 dk" },
                                { icon: <ChevronRight className="text-cyan-400" />, text: "Toplu Stok Güncellemesi Başladı", time: "15 dk" },
                                { icon: <ChevronRight className="text-green-400" />, text: "N11 Entegrasyonu Sağlıklı", time: "20 dk" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 text-[11px] items-start hover:bg-white/5 p-1 rounded transition-colors group">
                                    <span className="mt-0.5 group-hover:translate-x-1 transition-transform">{item.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-white/80 font-medium">{item.text}</p>
                                        <p className="text-white/30 text-[9px] mt-0.5">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-900/20 to-transparent rounded-2xl border border-cyan-500/20 p-5 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black tracking-widest text-cyan-400 uppercase">Tahmini Verimlilik</h3>
                            <TrendingUp className="text-cyan-400 w-4 h-4" />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black tracking-tighter">+%34</span>
                            <span className="text-[10px] text-white/40 mb-2 font-bold uppercase">Gelecek Haftalık Satış</span>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ duration: 2 }}
                                className="h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]"
                            />
                        </div>
                        <p className="text-[10px] text-white/40 mt-3 italic font-medium">"AI Ajanı şu an 2 savunma stratejisi geliştirdi."</p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.4);
        }
      `}</style>
        </div>
    );
}
