'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, ArrowRight, Zap, Package, DollarSign, BarChart3, Users, Settings, FileText, Globe, Shield, Star } from 'lucide-react';

interface CommandItem {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    action: () => void;
    category: string;
    keywords?: string[];
}

interface CommandPaletteLandingProps {
    features?: {
        commandPalette: {
            enabled: boolean;
            shortcutKey: string;
        };
    };
}

export const CommandPaletteLanding = ({ features }: CommandPaletteLandingProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const shortcutKey = features?.commandPalette.shortcutKey || 'cmd+k';

    const commands: CommandItem[] = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            description: 'Ana yönetim paneline git',
            icon: BarChart3,
            action: () => window.open('/dashboard', '_blank'),
            category: 'Navigation',
            keywords: ['anasayfa', 'panel', 'yönetim']
        },
        {
            id: 'products',
            title: 'Ürün Yönetimi',
            description: 'Tüm ürünleri görüntüle ve düzenle',
            icon: Package,
            action: () => window.open('/dashboard/products', '_blank'),
            category: 'Products',
            keywords: ['ürün', 'stok', 'katalog']
        },
        {
            id: 'orders',
            title: 'Siparişler',
            description: 'Gelen siparişleri yönet',
            icon: Package,
            action: () => window.open('/dashboard/orders', '_blank'),
            category: 'Orders',
            keywords: ['sipariş', 'satış', 'müşteri']
        },
        {
            id: 'pricing',
            title: 'Fiyatlandırma',
            description: 'Paketlerimizi ve fiyatları gör',
            icon: DollarSign,
            action: () => window.open('/pricing', '_blank'),
            category: 'Pricing',
            keywords: ['fiyat', 'ücret', 'paket']
        },
        {
            id: 'customers',
            title: 'Müşteriler',
            description: 'Müşteri verilerini analiz et',
            icon: Users,
            action: () => window.open('/dashboard/customers', '_blank'),
            category: 'Analytics',
            keywords: ['müşteri', 'kullanıcı', 'analiz']
        },
        {
            id: 'settings',
            title: 'Ayarlar',
            description: 'Hesap ayarlarını yönet',
            icon: Settings,
            action: () => window.open('/dashboard/settings', '_blank'),
            category: 'Settings',
            keywords: ['ayar', 'konfigürasyon', 'profil']
        },
        {
            id: 'docs',
            title: 'Dokümantasyon',
            description: 'Yardım ve belgeler',
            icon: FileText,
            action: () => window.open('/docs', '_blank'),
            category: 'Help',
            keywords: ['yardım', 'doküman', 'rehber']
        },
        {
            id: 'integrations',
            title: 'Entegrasyonlar',
            description: 'Trendyol, Hepsiburada vb.',
            icon: Globe,
            action: () => window.open('/integrations', '_blank'),
            category: 'Integrations',
            keywords: ['entegrasyon', 'pazaryeri', 'bağlantı']
        },
        {
            id: 'security',
            title: 'Güvenlik',
            description: 'Güvenlik ayarları ve loglar',
            icon: Shield,
            action: () => window.open('/dashboard/security', '_blank'),
            category: 'Security',
            keywords: ['güvenlik', 'log', 'koruma']
        },
        {
            id: 'reviews',
            title: 'Yorumlar',
            description: 'Müşteri yorumlarını yönet',
            icon: Star,
            action: () => window.open('/dashboard/reviews', '_blank'),
            category: 'Reviews',
            keywords: ['yorum', 'değerlendirme', 'feedback']
        }
    ];

    // Filter commands based on search query
    const filteredCommands = commands.filter(command => {
        const query = searchQuery.toLowerCase();
        return (
            command.title.toLowerCase().includes(query) ||
            command.description.toLowerCase().includes(query) ||
            command.category.toLowerCase().includes(query) ||
            command.keywords?.some(keyword => keyword.toLowerCase().includes(query))
        );
    });

    useEffect(() => {
        if (!features?.commandPalette.enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Cmd+K (Mac) or Ctrl+K (Windows)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            } else if (e.key === 'Escape') {
                setIsOpen(false);
            } else if (isOpen) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action();
                        setIsOpen(false);
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, features?.commandPalette.enabled]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        setSelectedIndex(0);
    }, [isOpen]);

    if (!features?.commandPalette.enabled) return null;

    return (
        <>
            {/* Trigger Button */}
            <div className="text-center py-12">
                <motion.button
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <Command className="w-5 h-5" />
                    Hızlı Erişim ({shortcutKey})
                    <ArrowRight className="w-4 h-4" />
                </motion.button>
                
                <p className="text-sm text-slate-500 mt-3">
                    {shortcutKey} tuşuna basarak hızlıca erişin
                </p>
            </div>

            {/* Command Palette */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Command Palette */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-white/10">
                                    <Search className="w-5 h-5 text-slate-400" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Özellikleri, sayfaları veya ayarları arayın..."
                                        className="flex-1 bg-transparent text-foreground placeholder-slate-500 outline-none"
                                    />
                                    <div className="flex items-center gap-1">
                                        <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                                            ↑↓
                                        </kbd>
                                        <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                                            Enter
                                        </kbd>
                                        <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
                                            Esc
                                        </kbd>
                                    </div>
                                </div>

                                {/* Command List */}
                                <div className="max-h-96 overflow-y-auto">
                                    {filteredCommands.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500">Sonuç bulunamadı</p>
                                            <p className="text-sm text-slate-400 mt-1">Farklı anahtar kelimeler deneyin</p>
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            {filteredCommands.map((command, index) => {
                                                const Icon = command.icon;
                                                const isSelected = index === selectedIndex;
                                                
                                                return (
                                                    <motion.button
                                                        key={command.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        onClick={() => {
                                                            command.action();
                                                            setIsOpen(false);
                                                        }}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                                                            isSelected
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-foreground'
                                                        }`}
                                                    >
                                                        <div className={`p-2 rounded-lg ${
                                                            isSelected
                                                                ? 'bg-primary/20 text-primary'
                                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                            <Icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <div className="font-bold text-sm">{command.title}</div>
                                                            <div className="text-xs text-slate-500">{command.description}</div>
                                                        </div>
                                                        <div className="text-xs text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                                                            {command.category}
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Zap className="w-3 h-3" />
                                        Hızlı erişim için {shortcutKey}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {filteredCommands.length} sonuç
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
