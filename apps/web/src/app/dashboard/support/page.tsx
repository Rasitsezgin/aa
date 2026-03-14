"use client";

import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    Send,
    Bot,
    MoreVertical,
    Paperclip,
    ExternalLink,
    ChevronRight,
    Sparkles,
    Plus,
    X
} from "lucide-react";
import { useSupport } from "@/lib/hooks";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface SupportMessage {
    id?: string;
    content: string;
    senderType: 'AGENT' | 'CUSTOMER';
    createdAt: string;
    aiSuggestion?: string;
}

interface SupportTicket {
    id: string;
    subject: string;
    customerName: string;
    status: 'OPEN' | 'PENDING' | 'RESOLVED';
    platform: string;
    updatedAt: string;
    orderId?: string;
    messages?: SupportMessage[];
}

export default function SupportHub() {
    const { getTickets, getTicketDetails, sendMessage, createTicket, loading } = useSupport();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [newTicketForm, setNewTicketForm] = useState({ subject: '', platform: 'TRENDYOL', message: '' });

    const loadTicketDetails = async (id: string) => {
        const response = await getTicketDetails(id) as SupportTicket;
        if (response) {
            setSelectedTicket(response);
            setMessages(response.messages || []);
        }
    };

    const loadTickets = async () => {
        const response = await getTickets() as SupportTicket[];
        if (response) {
            setTickets(response);
            if (response.length > 0 && !selectedTicket) {
                loadTicketDetails(response[0].id);
            }
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    // load functions hoisted above

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket) return;

        const content = newMessage;
        setNewMessage("");

        const response = await sendMessage({
            ticketId: selectedTicket.id,
            content,
            senderType: "AGENT"
        }) as SupportMessage;

        if (response) {
            setMessages(prev => [...prev, response]);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicketForm.subject.trim() || !newTicketForm.message.trim()) return;

        const response = await createTicket({
            subject: newTicketForm.subject,
            platform: newTicketForm.platform,
            message: newTicketForm.message
        });

        if (response) {
            setIsCreatingTicket(false);
            setNewTicketForm({ subject: '', platform: 'TRENDYOL', message: '' });
            loadTickets(); // Refresh tickets and select the new one
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "OPEN": return <Clock size={14} className="text-blue-500" />;
            case "PENDING": return <AlertCircle size={14} className="text-yellow-500" />;
            case "RESOLVED": return <CheckCircle2 size={14} className="text-green-500" />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            {/* Sidebar: Ticket List */}
            <div className="w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <MessageSquare className="text-orange-600" /> Destek Merkezi
                        </h1>
                        <button
                            onClick={() => setIsCreatingTicket(true)}
                            className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            title="Yeni Talep Oluştur"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Mesajlarda ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['all', 'OPEN', 'PENDING', 'RESOLVED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${statusFilter === status
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-orange-500/50'
                                    }`}
                            >
                                {status === 'all' ? 'Tümü' : status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                    {filteredTickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => loadTicketDetails(ticket.id)}
                            className={`w-full p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 group ${selectedTicket?.id === ticket.id
                                ? 'bg-white dark:bg-slate-800 border-orange-500 shadow-lg shadow-orange-500/5'
                                : 'bg-transparent border-transparent hover:bg-white dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                                }`}
                        >
                            <div className="flex justify-between items-start w-full">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${ticket.platform === 'TRENDYOL' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                    ticket.platform === 'AMAZON' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                        'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                    }`}>
                                    {ticket.platform}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">
                                    {format(new Date(ticket.updatedAt), 'HH:mm', { locale: tr })}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                                {ticket.subject}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <User size={12} />
                                <span className="truncate">{ticket.customerName}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content: Chat View */}
            {selectedTicket ? (
                <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/30">
                    {/* Chat Header */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    {selectedTicket.customerName}
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                        ID: #{selectedTicket.id.split('-')[0]}
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{selectedTicket.subject}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedTicket.orderId && (
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700">
                                    <ExternalLink size={14} /> Siparişi Gör
                                </button>
                            )}
                            <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-500">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={msg.id || idx} className={`flex ${msg.senderType === 'AGENT' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] space-y-2 ${msg.senderType === 'AGENT' ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.senderType === 'AGENT'
                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-none'
                                        : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                        {format(new Date(msg.createdAt), 'HH:mm', { locale: tr })} • {msg.senderType}
                                    </span>

                                    {msg.aiSuggestion && msg.senderType === 'CUSTOMER' && (
                                        <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-500/20 rounded-2xl space-y-3">
                                            <div className="flex items-center gap-2 text-orange-600">
                                                <Bot size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">AI Önerisi</span>
                                            </div>
                                            <p className="text-xs italic text-slate-600 dark:text-slate-300">"{msg.aiSuggestion}"</p>
                                            <button className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 uppercase tracking-wider">
                                                Taslağı Kullan <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity rounded-[2rem]" />
                            <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-3 border border-slate-200 dark:border-slate-700 focus-within:border-orange-500/50 transition-all flex items-end gap-3 shadow-sm">
                                <button className="p-3 text-slate-400 hover:text-orange-500 transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <textarea
                                    rows={1}
                                    placeholder="Mesajınızı buraya yazın..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-slate-900 dark:text-white resize-none max-h-48 scrollbar-none"
                                />
                                <div className="flex items-center gap-2">
                                    <button className="p-3 text-orange-600 hover:bg-orange-500/10 rounded-2xl transition-all" title="AI Yardımı">
                                        <Sparkles size={20} />
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">Shift + Enter ile alt satıra geçebilirsiniz</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/20 dark:bg-slate-900/20 pb-12">
                    <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800/50 rounded-[3rem] flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <MessageSquare size={48} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Destek Merkezi</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Mesajları görüntülemek için sol taraftan bir görüşme seçin.</p>
                </div>
            )}

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {isCreatingTicket && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare className="text-orange-600" size={20} /> Yeni Destek Talebi
                                </h3>
                                <button
                                    onClick={() => setIsCreatingTicket(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Platform</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['TRENDYOL', 'HEPSIBURADA', 'AMAZON'].map(platform => (
                                                <button
                                                    key={platform}
                                                    type="button"
                                                    onClick={() => setNewTicketForm(prev => ({ ...prev, platform }))}
                                                    className={`px-3 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all ${newTicketForm.platform === platform
                                                        ? platform === 'TRENDYOL' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 border-orange-500/30' :
                                                            platform === 'AMAZON' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                                                                'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-500/30'
                                                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                >
                                                    {platform}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Konu Başığı</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTicketForm.subject}
                                            onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                                            placeholder="Talebinizi özetleyen kısa bir başlık..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Mesajınız</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={newTicketForm.message}
                                            onChange={(e) => setNewTicketForm(prev => ({ ...prev, message: e.target.value }))}
                                            placeholder="Detaylı olarak sorununuzu veya talebinizi açıklayın..."
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingTicket(false)}
                                        className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !newTicketForm.subject || !newTicketForm.message}
                                        className="px-6 py-3 bg-orange-600 hover:bg-orange-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
                                    >
                                        <Send size={16} /> Gönder
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
