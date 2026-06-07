"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Link2,
    User,
    Bell,
    Shield,
    CreditCard,
    Palette,
    Key,
    ChevronRight,
    ArrowRight,
    Zap,
    Users,
    FileText,
    Truck,
} from 'lucide-react';

const settingsCategories = [
    {
        id: 'integrations',
        title: 'Pazaryeri Entegrasyonları',
        description: 'Trendyol, Hepsiburada, Amazon ve 40+ pazaryeri bağlantısı',
        icon: Link2,
        href: '/dashboard/settings/integrations',
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        badge: '40+',
        featured: true,
    },
    {
        id: 'integration-hub',
        title: 'Entegrasyon Merkezi',
        description: 'Pazaryeri, e-ticaret, kargo ve e-fatura — tek panelden yönetim',
        icon: Zap,
        href: '/dashboard/settings/integration-hub',
        color: 'from-violet-500 to-indigo-500',
        bgColor: 'bg-violet-500/10',
        borderColor: 'border-violet-500/20',
        badge: 'Yeni',
        featured: true,
    },
    {
        id: 'service-integrations',
        title: 'Servis Entegrasyonları',
        description: 'Kargo, ödeme, e-fatura ve SMS servis bağlantılarını yönetin',
        icon: Truck,
        href: '/dashboard/settings/service-integrations',
        color: 'from-indigo-500 to-blue-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
    },
    {
        id: 'profile',
        title: 'Profil Ayarları',
        description: 'Hesap bilgilerinizi ve şirket detaylarınızı yönetin',
        icon: User,
        href: '/dashboard/settings/profile',
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
    },
    {
        id: 'team',
        title: 'Ekip Yönetimi',
        description: 'Ekip üyelerini ekleyin ve yetkileri düzenleyin',
        icon: Users,
        href: '/dashboard/settings/team',
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
    },
    {
        id: 'notifications',
        title: 'Bildirimler',
        description: 'E-posta, SMS ve push bildirim tercihlerinizi yönetin',
        icon: Bell,
        href: '/dashboard/settings/notifications',
        color: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
    },
    {
        id: 'security',
        title: 'Güvenlik',
        description: 'Şifre, 2FA ve oturum güvenliği ayarları',
        icon: Shield,
        href: '/dashboard/security',
        color: 'from-red-500 to-rose-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
    },
    {
        id: 'billing',
        title: 'Faturalandırma',
        description: 'Abonelik planınız, ödeme geçmişi ve faturalar',
        icon: CreditCard,
        href: '/dashboard/payments',
        color: 'from-indigo-500 to-violet-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
    },
    {
        id: 'appearance',
        title: 'Görünüm',
        description: 'Tema, dil ve arayüz tercihlerinizi özelleştirin',
        icon: Palette,
        href: '/dashboard/theme',
        color: 'from-pink-500 to-fuchsia-500',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/20',
    },
    {
        id: 'api',
        title: 'API & Webhooks',
        description: 'API anahtarlarınız ve webhook yapılandırması',
        icon: Key,
        href: '/dashboard/webhooks',
        color: 'from-slate-500 to-zinc-500',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/20',
    },
    {
        id: 'verification',
        title: 'Mülk Doğrulama (SEO)',
        description: 'Google, Bing ve Yandex mülk doğrulama kodlarını yönetin',
        icon: Shield,
        href: '/dashboard/settings/verification',
        color: 'from-blue-600 to-indigo-600',
        bgColor: 'bg-blue-600/10',
        borderColor: 'border-blue-600/20',
    },
];

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Ayarlar</h1>
                </div>
                <p className="text-slate-500 font-medium">Hesabınızı ve entegrasyonlarınızı yönetin</p>
            </div>

            {/* Featured Section - Integrations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link href="/dashboard/settings/integrations">
                    <div className="relative overflow-hidden p-8 bg-gradient-to-br from-primary/10 via-blue-500/5 to-cyan-500/10 rounded-[28px] border border-primary/20 hover:border-primary/40 transition-all group cursor-pointer">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="relative flex items-center gap-6">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
                                <Link2 size={32} />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold text-foreground">Pazaryeri Entegrasyonları</h2>
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary text-white">
                                        40+ Platform
                                    </span>
                                </div>
                                <p className="text-slate-500">
                                    Trendyol, Hepsiburada, Amazon, eBay, Etsy ve dünya çapında 40'tan fazla pazaryerine bağlanın
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
                                Entegrasyonları Yönet
                                <ArrowRight size={20} />
                            </div>
                        </div>

                        {/* Mini logos preview */}
                        <div className="mt-6 flex items-center gap-4">
                            <span className="text-xs text-slate-500">Popüler:</span>
                            <div className="flex items-center -space-x-2">
                                {['T', 'H', 'N', 'A', 'E', 'S'].map((letter, idx) => (
                                    <div
                                        key={idx}
                                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-foreground"
                                    >
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs text-slate-400">+34 daha fazla</span>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {settingsCategories.filter(c => c.id !== 'integrations').map((category, idx) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Link href={category.href}>
                            <div className={`p-6 bg-surface rounded-[20px] border ${category.borderColor} hover:shadow-lg transition-all group cursor-pointer h-full`}>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${category.bgColor}`}>
                                        <category.icon className={`bg-gradient-to-br ${category.color} bg-clip-text`} size={24} style={{ color: 'inherit' }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-foreground">{category.title}</h3>
                                            <ChevronRight size={18} className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <p className="text-sm text-slate-500">{category.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-surface rounded-[24px] border border-border"
            >
                <h3 className="text-lg font-bold text-foreground mb-4">Hızlı İşlemler</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/dashboard/settings/integrations">
                        <button className="w-full flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all text-left group">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Zap className="text-green-500" size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-foreground">Yeni Entegrasyon</div>
                                <div className="text-xs text-slate-500">Pazaryeri bağla</div>
                            </div>
                        </button>
                    </Link>

                    <Link href="/dashboard/settings/team">
                        <button className="w-full flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all text-left group">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Users className="text-blue-500" size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-foreground">Üye Ekle</div>
                                <div className="text-xs text-slate-500">Ekibe davet gönder</div>
                            </div>
                        </button>
                    </Link>

                    <Link href="/dashboard/upgrade">
                        <button className="w-full flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all text-left group">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <CreditCard className="text-purple-500" size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-foreground">Plan Yükselt</div>
                                <div className="text-xs text-slate-500">Daha fazla özellik</div>
                            </div>
                        </button>
                    </Link>

                    <Link href="/dashboard/reports">
                        <button className="w-full flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-primary/30 transition-all text-left group">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <FileText className="text-orange-500" size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-foreground">Raporlar</div>
                                <div className="text-xs text-slate-500">Raporları indir</div>
                            </div>
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
