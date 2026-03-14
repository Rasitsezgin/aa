'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
    const { lang, setLang, languages } = useI18n();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === lang);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-sm text-foreground hover:bg-background transition-colors"
            >
                <Globe className="w-4 h-4 text-slate-400" />
                {!compact && (
                    <>
                        <span>{currentLang?.flag}</span>
                        <span>{currentLang?.name}</span>
                    </>
                )}
                {compact && <span>{currentLang?.flag}</span>}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden min-w-[160px]"
                        >
                            {languages.map(l => (
                                <button
                                    key={l.code}
                                    onClick={() => {
                                        setLang(l.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-sm ${lang === l.code
                                        ? 'bg-indigo-500/10 text-indigo-500 font-medium'
                                        : 'text-foreground hover:bg-background'
                                        }`}
                                >
                                    <span className="text-lg">{l.flag}</span>
                                    <span>{l.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
