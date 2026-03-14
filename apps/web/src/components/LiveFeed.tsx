'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShoppingCart, AlertCircle, CheckCircle2, RefreshCcw, Truck, MessageSquare, Boxes, Zap, Loader2 } from 'lucide-react';
import { useActivityFeed, useAiSummary } from '@/lib/hooks';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    order: { icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    sale: { icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    stock: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    shipping: { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    review: { icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    campaign: { icon: Boxes, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    system: { icon: RefreshCcw, color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

export default function LiveFeed() {
    const { data: activities, loading: feedLoading } = useActivityFeed(8);
    const { data: aiSummary, loading: summaryLoading } = useAiSummary();

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMins < 1) return 'Az önce';
        if (diffInMins < 60) return `${diffInMins} dk önce`;
        if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)} sa önce`;
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <div className="w-80 border-l border-border bg-surface/30 backdrop-blur-md sticky top-20 h-[calc(100vh-80px)] overflow-y-auto hidden xl:flex flex-col p-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-primary animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Canlı Akış</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <div className="space-y-6 flex-1">
                {feedLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Yükleniyor...</span>
                    </div>
                ) : activities && activities.length > 0 ? (
                    activities.map((activity, idx) => {
                        const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.system;
                        const Icon = config.icon;

                        return (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={activity.id}
                                className="relative pl-6 group"
                            >
                                {/* Line */}
                                {idx !== activities.length - 1 && (
                                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-border group-hover:bg-primary/30 transition-colors" />
                                )}

                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg ${config.bg} flex items-center justify-center border border-white/5`}>
                                    <Icon size={12} className={config.color} />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-foreground leading-tight">
                                        {activity.title}
                                        {activity.value && <span className="ml-1 text-primary">({activity.value})</span>}
                                    </p>
                                    <p className="text-[10px] text-slate-500 line-clamp-1">{activity.description}</p>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{formatTime(activity.time)}</span>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <p className="text-xs text-slate-500 italic">Henüz aktivite bulunmuyor.</p>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-8">
                <AnimatePresence mode="wait">
                    {summaryLoading ? (
                        <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                    ) : aiSummary?.predictionText && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-3 h-3 text-blue-400" />
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI İÇGÖRÜSÜ</p>
                            </div>
                            <p className="text-xs font-medium text-slate-300 leading-relaxed italic">
                                "{aiSummary.predictionText}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
