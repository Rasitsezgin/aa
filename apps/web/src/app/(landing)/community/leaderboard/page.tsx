"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy, Medal, Crown, Star, TrendingUp, TrendingDown, Minus,
  Users, MessageSquare, Heart, Award, Calendar, ChevronLeft,
  Flame, Target, Zap, Search, Filter, ArrowUpRight,
  Clock, CheckCircle2, BadgeCheck, Sparkles
} from 'lucide-react';
import { communityService } from '@/lib/services/community-service';

interface LeaderboardUser {
  rank: number;
  id: string;
  userId: string;
  name: string;
  avatar: string;
  joinedAt: string;
  points: number;
  reputation: number;
  postCount: number;
  topicCount: number;
  helpfulCount: number;
  thanksReceived: number;
  thanksGiven: number;
  periodPosts: number;
  periodReputation: number;
  level: number;
  xp: number;
  currentXp: number;
  xpToNext: number;
  progress: number;
  group: {
    name: string;
    color: string;
    icon?: string;
  };
  badges: Array<{
    name: string;
    icon: string;
    color: string;
    description?: string;
    earnedAt: string;
  }>;
  isOnline: boolean;
  lastActivity: string;
  change: number; // Sıralama değişimi
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'monthly' | 'weekly' | 'daily'>('all');
  const [sortBy, setSortBy] = useState<'points' | 'reputation' | 'posts' | 'helpful'>('points');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/community/leaderboard?period=${period}&sortBy=${sortBy}&limit=100`);
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period, sortBy]);

  const filteredUsers = searchQuery
    ? users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const top3 = filteredUsers.slice(0, 3);
  const rest = filteredUsers.slice(3);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'from-amber-400 to-orange-500';
    if (rank === 2) return 'from-slate-300 to-slate-400';
    if (rank === 3) return 'from-amber-600 to-amber-700';
    return 'from-cyan-500 to-teal-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily': return 'Bugün';
      case 'weekly': return 'Bu Hafta';
      case 'monthly': return 'Bu Ay';
      default: return 'Tüm Zamanlar';
    }
  };

  return (
    <section className="min-h-screen pt-32 pb-24 bg-slate-50 dark:bg-[#02040a]">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link 
            href="/community" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition-colors mb-6"
          >
            <ChevronLeft size={20} />
            Topluluğa Dön
          </Link>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <Trophy className="w-12 h-12 text-amber-500" />
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
              Liderlik Tablosu
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            En aktif katkıda bulunan üyelerimiz ve başarıları
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Period Filter */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/10 rounded-xl p-1">
              {[
                { key: 'all', label: 'Tümü', icon: Trophy },
                { key: 'monthly', label: 'Aylık', icon: Calendar },
                { key: 'weekly', label: 'Haftalık', icon: Clock },
                { key: 'daily', label: 'Günlük', icon: Flame },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    period === key
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="points">Puana Göre</option>
                <option value="reputation">Repütasyona Göre</option>
                <option value="posts">Gönderiye Göre</option>
                <option value="helpful">Faydalı Yanıta Göre</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kullanıcı ara..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length > 0 && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
              >
                {top3.map((user, index) => {
                  const isFirst = index === 0;
                  const order = isFirst ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3';
                  const scale = isFirst ? 'md:scale-110' : 'md:scale-100';
                  const padding = isFirst ? 'md:py-8' : 'md:py-6';
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`relative ${order} ${scale} z-${isFirst ? 10 : 0}`}
                    >
                      <div className={`bg-gradient-to-br ${getRankStyle(user.rank)} rounded-2xl p-6 ${padding} text-center relative overflow-hidden`}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                          backgroundSize: '16px 16px'
                        }} />
                        
                        {/* Crown */}
                        {isFirst && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.5, type: 'spring' }}
                            className="absolute -top-4 left-1/2 -translate-x-1/2"
                          >
                            <Crown className="w-12 h-12 text-amber-300 drop-shadow-lg" />
                          </motion.div>
                        )}
                        
                        <div className="relative">
                          {/* Avatar */}
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white border-4 border-white/30">
                            {user.avatar}
                          </div>
                          
                          {/* Rank */}
                          <div className="absolute top-0 right-1/4 w-8 h-8 rounded-full bg-white text-amber-600 font-bold flex items-center justify-center text-sm shadow-lg">
                            #{user.rank}
                          </div>
                          
                          {/* Info */}
                          <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                          <span 
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3"
                            style={{ backgroundColor: user.group.color }}
                          >
                            {user.group.name}
                          </span>
                          
                          {/* Stats */}
                          <div className="flex items-center justify-center gap-4 text-white/90">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{user.points.toLocaleString('tr-TR')}</div>
                              <div className="text-xs opacity-75">Puan</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{user.level}</div>
                              <div className="text-xs opacity-75">Seviye</div>
                            </div>
                          </div>
                          
                          {/* Badges */}
                          {user.badges.length > 0 && (
                            <div className="flex items-center justify-center gap-1 mt-3">
                              {user.badges.slice(0, 3).map((badge, i) => (
                                <span key={i} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs" title={badge.name}>
                                  {badge.icon}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* List View */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-400">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5 md:col-span-4">Kullanıcı</div>
                <div className="col-span-3 md:col-span-2 text-center">Seviye</div>
                <div className="col-span-3 md:col-span-2 text-center">Puan</div>
                <div className="hidden md:block md:col-span-2 text-center">Katılım</div>
                <div className="col-span-1 text-center">Değişim</div>
              </div>

              {/* Rows */}
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                      user.rank <= 3 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold text-sm">
                        {getRankIcon(user.rank) || user.rank}
                      </div>
                    </div>

                    {/* User */}
                    <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                          {user.avatar}
                        </div>
                        {user.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white truncate flex items-center gap-2">
                          {user.name}
                          {user.badges.some(b => b.name.includes('Elite') || b.name.includes('Admin')) && (
                            <BadgeCheck size={14} className="text-cyan-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-[10px] px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: user.group.color }}
                          >
                            {user.group.name}
                          </span>
                          {user.periodPosts > 0 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              +{user.periodPosts} gönderi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Level */}
                    <div className="col-span-3 md:col-span-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.level}
                        </div>
                        <div className="hidden md:block w-16">
                          <div className="h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                              style={{ width: `${user.progress}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {user.currentXp}/{user.xpToNext} XP
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="col-span-3 md:col-span-2 text-center">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {user.points.toLocaleString('tr-TR')}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {user.reputation} rep • {user.postCount} gönderi
                      </div>
                    </div>

                    {/* Stats Detail - Desktop */}
                    <div className="hidden md:block md:col-span-2">
                      <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 text-xs" title="Gönderi">
                          <MessageSquare size={12} />
                          {user.postCount}
                        </span>
                        <span className="flex items-center gap-1 text-xs" title="Faydalı">
                          <Heart size={12} />
                          {user.helpfulCount}
                        </span>
                        <span className="flex items-center gap-1 text-xs" title="Teşekkür">
                          <Award size={12} />
                          {user.thanksReceived}
                        </span>
                      </div>
                    </div>

                    {/* Change */}
                    <div className="col-span-1 text-center">
                      <div className={`inline-flex items-center gap-0.5 text-sm font-medium ${
                        user.change > 0 ? 'text-emerald-600' : user.change < 0 ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {getChangeIcon(user.change)}
                        {user.change !== 0 && Math.abs(user.change)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Kullanıcı bulunamadı</p>
                </div>
              )}
            </motion.div>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            >
              <div className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 dark:from-cyan-500/20 dark:to-teal-500/20 rounded-2xl p-6 border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Target size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Nasıl Puan Kazanılır?</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Gönderi paylaş: +5 puan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Faydalı yanıt: +20 puan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Repütasyon: +10 puan
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Star size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Seviye Sistemi</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    Her seviye için XP hedefi artar
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    Seviye atladıkça özel rozetler
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    Top 10 özel profil rozeti
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Flame size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Günlük Görevler</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Zap size={14} className="text-purple-500" />
                    Günlük giriş: +10 XP
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap size={14} className="text-purple-500" />
                    3 yanıt ver: +30 XP
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap size={14} className="text-purple-500" />
                    Soru çöz: +50 XP bonus
                  </li>
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
