"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    ShoppingCart, Package, TrendingUp, Sparkles, Zap, ArrowUpRight, ArrowDownRight,
    MoreVertical, ExternalLink, Calendar, Activity, AlertCircle, CheckCircle2, Clock,
    DollarSign, Users, Eye, Star, RefreshCw, Filter, Download, ChevronRight, Truck,
    Store, Globe, Target, Award, Bell, LineChart, PieChart, BarChart3, Layers, Box,
    CreditCard, Percent, Loader2, Wallet, TrendingDown, ShoppingBag, Boxes, Receipt,
    Calculator, Coins, BadgeDollarSign, CircleDollarSign, ArrowRight, ChevronDown,
    LayoutGrid, List, Settings, Search, Plus, Minus, AlertTriangle, Info, X,
    Brain, Lightbulb, Send, Bot, MessageSquare, Mic, Image, Wand2, ThumbsUp,
    ThumbsDown, Copy, Share2, Bookmark, Play, Pause, Volume2, Cpu, Network,
    Rocket, Shield, Lock, Key, Fingerprint, ScanLine, Database, Cloud, Server,
    GitBranch, Code, Terminal, Workflow, Repeat, RotateCcw, Maximize2, Minimize2,
    ChevronUp, Hash, AtSign, Smile, Paperclip, MoreHorizontal, Command, Keyboard
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import {
    useDashboardStats,
    usePlatformPerformance,
    useRecentOrders,
    useStockAlerts,
    useTopProducts,
    useAiInsights,
    usePerformanceTrend,
    useAiChat,
    useAiSummary,
    useMarketplaceHealth,
    useGoals,
    useActivityFeed,
} from '@/lib/hooks';
import QuickActions from '@/components/dashboard/QuickActions';
import { RealtimeNotificationToast, LivePerformanceIndicator } from '@/components/dashboard/RealtimeWidgets';
import GoalTracker from '@/components/dashboard/GoalTracker';
import MarketplaceHealthMap from '@/components/dashboard/MarketplaceHealthMap';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import { MorningBriefing } from '@/components/dashboard/MorningBriefing';
import { SalesRadar3D } from '@/components/dashboard/SalesRadar3D';
import { DefenseShieldWidget } from '@/components/dashboard/DefenseShieldWidget';
import { GhostStockWidget } from '@/components/dashboard/GhostStockWidget';

// ==================== TYPES ====================
interface AIInsight {
    id: string;
    type: 'opportunity' | 'warning' | 'prediction' | 'action' | 'trend';
    title: string;
    description: string;
    impact: string;
    impactValue: number;
    confidence: number;
    action: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    timestamp: Date;
    aiModel: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
    suggestions?: string[];
    data?: any;
}

interface PlatformData {
    name: string;
    revenue: number;
    orders: number;
    share: number;
    growth: number;
    profit: number;
    cost: number;
    aiScore: number;
    aiSuggestion: string;
}

interface StockAlert {
    product: string;
    sku: string;
    current: number;
    minimum: number;
    platform: string;
    urgency: 'critical' | 'warning';
    aiPrediction: string;
    daysUntilOut: number;
}

// ==================== CONSTANTS ====================
const platformColors: Record<string, { bg: string; text: string; gradient: string }> = {
    'Trendyol': { bg: 'bg-orange-500/10', text: 'text-orange-500', gradient: 'from-orange-500 to-orange-600' },
    'Hepsiburada': { bg: 'bg-red-500/10', text: 'text-red-500', gradient: 'from-red-500 to-red-600' },
    'Amazon': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', gradient: 'from-yellow-500 to-amber-600' },
    'N11': { bg: 'bg-purple-500/10', text: 'text-purple-500', gradient: 'from-purple-500 to-purple-600' },
    'Çiçeksepeti': { bg: 'bg-pink-500/10', text: 'text-pink-500', gradient: 'from-pink-500 to-pink-600' },
};

const AI_QUICK_PROMPTS = [
    { icon: TrendingUp, text: "Satışlarımı nasıl artırabilirim?", category: "sales" },
    { icon: DollarSign, text: "Fiyat optimizasyonu öner", category: "pricing" },
    { icon: Package, text: "Stok tahminlemesi yap", category: "inventory" },
    { icon: Target, text: "Rakip analizi", category: "competitor" },
    { icon: BarChart3, text: "Kârlılık analizi", category: "profit" },
    { icon: Sparkles, text: "Kampanya önerisi", category: "marketing" },
];

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (value: number | undefined | null) => {
    if (!value && value !== 0) return '--';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
};

const formatNumber = (value: number | undefined | null) => {
    if (!value && value !== 0) return '--';
    return new Intl.NumberFormat('tr-TR').format(value);
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Tamamlandı': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'Kargoda': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'Hazırlanıyor': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'Bekliyor': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'İptal': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
};

// ==================== AI CHAT COMPONENT ====================
const AIChatPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Merhaba! Ben PazarAI, yapay zeka destekli e-ticaret danışmanınız. 🚀\n\nSize satış optimizasyonu, stok yönetimi, fiyatlandırma stratejileri ve daha fazlası konusunda yardımcı olabilirim.\n\nBugün nasıl yardımcı olabilirim?',
            timestamp: new Date(),
            suggestions: ['Satış raporu göster', 'Stok durumunu analiz et', 'Rakip fiyatlarını karşılaştır', 'Kampanya önerisi al']
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiUrl}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || data.message || 'Bir hata oluştu.',
                timestamp: new Date(),
                suggestions: data.suggestions,
                data: data.data
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch {
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'API bağlantısı kurulamadı. Lütfen tekrar deneyin.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-surface border-l border-border shadow-2xl z-50 flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-purple-600 to-pink-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">PazarAI Asistan</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs text-white/80">GPT-4 Turbo • Çevrimiçi</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                            {message.role === 'assistant' && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">PazarAI</span>
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl ${message.role === 'user'
                                ? 'bg-primary text-white rounded-br-md'
                                : 'bg-background border border-border rounded-bl-md'
                                }`}>
                                <div className={`text-sm whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-foreground'}`}>
                                    {message.content}
                                </div>
                            </div>

                            {/* Suggestions */}
                            {message.suggestions && message.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {message.suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(suggestion)}
                                            className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            {message.role === 'assistant' && (
                                <div className="flex items-center gap-2 mt-2">
                                    <button className="p-1.5 hover:bg-background rounded-lg transition-colors">
                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                    <button className="p-1.5 hover:bg-background rounded-lg transition-colors">
                                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                    <button className="p-1.5 hover:bg-background rounded-lg transition-colors">
                                        <ThumbsDown className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <div className="px-4 py-3 bg-background border border-border rounded-2xl">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t border-border">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {AI_QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSend(prompt.text)}
                            className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium text-foreground hover:border-primary/50 transition-colors whitespace-nowrap"
                        >
                            <prompt.icon className="w-3.5 h-3.5 text-primary" />
                            {prompt.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2 bg-background border border-border rounded-2xl p-2">
                    <button className="p-2 hover:bg-surface rounded-xl transition-colors">
                        <Paperclip className="w-5 h-5 text-slate-400" />
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                        placeholder="Bir şey sorun..."
                        className="flex-1 bg-transparent text-foreground placeholder:text-slate-400 text-sm outline-none"
                    />
                    <button className="p-2 hover:bg-surface rounded-xl transition-colors">
                        <Mic className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                        onClick={() => handleSend(inputValue)}
                        disabled={!inputValue.trim()}
                        className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center mt-2">
                    PazarAI hatalar yapabilir. Önemli kararlar için verileri doğrulayın.
                </p>
            </div>
        </motion.div>
    );
};

// ==================== AI INSIGHT CARD ====================
const AIInsightCard = ({ insight, onAction }: { insight: AIInsight; onAction: () => void }) => {
    const getTypeStyles = () => {
        switch (insight.type) {
            case 'opportunity': return { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', icon: TrendingUp, iconColor: 'text-green-500' };
            case 'warning': return { bg: 'from-red-500/10 to-orange-500/10', border: 'border-red-500/20', icon: AlertTriangle, iconColor: 'text-red-500' };
            case 'prediction': return { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', icon: Brain, iconColor: 'text-blue-500' };
            case 'action': return { bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', icon: Zap, iconColor: 'text-purple-500' };
            case 'trend': return { bg: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-500/20', icon: LineChart, iconColor: 'text-amber-500' };
            default: return { bg: 'from-slate-500/10 to-slate-500/10', border: 'border-slate-500/20', icon: Lightbulb, iconColor: 'text-slate-500' };
        }
    };

    const styles = getTypeStyles();
    const IconComponent = styles.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`p-5 rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.bg} cursor-pointer transition-all hover:shadow-lg group`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-background/50 backdrop-blur ${styles.iconColor}`}>
                    <IconComponent size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-foreground">{insight.title}</h4>
                        {insight.priority === 'critical' && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">ACİL</span>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{insight.description}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${insight.impactValue >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {insight.impact}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Brain size={12} />
                                <span>%{insight.confidence} güven</span>
                            </div>
                        </div>
                        <button
                            onClick={onAction}
                            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            {insight.action}
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Model Badge */}
            <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Cpu size={10} />
                    <span>{insight.aiModel}</span>
                </div>
            </div>
        </motion.div>
    );
};

// ==================== ANIMATED COUNTER ====================
const AnimatedCounter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => {
        if (value >= 1000000) {
            return `${(latest / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
            return `${(latest / 1000).toFixed(0)}K`;
        }
        return Math.round(latest).toString();
    });

    useEffect(() => {
        const controls = animate(count, value, { duration: 2 });
        return controls.stop;
    }, [value, count]);

    return (
        <span>
            {prefix}
            <motion.span>{rounded}</motion.span>
            {suffix}
        </span>
    );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
function DashboardContent() {
    const router = useRouter();
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showAllInsights, setShowAllInsights] = useState(false);

    // API Hook'ları - called at top level
    const { data: apiStats, loading: statsLoading, refetch: refetchStats } = useDashboardStats(selectedPeriod);
    const { data: apiPlatforms, loading: platformsLoading } = usePlatformPerformance(selectedPeriod);
    const { data: apiRecentOrders, loading: ordersLoading } = useRecentOrders();
    const { data: apiStockAlerts, loading: stockLoading } = useStockAlerts();
    const { data: apiTopProducts, loading: productsLoading } = useTopProducts(selectedPeriod);
    const { data: apiAiInsights, loading: insightsLoading } = useAiInsights();
    const { data: apiTrend, loading: trendLoading } = usePerformanceTrend('revenue', selectedPeriod);
    const { data: apiAiSummary } = useAiSummary();
    const { data: apiMarketplaceHealth } = useMarketplaceHealth();
    const { data: apiGoals } = useGoals();
    const { data: apiActivityFeed } = useActivityFeed();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetchStats();
        } catch (e) {
            // ignore refresh error
        }
        setTimeout(() => setIsRefreshing(false), 800);
    };

    // API verileri
    const hasRealStats = apiStats && typeof apiStats === 'object' && Object.keys(apiStats).length > 0;
    const hasRealPlatforms = Array.isArray(apiPlatforms) && apiPlatforms.length > 0;
    const hasRealOrders = Array.isArray(apiRecentOrders) && apiRecentOrders.length > 0;
    const hasRealProducts = Array.isArray(apiTopProducts) && apiTopProducts.length > 0;
    const hasRealAlerts = Array.isArray(apiStockAlerts) && apiStockAlerts.length > 0;
    const hasRealInsights = Array.isArray(apiAiInsights) && apiAiInsights.length > 0;
    const hasRealTrend = Array.isArray(apiTrend) && apiTrend.length > 0;

    // AI Summary verileri
    const aiSummary = apiAiSummary as any;
    const statNotes = aiSummary?.statNotes || {};
    const predictionText = aiSummary?.predictionText;

    // Platform verilerini dönüştür (profit/margin API'den geliyor)
    const transformedPlatforms = hasRealPlatforms ? (apiPlatforms as any[]).filter(p => !!p).map(p => ({
        name: p.platform || p.name || 'Bilinmiyor',
        revenue: p.revenue || 0,
        orders: p.orders || 0,
        share: p.share || 0,
        growth: p.growth || 0,
        profit: p.profit || 0,
        cost: p.cost || 0,
        aiScore: p.aiScore || 0,
        aiSuggestion: p.aiSuggestion || '',
    })) : null;

    // Sipariş verilerini dönüştür
    const transformedOrders = hasRealOrders ? (apiRecentOrders as any[]).map(o => ({
        id: o.id || o.marketplaceOrderId,
        platform: o.platform,
        customer: o.customer || o.customerName,
        amount: o.price ?? o.totalAmount,
        status: o.status,
        time: o.createdAt ? new Date(o.createdAt).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--',
        items: o.items,
        aiFlag: null,
    })) : null;

    // Ürün verilerini dönüştür (profit/margin/trend/aiInsight API'den geliyor)
    const transformedProducts = hasRealProducts ? (apiTopProducts as any[]).map(p => ({
        name: p.name || p.title,
        sales: p.sales,
        revenue: p.revenue,
        profit: p.profit,
        margin: p.margin,
        trend: p.trend,
        aiInsight: p.aiInsight,
    })) : null;

    // Stok uyarılarını dönüştür (minimum/platform API'den geliyor)
    const transformedAlerts = hasRealAlerts ? (apiStockAlerts as any[]).map(a => ({
        product: a.productName,
        sku: a.sku,
        current: a.currentStock,
        minimum: a.minimumStock ?? a.reorderPoint,
        platform: Array.isArray(a.platforms) ? a.platforms.join(', ') : a.platform,
        urgency: a.status as 'critical' | 'warning',
        aiPrediction: a.daysUntilStockout !== undefined
            ? (a.daysUntilStockout === 0 ? 'STOKTA YOK' : `${a.daysUntilStockout} gün içinde tükenebilir`)
            : undefined,
        daysUntilOut: a.daysUntilStockout,
    })) : null;

    // Trend verisini dönüştür (profit/aiPrediction API'den geliyor)
    const transformedTrend = hasRealTrend ? (apiTrend as any[]).filter(t => !!t).slice(-7).map((t) => ({
        day: t.dayName || '--',
        revenue: t.revenue ?? t.value ?? 0,
        orders: t.orders || 0,
        profit: t.profit || 0,
        aiPrediction: t.aiPrediction ?? t.revenue ?? t.value ?? 0,
    })) : null;

    // Stats dönüştürme (tüm değerler API'den geliyor)
    const transformedStats = hasRealStats ? {
        totalRevenue: (apiStats as any).totalRevenue,
        revenueChange: (apiStats as any).periodComparison?.revenueChange,
        totalOrders: (apiStats as any).totalOrders,
        ordersChange: (apiStats as any).periodComparison?.ordersChange,
        avgOrderValue: (apiStats as any).averageOrderValue ?? ((apiStats as any).totalOrders > 0 ? (apiStats as any).totalRevenue / (apiStats as any).totalOrders : undefined),
        avgOrderChange: (apiStats as any).periodComparison?.avgOrderChange,
        totalProfit: (apiStats as any).netProfit,
        profitChange: (apiStats as any).periodComparison?.profitChange,
        profitMargin: (apiStats as any).profitMargin,
        marginChange: (apiStats as any).periodComparison?.marginChange,
        totalCost: (apiStats as any).totalCost,
        costChange: (apiStats as any).periodComparison?.costChange,
    } : null;

    const mainStats = transformedStats;
    const platformPerformance = transformedPlatforms || [];
    const recentOrders = transformedOrders || [];
    const stockAlerts = transformedAlerts || [];
    const topProducts = transformedProducts || [];
    const aiInsights = hasRealInsights ? (apiAiInsights as any[]).map((insight, i) => ({
        id: insight.id || `${i}`,
        type: (insight.type === 'pricing' ? 'opportunity' : insight.type === 'stock' ? 'warning' : insight.type === 'trend' ? 'trend' : insight.type === 'seo' ? 'action' : insight.type === 'campaign' ? 'prediction' : 'prediction') as 'opportunity' | 'warning' | 'prediction' | 'action' | 'trend',
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        impactValue: parseInt(String(insight.impact).replace(/[^\d-]/g, '')),
        confidence: insight.confidence,
        action: insight.actions?.[0],
        priority: insight.priority as 'critical' | 'high' | 'medium' | 'low',
        category: insight.category || insight.type,
        timestamp: new Date(insight.createdAt),
        aiModel: 'PazarAI',
    })) : [];
    const revenueTrend = transformedTrend || [];

    const data = {
        mainStats,
        platformPerformance,
        recentOrders,
        stockAlerts,
        topProducts,
        aiInsights,
        revenueTrend,
        costBreakdown: [],
        stockStats: {},
        aiMetrics: (apiStats as any)?.aiMetrics,
    };

    const isLoading = statsLoading || platformsLoading;

    const [showBriefing, setShowBriefing] = useState(true);

    return (
        <>
            <AnimatePresence>
                {showBriefing && <MorningBriefing onClose={() => setShowBriefing(false)} />}
            </AnimatePresence>
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed top-16 left-0 right-0 z-50">
                        <div className="h-1 bg-primary/20 overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ width: '40%' }}
                            />
                        </div>
                    </div>
                )}

                {/* Page Header with AI Status */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 lg:gap-3 mb-2 flex-wrap">
                            <h1 className="text-xl lg:text-3xl font-black text-foreground tracking-tight">Kontrol Merkezi</h1>
                            <div className="flex items-center gap-2 px-2.5 lg:px-3 py-1 lg:py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                                <Brain className="w-4 h-4 text-purple-500" />
                                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">AI Aktif</span>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium">Yapay zeka destekli satış, stok ve finans yönetimi</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Live Performance */}
                        <LivePerformanceIndicator />

                        {/* Period Selector */}
                        <div className="flex items-center bg-surface border border-border rounded-xl p-1">
                            {['24h', '7d', '30d', '90d'].map(period => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedPeriod === period
                                        ? 'bg-primary text-white'
                                        : 'text-slate-500 hover:text-foreground'
                                        }`}
                                >
                                    {period === '24h' ? '24 Saat' : period === '7d' ? '7 Gün' : period === '30d' ? '30 Gün' : '90 Gün'}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleRefresh}
                            className={`flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Yenile
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <Download className="w-4 h-4" /> Rapor İndir
                        </button>
                    </div>
                </div>

                {/* AI Metrics Bar */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-4 rounded-2xl shadow-xl shadow-purple-500/20"
                >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
                                <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm lg:text-base">PazarAI Performans</h3>
                                <p className="text-white/70 text-[10px] lg:text-xs">Yapay zeka sisteminiz aktif ve öğreniyor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 lg:gap-6 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
                            <div className="text-center flex-shrink-0">
                                <div className="text-lg lg:text-2xl font-black text-white">{formatNumber(data.aiMetrics?.totalPredictions)}</div>
                                <div className="text-[9px] lg:text-[10px] text-white/70 uppercase tracking-wider">Tahmin</div>
                            </div>
                            <div className="text-center flex-shrink-0">
                                <div className="text-lg lg:text-2xl font-black text-white">{data.aiMetrics?.accuracy !== undefined ? `%${data.aiMetrics.accuracy}` : '--'}</div>
                                <div className="text-[9px] lg:text-[10px] text-white/70 uppercase tracking-wider">Doğruluk</div>
                            </div>
                            <div className="text-center flex-shrink-0">
                                <div className="text-lg lg:text-2xl font-black text-white">{formatCurrency(data.aiMetrics?.savingsGenerated)}</div>
                                <div className="text-[9px] lg:text-[10px] text-white/70 uppercase tracking-wider">Tasarruf</div>
                            </div>
                            <div className="text-center flex-shrink-0">
                                <div className="text-lg lg:text-2xl font-black text-white">{data.aiMetrics?.automatedActions ?? '--'}</div>
                                <div className="text-[9px] lg:text-[10px] text-white/70 uppercase tracking-wider">Otomasyon</div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur">
                                    <Cpu className="w-4 h-4 text-white" />
                                    <span className="text-xs text-white font-medium">{data.aiMetrics?.activeModels ?? '--'} Model Aktif</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <QuickActions />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MarketplaceHealthMap data={apiMarketplaceHealth as any} />
                    <SalesRadar3D />
                </div>

                {/* Main Stats Cards */}
                {!mainStats ? (
                    <div className="p-4 rounded-xl bg-surface border border-border text-center">
                        <p className="text-sm font-semibold text-foreground">Özet metrik verisi bulunamadı</p>
                        <p className="text-xs text-slate-500 mt-1">API yanıtı geldiğinde kartlar gerçek verilerle dolacaktır.</p>
                    </div>
                ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                    {[
                        {
                            label: "Toplam Gelir",
                            value: mainStats.totalRevenue,
                            change: mainStats.revenueChange,
                            icon: DollarSign,
                            color: "from-green-500 to-emerald-600",
                            aiNote: statNotes.revenue || ''
                        },
                        {
                            label: "Sipariş",
                            value: mainStats.totalOrders,
                            change: mainStats.ordersChange,
                            icon: ShoppingCart,
                            color: "from-blue-500 to-cyan-600",
                            aiNote: statNotes.orders || ''
                        },
                        {
                            label: "Ort. Sepet",
                            value: mainStats.avgOrderValue,
                            change: mainStats.avgOrderChange,
                            icon: ShoppingBag,
                            color: "from-purple-500 to-pink-600",
                            aiNote: statNotes.avgOrder || ''
                        },
                        {
                            label: "Net Kâr",
                            value: mainStats.totalProfit,
                            change: mainStats.profitChange,
                            icon: TrendingUp,
                            color: "from-emerald-500 to-teal-600",
                            aiNote: statNotes.profit || ''
                        },
                        {
                            label: "Kâr Marjı",
                            value: mainStats.profitMargin,
                            change: mainStats.marginChange,
                            icon: Percent,
                            color: "from-amber-500 to-orange-600",
                            aiNote: statNotes.margin || '',
                            isPercentage: true
                        },
                        {
                            label: "Toplam Maliyet",
                            value: mainStats.totalCost,
                            change: mainStats.costChange !== undefined ? -mainStats.costChange : undefined,
                            icon: Receipt,
                            color: "from-rose-500 to-red-600",
                            invertTrend: true,
                            aiNote: statNotes.cost || ''
                        },
                    ].map((stat, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx}
                            className="bg-surface p-5 rounded-2xl border border-border relative overflow-hidden group hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${((stat.change ?? 0) !== 0 && (stat.invertTrend ? (stat.change ?? 0) > 0 : (stat.change ?? 0) >= 0))
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {stat.change !== undefined ? `${stat.change >= 0 ? '+' : ''}${stat.change.toFixed(1)}%` : '--'}
                                    {(stat.change !== undefined && (stat.invertTrend ? stat.change > 0 : stat.change >= 0))
                                        ? <ArrowUpRight className="w-3 h-3" />
                                        : <ArrowDownRight className="w-3 h-3" />}
                                </div>
                            </div>
                            <div className="text-xl font-black text-foreground tracking-tight relative z-10">
                                {stat.value === undefined || stat.value === null
                                    ? '--'
                                    : stat.isPercentage
                                        ? `%${Number(stat.value).toFixed(1)}`
                                        : formatCurrency(Number(stat.value))}
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 relative z-10">{stat.label}</div>

                            {/* AI Note */}
                            <div className="mt-2 pt-2 border-t border-border/50 relative z-10">
                                <div className="flex items-center gap-1 text-[10px] text-primary">
                                    <Sparkles className="w-3 h-3" />
                                    <span>{stat.aiNote}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                )}

                {/* AI Insights Section */}
                <div className="bg-surface p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-border">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <div className="flex items-center gap-2 lg:gap-3">
                            <div className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                <Brain size={20} className="lg:hidden" />
                                <Brain size={24} className="hidden lg:block" />
                            </div>
                            <div>
                                <h3 className="text-base lg:text-xl font-bold text-foreground">AI Önerileri & Tahminler</h3>
                                <p className="text-xs lg:text-sm text-slate-500">Yapay zeka tarafından tespit edilen fırsatlar</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{data.aiInsights.length} aktif öneri</span>
                            <button
                                onClick={() => setShowAllInsights(!showAllInsights)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                            >
                                {showAllInsights ? 'Daha Az' : 'Tümünü Gör'}
                                <ChevronRight className={`w-4 h-4 transition-transform ${showAllInsights ? 'rotate-90' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                        <AnimatePresence mode="popLayout">
                            {(showAllInsights ? data.aiInsights : data.aiInsights.slice(0, 4)).map((insight, idx) => (
                                <AIInsightCard
                                    key={insight.id}
                                    insight={insight}
                                    onAction={() => { /* TODO: implement insight action handler */ }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                    {/* Revenue & Profit Chart with AI Predictions */}
                    <div className="xl:col-span-2 bg-surface p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-foreground">Gelir & Kâr Analizi</h3>
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 rounded-lg">
                                        <Brain className="w-3 h-3 text-purple-500" />
                                        <span className="text-[10px] font-bold text-purple-500">AI Tahmin</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">Son 7 günlük performans + AI tahminleri</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                    <span className="text-slate-500">Gelir</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-slate-500">Kâr</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500/50 border-2 border-dashed border-purple-500" />
                                    <span className="text-slate-500">AI Tahmin</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-[200px] lg:h-[280px] relative">
                            <div className="absolute inset-0 flex items-end gap-2 px-4">
                                {data.revenueTrend.map((day, i) => {
                                    const maxRevenue = Math.max(...data.revenueTrend.map(d => Math.max(d.revenue, d.aiPrediction)));
                                    const revenueHeight = (day.revenue / maxRevenue) * 100;
                                    const profitHeight = (day.profit / maxRevenue) * 100;
                                    const predictionHeight = (day.aiPrediction / maxRevenue) * 100;

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                            <div className="w-full flex items-end justify-center gap-1 h-[220px] relative">
                                                {/* Tooltip */}
                                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-xl">
                                                    <div>Gelir: {formatCurrency(day.revenue)}</div>
                                                    <div>Kâr: {formatCurrency(day.profit)}</div>
                                                    <div className="text-purple-400 dark:text-purple-600">AI Tahmin: {formatCurrency(day.aiPrediction)}</div>
                                                    <div>Sipariş: {day.orders}</div>
                                                </div>

                                                {/* AI Prediction Line */}
                                                <div
                                                    className="absolute w-full border-t-2 border-dashed border-purple-500/50 left-0"
                                                    style={{ bottom: `${predictionHeight}%` }}
                                                />

                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${revenueHeight}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                                    className="flex-1 bg-primary/80 rounded-t-lg group-hover:bg-primary transition-colors"
                                                />
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${profitHeight}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                                    className="flex-1 bg-emerald-500/80 rounded-t-lg group-hover:bg-emerald-500 transition-colors"
                                                />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500">{day.day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AI Prediction Summary */}
                        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-xl">
                                    <Brain className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-foreground">
                                        <span className="font-bold">AI Tahmin:</span> {predictionText || 'Tahmin verisi bulunamadı'}
                                    </p>
                                </div>
                                <button className="px-4 py-2 bg-purple-500 text-white text-xs font-bold rounded-xl hover:bg-purple-600 transition-colors">
                                    Detaylı Tahmin
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Platform Performance with AI Scores */}
                    <div className="bg-surface p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-border">
                        <div className="flex items-center justify-between mb-4 lg:mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Platform AI Skorları</h3>
                                <p className="text-xs text-slate-500 mt-1">Yapay zeka optimizasyon puanları</p>
                            </div>
                            <Link href="/dashboard/stores" className="text-xs font-bold text-primary hover:underline">Detay →</Link>
                        </div>

                        <div className="space-y-3">
                            {data.platformPerformance.map((platform, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={platform.name}
                                    className="p-4 rounded-2xl bg-background/50 border border-border hover:border-primary/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${platformColors[platform.name]?.gradient || 'from-slate-500 to-slate-600'} text-white shadow-lg`}>
                                            <Store size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-foreground text-sm">{platform.name}</span>
                                                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${platform.aiScore >= 85 ? 'bg-green-500/10 text-green-500' :
                                                    platform.aiScore >= 70 ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    AI Skor: {platform.aiScore}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-500">{formatCurrency(platform.revenue)}</div>
                                        </div>
                                    </div>

                                    {/* AI Score Bar */}
                                    <div className="h-1.5 bg-background rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${platform.aiScore}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className={`h-full rounded-full ${platform.aiScore >= 85 ? 'bg-green-500' :
                                                platform.aiScore >= 70 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                        />
                                    </div>

                                    {/* AI Suggestion */}
                                    <div className="flex items-start gap-2 p-2 bg-purple-500/5 rounded-xl border border-purple-500/10">
                                        <Sparkles className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-[10px] text-purple-600 dark:text-purple-400">{platform.aiSuggestion}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Second Row - Orders & Stock with AI */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Recent Orders with AI Flags */}
                    <div className="bg-surface p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-border">
                        <div className="flex items-center justify-between mb-4 lg:mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Son Siparişler</h3>
                                <p className="text-xs text-slate-500 mt-1">AI destekli sipariş takibi</p>
                            </div>
                            <Link href="/dashboard/orders" className="text-xs font-bold text-primary hover:underline">Tümü →</Link>
                        </div>

                        <div className="space-y-3">
                            {data.recentOrders.map((order, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={order.id}
                                    className="p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${platformColors[order.platform]?.bg} ${platformColors[order.platform]?.text}`}>
                                                {order.platform}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">{order.customer || '--'} • {order.items ?? '--'} ürün</span>
                                        <span className="font-bold text-foreground">{formatCurrency(order.amount)}</span>
                                    </div>
                                    {order.aiFlag && (
                                        <div className="mt-2 flex items-center gap-2 p-2 bg-purple-500/5 rounded-lg border border-purple-500/10">
                                            <Brain className="w-3 h-3 text-purple-500 flex-shrink-0" />
                                            <span className="text-[10px] text-purple-600 dark:text-purple-400">{order.aiFlag}</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            {/* Stock Alerts Section */}
                            <div className="bg-surface p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-border h-full">
                                <div className="flex items-center justify-between mb-4 lg:mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">AI Stok Uyarıları</h3>
                                            <p className="text-xs text-slate-500">{data.stockAlerts.length} ürün dikkat gerektiriyor</p>
                                        </div>
                                    </div>
                                    <Link href="/dashboard/inventory" className="text-xs font-bold text-primary hover:underline">Tümü →</Link>
                                </div>

                                <div className="space-y-3">
                                    {data.stockAlerts.slice(0, 3).map((alert, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={i}
                                            className={`p-4 rounded-xl border ${alert.urgency === 'critical'
                                                ? 'bg-red-500/5 border-red-500/20'
                                                : 'bg-amber-500/5 border-amber-500/20'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${alert.urgency === 'critical'
                                                            ? 'bg-red-500/10 text-red-500'
                                                            : 'bg-amber-500/10 text-amber-500'
                                                            }`}>
                                                            {alert.urgency === 'critical' ? 'KRİTİK' : 'UYARI'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${platformColors[alert.platform]?.bg || 'bg-slate-500/10'} ${platformColors[alert.platform]?.text || 'text-slate-500'}`}>
                                                            {alert.platform || '--'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm font-bold text-foreground">{alert.product}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xl font-black ${alert.current === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                                                        {alert.current}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">/ {alert.minimum ?? '--'} min</div>
                                                </div>
                                            </div>

                                            {/* AI Prediction */}
                                            <div className="flex items-center justify-between p-2 bg-purple-500/5 rounded-lg border border-purple-500/10">
                                                <div className="flex items-center gap-2">
                                                    <Brain className="w-3 h-3 text-purple-500" />
                                                    <span className="text-[10px] text-purple-600 dark:text-purple-400">{alert.aiPrediction || 'Tahmin verisi yok'}</span>
                                                </div>
                                                <button className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                                    Sipariş Ver
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <GhostStockWidget />
                    </div>
                </div>

                {/* Top Products with AI Insights */}
                <div className="bg-surface p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-border">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <div>
                            <h3 className="text-base lg:text-lg font-bold text-foreground">En Çok Satan Ürünler</h3>
                            <p className="text-[10px] lg:text-xs text-slate-500 mt-1">Yapay zeka destekli strateji önerileri</p>
                        </div>
                        <Link href="/dashboard/products" className="text-xs font-bold text-primary hover:underline">Tüm Ürünler →</Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                        {data.topProducts.map((product, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={i}
                                className="p-4 rounded-2xl bg-background/50 border border-border hover:border-primary/30 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {i + 1}
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] font-bold ${product.trend === 'up' ? 'text-green-500' :
                                        product.trend === 'down' ? 'text-red-500' : 'text-slate-500'
                                        }`}>
                                        {product.trend === 'up' ? <TrendingUp size={12} /> :
                                            product.trend === 'down' ? <TrendingDown size={12} /> :
                                                <Minus size={12} />}
                                        {product.trend === 'up' ? 'Yükseliyor' :
                                            product.trend === 'down' ? 'Düşüyor' : 'Stabil'}
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-foreground mb-1 line-clamp-2">{product.name}</div>
                                <div className="text-xs text-slate-500 mb-3">{formatNumber(product.sales)} satış</div>
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <span className="text-slate-500">Gelir</span>
                                    <span className="font-bold text-foreground">{formatCurrency(product.revenue)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <span className="text-slate-500">Kâr</span>
                                    <span className="font-bold text-emerald-500">{formatCurrency(product.profit)}</span>
                                </div>

                                {/* AI Insight */}
                                <div className="p-2 bg-purple-500/5 rounded-xl border border-purple-500/10">
                                    <div className="flex items-center gap-1.5 text-[10px] text-purple-600 dark:text-purple-400">
                                        <Sparkles className="w-3 h-3 flex-shrink-0" />
                                        <span>{product.aiInsight || 'AI içgörüsü yok'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <GoalTracker goals={apiGoals as any} />
                        <DefenseShieldWidget />
                    </div>
                    <ActivityTimeline events={apiActivityFeed as any} />
                </div>
            </div>

            {/* Realtime Notification Toast */}
            <RealtimeNotificationToast />
        </>
    );
}

// Loading skeleton for dynamic import
function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-48 bg-surface rounded-lg" />
                    <div className="h-4 w-64 bg-surface rounded-lg mt-2" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-surface rounded-xl" />
                    <div className="h-10 w-24 bg-surface rounded-xl" />
                </div>
            </div>
            <div className="h-20 bg-surface rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-surface rounded-2xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-surface rounded-2xl" />
                <div className="h-80 bg-surface rounded-2xl" />
            </div>
        </div>
    );
}

// Dynamic import wrapper - prevents SSR to avoid hydration hook count mismatches
export default dynamic(() => Promise.resolve(DashboardContent), {
    ssr: false,
    loading: () => <DashboardSkeleton />,
});
