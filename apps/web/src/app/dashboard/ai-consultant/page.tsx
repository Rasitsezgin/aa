"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Send, Sparkles, TrendingUp, AlertTriangle,
    CheckCircle2, Info, RefreshCw, Plus, Trash2,
    MessageSquare, Zap, Lightbulb, ArrowRight, User,
    ChevronDown, Eye, Share2, Download, ShoppingCart
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'insight' | 'warning' | 'suggestion';
}

export default function AIConsultantPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Merhaba! Ben Pazaryönetimi AI asistanınız. Bugün mağaza performansınızı artırmak için neler yapabiliriz? Örneğin: 'Trendyol satışlarımı nasıl artırırım?' veya 'Rakiplerimin fiyat politikası nedir?' gibi sorular sorabilirsiniz.",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/ai/copilot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-tenant-id': 'default' },
                body: JSON.stringify({ message: userMsg.content, context: '/dashboard/ai-consultant' }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.error || 'Copilot backend kullanilamiyor');
            }

            const data = await res.json();
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message || 'Yanit alinamadi',
                timestamp: new Date(),
                type: 'suggestion',
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err: any) {
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: err?.message || 'Copilot servisine baglanilamadi',
                timestamp: new Date(),
                type: 'warning',
            };
            setMessages(prev => [...prev, aiMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Bot className="w-8 h-8 text-indigo-500" /> AI Danışman
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Veri odaklı kararlar için yapay zeka destekli analizler</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-surface border border-border rounded-xl text-slate-500 hover:text-foreground transition-all">
                        <Share2 size={18} />
                    </button>
                    <button className="p-2.5 bg-surface border border-border rounded-xl text-slate-500 hover:text-foreground transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <Plus size={16} /> Yeni Sohbet
                    </button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Chat Section */}
                <div className="flex-1 flex flex-col bg-surface rounded-3xl border border-border overflow-hidden shadow-sm relative">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-primary border-primary Shadow-lg shadow-primary/20' : 'bg-background border-border shadow-sm'}`}>
                                        {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-indigo-500" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl space-y-2 ${msg.role === 'user' ? 'bg-primary text-white font-medium' : 'bg-background border border-border text-foreground shadow-sm'}`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        {msg.type === 'suggestion' && (
                                            <div className="pt-2 flex gap-2">
                                                <button className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                                                    <Zap size={12} /> Fiyatı Güncelle
                                                </button>
                                                <button className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                                                    Analiz İste
                                                </button>
                                            </div>
                                        )}
                                        <div className={`text-[9px] font-bold opacity-50 ${msg.role === 'user' ? 'text-white' : 'text-slate-500'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center shrink-0">
                                    <Bot size={20} className="text-indigo-500" />
                                </div>
                                <div className="p-4 bg-background border border-border rounded-2xl flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-background border-t border-border shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pazaryeri stratejiniz hakkında soru sorun..."
                                className="w-full bg-surface border border-border rounded-2xl py-4 pl-6 pr-14 text-sm text-foreground focus:outline-none focus:border-indigo-500/50 shadow-inner"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <div className="mt-3 flex gap-2 justify-center opacity-70">
                            {["Satışları artır", "Rekabet analizi", "Stok Tahmini"].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setInput(tag)}
                                    className="text-[10px] font-black text-slate-500 bg-surface border border-border px-3 py-1 rounded-full uppercase tracking-widest hover:border-indigo-500 transition-colors"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Insights Sidebar */}
                <div className="w-80 hidden xl:flex flex-col gap-6 overflow-y-auto">
                    <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Lightbulb size={16} className="text-amber-500" /> Günün İpuçları
                        </h3>
                        <div className="space-y-4">
                            <div className="text-xs font-bold text-foreground leading-relaxed">
                                Amazon&apos;da Buy Box kazanma oranınız geçen haftaya göre %12 düştü. Fiyatlarınızı kontrol edin.
                            </div>
                            <div className="h-px bg-border" />
                            <div className="text-xs font-bold text-foreground leading-relaxed">
                                Hafta sonu yaklaşırken Trendyol&apos;da &apos;Ev &amp; Yaşam&apos; kategorisinde %20 artış bekleniyor.
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-600/20 space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-100">
                            <TrendingUp size={14} /> Fırsat Analizi
                        </div>
                        <h4 className="text-lg font-black leading-tight">Yüksek Kar Potansiyeli</h4>
                        <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                            Mevcut stoğunuzdaki 4 üründe hiç rakip yok. Fiyatlarınızı %15 artırarak marjınızı yükseltebilirsiniz.
                        </p>
                        <button className="w-full py-2.5 bg-white text-indigo-600 font-black rounded-lg text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                            Detayları İncele
                        </button>
                    </div>

                    <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Özet Rapor</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Gösterim', val: '+%14', icon: Eye, color: 'text-blue-500' },
                                { label: 'Satış', val: '+%4', icon: ShoppingCart, color: 'text-emerald-500' },
                                { label: 'Problem', val: '2', icon: AlertTriangle, color: 'text-amber-500' },
                            ].map(r => (
                                <div key={r.label} className="flex items-center justify-between p-2 bg-background rounded-xl border border-border/50">
                                    <div className="flex items-center gap-2">
                                        <r.icon size={14} className={r.color} />
                                        <span className="text-[10px] font-bold text-slate-500">{r.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-foreground">{r.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
