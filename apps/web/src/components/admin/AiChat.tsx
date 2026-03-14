"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles,
    X,
    Send,
    Bot,
    User,
    Loader2,
    Maximize2,
    Minimize2,
    ChevronDown,
    BrainCircuit,
    Zap
} from 'lucide-react';
import { adminApi } from '@/lib/admin-api';

interface Message {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    error?: boolean;
}

export const AiChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Merhaba! Ben JARVIS, satış asistanınız. Size nasıl yardımcı olabilirim? Bugünün satış verilerini veya stok durumunu sormak ister misiniz?',
            role: 'assistant',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await adminApi.sendMessageToAiAssistant(input, messages.map(m => ({
                role: m.role,
                content: m.text
            })));

            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                role: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen daha sonra tekrar deneyin.',
                role: 'assistant',
                timestamp: new Date(),
                error: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent animate-pulse" />
                <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-96 ${isMinimized ? 'h-14' : 'h-[500px]'} bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 z-50 overflow-hidden`}>
            {/* Header */}
            <div className="bg-purple-600 dark:bg-purple-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <BrainCircuit size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold leading-none">JARVIS</h3>
                        <span className="text-[10px] text-purple-200 font-medium tracking-wide flex items-center gap-1 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            AI SALES ASSISTANT
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user'
                                            ? 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                                            : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
                                        }`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user'
                                            ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-600/10'
                                            : msg.error
                                                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-tl-none'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                        <div className={`text-[9px] mt-1.5 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] flex gap-3">
                                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    <div className="px-4 py-2 border-t border-slate-100 dark:border-white/5 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
                        {['Satış Özeti', 'Stok Raporu', 'Tahminleme'].map(suggestion => (
                            <button
                                key={suggestion}
                                onClick={() => setInput(suggestion)}
                                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[10px] font-bold whitespace-nowrap hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-100 dark:border-white/5 shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Bir şeyler sor..."
                                className="w-full pl-4 pr-12 py-2.5 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-[13px] focus:ring-2 focus:ring-purple-500/20 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1.5 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
