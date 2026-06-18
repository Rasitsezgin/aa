"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin-api';
import { MessageSquare, User, Clock, CheckCircle, AlertCircle, Send, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SupportMessage {
  id: string;
  content: string;
  senderType: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  customerName?: string | null;
  customerEmail?: string | null;
  status: string;
  priority?: string;
  platform?: string;
  updatedAt: string;
  createdAt: string;
  messages?: SupportMessage[];
}

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['admin-support-tickets-inbox'],
    queryFn: () => adminApi.getSupportTickets({ page: 1 }),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-support-ticket-detail', selectedId],
    queryFn: () => adminApi.getSupportTicketDetail(selectedId!),
    enabled: !!selectedId,
  });

  const replyMutation = useMutation({
    mutationFn: () => adminApi.replyToSupportTicket(selectedId!, newMessage),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['admin-support-ticket-detail', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets-inbox'] });
    },
  });

  const tickets: SupportTicket[] = listData?.tickets ?? [];
  const selectedTicket = detail as SupportTicket | undefined;
  const messages = selectedTicket?.messages ?? [];

  const filteredTickets = tickets.filter((t) =>
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const statusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            Destek Gelen Kutusu
          </h1>
          <p className="text-slate-500 text-sm">Platform geneli destek talepleri</p>
        </div>
        <Link href="/admin/support-tickets" className="text-sm text-purple-600 font-medium hover:underline">
          Detaylı liste →
        </Link>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-80 flex flex-col bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ara..."
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
            ) : filteredTickets.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-8">Talep bulunamadı</p>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-4 border-b hover:bg-slate-50 dark:hover:bg-white/5 ${selectedId === t.id ? 'bg-purple-50 dark:bg-purple-500/10' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm line-clamp-1">{t.subject}</p>
                    {statusIcon(t.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{t.customerName ?? t.customerEmail ?? 'Müşteri'}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(t.updatedAt ?? t.createdAt), 'dd MMM HH:mm', { locale: tr })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden">
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Bir talep seçin</p>
              </div>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
          ) : (
            <>
              <div className="p-4 border-b">
                <h2 className="font-bold">{selectedTicket?.subject}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <User className="w-4 h-4" />
                  {selectedTicket?.customerName ?? selectedTicket?.customerEmail ?? 'Bilinmiyor'}
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{selectedTicket?.status}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      m.senderType === 'AGENT'
                        ? 'ml-auto bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-white/10'
                    }`}
                  >
                    <p>{m.content}</p>
                    <p className={`text-xs mt-1 ${m.senderType === 'AGENT' ? 'text-purple-200' : 'text-slate-400'}`}>
                      {format(new Date(m.createdAt), 'dd MMM HH:mm', { locale: tr })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && newMessage.trim() && replyMutation.mutate()}
                  placeholder="Yanıt yazın..."
                  className="flex-1 px-4 py-2 border rounded-xl"
                />
                <button
                  onClick={() => replyMutation.mutate()}
                  disabled={!newMessage.trim() || replyMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
