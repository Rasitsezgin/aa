"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviews } from '@/lib/hooks';
import {
    MessageSquare, Star, ThumbsUp, Search,
    RefreshCw, Reply, Flag, CheckCircle2, Clock,
    AlertTriangle, TrendingUp, Eye, ExternalLink,
    Sparkles, Send, Loader2, BarChart3, X
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Review {
    id: string | number;
    customer?: string; customerName?: string;
    avatar?: string;
    product?: string; productName?: string;
    platform: string;
    rating: number;
    date: string;
    title?: string;
    comment: string;
    helpful?: number;
    status: 'pending' | 'replied' | 'flagged';
    reply?: string | null;
}

const PLATFORM_COLORS: Record<string, string> = {
    Trendyol: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Hepsiburada: 'bg-red-500/10 text-red-500 border-red-500/20',
    Amazon: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    N11: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    Çiçeksepeti: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

function StarRow({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const { reviews: apiReviews, loading: apiLoading, fetchReviews, replyToReview: hookReply } = useReviews();
    const [searchQuery, setSearchQuery] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [platformFilter, setPlatformFilter] = useState('all');
    const [openReplyId, setOpenReplyId] = useState<string | number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [sendingId, setSendingId] = useState<string | number | null>(null);
    const [localReviews, setLocalReviews] = useState<Review[]>([]);

    useEffect(() => {
        if (Array.isArray(apiReviews)) setLocalReviews(apiReviews as Review[]);
    }, [apiReviews]);

    const reviews = localReviews;

    const filteredReviews = reviews.filter(review => {
        const product = review.product || review.productName || '';
        const customer = review.customer || review.customerName || '';
        if (searchQuery && !product.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !customer.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !review.comment.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (ratingFilter !== 'all' && review.rating !== parseInt(ratingFilter)) return false;
        if (statusFilter !== 'all' && review.status !== statusFilter) return false;
        if (platformFilter !== 'all' && review.platform !== platformFilter) return false;
        return true;
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
    const pendingCount = reviews.filter(r => r.status === 'pending').length;
    const positivePercent = totalReviews > 0 ? Math.round(reviews.filter(r => r.rating >= 4).length / totalReviews * 100) : 0;

    // Platform breakdown from real data
    const platforms = [...new Set(reviews.map(r => r.platform))];
    const platformBreakdown = platforms.map(p => {
        const pReviews = reviews.filter(r => r.platform === p);
        return {
            platform: p,
            avgRating: pReviews.length > 0 ? (pReviews.reduce((s, r) => s + r.rating, 0) / pReviews.length).toFixed(1) : '0.0',
            totalReviews: pReviews.length,
            positive: pReviews.length > 0 ? Math.round(pReviews.filter(r => r.rating >= 4).length / pReviews.length * 100) : 0,
        };
    });

    const generateAiReply = async (review: Review) => {
        setAiLoading(true);
        try {
            const res = await apiClient.request<{ reply: string }>('/ai/review-reply', {
                method: 'POST',
                body: JSON.stringify({
                    rating: review.rating,
                    comment: review.comment,
                    product: review.product || review.productName || '',
                    platform: review.platform,
                }),
            });
            if (res?.reply) setReplyText(res.reply);
        } catch {
            setReplyText('AI yanit onerisi alinamadi. Lutfen daha sonra tekrar deneyin.');
        } finally { setAiLoading(false); }
    };

    const submitReply = async (reviewId: string | number) => {
        if (!replyText.trim()) return;
        setSendingId(reviewId);
        try {
            await hookReply(String(reviewId), replyText);
            // Optimistic update
            setLocalReviews(prev => prev.map(r =>
                r.id === reviewId ? { ...r, reply: replyText, status: 'replied' } : r
            ));
        } catch { /* ignore */ }
        setOpenReplyId(null);
        setReplyText('');
        setSendingId(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-pink-500" /> Müşteri Yorumları
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Yorum yönetimi, analizi ve AI destekli yanıtlar</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchReviews()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-slate-500 hover:text-foreground transition-all">
                        <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin' : ''}`} /> Senkronize Et
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 rounded-xl text-white text-sm font-bold hover:bg-pink-700 transition-all shadow-lg shadow-pink-500/20">
                        <Sparkles className="w-4 h-4" /> AI Toplu Yanıt
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Toplam Yorum', value: totalReviews, sub: '+23 bu hafta', color: 'pink', icon: MessageSquare, up: true },
                    { label: 'Ort. Puan', value: avgRating + ' ★', sub: 'tüm platformlar', color: 'yellow', icon: Star, up: true },
                    { label: 'Yanıt Bekleyen', value: pendingCount, sub: 'Hızlı yanıt önemli!', color: 'orange', icon: Clock, up: false },
                    { label: 'Pozitif Oran', value: `%${positivePercent}`, sub: '4-5 yıldız', color: 'green', icon: ThumbsUp, up: true },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className={`bg-gradient-to-br from-${s.color}-500/10 to-${s.color}-600/5 rounded-2xl p-5 border border-${s.color}-500/20`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2.5 bg-${s.color}-500/20 rounded-xl`}><s.icon className={`w-5 h-5 text-${s.color}-500`} /></div>
                            <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{s.label}</span>
                        </div>
                        {apiLoading ? (
                            <div className="h-7 bg-white/20 rounded-lg animate-pulse" />
                        ) : (
                            <div className="text-2xl font-black text-foreground">{s.value}</div>
                        )}
                        <div className={`text-xs mt-1 font-bold text-${s.color}-600 dark:text-${s.color}-400`}>{s.sub}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    {/* Platform Stats */}
                    <div className="bg-surface rounded-2xl p-5 border border-border">
                        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                            <BarChart3 size={16} className="text-pink-500" /> Platform Puanları
                        </h3>
                        {platformBreakdown.length === 0 ? (
                            <p className="text-xs text-slate-500">Henüz veri yok</p>
                        ) : (
                            <div className="space-y-3">
                                {platformBreakdown.map(p => (
                                    <div key={p.platform} className="p-3 bg-background rounded-xl border border-border">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-bold text-foreground">{p.platform}</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                <span className="text-sm font-bold">{p.avgRating}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-500">
                                            <span>{p.totalReviews} yorum</span>
                                            <span className="text-green-500 font-bold">%{p.positive} pozitif</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="bg-surface rounded-2xl p-5 border border-border space-y-4">
                        <h3 className="text-sm font-bold text-foreground">Filtrele</h3>
                        <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-xl text-sm border border-border text-foreground focus:border-pink-500 focus:outline-none">
                            <option value="all">Tüm Platformlar</option>
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-xl text-sm border border-border text-foreground focus:border-pink-500 focus:outline-none">
                            <option value="all">Tüm Puanlar</option>
                            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Yıldız</option>)}
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-xl text-sm border border-border text-foreground focus:border-pink-500 focus:outline-none">
                            <option value="all">Tüm Durumlar</option>
                            <option value="pending">Yanıt Bekleyen</option>
                            <option value="replied">Yanıtlandı</option>
                            <option value="flagged">İşaretli</option>
                        </select>
                    </div>
                </motion.div>

                {/* Reviews List */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Yorum, ürün veya müşteri ara..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-surface rounded-2xl text-foreground placeholder-slate-500 border border-border focus:border-pink-500 focus:outline-none" />
                    </div>

                    {apiLoading && (
                        <div className="py-16 flex items-center justify-center gap-3 text-slate-500 bg-surface rounded-2xl border border-border">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Yorumlar yükleniyor...</span>
                        </div>
                    )}

                    {!apiLoading && filteredReviews.length === 0 && (
                        <div className="text-center py-16 bg-surface rounded-2xl border border-dashed border-border">
                            <MessageSquare size={40} className="mx-auto mb-3 text-slate-300" />
                            <p className="font-bold text-foreground">Yorum bulunamadı</p>
                            <p className="text-sm text-slate-500 mt-1">Filtre veya arama terimini değiştirmeyi deneyin</p>
                        </div>
                    )}

                    {filteredReviews.map((review, index) => {
                        const customer = review.customer || review.customerName || '?';
                        const product = review.product || review.productName || '';
                        const initials = customer.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                        const platformCls = PLATFORM_COLORS[review.platform] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';

                        return (
                            <motion.div key={review.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
                                className={`bg-surface rounded-2xl border overflow-hidden ${review.status === 'flagged' ? 'border-red-500/40' : 'border-border'}`}>
                                <div className="p-5">
                                    {/* Header row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-sm font-black text-pink-600">
                                                {review.avatar || initials}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-foreground text-sm">{customer}</span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${platformCls}`}>{review.platform}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <StarRow rating={review.rating} />
                                                    <span className="text-[10px] text-slate-500">{review.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {review.status === 'pending' && (
                                                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-bold flex items-center gap-1 border border-yellow-500/20">
                                                    <Clock size={10} /> Bekliyor
                                                </span>
                                            )}
                                            {review.status === 'replied' && (
                                                <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold flex items-center gap-1 border border-green-500/20">
                                                    <CheckCircle2 size={10} /> Yanıtlandı
                                                </span>
                                            )}
                                            {review.status === 'flagged' && (
                                                <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-bold flex items-center gap-1 border border-red-500/20">
                                                    <AlertTriangle size={10} /> Dikkat
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {product && <p className="text-xs text-slate-500 mb-2 font-medium">{product}</p>}
                                    {review.title && <h4 className="font-bold text-foreground mb-1 text-sm">{review.title}</h4>}
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{review.comment}</p>

                                    {/* Existing reply */}
                                    {review.reply && (
                                        <div className="mt-4 p-3 bg-pink-500/8 border border-pink-500/20 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Reply className="w-3.5 h-3.5 text-pink-500" />
                                                <span className="text-xs font-bold text-pink-500">Satıcı Yanıtı</span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">{review.reply}</p>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <ThumbsUp size={12} /> {review.helpful || 0} faydalı
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {!review.reply && (
                                                <button onClick={() => { setOpenReplyId(openReplyId === review.id ? null : review.id); setReplyText(''); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition-all">
                                                    <Reply size={12} /> Yanıtla
                                                </button>
                                            )}
                                            <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-background rounded-lg transition-all">
                                                <Flag size={14} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-foreground hover:bg-background rounded-lg transition-all">
                                                <ExternalLink size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reply form */}
                                    <AnimatePresence>
                                        {openReplyId === review.id && !review.reply && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-border overflow-hidden">
                                                <div className="relative">
                                                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                                        placeholder="Yanıtınızı yazın..."
                                                        className="w-full px-4 py-3 bg-background rounded-xl text-foreground placeholder-slate-500 border border-border focus:border-pink-500 focus:outline-none resize-none text-sm"
                                                        rows={3} />
                                                    {aiLoading && (
                                                        <div className="absolute inset-0 bg-surface/80 rounded-xl flex items-center justify-center gap-2 text-pink-500 text-sm font-bold">
                                                            <Loader2 size={16} className="animate-spin" /> AI yazıyor...
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <button onClick={() => generateAiReply(review)} disabled={aiLoading}
                                                        className="flex items-center gap-1.5 text-sm text-pink-500 hover:text-pink-400 font-bold disabled:opacity-50 transition-all">
                                                        <Sparkles size={14} /> AI ile Yanıt Oluştur
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => { setOpenReplyId(null); setReplyText(''); }}
                                                            className="px-4 py-2 text-slate-500 hover:text-foreground transition-colors font-bold text-sm">İptal</button>
                                                        <button onClick={() => submitReply(review.id)} disabled={!replyText.trim() || !!sendingId}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-all text-sm disabled:opacity-50">
                                                            {sendingId === review.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Gönder
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}
