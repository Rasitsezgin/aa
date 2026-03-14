"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, X, Send, Sparkles, Minimize2, Maximize2,
    RotateCcw, Zap, MessageSquare, TrendingUp,
    Package, ShoppingCart, DollarSign, Clipboard,
    ChevronDown, Loader2, ThumbsUp, ThumbsDown,
    ArrowRight, BarChart3, AlertTriangle, Users,
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: string[];
    type?: 'text' | 'briefing' | 'data';
    isLoading?: boolean;
}

interface QuickAction {
    id: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    action: string;
    color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    { id: 'daily', icon: Sparkles, label: 'Günlük Brifing', action: 'daily-summary', color: 'from-blue-500 to-purple-500' },
    { id: 'orders', icon: ShoppingCart, label: 'Bekleyen Siparişler', action: 'pending-orders', color: 'from-orange-500 to-red-500' },
    { id: 'revenue', icon: DollarSign, label: 'Bugünkü Ciro', action: 'revenue-today', color: 'from-green-500 to-emerald-500' },
    { id: 'stock', icon: Package, label: 'Düşük Stok', action: 'low-stock-alert', color: 'from-yellow-500 to-orange-500' },
    { id: 'top', icon: TrendingUp, label: 'En İyi Ürünler', action: 'top-products', color: 'from-pink-500 to-rose-500' },
    { id: 'competitor', icon: BarChart3, label: 'Rakip Analizi', action: 'competitor-check', color: 'from-cyan-500 to-blue-500' },
];

export default function AICopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pulseAnimation, setPulseAnimation] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pathname = usePathname();

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Load contextual suggestions when page changes
    useEffect(() => {
        loadSuggestions();
    }, [pathname]);

    // Pulse animation timer
    useEffect(() => {
        const timer = setTimeout(() => setPulseAnimation(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    const loadSuggestions = async () => {
        try {
            const res = await fetch('/api/ai/copilot/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({ currentPage: pathname }),
            });
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            }
        } catch {
            setSuggestions([
                'Satış performansımı analiz et',
                'Stok durumu nasıl?',
                'Bugünkü gündem ne?',
            ]);
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setShowQuickActions(false);
        setIsTyping(true);

        // Add loading message
        const loadingId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
            id: loadingId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isLoading: true,
        }]);

        try {
            const history = messages
                .filter(m => !m.isLoading)
                .slice(-10)
                .map(m => ({ role: m.role, content: m.content }));

            const res = await fetch('/api/ai/copilot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({ message: text.trim(), history, context: pathname }),
            });

            const data = res.ok
                ? await res.json()
                : { message: 'Şu anda yanıt veremiyorum. Lütfen tekrar deneyin.', suggestions: [] };

            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? { ...m, content: data.message, isLoading: false, suggestions: data.suggestions, type: data.type }
                    : m
            ));
        } catch {
            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? { ...m, content: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.', isLoading: false }
                    : m
            ));
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickAction = async (action: string) => {
        setShowQuickActions(false);
        setIsTyping(true);

        const loadingId = Date.now().toString();
        setMessages(prev => [...prev, {
            id: loadingId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isLoading: true,
        }]);

        try {
            const res = await fetch('/api/ai/copilot/quick-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({ action }),
            });

            const data = res.ok ? await res.json() : { message: 'Aksiyon yürütülemedi.' };

            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? { ...m, content: data.message, isLoading: false, type: data.type }
                    : m
            ));
        } catch {
            setMessages(prev => prev.map(m =>
                m.id === loadingId
                    ? { ...m, content: 'Bağlantı hatası.', isLoading: false }
                    : m
            ));
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setShowQuickActions(true);
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
        setUnreadCount(0);
        if (!isOpen) {
            setPulseAnimation(false);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    };

    const renderMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-700/50 px-1 py-0.5 rounded text-xs">$1</code>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={toggleOpen}
                        className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform group ${pulseAnimation ? 'animate-bounce' : ''}`}
                    >
                        <Bot size={24} className="group-hover:rotate-12 transition-transform" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                        {/* Glow ring */}
                        <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? 60 : 'auto',
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-[100] w-[420px] max-h-[680px] bg-[#0d1117] border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-purple-600/10 border-b border-slate-700/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Bot size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">PazarBot</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] text-green-400 font-bold">AI Asistan Aktif</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={clearChat} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all" title="Sohbeti Temizle">
                                    <RotateCcw size={14} />
                                </button>
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                                    {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                </button>
                                <button onClick={toggleOpen} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[440px] scrollbar-thin scrollbar-thumb-slate-700">
                                    {/* Welcome */}
                                    {messages.length === 0 && (
                                        <div className="text-center py-6">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                                <Bot size={28} className="text-primary" />
                                            </div>
                                            <h4 className="text-base font-black text-white mb-1">Merhaba! 👋</h4>
                                            <p className="text-xs text-slate-500 mb-6 max-w-[280px] mx-auto">
                                                E-ticaret operasyonlarınızda size yardımcı olabilirim. Satış analizi, stok yönetimi, fiyatlama ve daha fazlası...
                                            </p>

                                            {/* Quick Actions Grid */}
                                            {showQuickActions && (
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    {QUICK_ACTIONS.map(qa => (
                                                        <button
                                                            key={qa.id}
                                                            onClick={() => handleQuickAction(qa.action)}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-700/50 hover:border-primary/30 hover:bg-white/[0.02] transition-all group text-left"
                                                        >
                                                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${qa.color} flex items-center justify-center shrink-0`}>
                                                                <qa.icon size={13} className="text-white" />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{qa.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Contextual Suggestions */}
                                            {suggestions.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-2">Önerilen Sorular</p>
                                                    {suggestions.map((s, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => sendMessage(s)}
                                                            className="w-full text-left px-3 py-2 rounded-xl border border-slate-800 hover:border-primary/30 hover:bg-primary/5 text-xs text-slate-400 hover:text-white transition-all flex items-center gap-2"
                                                        >
                                                            <ArrowRight size={10} className="text-primary shrink-0" />
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Messages */}
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-last' : ''}`}>
                                                {msg.role === 'assistant' && (
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                                                            <Bot size={10} className="text-white" />
                                                        </div>
                                                        <span className="text-[10px] text-slate-600 font-bold">PazarBot</span>
                                                    </div>
                                                )}
                                                <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                                    msg.role === 'user'
                                                        ? 'bg-primary text-white rounded-br-md'
                                                        : 'bg-slate-800/80 text-slate-200 rounded-bl-md border border-slate-700/30'
                                                }`}>
                                                    {msg.isLoading ? (
                                                        <div className="flex items-center gap-2 py-1">
                                                            <Loader2 size={14} className="animate-spin text-primary" />
                                                            <span className="text-xs text-slate-400">Düşünüyorum...</span>
                                                        </div>
                                                    ) : (
                                                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                                                    )}
                                                </div>

                                                {/* Follow-up suggestions */}
                                                {msg.suggestions && msg.suggestions.length > 0 && !msg.isLoading && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {msg.suggestions.map((s, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => sendMessage(s)}
                                                                className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors"
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Feedback */}
                                                {msg.role === 'assistant' && !msg.isLoading && (
                                                    <div className="flex items-center gap-1 mt-1.5">
                                                        <button className="p-1 rounded text-slate-600 hover:text-green-400 hover:bg-green-500/10 transition-all">
                                                            <ThumbsUp size={11} />
                                                        </button>
                                                        <button className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                            <ThumbsDown size={11} />
                                                        </button>
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(msg.content)}
                                                            className="p-1 rounded text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                                                        >
                                                            <Clipboard size={11} />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="text-[9px] text-slate-700 mt-0.5 px-1">
                                                    {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 border-t border-slate-700/50 bg-[#0d1117] shrink-0">
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1 relative">
                                            <textarea
                                                ref={inputRef}
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Bir şey sorun..."
                                                rows={1}
                                                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 resize-none max-h-24 scrollbar-thin"
                                                style={{ minHeight: '40px' }}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLTextAreaElement;
                                                    target.style.height = '40px';
                                                    target.style.height = Math.min(target.scrollHeight, 96) + 'px';
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => sendMessage(input)}
                                            disabled={!input.trim() || isTyping}
                                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shrink-0"
                                        >
                                            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 px-1">
                                        <span className="text-[9px] text-slate-700">AI yanıtları bilgi amaçlıdır</span>
                                        <div className="flex items-center gap-1 text-[9px] text-slate-700">
                                            <Sparkles size={8} /> Gemini AI
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
