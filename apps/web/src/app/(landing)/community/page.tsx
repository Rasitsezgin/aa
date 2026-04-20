"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, HelpCircle, Lightbulb, Trophy, Calendar,
    ArrowRight, Search, TrendingUp, Heart, Zap, Award,
    MessageCircle, BookOpen, Video, Mic, ChevronRight,
    Globe, UserPlus, Bell, ThumbsUp, Eye, Clock,
    Sparkles, Target, Flame, Star, CheckCircle2, Activity, Radio
} from 'lucide-react';
import Link from 'next/link';
import { communityService, CommunityStats, ForumTopic, ForumCategory, TopContributor, CommunityEvent } from '@/lib/services/community-service';
import { useRealtimeStatus, useRealtimeActivities, useHeartbeat, useNotifications } from '@/lib/hooks/use-realtime';

// Loading Skeleton Component
function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        </div>
    );
}

export default function CommunityPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    
    // Data states
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [contributors, setContributors] = useState<TopContributor[]>([]);
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    
    // Loading states
    const [loading, setLoading] = useState({
        stats: true,
        topics: true,
        categories: true,
        contributors: true,
        events: true,
    });

    // Real-time features
    const { status: realtimeStatus, loading: realtimeLoading } = useRealtimeStatus({ refreshInterval: 30000 });
    const { activities: realtimeActivities, loading: activitiesLoading } = useRealtimeActivities({ refreshInterval: 60000 });
    const { notifications, unreadCount, addNotification } = useNotifications();
    
    // Send heartbeat to keep user online
    useHeartbeat(60000);

    // Fetch all data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, topicsData, categoriesData, contributorsData, eventsData] = await Promise.all([
                    communityService.getStats(),
                    communityService.getTopics({ limit: 10, sortBy: 'popular' }),
                    communityService.getCategories(),
                    communityService.getContributors({ limit: 5 }),
                    communityService.getEvents({ limit: 5 }),
                ]);

                setStats(statsData);
                setTopics(topicsData);
                setCategories(categoriesData);
                setContributors(contributorsData);
                setEvents(eventsData);
            } catch (error) {
                console.error('Failed to fetch community data:', error);
            } finally {
                setLoading({
                    stats: false,
                    topics: false,
                    categories: false,
                    contributors: false,
                    events: false,
                });
            }
        };

        fetchData();
    }, []);

    // Filter topics by category
    const filteredTopics = selectedCategory === 'Tümü' 
        ? topics 
        : topics.filter(t => t.category === selectedCategory);

    // Filter by search query
    const searchFilteredTopics = searchQuery
        ? filteredTopics.filter(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.author.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : filteredTopics;

    // Icon mapping
    const iconMap: Record<string, any> = {
        MessageSquare, TrendingUp, Zap, Lightbulb, BookOpen, Globe, HelpCircle,
        Video, Mic, Users, Calendar, Trophy
    };

    const getIcon = (iconName: string) => {
        const Icon = iconMap[iconName] || MessageSquare;
        return <Icon size={20} />;
    };

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
                        {loading.stats ? 'Yükleniyor...' : `${(stats?.totalMembers || 0).toLocaleString('tr-TR')}+ e-ticaret satıcısından oluşan topluluğumuza katılın.`}
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold"> Paylaşın, öğrenin, büyüyün.</span>
                    </p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-8 md:gap-12 mb-10"
                    >
                        {loading.stats ? (
                            <>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="text-center">
                                        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <div className="text-center">
                                    <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                                        {(stats?.totalMembers || 0).toLocaleString('tr-TR')}+
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Topluluk Üyesi</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                                        {(stats?.totalTopics || 0).toLocaleString('tr-TR')}+
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Forum Konusu</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                                        {(stats?.solvedTopics || 0).toLocaleString('tr-TR')}+
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Çözülen Soru</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <div className="text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                                            +{stats?.growthRate || 0}%
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Aylık Büyüme</div>
                                </div>
                            </>
                        )}
                    </motion.div>

                    {/* Online Now Badge */}
                    {!loading.stats && stats && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full mb-8"
                        >
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                Şu anda {stats.onlineUsers + stats.onlineGuests} kişi çevrimiçi
                            </span>
                        </motion.div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl font-bold hover:from-cyan-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
                        >
                            <UserPlus size={18} />
                            Topluluğa Katıl
                        </Link>
                        <Link 
                            href="/forum"
                            className="px-8 py-4 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} />
                            Foruma Git
                        </Link>
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
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    ({categories.length} kategori)
                                </span>
                            </div>
                            {loading.categories ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                            <SkeletonCard />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setSelectedCategory('Tümü')}
                                        className={`p-4 rounded-xl text-left transition-all ${selectedCategory === 'Tümü'
                                                ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700'
                                                : 'bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10'
                                            } border border-slate-200 dark:border-white/10`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400">
                                                <Sparkles size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">Tümü</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {topics.length} konu
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`p-4 rounded-xl text-left transition-all ${selectedCategory === cat.name
                                                    ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700'
                                                    : 'bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10'
                                                } border border-slate-200 dark:border-white/10`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-600 dark:text-${cat.color}-400`}>
                                                    {getIcon(cat.icon)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{cat.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{cat.topicCount} konu</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Forum Topics */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {selectedCategory === 'Tümü' ? 'Popüler Konular' : `${selectedCategory} Konuları`}
                                    </h2>
                                    {searchQuery && (
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            ({searchFilteredTopics.length} sonuç)
                                        </span>
                                    )}
                                </div>
                                <Link href="/forum" className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                                    Tümünü Gör
                                    <ChevronRight size={14} />
                                </Link>
                            </div>

                            {loading.topics ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                            <SkeletonCard />
                                        </div>
                                    ))}
                                </div>
                            ) : searchFilteredTopics.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {searchQuery ? 'Arama sonucu bulunamadı.' : 'Henüz konu bulunmuyor.'}
                                    </p>
                                    <Link 
                                        href="/forum/new-topic" 
                                        className="inline-flex items-center gap-2 mt-4 text-cyan-600 dark:text-cyan-400 hover:underline"
                                    >
                                        <Plus size={16} />
                                        İlk konuyu sen aç
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {searchFilteredTopics.map((topic, i) => (
                                            <motion.div
                                                key={topic.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <Link
                                                    href={`/forum/topic/${topic.slug}`}
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
                                                                {topic.isPinned && (
                                                                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-xs font-bold flex items-center gap-1">
                                                                        <Pin size={10} /> Sabit
                                                                    </span>
                                                                )}
                                                                {topic.isHot && (
                                                                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-bold flex items-center gap-1">
                                                                        <Flame size={10} /> Popüler
                                                                    </span>
                                                                )}
                                                                {topic.isSolved && (
                                                                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded text-xs font-bold flex items-center gap-1">
                                                                        <CheckCircle2 size={10} /> Çözüldü
                                                                    </span>
                                                                )}
                                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded text-xs">
                                                                    {topic.category}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
                                                                {topic.title}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                                <span className="flex items-center gap-1">
                                                                    {topic.author.name}
                                                                    {topic.author.badge && (
                                                                        <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded text-[10px]">
                                                                            {topic.author.badge}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span className="flex items-center gap-1"><MessageCircle size={12} /> {topic.replies}</span>
                                                                <span className="flex items-center gap-1"><Eye size={12} /> {topic.views}</span>
                                                                <span className="flex items-center gap-1"><ThumbsUp size={12} /> {topic.likes}</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={12} /> 
                                                                    {communityService.formatRelativeTime(topic.lastActivity)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <ChevronRight size={20} className="text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0" />
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            <Link 
                                href="/forum"
                                className="w-full mt-4 py-3 text-center text-cyan-600 dark:text-cyan-400 font-medium hover:underline flex items-center justify-center gap-2"
                            >
                                Daha Fazla Konu Gör
                                <ArrowRight size={16} />
                            </Link>
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
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">En Aktif Üyeler</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Bu haftanın liderleri</p>
                                </div>
                            </div>

                            {loading.contributors ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                                            <div className="flex-1">
                                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24 mb-1"></div>
                                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {contributors.map((user) => (
                                        <div key={user.id} className="flex items-center gap-3 group cursor-pointer">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {user.avatar}
                                                </div>
                                                {user.isOnline && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-900 dark:text-white text-sm truncate flex items-center gap-2">
                                                    {user.name}
                                                    <span 
                                                        className="px-1.5 py-0.5 rounded text-[10px] text-white"
                                                        style={{ backgroundColor: user.badgeColor }}
                                                    >
                                                        {user.badge}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {user.points.toLocaleString('tr-TR')} puan • Seviye {user.level}
                                                </div>
                                            </div>
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                user.rank === 1 ? 'bg-amber-400 text-amber-900' :
                                                user.rank === 2 ? 'bg-slate-300 text-slate-700' :
                                                user.rank === 3 ? 'bg-amber-600 text-white' :
                                                'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                            }`}>
                                                {user.rank}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Link href="/community/leaderboard" className="block mt-4 text-center text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                                Tüm Sıralamayı Gör
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
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Yaklaşan Etkinlikler</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Katılmayı unutma!</p>
                                </div>
                            </div>

                            {loading.events ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                                            <SkeletonCard />
                                        </div>
                                    ))}
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                                    <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Yaklaşan etkinlik yok</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {events.map((event) => (
                                        <div key={event.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    event.isOnline 
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                                                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    {event.isOnline ? <Video size={18} /> : <Users size={18} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                        {event.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {event.formattedDate} • {event.formattedTime}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-slate-600 dark:text-slate-400">
                                                            {event.isOnline ? 'Online' : 'Yüz yüze'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            {event.attendeeCount} katılımcı
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Link href="/webinars" className="block mt-4 text-center text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                                Tüm Etkinlikler
                            </Link>
                        </motion.div>

                        {/* Live Activity Feed */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55 }}
                            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <Radio size={20} className="text-white animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        Canlı Aktivite
                                        {!activitiesLoading && realtimeActivities.length > 0 && (
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        )}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {realtimeStatus?.onlineCount || 0} kişi çevrimiçi
                                    </p>
                                </div>
                            </div>

                            {activitiesLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 animate-pulse">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                            <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : realtimeActivities.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                                    <Activity size={24} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Henüz aktivite yok</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {realtimeActivities.slice(0, 5).map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {activity.user.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                                                        <span className="font-semibold text-slate-900 dark:text-white">{activity.user.name}</span>
                                                        {' '}yeni bir gönderi paylaştı
                                                    </p>
                                                    {activity.topic && (
                                                        <Link 
                                                            href={`/forum/topic/${activity.topic.slug}`}
                                                            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline truncate block"
                                                        >
                                                            {activity.topic.title}
                                                        </Link>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 shrink-0">
                                                    {communityService.formatRelativeTime(new Date(activity.createdAt))}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>

                        {/* Real-time Online Users */}
                        {realtimeStatus && realtimeStatus.recentlyActive.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.58 }}
                                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users size={18} className="text-cyan-600" />
                                        Aktif Üyeler
                                    </h3>
                                    <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                                        {realtimeStatus.onlineCount} çevrimiçi
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {realtimeStatus.recentlyActive.slice(0, 8).map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-lg"
                                        >
                                            <div className="relative">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {user.avatar.slice(0, 2).toUpperCase()}
                                                </div>
                                                {user.isOnline && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white dark:border-slate-800 rounded-full"></span>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {user.name.split(' ')[0]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600"
                        >
                            <h3 className="font-bold text-white mb-4">Hızlı İşlemler</h3>
                            <div className="space-y-2">
                                <Link 
                                    href="/forum/new-topic"
                                    className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-colors flex items-center gap-3"
                                >
                                    <MessageSquare size={18} />
                                    Yeni Konu Aç
                                </Link>
                                <Link 
                                    href="/forum?filter=unanswered"
                                    className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-colors flex items-center gap-3"
                                >
                                    <HelpCircle size={18} />
                                    Cevapsız Sorular
                                </Link>
                                <Link 
                                    href="/community/leaderboard"
                                    className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-colors flex items-center gap-3"
                                >
                                    <Target size={18} />
                                    Liderlik Tablosu
                                </Link>
                            </div>
                        </motion.div>

                        {/* Daily Quest / Challenge */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Star size={20} className="text-white" />
                                <h3 className="font-bold text-white">Günlük Görev</h3>
                            </div>
                            <p className="text-white/80 text-sm mb-4">
                                Bugün 3 soruya cevap ver ve 150 XP kazan!
                            </p>
                            <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                                <div className="bg-white h-2 rounded-full" style={{ width: '33%' }}></div>
                            </div>
                            <div className="flex items-center justify-between text-white/80 text-xs">
                                <span>1/3 tamamlandı</span>
                                <span>+150 XP</span>
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
                            { icon: MessageCircle, title: 'Soru & Cevap', description: 'Deneyimli satıcılardan anında yanıt alın', color: 'cyan' },
                            { icon: BookOpen, title: 'Bilgi Paylaşımı', description: 'En iyi pratikleri öğrenin ve paylaşın', color: 'emerald' },
                            { icon: Users, title: 'Networking', description: 'Diğer satıcılarla bağlantı kurun', color: 'purple' },
                            { icon: Award, title: 'Ödül Sistemi', description: 'Katkılarınız için puan ve rozet kazanın', color: 'amber' },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center hover:shadow-xl transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${feature.color}-500/10 to-${feature.color}-500/10 dark:from-${feature.color}-500/20 dark:to-${feature.color}-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={24} className={`text-${feature.color}-600 dark:text-${feature.color}-400`} />
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
                                {(stats?.totalMembers || 25000).toLocaleString('tr-TR')}+ e-ticaret satıcısıyla birlikte büyüyün, öğrenin ve başarıya ulaşın.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/register"
                                    className="px-8 py-4 bg-white text-cyan-700 rounded-xl font-bold hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <UserPlus size={18} />
                                    Ücretsiz Üye Ol
                                </Link>
                                <Link
                                    href="/forum"
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/20"
                                >
                                    Forumu Keşfet
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

// Plus icon for the "first topic" link
function Plus({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}

// Pin icon
function Pin({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v10" />
            <path d="M2 12h10" />
            <path d="m21.17 8 1.42 1.41a2 2 0 0 1 0 2.83l-7.07 7.07a2 2 0 0 1-2.83 0L6.17 13.66a2 2 0 0 1 0-2.83L8 9" />
        </svg>
    );
}
