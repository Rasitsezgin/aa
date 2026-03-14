"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Share2, Instagram, Facebook, Twitter, Youtube, BarChart3,
    TrendingUp, Users, Heart, MessageCircle, Eye, Calendar,
    PlusCircle, Send, Image, Clock
} from 'lucide-react';

const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-400', bg: 'bg-pink-500/10', followers: 12500, posts: 245, engagement: 4.2 },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-400', bg: 'bg-blue-500/10', followers: 8900, posts: 178, engagement: 2.8 },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'text-slate-300', bg: 'bg-slate-500/10', followers: 5600, posts: 890, engagement: 1.9 },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-400', bg: 'bg-red-500/10', followers: 3200, posts: 45, engagement: 5.1 },
];

const scheduledPosts = [
    { id: 1, content: 'Yeni sezon ürünleri geldi! 🎉 #yenisezon #moda', platform: 'instagram', date: '2025-01-22 10:00', image: true, status: 'scheduled' },
    { id: 2, content: 'iPhone 15 Pro Max şimdi %20 indirimli! Kaçırmayın.', platform: 'facebook', date: '2025-01-22 14:00', image: true, status: 'scheduled' },
    { id: 3, content: 'Müşteri memnuniyetinde %98 puan aldık! Teşekkürler 🙏', platform: 'twitter', date: '2025-01-23 09:00', image: false, status: 'scheduled' },
    { id: 4, content: 'Ürün inceleme: Samsung Galaxy S24 Ultra detaylı video', platform: 'youtube', date: '2025-01-23 18:00', image: true, status: 'draft' },
];

const recentActivity = [
    { platform: 'instagram', type: 'like', count: 45, content: 'Kış koleksiyonu paylaşımı', time: '2 saat önce' },
    { platform: 'facebook', type: 'comment', count: 12, content: 'İndirim kampanyası duyurusu', time: '3 saat önce' },
    { platform: 'twitter', type: 'retweet', count: 28, content: 'Müşteri yorumu paylaşımı', time: '5 saat önce' },
    { platform: 'instagram', type: 'follower', count: 156, content: 'Yeni takipçiler', time: '1 gün önce' },
    { platform: 'youtube', type: 'view', count: 2300, content: 'Ürün tanıtım videosu', time: '2 gün önce' },
];

export default function SocialMediaPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'create'>('overview');
    const [newPost, setNewPost] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    const totalFollowers = platforms.reduce((a, p) => a + p.followers, 0);
    const avgEngagement = (platforms.reduce((a, p) => a + p.engagement, 0) / platforms.length).toFixed(1);

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <Share2 className="w-7 h-7 text-indigo-400" /> Sosyal Medya Yönetimi
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Sosyal medya hesaplarınızı tek panelden yönetin</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface rounded-xl p-1 w-fit border border-border">
                {[
                    { id: 'overview', label: 'Genel Bakış' },
                    { id: 'schedule', label: 'Zamanlama' },
                    { id: 'create', label: 'Yeni Paylaşım' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-foreground'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Platform Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {platforms.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-surface rounded-xl border border-border p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2.5 rounded-xl ${p.bg}`}>
                                        <p.icon className={`w-5 h-5 ${p.color}`} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">{p.name}</div>
                                        <div className="text-xs text-slate-500">Bağlı</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" /> Takipçi</span>
                                        <span className="text-foreground font-medium">{p.followers.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 flex items-center gap-1"><Send className="w-3 h-3" /> Paylaşım</span>
                                        <span className="text-foreground font-medium">{p.posts}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 flex items-center gap-1"><Heart className="w-3 h-3" /> Etkileşim</span>
                                        <span className="text-emerald-400 font-medium">%{p.engagement}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-surface rounded-xl border border-border p-5">
                            <Users className="w-5 h-5 text-indigo-400 mb-2" />
                            <div className="text-2xl font-bold text-foreground">{totalFollowers.toLocaleString()}</div>
                            <div className="text-xs text-slate-500">Toplam Takipçi</div>
                        </div>
                        <div className="bg-surface rounded-xl border border-border p-5">
                            <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" />
                            <div className="text-2xl font-bold text-foreground">%{avgEngagement}</div>
                            <div className="text-xs text-slate-500">Ort. Etkileşim Oranı</div>
                        </div>
                        <div className="bg-surface rounded-xl border border-border p-5">
                            <Calendar className="w-5 h-5 text-amber-400 mb-2" />
                            <div className="text-2xl font-bold text-foreground">{scheduledPosts.filter(p => p.status === 'scheduled').length}</div>
                            <div className="text-xs text-slate-500">Zamanlanmış Paylaşım</div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-surface rounded-xl border border-border p-6">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Son Aktiviteler</h3>
                        <div className="space-y-3">
                            {recentActivity.map((a, i) => {
                                const pf = platforms.find(p => p.id === a.platform)!;
                                return (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                        className="flex items-center justify-between p-3 rounded-lg bg-background">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${pf.bg}`}>
                                                <pf.icon className={`w-4 h-4 ${pf.color}`} />
                                            </div>
                                            <div>
                                                <div className="text-xs text-foreground">{a.content}</div>
                                                <div className="text-[10px] text-slate-500">{a.time}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            {a.type === 'like' && <Heart className="w-3 h-3 text-pink-400" />}
                                            {a.type === 'comment' && <MessageCircle className="w-3 h-3 text-blue-400" />}
                                            {a.type === 'retweet' && <Share2 className="w-3 h-3 text-emerald-400" />}
                                            {a.type === 'follower' && <Users className="w-3 h-3 text-indigo-400" />}
                                            {a.type === 'view' && <Eye className="w-3 h-3 text-amber-400" />}
                                            <span className="font-medium">{a.count.toLocaleString()}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'schedule' && (
                <div className="bg-surface rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-foreground">Zamanlanmış Paylaşımlar</h3>
                        <button onClick={() => setActiveTab('create')} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">
                            <PlusCircle className="w-3.5 h-3.5" /> Yeni
                        </button>
                    </div>
                    <div className="space-y-3">
                        {scheduledPosts.map((post, i) => {
                            const pf = platforms.find(p => p.id === post.platform)!;
                            return (
                                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    className="flex items-start gap-4 p-4 rounded-xl border border-border bg-background">
                                    <div className={`p-2.5 rounded-xl ${pf.bg}`}>
                                        <pf.icon className={`w-5 h-5 ${pf.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-foreground">{post.content}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.date}</span>
                                            {post.image && <span className="flex items-center gap-1"><Image className="w-3 h-3" /> Görsel</span>}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${post.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                        {post.status === 'scheduled' ? 'Zamanlandı' : 'Taslak'}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'create' && (
                <div className="bg-surface rounded-xl border border-border p-6 max-w-2xl">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Yeni Paylaşım Oluştur</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-400 block mb-2">Platformlar</label>
                            <div className="flex gap-2">
                                {platforms.map(p => (
                                    <button key={p.id} onClick={() => togglePlatform(p.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all ${selectedPlatforms.includes(p.id) ? `${p.bg} border-transparent` : 'border-border text-slate-500 hover:border-indigo-500/30'}`}>
                                        <p.icon className={`w-4 h-4 ${selectedPlatforms.includes(p.id) ? p.color : ''}`} />
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-2">İçerik</label>
                            <textarea value={newPost} onChange={e => setNewPost(e.target.value)} rows={4} placeholder="Paylaşım içeriğinizi yazın..."
                                className="w-full px-4 py-3 bg-background rounded-xl text-sm text-foreground border border-border focus:border-indigo-500 focus:outline-none resize-none placeholder:text-slate-500" />
                            <div className="text-right text-xs text-slate-600 mt-1">{newPost.length}/280</div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-xs text-slate-400 hover:text-foreground">
                                <Image className="w-4 h-4" /> Görsel Ekle
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-xs text-slate-400 hover:text-foreground">
                                <Calendar className="w-4 h-4" /> Zamanla
                            </button>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                                <Send className="w-4 h-4" /> Paylaş
                            </button>
                            <button className="px-4 py-2.5 text-slate-400 hover:text-foreground text-sm">Taslak Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
