"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Send, Sparkles, RotateCcw, Copy, ThumbsUp, ThumbsDown,
    MessageSquare, Package, TrendingUp, HelpCircle, Zap, Loader2
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: string[];
}

const SUGGESTED_QUESTIONS = [
    { icon: Package, text: 'En çok satan ürünlerim hangileri?', category: 'Ürünler' },
    { icon: TrendingUp, text: 'Bu ayki satış trendim nasıl?', category: 'Analiz' },
    { icon: HelpCircle, text: 'Stoku azalan ürünlerimi göster', category: 'Stok' },
    { icon: Zap, text: 'Kârlılığımı nasıl artırabilirim?', category: 'Strateji' },
];

export default function AIChatbotPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Merhaba! 👋 Ben PazarYönetimi AI asistanınızım. Satışlarınız, ürünleriniz, stok durumu ve stratejiler hakkında sorular sorabilirsiniz. Size nasıl yardımcı olabilirim?',
            timestamp: new Date(),
            suggestions: SUGGESTED_QUESTIONS.map(q => q.text),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const msgText = text || input;
        if (!msgText.trim()) return;

        const baseTime = 1704110400000; // 2024-01-01 12:00:00
        const userMsg: ChatMessage = {
            id: `u${baseTime + messages.length}`,
            role: 'user',
            content: msgText,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/ai/copilot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({ message: msgText, context: '/dashboard/ai-assistant' }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.error || 'Copilot backend kullanilamiyor');
            }

            const data = await res.json();
            const aiMsg: ChatMessage = {
                id: `a${baseTime + messages.length + 1}`,
                role: 'assistant',
                content: data.message || 'Yanit alinamadi',
                timestamp: new Date(),
                suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            const aiMsg: ChatMessage = {
                id: `a${baseTime + messages.length + 1}`,
                role: 'assistant',
                content: error?.message || 'Copilot servisine baglanilamadi',
                timestamp: new Date(),
                suggestions: [],
            };
            setMessages(prev => [...prev, aiMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const copyMessage = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        AI Asistan
                    </h1>
                    <p className="text-slate-500 mt-1">Verileriniz hakkında sorular sorun, analizler isteyin</p>
                </div>
                <button
                    onClick={() => setMessages([messages[0]])}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm text-slate-300 hover:text-foreground transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Yeni Sohbet
                </button>
            </div>

            {/* Chat */}
            <div className="flex-1 bg-surface rounded-2xl border border-border flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map(msg => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] ${msg.role === 'user' ? '' : ''}`}>
                                <div className="flex items-start gap-3">
                                    {msg.role === 'assistant' && (
                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex-shrink-0">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-background text-foreground rounded-bl-md'}`}>
                                            <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 px-1">
                                            <span className="text-[10px] text-slate-500">{msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            {msg.role === 'assistant' && (
                                                <>
                                                    <button onClick={() => copyMessage(msg.content)} className="p-1 hover:bg-background rounded text-slate-500 hover:text-foreground"><Copy className="w-3 h-3" /></button>
                                                    <button className="p-1 hover:bg-background rounded text-slate-500 hover:text-emerald-400"><ThumbsUp className="w-3 h-3" /></button>
                                                    <button className="p-1 hover:bg-background rounded text-slate-500 hover:text-red-400"><ThumbsDown className="w-3 h-3" /></button>
                                                </>
                                            )}
                                        </div>
                                        {/* Suggestions */}
                                        {msg.suggestions && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {msg.suggestions.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => sendMessage(s)}
                                                        className="px-3 py-1.5 text-xs bg-background rounded-full text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors border border-border"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="px-4 py-3 bg-background rounded-2xl rounded-bl-md">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                    <span className="text-sm text-slate-400">Analiz ediliyor...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length <= 1 && (
                    <div className="px-6 pb-4">
                        <div className="grid grid-cols-2 gap-3">
                            {SUGGESTED_QUESTIONS.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q.text)}
                                    className="p-4 bg-background rounded-xl border border-border hover:border-indigo-500/50 text-left transition-all group"
                                >
                                    <q.icon className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <div className="text-sm text-foreground">{q.text}</div>
                                    <div className="text-xs text-slate-500 mt-1">{q.category}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Sorunuzu yazın... (örn: 'Bu ayki en çok satan ürünüm ne?')"
                            className="flex-1 px-4 py-3 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isTyping}
                            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 rounded-xl text-white transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 text-center">AI asistan verilerinizi analiz ederek öneriler sunar. Sonuçlar tahminidir.</p>
                </div>
            </div>
        </div>
    );
}
