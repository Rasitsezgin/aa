"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Keyboard, Command, ArrowUp, Search, Package,
    ShoppingCart, Users, Settings, BarChart3, X
} from 'lucide-react';

interface Shortcut {
    keys: string[];
    label: string;
    action: () => void;
}

export function useKeyboardShortcuts() {
    const router = useRouter();

    const navigate = useCallback((path: string) => {
        router.push(path);
    }, [router]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Alt + key shortcuts
            if (e.altKey) {
                switch (e.key) {
                    case 'd': e.preventDefault(); navigate('/dashboard'); break;
                    case 'o': e.preventDefault(); navigate('/dashboard/orders'); break;
                    case 'p': e.preventDefault(); navigate('/dashboard/products'); break;
                    case 'c': e.preventDefault(); navigate('/dashboard/customers'); break;
                    case 'a': e.preventDefault(); navigate('/dashboard/analytics'); break;
                    case 's': e.preventDefault(); navigate('/dashboard/settings'); break;
                    case 'i': e.preventDefault(); navigate('/dashboard/inventory'); break;
                    case 'f': e.preventDefault(); navigate('/dashboard/finance'); break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);
}

export function KeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '?' && e.shiftKey) {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const shortcuts = [
        { keys: ['Alt', 'D'], label: 'Dashboard Ana Sayfa' },
        { keys: ['Alt', 'O'], label: 'Siparişler' },
        { keys: ['Alt', 'P'], label: 'Ürünler' },
        { keys: ['Alt', 'C'], label: 'Müşteriler' },
        { keys: ['Alt', 'A'], label: 'Analitik' },
        { keys: ['Alt', 'I'], label: 'Envanter' },
        { keys: ['Alt', 'F'], label: 'Finans' },
        { keys: ['Alt', 'S'], label: 'Ayarlar' },
        { keys: ['Shift', '?'], label: 'Kısayol Yardımı' },
        { keys: ['Ctrl', 'K'], label: 'Komut Paleti' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Keyboard className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-bold text-foreground">Klavye Kısayolları</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-background text-slate-400 hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {shortcuts.map((shortcut, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background/50 transition-colors">
                                    <span className="text-sm text-foreground">{shortcut.label}</span>
                                    <div className="flex items-center gap-1">
                                        {shortcut.keys.map((key, kidx) => (
                                            <React.Fragment key={kidx}>
                                                <kbd className="px-2 py-1 bg-background border border-border rounded-lg text-[10px] font-mono font-bold text-slate-500 min-w-[28px] text-center">
                                                    {key}
                                                </kbd>
                                                {kidx < shortcut.keys.length - 1 && (
                                                    <span className="text-[10px] text-slate-500">+</span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-[10px] text-slate-500 text-center">
                                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[9px] font-mono">Shift+?</kbd> ile bu pencereyi açıp kapatabilirsiniz
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
