"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Package, ShoppingCart, TrendingUp, Tag, Image, FileText,
    Megaphone, Truck, Users, BarChart3, RefreshCw, Download,
    Plus, ArrowRight, Sparkles, Brain, Target, X
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
    id: string;
    icon: React.ElementType;
    label: string;
    description: string;
    href?: string;
    action?: () => void;
    color: string;
    gradient: string;
    badge?: string;
}

export default function QuickActions() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [recentActions, setRecentActions] = useState<string[]>([]);

    const actions: QuickAction[] = [
        {
            id: 'add-product',
            icon: Package,
            label: 'Ürün Ekle',
            description: 'Yeni ürün oluştur',
            href: '/dashboard/products?action=new',
            color: 'text-blue-500',
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            id: 'new-order',
            icon: ShoppingCart,
            label: 'Manuel Sipariş',
            description: 'Manuel sipariş gir',
            href: '/dashboard/orders?action=new',
            color: 'text-green-500',
            gradient: 'from-green-500 to-emerald-500',
        },
        {
            id: 'bulk-update',
            icon: RefreshCw,
            label: 'Toplu Güncelle',
            description: 'Stok & fiyat güncelle',
            href: '/dashboard/bulk-actions',
            color: 'text-purple-500',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            id: 'create-campaign',
            icon: Megaphone,
            label: 'Kampanya Oluştur',
            description: 'Yeni kampanya başlat',
            href: '/dashboard/campaigns?action=new',
            color: 'text-orange-500',
            gradient: 'from-orange-500 to-red-500',
            badge: 'AI',
        },
        {
            id: 'ai-optimize',
            icon: Brain,
            label: 'AI Optimizasyon',
            description: 'Ürünleri optimize et',
            href: '/dashboard/ai-advisor',
            color: 'text-violet-500',
            gradient: 'from-violet-500 to-purple-600',
            badge: 'Yeni',
        },
        {
            id: 'export-report',
            icon: Download,
            label: 'Rapor İndir',
            description: 'PDF/Excel rapor',
            href: '/dashboard/reports',
            color: 'text-teal-500',
            gradient: 'from-teal-500 to-cyan-600',
        },
        {
            id: 'price-analysis',
            icon: Tag,
            label: 'Fiyat Analizi',
            description: 'Rakip fiyat karşılaştır',
            href: '/dashboard/pricing',
            color: 'text-amber-500',
            gradient: 'from-amber-500 to-orange-500',
            badge: 'Pro',
        },
        {
            id: 'image-studio',
            icon: Image,
            label: 'Görsel Stüdyo',
            description: 'AI görsel düzenleme',
            href: '/dashboard/ai-tools/image-studio',
            color: 'text-pink-500',
            gradient: 'from-pink-500 to-rose-500',
            badge: 'AI',
        },
    ];

    const visibleActions = isExpanded ? actions : actions.slice(0, 4);

    return (
        <div className="bg-surface rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Hızlı İşlemler</h3>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                    {isExpanded ? 'Daralt' : 'Tümü'}
                    <ArrowRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <AnimatePresence mode="popLayout">
                    {visibleActions.map((action, idx) => (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.03 }}
                        >
                            <Link
                                href={action.href || '#'}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background/50 border border-border hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer relative"
                            >
                                {action.badge && (
                                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] font-black rounded-md bg-gradient-to-r from-primary to-purple-600 text-white">
                                        {action.badge}
                                    </span>
                                )}
                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <div className="text-center">
                                    <div className="text-xs font-bold text-foreground">{action.label}</div>
                                    <div className="text-[10px] text-slate-500 hidden md:block">{action.description}</div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
