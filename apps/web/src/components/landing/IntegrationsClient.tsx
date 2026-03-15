"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, ArrowRight, Globe, Zap, Shield, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type IntegrationType = 'marketplace' | 'ecommerce' | 'cargo' | 'accounting' | 'erp';

interface Integration {
    id: string;
    name: string;
    logo: string;
    type: IntegrationType;
    description: string;
    features: string[];
    status: 'active' | 'coming-soon' | 'beta';
    popular?: boolean;
}

const integrations: Integration[] = [
    // Marketplaces
    { id: 'trendyol', name: 'Trendyol', logo: '/images/pazaryeri/Trendyol.png', type: 'marketplace', description: "Türkiye'nin en büyük pazaryeri ile tam entegrasyon.", features: ['Ürün Senkronizasyonu', 'Sipariş Yönetimi', 'Stok Takibi', 'Fiyat Güncelleme'], status: 'active', popular: true },
    { id: 'hepsiburada', name: 'Hepsiburada', logo: '/images/pazaryeri/Hepsiburada.png', type: 'marketplace', description: 'Hepsiburada Merchant API ile güçlü entegrasyon.', features: ['Toplu Ürün Yükleme', 'Otomatik Sipariş', 'Kargo Entegrasyonu', 'Kampanya Yönetimi'], status: 'active', popular: true },
    { id: 'amazon', name: 'Amazon Türkiye', logo: '/images/pazaryeri/Amazon.png', type: 'marketplace', description: 'Amazon SP-API ile tam entegrasyon.', features: ['FBA Desteği', 'Çoklu Mağaza', 'Reklam Entegrasyonu', 'Prime Desteği'], status: 'active', popular: true },
    { id: 'n11', name: 'N11', logo: '/images/pazaryeri/N11.png', type: 'marketplace', description: 'N11 Pro entegrasyonu ile hızlı satış.', features: ['Kategori Eşleştirme', 'Varyant Yönetimi', 'Sipariş Takibi', 'İade Yönetimi'], status: 'active' },
    { id: 'ciceksepeti', name: 'Çiçeksepeti', logo: '/images/pazaryeri/ciceksepeti.png', type: 'marketplace', description: 'Çiçeksepeti pazaryeri entegrasyonu.', features: ['Ürün Yönetimi', 'Sipariş Senkronizasyonu', 'Stok Takibi'], status: 'active' },
    { id: 'pttavm', name: 'PttAVM', logo: '/images/pazaryeri/pttavm.png', type: 'marketplace', description: 'PttAVM satıcı entegrasyonu.', features: ['Ürün Listeleme', 'Sipariş Yönetimi', 'PTT Kargo'], status: 'active' },
    { id: 'etsy', name: 'Etsy', logo: '/images/pazaryeri/Etsy.png', type: 'marketplace', description: 'Global Etsy pazaryeri entegrasyonu.', features: ['Çoklu Dil', 'Uluslararası Satış', 'Handmade Kategori'], status: 'active' },
    { id: 'walmart', name: 'Walmart', logo: '/images/pazaryeri/walmart.png', type: 'marketplace', description: 'Walmart ABD pazaryeri.', features: ['US Marketplace', 'Fulfillment Services', 'Price Optimization'], status: 'beta' },
    { id: 'ebay', name: 'eBay', logo: '/images/pazaryeri/ebay.png', type: 'marketplace', description: 'Global eBay entegrasyonu.', features: ['Açık Artırma', 'Global Satış', 'Güvenli Ödeme'], status: 'coming-soon' },

    // E-commerce Platforms
    { id: 'shopify', name: 'Shopify', logo: '/images/pazaryeri/Shopify.png', type: 'ecommerce', description: 'Shopify mağazanızı bağlayın.', features: ['Ürün Senkronizasyonu', 'Sipariş Yönetimi', 'Envanter Takibi', 'Webhook Desteği'], status: 'active', popular: true },
    { id: 'woocommerce', name: 'WooCommerce', logo: '/images/pazaryeri/WooCommerce.png', type: 'ecommerce', description: 'WordPress WooCommerce entegrasyonu.', features: ['REST API', 'Ürün Senkron', 'Sipariş Aktarımı'], status: 'active' },
    { id: 'ikas', name: 'ikas', logo: '/images/pazaryeri/ikas.png', type: 'ecommerce', description: 'ikas e-ticaret altyapısı entegrasyonu.', features: ['Tam Senkronizasyon', 'Stok Yönetimi', 'Sipariş Akışı'], status: 'active' },
    { id: 'ticimax', name: 'Ticimax', logo: '/images/pazaryeri/ticimax.webp', type: 'ecommerce', description: 'Ticimax altyapı entegrasyonu.', features: ['Ürün Aktarımı', 'Sipariş Yönetimi', 'Kategori Eşleme'], status: 'active' },
    { id: 'ideasoft', name: 'IdeaSoft', logo: '/images/pazaryeri/ideasoft-logo.webp', type: 'ecommerce', description: 'IdeaSoft e-ticaret entegrasyonu.', features: ['API Entegrasyonu', 'Stok Senkron', 'Fiyat Yönetimi'], status: 'active' },
    { id: 'magento', name: 'Magento', logo: '/images/pazaryeri/magento.png', type: 'ecommerce', description: 'Adobe Commerce / Magento entegrasyonu.', features: ['Multi-store', 'ERP Entegrasyonu', 'B2B Desteği'], status: 'beta' },

    // Cargo
    { id: 'aras', name: 'Aras Kargo', logo: '/images/cargo/aras.png', type: 'cargo', description: 'Aras Kargo otomatik etiket ve takip.', features: ['Otomatik Etiket', 'Takip Numarası', 'Teslimat Bildirimi'], status: 'active' },
    { id: 'yurtici', name: 'Yurtiçi Kargo', logo: '/images/cargo/yurtici.png', type: 'cargo', description: 'Yurtiçi Kargo entegrasyonu.', features: ['Barkod Yazdırma', 'Şube Teslim', 'Anlık Takip'], status: 'active' },
    { id: 'mng', name: 'MNG Kargo', logo: '/images/cargo/mng.png', type: 'cargo', description: 'MNG Kargo API entegrasyonu.', features: ['Express Teslimat', 'Kargo Takibi', 'Çoklu Şube'], status: 'active' },
    { id: 'surat', name: 'Sürat Kargo', logo: '/images/cargo/surat.png', type: 'cargo', description: 'Sürat Kargo entegrasyonu.', features: ['Hızlı Teslimat', 'Otomatik Etiket', 'Raporlama'], status: 'active' },

    // Accounting
    { id: 'parasut', name: 'Paraşüt', logo: '/images/accounting/parasut.png', type: 'accounting', description: 'Paraşüt e-fatura ve muhasebe entegrasyonu.', features: ['E-Fatura', 'E-Arşiv', 'Cari Hesap', 'Raporlar'], status: 'active', popular: true },
    { id: 'logo', name: 'Logo Tiger', logo: '/images/accounting/logo.png', type: 'accounting', description: 'Logo ERP entegrasyonu.', features: ['Stok Takibi', 'Fatura Aktarımı', 'Cari Hesap'], status: 'active' },
    { id: 'mikro', name: 'Mikro', logo: '/images/accounting/mikro.png', type: 'accounting', description: 'Mikro yazılım entegrasyonu.', features: ['Muhasebe', 'Stok', 'E-Fatura'], status: 'coming-soon' },
];

const typeLabels: Record<IntegrationType, string> = {
    marketplace: 'Pazaryerleri',
    ecommerce: 'E-ticaret Altyapıları',
    cargo: 'Kargo Firmaları',
    accounting: 'Muhasebe & ERP',
    erp: 'ERP Sistemleri',
};

const typeColors: Record<IntegrationType, string> = {
    marketplace: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ecommerce: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    cargo: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    accounting: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    erp: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function IntegrationsClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<IntegrationType | 'all'>('all');

    const filteredIntegrations = integrations.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || i.type === selectedType;
        return matchesSearch && matchesType;
    });

    const groupedIntegrations = filteredIntegrations.reduce((acc, integration) => {
        if (!acc[integration.type]) acc[integration.type] = [];
        acc[integration.type].push(integration);
        return acc;
    }, {} as Record<IntegrationType, Integration[]>);

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/10 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full mb-6">
                        <Globe size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 tracking-wide uppercase">Entegrasyonlar</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Tüm Platformlarla <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Bağlantı</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        30+ pazaryeri, e-ticaret altyapısı, kargo ve muhasebe yazılımı entegrasyonu.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                >
                    {[
                        { icon: Globe, value: '30+', label: 'Entegrasyon' },
                        { icon: Zap, value: '<200ms', label: 'Senkron Hızı' },
                        { icon: RefreshCw, value: '7/24', label: 'Otomatik Senkron' },
                        { icon: Shield, value: '%100', label: 'Güvenli Bağlantı' },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center">
                            <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Search & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row gap-4 mb-12"
                >
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Entegrasyon ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedType === 'all'
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                }`}
                        >
                            Tümü
                        </button>
                        {(Object.keys(typeLabels) as IntegrationType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedType === type
                                    ? typeColors[type]
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {typeLabels[type]}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Integration Groups */}
                {(Object.entries(groupedIntegrations) as [IntegrationType, Integration[]][]).map(([type, items], groupIndex) => (
                    <motion.div
                        key={type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + groupIndex * 0.1 }}
                        className="mb-12"
                    >
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${typeColors[type]}`}>
                                {typeLabels[type]}
                            </span>
                            <span className="text-sm text-slate-400 font-normal">({items.length})</span>
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((integration, i) => (
                                <motion.div
                                    key={integration.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    className="group p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/5"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={integration.logo}
                                                    alt={integration.name}
                                                    className="w-8 h-8 object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-lg font-bold text-slate-400">${integration.name[0]}</span>`;
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {integration.name}
                                                    {integration.popular && (
                                                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded">
                                                            POPÜLER
                                                        </span>
                                                    )}
                                                </h3>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${integration.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    integration.status === 'beta' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                        'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                                                    }`}>
                                                    {integration.status === 'active' ? 'Aktif' : integration.status === 'beta' ? 'Beta' : 'Yakında'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        {integration.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {integration.features.slice(0, 3).map((feature, j) => (
                                            <span key={j} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                <Check size={12} className="text-emerald-500" />
                                                {feature}
                                            </span>
                                        ))}
                                        {integration.features.length > 3 && (
                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                                +{integration.features.length - 3} daha
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {filteredIntegrations.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Aramanızla eşleşen entegrasyon bulunamadı.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedType('all'); }}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                            Filtreleri temizle
                        </button>
                    </div>
                )}

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center"
                >
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        İhtiyacınız olan entegrasyon listede yok mu?
                    </h2>
                    <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                        Bize bildirin, öncelikli olarak geliştirme listemize alalım.
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold hover:bg-blue-50 transition-colors">
                        Entegrasyon Talep Et <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
