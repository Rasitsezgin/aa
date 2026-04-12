"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, MessageSquare, HelpCircle, Lightbulb, Trophy, Calendar,
    ArrowRight, Search, TrendingUp, Heart, Zap, Award,
    MessageCircle, BookOpen, Video, Mic, ChevronRight,
    Globe, UserPlus, Bell, ThumbsUp, Eye, Clock
} from 'lucide-react';
import Link from 'next/link';

interface ForumTopic {
    id: string;
    title: string;
    category: string;
    author: { name: string; avatar: string; badge?: string };
    replies: number;
    views: number;
    likes: number;
    lastActivity: string;
    pinned?: boolean;
    solved?: boolean;
    hot?: boolean;
}

const forumTopics: ForumTopic[] = [
    {
        id: '1',
        title: 'AI Fiyatlandırma Stratejileri: En İyi Uygulamalar',
        category: 'Fiyatlandırma',
        author: { name: 'Ahmet Y.', avatar: 'AY', badge: 'Pro Satıcı' },
        replies: 47,
        views: 1250,
        likes: 89,
        lastActivity: '2 saat önce',
        pinned: true,
        hot: true
    },
    {
        id: '2',
        title: 'Trendyol Entegrasyonu - Stok Senkronizasyon Sorunu',
        category: 'Entegrasyon',
        author: { name: 'Zeynep K.', avatar: 'ZK' },
        replies: 23,
        views: 456,
        likes: 12,
        lastActivity: '15 dk önce',
        solved: true
    },
    {
        id: '3',
        title: 'Sezonluk Kampanya Stratejileri - Deneyimlerimiz',
        category: 'Strateji',
        author: { name: 'Mert D.', avatar: 'MD', badge: 'Elite Üye' },
        replies: 56,
        views: 892,
        likes: 67,
        lastActivity: '1 saat önce',
        hot: true
    },
    {
        id: '4',
        title: 'Yeni Başlayanlar İçin: Pazaryeri Satış Rehberi',
        category: 'Eğitim',
        author: { name: 'Admin', avatar: '⭐', badge: 'Moderatör' },
        replies: 134,
        views: 3500,
        likes: 245,
        lastActivity: '3 saat önce',
        pinned: true
    },
    {
        id: '5',
        title: 'Amazon Türkiye Deneyimleri Paylaşalım',
        category: 'Pazaryeri',
        author: { name: 'Can Ö.', avatar: 'CÖ' },
        replies: 89,
        views: 1680,
        likes: 98,
        lastActivity: '30 dk önce'
    }
];

const categories = [
    { name: 'Fiyatlandırma', count: 234, icon: TrendingUp, color: 'text-emerald-500' },
    { name: 'Entegrasyon', count: 189, icon: Zap, color: 'text-blue-500' },
    { name: 'Strateji', count: 156, icon: Lightbulb, color: 'text-amber-500' },
    { name: 'Eğitim', count: 312, icon: BookOpen, color: 'text-purple-500' },
    { name: 'Pazaryeri', count: 278, icon: Globe, color: 'text-pink-500' },
    { name: 'Teknik Destek', count: 145, icon: HelpCircle, color: 'text-red-500' },
];

const upcomingEvents = [
    { title: 'Aylık Satıcı Buluşması', date: '15 Ocak 2024', type: 'Online', icon: Video },
    { title: 'AI Workshop: Fiyatlandırma', date: '20 Ocak 2024', type: 'Webinar', icon: Mic },
    { title: 'İstanbul Meetup', date: '25 Ocak 2024', type: 'Yüz yüze', icon: Users },
];

const topContributors = [
    { name: 'Ahmet Yılmaz', avatar: 'AY', points: 12500, badge: 'Elite Üye', rank: 1 },
    { name: 'Zeynep Kara', avatar: 'ZK', points: 9800, badge: 'Pro Satıcı', rank: 2 },
    { name: 'Mert Demir', avatar: 'MD', points: 8200, badge: 'Aktif Üye', rank: 3 },
    { name: 'Ayşe Çelik', avatar: 'AÇ', points: 7100, badge: 'Yükselen Yıldız', rank: 4 },
    { name: 'Can Özkan', avatar: 'CÖ', points: 6500, badge: 'Aktif Üye', rank: 5 },
];

const stats = [
    { value: '25,000+', label: 'Topluluk Üyesi' },
    { value: '50,000+', label: 'Forum Konusu' },
    { value: '5,000+', label: 'Çözülen Soru' },
    { value: '100+', label: 'Aylık Etkinlik' },
];

export default function CommunityPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');

    return (
        <section className="min-h-screen pt-32 pb-24 relative overflow-hidden bg-white dark:bg-[#02040a] transition-colors duration-500">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-cyan-500/10 dark:bg-cyan-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-500/20 blur-[150px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40 border border-cyan-200/50 dark:border-cyan-700/50 rounded-full mb-8"
                    >
                        <Users size={16} className="text-cyan-600 dark:text-cyan-400" />
                        <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300 tracking-wide">TOPLULUK</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Birlikte{' '}
                        <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                            Büyüyoruz
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
                        25,000+ e-ticaret satıcısından oluşan topluluğumuza katılın.
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold"> Paylaşın, öğrenin, büyüyün.</span>
                    </p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-12 mb-10"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-bold hover:from-cyan-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                        >
                            <UserPlus size={18} />
                            Topluluğa Katıl
                        </Link>
                        <button className="px-8 py-4 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                            <Bell size={18} />
                            Bildirimlere Abone Ol
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content - Forum */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Search */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="relative">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Konu, soru veya kullanıcı ara..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        </motion.div>

                        {/* Categories */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kategoriler</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {categories.map((cat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`p-4 rounded-xl text-left transition-all ${selectedCategory === cat.name
                                                ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700'
                                                : 'bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10'
                                            } border border-slate-200 dark:border-white/10`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <cat.icon size={20} className={cat.color} />
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{cat.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{cat.count} konu</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Forum Topics */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Popüler Konular</h2>
                                <Link href="#" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                                    Tümünü Gör
                                    <ChevronRight size={14} />
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {forumTopics.map((topic, i) => (
                                    <motion.a
                                        key={topic.id}
                                        href={`/community/topic/${topic.id}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                        className="block p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg hover:border-cyan-200 dark:hover:border-cyan-700/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Author Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {topic.author.avatar}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    {topic.pinned && (
                                                        <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-xs font-bold">📌 Sabit</span>
                                                    )}
                                                    {topic.hot && (
                                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-bold">🔥 Popüler</span>
                                                    )}
                                                    {topic.solved && (
                                                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-bold">✓ Çözüldü</span>
                                                    )}
                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded text-xs">{topic.category}</span>
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-2">
                                                    {topic.title}
                                                </h3>
                                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        {topic.author.name}
                                                        {topic.author.badge && (
                                                            <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded text-[10px]">{topic.author.badge}</span>
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-1"><MessageCircle size={12} /> {topic.replies}</span>
                                                    <span className="flex items-center gap-1"><Eye size={12} /> {topic.views}</span>
                                                    <span className="flex items-center gap-1"><ThumbsUp size={12} /> {topic.likes}</span>
                                                    <span className="flex items-center gap-1"><Clock size={12} /> {topic.lastActivity}</span>
                                                </div>
                                            </div>

                                            <ChevronRight size={20} className="text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0" />
                                        </div>
                                    </motion.a>
                                ))}
                            </div>

                            <button className="w-full mt-4 py-3 text-center text-cyan-600 dark:text-cyan-400 font-medium hover:underline">
                                Daha Fazla Konu Yükle
                            </button>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Top Contributors */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                    <Trophy size={20} className="text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">En Aktif Üyeler</h3>
                            </div>

                            <div className="space-y-3">
                                {topContributors.map((user, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                            {user.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-900 dark:text-white text-sm truncate">{user.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{user.points.toLocaleString()} puan</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${user.rank === 1 ? 'bg-amber-400 text-amber-900' :
                                                user.rank === 2 ? 'bg-slate-300 text-slate-700' :
                                                    user.rank === 3 ? 'bg-amber-600 text-white' :
                                                        'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {user.rank}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/community/leaderboard" className="block mt-4 text-center text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                                Sıralamayı Gör
                            </Link>
                        </motion.div>

                        {/* Upcoming Events */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <Calendar size={20} className="text-white" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Yaklaşan Etkinlikler</h3>
                            </div>

                            <div className="space-y-3">
                                {upcomingEvents.map((event, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <event.icon size={18} className="text-purple-500" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-900 dark:text-white text-sm">{event.title}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{event.date} • {event.type}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/webinars" className="block mt-4 text-center text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                                Tüm Etkinlikler
                            </Link>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600"
                        >
                            <h3 className="font-bold text-white mb-4">Hızlı İşlemler</h3>
                            <div className="space-y-2">
                                <button className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium text-left hover:bg-white/30 transition-colors flex items-center gap-3">
                                    <MessageSquare size={18} />
                                    Yeni Konu Aç
                                </button>
                                <button className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium text-left hover:bg-white/30 transition-colors flex items-center gap-3">
                                    <HelpCircle size={18} />
                                    Soru Sor
                                </button>
                                <button className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium text-left hover:bg-white/30 transition-colors flex items-center gap-3">
                                    <Lightbulb size={18} />
                                    Öneri Paylaş
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Community Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Topluluk Avantajları</h2>
                        <p className="text-slate-600 dark:text-slate-400">Neden topluluğumuza katılmalısınız?</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: MessageCircle, title: 'Soru & Cevap', description: 'Deneyimli satıcılardan anında yanıt alın' },
                            { icon: BookOpen, title: 'Bilgi Paylaşımı', description: 'En iyi pratikleri öğrenin ve paylaşın' },
                            { icon: Users, title: 'Networking', description: 'Diğer satıcılarla bağlantı kurun' },
                            { icon: Award, title: 'Ödül Sistemi', description: 'Katkılarınız için puan ve rozet kazanın' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center hover:shadow-xl transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 dark:from-cyan-500/20 dark:to-teal-500/20 flex items-center justify-center mx-auto mb-4">
                                    <feature.icon size={24} className="text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20"
                >
                    <div className="relative p-12 md:p-16 rounded-[2rem] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600" />
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }} />

                        <div className="relative text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                                <Heart size={32} className="text-white" />
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                                Ailemize Katılın
                            </h3>
                            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                                25,000+ e-ticaret satıcısıyla birlikte büyüyün, öğrenin ve başarıya ulaşın.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/register"
                                    className="px-8 py-4 bg-white text-cyan-700 rounded-xl font-bold hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserPlus size={18} />
                                    Ücretsiz Üye Ol
                                </Link>
                                <Link
                                    href="/demo"
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/20"
                                >
                                    Demo İste
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
