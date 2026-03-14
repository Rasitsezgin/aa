"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    Command,
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    Warehouse,
    Bot,
    Store,
    FileText,
    Bell,
    TrendingUp,
    Zap,
    ArrowRight,
    Clock,
    Star,
    Hash,
    Calculator,
    Globe,
    Shield,
    CreditCard,
    Megaphone,
    MessageSquare,
    BarChart3,
    Target,
    PieChart,
    Boxes,
    Tags,
    Truck,
    Receipt,
    LineChart,
    X,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import { useQuickActions } from '@/providers/quick-actions-provider';

interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ElementType;
    href?: string;
    action?: () => void;
    category: string;
    keywords?: string[];
    shortcut?: string;
}

const allCommands: CommandItem[] = [
    // Navigasyon
    { id: 'dashboard', title: 'Dashboard', description: 'Ana kontrol paneli', icon: LayoutDashboard, href: '/dashboard', category: 'Sayfalar', keywords: ['ana sayfa', 'panel', 'özet'] },
    { id: 'orders', title: 'Siparişler', description: 'Sipariş yönetimi', icon: ShoppingCart, href: '/dashboard/orders', category: 'Sayfalar', keywords: ['sipariş', 'satış', 'kargo'] },
    { id: 'products', title: 'Ürünler', description: 'Ürün kataloğu', icon: Package, href: '/dashboard/products', category: 'Sayfalar', keywords: ['ürün', 'katalog', 'envanter'] },
    { id: 'inventory', title: 'Stok Yönetimi', description: 'Stok takibi ve uyarılar', icon: Warehouse, href: '/dashboard/inventory', category: 'Sayfalar', keywords: ['stok', 'depo', 'envanter'] },
    { id: 'customers', title: 'Müşteriler', description: 'Müşteri CRM', icon: Users, href: '/dashboard/customers', category: 'Sayfalar', keywords: ['müşteri', 'crm', 'kullanıcı'] },
    { id: 'stores', title: 'Mağazalarım', description: 'Bağlı mağazalar', icon: Store, href: '/dashboard/stores', category: 'Sayfalar', keywords: ['mağaza', 'pazaryeri'] },
    { id: 'integrations', title: 'Entegrasyonlar', description: 'API bağlantıları', icon: Globe, href: '/dashboard/settings/integrations', category: 'Sayfalar', keywords: ['entegrasyon', 'api', 'bağlantı'] },
    { id: 'notifications', title: 'Bildirimler', description: 'Tüm bildirimler', icon: Bell, href: '/dashboard/notifications', category: 'Sayfalar', keywords: ['bildirim', 'uyarı', 'haber'] },
    { id: 'settings', title: 'Ayarlar', description: 'Sistem ayarları', icon: Settings, href: '/dashboard/settings', category: 'Sayfalar', keywords: ['ayar', 'yapılandırma', 'config'] },

    // AI Araçları
    { id: 'ai-advisor', title: 'AI Danışman', description: 'Yapay zeka destekli öneriler', icon: Bot, href: '/dashboard/ai-advisor', category: 'AI Araçları', keywords: ['ai', 'yapay zeka', 'öneri', 'danışman'], shortcut: '⌘A' },
    { id: 'ai-tools', title: 'AI Araçları', description: 'Tüm AI özellikleri', icon: Sparkles, href: '/dashboard/ai-tools', category: 'AI Araçları', keywords: ['ai', 'araçlar', 'otomasyon'] },
    { id: 'seo', title: 'SEO Optimizasyonu', description: 'AI destekli SEO analizi', icon: Target, href: '/dashboard/seo', category: 'AI Araçları', keywords: ['seo', 'arama', 'optimizasyon'] },
    { id: 'competitor', title: 'Rakip Analizi', description: 'Rakip takibi', icon: TrendingUp, href: '/dashboard/competitor', category: 'AI Araçları', keywords: ['rakip', 'analiz', 'pazar'] },
    { id: 'predictions', title: 'Satış Tahminleri', description: 'AI tahminleme', icon: PieChart, href: '/dashboard/predictions', category: 'AI Araçları', keywords: ['tahmin', 'forecast', 'satış'] },

    // Finans
    { id: 'payments', title: 'Ödemeler', description: 'Ödeme takibi', icon: CreditCard, href: '/dashboard/payments', category: 'Finans', keywords: ['ödeme', 'para', 'gelir'] },
    { id: 'invoices', title: 'Faturalar', description: 'Fatura yönetimi', icon: Receipt, href: '/dashboard/invoices', category: 'Finans', keywords: ['fatura', 'belge'] },
    { id: 'reports', title: 'Finansal Raporlar', description: 'Detaylı raporlar', icon: BarChart3, href: '/dashboard/reports', category: 'Finans', keywords: ['rapor', 'analiz', 'finans'] },
    { id: 'analytics', title: 'Analitik', description: 'Performans metrikleri', icon: LineChart, href: '/dashboard/analytics', category: 'Finans', keywords: ['analitik', 'metrik', 'performans'] },

    // Pazarlama
    { id: 'campaigns', title: 'Kampanyalar', description: 'Pazarlama kampanyaları', icon: Megaphone, href: '/dashboard/campaigns', category: 'Pazarlama', keywords: ['kampanya', 'pazarlama', 'reklam'] },
    { id: 'reviews', title: 'Yorumlar', description: 'Müşteri yorumları', icon: MessageSquare, href: '/dashboard/reviews', category: 'Pazarlama', keywords: ['yorum', 'değerlendirme', 'feedback'] },

    // Pazaryeri
    { id: 'bulk-actions', title: 'Toplu İşlemler', description: 'Toplu güncelleme', icon: Boxes, href: '/dashboard/bulk-actions', category: 'Pazaryeri', keywords: ['toplu', 'güncelleme', 'import'] },
    { id: 'pricing', title: 'Fiyat Yönetimi', description: 'Fiyat stratejileri', icon: Tags, href: '/dashboard/pricing', category: 'Pazaryeri', keywords: ['fiyat', 'fiyatlandırma', 'indirim'] },
    { id: 'shipping', title: 'Kargo Ayarları', description: 'Kargo konfigürasyonu', icon: Truck, href: '/dashboard/shipping', category: 'Pazaryeri', keywords: ['kargo', 'teslimat', 'shipping'] },
    { id: 'service-integrations', title: 'Servis Entegrasyonları', description: 'Kargo, ödeme, e-fatura ve SMS servisleri', icon: Truck, href: '/dashboard/settings/service-integrations', category: 'Ayarlar', keywords: ['kargo', 'ödeme', 'e-fatura', 'sms', 'servis', 'entegrasyon', 'aras', 'iyzico', 'foriba'] },

    // Hızlı İşlemler
    { id: 'quick-sale', title: 'Hızlı Satış', description: 'Yeni satış oluştur', icon: Zap, category: 'Hızlı İşlemler', keywords: ['satış', 'yeni', 'hızlı'] },
    { id: 'add-product', title: 'Yeni Ürün Ekle', description: 'Ürün oluştur', icon: Package, category: 'Hızlı İşlemler', keywords: ['ürün', 'ekle', 'yeni'] },
    { id: 'sync-all', title: 'Tümünü Senkronize Et', description: 'Tüm pazaryerlerini güncelle', icon: Globe, category: 'Hızlı İşlemler', keywords: ['sync', 'senkron', 'güncelle'] },

    // Sistem
    { id: 'security', title: 'Güvenlik', description: 'Güvenlik ayarları', icon: Shield, href: '/dashboard/security', category: 'Sistem', keywords: ['güvenlik', 'şifre', 'koruma'] },
    { id: 'upgrade', title: 'Planı Yükselt', description: 'Pro özelliklere geç', icon: Star, href: '/dashboard/upgrade', category: 'Sistem', keywords: ['upgrade', 'yükselt', 'pro'] },
];

// Son kullanılan komutları tutmak için
const recentCommandIds = ['dashboard', 'orders', 'products', 'ai-advisor'];

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { openQuickSale, openAddProduct } = useQuickActions();

    // Filtrelenmiş komutlar
    const filteredCommands = search
        ? allCommands.filter(cmd => {
            const searchLower = search.toLowerCase();
            return (
                cmd.title.toLowerCase().includes(searchLower) ||
                cmd.description?.toLowerCase().includes(searchLower) ||
                cmd.keywords?.some(k => k.toLowerCase().includes(searchLower))
            );
        })
        : allCommands;

    // Kategorilere göre grupla
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, CommandItem[]>);

    // Son kullanılanlar
    const recentCommands = recentCommandIds
        .map(id => allCommands.find(c => c.id === id))
        .filter(Boolean) as CommandItem[];

    // Keyboard kısayolları
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K veya Ctrl+K ile aç
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }

            // Escape ile kapat
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Modal açıldığında input'a focus
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
                setSearch('');
                setSelectedIndex(0);
            }, 100);
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const totalItems = filteredCommands.length;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % totalItems);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
                break;
            case 'Enter':
                e.preventDefault();
                const selected = filteredCommands[selectedIndex];
                if (selected) executeCommand(selected);
                break;
        }
    }, [filteredCommands, selectedIndex]);

    // Komutu çalıştır
    const executeCommand = (cmd: CommandItem) => {
        setIsOpen(false);
        if (cmd.id === 'quick-sale') {
            openQuickSale();
        } else if (cmd.id === 'add-product') {
            openAddProduct();
        } else if (cmd.href) {
            router.push(cmd.href);
        } else if (cmd.action) {
            cmd.action();
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            selectedElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
            >
                <Search size={16} />
                <span className="hidden md:inline">Ara...</span>
                <kbd className="hidden md:flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">
                    <Command size={10} /> K
                </kbd>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Command Palette */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.15 }}
                            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl z-[101] overflow-hidden"
                        >
                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                                <Search size={20} className="text-slate-500" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setSelectedIndex(0);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Sayfa ara, komut çalıştır..."
                                    className="flex-1 bg-transparent text-foreground placeholder:text-slate-500 outline-none text-lg"
                                />
                                <kbd className="hidden md:flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-xs text-slate-500 border border-white/10">
                                    ESC
                                </kbd>
                            </div>

                            {/* Results */}
                            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
                                {!search && recentCommands.length > 0 && (
                                    <div className="mb-4">
                                        <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            Son Kullanılanlar
                                        </div>
                                        {recentCommands.map((cmd, idx) => (
                                            <CommandListItem
                                                key={cmd.id}
                                                command={cmd}
                                                isSelected={selectedIndex === idx}
                                                onClick={() => executeCommand(cmd)}
                                                dataIndex={idx}
                                            />
                                        ))}
                                    </div>
                                )}

                                {Object.entries(groupedCommands).map(([category, commands], catIdx) => {
                                    const startIndex = search
                                        ? filteredCommands.findIndex(c => c.id === commands[0].id)
                                        : recentCommands.length + Object.entries(groupedCommands)
                                            .slice(0, catIdx)
                                            .reduce((acc, [, cmds]) => acc + cmds.length, 0);

                                    return (
                                        <div key={category} className="mb-4">
                                            <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                {category}
                                            </div>
                                            {commands.map((cmd, idx) => (
                                                <CommandListItem
                                                    key={cmd.id}
                                                    command={cmd}
                                                    isSelected={selectedIndex === startIndex + idx}
                                                    onClick={() => executeCommand(cmd)}
                                                    dataIndex={startIndex + idx}
                                                />
                                            ))}
                                        </div>
                                    );
                                })}

                                {filteredCommands.length === 0 && (
                                    <div className="py-12 text-center">
                                        <Search size={40} className="mx-auto mb-4 text-slate-600" />
                                        <p className="text-slate-500">Sonuç bulunamadı</p>
                                        <p className="text-sm text-slate-600 mt-1">Farklı anahtar kelimeler deneyin</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-border bg-white/[0.02] flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑</kbd>
                                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd>
                                        <span className="ml-1">Gezin</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↵</kbd>
                                        <span className="ml-1">Aç</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles size={12} className="text-primary" />
                                    <span>AI destekli arama</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// List Item Component
function CommandListItem({
    command,
    isSelected,
    onClick,
    dataIndex
}: {
    command: CommandItem;
    isSelected: boolean;
    onClick: () => void;
    dataIndex: number;
}) {
    const Icon = command.icon;

    return (
        <button
            data-index={dataIndex}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isSelected
                ? 'bg-primary/10 text-primary'
                : 'text-slate-300 hover:bg-white/5 hover:text-foreground'
                }`}
        >
            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-white/5'}`}>
                <Icon size={16} />
            </div>
            <div className="flex-1 text-left">
                <div className="font-medium">{command.title}</div>
                {command.description && (
                    <div className="text-xs text-slate-500">{command.description}</div>
                )}
            </div>
            {command.shortcut && (
                <kbd className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-slate-500">
                    {command.shortcut}
                </kbd>
            )}
            <ChevronRight size={14} className={isSelected ? 'text-primary' : 'text-slate-600'} />
        </button>
    );
}

export default CommandPalette;
