"use client";

import React, { useState } from 'react';
import { MessageSquare, User, Clock, CheckCircle, AlertCircle, Sparkles, Send, MoreVertical, Paperclip } from 'lucide-react';

export default function SupportPage() {
    const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

    const tickets = [
        { id: 1024, user: "Ahmet Y.", company: "Mega Store", subject: "Trendyol API hatası alıyorum", status: "open", priority: "high", time: "15 dk önce", msg: "Merhaba, son 1 saattir stok güncellemelerinde 503 hatası alıyoruz. Acil bakar mısınız?" },
        { id: 1023, user: "Ayşe K.", company: "Moda Butik", subject: "Fatura kesim sorunu", status: "pending", priority: "medium", time: "2 saat önce", msg: "E-fatura entegrasyonunda vergi numarası hatası veriyor." },
        { id: 1022, user: "Mehmet D.", company: "TeknoSA Bayi", subject: "Yeni özellik isteği", status: "closed", priority: "low", time: "1 gün önce", msg: "Toplu ürün düzenleme ekranına excel import özelliği gelebilir mi?" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-1">Destek Merkezi</h1>
                    <p className="text-slate-600 dark:text-slate-500 font-medium">Kullanıcı taleplerini yanıtlayın ve yönetin.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500/10 dark:bg-white/5 hover:bg-blue-500/20 dark:hover:bg-white/10 text-blue-600 dark:text-white rounded-xl font-bold text-xs transition-colors border border-blue-500/20 dark:border-white/10">
                        Açık (5)
                    </button>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs transition-colors border border-slate-200 dark:border-white/10">
                        Bekleyen (2)
                    </button>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs transition-colors border border-slate-200 dark:border-white/10">
                        Kapalı (124)
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
                {/* Ticket List */}
                <div className="col-span-4 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden shadow-sm dark:shadow-none">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                        <input type="text" placeholder="Talep ara..." className="w-full h-10 bg-slate-100 dark:bg-black/20 rounded-xl px-4 text-xs font-bold text-foreground outline-none border border-transparent focus:border-blue-500/30" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket.id)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/5 ${selectedTicket === ticket.id
                                        ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-500/30 shadow-lg shadow-blue-900/10'
                                        : 'bg-transparent border-slate-200 dark:border-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-red-500' : ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">#{ticket.id}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500">{ticket.time}</span>
                                </div>
                                <h4 className={`text-sm font-bold mb-1 ${selectedTicket === ticket.id ? 'text-foreground' : 'text-slate-700 dark:text-slate-300'}`}>{ticket.subject}</h4>
                                <div className="flex items-center gap-2">
                                    <User size={12} className="text-slate-500" />
                                    <span className="text-xs text-slate-500 font-medium">{ticket.company}</span>
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
                                        <h3 className="text-lg font-bold text-foreground">#{selectedTicket} - Trendyol API hatası alıyorum</h3>
                                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase border border-red-500/20">Yüksek Öncelik</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mega Store A.Ş. • Premium Plan</p>
                                </div>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white text-xs font-bold">AY</div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-foreground">Ahmet Y.</span>
                                            <span className="text-xs text-slate-500">15 dk önce</span>
                                        </div>
                                        <div className="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                            Merhaba, son 1 saattir stok güncellemelerinde 503 hatası alıyoruz. Acil bakar mısınız? Müşteriler stokta olmayan ürünleri satın alıyor şu an.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-center">
                                        <Sparkles size={14} className="text-white" />
                                    </div>
                                    <div className="flex-1 space-y-2 flex flex-col items-end">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">AI Asistan (Taslak)</span>
                                            <span className="text-xs text-slate-500">Şimdi</span>
                                        </div>
                                        <div className="p-4 rounded-2xl rounded-tr-none bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-100 text-sm leading-relaxed relative group cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-colors">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded-full font-bold">Tıkla ve Günder</span>
                                            </div>
                                            Merhaba Ahmet Bey, sistem kayıtlarını incelediğimde Trendyol API tarafında genel bir yavaşlık olduğunu görüyorum. Ancak sizin tarafınızda oluşan kuyruğu temizlemek için "Zorla Senkronize Et" işlemini başlattım. Yaklaşık 5 dakika içinde stoklarınız düzelecektir.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
                                <div className="relative">
                                    <textarea placeholder="Yanıtınızı yazın..." className="w-full h-32 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm text-foreground outline-none focus:border-blue-500/50 resize-none pr-32" />
                                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                        <button className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">
                                            <Paperclip size={18} />
                                        </button>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors">
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
