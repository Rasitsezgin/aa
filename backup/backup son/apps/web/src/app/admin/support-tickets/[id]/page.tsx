"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, LifeBuoy, AlertTriangle, Loader2, Send, CheckCircle, Clock, MoreVertical, Shield
} from 'lucide-react';
import Link from 'next/link';

export default function SupportTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    if (!params) return null;
    const ticketId = params.id as string;

    const [replyContent, setReplyContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: ticket, isLoading, error } = useQuery({
        queryKey: ['admin-support-ticket', ticketId],
        queryFn: () => adminApi.getSupportTicketDetail(ticketId),
    });

    const replyMutation = useMutation({
        mutationFn: () => adminApi.replyToSupportTicket(ticketId, replyContent),
        onSuccess: () => {
            setReplyContent('');
            queryClient.invalidateQueries({ queryKey: ['admin-support-ticket', ticketId] });
            queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
        }
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (ticket?.messages) {
            scrollToBottom();
        }
    }, [ticket?.messages]);

    const formatDate = (ds: string) => {
        if (!ds) return '';
        return new Date(ds).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Destek talebi yükleniyor...</p>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="text-center py-20">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 font-bold">Talep bilgileri bulunamadı.</p>
                <button onClick={() => router.back()} className="mt-4 text-blue-500 text-sm font-bold">Geri Dön</button>
            </div>
        );
    }

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        replyMutation.mutate();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20 h-full flex flex-col">
            {/* Top Header & Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin/support-tickets')}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight break-all">
                            {ticket.subject}
                        </h1>
                        <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full shrink-0 ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                            {ticket.status}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {ticket.customerName || 'Müşteri'} • <Link href={`/admin/customers/${ticket.customerEmail}`} className="hover:underline hover:text-blue-500 transition-colors text-blue-600">{ticket.customerEmail}</Link>
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full min-h-0">

                {/* Left/Main Column: Chat Interface */}
                <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm min-h-[500px] max-h-[750px] overflow-hidden">

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                        {ticket.messages?.map((msg: any) => {
                            const isAdmin = msg.senderType === 'AGENT' || msg.senderType === 'SYSTEM';

                            return (
                                <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 mb-1.5 px-1`}>
                                        <span className="text-xs font-bold text-slate-400">
                                            {isAdmin ? 'Müşteri Temsilcisi (Siz)' : ticket.customerName || 'Müşteri'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {formatDate(msg.createdAt)}
                                        </span>
                                    </div>
                                    <div className={`relative px-4 py-3 sm:max-w-[80%] rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${isAdmin
                                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-tr-none'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-white/5'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}

                        {ticket.messages?.length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                                Hiç mesaj bulunmuyor.
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-white/5">
                        <form onSubmit={handleReplySubmit} className="relative">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Müşteriye yanıt yazın..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 pr-16 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-purple-500/50 outline-none resize-none min-h-[100px]"
                                disabled={replyMutation.isPending}
                            />
                            <button
                                type="submit"
                                disabled={!replyContent.trim() || replyMutation.isPending}
                                className="absolute right-3 bottom-3 p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
                            >
                                {replyMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Ticket Meta info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Talep Detayları</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                                <span className="text-sm text-slate-500">Kanal</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{ticket.platform}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                                <span className="text-sm text-slate-500">Oluşturuldu</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(ticket.createdAt)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
                                <span className="text-sm text-slate-500">Öncelik Seviyesi</span>
                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {ticket.priority}
                                </span>
                            </div>

                            {ticket.order && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">İlişkili Sipariş</h4>
                                    <Link href={`/admin/orders/${ticket.order.id}`} className="block p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">#{ticket.order.id.slice(0, 8).toUpperCase()}</span>
                                            <span className="text-[10px] font-black uppercase text-emerald-600">{ticket.order.status}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Tutar: ₺{ticket.order.totalAmount}</div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield size={20} className="text-purple-200" />
                            <h3 className="font-bold">AI Asistan</h3>
                        </div>
                        <p className="text-sm font-medium text-purple-100 leading-relaxed opacity-90">
                            Bu talebin içeriği sistem tarafından analiz edildi. Yakında burada, geçmiş çözümlere dayalı olarak AI destekli otomatik taslak yanıtları önerilecektir.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
