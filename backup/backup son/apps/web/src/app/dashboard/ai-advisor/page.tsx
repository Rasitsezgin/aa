"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Target,
    Lightbulb,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Zap,
    BarChart3,
    PieChart,
    LineChart,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    MessageSquare,
    Send,
    Bot,
    User,
    Clock,
    DollarSign,
    Package,
    ShoppingBag,
    Star,
    ThumbsUp,
    ThumbsDown,
    Loader2
} from 'lucide-react';
import { 
    useAiRecommendations, 
    usePerformanceScores, 
    useAiChat,
    AiRecommendation,
    PerformanceScores 
} from '@/lib/hooks';

const quickPrompts = [
    "Satışlarımı nasıl artırabilirim?",
    "Hangi ürünlerimi öne çıkarmalıyım?",
    "Rakip analizi yap",
    "Fiyat optimizasyonu öner"
];

const getIconForType = (type: string) => {
    switch (type) {
        case 'pricing': return <DollarSign size={20} />;
        case 'stock': return <Package size={20} />;
        case 'trend': return <TrendingUp size={20} />;
        case 'seo': return <Target size={20} />;
        case 'competitor': return <BarChart3 size={20} />;
        case 'marketing': return <Sparkles size={20} />;
        default: return <Lightbulb size={20} />;
    }
};

export default function AIAdvisorPage() {
    const { messages, isTyping, sendMessage, clearChat } = useAiChat();
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Gerçek veriler
    const { data: recommendations, loading: recsLoading, error: recsError, refetch: refetchRecs } = useAiRecommendations();
    const { data: scores, loading: scoresLoading, error: scoresError, refetch: refetchScores } = usePerformanceScores();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;
        sendMessage(text);
        setInputMessage('');
    };

    const handleRefresh = async () => {
        await Promise.all([refetchRecs(), refetchScores()]);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'border-red-500/30 bg-red-500/5';
            case 'high': return 'border-orange-500/30 bg-orange-500/5';
            case 'medium': return 'border-yellow-500/30 bg-yellow-500/5';
            default: return 'border-border bg-surface';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'critical': return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">KRİTİK</span>;
            case 'high': return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">YÜKSEK</span>;
            case 'medium': return <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">ORTA</span>;
            default: return null;
        }
    };

    // Performance insights from real data
    const performanceInsights = scores ? [
        { label: "Genel Skor", value: scores.overall, change: +5, trend: scores.overall >= 70 ? "up" : "down" },
        { label: "SEO Skoru", value: scores.seo, change: -3, trend: scores.seo >= 60 ? "up" : "down" },
        { label: "Fiyat Rekabeti", value: scores.pricing, change: +8, trend: "up" },
        { label: "Stok Sağlığı", value: scores.stockHealth, change: -12, trend: scores.stockHealth >= 60 ? "up" : "down" }
    ] : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">AI Danışman</h1>
                        <span className="px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">PRO</span>
                    </div>
                    <p className="text-slate-500 font-medium">Yapay zeka destekli satış optimizasyonu ve öneriler</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        disabled={recsLoading || scoresLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-foreground hover:bg-surface/80 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={recsLoading || scoresLoading ? 'animate-spin' : ''} /> 
                        Yeniden Analiz Et
                    </button>
                </div>
            </div>

            {/* Performance Scores */}
            {scoresLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-surface p-4 rounded-2xl border border-border animate-pulse">
                            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : scoresError ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
                    Performans skorları yüklenemedi. Lütfen tekrar deneyin.
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {performanceInsights.map((insight, idx) => (
                        <motion.div
                            key={insight.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-surface p-4 rounded-2xl border border-border"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-500 font-medium">{insight.label}</span>
                                <div className={`flex items-center gap-1 text-xs font-bold ${insight.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {insight.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {insight.change >= 0 ? '+' : ''}{insight.change}
                                </div>
                            </div>
                            <div className="text-2xl font-black text-foreground mb-2">{insight.value}</div>
                            <div className="h-2 bg-background rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${insight.value}%` }}
                                    transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                                    className={`h-full ${insight.value >= 80 ? 'bg-green-500' : insight.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Recommendations */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Sparkles size={18} className="text-primary" />
                        AI Önerileri
                        {recommendations && (
                            <span className="text-xs text-slate-500 font-normal">
                                ({recommendations.length} öneri)
                            </span>
                        )}
                    </h3>
                    
                    {recsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-2xl border border-border p-5 animate-pulse">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                                        <div className="flex-1">
                                            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
                                            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recsError ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
                            Öneriler yüklenemedi. Lütfen tekrar deneyin.
                        </div>
                    ) : recommendations && recommendations.length > 0 ? (
                        recommendations.map((rec: AiRecommendation, idx: number) => (
                            <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`rounded-2xl border p-5 ${getPriorityColor(rec.priority)}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${
                                        rec.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                                        rec.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                        {getIconForType(rec.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-foreground">{rec.title}</h4>
                                            {getPriorityBadge(rec.priority)}
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3">{rec.description}</p>
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Zap size={14} className="text-green-500" />
                                                    <span className="text-sm font-bold text-green-500">{rec.impact}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Target size={14} className="text-slate-400" />
                                                    <span className="text-xs text-slate-500">Güven: %{rec.confidence}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {rec.actions.map((action: string, i: number) => (
                                                    <button
                                                        key={i}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                            i === 0 
                                                                ? 'bg-primary text-white hover:bg-primary/90' 
                                                                : 'bg-background border border-border text-foreground hover:bg-surface'
                                                        }`}
                                                    >
                                                        {action}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <h4 className="font-bold text-foreground mb-2">Harika! Her şey yolunda</h4>
                            <p className="text-sm text-slate-500">
                                Şu an için acil bir öneri bulunmuyor. Sistem sürekli olarak mağazanızı analiz ediyor.
                            </p>
                        </div>
                    )}
                </div>

                {/* AI Chat */}
                <div className="bg-surface rounded-2xl border border-border flex flex-col h-[600px]">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                                <Bot size={18} className="text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-foreground text-sm">AI Asistan</div>
                                <div className="flex items-center gap-1 text-xs text-green-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Çevrimiçi
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={clearChat}
                            className="text-xs text-slate-500 hover:text-foreground transition-colors"
                        >
                            Temizle
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-3 rounded-2xl ${
                                    msg.role === 'user' 
                                        ? 'bg-primary text-white rounded-br-none' 
                                        : 'bg-background border border-border rounded-bl-none'
                                }`}>
                                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-background border border-border p-3 rounded-2xl rounded-bl-none">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    <div className="px-4 pb-2">
                        <div className="flex flex-wrap gap-2">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(prompt)}
                                    className="px-3 py-1.5 bg-background border border-border rounded-full text-xs text-slate-500 hover:text-foreground hover:border-primary/50 transition-all"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputMessage)}
                                placeholder="Bir soru sorun..."
                                disabled={isTyping}
                                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary/50 disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleSendMessage(inputMessage)}
                                disabled={!inputMessage.trim() || isTyping}
                                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
