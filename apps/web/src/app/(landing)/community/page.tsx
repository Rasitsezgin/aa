"use client";


import MarketingPageShell from '@/components/landing/MarketingPageShell';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, HelpCircle, Lightbulb, Trophy, Calendar,
    ArrowRight, Search, TrendingUp, Heart, Zap, Award,
    MessageCircle, BookOpen, Video, Mic, ChevronRight,
    Globe, UserPlus, Bell, ThumbsUp, Eye, Clock,
    Sparkles, Target, Flame, Star, CheckCircle2, Activity, Radio, Plus, Pin
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { communityService, CommunityStats, ForumTopic, ForumCategory, TopContributor, CommunityEvent, CommunityOnboarding, CommunityGamification } from '@/lib/services/community-service';
import { useRealtimeStatus, useRealtimeActivities, useHeartbeat, useForumNotifications } from '@/lib/hooks/use-realtime';

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
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    
    // Data states
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [topics, setTopics] = useState<ForumTopic[]>([]);
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [contributors, setContributors] = useState<TopContributor[]>([]);
    const [events, setEvents] = useState<CommunityEvent[]>([]);
    const [unansweredTopics, setUnansweredTopics] = useState<ForumTopic[]>([]);
    const [onboarding, setOnboarding] = useState<CommunityOnboarding | null>(null);
    const [gamification, setGamification] = useState<CommunityGamification | null>(null);
    const [joiningEventId, setJoiningEventId] = useState<string | null>(null);
    
    // Loading states
    const [loading, setLoading] = useState({
        stats: true,
        topics: true,
        categories: true,
        contributors: true,
        events: true,
        onboarding: true,
        gamification: true,
    });

    // Real-time features
    const { status: realtimeStatus, loading: realtimeLoading } = useRealtimeStatus({ refreshInterval: 30000 });
    const { activities: realtimeActivities, loading: activitiesLoading } = useRealtimeActivities({ refreshInterval: 60000 });
    const { notifications, unreadCount, dmUnreadCount, markAsRead, markAllAsRead } = useForumNotifications();
    const [searchResults, setSearchResults] = useState<Array<{
        type: string; id: string; title: string; excerpt: string; url: string;
    }>>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // Send heartbeat to keep user online
    useHeartbeat(60000);

    // Fetch all data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, topicsData, categoriesData, contributorsData, eventsData, unansweredData, onboardingData, gamificationData] = await Promise.all([
                    communityService.getStats(),
                    communityService.getTopics({ limit: 10, sortBy: 'popular' }),
                    communityService.getCategories(),
                    communityService.getContributors({ limit: 5, period: 'weekly' }),
                    communityService.getEvents({ limit: 5 }),
                    communityService.getTopics({ limit: 5, sortBy: 'unanswered' }),
                    communityService.getOnboarding(),
                    communityService.getGamification(),
                ]);

                setStats(statsData);
                setTopics(topicsData);
                setCategories(categoriesData);
                setContributors(contributorsData);
                setEvents(eventsData);
                setUnansweredTopics(unansweredData);
                setOnboarding(onboardingData);
                setGamification(gamificationData);
            } catch (error) {
                console.error('Failed to fetch community data:', error);
                setStats({
                    totalMembers: 0,
                    totalTopics: 0,
                    totalPosts: 0,
                    solvedTopics: 0,
                    monthlyPosts: 0,
                    onlineUsers: 0,
                    onlineGuests: 0,
                    newestMember: '—',
                    growthRate: 0,
                    activeToday: 0,
                });
                setTopics([]);
                setCategories([]);
                setContributors([]);
                setEvents([]);
                setUnansweredTopics([]);
                setOnboarding(null);
                setGamification(null);
            } finally {
                setLoading({
                    stats: false,
                    topics: false,
                    categories: false,
                    contributors: false,
                    events: false,
                    onboarding: false,
                    gamification: false,
                });
            }
        };

        fetchData();
    }, [session?.user?.id]);

    const handleJoinEvent = async (eventId: string) => {
        if (!session) {
            window.location.href = `/signup?callbackUrl=${encodeURIComponent('/community')}`;
            return;
        }

        setJoiningEventId(eventId);
        try {
            const result = await communityService.joinEvent(eventId);
            setEvents((prev) =>
                prev.map((e) =>
                    e.id === eventId
                        ? { ...e, isRegistered: true, attendeeCount: result.attendeeCount }
                        : e,
                ),
            );
        } catch (error) {
            console.error('Event join failed:', error);
        } finally {
            setJoiningEventId(null);
        }
    };

    // Filter topics by category
    const filteredTopics = selectedCategory === 'Tümü' 
        ? topics 
        : topics.filter(t => t.category === selectedCategory);

    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const data = await communityService.search(searchQuery.trim());
                setSearchResults(data.results);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchFilteredTopics = searchQuery.trim().length >= 2
        ? []
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
        <MarketingPageShell as="section" className="pb-24" padded={false}>
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-orange-500/10 dark:bg-orange-500/20 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/20 blur-[150px] rounded-full" />
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
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 border border-orange-200/50 dark:border-orange-700/50 rounded-full mb-8"
                    >
                        <Users size={16} className="text-orange-600 dark:text-orange-400" />
                        <span className="text-sm font-bold text-orange-700 dark:text-orange-300 tracking-wide">TOPLULUK</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                        Birlikte{' '}
                        <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent">
                            Büyüyoruz
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
                        {loading.stats ? 'Yükleniyor...' : `${(stats?.totalMembers || 0).toLocaleString('tr-TR')}+ e-ticaret satıcısından oluşan topluluğumuza katılın.`}
                        <span className="text-orange-600 dark:text-orange-400 font-semibold"> Paylaşın, öğrenin, büyüyün.</span>
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
                                    <div className="text-3xl md:text-4xl font-black text-orange-600 dark:text-orange-400">
                                        {(stats?.monthlyPosts || 0).toLocaleString('tr-TR')}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Bu Ayki Gönderi</div>
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
                            href="/signup"
                            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                        >
                            <UserPlus size={18} />
                            Ücretsiz Kayıt Ol
                        </Link>
                        <Link
                            href="/forum/new-topic"
                            className="px-8 py-4 bg-white dark:bg-white/10 text-orange-700 dark:text-white border border-orange-200 dark:border-white/20 rounded-xl font-bold hover:bg-orange-50 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Konu Aç
                        </Link>
                        <Link
                            href="/forum"
                            className="px-8 py-4 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={18} />
                            Foruma Git
                        </Link>
                        {session && (
                            <button
                                type="button"
                                onClick={() => setShowNotifications((v) => !v)}
                                className="relative px-8 py-4 bg-white dark:bg-white/10 text-orange-700 dark:text-white border border-orange-200 dark:border-white/20 rounded-xl font-bold hover:bg-orange-50 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <Bell size={18} />
                                Bildirimler
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    {showNotifications && session && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-lg mx-auto mb-8 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl text-left"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-slate-900 dark:text-white">Bildirimler</h3>
                                <div className="flex items-center gap-3">
                                    <Link href="/forum/settings" className="text-xs text-slate-500 hover:text-orange-600">
                                        Ayarlar
                                    </Link>
                                    {dmUnreadCount > 0 && (
                                        <Link href="/forum/messages" className="text-xs text-orange-600 hover:underline">
                                            {dmUnreadCount} özel mesaj
                                        </Link>
                                    )}
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllAsRead}
                                            className="text-xs text-orange-600 hover:underline"
                                        >
                                            Tümünü okundu işaretle
                                        </button>
                                    )}
                                </div>
                            </div>
                            {notifications.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Bildirim yok</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-3 rounded-xl text-sm ${
                                                n.read
                                                    ? 'bg-slate-50 dark:bg-white/5'
                                                    : 'bg-orange-50 dark:bg-orange-900/20'
                                            }`}
                                        >
                                            <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                                            {n.message && (
                                                <p className="text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2">
                                                {n.actionUrl && (
                                                    <Link
                                                        href={n.actionUrl}
                                                        className="text-xs text-orange-600 hover:underline"
                                                        onClick={() => markAsRead(n.id)}
                                                    >
                                                        Görüntüle
                                                    </Link>
                                                )}
                                                {!n.read && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markAsRead(n.id)}
                                                        className="text-xs text-slate-500 hover:underline"
                                                    >
                                                        Okundu
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {!loading.stats && stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                    >
                        {[
                            { label: 'Bu ayki gönderi', value: stats.monthlyPosts, icon: MessageCircle },
                            { label: 'Çözülen soru', value: stats.solvedTopics, icon: CheckCircle2 },
                            { label: 'Çevrimiçi üye', value: stats.onlineUsers, icon: Users },
                            { label: 'Son üye', value: stats.newestMember, icon: UserPlus, isText: true },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                                    <item.icon size={16} />
                                    <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                                </div>
                                <div className={`font-black text-slate-900 dark:text-white ${item.isText ? 'text-sm truncate' : 'text-2xl'}`}>
                                    {item.isText ? item.value : Number(item.value).toLocaleString('tr-TR')}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

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
                                    placeholder="Forum, blog ve yardım içinde ara..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                                {searchQuery.trim().length >= 2 && (
                                    <div className="absolute z-20 top-full left-0 right-0 mt-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl max-h-80 overflow-y-auto">
                                        {searchLoading ? (
                                            <p className="text-sm text-slate-500 p-3">Aranıyor...</p>
                                        ) : searchResults.length === 0 ? (
                                            <p className="text-sm text-slate-500 p-3">Sonuç bulunamadı</p>
                                        ) : (
                                            searchResults.map((result) => (
                                                <Link
                                                    key={`${result.type}-${result.id}`}
                                                    href={result.url}
                                                    className="block p-3 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                                    onClick={() => setSearchQuery('')}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                            result.type === 'forum'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : result.type === 'blog'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {result.type === 'forum' ? 'Forum' : result.type === 'blog' ? 'Blog' : 'Yardım'}
                                                        </span>
                                                    </div>
                                                    <p className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{result.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{result.excerpt}</p>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                )}
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
                                                ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
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
                                                    ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
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
                                <Link href="/forum" className="text-sm text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
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
                            ) : searchQuery.trim().length >= 2 ? (
                                <div className="text-center py-12 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {searchLoading
                                            ? 'Forum, blog ve yardım içinde aranıyor...'
                                            : searchResults.length > 0
                                                ? `${searchResults.length} sonuç bulundu — yukarıdaki listeden seçin.`
                                                : 'Arama sonucu bulunamadı.'}
                                    </p>
                                </div>
                            ) : searchFilteredTopics.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <MessageSquare size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Henüz konu bulunmuyor.
                                    </p>
                                    <Link 
                                        href="/forum/new-topic" 
                                        className="inline-flex items-center gap-2 mt-4 text-orange-600 dark:text-orange-400 hover:underline"
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
                                                    className="block p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700/50 transition-all group"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Author Avatar */}
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
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
                                                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2 line-clamp-2">
                                                                {topic.title}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                                <span className="flex items-center gap-1">
                                                                    {topic.author.name}
                                                                    {topic.author.badge && (
                                                                        <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-[10px]">
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

                                                        <ChevronRight size={20} className="text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors shrink-0" />
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            <Link 
                                href="/forum"
                                className="w-full mt-4 py-3 text-center text-orange-600 dark:text-orange-400 font-medium hover:underline flex items-center justify-center gap-2"
                            >
                                Daha Fazla Konu Gör
                                <ArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* XP & Level */}
                        {!loading.gamification && gamification?.isAuthenticated && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.32 }}
                                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                        <Zap size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            Seviye {gamification.level} • {gamification.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {gamification.totalXp?.toLocaleString('tr-TR')} XP toplam
                                        </p>
                                    </div>
                                    {gamification.currentStreak ? (
                                        <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                                            <Flame size={14} />
                                            {gamification.currentStreak} gün
                                        </span>
                                    ) : null}
                                </div>
                                <div className="h-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                                        style={{ width: `${gamification.progress ?? 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {gamification.currentXp} / {gamification.xpToNext} XP sonraki seviyeye
                                </p>

                                {(gamification.marketplaceBadges?.length ?? 0) > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                            Pazaryeri Uzmanlıkları
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {gamification.marketplaceBadges?.map((badge) => (
                                                <span
                                                    key={badge.name}
                                                    title={badge.description ?? badge.name}
                                                    className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
                                                    style={{ backgroundColor: badge.color }}
                                                >
                                                    {badge.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Daily Quests */}
                        {!loading.gamification && gamification?.isAuthenticated && (gamification.quests?.length ?? 0) > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.34 }}
                                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                            <Target size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">Günlük Görevler</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {gamification.completedQuestsToday}/{gamification.totalDailyQuests} tamamlandı
                                            </p>
                                        </div>
                                    </div>
                                    <Award size={18} className="text-orange-500" />
                                </div>
                                <div className="space-y-3">
                                    {gamification.quests?.map((quest) => (
                                        <div key={quest.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm font-semibold ${
                                                    quest.isCompleted
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-slate-900 dark:text-white'
                                                }`}>
                                                    {quest.isCompleted && <CheckCircle2 size={12} className="inline mr-1" />}
                                                    {quest.title}
                                                </span>
                                                <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">
                                                    +{quest.xpReward} XP
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        quest.isCompleted
                                                            ? 'bg-emerald-500'
                                                            : 'bg-orange-500'
                                                    }`}
                                                    style={{ width: `${quest.percent}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                {quest.progress}/{quest.targetCount}
                                                {quest.type === 'weekly' ? ' • haftalık' : ' • günlük'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Onboarding Checklist */}
                        {!loading.onboarding && onboarding && !onboarding.isComplete && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800/50"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                                        <Target size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Başlangıç Rehberi</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {onboarding.completedCount}/{onboarding.totalCount} adım tamamlandı
                                        </p>
                                    </div>
                                </div>

                                <div className="h-2 bg-orange-200/60 dark:bg-orange-900/40 rounded-full mb-4 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                                        style={{ width: `${(onboarding.completedCount / onboarding.totalCount) * 100}%` }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    {onboarding.steps.map((step) => (
                                        <Link
                                            key={step.id}
                                            href={step.href}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                                step.completed
                                                    ? 'bg-white/60 dark:bg-white/5 opacity-70'
                                                    : 'bg-white dark:bg-white/10 hover:bg-orange-100 dark:hover:bg-orange-900/20'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                                step.completed
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-200'
                                            }`}>
                                                {step.completed ? <CheckCircle2 size={14} /> : <span className="text-xs font-bold">•</span>}
                                            </div>
                                            <span className={`text-sm font-medium ${
                                                step.completed
                                                    ? 'text-slate-500 line-through'
                                                    : 'text-slate-900 dark:text-white'
                                            }`}>
                                                {step.label}
                                            </span>
                                            {!step.completed && <ChevronRight size={14} className="ml-auto text-orange-500" />}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

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
                                        <Link key={user.id} href={`/forum/user/${user.id}`} className="flex items-center gap-3 group">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
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
                                                {user.badges && user.badges.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {user.badges.map((badge) => (
                                                            <span
                                                                key={badge.name}
                                                                title={badge.name}
                                                                className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                                                                style={{ backgroundColor: badge.color }}
                                                            >
                                                                {badge.isMarketplace ? badge.name.split(' ')[0] : badge.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                user.rank === 1 ? 'bg-amber-400 text-amber-900' :
                                                user.rank === 2 ? 'bg-slate-300 text-slate-700' :
                                                user.rank === 3 ? 'bg-amber-600 text-white' :
                                                'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                            }`}>
                                                {user.rank}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <Link href="/community/leaderboard" className="block mt-4 text-center text-sm text-orange-600 dark:text-orange-400 hover:underline">
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
                                        <div key={event.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                                    event.isOnline 
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                                                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    {event.isOnline ? <Video size={18} /> : <Users size={18} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                        {event.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {event.formattedDate} • {event.formattedTime}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded text-slate-600 dark:text-slate-400">
                                                            {event.isOnline ? 'Online' : 'Yüz yüze'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            {event.attendeeCount} katılımcı
                                                        </span>
                                                    </div>
                                                    <div className="mt-2">
                                                        {event.isRegistered ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                                <CheckCircle2 size={12} />
                                                                Katıldın
                                                            </span>
                                                        ) : session ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleJoinEvent(event.id)}
                                                                disabled={joiningEventId === event.id}
                                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 transition-colors"
                                                            >
                                                                {joiningEventId === event.id ? 'Kaydediliyor...' : 'Katıl'}
                                                            </button>
                                                        ) : (
                                                            <Link
                                                                href={`/signup?callbackUrl=${encodeURIComponent('/community')}`}
                                                                className="inline-block px-3 py-1.5 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                                                            >
                                                                Katılmak için kayıt ol
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Link href="/webinars" className="block mt-4 text-center text-sm text-orange-600 dark:text-orange-400 hover:underline">
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
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-600 flex items-center justify-center">
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
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
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
                                                            className="text-xs text-orange-600 dark:text-orange-400 hover:underline truncate block"
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
                                        <Users size={18} className="text-orange-600" />
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
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
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
                            className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600"
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
                                    href="/forum"
                                    className="w-full p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-colors flex items-center gap-3"
                                >
                                    <HelpCircle size={18} />
                                    Cevapsız Sorular ({unansweredTopics.length})
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

                        {unansweredTopics.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <HelpCircle size={18} className="text-orange-600" />
                                    <h3 className="font-bold text-slate-900 dark:text-white">Cevapsız Sorular</h3>
                                </div>
                                <div className="space-y-2">
                                    {unansweredTopics.map((topic) => (
                                        <Link
                                            key={topic.id}
                                            href={`/forum/topic/${topic.slug}`}
                                            className="block p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                                        >
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{topic.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{topic.author.name} • {topic.category}</p>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
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
                            { icon: MessageCircle, title: 'Soru & Cevap', description: 'Deneyimli satıcılardan anında yanıt alın', color: 'orange' },
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
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-emerald-600" />
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
                                {(stats?.totalMembers || 0).toLocaleString('tr-TR')}+ e-ticaret satıcısıyla birlikte büyüyün, öğrenin ve başarıya ulaşın.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/signup"
                                    className="px-8 py-4 bg-white text-orange-700 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <UserPlus size={18} />
                                    Ücretsiz Üye Ol
                                </Link>
                                <Link
                                    href="/forum/new-topic"
                                    className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2 border border-white/20"
                                >
                                    İlk Konunu Aç
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </MarketingPageShell>
    );
}
