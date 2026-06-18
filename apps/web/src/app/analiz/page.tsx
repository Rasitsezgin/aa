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
import { parseAnalysisUrl, requiresPremiumForAnalysis } from '@/lib/free-analysis-platforms';
import {
    mapApiProductsToUi,
    formatMetricDisplay,
    stockStatusLabel,
    deriveSeoRecommendations,
    type UiStoreProduct,
} from '@/lib/analysis-display-utils';
import { ExportReportsPanel } from '@/components/analiz/ExportReportsPanel';
import { StoreComparisonPanel } from '@/components/analiz/StoreComparisonPanel';
import { DataFreshnessBar } from '@/components/analiz/DataFreshnessBar';
import { PortfolioDistributionPanel } from '@/components/analiz/PortfolioDistributionPanel';
import { MarketingInsightsPanel } from '@/components/analiz/MarketingInsightsPanel';
import { AnalysisToolsPanel } from '@/components/analiz/AnalysisToolsPanel';
import {
    KeywordAnalysisPanel,
    SEOAnalysisPanel,
    ProductGrid,
    QuickActionsPanel,
    SupportedPlatformsWidget,
    RawEvidencePanel,
} from '@/components/analiz/analysis-panels';
import { PLATFORM_LOGOS } from '@/components/analiz/platform-logos';
import { downloadTextReport, type ExportableAnalysis } from '@/lib/analysis-export';

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const hasNumericValue = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);

const getSourceBadgeLabel = (source?: string): string | null => {
    if (!source) return null;
    if (source === 'api' || source === 'scraped' || source === 'api_or_scraped') return 'Gerçek';
    if (source === 'calculated') return 'AI Hesaplanmış';
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

// --- Tema Sistemi ---
const THEME = {
    glass: "backdrop-blur-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10",
    glassLight: "backdrop-blur-xl bg-slate-50/80 border border-slate-200 dark:bg-white/5 dark:border-white/10",
    gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400",
    card: "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none",
    cardHover: "hover:shadow-xl hover:shadow-orange-500/5 dark:hover:shadow-orange-500/10 hover:border-orange-500/20 dark:hover:border-orange-500/20 transition-all duration-300",
};

// --- Premium Platform Gate (Trendyol / Hepsiburada dışı) ---
const PremiumPlatformGate = ({
    platformLabel,
    url,
}: {
    platformLabel: string;
    url: string;
}) => {
    const signupUrl = `/signup?welcome=1&callbackUrl=${encodeURIComponent(`/analiz?url=${encodeURIComponent(url)}&welcome=1`)}`;

    return (
        <div className="landing-brand min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <Navbar />

            <main className="pt-28 pb-20 container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center justify-center min-h-[70vh]">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[32px] border border-orange-500/20 max-w-xl w-full text-center shadow-xl"
                >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
                        <Crown className="text-white" size={36} />
                    </div>

                    <PremiumBadge plan="PRO" />

                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-6 mb-3">
                        {platformLabel} Analizi Premium Özelliktir
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                        Ücretsiz mağaza analizi şu an yalnızca <strong className="text-slate-700 dark:text-slate-200">Trendyol</strong> ve{' '}
                        <strong className="text-slate-700 dark:text-slate-200">Hepsiburada</strong> mağazaları için sunulmaktadır.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        {platformLabel} ve diğer pazaryerleri için yapay zeka destekli, gerçek veriye dayalı analizlere erişmek üzere lütfen kayıt olun.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={signupUrl}
                            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-orange-500/30 transition-all"
                        >
                            <Rocket size={18} />
                            Ücretsiz Kayıt Ol
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                        >
                            Paketleri İncele
                        </Link>
                    </div>

                    <Link
                        href="/"
                        className="inline-block mt-6 text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors"
                    >
                        Ana sayfaya dön
                    </Link>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

// --- Gerçek Veri + AI Banner ---
const RealDataAIBanner = () => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 px-4 py-4 md:px-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
        <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Brain className="text-white" size={22} />
            </div>
            <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <CheckCircle size={11} /> Gerçek Veri
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    <Sparkles size={11} /> AI Analiz
                </span>
            </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Ürün ve mağaza metrikleri canlı platform kaynaklarından çekilir. SEO skoru, anahtar kelimeler ve öneriler mevcut veriden hesaplanır; platformun paylaşmadığı trafik veya ciro gibi alanlar gösterilmez.
        </p>
    </motion.div>
);

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
    productCount?: number;
    titleOptimization?: number;
    imageOptimization?: number;
    priceCompetitiveness?: number;
    stockHealth?: number;
    customerSatisfaction?: number;
    responseScore?: number;
    totalReviews?: number;
    avgProductPrice?: number;
}

interface StoreProduct extends UiStoreProduct {}

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
                                    value: formatMetricDisplay(
                                        storeData.metrics?.followers,
                                        getMetricSourceLabel(storeData.dataSources, 'followers'),
                                        (n) => n.toLocaleString('tr-TR'),
                                    ),
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
                                    value: formatMetricDisplay(
                                        storeData.metrics?.responseTime,
                                        getMetricSourceLabel(storeData.dataSources, 'responseTime'),
                                    ),
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
                        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">SEO Skoru</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
                            {score >= 80 ? 'Ürün ve mağaza verilerine göre güçlü SEO performansı.' :
                                score >= 60 ? 'İyi düzeyde; başlık ve görsel optimizasyonu ile artırılabilir.' :
                                    score >= 40 ? 'Orta düzey; ürün listesindeki zayıf alanları güçlendirin.' :
                                        'Düşük skor; başlık, görsel ve fiyat verilerini iyileştirin.'}
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
            suggestionMessage = `📊 ${storeName} orta seviyede SEO skoruna sahip. Ürün başlığı ve görsel metriklerinde iyileştirme alanı var.`;
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
                                            <span className="text-[9px] text-slate-500">
                                                {formatMetricDisplay(
                                                    storeData?.metrics?.followers,
                                                    getMetricSourceLabel(storeData?.dataSources, 'followers'),
                                                    (n) => `${n.toLocaleString('tr-TR')} takipçi`,
                                                )}
                                            </span>
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
                                            <div className="h-16 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                                                {(p as StoreProduct).imageUrl ? (
                                                    <Image
                                                        src={(p as StoreProduct).imageUrl!}
                                                        alt={p?.name || 'Ürün'}
                                                        width={80}
                                                        height={64}
                                                        className="object-cover w-full h-full"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <Package size={20} className="text-slate-400" />
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
                                        }`}>{score ?? 0}/100</span>
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

// --- Main Content ---
function AnalysisContent({ initialUrl, showWelcome }: { initialUrl: string; showWelcome?: boolean }) {
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
    const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);
    const [premiumGate, setPremiumGate] = useState<{ platformLabel: string } | null>(null);
    const [analysisMeta, setAnalysisMeta] = useState<{ cached?: boolean; analyzedAt?: string }>({});
    const [refreshing, setRefreshing] = useState(false);

    const commitAnalysisResult = useCallback((data: {
        metrics?: Record<string, unknown>;
        products?: Array<Record<string, unknown>>;
        seoScore?: number;
        keywords?: string[];
        dataSources?: StoreData['dataSources'];
        confidence?: StoreData['confidence'];
        timestamp?: string;
        analyzedAt?: string;
        cached?: boolean;
        partial?: boolean;
        notice?: string;
    }) => {
        if (!data?.metrics) return false;
        const productList = mapApiProductsToUi(data.products || []);
        if (productList.length === 0) return false;

        const analyzedAt = data.analyzedAt || data.timestamp || new Date().toISOString();
        setAnalysisMeta({ cached: Boolean(data.cached), analyzedAt });
        setStoreData({
            metrics: data.metrics as StoreMetrics,
            products: productList,
            keywords: data.keywords,
            dataSources: data.dataSources,
            confidence: data.confidence,
            timestamp: analyzedAt,
        });
        setScore(hasNumericValue(data.seoScore) ? data.seoScore : 0);
        setProducts(productList);
        if (data.notice) setAnalysisNotice(String(data.notice));
        setAnalyzing(false);
        return true;
    }, []);

    const runAnalysis = useCallback(async (skipCache = false) => {
        setError(null);
        if (!skipCache) setAnalysisNotice(null);
        setPremiumGate(null);
        if (!url) {
            setError('Analiz için ?url= parametresi zorunludur.');
            setAnalyzing(false);
            setRefreshing(false);
            return;
        }

        const premiumCheck = requiresPremiumForAnalysis(url);
        if (premiumCheck.required) {
            setPlatform(premiumCheck.platform);
            setPremiumGate({ platformLabel: premiumCheck.platformLabel });
            setAnalyzing(false);
            setRefreshing(false);
            return;
        }

        const parsed = parseAnalysisUrl(url);
        if (!parsed) {
            setError('Geçerli bir mağaza URL\'si girin. Örnek: Trendyol veya Hepsiburada mağaza linki.');
            setAnalyzing(false);
            setRefreshing(false);
            return;
        }

        if (skipCache) {
            setRefreshing(true);
        } else {
            setAnalyzing(true);
        }

        try {
            setPlatform(parsed.platform);

            const plat = parsed.platform;
            const storeId = parsed.storeId;
            const scrapePath =
                plat === 'TRENDYOL' ? '/api/scrape/trendyol' : '/api/scrape/hepsiburada';
            const platformLabel =
                plat === 'TRENDYOL' ? 'Trendyol' : 'Hepsiburada';
            const refreshParam = skipCache ? '&refresh=1' : '';

            const response = await fetch(
                `/api/marketplace/analyze/${plat.toLowerCase()}/${storeId}?url=${encodeURIComponent(url)}${refreshParam}`,
            );

            if (response.status === 429) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Çok fazla analiz isteği. Lütfen bir süre sonra tekrar deneyin.');
            }

            if (response.ok) {
                const analysisData = await response.json();
                if (commitAnalysisResult(analysisData)) return;
            }

            const scrapeRes = await fetch(scrapePath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, refresh: skipCache }),
            });

            if (scrapeRes.ok) {
                const scrapeData = await scrapeRes.json();
                if (commitAnalysisResult({
                    metrics: scrapeData.metrics,
                    products: scrapeData.products,
                    seoScore: scrapeData.seoScore,
                    keywords: scrapeData.keywords,
                    dataSources: scrapeData.dataSources,
                    confidence: scrapeData.confidence,
                    timestamp: scrapeData.timestamp,
                    notice: scrapeData.notice,
                })) {
                    return;
                }
            }

            const errorData = await response.json().catch(() => null)
                ?? await scrapeRes.json().catch(() => null);
            throw new Error(
                errorData?.message || errorData?.error || `${platformLabel} analizi başarısız oldu.`,
            );
        } catch (err: unknown) {
            console.error('Analysis error:', err);
            const message = err instanceof Error ? err.message : 'Analiz sırasında bir hata oluştu.';
            setError(message);
        } finally {
            setAnalyzing(false);
            setRefreshing(false);
        }
    }, [url, commitAnalysisResult]);

    useEffect(() => {
        void runAnalysis(false);
    }, [runAnalysis]);

    const handleRefreshAnalysis = useCallback(() => {
        if (!refreshing && !analyzing) void runAnalysis(true);
    }, [refreshing, analyzing, runAnalysis]);

    // Loading State — full screen only on initial load
    if (analyzing && !storeData) {
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
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gerçek Veri · AI Analiz</h2>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-sm truncate max-w-xs">Mağaza canlı kaynaktan taranıyor...</span>
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

    if (premiumGate) {
        return <PremiumPlatformGate platformLabel={premiumGate.platformLabel} url={url} />;
    }

    if (error && !storeData) {
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
        { id: 'comparison', label: 'Karşılaştırma', icon: BarChart3 },
        { id: 'marketing', label: 'Pazarlama', icon: Lightbulb, premium: true },
        { id: 'reports', label: 'Raporlar', icon: FileText },
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

    const exportPayload: ExportableAnalysis = {
        url,
        platform,
        seoScore: score || 0,
        analyzedAt: analysisMeta.analyzedAt || storeData?.timestamp,
        metrics: storeData?.metrics as Record<string, unknown> | undefined,
        products: (storeData?.products || products).map((p) => ({
            name: p.name,
            price: p.price,
            rating: p.rating,
            reviews: p.reviews,
            stockStatus: p.stockStatus,
            imageUrl: p.imageUrl,
        })),
        keywords: storeData?.keywords,
        dataSources: storeData?.dataSources,
        confidence: storeData?.confidence,
    };

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
                <RealDataAIBanner />
                <DataFreshnessBar
                    analyzedAt={analysisMeta.analyzedAt || storeData?.timestamp}
                    cached={analysisMeta.cached}
                    productSampleSize={storeData?.products?.length || products.length}
                    totalProducts={storeData?.metrics?.totalProducts}
                    confidenceScore={storeData?.confidence?.score}
                    onRefresh={storeData && !premiumGate ? handleRefreshAnalysis : undefined}
                    refreshing={refreshing}
                />
                {showWelcome && (
                    <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-800 dark:text-green-200">
                        Hoş geldiniz! Kayıt tamamlandı. Mağaza analiziniz aşağıda — premium platformlar ve dashboard özellikleri için paketlerimizi inceleyebilirsiniz.
                    </div>
                )}
                {analysisNotice && (
                    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{analysisNotice}</span>
                    </div>
                )}
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
                                        value={formatMetricDisplay(
                                            storeData?.metrics?.rating,
                                            getMetricSourceLabel(storeData?.dataSources, 'rating'),
                                        )}
                                        sourceLabel={getMetricSourceLabel(storeData?.dataSources, 'rating') || undefined}
                                        trend="neutral"
                                        color="yellow"
                                    />
                                    <MetricCard
                                        icon={MessageSquare}
                                        label="Toplam Değerlendirme"
                                        value={formatMetricDisplay(
                                            storeData?.metrics?.totalReviews,
                                            getMetricSourceLabel(storeData?.dataSources, 'totalReviews'),
                                            (n) => n.toLocaleString('tr-TR'),
                                        )}
                                        sourceLabel={getMetricSourceLabel(storeData?.dataSources, 'totalReviews') || undefined}
                                        trend="neutral"
                                        color="green"
                                    />
                                    <MetricCard
                                        icon={DollarSign}
                                        label="Ortalama Fiyat"
                                        value={hasNumericValue(storeData?.metrics?.avgProductPrice)
                                            ? `${storeData.metrics.avgProductPrice.toLocaleString('tr-TR')}₺`
                                            : '--'}
                                        sourceLabel={getMetricSourceLabel(storeData?.dataSources, 'avgProductPrice') || undefined}
                                        trend="neutral"
                                        color="blue"
                                    />
                                    <MetricCard
                                        icon={ShoppingBag}
                                        label="Aktif Ürün"
                                        value={formatMetricDisplay(
                                            storeData?.metrics?.totalProducts,
                                            getMetricSourceLabel(storeData?.dataSources, 'totalProducts', ['productCount']),
                                        )}
                                        sourceLabel={getMetricSourceLabel(storeData?.dataSources, 'totalProducts', ['productCount']) || undefined}
                                        trend="neutral"
                                        color="purple"
                                    />
                                </div>

                                {/* SEO Panel */}
                                <SEOAnalysisPanel metrics={storeData?.metrics} dataSources={storeData?.dataSources} />

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

                                {/* SEO Recommendations — derived from real metrics */}
                                <div className={`${THEME.card} rounded-[32px] p-6 md:p-8`}>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6">SEO Önerileri</h3>
                                    <div className="space-y-4">
                                        {deriveSeoRecommendations(
                                            storeData?.metrics,
                                            storeData?.products?.length || products.length,
                                        ).map((item, i) => {
                                            const iconMap = {
                                                title: FileText,
                                                image: ImageIcon,
                                                price: DollarSign,
                                                stock: Package,
                                                reviews: MessageSquare,
                                                ok: CheckCircle,
                                            } as const;
                                            const ItemIcon = iconMap[item.iconKey];
                                            return (
                                            <motion.div
                                                key={item.title}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 transition-colors"
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.impact === 'Yüksek'
                                                    ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                                    : item.impact === 'Orta'
                                                        ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                                        : 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                                                    }`}>
                                                    <ItemIcon size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.impact === 'Yüksek'
                                                            ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                                            : item.impact === 'Orta'
                                                                ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                                                : 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                                                            }`}>
                                                            {item.impact} Etki
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                                                </div>
                                            </motion.div>
                                            );
                                        })}
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
                            <PortfolioDistributionPanel products={storeData?.products || products} />
                        )}

                        {activeTab === 'competitors' && storeData && (
                            <StoreComparisonPanel
                                currentUrl={url}
                                currentData={{ metrics: storeData.metrics, seoScore: score || 0 }}
                            />
                        )}

                        {activeTab === 'comparison' && storeData && (
                            <StoreComparisonPanel
                                currentUrl={url}
                                currentData={{ metrics: storeData.metrics, seoScore: score || 0 }}
                            />
                        )}

                        {activeTab === 'marketing' && (
                            <MarketingInsightsPanel
                                products={storeData?.products || products}
                                keywords={storeData?.keywords}
                                metrics={storeData?.metrics}
                            />
                        )}

                        {activeTab === 'reports' && (
                            <ExportReportsPanel data={exportPayload} />
                        )}

                        {activeTab === 'tools' && (
                            <AnalysisToolsPanel
                                platform={platform}
                                avgPrice={storeData?.metrics?.avgProductPrice}
                                exportData={exportPayload}
                                onRefresh={storeData && !premiumGate ? handleRefreshAnalysis : undefined}
                                refreshing={refreshing}
                            />
                        )}

                        <div className={`${THEME.card} rounded-[32px] p-6`}>
                            <button
                                type="button"
                                onClick={() => downloadTextReport(exportPayload)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                <Download size={18} />
                                Hızlı Rapor İndir
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            {/* Score Card */}
                            <div className={`${THEME.card} rounded-[32px] p-6 md:p-8 text-center`}>
                                <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">SEO Skoru</h3>
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
                                        {['Çoklu platform entegrasyonu', 'Otomatik stok senkronu', 'Gelişmiş raporlama', 'AI danışman (genişletilmiş)'].map((item, i) => (
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
    const showWelcome = searchParams.get('welcome') === '1';
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        }>
            <AnalysisContent initialUrl={url} showWelcome={showWelcome} />
        </Suspense>
    );
}
