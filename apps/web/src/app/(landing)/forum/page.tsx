"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Users, TrendingUp, Clock, Search, Plus, Bell,
  User, Shield, Award, Heart, ThumbsUp, MessageCircle, ChevronRight,
  Pin, Lock, Eye, Hash, Flame, Sparkles, CheckCircle, ChevronLeft,
  BookOpen, HelpCircle, Zap, Globe, Filter, ArrowUpRight, Activity,
  Crown, Target, Star, Calendar
} from "lucide-react";
import { communityService } from "@/lib/services/community-service";

interface ForumBoard {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  icon?: string;
  color: string;
  topicCount: number;
  postCount: number;
  lastTopic?: {
    id: string;
    title: string;
    slug: string;
    author: string;
    authorAvatar?: string;
    postedAt: string;
  };
  isNew?: boolean;
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  boards: ForumBoard[];
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  badge?: string;
  status: "online" | "away" | "busy";
  isStaff?: boolean;
}

export default function ForumHomePage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalPosts: 0,
    totalMembers: 0,
    newestMember: "",
    onlineUsers: 0,
    onlineGuests: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [popularTopics, setPopularTopics] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, statsData, topicsData] = await Promise.all([
          communityService.getCategories(),
          communityService.getStats(),
          communityService.getTopics({ limit: 5, sortBy: 'popular' }),
        ]);

        // Kategorileri board yapısına dönüştür
        const formattedCategories: ForumCategory[] = categoriesData.map((cat, index) => ({
          ...cat,
          boards: [{
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            type: 'FORUM',
            icon: cat.icon,
            color: cat.color,
            topicCount: cat.topicCount,
            postCount: cat.topicCount * 3, // Tahmini
            isNew: index < 2,
          }]
        }));

        setCategories(formattedCategories);
        setStats(statsData);
        setPopularTopics(topicsData);
        
        // Mock online users - gerçek veri için ayrı API gerekir
        setOnlineUsers([
          { id: "1", name: "Admin", avatar: "AD", badge: "Yönetici", status: "online", isStaff: true },
          { id: "2", name: "Moderatör", avatar: "MD", badge: "Moderatör", status: "online", isStaff: true },
          { id: "3", name: "Ahmet Y.", avatar: "AY", badge: "Elite", status: "online" },
          { id: "4", name: "Zeynep K.", avatar: "ZK", status: "away" },
          { id: "5", name: "Mert D.", avatar: "MD", status: "online" },
        ]);
      } catch (error) {
        console.error('Forum data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCategories = searchQuery
    ? categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.boards.some(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : categories;

  const iconMap: Record<string, any> = {
    MessageSquare, TrendingUp, Zap, BookOpen, Globe, HelpCircle,
    Users, Calendar, Award, Star, Target, Activity
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || MessageSquare;
    return <Icon size={20} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#02040a] pt-24 pb-12">
      {/* Header */}
      <header className="bg-white dark:bg-white/5 border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white">Forum</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/forum" className="px-3 py-2 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg text-sm font-medium">
                  Ana Sayfa
                </Link>
                <Link href="/community/leaderboard" className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Crown size={14} />
                  Liderlik
                </Link>
                <Link href="/community" className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Users size={14} />
                  Topluluk
                </Link>
                <Link href="/webinars" className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  Etkinlikler
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Forumda ara..."
                  className="pl-10 pr-4 py-2 w-64 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <Link 
                href="/forum/new-topic"
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Yeni Konu</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {loading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 animate-pulse">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats.totalTopics.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Konu</div>
                  </div>
                  <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats.totalPosts.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Gönderi</div>
                  </div>
                  <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {stats.totalMembers.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Üye</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {stats.onlineUsers + stats.onlineGuests}
                      </span>
                    </div>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">Çevrimiçi</div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Categories & Boards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                      <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="p-4 space-y-4">
                        {[1, 2].map((j) => (
                          <div key={j} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : filteredCategories.length === 0 ? (
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center">
                  <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">Sonuç bulunamadı</p>
                </div>
              ) : (
                filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${category.color}-100 dark:bg-${category.color}-900/30 text-${category.color}-600 dark:text-${category.color}-400`}>
                          {getIcon(category.icon || 'MessageSquare')}
                        </div>
                        <div>
                          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{category.name}</h2>
                          {category.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Boards */}
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {category.boards.map((board) => (
                        <Link
                          key={board.id}
                          href={`/forum/board/${board.slug}`}
                          className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${board.color}-100 dark:bg-${board.color}-900/30 text-${board.color}-600 dark:text-${board.color}-400 shrink-0`}>
                            {getIcon(board.icon || 'MessageSquare')}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {board.name}
                              </h3>
                              {board.isNew && (
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                                  YENİ
                                </span>
                              )}
                              {board.type === 'QNA' && (
                                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full flex items-center gap-1">
                                  <HelpCircle size={10} />
                                  S&C
                                </span>
                              )}
                            </div>
                            {board.description && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                {board.description}
                              </p>
                            )}
                          </div>

                          <div className="hidden md:flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                            <div className="text-center">
                              <div className="font-semibold text-slate-900 dark:text-white">{board.topicCount.toLocaleString('tr-TR')}</div>
                              <div className="text-xs">Konu</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-slate-900 dark:text-white">{board.postCount.toLocaleString('tr-TR')}</div>
                              <div className="text-xs">Gönderi</div>
                            </div>
                          </div>

                          <ChevronRight size={20} className="text-slate-400 group-hover:text-cyan-600 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Popular Topics */}
            {!loading && popularTopics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
              >
                <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">Popüler Konular</h2>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {popularTopics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/forum/topic/${topic.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {topic.author.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && <Pin size={12} className="text-amber-500" />}
                          {topic.isHot && <Flame size={12} className="text-red-500" />}
                          {topic.isSolved && <CheckCircle size={12} className="text-emerald-500" />}
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-slate-600 dark:text-slate-400">
                            {topic.category}
                          </span>
                        </div>
                        <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                          {topic.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>{topic.author.name}</span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            {topic.replies}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {topic.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {communityService.formatRelativeTime(topic.lastActivity)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-white/10">
                  <Link 
                    href="/community"
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center justify-center gap-1"
                  >
                    Tüm Konuları Gör
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Online Users */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Çevrimiçi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stats.onlineUsers} üye, {stats.onlineGuests} misafir
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {onlineUsers.slice(0, 8).map((user) => (
                  <Link
                    key={user.id}
                    href={`/forum/user/${user.id}`}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors group"
                  >
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.avatar}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-slate-800 ${
                        user.status === 'online' ? 'bg-emerald-500' : 
                        user.status === 'away' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 transition-colors">
                      {user.name}
                    </span>
                    {user.isStaff && <Shield size={12} className="text-cyan-500" />}
                  </Link>
                ))}
                {onlineUsers.length > 8 && (
                  <span className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                    +{onlineUsers.length - 8} daha...
                  </span>
                )}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-6 text-white"
            >
              <h3 className="font-bold mb-4">Hızlı Erişim</h3>
              <div className="space-y-2">
                <Link 
                  href="/forum/new-topic"
                  className="flex items-center gap-3 p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <Plus size={18} />
                  <span className="font-medium">Yeni Konu Aç</span>
                </Link>
                <Link 
                  href="/community/leaderboard"
                  className="flex items-center gap-3 p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <Crown size={18} />
                  <span className="font-medium">Liderlik Tablosu</span>
                </Link>
                <Link 
                  href="/community"
                  className="flex items-center gap-3 p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <Activity size={18} />
                  <span className="font-medium">Topluluk Aktivitesi</span>
                </Link>
              </div>
            </motion.div>

            {/* Community Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6"
            >
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Topluluk İstatistikleri</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Son Üye</span>
                  <span className="font-medium text-slate-900 dark:text-white">{stats.newestMember}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Toplam Konu</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {stats.totalTopics.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Toplam Gönderi</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {stats.totalPosts.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
