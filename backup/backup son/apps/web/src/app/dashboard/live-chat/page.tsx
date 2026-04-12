"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Send, Search, Phone, Video, MoreVertical,
    Paperclip, Smile, Image, Star, Archive, Clock, Check, CheckCheck,
    User, Circle, ChevronDown
} from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'customer';
    time: string;
    status: 'sent' | 'delivered' | 'read';
}

interface Chat {
    id: string;
    customer: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
    platform: string;
    messages: Message[];
}

import { useLiveChat } from '@/lib/hooks';

export default function LiveChatPage() {
    const { data: chatData, loading } = useLiveChat();
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'online'>('all');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [chats, setChats] = useState<Chat[]>([]);

    useEffect(() => {
        if (chatData && Array.isArray(chatData)) {
            // Using a short timeout fixes the React synchronous state update warning during render phase
            const timer = setTimeout(() => {
                setChats(chatData as Chat[]);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [chatData]);

    const selectedChat = chats.find(c => c.id === (selectedChatId || chats[0]?.id));

    const filteredChats = chats.filter(chat => {
        if (searchTerm && !chat.customer.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filter === 'unread' && chat.unread === 0) return false;
        if (filter === 'online' && !chat.online) return false;
        return true;
    });

    const sendMessage = () => {
        if (!message.trim() || !selectedChat) return;

        const timestamp = Date.now();
        const newMsg: Message = {
            id: `m${timestamp}`,
            text: message,
            sender: 'me',
            time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
        };

        const updatedChats = chats.map(c => {
            if (c.id === selectedChat.id) {
                return { ...c, messages: [...c.messages, newMsg], lastMessage: message, time: 'Şimdi' };
            }
            return c;
        });

        setChats(updatedChats);
        setMessage('');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat]);

    const totalUnread = chats.reduce((s, c) => s + c.unread, 0);

    const quickReplies = [
        'Merhaba! Size nasıl yardımcı olabilirim?',
        'Sipariş numaranızı paylaşır mısınız?',
        'Siparişiniz kargoya verilmiştir.',
        'İade talebiniz onaylanmıştır.',
        'Stok durumunu kontrol ediyorum.',
        'Yardımcı olabildiysem ne mutlu! İyi günler.',
    ];

    return (
        <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-border bg-surface animate-in fade-in duration-500">
            {/* Sidebar */}
            <div className="w-80 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-indigo-500" />
                            Mesajlar
                            {totalUnread > 0 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{totalUnread}</span>
                            )}
                        </h2>
                    </div>
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Müşteri ara..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border focus:border-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-1">
                        {['all', 'unread', 'online'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as typeof filter)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-foreground'}`}
                            >
                                {f === 'all' ? 'Tümü' : f === 'unread' ? 'Okunmamış' : 'Çevrimiçi'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredChats.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`w-full p-4 flex items-start gap-3 hover:bg-background/50 transition-colors border-b border-border/50 ${selectedChat?.id === chat.id ? 'bg-indigo-500/5 border-l-2 border-l-indigo-500' : ''}`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                    {chat.avatar}
                                </div>
                                {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface" />}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-foreground">{chat.customer}</span>
                                    <span className="text-xs text-slate-500">{chat.time}</span>
                                </div>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{chat.lastMessage}</p>
                                <span className="text-[10px] px-1.5 py-0.5 bg-background rounded text-slate-500 mt-1 inline-block">{chat.platform}</span>
                            </div>
                            {chat.unread > 0 && (
                                <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-xs rounded-full flex-shrink-0">{chat.unread}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {!selectedChat ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <p className="text-sm">Bir konuşma seçin</p>
                    </div>
                ) : (
                <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                {selectedChat.avatar}
                            </div>
                            {selectedChat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">{selectedChat.customer}</h3>
                            <span className="text-xs text-slate-500">{selectedChat.online ? 'Çevrimiçi' : 'Çevrimdışı'} · {selectedChat.platform}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-foreground"><Star className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-foreground"><Archive className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-foreground"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedChat.messages.map((msg: Message) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-background text-foreground rounded-bl-md'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                                    <span className={`text-[10px] ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-500'}`}>{msg.time}</span>
                                    {msg.sender === 'me' && (
                                        msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-300" /> :
                                            msg.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-indigo-200" /> :
                                                <Check className="w-3 h-3 text-indigo-200" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <AnimatePresence>
                    {showQuickReplies && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border overflow-hidden"
                        >
                            <div className="p-3 flex flex-wrap gap-2">
                                {quickReplies.map((reply, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setMessage(reply); setShowQuickReplies(false); }}
                                        className="px-3 py-1.5 text-xs bg-background rounded-full text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors border border-border"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-foreground"><Paperclip className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-background rounded-lg text-slate-400 hover:text-foreground"><Image className="w-4 h-4" /></button>
                        <button
                            onClick={() => setShowQuickReplies(!showQuickReplies)}
                            className={`p-2 hover:bg-background rounded-lg transition-colors ${showQuickReplies ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-foreground'}`}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Mesajınızı yazın..."
                            className="flex-1 px-4 py-2.5 bg-background rounded-xl text-sm text-foreground placeholder:text-slate-500 border border-border focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!message.trim()}
                            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl text-white transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                </>
                )}
            </div>
        </div>
    );
}
