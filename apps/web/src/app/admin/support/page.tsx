"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, CheckCircle, AlertCircle, Sparkles, Send, MoreVertical, Paperclip } from 'lucide-react';
import { useSupport } from '@/lib/hooks';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SupportMessage {
    id?: string;
    content: string;
    senderType: 'AGENT' | 'CUSTOMER';
    createdAt: string;
}

interface SupportTicket {
    id: string;
    subject: string;
    customerName: string;
    company?: string;
    status: 'OPEN' | 'PENDING' | 'RESOLVED';
    priority?: string;
    platform: string;
    updatedAt: string;
    messages?: SupportMessage[];
}

export default function SupportPage() {
    const { getTickets, getTicketDetails, sendMessage, loading } = useSupport();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const loadTickets = async () => {
        // use demo-tenant-id or admin to get all. In our mock it returns all sorted by date.
        const response = await getTickets('admin') as SupportTicket[];
        if (response) {
            setTickets(response);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTicketDetails = async (id: string) => {
        const response = await getTicketDetails(id, 'admin') as SupportTicket;
        if (response) {
            setSelectedTicket(response);
            setMessages(response.messages || []);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket) return;

        const content = newMessage;
        setNewMessage("");

        const response = await sendMessage({
            ticketId: selectedTicket.id,
            content,
            senderType: "AGENT",
            tenantId: 'admin'
        }) as SupportMessage;

        if (response) {
            setMessages(prev => [...prev, response]);
            loadTickets(); // fresh ticket list
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openCount = tickets.filter(t => t.status === 'OPEN').length;
    const pendingCount = tickets.filter(t => t.status === 'PENDING').length;
    const closedCount = tickets.filter(t => t.status === 'RESOLVED').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Destek Merkezi</h1>
                    <p className="text-slate-600 dark:text-slate-500 font-medium">Kullanıcı taleplerini yanıtlayın ve yönetin.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500/10 dark:bg-white/5 hover:bg-blue-500/20 dark:hover:bg-white/10 text-blue-600 dark:text-white rounded-xl font-bold text-xs transition-colors border border-blue-500/20 dark:border-white/10">
                        Açık ({openCount})
                    </button>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs transition-colors border border-slate-200 dark:border-white/10">
                        Bekleyen ({pendingCount})
                    </button>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs transition-colors border border-slate-200 dark:border-white/10">
                        Kapalı ({closedCount})
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
                {/* Ticket List */}
                <div className="col-span-4 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden shadow-sm dark:shadow-none">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                        <input
                            type="text"
                            placeholder="Talep ara..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-10 bg-slate-100 dark:bg-black/20 rounded-xl px-4 text-xs font-bold text-foreground outline-none border border-transparent focus:border-blue-500/30" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {filteredTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => loadTicketDetails(ticket.id)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/5 ${selectedTicket?.id === ticket.id
                                    ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-500/30 shadow-lg shadow-blue-900/10'
                                    : 'bg-transparent border-slate-200 dark:border-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">#{ticket.id}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">
                                        {format(new Date(ticket.updatedAt), 'HH:mm', { locale: tr })}
                                    </span>
                                </div>
                                <h4 className={`text-sm font-bold mb-1 ${selectedTicket?.id === ticket.id ? 'text-foreground' : 'text-slate-700 dark:text-slate-300'}`}>{ticket.subject}</h4>
                                <div className="flex items-center gap-2">
                                    <User size={12} className="text-slate-500" />
                                    <span className="text-xs text-slate-500 font-medium">{ticket.customerName} - {ticket.company || ticket.platform}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket Detail / Chat */}
                <div className="col-span-8 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden relative shadow-sm dark:shadow-none">
                    {selectedTicket ? (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-white/[0.02]">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-foreground">#{selectedTicket.id} - {selectedTicket.subject}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${selectedTicket.priority === 'high' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'}`}>
                                            {selectedTicket.priority || 'Normal'} Öncelik
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{selectedTicket.customerName} • {selectedTicket.company || selectedTicket.platform}</p>
                                </div>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {messages.map((msg, idx) => (
                                    <div key={msg.id || idx} className={`flex gap-4 ${msg.senderType === 'AGENT' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.senderType === 'AGENT' ? 'bg-blue-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-white'}`}>
                                            {msg.senderType === 'AGENT' ? <Sparkles size={14} className="text-white" /> : (selectedTicket.customerName?.[0] || 'C')}
                                        </div>
                                        <div className={`flex-1 space-y-2 flex flex-col ${msg.senderType === 'AGENT' ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-foreground">{msg.senderType === 'AGENT' ? 'AI Asistan / Yönetici' : selectedTicket.customerName}</span>
                                                <span className="text-xs text-slate-500">{format(new Date(msg.createdAt), 'HH:mm', { locale: tr })}</span>
                                            </div>
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.senderType === 'AGENT'
                                                ? 'rounded-tr-none bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-100'
                                                : 'rounded-tl-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                <div className="relative">
                                    <textarea
                                        placeholder="Yanıtınızı yazın..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                        className="w-full h-32 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 resize-none pr-32" />
                                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">
                                            <Paperclip size={18} />
                                        </button>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={loading || !newMessage.trim()}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all">
                                            Gönder <Send size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                            <MessageSquare size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">Bir talep seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
