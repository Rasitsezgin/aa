"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
    Store, Search, ArrowRight, ShoppingCart, Check, Clock, Zap, Users,
    Calculator, Truck, FileText, FileCode2, Globe, Sparkles, Activity,
    TrendingUp, Shield, Cpu, Database, ExternalLink, Filter, Grid3X3, List,
    Star, Download, Lock, RefreshCw, BarChart3, Layers, Plug, Mail,
    Phone, MessageCircle, Plus, CheckCircle2, AlertCircle, Play,
    ChevronRight, ChevronDown, BadgeCheck, Timer, Copy, Settings
} from 'lucide-react';
import Link from 'next/link';

// ==================== TYPES ====================
type CategoryId = 'all' | 'pazaryeri' | 'eticaret' | 'muhasebe' | 'kargo' | 'efatura' | 'xml' | 'dropshipping' | 'reklam';

interface Feature {
    icon: React.ReactNode;
    label: string;
    value: string;
}

interface Stat {
    label: string;
    value: string;
    change: string;
    icon: React.ReactNode;
}

interface ActivityItem {
    id: string;
    type: 'sync' | 'order' | 'error' | 'success';
    message: string;
    time: string;
    integration: string;
}

interface Integration {
    id: string;
    name: string;
    category: CategoryId;
    color: string;
    gradient: string;
    logo: string;
    desc: string;
    shortDesc: string;
    features: string[];
    stats: {
        users: string;
        syncTime: string;
        uptime: string;
    };
    rating: number;
    reviews: number;
    isPopular: boolean;
    isNew: boolean;
    documentation: string;
    setupTime: string;
    price: string;
    requirements: string[];
    connected?: boolean;
    lastSync?: string;
}

// ==================== DATA ====================
const categories = [
    { id: 'all' as const, name: 'Tüm Entegrasyonlar', icon: Layers, count: 32 },
    { id: 'pazaryeri' as const, name: 'Pazaryerleri', icon: Store, count: 12 },
    { id: 'eticaret' as const, name: 'E-ticaret', icon: ShoppingCart, count: 8 },
    { id: 'muhasebe' as const, name: 'Muhasebe', icon: Calculator, count: 6 },
    { id: 'kargo' as const, name: 'Kargo & Lojistik', icon: Truck, count: 5 },
    { id: 'efatura' as const, name: 'E-Fatura & E-Arşiv', icon: FileText, count: 4 },
    { id: 'xml' as const, name: 'XML & Dropshipping', icon: FileCode2, count: 7 },
    { id: 'reklam' as const, name: 'Reklam & Pazarlama', icon: TrendingUp, count: 3 },
];

const integrations: Integration[] = [
    // Pazaryeri - Popüler
    { 
        id: 'trendyol', 
        name: 'Trendyol', 
        category: 'pazaryeri', 
        color: '#F27A1A', 
        gradient: 'from-orange-500 to-orange-600',
        logo: 'T',
        desc: 'Türkiye\'nin en büyük pazaryerinde otomatik ürün yükleme, stok senkronizasyonu, sipariş yönetimi ve fatura entegrasyonu. Gerçek zamanlı API bağlantısı.',
        shortDesc: 'Tam otomasyon - ürün, stok, sipariş, fatura',
        features: ['Otomatik Ürün Yükleme', 'Stok Senkronizasyonu', 'Sipariş Yönetimi', 'Fatura Entegrasyonu', 'Kampanya Yönetimi', 'Raporlama API'],
        stats: { users: '12.5K+', syncTime: '< 2 dk', uptime: '99.9%' },
        rating: 4.9,
        reviews: 2847,
        isPopular: true,
        isNew: false,
        documentation: '/docs/trendyol',
        setupTime: '5 dakika',
        price: 'Ücretsiz',
        requirements: ['Trendyol Satıcı Hesabı', 'API Anahtarı', 'Mağaza Onayı']
    },
    { 
        id: 'hepsiburada', 
        name: 'Hepsiburada', 
        category: 'pazaryeri', 
        color: '#FF6000', 
        gradient: 'from-orange-600 to-red-500',
        logo: 'H',
        desc: 'Hepsiburada\'da çift yönlü entegrasyon ile ürünlerinizi otomatik yönetin, siparişleri anlık çekin, stokları senkronize edin.',
        shortDesc: 'Çift yönlü anlık senkronizasyon',
        features: ['Ürün Yönetimi', 'Stok Eşitleme', 'Sipariş İmport', 'Fatura Kesimi', 'Kargo Entegrasyonu', 'İade Yönetimi'],
        stats: { users: '8.2K+', syncTime: '< 3 dk', uptime: '99.8%' },
        rating: 4.8,
        reviews: 1923,
        isPopular: true,
        isNew: false,
        documentation: '/docs/hepsiburada',
        setupTime: '5 dakika',
        price: 'Ücretsiz',
        requirements: ['Hepsiburada Satıcı Paneli', 'API Erişimi']
    },
    { 
        id: 'amazon-tr', 
        name: 'Amazon.com.tr', 
        category: 'pazaryeri', 
        color: '#FF9900', 
        gradient: 'from-yellow-500 to-orange-500',
        logo: 'A',
        desc: 'Amazon Türkiye\'de global standartlarda entegrasyon. FBA (Fulfillment by Amazon) desteği, reklam API\'si ve detaylı raporlama.',
        shortDesc: 'Global standartlarda entegrasyon + FBA',
        features: ['FBA Desteği', 'Reklam API', 'Amazon Prime', 'Multi-Channel', 'A+ Content', 'Brand Analytics'],
        stats: { users: '3.1K+', syncTime: '< 5 dk', uptime: '99.9%' },
        rating: 4.9,
        reviews: 856,
        isPopular: true,
        isNew: false,
        documentation: '/docs/amazon-tr',
        setupTime: '10 dakika',
        price: 'Pro Plan',
        requirements: ['Professional Seller Account', 'MWS Access']
    },
    { 
        id: 'n11', 
        name: 'N11', 
        category: 'pazaryeri', 
        color: '#A3248C', 
        gradient: 'from-purple-600 to-pink-600',
        logo: 'n11',
        desc: 'N11 pazaryerinde toplu ürün yükleme, otomatik fiyatlandırma ve kampanya yönetimi. Hızlı ve güvenilir API entegrasyonu.',
        shortDesc: 'Toplu ürün yükleme & fiyat yönetimi',
        features: ['Toplu Ürün Aktarımı', 'Otomatik Fiyatlandırma', 'Kampanya Yönetimi', 'Sipariş Takibi', 'Stok Kontrolü', 'Raporlama'],
        stats: { users: '9.8K+', syncTime: '< 2 dk', uptime: '99.7%' },
        rating: 4.7,
        reviews: 1634,
        isPopular: false,
        isNew: false,
        documentation: '/docs/n11',
        setupTime: '5 dakika',
        price: 'Ücretsiz',
        requirements: ['N11 Mağaza Hesabı', 'API Anahtarı']
    },
    { 
        id: 'ciceksepeti', 
        name: 'Çiçeksepeti', 
        category: 'pazaryeri', 
        color: '#00C853', 
        gradient: 'from-green-500 to-emerald-600',
        logo: 'Ç',
        desc: 'Çiçeksepeti Marketplace entegrasyonu. Hızlı teslimat entegrasyonu, hediye paketi seçenekleri ve özel kampanya yönetimi.',
        shortDesc: 'Marketplace + Hızlı Teslimat entegrasyonu',
        features: ['Marketplace API', 'Hızlı Teslimat', 'Hediye Paketi', 'Sipariş Otomasyonu', 'Stok Yönetimi', 'Fatura Entegrasyonu'],
        stats: { users: '4.5K+', syncTime: '< 3 dk', uptime: '99.8%' },
        rating: 4.6,
        reviews: 987,
        isPopular: false,
        isNew: false,
        documentation: '/docs/ciceksepeti',
        setupTime: '5 dakika',
        price: 'Ücretsiz',
        requirements: ['Çiçeksepeti Satıcı Hesabı']
    },
    { 
        id: 'pttavm', 
        name: 'PTT AVM', 
        category: 'pazaryeri', 
        color: '#D4AF37', 
        gradient: 'from-yellow-600 to-amber-600',
        logo: 'P',
        desc: 'PTT AVM pazaryerinde yerel esnaf destekli satış. Kargo entegrasyonu ve ödeme sistemleri ile tam uyumlu çalışma.',
        shortDesc: 'Yerel esnaf dostu pazaryeri entegrasyonu',
        features: ['API Entegrasyonu', 'Kargo Takibi', 'Ödeme Sistemi', 'Sipariş Yönetimi', 'Stok Kontrolü', 'Fatura'],
        stats: { users: '2.1K+', syncTime: '< 4 dk', uptime: '99.5%' },
        rating: 4.5,
        reviews: 432,
        isPopular: false,
        isNew: false,
        documentation: '/docs/pttavm',
        setupTime: '7 dakika',
        price: 'Ücretsiz',
        requirements: ['PTT AVM Satıcı Hesabı']
    },
    // E-ticaret Altyapıları
    { 
        id: 'shopify', 
        name: 'Shopify', 
        category: 'eticaret', 
        color: '#96BF48', 
        gradient: 'from-green-600 to-emerald-700',
        logo: 'S',
        desc: 'Shopify mağazanızı Türkiye pazaryerleriyle entegre edin. E-ihracat, global satış ve çoklu kanal yönetimi.',
        shortDesc: 'E-ihracat & Global satış entegrasyonu',
        features: ['GraphQL API', 'Multi-Channel', 'E-ihracat', 'Stok Senkronizasyonu', 'Sipariş İmport', 'Metafields Desteği'],
        stats: { users: '5.3K+', syncTime: '< 1 dk', uptime: '99.9%' },
        rating: 4.9,
        reviews: 1234,
        isPopular: true,
        isNew: false,
        documentation: '/docs/shopify',
        setupTime: '3 dakika',
        price: 'Ücretsiz',
        requirements: ['Shopify Mağazası', 'Admin API Access']
    },
    { 
        id: 'woocommerce', 
        name: 'WooCommerce', 
        category: 'eticaret', 
        color: '#96588A', 
        gradient: 'from-purple-600 to-indigo-700',
        logo: 'W',
        desc: 'WordPress sitenizdeki WooCommerce mağazanızı tüm pazaryerleriyle senkronize edin. Açık kaynak esneklği.',
        shortDesc: 'WordPress entegrasyonu - Açık kaynak',
        features: ['REST API', 'Webhook Desteği', 'Plugin Entegrasyonu', 'Özelleştirilebilir', 'Stok Senkronizasyonu', 'Sipariş Yönetimi'],
        stats: { users: '6.7K+', syncTime: '< 2 dk', uptime: '99.8%' },
        rating: 4.8,
        reviews: 1876,
        isPopular: true,
        isNew: false,
        documentation: '/docs/woocommerce',
        setupTime: '5 dakika',
        price: 'Ücretsiz',
        requirements: ['WooCommerce Kurulumu', 'API Keys']
    },
    { 
        id: 'ideasoft', 
        name: 'IdeaSoft', 
        category: 'eticaret', 
        color: '#0066CC', 
        gradient: 'from-blue-600 to-blue-800',
        logo: 'I',
        desc: 'IdeaSoft e-ticaret altyapısı ile Türkiye\'nin lider pazaryerleri arasında çift yönlü anlık senkronizasyon.',
        shortDesc: 'Türkiye lideri altyapı entegrasyonu',
        features: ['Tam Entegrasyon', 'Anlık Senkron', 'Özel API', 'Stok Yönetimi', 'Sipariş Aktarımı', 'Fatura'],
        stats: { users: '7.2K+', syncTime: '< 1 dk', uptime: '99.9%' },
        rating: 4.8,
        reviews: 2134,
        isPopular: true,
        isNew: false,
        documentation: '/docs/ideasoft',
        setupTime: '5 dakika',
        price: 'Ücretsiz',
        requirements: ['IdeaSoft Mağaza', 'API Erişimi']
    },
    { 
        id: 'ticimax', 
        name: 'Ticimax', 
        category: 'eticaret', 
        color: '#6366F1', 
        gradient: 'from-indigo-600 to-purple-700',
        logo: 'T',
        desc: 'Ticimax altyapınızda sıfır kayıp garantisi ile stok ve sipariş yönetimi. Gerçek zamanlı senkronizasyon.',
        shortDesc: 'Sıfır kayıp garantili senkronizasyon',
        features: ['Gerçek Zamanlı', 'Stok Kontrolü', 'Sipariş Yönetimi', 'XML Çıktı', 'Fatura Entegrasyonu', 'Raporlama'],
        stats: { users: '4.8K+', syncTime: '< 2 dk', uptime: '99.8%' },
        rating: 4.7,
        reviews: 1234,
        isPopular: false,
        isNew: false,
        documentation: '/docs/ticimax',
        setupTime: '5 dakika',
        price: 'Ücretsiz',
        requirements: ['Ticimax Panel', 'API Bilgileri']
    },
    // Muhasebe
    { 
        id: 'parasut', 
        name: 'Paraşüt', 
        category: 'muhasebe', 
        color: '#0066FF', 
        gradient: 'from-blue-500 to-cyan-600',
        logo: 'P',
        desc: 'Paraşüt ile otomatik e-fatura, e-arşiv fatura ve ön muhasebe entegrasyonu. Siparişler anında faturaya dönüşür.',
        shortDesc: 'Otomatik fatura & muhasebe entegrasyonu',
        features: ['E-Fatura', 'E-Arşiv', 'Otomatik Fatura', 'Cari Yönetimi', 'Banka Entegrasyonu', 'Raporlama'],
        stats: { users: '6.1K+', syncTime: 'Anlık', uptime: '99.9%' },
        rating: 4.9,
        reviews: 2156,
        isPopular: true,
        isNew: false,
        documentation: '/docs/parasut',
        setupTime: '5 dakika',
        price: 'Ücretsiz',
        requirements: ['Paraşüt Hesabı', 'API Erişimi']
    },
    { 
        id: 'logo', 
        name: 'Logo Tiger / Go', 
        category: 'muhasebe', 
        color: '#00A0B0', 
        gradient: 'from-cyan-600 to-teal-700',
        logo: 'L',
        desc: 'Logo Tiger ve Go 3 ERP sistemleriyle kurumsal entegrasyon. Stok, cari, sipariş ve fatura yönetimi.',
        shortDesc: 'Kurumsal ERP entegrasyonu',
        features: ['ERP Entegrasyonu', 'Stok Yönetimi', 'Cari Yönetimi', 'Sipariş Aktarımı', 'Fatura', 'Raporlama'],
        stats: { users: '3.4K+', syncTime: '< 5 dk', uptime: '99.7%' },
        rating: 4.8,
        reviews: 987,
        isPopular: false,
        isNew: false,
        documentation: '/docs/logo',
        setupTime: '15 dakika',
        price: 'Enterprise',
        requirements: ['Logo ERP', 'Web Servis Erişimi']
    },
    // Kargo
    { 
        id: 'yurtici', 
        name: 'Yurtiçi Kargo', 
        category: 'kargo', 
        color: '#0047AB', 
        gradient: 'from-blue-700 to-blue-900',
        logo: 'Y',
        desc: 'Yurtiçi Kargo entegrasyonu ile toplu barkod yazdırma, otomatik kargo fişi oluşturma ve takip numarası aktarımı.',
        shortDesc: 'Toplu barkod & otomatik takip no',
        features: ['Toplu Barkod', 'Otomatik Fiş', 'Takip No', 'Şube Yönetimi', 'Teslimat Raporu', 'İade Yönetimi'],
        stats: { users: '8.9K+', syncTime: 'Anlık', uptime: '99.8%' },
        rating: 4.7,
        reviews: 1876,
        isPopular: true,
        isNew: false,
        documentation: '/docs/yurtici',
        setupTime: '10 dakika',
        price: 'Ücretsiz',
        requirements: ['Yurtiçi Kargo Sözleşmesi', 'API Bilgileri']
    },
    { 
        id: 'aras', 
        name: 'Aras Kargo', 
        category: 'kargo', 
        color: '#E30613', 
        gradient: 'from-red-600 to-red-800',
        logo: 'A',
        desc: 'Aras Kargo entegrasyonu ile anında kargo fişi oluşturma, durum sorgulama ve teslimat takibi.',
        shortDesc: 'Anında kargo fişi & durum takibi',
        features: ['Kargo Fişi', 'Durum Sorgulama', 'Takip', 'Teslimat', 'İade', 'Raporlama'],
        stats: { users: '7.5K+', syncTime: 'Anlık', uptime: '99.7%' },
        rating: 4.6,
        reviews: 1432,
        isPopular: true,
        isNew: false,
        documentation: '/docs/aras',
        setupTime: '10 dakika',
        price: 'Ücretsiz',
        requirements: ['Aras Kargo Sözleşmesi', 'Web API Erişimi']
    },
    { 
        id: 'mng', 
        name: 'MNG Kargo', 
        category: 'kargo', 
        color: '#1E3A8A', 
        gradient: 'from-blue-800 to-slate-800',
        logo: 'M',
        desc: 'MNG Kargo ile şube teslimat, iade operasyonları ve gönderi takibi. Tam entegre kargo yönetimi.',
        shortDesc: 'Şube teslimat & iade operasyonları',
        features: ['Şube Teslimat', 'İade', 'Takip', 'Gönderi Yönetimi', 'Raporlama', 'Fiyatlandırma'],
        stats: { users: '6.2K+', syncTime: 'Anlık', uptime: '99.6%' },
        rating: 4.5,
        reviews: 1123,
        isPopular: false,
        isNew: false,
        documentation: '/docs/mng',
        setupTime: '10 dakika',
        price: 'Ücretsiz',
        requirements: ['MNG Kargo Sözleşmesi', 'API Bilgileri']
    },
    // E-Fatura
    { 
        id: 'gib', 
        name: 'GİB E-Fatura / E-Arşiv', 
        category: 'efatura', 
        color: '#1F2937', 
        gradient: 'from-slate-700 to-slate-900',
        logo: 'GİB',
        desc: 'Gelir İdaresi Başkanlığı direkt entegrasyonu. 5000/30000 TL limitli faturaları doğrudan GİB\'e iletin.',
        shortDesc: 'Direkt GİB entegrasyonu - 5K/30K',
        features: ['E-Fatura', 'E-Arşiv', 'GİB Entegrasyonu', 'Otomatik İmza', 'Raporlama', 'Mali Mühür'],
        stats: { users: '15.2K+', syncTime: '< 30 sn', uptime: '99.9%' },
        rating: 4.9,
        reviews: 3421,
        isPopular: true,
        isNew: false,
        documentation: '/docs/gib',
        setupTime: '20 dakika',
        price: 'Ücretsiz',
        requirements: ['GİB Portal Hesabı', 'Mali Mühür', 'E-Fatura Kaydı']
    },
    { 
        id: 'sovos', 
        name: 'Sovos (Fit Solutions)', 
        category: 'efatura', 
        color: '#7C3AED', 
        gradient: 'from-violet-600 to-purple-700',
        logo: 'S',
        desc: 'Sovos özel entegratör üzerinden saniyeler içinde e-fatura kesme. Küresel uyumlu mali çözümler.',
        shortDesc: 'Özel entegratör - Saniyeler içinde',
        features: ['E-Fatura', 'E-Arşiv', 'E-Defter', 'E-Belge', 'Raporlama', 'Global Compliance'],
        stats: { users: '4.3K+', syncTime: '< 1 dk', uptime: '99.9%' },
        rating: 4.8,
        reviews: 876,
        isPopular: false,
        isNew: false,
        documentation: '/docs/sovos',
        setupTime: '15 dakika',
        price: 'Entegratör Ücreti',
        requirements: ['Sovos Hesabı', 'Entegratör Sözleşmesi']
    },
    // XML / Dropshipping
    { 
        id: 'aktifbebek', 
        name: 'Aktif Bebek', 
        category: 'xml', 
        color: '#EC4899', 
        gradient: 'from-pink-500 to-rose-600',
        logo: 'AB',
        desc: 'Binlerce bebek ürününü kar marjı ile XML\'den çekin, otomatik güncelleme ve stok takibi.',
        shortDesc: 'Bebek ürünleri - 50K+ ürün',
        features: ['XML Ürün Çekme', 'Otomatik Güncelleme', 'Stok Takibi', 'Fiyat Yönetimi', 'Kargo Entegrasyonu', 'Raporlama'],
        stats: { users: '2.1K+', syncTime: '< 15 dk', uptime: '99.5%' },
        rating: 4.6,
        reviews: 543,
        isPopular: false,
        isNew: false,
        documentation: '/docs/aktifbebek',
        setupTime: '10 dakika',
        price: 'Komisyon Bazlı',
        requirements: ['Aktif Bebek Bayiliği', 'XML Erişimi']
    },
    { 
        id: 'dropshipping', 
        name: 'Genel XML Entegratör', 
        category: 'xml', 
        color: '#10B981', 
        gradient: 'from-emerald-500 to-teal-600',
        logo: 'XML',
        desc: 'Herhangi bir XML kaynağından ürün çekme, stok ve fiyat senkronizasyonu. Özelleştirilebilir yapı.',
        shortDesc: 'Özelleştirilebilir XML entegratör',
        features: ['XML Çekme', 'Stok Senkronizasyonu', 'Fiyat Yönetimi', 'Kategori Eşleme', 'Otomatik Güncelleme', 'Multi-Source'],
        stats: { users: '5.4K+', syncTime: 'Özelleştirilebilir', uptime: '99.7%' },
        rating: 4.5,
        reviews: 876,
        isPopular: false,
        isNew: true,
        documentation: '/docs/xml',
        setupTime: '30 dakika',
        price: 'Ücretsiz',
        requirements: ['XML URL', 'Yapılandırma']
    },
];

const globalStats: Stat[] = [
    { label: 'Aktif Entegrasyon', value: '32', change: '+5 yeni', icon: <Plug className="w-5 h-5" /> },
    { label: 'Senkronize Ürün', value: '45.2M+', change: '+2.1M bu ay', icon: <Database className="w-5 h-5" /> },
    { label: 'İşlenen Sipariş', value: '1.8M+', change: '+180K bu ay', icon: <ShoppingCart className="w-5 h-5" /> },
    { label: 'Aktif Kullanıcı', value: '12.5K+', change: '+1.2K yeni', icon: <Users className="w-5 h-5" /> },
];

const recentActivity: ActivityItem[] = [
    { id: '1', type: 'success', message: 'Trendyol - 1,247 ürün senkronize edildi', time: '2 dk önce', integration: 'trendyol' },
    { id: '2', type: 'order', message: 'Amazon - 43 yeni sipariş alındı', time: '5 dk önce', integration: 'amazon-tr' },
    { id: '3', type: 'sync', message: 'Hepsiburada - Stok güncellemesi tamamlandı', time: '8 dk önce', integration: 'hepsiburada' },
    { id: '4', type: 'success', message: 'Paraşüt - 156 fatura oluşturuldu', time: '12 dk önce', integration: 'parasut' },
    { id: '5', type: 'sync', message: 'Shopify - 892 ürün güncellendi', time: '15 dk önce', integration: 'shopify' },
    { id: '6', type: 'order', message: 'N11 - 27 yeni sipariş', time: '18 dk önce', integration: 'n11' },
];

const comparisonFeatures = [
    { name: 'Otomatik Ürün Yükleme', pazaryeri: true, eticaret: true, muhasebe: false, kargo: false, efatura: false },
    { name: 'Stok Senkronizasyonu', pazaryeri: true, eticaret: true, muhasebe: false, kargo: false, efatura: false },
    { name: 'Sipariş İmport / Yönetimi', pazaryeri: true, eticaret: true, muhasebe: false, kargo: true, efatura: false },
    { name: 'Fatura Otomasyonu', pazaryeri: false, eticaret: false, muhasebe: true, kargo: false, efatura: true },
    { name: 'Kargo Barkodu / Fişi', pazaryeri: false, eticaret: false, muhasebe: false, kargo: true, efatura: false },
    { name: 'E-Fatura / E-Arşiv', pazaryeri: false, eticaret: false, muhasebe: true, kargo: false, efatura: true },
    { name: 'Kampanya Yönetimi', pazaryeri: true, eticaret: true, muhasebe: false, kargo: false, efatura: false },
    { name: 'Raporlama & Analitik', pazaryeri: true, eticaret: true, muhasebe: true, kargo: true, efatura: true },
];

// ==================== COMPONENT ====================
export default function IntegrationsClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [isComparisonOpen, setIsComparisonOpen] = useState(false);
    const [activityFilter, setActivityFilter] = useState<'all' | 'sync' | 'order' | 'success'>('all');

    const filteredIntegrations = useMemo(() => {
        return integrations.filter(int => {
            const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 int.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 int.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = activeCategory === 'all' || int.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const filteredActivity = useMemo(() => {
        if (activityFilter === 'all') return recentActivity;
        return recentActivity.filter(a => a.type === activityFilter);
    }, [activityFilter]);

    const popularIntegrations = useMemo(() => integrations.filter(i => i.isPopular).slice(0, 4), []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0B1121] dark:via-[#0F172A] dark:to-[#1E293B] flex flex-col pt-20 relative overflow-hidden transition-colors duration-500">
            
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                {/* Floating Orbs */}
                <motion.div 
                    animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-[100px]" 
                />
                <motion.div 
                    animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-[100px]" 
                />
                <motion.div 
                    animate={{ x: [0, 50, 0], y: [0, -100, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" 
                />
            </div>

            {/* ==================== HERO SECTION ==================== */}
            <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Live Stats Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {globalStats.map((stat, idx) => (
                                    <motion.div 
                                        key={stat.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-border"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                            <div className="text-xs text-slate-500">{stat.label}</div>
                                            <div className="text-[10px] font-medium text-emerald-500">{stat.change}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Content */}
                    <div className="text-center mb-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary rounded-full text-sm font-bold mb-6 border border-primary/20"
                        >
                            <Zap className="w-4 h-4" /> 
                            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                32+ Entegrasyon • 99.9% Uptime
                            </span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight"
                        >
                            Tüm Satış Kanallarınızı{' '}
                            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Tek Platformda
                            </span>{' '}
                            Birleştirin
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
                        >
                            Trendyol, Amazon, Shopify, Paraşüt ve 30+ platform ile anlık senkronizasyon. 
                            Stok, sipariş ve fatura yönetimini otomatikleştirin, saatlerce süren işleri saniyelere indirin.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-3xl mx-auto relative"
                        >
                            <div className="relative group">
                                <Search className="w-6 h-6 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Entegrasyon ara: Trendyol, Shopify, Paraşüt, kargo..."
                                    className="w-full bg-white dark:bg-slate-900 border-2 border-border rounded-3xl pl-16 pr-32 py-6 text-lg font-medium shadow-2xl shadow-primary/5 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <span className="text-xs text-slate-400 hidden sm:block">⌘K</span>
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery('')}
                                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Quick Tags */}
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                <span className="text-xs text-slate-500">Popüler:</span>
                                {['Trendyol', 'Shopify', 'Paraşüt', 'Amazon', 'XML'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSearchQuery(tag)}
                                        className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-border rounded-full hover:border-primary/50 hover:text-primary transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ==================== POPULAR INTEGRATIONS ==================== */}
            {!searchQuery && activeCategory === 'all' && (
                <section className="relative py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">En Popüler Entegrasyonlar</h2>
                                <p className="text-sm text-slate-500">Binlerce işletme tarafından aktif kullanılıyor</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {popularIntegrations.map((int, idx) => (
                                <motion.div
                                    key={int.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => setSelectedIntegration(int)}
                                    className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${int.gradient} opacity-10 group-hover:opacity-20 blur-3xl transition-opacity`} />
                                    
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${int.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                            {int.logo}
                                        </div>
                                        {int.isPopular && (
                                            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold rounded-lg">
                                                POPÜLER
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{int.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{int.shortDesc}</p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {int.stats.users}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-500" /> {int.rating}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                                            {int.price}
                                        </span>
                                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ==================== MAIN CONTENT ==================== */}
            <section className="relative py-12 flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Sidebar */}
                        <aside className="w-full lg:w-80 shrink-0">
                            <div className="sticky top-24 space-y-6">
                                {/* Categories */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-lg overflow-hidden">
                                    <div className="p-4 border-b border-border bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            <Filter className="w-4 h-4" /> Kategoriler
                                        </h3>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setActiveCategory(cat.id)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                                                    activeCategory === cat.id 
                                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25' 
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <cat.icon className={`w-5 h-5 ${activeCategory === cat.id ? 'text-white' : 'text-slate-400'}`} />
                                                    {cat.name}
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    activeCategory === cat.id 
                                                    ? 'bg-white/20 text-white' 
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                                                }`}>
                                                    {cat.count}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Activity Feed */}
                                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-lg overflow-hidden">
                                    <div className="p-4 border-b border-border bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-emerald-500" /> 
                                                Canlı Aktivite
                                            </h3>
                                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                CANLI
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Activity Filter */}
                                    <div className="flex gap-1 p-2 border-b border-border">
                                        {(['all', 'sync', 'order', 'success'] as const).map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setActivityFilter(f)}
                                                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                                                    activityFilter === f 
                                                    ? 'bg-primary/10 text-primary' 
                                                    : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                            >
                                                {f === 'all' ? 'Tümü' : f === 'sync' ? 'Senkron' : f === 'order' ? 'Sipariş' : 'Başarı'}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                                        <AnimatePresence>
                                            {filteredActivity.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                        item.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                                        item.type === 'order' ? 'bg-blue-100 text-blue-600' :
                                                        item.type === 'sync' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                        {item.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                                                         item.type === 'order' ? <ShoppingCart className="w-4 h-4" /> :
                                                         item.type === 'sync' ? <RefreshCw className="w-4 h-4" /> :
                                                         <AlertCircle className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{item.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">{item.time}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Grid */}
                        <main className="flex-1">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        {categories.find(c => c.id === activeCategory)?.name}
                                        <span className="text-lg text-slate-400 font-normal">
                                            ({filteredIntegrations.length})
                                        </span>
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Tüm entegrasyonları keşfedin'}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-border'}`}
                                    >
                                        <Grid3X3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-border'}`}
                                    >
                                        <List className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsComparisonOpen(!isComparisonOpen)}
                                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-border font-medium text-sm hover:border-primary/50 transition-colors"
                                    >
                                        <BarChart3 className="w-4 h-4 inline mr-2" />
                                        Karşılaştır
                                    </button>
                                </div>
                            </div>

                            {/* Integration Grid/List */}
                            {filteredIntegrations.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-16 text-center">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        Sonuç bulunamadı
                                    </h3>
                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                        "{searchQuery}" araması için entegrasyon bulamadık. Farklı bir anahtar kelime deneyin veya kategori seçin.
                                    </p>
                                    <button 
                                        onClick={() => {setSearchQuery(''); setActiveCategory('all');}}
                                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                                    >
                                        Tüm Entegrasyonları Göster
                                    </button>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' 
                                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                                    : "space-y-4"
                                }>
                                    <AnimatePresence mode="popLayout">
                                        {filteredIntegrations.map((int, idx) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                                                key={int.id}
                                                onClick={() => setSelectedIntegration(int)}
                                                className={`group relative bg-white dark:bg-slate-900 border border-border rounded-3xl hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all cursor-pointer overflow-hidden ${
                                                    viewMode === 'list' ? 'flex items-center gap-6 p-4' : 'flex flex-col p-6'
                                                }`}
                                            >
                                                {/* Background Gradient */}
                                                <div className={`absolute ${viewMode === 'list' ? '-right-10 -top-10' : '-top-20 -right-20'} w-40 h-40 bg-gradient-to-br ${int.gradient} opacity-10 group-hover:opacity-20 blur-3xl transition-opacity`} />
                                                
                                                {/* Logo */}
                                                <div className={`${viewMode === 'list' ? 'shrink-0' : ''} relative`}>
                                                    <div className={`${viewMode === 'list' ? 'w-16 h-16 text-xl' : 'w-14 h-14 text-lg'} rounded-2xl bg-gradient-to-br ${int.gradient} flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                                                        {int.logo}
                                                    </div>
                                                    {int.isNew && (
                                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                                            <Sparkles className="w-3 h-3 text-white" />
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className={`flex-1 ${viewMode === 'list' ? '' : 'mt-4'}`}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                                {int.name}
                                                            </h3>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                {categories.find(c => c.id === int.category)?.name}
                                                            </span>
                                                        </div>
                                                        {int.isPopular && (
                                                            <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-600 text-[10px] font-bold rounded-lg">
                                                                <Star className="w-3 h-3" /> POPÜLER
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <p className={`text-sm text-slate-600 dark:text-slate-400 mb-4 ${viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'}`}>
                                                        {int.desc}
                                                    </p>
                                                    
                                                    {/* Features Pills */}
                                                    <div className={`flex flex-wrap gap-1 mb-4 ${viewMode === 'list' ? 'hidden md:flex' : ''}`}>
                                                        {int.features.slice(0, viewMode === 'list' ? 3 : 4).map((feature, i) => (
                                                            <span 
                                                                key={i}
                                                                className="px-2 py-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md"
                                                            >
                                                                {feature}
                                                            </span>
                                                        ))}
                                                        {int.features.length > (viewMode === 'list' ? 3 : 4) && (
                                                            <span className="px-2 py-1 text-[10px] font-medium text-primary">
                                                                +{int.features.length - (viewMode === 'list' ? 3 : 4)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Footer Stats */}
                                                <div className={`${viewMode === 'list' ? 'shrink-0 text-right' : 'pt-4 border-t border-border mt-auto'}`}>
                                                    <div className={`flex ${viewMode === 'list' ? 'flex-col items-end gap-2' : 'items-center justify-between'}`}>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3 h-3" /> {int.stats.users}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Star className="w-3 h-3 text-yellow-500" /> {int.rating}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" /> {int.setupTime}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className={`flex items-center gap-3 ${viewMode === 'list' ? '' : ''}`}>
                                                            <span className={`text-xs font-medium ${int.price === 'Ücretsiz' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'} px-2 py-1 rounded-lg`}>
                                                                {int.price}
                                                            </span>
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all group-hover:translate-x-1">
                                                                <ChevronRight className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {/* ==================== COMPARISON TABLE ==================== */}
            <AnimatePresence>
                {isComparisonOpen && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative py-12 bg-slate-50/50 dark:bg-slate-900/50 border-y border-border"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <BarChart3 className="w-6 h-6 text-primary" />
                                        Entegrasyon Karşılaştırması
                                    </h2>
                                    <p className="text-sm text-slate-500">Hangi entegrasyon sizin için uygun? Özellikleri karşılaştırın.</p>
                                </div>
                                <button 
                                    onClick={() => setIsComparisonOpen(false)}
                                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-border text-slate-500 hover:text-slate-700"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
                                                <th className="text-left p-4 text-sm font-bold text-slate-900 dark:text-white">Özellik</th>
                                                <th className="text-center p-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <Store className="w-4 h-4 inline mr-1" /> Pazaryeri
                                                </th>
                                                <th className="text-center p-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <ShoppingCart className="w-4 h-4 inline mr-1" /> E-ticaret
                                                </th>
                                                <th className="text-center p-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <Calculator className="w-4 h-4 inline mr-1" /> Muhasebe
                                                </th>
                                                <th className="text-center p-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <Truck className="w-4 h-4 inline mr-1" /> Kargo
                                                </th>
                                                <th className="text-center p-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <FileText className="w-4 h-4 inline mr-1" /> E-Fatura
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonFeatures.map((feature, idx) => (
                                                <tr key={feature.name} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'}>
                                                    <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">{feature.name}</td>
                                                    <td className="p-4 text-center">
                                                        {feature.pazaryeri ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                        ) : (
                                                            <span className="w-5 h-5 block mx-auto rounded-full bg-slate-200 dark:bg-slate-700" />
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {feature.eticaret ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                        ) : (
                                                            <span className="w-5 h-5 block mx-auto rounded-full bg-slate-200 dark:bg-slate-700" />
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {feature.muhasebe ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                        ) : (
                                                            <span className="w-5 h-5 block mx-auto rounded-full bg-slate-200 dark:bg-slate-700" />
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {feature.kargo ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                        ) : (
                                                            <span className="w-5 h-5 block mx-auto rounded-full bg-slate-200 dark:bg-slate-700" />
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        {feature.efatura ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                                                        ) : (
                                                            <span className="w-5 h-5 block mx-auto rounded-full bg-slate-200 dark:bg-slate-700" />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ==================== CTA SECTION ==================== */}
            <section className="relative py-16 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px]" />
                        </div>
                        
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full text-sm font-bold mb-4">
                                    <Sparkles className="w-4 h-4" /> 14 Gün Ücretsiz Deneme
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                    Tüm Entegrasyonları Şimdi Deneyin
                                </h2>
                                <p className="text-lg text-indigo-200 max-w-xl">
                                    Kredi kartı gerekmez. 14 gün boyunca tüm özellikleri limitsiz kullanın. 
                                    Beğenmezseniz tek kuruş ödemezsiniz.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link 
                                    href="/register" 
                                    className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-100 transition-all shadow-xl shadow-white/20 text-lg flex items-center justify-center gap-2 group"
                                >
                                    Hemen Başlayın
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link 
                                    href="/iletisim" 
                                    className="px-8 py-4 bg-white/10 text-white border-2 border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all text-lg flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-5 h-5" />
                                    Satış Ekibiyle Konuşun
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ==================== DETAIL MODAL ==================== */}
            <AnimatePresence>
                {selectedIntegration && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedIntegration(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className={`p-8 bg-gradient-to-br ${selectedIntegration.gradient} relative`}>
                                <button 
                                    onClick={() => setSelectedIntegration(null)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                                >
                                    ×
                                </button>
                                
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg" style={{ color: selectedIntegration.color }}>
                                        {selectedIntegration.logo}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white">{selectedIntegration.name}</h2>
                                        <p className="text-white/80">{selectedIntegration.shortDesc}</p>
                                    </div>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="flex gap-6 mt-6">
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Users className="w-5 h-5" />
                                        <span className="font-bold">{selectedIntegration.stats.users}</span>
                                        <span className="text-sm text-white/60">kullanıcı</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Star className="w-5 h-5 text-yellow-300" />
                                        <span className="font-bold">{selectedIntegration.rating}</span>
                                        <span className="text-sm text-white/60">({selectedIntegration.reviews} yorum)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/90">
                                        <Shield className="w-5 h-5 text-emerald-300" />
                                        <span className="font-bold">{selectedIntegration.stats.uptime}</span>
                                        <span className="text-sm text-white/60">uptime</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Modal Content */}
                            <div className="p-8 space-y-6">
                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-primary" /> Entegrasyon Hakkında
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {selectedIntegration.desc}
                                    </p>
                                </div>
                                
                                {/* Features */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Özellikler
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {selectedIntegration.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Requirements */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-orange-500" /> Gereksinimler
                                    </h3>
                                    <ul className="space-y-2">
                                        {selectedIntegration.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <BadgeCheck className="w-4 h-4 text-primary" />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex gap-4 pt-4 border-t border-border">
                                    <Link 
                                        href={`/register?integration=${selectedIntegration.id}`}
                                        className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plug className="w-5 h-5" />
                                        Entegrasyonu Ekle
                                    </Link>
                                    <Link 
                                        href={selectedIntegration.documentation}
                                        className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        Dokümantasyon
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
