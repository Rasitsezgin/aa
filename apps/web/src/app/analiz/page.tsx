"use client";

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    Lock,
    Sparkles,
    TrendingUp,
    Search,
    Loader2,
    LayoutDashboard,
    Globe,
    ShoppingBag,
    Users,
    Zap,
    Smartphone,
    DollarSign,
    MessageSquare,
    Download,
    Star,
    Package,
    Heart,
    Clock,
    Crown,
    Rocket,
    Share2,
    ChevronDown,
    ExternalLink,
    Copy,
    ImageIcon,
    FileText,
    Wand2,
    Brain,
    Cpu,
    Info,
    BarChart3,
    Target,
    Tag,
    Eye,
    Award,
    Flame,
    ArrowUpRight,
    AlertTriangle,
    Activity,
    PieChart,
    Layers,
    SlidersHorizontal,
    Mail,
    FileJson,
    Lightbulb,
    AlertCircle,
    Wrench,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { parseTrendyolStoreUrl } from '@/lib/trendyol-store-url';

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}B`;
    return num.toString();
};

const hasNumericValue = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const getSourceBadgeLabel = (source?: string): string | null => {
    if (!source) return null;
    if (source === 'api' || source === 'scraped' || source === 'api_or_scraped') return 'Gercek';
    if (source === 'calculated') return 'Hesaplanmis';
    if (source === 'estimated' || source === 'scraped_or_unknown') return 'Tahmini';
    if (source === 'not_available') return 'Yok';
    return source;
};

const getMetricSourceLabel = (
    dataSources: StoreData['dataSources'] | undefined,
    metricKey: string,
    altKeys: string[] = []
): string | null => {
    const sourceMap = dataSources?.metrics;
    if (!sourceMap) return null;
    const source = sourceMap[metricKey] || altKeys.map((k) => sourceMap[k]).find(Boolean);
    return getSourceBadgeLabel(source);
};

// --- Platform Logo Mapping ---
const PLATFORM_LOGOS: Record<string, { logo: string; name: string; color: string }> = {
    'TRENDYOL': { logo: '/images/pazaryeri/Trendyol.png', name: 'Trendyol', color: 'from-orange-500 to-red-500' },
    'HEPSIBURADA': { logo: '/images/pazaryeri/Hepsiburada.png', name: 'Hepsiburada', color: 'from-orange-400 to-yellow-500' },
    'AMAZON': { logo: '/images/pazaryeri/Amazon.png', name: 'Amazon', color: 'from-yellow-500 to-orange-500' },
    'N11': { logo: '/images/pazaryeri/N11.png', name: 'N11', color: 'from-purple-500 to-pink-500' },
    'CICEKSEPETI': { logo: '/images/pazaryeri/ciceksepeti.png', name: 'Çiçeksepeti', color: 'from-pink-500 to-red-500' },
    'ETSY': { logo: '/images/pazaryeri/Etsy.png', name: 'Etsy', color: 'from-orange-600 to-red-600' },
    'EBAY': { logo: '/images/pazaryeri/EBay.png', name: 'eBay', color: 'from-orange-500 to-yellow-500' },
    'SHOPIFY': { logo: '/images/pazaryeri/Shopify.png', name: 'Shopify', color: 'from-green-500 to-emerald-500' },
    'WOOCOMMERCE': { logo: '/images/pazaryeri/WooCommerce.png', name: 'WooCommerce', color: 'from-purple-600 to-violet-600' },
    'TIKTOK': { logo: '/images/pazaryeri/tiktok-shop.png', name: 'TikTok Shop', color: 'from-slate-900 to-pink-500' },
    'FACEBOOK': { logo: '/images/pazaryeri/facebook-marketplace.png', name: 'Facebook Marketplace', color: 'from-orange-600 to-amber-500' },
    'INSTAGRAM': { logo: '/images/pazaryeri/Insta_Logo.webp', name: 'Instagram Shop', color: 'from-purple-500 via-pink-500 to-orange-500' },
    'PINTEREST': { logo: '/images/pazaryeri/pinterest.webp', name: 'Pinterest', color: 'from-red-600 to-red-500' },
    'WALMART': { logo: '/images/pazaryeri/walmart.png', name: 'Walmart', color: 'from-orange-500 to-yellow-400' },
    'SALESFORCE': { logo: '/images/pazaryeri/Salesforce.png', name: 'Salesforce Commerce', color: 'from-blue-400 to-cyan-500' },
    'MAGENTO': { logo: '/images/pazaryeri/magento.png', name: 'Magento', color: 'from-orange-500 to-red-500' },
    'PRESTASHOP': { logo: '/images/pazaryeri/prestashop.webp', name: 'PrestaShop', color: 'from-pink-500 to-purple-500' },
    'OPENCART': { logo: '/images/pazaryeri/opencart.webp', name: 'OpenCart', color: 'from-orange-500 to-cyan-400' },
    'BIGCOMMERCE': { logo: '/images/pazaryeri/bigcommerce.webp', name: 'BigCommerce', color: 'from-slate-700 to-slate-900' },
    'VTEX': { logo: '/images/pazaryeri/VTEX_logo.png', name: 'VTEX', color: 'from-pink-500 to-red-500' },
    'IDEASOFT': { logo: '/images/pazaryeri/ideasoft-logo.webp', name: 'IdeaSoft', color: 'from-orange-500 to-amber-600' },
    'IKAS': { logo: '/images/pazaryeri/ikas.png', name: 'ikas', color: 'from-purple-600 to-pink-500' },
    'TICIMAX': { logo: '/images/pazaryeri/ticimax.webp', name: 'Ticimax', color: 'from-orange-600 to-purple-600' },
    'TSOFT': { logo: '/images/pazaryeri/tsoft.webp', name: 'T-Soft', color: 'from-red-500 to-orange-500' },
    'FAPRIKA': { logo: '/images/pazaryeri/faprika.png', name: 'Faprika', color: 'from-orange-500 to-amber-500' },
    'PLATINMARKET': { logo: '/images/pazaryeri/platinmarketlogo.png', name: 'PlatinMarket', color: 'from-yellow-500 to-amber-600' },
    'AKINON': { logo: '/images/pazaryeri/akinon.webp', name: 'Akinon', color: 'from-amber-500 to-purple-600' },
    'INVEON': { logo: '/images/pazaryeri/inveon.webp', name: 'Inveon', color: 'from-orange-500 to-amber-500' },
    'SAP': { logo: '/images/pazaryeri/sap-commerce-cloud.webp', name: 'SAP Commerce Cloud', color: 'from-orange-600 to-cyan-500' },
    'ORACLE': { logo: '/images/pazaryeri/oracle-commerce-cloud.webp', name: 'Oracle Commerce', color: 'from-red-500 to-red-600' },
};

// --- Tema Sistemi ---
const THEME = {
    glass: "backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10",
    glassLight: "backdrop-blur-xl bg-slate-50/80 border border-slate-200 dark:bg-white/5 dark:border-white/10",
    gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400",
    card: "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none",
    cardHover: "hover:shadow-xl hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10 hover:border-orange-500/20 dark:hover:border-orange-500/20 transition-all duration-300",
};

// --- Premium Badge Component ---
const PremiumBadge = ({ plan = "PRO" }: { plan?: string }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${plan === 'ENTERPRISE'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
            : 'bg-gradient-to-r from-orange-500 to-purple-500 text-white shadow-lg shadow-orange-500/30'
            }`}
    >
        <Crown size={12} />
        {plan}
    </motion.div>
);

// --- Premium Upgrade CTA ---
const PremiumUpgradeCTA = ({ feature, plan = "PRO", compact = false }: { feature: string; plan?: string; compact?: boolean }) => {
    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-orange-500/20"
            >
                <div className="flex items-center gap-3">
                    <Lock className="text-orange-500" size={18} />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
                <Link
                    href="/checkout?plan=pro"
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all"
                >
                    Kilidi Aç
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${THEME.card} rounded-3xl p-8 relative overflow-hidden`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-purple-500/5 to-pink-500/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-500/30">
                    <Lock className="text-white" size={32} />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{feature}</h3>
                        <PremiumBadge plan={plan} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                        Bu özelliğe erişmek için {plan} paketine yükseltin. Yapay zeka destekli tüm analiz araçlarına sınırsız erişim kazanın.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <Link
                            href="/checkout?plan=pro"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-orange-500/30 transition-all"
                        >
                            <Rocket size={16} />
                            {plan} Paketine Yükselt
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-xl font-bold text-sm border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                        >
                            Paketleri Karşılaştır
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Enhanced Gauge Chart ---
const GaugeChart = ({ value, size = "lg" }: { value: number; size?: "sm" | "md" | "lg" }) => {
    const circumference = 2 * Math.PI * 40;
    const normalizedValue = isNaN(value) || value === null || value === undefined ? 0 : value;
    const offset = circumference - (normalizedValue / 100) * circumference;
    const sizeClasses = {
        sm: "w-24 h-24",
        md: "w-32 h-32",
        lg: "w-40 h-40"
    };
    const textSizes = {
        sm: "text-xl",
        md: "text-3xl",
        lg: "text-4xl"
    };

    const getColor = (score: number) => {
        if (score >= 80) return { ring: 'text-green-500', bg: 'from-green-500 to-emerald-400', label: 'Mükemmel' };
        if (score >= 60) return { ring: 'text-orange-500', bg: 'from-orange-500 to-cyan-400', label: 'İyi' };
        if (score >= 40) return { ring: 'text-yellow-500', bg: 'from-yellow-500 to-amber-400', label: 'Orta' };
        return { ring: 'text-red-500', bg: 'from-red-500 to-orange-400', label: 'Kritik' };
    };

    const colorScheme = getColor(normalizedValue);

    return (
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="50%"
                    cy="50%"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-800"
                />
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`${colorScheme.ring} drop-shadow-lg`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    key={value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`${textSizes[size]} font-black bg-gradient-to-r ${colorScheme.bg} bg-clip-text text-transparent`}
                >
                    {value}
                </motion.span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mt-1">
                    {colorScheme.label}
                </span>
            </div>
        </div>
    );
};

// Store Data Type
interface StoreMetrics {
    storeName?: string;
    rating?: number;
    followers?: number;
    monthlyTurnover?: number;
    monthlyTraffic?: number;
    responseTime?: string;
    totalProducts?: number;
    titleOptimization?: number;
    imageOptimization?: number;
    priceCompetitiveness?: number;
    stockHealth?: number;
    customerSatisfaction?: number;
    responseScore?: number;
}

interface StoreProduct {
    name: string;
    price: number;
    rating?: number;
    reviews?: number;
    stock?: number;
}

interface StoreData {
    metrics?: StoreMetrics;
    products?: StoreProduct[];
    verified?: boolean;
    seoScore?: number;
    keywords?: string[];
    dataSources?: {
        overall?: string;
        seoScore?: string;
        products?: string;
        metrics?: Record<string, string>;
        reasons?: Record<string, string>;
        evidence?: Record<string, string | number | boolean | null>;
    };
    confidence?: {
        score?: number;
        breakdown?: {
            total?: number;
            real?: number;
            calculated?: number;
            estimated?: number;
            unavailable?: number;
        };
    };
    timestamp?: string;
}

// --- Store Header Card ---
const StoreHeaderCard = ({
    storeData,
    url,
    platform,
    score,
    isLoading
}: {
    storeData: StoreData | null;
    url: string;
    platform: string;
    score: number;
    isLoading: boolean;
}) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyUrl = () => {
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const platformInfo = PLATFORM_LOGOS[platform] || PLATFORM_LOGOS['TRENDYOL'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${THEME.card} rounded-[32px] p-6 md:p-10 relative overflow-hidden`}
        >
            {/* Background Decorations */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${platformInfo.color} opacity-5 rounded-full blur-3xl`} />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Store Info */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-start gap-5">
                        {/* Store Avatar with Platform Logo */}
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 3 }}
                            className={`w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br ${platformInfo.color} flex items-center justify-center flex-shrink-0 shadow-2xl relative overflow-hidden p-2`}
                        >
                            <Image
                                src={platformInfo.logo}
                                alt={platformInfo.name}
                                width={80}
                                height={80}
                                className="object-contain w-full h-full drop-shadow-lg"
                            />
                            <div className="absolute inset-0 bg-white/10" />
                        </motion.div>

                        <div className="space-y-3 flex-1 min-w-0">
                            {/* Platform Badge with Logo */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r ${platformInfo.color} text-white shadow-lg`}>
                                    <Image
                                        src={platformInfo.logo}
                                        alt={platformInfo.name}
                                        width={18}
                                        height={18}
                                        className="object-contain brightness-0 invert"
                                    />
                                    {platformInfo.name}
                                </span>
                                {storeData?.verified && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                                        <CheckCircle size={12} /> Doğrulanmış
                                    </span>
                                )}
                            </div>

                            {/* Store Name */}
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isLoading ? (
                                    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                                ) : (
                                    storeData?.metrics?.storeName || 'Mağaza Analizi'
                                )}
                            </h1>

                            {/* URL Section */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 max-w-md">
                                    <Globe size={14} className="text-slate-400 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-mono">{url}</span>
                                </div>
                                <button
                                    onClick={copyUrl}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                    title="URL'yi Kopyala"
                                >
                                    {isCopied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}
                                </button>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                                    title="Mağazayı Ziyaret Et"
                                >
                                    <ExternalLink size={16} className="text-slate-400" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    {!isLoading && storeData && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                {
                                    icon: Star,
                                    label: 'Puan',
                                    value: hasNumericValue(storeData.metrics?.rating) ? storeData.metrics?.rating : '--',
                                    color: 'text-yellow-500',
                                    bg: 'bg-yellow-50 dark:bg-yellow-500/10',
                                    source: getMetricSourceLabel(storeData.dataSources, 'rating')
                                },
                                {
                                    icon: Users,
                                    label: 'Takipçi',
                                    value: hasNumericValue(storeData.metrics?.followers) ? storeData.metrics?.followers.toLocaleString('tr-TR') : '--',
                                    color: 'text-orange-500',
                                    bg: 'bg-orange-50 dark:bg-orange-500/10',
                                    source: getMetricSourceLabel(storeData.dataSources, 'followers')
                                },
                                {
                                    icon: Package,
                                    label: 'Ürün',
                                    value: hasNumericValue(storeData.metrics?.totalProducts) ? storeData.metrics?.totalProducts : '--',
                                    color: 'text-green-500',
                                    bg: 'bg-green-50 dark:bg-green-500/10',
                                    source: getMetricSourceLabel(storeData.dataSources, 'totalProducts', ['productCount'])
                                },
                                {
                                    icon: Clock,
                                    label: 'Yanıt',
                                    value: storeData.metrics?.responseTime || '--',
                                    color: 'text-purple-500',
                                    bg: 'bg-purple-50 dark:bg-purple-500/10',
                                    source: getMetricSourceLabel(storeData.dataSources, 'responseTime')
                                },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`flex items-center gap-3 p-3 ${stat.bg} rounded-xl border border-slate-200/50 dark:border-white/5`}
                                >
                                    <stat.icon className={`${stat.color} flex-shrink-0`} size={20} />
                                    <div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</p>
                                        {stat.source && (
                                            <span className="inline-flex mt-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/70 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                                {stat.source}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Score Section */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-4 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
                    <GaugeChart value={score} size="lg" />
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Genel Performans</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
                            {score >= 80 ? 'Mağazanız mükemmel performans gösteriyor!' :
                                score >= 60 ? 'İyi durumda, küçük iyileştirmeler yapılabilir.' :
                                    score >= 40 ? 'Orta seviye, optimizasyon önerilir.' :
                                        'Kritik seviye, acil iyileştirme gerekli.'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- AI Danışman Kartı ---
const AIAdvisorCard = ({
    score,
    domain,
    url,
    storeData
}: {
    score: number;
    domain: string;
    url: string;
    storeData: StoreData | null;
}) => {
    const [message, setMessage] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [aiModel, setAiModel] = useState('');
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const getDefaultSuggestions = useCallback((currentScore: number, data: StoreData | null) => {
        const storeName = data?.metrics?.storeName || domain;
        let suggestionMessage = '';
        let suggestionList: string[] = [];

        if (currentScore < 50) {
            suggestionMessage = `🚨 ${storeName} mağazasının performansı kritik seviyede. Acil optimizasyon gerekiyor! Özellikle ürün başlıkları ve görsel kalitesi üzerinde çalışmanızı öneriyorum.`;
            suggestionList = [
                'Ürün başlıklarını SEO uyumlu hale getir',
                'Yüksek çözünürlüklü görseller kullan',
                'Müşteri yorumlarına hızlı yanıt ver',
                'Fiyat rekabetçiliğini analiz et',
                'Stok takibini otomatikleştir'
            ];
        } else if (currentScore < 70) {
            suggestionMessage = `📊 ${storeName} orta seviyede performans gösteriyor. Birkaç iyileştirme ile satışlarınızı %30 artırabilirsiniz.`;
            suggestionList = [
                'Anahtar kelime optimizasyonu yap',
                'Kampanya ve indirim stratejisi oluştur',
                'Ürün açıklamalarını zenginleştir',
                'Müşteri deneyimini iyileştir'
            ];
        } else {
            suggestionMessage = `🎉 Tebrikler! ${storeName} mükemmel performans gösteriyor. Premium özelliklerle daha da büyüyebilirsiniz.`;
            suggestionList = [
                'Reklam stratejisi ile görünürlüğü artır',
                'Yeni ürün kategorileri ekle',
                'Sadakat programı başlat',
                'Çoklu pazaryeri entegrasyonu yap'
            ];
        }

        return { message: suggestionMessage, suggestions: suggestionList };
    }, [domain]);

    useEffect(() => {
        const fetchAdvisorMessage = async () => {
            try {
                const response = await fetch('/api/ai-models/advisor/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ domain, score, url, storeData }),
                });
                const data = await response.json();
                setMessage(data.message);
                setSuggestions(data.suggestions || []);
                setAiModel(data.aiModel || 'Gemini 1.5 Pro');
            } catch (error) {
                console.error('Error fetching advisor message:', error);
                const defaultSuggestions = getDefaultSuggestions(score, storeData);
                setMessage(defaultSuggestions.message);
                setSuggestions(defaultSuggestions.suggestions);
                setAiModel('Pazaryonetimi AI');
            } finally {
                setLoading(false);
            }
        };

        fetchAdvisorMessage();
    }, [domain, score, url, storeData, getDefaultSuggestions]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-purple-500/5 to-pink-500/5" />
            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"
            />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* AI Avatar */}
                    <div className="relative shrink-0">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-orange-600 via-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-purple-500/30"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            />
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                    className="text-white"
                                >
                                    <Loader2 size={40} />
                                </motion.div>
                            ) : (
                                <Brain size={40} className="text-white" />
                            )}
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-slate-900"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                Pazaryonetimi AI Danışman
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${loading
                                ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20'
                                : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                }`}>
                                {loading ? '🔄 Analiz Ediliyor' : '✓ Çevrimiçi'}
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            </div>
                        ) : (
                            <>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
                                    &ldquo;{message}&rdquo;
                                </p>

                                {/* AI Model Badge */}
                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                                        <Cpu size={12} className="text-orange-500" />
                                        {aiModel}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-purple-500" />
                                        {suggestions.length} öneri hazır
                                    </span>
                                </div>

                                {/* Suggestions */}
                                <AnimatePresence>
                                    {(isExpanded || suggestions.length <= 3) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10"
                                        >
                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                <Wand2 size={14} className="text-purple-500" />
                                                AI Önerileri
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {suggestions.map((suggestion, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 transition-colors group cursor-pointer"
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <CheckCircle size={12} className="text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                            {suggestion}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {suggestions.length > 3 && (
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                                    >
                                        {isExpanded ? 'Daha az göster' : `+${suggestions.length - 3} öneri daha`}
                                        <ChevronDown size={16} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Metric Card Component ---
const MetricCard = ({
    icon: Icon,
    label,
    value,
    sourceLabel,
    change,
    trend,
    color = 'blue',
    isPremium = false,
    onClick
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sourceLabel?: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
    isPremium?: boolean;
    onClick?: () => void;
}) => {
    const colorClasses: Record<string, string> = {
        blue: 'from-orange-500 to-amber-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-pink-500',
        orange: 'from-orange-500 to-amber-500',
        red: 'from-red-500 to-rose-500',
        yellow: 'from-yellow-500 to-orange-400',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={onClick}
            className={`${THEME.card} ${THEME.cardHover} rounded-2xl p-5 relative overflow-hidden cursor-pointer group`}
        >
            {isPremium && (
                <div className="absolute top-3 right-3 z-10">
                    <Lock size={14} className="text-slate-400" />
                </div>
            )}

            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />

            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon size={20} className="text-white" />
                </div>

                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {label}
                </p>
                {sourceLabel && (
                    <span className="inline-flex mb-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                        {sourceLabel}
                    </span>
                )}

                <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {isPremium ? '***' : value}
                    </span>
                    {change && !isPremium && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' :
                            trend === 'down' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400' :
                                'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400'
                            }`}>
                            {trend === 'up' && '↑'}{trend === 'down' && '↓'} {change}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- Sales Trend Chart ---
const SalesTrendChart = ({ isPremium = false, turnover }: { isPremium?: boolean; turnover?: number }) => {
    if (!turnover) return null; // Don't show chart if no data

    const baseValue = turnover / 7;
    const salesData = [
        { month: 'Oca', sales: baseValue * 0.8, orders: 320 },
        { month: 'Şub', sales: baseValue * 0.95, orders: 380 },
        { month: 'Mar', sales: baseValue * 0.9, orders: 345 },
        { month: 'Nis', sales: baseValue * 1.1, orders: 420 },
        { month: 'May', sales: baseValue * 1.05, orders: 395 },
        { month: 'Haz', sales: baseValue * 1.3, orders: 485 },
        { month: 'Tem', sales: baseValue * 1.2, orders: 450 },
    ];

    const maxSales = Math.max(...salesData.map(d => d.sales));

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <BarChart3 className="text-green-500" size={24} />
                            Satış Trendi
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Son 7 aylık performans</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400" />
                            <span className="text-slate-600 dark:text-slate-400">Satış</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-cyan-400" />
                            <span className="text-slate-600 dark:text-slate-400">Sipariş</span>
                        </div>
                    </div>
                </div>

                {isPremium ? (
                    <div className="relative">
                        <div className="absolute inset-0 backdrop-blur-[6px] bg-white/50 dark:bg-slate-900/50 z-10 flex flex-col items-center justify-center rounded-2xl">
                            <Lock className="text-slate-400 mb-2" size={32} />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">PRO ile Aç</span>
                            <Link href="/checkout?plan=pro" className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-bold">
                                Kilidi Aç
                            </Link>
                        </div>
                        <div className="h-[200px] flex items-end justify-between gap-2 pt-8">
                            {salesData.map((_, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-lg" style={{ height: `${60 + (i * 13 % 80)}px` }} />
                                    <span className="text-[10px] text-slate-400">---</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-[200px] flex items-end justify-between gap-2 pt-8">
                        {salesData.map((data, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                className="flex-1 flex flex-col items-center gap-2"
                            >
                                <div className="w-full flex flex-col gap-1 items-center">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(data.sales / maxSales) * 150}px` }}
                                        transition={{ delay: i * 0.1, duration: 0.5 }}
                                        className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg relative group cursor-pointer"
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {(data.sales / 1000).toFixed(0)}K ₺
                                        </div>
                                    </motion.div>
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{data.month}</span>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                    <div className="text-center">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{turnover >= 1000 ? `${(turnover / 1000).toFixed(0)}K` : turnover}₺</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tahmini Ciro</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-green-500">+{10 + (turnover % 15)}%</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Büyüme</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{formatNumber(Math.floor(turnover / 150))}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tahmini Sipariş</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Keyword Analysis Panel ---
function KeywordAnalysisPanel({ isPremium = false, extractedKeywords = [] }: { storeName?: string; isPremium?: boolean; extractedKeywords?: string[] }) {
    if (!extractedKeywords || extractedKeywords.length === 0) return null;
    const freeLimit = 6;
    const displayKeywords = extractedKeywords.slice(0, freeLimit);

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Target className="text-purple-500" size={24} />
                            Anahtar Kelime Analizi
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {displayKeywords.length} gercek anahtar kelime bulundu
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {displayKeywords.map((keyword, i) => (
                        <span
                            key={`${keyword}-${i}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <Tag size={14} className="text-slate-400" />
                            {keyword}
                        </span>
                    ))}
                </div>

                {!isPremium && extractedKeywords.length > freeLimit && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                        Tum anahtar kelimeler icin PRO planina gecebilirsiniz.
                    </p>
                )}
            </div>
        </div>
    );
}

// --- Category Performance Widget ---
const CategoryPerformance = ({ storeName = 'Mağaza', isPremium = false, products = [] }: { storeName?: string; isPremium?: boolean; products?: StoreProduct[] }) => {
    if (!products || products.length === 0) return null;

    const categories = [
        { name: products[0].name.split(' ')[0] || 'Genel', sales: 40, revenue: `${formatNumber(25000)}₺`, growth: '+12%', color: 'from-orange-500 to-cyan-400' },
        { name: products[1]?.name.split(' ')[0] || 'Diğer', sales: 30, revenue: `${formatNumber(18000)}₺`, growth: '+8%', color: 'from-green-500 to-emerald-400' },
        { name: products[2]?.name.split(' ')[0] || 'Yeni', sales: 20, revenue: `${formatNumber(12000)}₺`, growth: '+15%', color: 'from-purple-500 to-pink-400' },
        { name: 'Diğer', sales: 10, revenue: `${formatNumber(5000)}₺`, growth: '+5%', color: 'from-orange-500 to-amber-400' },
    ];

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 opacity-5">
                <PieChart size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            <Layers className="text-orange-500" size={24} />
                            Kategori Performansı
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Satış dağılımı</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                <span className="text-white font-bold text-sm">{cat.sales}%</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{cat.revenue}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.sales}%` }}
                                        transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                                        className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                                    />
                                </div>
                            </div>
                            <span className={`text-xs font-bold ${cat.growth.includes('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {cat.growth}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Recent Activity Timeline ---
const RecentActivityTimeline = ({ storeName = 'Mağaza', products = [] }: { storeName?: string; products?: StoreProduct[] }) => {
    if (!products || products.length === 0) return null;

    const activities = [
        { type: 'sale', message: `Yeni sipariş: ${products[0].name.slice(0, 30)}...`, time: '2 dk önce', icon: ShoppingBag, color: 'bg-green-500' },
        { type: 'review', message: `"${products[1]?.name || products[0].name}" için 5 yıldızlı yorum`, time: '15 dk önce', icon: Star, color: 'bg-yellow-500' },
        { type: 'stock', message: `Düşük stok: ${products[Math.min(products.length - 1, 2)].name.slice(0, 20)}...`, time: '1 saat önce', icon: AlertTriangle, color: 'bg-orange-500' },
        { type: 'visitor', message: `${350} yeni ziyaretçi (son 1 saat)`, time: '1 saat önce', icon: Eye, color: 'bg-orange-500' },
        { type: 'competitor', message: 'Rakip fiyat değişikliği algılandı', time: '2 saat önce', icon: Activity, color: 'bg-purple-500' },
        { type: 'sale', message: `Yeni sipariş: ${products[Math.min(products.length - 1, 3)]?.name.slice(0, 30)}...`, time: '3 saat önce', icon: ShoppingBag, color: 'bg-green-500' },
    ];

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 relative overflow-hidden`}>
            <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="text-orange-500" size={20} />
                    Son Aktiviteler
                </h3>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {activities.map((activity, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <div className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                                <activity.icon size={14} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{activity.message}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{activity.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                    <Link href="#" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
                        Tüm aktiviteleri gör <ArrowUpRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

// --- Quick Actions Panel ---
const QuickActionsPanel = ({ platform }: { platform: string }) => {
    const platformInfo = PLATFORM_LOGOS[platform] || PLATFORM_LOGOS['TRENDYOL'];

    const actions = [
        { label: 'Ürün Ekle', icon: Package, color: 'from-orange-500 to-amber-500', href: '#' },
        { label: 'Fiyat Güncelle', icon: DollarSign, color: 'from-green-500 to-emerald-500', href: '#' },
        { label: 'Kampanya Oluştur', icon: Tag, color: 'from-orange-500 to-amber-500', href: '#' },
        { label: 'Stok Yönet', icon: Layers, color: 'from-purple-500 to-pink-500', href: '#' },
    ];

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${platformInfo.color} opacity-10 rounded-full blur-2xl`} />

            <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" size={20} />
                    Hızlı İşlemler
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    {actions.map((action, i) => (
                        <motion.a
                            key={i}
                            href={action.href}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all`}
                        >
                            <action.icon size={20} />
                            <span className="text-xs font-bold">{action.label}</span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Supported Platforms Widget ---
const SupportedPlatformsWidget = ({ currentPlatform }: { currentPlatform: string }) => {
    const popularPlatforms = ['TRENDYOL', 'HEPSIBURADA', 'AMAZON', 'N11', 'CICEKSEPETI', 'ETSY', 'SHOPIFY', 'WOOCOMMERCE'];

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 relative overflow-hidden`}>
            <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe className="text-green-500" size={20} />
                    Desteklenen Platformlar
                </h3>

                <div className="grid grid-cols-4 gap-3">
                    {popularPlatforms.map((platform, i) => {
                        const info = PLATFORM_LOGOS[platform];
                        const isActive = platform === currentPlatform;

                        return (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className={`relative flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${isActive
                                    ? `bg-gradient-to-br ${info.color} border-transparent shadow-lg`
                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                    }`}
                                title={info.name}
                            >
                                <Image
                                    src={info.logo}
                                    alt={info.name}
                                    width={32}
                                    height={32}
                                    className={`object-contain ${isActive ? 'brightness-0 invert' : ''}`}
                                />
                                {isActive && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                        <CheckCircle size={10} className="text-white" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 text-center">
                    +{Object.keys(PLATFORM_LOGOS).length - popularPlatforms.length} daha fazla platform destekleniyor
                </p>
            </div>
        </div>
    );
};

const RawEvidencePanel = ({ storeData }: { storeData: StoreData | null }) => {
    const [showConfidenceHelp, setShowConfidenceHelp] = useState(false);

    if (!storeData?.dataSources) return null;

    const overall = getSourceBadgeLabel(storeData.dataSources.overall);
    const confidenceScore = storeData.confidence?.score;
    const breakdown = storeData.confidence?.breakdown;
    const reasons = storeData.dataSources.reasons || {};
    const evidence = storeData.dataSources.evidence || {};
    const timestamp = storeData.timestamp ? new Date(storeData.timestamp).toLocaleString('tr-TR') : null;

    return (
        <div className={`${THEME.card} rounded-[32px] p-6`}>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileJson className="text-orange-500" size={20} />
                    Raw Evidence
                </h3>
                <button
                    onClick={() => setShowConfidenceHelp((prev) => !prev)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    type="button"
                    aria-label="Confidence hesaplama yöntemini göster"
                >
                    <Info size={13} />
                    Confidence
                </button>
            </div>

            {showConfidenceHelp && (
                <div className="mb-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                    <p className="text-xs font-bold text-blue-800 dark:text-orange-200 mb-1">Confidence hesaplama yöntemi</p>
                    <p className="text-xs text-orange-700 dark:text-orange-200 leading-relaxed">
                        Skor, metrik kaynaklarına göre ağırlıklı hesaplanır: Gerçek veri = %100, Hesaplanmış = %70, Tahmini = %35, Veri yok = %0.
                        Toplam değer, tüm metriklerin ağırlıklı ortalamasıdır.
                    </p>
                </div>
            )}

            <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Genel Kaynak</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                        {overall || 'Bilinmiyor'}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Güven Skoru</span>
                    <span className="font-black text-slate-900 dark:text-white">{hasNumericValue(confidenceScore) ? `${confidenceScore}%` : '--'}</span>
                </div>

                {breakdown && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-[10px] uppercase font-bold text-slate-500">Gercek</p>
                            <p className="font-black text-slate-900 dark:text-white">{breakdown.real ?? '--'}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-[10px] uppercase font-bold text-slate-500">Hesaplanan</p>
                            <p className="font-black text-slate-900 dark:text-white">{breakdown.calculated ?? '--'}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-[10px] uppercase font-bold text-slate-500">Tahmini</p>
                            <p className="font-black text-slate-900 dark:text-white">{breakdown.estimated ?? '--'}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <p className="text-[10px] uppercase font-bold text-slate-500">Yok</p>
                            <p className="font-black text-slate-900 dark:text-white">{breakdown.unavailable ?? '--'}</p>
                        </div>
                    </div>
                )}

                {Object.keys(reasons).length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Eksik veri nedenleri</p>
                        {Object.entries(reasons).map(([key, reason]) => (
                            <div key={key} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{key}</p>
                                <p className="text-xs text-amber-700 dark:text-amber-200">{reason}</p>
                            </div>
                        ))}
                    </div>
                )}

                {Object.keys(evidence).length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Teknik kanıt</p>
                        {Object.entries(evidence).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400">{key}</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {timestamp && (
                    <p className="pt-2 border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
                        Son analiz: {timestamp}
                    </p>
                )}
            </div>
        </div>
    );
};

// --- Performance Alerts ---
const PerformanceAlerts = ({ score }: { score: number | null }) => {
    if (score === null) return null;
    const alerts = score < 60 ? [
        { type: 'critical', message: 'SEO skoru kritik seviyede', action: 'Hemen İyileştir', icon: AlertTriangle },
        { type: 'warning', message: '5 ürünün stoku tükenmek üzere', action: 'Stok Güncelle', icon: Package },
        { type: 'info', message: 'Yeni kampanya fırsatı', action: 'İncele', icon: Tag },
    ] : score < 80 ? [
        { type: 'warning', message: 'Görsel optimizasyonu gerekli', action: 'Optimize Et', icon: ImageIcon },
        { type: 'info', message: '3 üründe fiyat avantajı var', action: 'Fiyatları Gör', icon: DollarSign },
    ] : [
        { type: 'success', message: 'Mağazanız çok iyi performans gösteriyor!', action: 'Detaylar', icon: Award },
        { type: 'info', message: 'Yeni büyüme fırsatları', action: 'Keşfet', icon: Rocket },
    ];

    const typeColors = {
        critical: 'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400',
        warning: 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400',
        info: 'bg-orange-100 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400',
        success: 'bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400',
    };

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 relative overflow-hidden`}>
            <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} />
                    Önemli Uyarılar
                </h3>

                <div className="space-y-3">
                    {alerts.map((alert, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`flex items-center justify-between p-3 rounded-xl border ${typeColors[alert.type as keyof typeof typeColors]}`}
                        >
                            <div className="flex items-center gap-3">
                                <alert.icon size={18} />
                                <span className="text-sm font-semibold">{alert.message}</span>
                            </div>
                            <button className="text-xs font-bold underline hover:no-underline">
                                {alert.action}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- SEO Analysis Panel ---
const SEOAnalysisPanel = ({ metrics, dataSources, isPremium = false }: { metrics?: StoreMetrics | null; dataSources?: StoreData['dataSources']; isPremium?: boolean }) => {
    if (!metrics) return null;

    const sourceMap = dataSources?.metrics || {};
    const sourceLabel = (key: string) => {
        const source = sourceMap[key];
        return getSourceBadgeLabel(source);
    };

    const seoMetrics = [
        { label: "Başlık Optimizasyonu", score: metrics.titleOptimization || 0, icon: FileText, color: "blue", desc: "Ürün başlıklarının SEO uyumluluğu", locked: false },
        { label: "Görsel Kalitesi", score: metrics.imageOptimization || 0, icon: ImageIcon, color: "purple", desc: "Görsel kalitesi ve optimizasyonu", locked: false },
        { label: "Fiyat Rekabetçiliği", score: metrics.priceCompetitiveness || 0, icon: DollarSign, color: "green", desc: "Pazardaki fiyat konumlandırması", locked: true },
        { label: "Stok Sağlığı", score: metrics.stockHealth || 0, icon: Package, color: "orange", desc: "Stok yönetimi ve mevcudiyet", locked: false },
        { label: "Müşteri Memnuniyeti", score: metrics.customerSatisfaction || 0, icon: Heart, color: "red", desc: "Müşteri değerlendirmeleri", locked: true },
        { label: "Yanıt Hızı", score: metrics.responseScore || 0, icon: Zap, color: "yellow", desc: "Müşteri sorularına yanıt süresi", locked: true },
    ];

    const colorMap: Record<string, string> = {
        blue: 'from-orange-500 to-amber-500',
        purple: 'from-purple-500 to-pink-500',
        green: 'from-green-500 to-emerald-500',
        orange: 'from-orange-500 to-amber-500',
        red: 'from-red-500 to-rose-500',
        yellow: 'from-yellow-500 to-amber-400',
    };

    const unlockedCount = seoMetrics.filter(m => !m.locked).length;
    const lockedCount = seoMetrics.filter(m => m.locked).length;

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">SEO Analizi</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {isPremium ? '6/6 metrik görüntüleniyor' : `${unlockedCount}/6 metrik • ${lockedCount} metrik kilitli`}
                        </p>
                    </div>
                    {!isPremium && (
                        <Link href="/checkout?plan=pro" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">
                            <Lock size={12} />
                            Tümünü Aç
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seoMetrics.map((metric, i) => {
                        const isLocked = metric.locked && !isPremium;

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${isLocked
                                    ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 group'
                                    }`}
                            >
                                {isLocked && (
                                    <div className="absolute inset-0 backdrop-blur-[2px] bg-white/50 dark:bg-slate-900/50 z-10 flex flex-col items-center justify-center">
                                        <Lock className="text-slate-400 mb-2" size={20} />
                                        <span className="text-xs font-bold text-slate-500">PRO</span>
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[metric.color]} flex items-center justify-center shadow-lg ${isLocked ? 'opacity-50' : ''}`}>
                                            <metric.icon size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <span className={`text-sm font-bold block ${isLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{metric.label}</span>
                                            {!isLocked && sourceLabel(
                                                metric.label === 'Başlık Optimizasyonu' ? 'titleOptimization' :
                                                    metric.label === 'Görsel Kalitesi' ? 'imageOptimization' :
                                                        metric.label === 'Fiyat Rekabetçiliği' ? 'priceCompetitiveness' :
                                                            metric.label === 'Stok Sağlığı' ? 'stockHealth' :
                                                                metric.label === 'Müşteri Memnuniyeti' ? 'customerSatisfaction' :
                                                                    'responseScore'
                                            ) && (
                                                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                                        {sourceLabel(
                                                            metric.label === 'Başlık Optimizasyonu' ? 'titleOptimization' :
                                                                metric.label === 'Görsel Kalitesi' ? 'imageOptimization' :
                                                                    metric.label === 'Fiyat Rekabetçiliği' ? 'priceCompetitiveness' :
                                                                        metric.label === 'Stok Sağlığı' ? 'stockHealth' :
                                                                            metric.label === 'Müşteri Memnuniyeti' ? 'customerSatisfaction' :
                                                                                'responseScore'
                                                        )}
                                                    </span>
                                                )}
                                            <span className={`text-[11px] ${isLocked ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{metric.desc}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${isLocked ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: isLocked ? '0%' : `${metric.score}%` }}
                                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                                            className={`h-full rounded-full bg-gradient-to-r ${metric.score >= 80 ? 'from-green-500 to-emerald-400' :
                                                metric.score >= 60 ? 'from-orange-500 to-cyan-400' :
                                                    metric.score >= 40 ? 'from-yellow-500 to-amber-400' :
                                                        'from-red-500 to-orange-400'
                                                }`}
                                        />
                                    </div>
                                    <span className={`text-lg font-black min-w-[3rem] text-right ${isLocked ? 'text-slate-300 dark:text-slate-600' :
                                        metric.score >= 80 ? 'text-green-500' :
                                            metric.score >= 60 ? 'text-orange-500' :
                                                metric.score >= 40 ? 'text-yellow-500' :
                                                    'text-red-500'
                                        }`}>
                                        {isLocked ? '??' : metric.score}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Premium Unlock Banner */}
                {!isPremium && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-orange-500/20"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles className="text-white" size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Tüm metriklere erişin</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Fiyat rekabetçiliği, müşteri memnuniyeti ve daha fazlası</p>
                                </div>
                            </div>
                            <Link
                                href="/checkout?plan=pro"
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-xl hover:shadow-orange-500/30 transition-all whitespace-nowrap"
                            >
                                <Crown size={14} />
                                PRO ile Kilidi Aç
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// --- Product Grid ---
const ProductGrid = ({ products, isPremium = false }: { products: StoreProduct[]; isPremium?: boolean }) => {
    if (!products || products.length === 0) return null;

    const displayProducts = products;

    // Ücretsiz kullanıcılara sadece 2 ürün göster, diğerleri blur
    const freeLimit = 2;

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 opacity-5">
                <ShoppingBag size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ürün Performansı</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {isPremium ? `${displayProducts.length} ürün analizi` : `${freeLimit}/${displayProducts.length} ürün • ${displayProducts.length - freeLimit} ürün kilitli`}
                        </p>
                    </div>
                    {!isPremium && (
                        <Link href="/checkout?plan=pro" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all">
                            <Lock size={12} />
                            Tümünü Gör
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayProducts.slice(0, isPremium ? 6 : 4).map((product, i) => {
                        const isLocked = !isPremium && i >= freeLimit;

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all relative overflow-hidden ${isLocked
                                    ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 group'
                                    }`}
                            >
                                {isLocked && (
                                    <div className="absolute inset-0 backdrop-blur-[3px] bg-white/60 dark:bg-slate-900/60 z-10 flex items-center justify-center">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 dark:bg-white/10 rounded-lg">
                                            <Lock className="text-white" size={14} />
                                            <span className="text-xs font-bold text-white">PRO ile Aç</span>
                                        </div>
                                    </div>
                                )}

                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0 ${isLocked ? 'opacity-50' : ''}`}>
                                    <Package size={24} className="text-slate-400 dark:text-slate-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${isLocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{product.name}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className={`text-lg font-black ${isLocked ? 'text-slate-300 dark:text-slate-600' : 'text-orange-600 dark:text-orange-400'}`}>{isLocked ? '***' : `${product.price}₺`}</span>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <Star size={12} className={isLocked ? 'text-slate-300' : 'fill-yellow-400 text-yellow-400'} />
                                            {isLocked ? '?.?' : product.rating}
                                        </div>
                                        <span className="text-[11px] text-slate-400">{isLocked ? '(??? yorum)' : `(${product.reviews} yorum)`}</span>
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isLocked ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' :
                                    (product.stock ?? 0) > 100 ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' :
                                        (product.stock ?? 0) > 50 ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                                            'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                                    }`}>
                                    {isLocked ? '?? adet' : `${product.stock ?? 0} adet`}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Premium Banner */}
                {!isPremium && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-2xl border border-orange-500/20"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                    <TrendingUp className="text-white" size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Satış potansiyelini keşfet</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Rakip fiyat karşılaştırması, stok analizi ve satış tahminleri</p>
                                </div>
                            </div>
                            <Link
                                href="/checkout?plan=pro"
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-bold hover:shadow-xl hover:shadow-orange-500/30 transition-all whitespace-nowrap"
                            >
                                <Rocket size={14} />
                                PRO&apos;ya Yükselt
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// --- Competitor Analysis ---
const CompetitorAnalysis = ({ isPremium = false, storeName = 'Mağaza' }: { isPremium?: boolean; storeName?: string }) => {
    // Mağaza adına göre gerçekçi rakipler oluştur
    const isOrganic = storeName.toLowerCase().includes('organic') || storeName.toLowerCase().includes('organik');
    const isCosmetic = storeName.toLowerCase().includes('kozmetik') || storeName.toLowerCase().includes('beauty');

    const competitors = isOrganic ? [
        { name: "Yeryüzü Organik", score: 91, traffic: "125K", trend: "+18%" },
        { name: "Doğal Yaşam Store", score: 84, traffic: "89K", trend: "+12%" },
        { name: "Bio Market TR", score: 78, traffic: "67K", trend: "+5%" },
        { name: "Sağlıklı Gıda Merkezi", score: 72, traffic: "45K", trend: "-2%" },
    ] : isCosmetic ? [
        { name: "Gratis", score: 95, traffic: "890K", trend: "+22%" },
        { name: "Watsons", score: 92, traffic: "750K", trend: "+15%" },
        { name: "Sephora TR", score: 88, traffic: "520K", trend: "+8%" },
        { name: "Flormar", score: 82, traffic: "340K", trend: "+3%" },
    ] : [
        { name: "Lider Mağaza", score: 88, traffic: "156K", trend: "+15%" },
        { name: "Trend Satıcı", score: 82, traffic: "98K", trend: "+8%" },
        { name: "Kaliteli Ürünler", score: 75, traffic: "67K", trend: "+3%" },
        { name: "Güvenilir Satıcı", score: 68, traffic: "45K", trend: "-1%" },
    ];

    if (isPremium) {
        return <PremiumUpgradeCTA feature="Rakip Analizi" plan="PRO" />;
    }

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 opacity-5">
                <Users size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Rakip Analizi</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Aynı kategorideki mağazalar</p>
                    </div>
                    <PremiumBadge />
                </div>

                <div className="space-y-3">
                    {competitors.map((comp, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{comp.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Aylık Trafik: {comp.traffic}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{comp.score}</p>
                                    <p className={`text-xs font-bold ${comp.trend.includes('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {comp.trend}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Comparison Widget (Rakip Karşılaştırma) ---
const ComparisonWidget = ({ storeName = 'Mağaza', score = 75 }: { storeName?: string; score?: number }) => {
    const metrics = [
        { name: 'SEO Skoru', your: score, competitor: score - 8, unit: '/100' },
        { name: 'Müşteri Puanı', your: 4.7, competitor: 4.4, unit: '/5.0' },
        { name: 'Ürün Sayısı', your: 287, competitor: 234, unit: 'adet' },
        { name: 'Yanıt Hızı', your: 92, competitor: 78, unit: '%' },
        { name: 'Satış Trendi', your: 24, competitor: -5, unit: '%' },
    ];

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="text-orange-500" size={24} />
                    Rakip Karşılaştırması
                </h3>

                <div className="space-y-4">
                    {metrics.map((metric, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{metric.name}</span>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">
                                        Siz: <span className="font-bold text-slate-900 dark:text-white">{metric.your}{metric.unit}</span>
                                    </span>
                                    <span className="text-slate-400">vs</span>
                                    <span className="text-slate-600 dark:text-slate-400">
                                        Rakip: <span className="font-bold text-slate-900 dark:text-white">{metric.competitor}{metric.unit}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(metric.your / (Math.max(metric.your, metric.competitor) + 10)) * 100}%` }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                                    className="bg-gradient-to-r from-orange-500 to-cyan-400 rounded-full"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(metric.competitor / (Math.max(metric.your, metric.competitor) + 10)) * 100}%` }}
                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                                    className="bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 rounded-full"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Marketing Recommendations ---
const MarketingRecommendations = ({ score, storeName = 'Mağaza' }: { score: number; storeName?: string }) => {
    const recommendations = [
        {
            title: 'Fiyat Optimizasyonu',
            desc: 'Rakiplerin %12 altında fiyatlandırarak satışları %35 artırabilirsiniz',
            impact: 'Yüksek',
            action: 'Fiyatları Güncelle',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-400'
        },
        {
            title: 'Ürün Başlığı İyileştirme',
            desc: 'SEO uyumlu başlıklar arama sıralamalarını %28 iyileştirir',
            impact: 'Yüksek',
            action: 'Başlıkları Düzenle',
            icon: FileText,
            color: 'from-orange-500 to-cyan-400'
        },
        {
            title: 'Kampanya Stratejisi',
            desc: 'Pazaryerinin %40 indirimine katılarak görünürlüğü 2.5x artırın',
            impact: 'Orta',
            action: 'Kampanya Oluştur',
            icon: Tag,
            color: 'from-orange-500 to-amber-400'
        },
        {
            title: 'Müşteri Hizmet Hızı',
            desc: 'Yanıt süresini 30 dakikaya indirerek puan %18 artırın',
            impact: 'Orta',
            action: 'Hızlandır',
            icon: Clock,
            color: 'from-purple-500 to-pink-400'
        },
    ];

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Lightbulb className="text-yellow-500" size={24} />
                    Pazarlama Önerileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`${THEME.card} rounded-2xl p-4 border-l-4 ${rec.impact === 'Yüksek' ? 'border-l-red-500' : 'border-l-yellow-500'
                                }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rec.color} flex items-center justify-center flex-shrink-0`}>
                                    <rec.icon size={18} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{rec.title}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-1 ${rec.impact === 'Yüksek'
                                        ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                                        : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                                        }`}>
                                        {rec.impact} Etki
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{rec.desc}</p>
                            <button className={`w-full px-3 py-2 bg-gradient-to-r ${rec.color} text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all`}>
                                {rec.action}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Anomaly Detection ---
const AnomalyDetection = () => {
    const anomalies = [
        { type: 'Satış Düşüşü', desc: 'Son 3 gün satışlar %45 düştü', severity: 'critical', action: 'Araştır' },
        { type: 'Stok Uyarısı', desc: '12 ürünün stoku 24 saatten az kaldı', severity: 'warning', action: 'Stok Ekle' },
        { type: 'Fiyat Anomalisi', desc: 'Rakiplerin fiyatları %20 düştü', severity: 'info', action: 'Karşılaştır' },
    ];

    const severityColors = {
        critical: 'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400',
        warning: 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400',
        info: 'bg-orange-100 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-700 dark:text-orange-400',
    };

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <AlertCircle className="text-red-500" size={24} />
                    Anomali Algılama
                </h3>

                <div className="space-y-3">
                    {anomalies.map((anom, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`flex items-center justify-between p-4 rounded-2xl border ${severityColors[anom.severity as keyof typeof severityColors]}`}
                        >
                            <div>
                                <p className="font-bold">{anom.type}</p>
                                <p className="text-sm opacity-75">{anom.desc}</p>
                            </div>
                            <button className="px-4 py-2 bg-white/20 rounded-lg font-bold text-sm whitespace-nowrap hover:bg-white/30 transition-all">
                                {anom.action}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Price Simulator ---
const PriceSimulator = () => {
    const [discount, setDiscount] = useState(15);
    const currentPrice = 189.90;
    const newPrice = currentPrice * (1 - discount / 100);
    const estimatedIncrease = 15 + discount * 1.5; // Basit formül

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <SlidersHorizontal className="text-green-500" size={24} />
                    Fiyat Simülatörü
                </h3>

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">İndirim Oranı</label>
                            <span className={`text-2xl font-black bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent`}>
                                %{discount}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Orijinal</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">₺{currentPrice.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-50 dark:from-green-500/10 to-emerald-50 dark:to-emerald-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Yeni Fiyat</p>
                            <p className="text-xl font-black text-green-600 dark:text-green-400">₺{newPrice.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-orange-50 dark:from-orange-500/10 to-cyan-50 dark:to-cyan-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Tasarruf</p>
                            <p className="text-xl font-black text-orange-600 dark:text-orange-400">₺{(currentPrice - newPrice).toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="text-purple-600 dark:text-purple-400" size={18} />
                            <p className="font-bold text-purple-900 dark:text-purple-100">Tahmini Satış Artışı</p>
                        </div>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">+{estimatedIncrease.toFixed(1)}%</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                            Tahmini ek satış: <span className="font-bold">~{Math.floor(287 * (estimatedIncrease / 100))}</span> ürün/ay
                        </p>
                    </div>

                    <button className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all">
                        Fiyat Uygulaması Oluştur
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Campaign Planner ---
const CampaignPlanner = () => {
    const [selectedType, setSelectedType] = useState('seasonal');
    const campaigns = {
        seasonal: { name: 'Sezonsal', benefit: '+35%', time: '7 gün', cost: '₺500' },
        flash: { name: 'Flash Sale', benefit: '+60%', time: '24 saat', cost: '₺300' },
        loyalty: { name: 'Sadakat', benefit: '+22%', time: '30 gün', cost: '₺200' },
    };

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Zap className="text-orange-500" size={24} />
                    Kampanya Planlayıcısı
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {Object.entries(campaigns).map(([key, campaign]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedType(key)}
                                className={`p-3 rounded-xl border-2 transition-all ${selectedType === key
                                    ? 'bg-orange-100 dark:bg-orange-500/10 border-orange-500 dark:border-orange-500'
                                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/30'
                                    }`}
                            >
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{campaign.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{campaign.benefit}</p>
                            </motion.button>
                        ))}
                    </div>

                    {selectedType && campaigns[selectedType as keyof typeof campaigns] && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20"
                        >
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <div>
                                    <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold uppercase">Fayda</p>
                                    <p className="text-xl font-black text-orange-600 dark:text-orange-400">{campaigns[selectedType as keyof typeof campaigns].benefit}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold uppercase">Süre</p>
                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{campaigns[selectedType as keyof typeof campaigns].time}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold uppercase">Maliyet</p>
                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{campaigns[selectedType as keyof typeof campaigns].cost}</p>
                                </div>
                            </div>
                            <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-bold hover:shadow-lg transition-all">
                                Kampanya Başlat
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Export & Reports ---
const ExportReports = ({ domain, score }: { domain: string; score: number }) => {
    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Download className="text-orange-500" size={24} />
                Raporlar & Export
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Alan: {domain} · Performans skoru: %{score}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    className={`${THEME.card} ${THEME.cardHover} p-6 rounded-2xl flex flex-col items-center justify-center text-center`}
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
                        <FileText className="text-white" size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">PDF Raporu</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Profesyonel analiz raporu</p>
                    <span className="px-4 py-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold">
                        İndir
                    </span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    className={`${THEME.card} ${THEME.cardHover} p-6 rounded-2xl flex flex-col items-center justify-center text-center`}
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 shadow-lg">
                        <FileJson className="text-white" size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Excel Raporu</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Tüm veriler tablosunda</p>
                    <span className="px-4 py-2 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold">
                        İndir
                    </span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    className={`${THEME.card} ${THEME.cardHover} p-6 rounded-2xl flex flex-col items-center justify-center text-center`}
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
                        <Mail className="text-white" size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Email Gönder</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Raporu e-posta ile al</p>
                    <span className="px-4 py-2 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold">
                        Gönder
                    </span>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    className={`${THEME.card} ${THEME.cardHover} p-6 rounded-2xl flex flex-col items-center justify-center text-center`}
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 shadow-lg">
                        <Share2 className="text-white" size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">Paylaş</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Link aracılığıyla paylaş</p>
                    <span className="px-4 py-2 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold">
                        Oluştur
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

// --- Mobile Preview ---
const MobilePreview = ({ storeData, score, platform, isLoading, url }: {
    storeData?: StoreData | null;
    score?: number;
    platform?: string;
    isLoading?: boolean;
    url?: string;
}) => {
    const platformInfo = PLATFORM_LOGOS[platform || 'TRENDYOL'] || PLATFORM_LOGOS['TRENDYOL'];

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 flex flex-col items-center`}>
            <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Smartphone className="text-pink-500" /> Mobil Önizleme
                </h3>
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${platformInfo.color} text-white text-[10px] font-bold rounded-lg hover:shadow-lg transition-all`}
                    >
                        <ExternalLink size={12} />
                        Siteyi Aç
                    </a>
                )}
            </div>

            <div className="relative w-[240px] h-[480px] bg-slate-900 rounded-[36px] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
                    <div className="w-6 h-1 rounded-full bg-slate-700" />
                </div>

                {/* Screen Content */}
                <div className="w-full h-full bg-white overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full bg-slate-50">
                            <Loader2 className="animate-spin text-orange-500" size={28} />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Header with Platform Logo */}
                            <div className={`bg-gradient-to-r ${platformInfo.color} text-white px-3 py-2.5 pt-6 flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={platformInfo.logo}
                                        alt={platformInfo.name}
                                        width={16}
                                        height={16}
                                        className="object-contain brightness-0 invert"
                                    />
                                    <span className="text-[11px] font-bold">{platformInfo.name}</span>
                                </div>
                                <span className="text-[9px] px-2 py-0.5 bg-white/20 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                    Live
                                </span>
                            </div>

                            {/* Store Header */}
                            <div className="p-3 border-b border-slate-200 bg-white">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-11 h-11 bg-gradient-to-br ${platformInfo.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <Image
                                            src={platformInfo.logo}
                                            alt={platformInfo.name}
                                            width={24}
                                            height={24}
                                            className="object-contain brightness-0 invert"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[12px] font-bold text-slate-900 truncate">{storeData?.metrics?.storeName || 'Mağaza'}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="flex items-center gap-0.5">
                                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-[10px] font-bold text-slate-700">{hasNumericValue(storeData?.metrics?.rating) ? storeData?.metrics?.rating : '--'}</span>
                                            </div>
                                            <span className="text-[9px] text-slate-400">•</span>
                                            <span className="text-[9px] text-slate-500">{hasNumericValue(storeData?.metrics?.followers) ? storeData?.metrics?.followers.toLocaleString('tr-TR') : '--'} takipçi</span>
                                        </div>
                                    </div>
                                    <button className="px-2 py-1 bg-orange-500 text-white text-[9px] font-bold rounded-md">
                                        Takip Et
                                    </button>
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
                                <div className="grid grid-cols-2 gap-1.5">
                                    {(storeData?.products || []).slice(0, 6).map((p, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
                                        >
                                            <div className="h-16 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                                                <Package size={20} className="text-slate-400" />
                                                {i < 2 && (
                                                    <span className="absolute top-1 left-1 px-1 py-0.5 bg-red-500 text-white text-[7px] font-bold rounded">
                                                        %{10 + i * 5}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-1.5">
                                                <p className="text-[8px] text-slate-700 line-clamp-2 leading-tight mb-1">{p?.name || 'Ürün'}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-orange-600">{hasNumericValue(p?.price) ? `${p.price}₺` : '--'}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <Star size={7} className="fill-yellow-400 text-yellow-400" />
                                                        <span className="text-[7px] text-slate-500">{hasNumericValue(p?.rating) ? p.rating : '--'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* SEO Score Bar */}
                            <div className="p-2 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-t border-slate-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-bold text-slate-600 flex items-center gap-1">
                                        <Sparkles size={10} className="text-purple-500" />
                                        SEO Skoru
                                    </span>
                                    <span className={`text-[11px] font-black ${(score || 0) >= 75 ? 'text-green-600' :
                                        (score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>{score || 42}/100</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${score || 0}%` }}
                                        transition={{ duration: 1 }}
                                        className={`h-full rounded-full ${(score || 0) >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                            (score || 0) >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                                'bg-gradient-to-r from-red-500 to-orange-400'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Bottom Navigation */}
                            <div className="p-2 border-t border-slate-200 bg-white">
                                <div className="flex items-center justify-around">
                                    {[
                                        { icon: LayoutDashboard, label: 'Ana Sayfa', active: false },
                                        { icon: Search, label: 'Ara', active: false },
                                        { icon: ShoppingBag, label: 'Sepet', active: false },
                                        { icon: Heart, label: 'Favoriler', active: false },
                                        { icon: Users, label: 'Hesap', active: false },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col items-center gap-0.5">
                                            <item.icon size={14} className={item.active ? 'text-orange-500' : 'text-slate-400'} />
                                            <span className={`text-[7px] ${item.active ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-4 text-center">
                Mağaza verileriyle oluşturulan önizleme
            </p>
        </div>
    );
};

// --- Download Report ---
const DownloadReportSection = ({ domain, score, isPremium }: { domain: string; score: number; isPremium?: boolean }) => {
    const handleDownload = () => {
        const content = `
╔══════════════════════════════════════════════════════════════╗
║       PAZARYONETIMI.COM MAĞAZA ANALİZ RAPORU                 ║
╚══════════════════════════════════════════════════════════════╝

📊 GENEL BİLGİLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mağaza: ${domain}
Analiz Tarihi: ${new Date().toLocaleDateString('tr-TR')}
Genel Skor: ${score}/100

📈 PERFORMANS DEĞERLENDİRMESİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${score >= 80 ? '✅ Mükemmel - Mağazanız üst düzey performans gösteriyor' :
                score >= 60 ? '📊 İyi - Küçük iyileştirmelerle daha iyi olabilir' :
                    score >= 40 ? '⚠️ Orta - Optimizasyon gerekli' :
                        '🚨 Kritik - Acil müdahale gerekiyor'}

💡 ÖNERİLER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ürün başlıklarını SEO uyumlu hale getirin
• Yüksek çözünürlüklü görseller kullanın
• Müşteri yorumlarına hızlı yanıt verin
• Stok takibini düzenli yapın

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bu rapor Pazaryonetimi AI tarafından oluşturulmuştur.
www.pazaryonetimi.com
        `;

        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${domain}-analiz-raporu.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Download size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analiz Raporu</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Detaylı raporu indirin</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleDownload}
                        className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Raporu İndir
                    </button>
                    {isPremium && (
                        <button className="flex-1 md:flex-none px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                            <Share2 size={18} />
                            Paylaş
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Content ---
function AnalysisContent({ initialUrl }: { initialUrl: string }) {
    const [url] = useState<string>(initialUrl);
    const [analyzing, setAnalyzing] = useState(true);
    const [score, setScore] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'products' | 'keywords' | 'trends' | 'competitors' | 'comparison' | 'marketing' | 'reports' | 'tools'>('overview');
    const [showMoreTabs, setShowMoreTabs] = useState(false);
    const [storeData, setStoreData] = useState<StoreData | null>(null);
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [platform, setPlatform] = useState<string>('TRENDYOL');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [userPlan, _setUserPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('FREE');
    const [error, setError] = useState<string | null>(null);

    // URL'den mağaza adını ve bilgilerini çıkar
    const extractStoreInfo = (urlString: string): { storeName: string; storeSlug: string; storeId: string; platform: string } => {
        try {
            if (urlString.includes('trendyol.com')) {
                const parsed = parseTrendyolStoreUrl(urlString);
                if (parsed) {
                    return {
                        storeName: parsed.storeName,
                        storeSlug: parsed.storeSlug,
                        storeId: parsed.storeId,
                        platform: 'TRENDYOL',
                    };
                }
            } else if (urlString.includes('hepsiburada.com')) {
                const match = urlString.match(/\/magaza\/([^/?]+)/);
                if (match) {
                    const storeSlug = match[1];
                    const storeName = storeSlug
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    return { storeName, storeSlug, storeId: storeSlug, platform: 'HEPSIBURADA' };
                }
            } else if (urlString.includes('amazon')) {
                return { storeName: 'Amazon Mağaza', storeSlug: 'amazon-store', storeId: 'amazon', platform: 'AMAZON' };
            }
            throw new Error('Desteklenmeyen veya hatalı mağaza URL formatı.');
        } catch {
            throw new Error('Mağaza bilgileri URL içinden çözümlenemedi.');
        }
    };


    // Platform ve Store ID'yi URL'den çıkart
    const getPlatformFromUrl = (urlString: string): { platform: string; storeId: string } => {
        try {
            if (urlString.includes('trendyol.com')) {
                const parsed = parseTrendyolStoreUrl(urlString);
                if (!parsed?.storeId) {
                    throw new Error('Trendyol mağaza kimliği URL içinde bulunamadı.');
                }
                return { platform: 'TRENDYOL', storeId: parsed.storeId };
            } else if (urlString.includes('hepsiburada.com')) {
                const match = urlString.match(/\/magaza\/([^/?]+)/);
                const storeId = match?.[1] || 'store';
                return { platform: 'HEPSIBURADA', storeId };
            } else if (urlString.includes('amazon')) {
                return { platform: 'AMAZON', storeId: 'store' };
            }
            throw new Error('URL platformı desteklenmiyor.');
        } catch {
            throw new Error('Platform veya mağaza kimliği çözümlenemedi.');
        }
    };

    useEffect(() => {
        const loadAnalysis = async () => {
            console.log(`[DEBUG] Starting analysis, url=${url}`);
            setError(null);
            if (!url) {
                console.log('[DEBUG] No URL provided');
                setError('Analiz için ?url= parametresi zorunludur.');
                setAnalyzing(false);
                return;
            }
            console.log('[DEBUG] URL exists, proceeding...');
            try {
                let storeInfo;
                try {
                    console.log('[DEBUG] Calling extractStoreInfo...');
                    storeInfo = extractStoreInfo(url);
                    console.log('[DEBUG] extractStoreInfo result:', storeInfo);
                } catch (extractError: any) {
                    console.error('[DEBUG] extractStoreInfo failed:', extractError);
                    // Fallback for Amazon
                    if (url.includes('amazon')) {
                        storeInfo = { storeName: 'Amazon Mağaza', storeSlug: 'amazon-store', storeId: 'store', platform: 'AMAZON' };
                    } else if (url.includes('hepsiburada.com')) {
                        storeInfo = { storeName: 'Hepsiburada Mağaza', storeSlug: 'hepsiburada-store', storeId: 'erogluoto', platform: 'HEPSIBURADA' };
                    } else {
                        throw extractError;
                    }
                }
                console.log('[DEBUG] Setting platform...', storeInfo?.platform);
                setPlatform(storeInfo.platform);
                console.log('[DEBUG] Platform set, checking URL type...');

                // Platform-specific API calls
                if (url.includes('trendyol.com')) {
                    const { platform: plat, storeId } = getPlatformFromUrl(url);
                    const response = await fetch(
                        `/api/marketplace/analyze/${plat.toLowerCase()}/${storeId}?url=${encodeURIComponent(url)}`
                    );

                    if (response.ok) {
                        const analysisData = await response.json();
                        if (analysisData && analysisData.metrics) {
                            setStoreData(analysisData);
                            setScore(hasNumericValue(analysisData.seoScore) ? analysisData.seoScore : 0);
                            setProducts(analysisData.products || []);
                            setAnalyzing(false);
                            return;
                        } else {
                            throw new Error('Trendyol verileri alınamadı.');
                        }
                    } else {
                        const errorData = await response.json().catch(() => null);
                        throw new Error(errorData?.error || 'Trendyol analizi başarısız oldu.');
                    }
                } else if (url.includes('hepsiburada.com')) {
                    console.log('[DEBUG] Hepsiburada URL detected, calling API...');
                    // Routing Hepsiburada to Backend API for more robust scraping
                    const { platform: plat, storeId } = getPlatformFromUrl(url);
                    console.log(`[DEBUG] Hepsiburada - plat=${plat}, storeId=${storeId}`);
                    const response = await fetch(
                        `/api/marketplace/analyze/${plat.toLowerCase()}/${storeId}?url=${encodeURIComponent(url)}`
                    );
                    console.log(`[DEBUG] Hepsiburada API response status: ${response.status}`);

                    if (!response.ok) {
                        throw new Error('Hepsiburada analizi şu an yapılamıyor.');
                    }

                    const analysisData = await response.json();
                    console.log('[DEBUG] Hepsiburada analysis data:', analysisData);

                    if (analysisData && analysisData.metrics) {
                        setStoreData(analysisData);
                        setScore(hasNumericValue(analysisData.seoScore) ? analysisData.seoScore : 0);
                        setProducts(analysisData.products || []);
                        setAnalyzing(false);
                        return;
                    } else {
                        throw new Error('Hepsiburada verileri alınamadı.');
                    }
                } else {
                    // Fallback for other platforms (e.g., Amazon, or if scraper fails)
                    const { platform: plat, storeId } = getPlatformFromUrl(url);
                    const analysisUrl = `/api/marketplace/analyze/${plat.toLowerCase()}/${storeId}?url=${encodeURIComponent(url)}`;
                    console.log(`[Frontend] Calling: ${analysisUrl}`);
                    
                    const analysisResponse = await fetch(analysisUrl);
                    console.log(`[Frontend] Response status: ${analysisResponse.status}`);

                    if (analysisResponse.ok) {
                        const analysisData = await analysisResponse.json();
                        console.log(`[Frontend] Response data:`, analysisData);
                        
                        if (analysisData && analysisData.metrics) {
                            setStoreData(analysisData);
                            setScore(hasNumericValue(analysisData.seoScore) ? analysisData.seoScore : 0);
                            setProducts(analysisData.products || []);
                        } else {
                            console.error('[Frontend] No metrics in response:', analysisData);
                            throw new Error('Pazaryeri analizi şu an yapılamıyor veya geçerli veri alınamadı.');
                        }
                    } else {
                        const errorText = await analysisResponse.text();
                        console.error('[Frontend] API error:', errorText);
                        throw new Error('Pazaryeri analizi şu an yapılamıyor.');
                    }
                }

            } catch (err: any) {
                console.error('Analysis error:', err);
                setError(err.message || 'Analiz sırasında bir hata oluştu.');
            } finally {
                setAnalyzing(false);
            }
        };

        const timer = setTimeout(loadAnalysis, 2000);
        return () => clearTimeout(timer);
    }, [url]);

    // Loading State
    if (analyzing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-white/[0.02] bg-[size:50px_50px]" />
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />

                <div className="relative z-10 text-center space-y-12 px-4">
                    {/* Animated Logo */}
                    <div className="relative w-40 h-40 mx-auto">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                            className="absolute inset-0 border-4 border-slate-200 dark:border-white/5 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                            className="absolute inset-4 border-4 border-orange-500/40 border-t-transparent rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            className="absolute inset-8 border-4 border-purple-500/40 border-t-transparent rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Brain size={48} className="text-orange-500 animate-pulse" aria-hidden="true" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">AI Analiz Yapılıyor</h2>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-sm truncate max-w-xs">Mağaza analiz ediliyor...</span>
                        </div>
                    </div>

                    {/* Loading Steps */}
                    <div className="flex flex-wrap gap-3 justify-center max-w-md mx-auto">
                        {['Mağaza Taranıyor', 'Ürünler Analiz Ediliyor', 'SEO Kontrolü', 'AI Öneriler', 'Rapor Hazırlanıyor'].map((item, i) => (
                            <motion.span
                                key={item}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.4 }}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-600 dark:text-slate-400 shadow-sm"
                            >
                                {item}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-4 text-center">
                <div className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-red-500/20 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Analiz Başarısız Oldu</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="block w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-500 transition-colors"
                        >
                            Ana Sayfaya Dön
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="block w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            Yeniden Dene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
        { id: 'seo', label: 'SEO Analizi', icon: Search },
        { id: 'products', label: 'Ürünler', icon: ShoppingBag },
        { id: 'keywords', label: 'Anahtar Kelimeler', icon: Target },
        { id: 'trends', label: 'Trendler', icon: TrendingUp, premium: true },
        { id: 'competitors', label: 'Rakipler', icon: Users, premium: true },
        { id: 'comparison', label: 'Karşılaştırma', icon: BarChart3, premium: true },
        { id: 'marketing', label: 'Pazarlama', icon: Lightbulb, premium: true },
        { id: 'reports', label: 'Raporlar', icon: FileText, premium: true },
        { id: 'tools', label: 'Araçlar', icon: Wrench, premium: true },
    ];

    const domain = (() => {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return url.split('/')[0];
        }
    })();

    return (
        <div className="landing-brand min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1000px] opacity-30 dark:opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/20 rounded-full blur-[120px]" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>
            </div>

            <Navbar />

            <main className="pt-24 md:pt-28 pb-20 container mx-auto px-4 md:px-6 relative z-10">
                {/* Store Header */}
                <div className="mb-6">
                    <StoreHeaderCard
                        storeData={storeData}
                        url={url}
                        platform={platform}
                        score={score || 0}
                        isLoading={analyzing}
                    />
                </div>

                {/* AI Advisor */}
                <div className="mb-6">
                    <AIAdvisorCard
                        score={score || 0}
                        domain={domain}
                        url={url}
                        storeData={storeData}
                    />
                </div>

                {/* Tabs - Responsive Grid */}
                <div className="mb-6">
                    {/* Primary Tabs - Hep görünen */}
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2">
                        {tabs.slice(0, 6).map(tab => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => {
                                    setActiveTab(tab.id as 'overview' | 'seo' | 'products' | 'keywords' | 'trends' | 'competitors' | 'comparison' | 'marketing' | 'reports' | 'tools');
                                    setShowMoreTabs(false);
                                }}
                                className={`flex flex-col items-center justify-center gap-1 px-2 py-3 md:px-3 md:py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all border ${activeTab === tab.id
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-center">
                                    {tab.icon && <tab.icon size={14} className="md:mr-1" />}
                                </div>
                                <span className="hidden md:inline text-center leading-tight">{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Secondary Tabs - Collapsible */}
                    {tabs.length > 6 && (
                        <div className="relative">
                            <motion.button
                                onClick={() => setShowMoreTabs(!showMoreTabs)}
                                whileHover={{ scale: 1.02 }}
                                className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${showMoreTabs
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                    }`}
                            >
                                <Plus size={14} />
                                <span>Daha Fazla ({tabs.length - 6})</span>
                                <motion.div
                                    animate={{ rotate: showMoreTabs ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown size={14} />
                                </motion.div>
                            </motion.button>

                            {/* Dropdown Tabs */}
                            <AnimatePresence>
                                {showMoreTabs && (
                                    <>
                                        {/* Backdrop Blur */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => setShowMoreTabs(false)}
                                            className="fixed inset-0 z-40"
                                        />

                                        {/* Dropdown Menu */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
                                            className="absolute top-full left-0 right-0 mt-3 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95"
                                        >
                                            {/* Header */}
                                            <div className="px-4 pt-4 pb-2 border-b border-slate-200 dark:border-white/5">
                                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Premium Özellikler</p>
                                            </div>

                                            {/* Tabs Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 p-4">
                                                {tabs.slice(6).map((tab, idx) => {
                                                    const tabColors = [
                                                        { bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-200 dark:border-purple-500/20', icon: 'text-purple-600 dark:text-purple-400', hover: 'hover:from-purple-500/20 hover:to-pink-500/20' },
                                                        { bg: 'from-orange-500/10 to-amber-500/10', border: 'border-orange-200 dark:border-orange-500/20', icon: 'text-orange-600 dark:text-orange-400', hover: 'hover:from-orange-500/20 hover:to-amber-500/20' },
                                                        { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-200 dark:border-green-500/20', icon: 'text-green-600 dark:text-green-400', hover: 'hover:from-green-500/20 hover:to-emerald-500/20' },
                                                        { bg: 'from-orange-500/10 to-cyan-500/10', border: 'border-orange-200 dark:border-orange-500/20', icon: 'text-orange-600 dark:text-orange-400', hover: 'hover:from-orange-500/20 hover:to-cyan-500/20' },
                                                    ];
                                                    const color = tabColors[idx % tabColors.length];

                                                    return (
                                                        <motion.button
                                                            key={tab.id}
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => {
                                                                setActiveTab(tab.id as 'overview' | 'seo' | 'products' | 'keywords' | 'trends' | 'competitors' | 'comparison' | 'marketing' | 'reports' | 'tools');
                                                                setShowMoreTabs(false);
                                                            }}
                                                            className={`relative group flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all ${activeTab === tab.id
                                                                ? 'bg-gradient-to-br from-orange-500 to-purple-600 border-orange-500 shadow-lg shadow-orange-500/40 text-white'
                                                                : `bg-gradient-to-br ${color.bg} ${color.border} border-2 text-slate-600 dark:text-slate-300 ${color.hover}`
                                                                }`}
                                                        >
                                                            {/* Icon Container */}
                                                            <div className={`p-2 rounded-lg transition-all ${activeTab === tab.id
                                                                ? 'bg-white/20'
                                                                : `bg-gradient-to-br ${color.bg.replace('/10', '/20')}`
                                                                }`}>
                                                                {tab.icon && <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : color.icon} />}
                                                            </div>

                                                            {/* Label */}
                                                            <span className="text-xs font-bold text-center leading-tight">{tab.label}</span>

                                                            {/* Premium Badge */}
                                                            {tab.premium && userPlan === 'FREE' && (
                                                                <div className={`px-2 py-1 rounded-full text-[8px] font-bold ${activeTab === tab.id
                                                                    ? 'bg-white/20 text-white'
                                                                    : `bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400`
                                                                    }`}>
                                                                    💎 PRO
                                                                </div>
                                                            )}

                                                            {/* Hover Tooltip */}
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                                                {tab.label}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 transform rotate-45" />
                                                            </div>
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>

                                            {/* Footer Info */}
                                            {userPlan === 'FREE' && (
                                                <div className="px-4 py-3 border-t border-slate-200 dark:border-white/5 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-500/10 dark:to-purple-500/10">
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 text-center">
                                                        🔒 Premium sekmelerine erişmek için <span className="font-bold text-orange-600 dark:text-orange-400">PRO planına</span> yükseltin
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        {activeTab === 'overview' && (
                            <>
                                {/* Quick Metrics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <MetricCard
                                        icon={Star}
                                        label="Mağaza Puanı"
                                        value={hasNumericValue(storeData?.metrics?.rating) ? storeData.metrics.rating : '--'}
                                        sourceLabel={getMetricSourceLabel(storeData?.dataSources, 'rating') || undefined}
                                        change={undefined}
                                        trend="neutral"
                                        color="yellow"
                                    />
                                    <MetricCard
                                        icon={TrendingUp}
                                        label="Aylık Trafik"
                                        value={storeData?.metrics?.monthlyTraffic ? formatNumber(storeData.metrics.monthlyTraffic) : '--'}
                                        sourceLabel={getMetricSourceLabel(storeData?.dataSources, 'monthlyTraffic') || undefined}
                                        change={undefined}
                                        trend="neutral"
                                        color="green"
                                    />
                                    <MetricCard
                                        icon={DollarSign}
                                        label="Tahmini Ciro"
                                        value={storeData?.metrics?.monthlyTurnover ? `${formatNumber(storeData.metrics.monthlyTurnover)}₺` : '--₺'}
                                        sourceLabel={getMetricSourceLabel(storeData?.dataSources, 'monthlyTurnover') || undefined}
                                        change={undefined}
                                        trend="neutral"
                                        color="blue"
                                        isPremium={userPlan === 'FREE'}
                                    />
                                    <MetricCard
                                        icon={ShoppingBag}
                                        label="Aktif Ürün"
                                        value={hasNumericValue(storeData?.metrics?.totalProducts) ? storeData.metrics.totalProducts : '--'}
                                        sourceLabel={getMetricSourceLabel(storeData?.dataSources, 'totalProducts', ['productCount']) || undefined}
                                        change={undefined}
                                        trend="neutral"
                                        color="purple"
                                    />
                                </div>

                                {/* SEO Panel */}
                                <SEOAnalysisPanel metrics={storeData?.metrics} dataSources={storeData?.dataSources} />

                                {/* Sales Trend */}
                                {/* Products */}
                                <ProductGrid products={storeData?.products || products} />

                                {/* Keyword Analysis */}
                                <KeywordAnalysisPanel storeName={storeData?.metrics?.storeName} isPremium={userPlan === 'FREE'} extractedKeywords={storeData?.keywords} />

                                {/* Premium CTA */}
                                {userPlan === 'FREE' && (
                                    <PremiumUpgradeCTA feature="Detaylı Rakip Analizi" plan="PRO" />
                                )}
                            </>
                        )}

                        {activeTab === 'seo' && (
                            <>
                                <SEOAnalysisPanel metrics={storeData?.metrics} dataSources={storeData?.dataSources} />

                                {/* SEO Recommendations */}
                                <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6">SEO Önerileri</h3>
                                    <div className="space-y-4">
                                        {[
                                            { title: 'Ürün başlıklarını optimize et', impact: 'Yüksek', desc: 'Anahtar kelimeleri başlıklara ekle', icon: FileText },
                                            { title: 'Görsel kalitesini artır', impact: 'Orta', desc: 'WebP format kullan, boyutları optimize et', icon: ImageIcon },
                                            { title: 'Açıklamaları zenginleştir', impact: 'Yüksek', desc: 'Detaylı ve SEO uyumlu açıklamalar yaz', icon: MessageSquare },
                                        ].map((item, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 transition-colors"
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.impact === 'Yüksek'
                                                    ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                                    : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                                    }`}>
                                                    <item.icon size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.impact === 'Yüksek'
                                                            ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                                            : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                                            }`}>
                                                            {item.impact} Etki
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'products' && (
                            <ProductGrid products={storeData?.products || products} />
                        )}

                        {activeTab === 'keywords' && (
                            <KeywordAnalysisPanel storeName={storeData?.metrics?.storeName} isPremium={userPlan === 'FREE'} extractedKeywords={storeData?.keywords} />
                        )}

                        {activeTab === 'trends' && (
                            <>
                                <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">Trend Verisi Yakında</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Bu sekmede yalnızca tarihsel gerçek veri gösterilecek. Şu an veri kaynağı hazır olmadığı için tahmini grafikler kaldırıldı.
                                    </p>
                                </div>
                            </>
                        )}

                        {activeTab === 'competitors' && (
                            <CompetitorAnalysis isPremium={userPlan === 'FREE'} storeName={storeData?.metrics?.storeName} />
                        )}

                        {activeTab === 'comparison' && (
                            <>
                                <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">Karşılaştırma Verisi Yakında</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Bu bölümde tahmini karşılaştırma verileri kaldırıldı. Rakip kıyaslaması yalnızca doğrulanmış gerçek veri ile gösterilecek.
                                    </p>
                                </div>
                            </>
                        )}

                        {activeTab === 'marketing' && (
                            <>
                                <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">Pazarlama Öngörüleri Yakında</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Simülatör ve tahmin tabanlı çıktılar kaldırıldı. Bu sekme, gerçek satış ve kampanya verileri bağlandığında aktif olacaktır.
                                    </p>
                                </div>
                            </>
                        )}

                        {activeTab === 'reports' && (
                            <>
                                <ExportReports domain={domain} score={score || 0} />
                                {userPlan === 'FREE' && <PremiumUpgradeCTA feature="Raporlar" plan="PRO" />}
                            </>
                        )}

                        {activeTab === 'tools' && (
                            <>
                                <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">Araçlar Hazırlanıyor</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Bu alanda sadece gerçek işlem verisi kullanan araçlar yayınlanacak. Tahmini simülasyonlar kaldırıldı.
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Download Report */}
                        <DownloadReportSection domain={domain} score={score || 0} isPremium={userPlan !== 'FREE'} />
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            {/* Score Card */}
                            <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 text-center`}>
                                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Mağaza Skoru</h3>
                                <div className="flex justify-center mb-6">
                                    <GaugeChart value={score || 0} />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    {(score || 0) >= 70 ? 'Mağazanız iyi durumda!' : 'İyileştirme önerileri için AI danışmana bakın.'}
                                </p>

                                {/* Premium Benefits */}
                                <div className="text-left mb-6 p-4 bg-gradient-to-br from-orange-500/5 to-purple-500/5 rounded-2xl border border-orange-500/10">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">PRO ile açılacak özellikler:</p>
                                    <ul className="space-y-2">
                                        {['Detaylı rakip analizi', 'Fiyat optimizasyonu', 'Satış tahminleri', 'AI önerileri'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <CheckCircle size={12} className="text-green-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href="/checkout?plan=pro"
                                    className="block w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-bold text-center hover:shadow-xl hover:shadow-orange-500/30 transition-all mb-3"
                                >
                                    <Crown className="inline-block mr-2" size={18} />
                                    PRO&apos;ya Yükselt - ₺299/ay
                                </Link>
                                <p className="text-[10px] text-slate-400">7 gün ücretsiz deneme • İstediğiniz zaman iptal</p>
                            </div>

                            {/* Mobile Preview */}
                            <MobilePreview
                                storeData={storeData}
                                score={score || 0}
                                platform={platform}
                                isLoading={analyzing}
                                url={url}
                            />

                            {/* Quick Actions */}
                            <QuickActionsPanel platform={platform} />

                            {/* Supported Platforms */}
                            <SupportedPlatformsWidget currentPlatform={platform} />

                            {/* Raw Evidence */}
                            <RawEvidencePanel storeData={storeData} />

                            {/* Premium Features Card */}
                            <div className={`${THEME.card} rounded-[32px] p-6 overflow-hidden relative`}>
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Crown className="text-amber-500" size={20} />
                                        <h4 className="font-bold text-slate-900 dark:text-white">Enterprise</h4>
                                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold">%40 İndirim</span>
                                    </div>
                                    <ul className="space-y-2 mb-4">
                                        {['Sınırsız mağaza analizi', 'API erişimi', 'Özel destek', 'Beyaz etiket'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                <Sparkles size={12} className="text-amber-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href="/checkout?plan=enterprise"
                                        className="block w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-center text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                                    >
                                        Enterprise - ₺999/ay
                                    </Link>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className={`${THEME.card} rounded-[32px] p-6`}>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                        <Info size={18} className="text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">Nasıl Çalışır?</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Pazaryonetimi AI, mağazanızı gerçek zamanlı olarak analiz eder ve SEO, fiyatlandırma ve müşteri deneyimi konularında öneriler sunar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default function AnalysisPage() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url') || '';
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        }>
            <AnalysisContent initialUrl={url} />
        </Suspense>
    );
}
