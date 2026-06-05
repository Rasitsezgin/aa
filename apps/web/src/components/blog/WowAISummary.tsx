"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface WowAISummaryProps {
    summaryPoints: string[];
}

export default function WowAISummary({ summaryPoints }: WowAISummaryProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [isGenerated, setIsGenerated] = useState(false);

    // Simulate generation effect on mount
    React.useEffect(() => {
        const timer = setTimeout(() => setIsGenerated(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="my-10 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
            <div className="relative bg-white dark:bg-[#0A0F1C] rounded-xl border border-orange-100 dark:border-blue-900/30 overflow-hidden shadow-xl">

                {/* Header */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between p-4 cursor-pointer bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                AI Özeti
                                {!isGenerated && (
                                    <span className="inline-flex gap-1 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 animate-pulse">
                                        Oluşturuluyor...
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Bu makalenin 3 maddelik özeti
                            </p>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                {/* Content */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 pt-2">
                                {!isGenerated ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {summaryPoints.map((point, index) => (
                                            <motion.li
                                                key={index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                    <CheckCircle2 size={12} className="text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                                    {point}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <Sparkles size={12} className="text-purple-500" />
                                        <span>Powered by Pazaryonetimi AI</span>
                                    </div>
                                    <span>%98 doğruluk oranı</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
