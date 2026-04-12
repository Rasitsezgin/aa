'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, TrendingUp, ShoppingBag, AlertCircle, Play, Volume2, Brain } from 'lucide-react';

interface BriefingData {
    message: string;
    stats: {
        revenue: number;
        orders: number;
        stockAlerts: number;
    };
}

export const MorningBriefing = ({ onClose }: { onClose: () => void }) => {
    const [data, setData] = useState<BriefingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBriefing = async () => {
            try {
                const res = await fetch('/api/ai/briefing', {
                    headers: { 'x-tenant-id': 'default' }
                });
                const briefing = await res.json();
                setData(briefing);
            } catch (err) {
                console.error("Briefing failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBriefing();
    }, []);

    if (loading) return null;
    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-8 z-[60] w-full max-w-sm"
        >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black tracking-tight text-lg">PazarAI Briefing</h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Günün Stratejisi Hazır</p>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-2">
                        <div className="flex-1 bg-white/10 rounded-2xl p-3 backdrop-blur border border-white/10">
                            <div className="text-[10px] font-black text-indigo-200 uppercase mb-1">Dünkü Ciro</div>
                            <div className="text-lg font-black">₺{(data?.stats?.revenue ?? 0).toLocaleString('tr-TR')}</div>
                        </div>
                        <div className="flex-1 bg-white/10 rounded-2xl p-3 backdrop-blur border border-white/10">
                            <div className="text-[10px] font-black text-indigo-200 uppercase mb-1">Sipariş</div>
                            <div className="text-lg font-black">{data?.stats?.orders ?? 0} Adet</div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="relative group">
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-indigo-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        <p className="text-sm font-medium leading-relaxed italic text-zinc-600 dark:text-zinc-300 pl-4">
                            "{data?.message}"
                        </p>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button className="flex-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2">
                            <Volume2 className="w-4 h-4" /> DİNLE
                        </button>
                        <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-indigo-600/20">
                            AKSİYON AL
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
