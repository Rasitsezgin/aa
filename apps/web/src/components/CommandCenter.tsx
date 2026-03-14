"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Zap,
    Settings,
    Package,
    LayoutDashboard,
    Sparkles,
    ArrowRight,
    Command as CommandIcon,
    X,
    FileText,
    Activity,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();

    // Toggle logic
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggle, isOpen]);

    const commands = [
        { id: 'dash', label: 'Dashboard\'a Git', icon: LayoutDashboard, category: 'Navigasyon', action: () => router.push('/dashboard') },
        { id: 'prod', label: 'Ürünleri Listele', icon: Package, category: 'Navigasyon', action: () => router.push('/dashboard/products') },
        { id: 'seo', label: 'AI SEO Analizi Başlat', icon: Sparkles, category: 'AI Tools', action: () => alert("AI SEO Analizi Başlatılıyor...") },
        { id: 'live', label: 'Canlı Akışı Görüntüle', icon: Activity, category: 'Sistem', action: () => alert("Canlı Akış Paneli Açılıyor...") },
        { id: 'set', label: 'Ayarlar', icon: Settings, category: 'Sistem', action: () => router.push('/dashboard/settings') },
        { id: 'user', label: 'Kullanıcı Yönetimi', icon: Users, category: 'Admin', action: () => router.push('/admin/tenants') },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden pointer-events-auto relative z-10"
                    >
                        {/* Search Bar */}
                        <div className="flex items-center px-4 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <Search className="w-5 h-5 text-slate-400 mr-3" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Komut ara veya bir şey sor..."
                                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg font-medium"
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-500">ESC</span>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                            {filteredCommands.length > 0 ? (
                                <div className="space-y-4 py-2">
                                    {/* Grouped by category */}
                                    {Array.from(new Set(filteredCommands.map(c => c.category))).map(cat => (
                                        <div key={cat} className="space-y-1">
                                            <div className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">{cat}</div>
                                            {filteredCommands.filter(c => c.category === cat).map(cmd => (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => { cmd.action(); setIsOpen(false); }}
                                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-600 group transition-all text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                                            <cmd.icon size={18} />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-white">{cmd.label}</span>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-300 dark:text-white/20 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-white" />
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Zap size={24} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sonuç bulunamadı</h3>
                                    <p className="text-xs text-slate-500 mt-1">Lütfen farklı anahtar kelimeler deneyin.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 bg-slate-50/80 dark:bg-white/5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                                    <ArrowRight className="w-3 h-3 rotate-90" /> seç
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                                    <ArrowRight className="w-3 h-3" /> git
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Sparkles size={12} className="text-blue-500" />
                                <span className="text-[10px] font-black text-blue-500 tracking-tighter uppercase italic">AI Powered</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
