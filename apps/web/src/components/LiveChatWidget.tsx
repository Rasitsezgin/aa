"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Minimize2, Maximize2, Bot, User,
    Phone, Mail, HelpCircle
} from 'lucide-react';

interface Message {
    id: string;
    type: 'bot' | 'user';
    content: string;
    timestamp: Date;
}

const quickReplies = [
    'Fiyatlar hakkında bilgi',
    'Demo talep etmek istiyorum',
    'Teknik destek',
    'Entegrasyonlar hakkında',
];

export default function LiveChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'bot',
            content: 'Merhaba! 👋 Ben Pazaryonetimi\'nin asistanıyım. Size nasıl yardımcı olabilirim?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Add user message
        const now = new Date();
        const userMessage: Message = {
            id: `user-${now.getTime()}`,
            type: 'user',
            content: content.trim(),
            timestamp: now
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        setIsTyping(true);
        try {
            const res = await fetch('/api/ai/copilot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-tenant-id': 'default',
                },
                body: JSON.stringify({ message: content, context: '/live-chat-widget' }),
            });

            let reply = 'Canli destek servisi su anda yanit veremiyor. Lutfen daha sonra tekrar deneyin.';
            if (res.ok) {
                const data = await res.json();
                reply = typeof data?.message === 'string' && data.message.trim()
                    ? data.message
                    : reply;
            }

            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                type: 'bot',
                content: reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch {
            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                type: 'bot',
                content: 'Canli destek servisine ulasilamadi. Lutfen tekrar deneyin.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleQuickReply = (reply: string) => {
        sendMessage(reply);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-32 lg:bottom-6 right-6 z-[110] w-16 h-16 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl flex items-center justify-center hover:shadow-emerald-500/30 transition-shadow"
                    >
                        <MessageCircle size={28} />
                        {/* Notification Dot */}
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
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
                            height: isMinimized ? 'auto' : 500
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-32 lg:bottom-6 right-6 z-[110] w-[380px] max-w-[calc(100vw-48px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Pazaryonetimi</h3>
                                        <div className="flex items-center gap-1 text-xs text-white/80">
                                            <span className="w-2 h-2 rounded-full bg-green-400" />
                                            Çevrimiçi
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsMinimized(!isMinimized)}
                                        className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                    >
                                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chat Content */}
                        <AnimatePresence>
                            {!isMinimized && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="flex-1 flex flex-col overflow-hidden"
                                >
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`flex items-end gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                                    {/* Avatar */}
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.type === 'bot'
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                        : 'bg-slate-200 dark:bg-slate-700'
                                                        }`}>
                                                        {message.type === 'bot' ? (
                                                            <Bot size={16} className="text-white" />
                                                        ) : (
                                                            <User size={16} className="text-slate-600 dark:text-slate-400" />
                                                        )}
                                                    </div>

                                                    {/* Message Bubble */}
                                                    <div>
                                                        <div className={`p-3 rounded-2xl ${message.type === 'bot'
                                                            ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-md'
                                                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-md'
                                                            }`}>
                                                            <p className="text-sm">{message.content}</p>
                                                        </div>
                                                        <p className={`text-xs text-slate-400 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                                                            {formatTime(message.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Typing Indicator */}
                                        {isTyping && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center gap-2"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                                    <Bot size={16} className="text-white" />
                                                </div>
                                                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/10 rounded-bl-md">
                                                    <div className="flex gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Quick Replies */}
                                    {messages.length <= 2 && (
                                        <div className="px-4 pb-2">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Hızlı Yanıtlar:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {quickReplies.map((reply, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleQuickReply(reply)}
                                                        className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                                                    >
                                                        {reply}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Input */}
                                    <div className="p-4 border-t border-slate-200 dark:border-white/10">
                                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                placeholder="Mesajınızı yazın..."
                                                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!inputValue.trim()}
                                                className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-emerald-700 hover:to-teal-700 transition-all"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </form>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-4 pb-3 flex items-center justify-center gap-4 text-xs text-slate-400">
                                        <a href="tel:+902121234567" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                                            <Phone size={12} />
                                            Ara
                                        </a>
                                        <a href="mailto:destek@pazaryonetimi.com" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                                            <Mail size={12} />
                                            E-posta
                                        </a>
                                        <a href="/support" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                                            <HelpCircle size={12} />
                                            Yardım
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
