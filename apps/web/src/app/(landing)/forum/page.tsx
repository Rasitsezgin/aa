"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Users, TrendingUp, Clock, Search, Plus, Bell,
  User, Shield, Award, Heart, ThumbsUp, MessageCircle, ChevronRight,
  Pin, Lock, Eye, Hash, Flame, Sparkles, CheckCircle, ChevronLeft,
  BookOpen, HelpCircle, Zap, Globe, Filter, ArrowUpRight, Activity,
  Crown, Target, Star, Calendar, Folder, ChevronDown, BarChart3,
  Reply, EyeOff, StickyNote, FileText, Menu, X, Home, LogIn, UserPlus,
  MoreHorizontal, AlertCircle, CheckCircle2
} from "lucide-react";
import { communityService } from "@/lib/services/community-service";

interface ForumTopic {
  id: string;
  title: string;
  slug: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    level?: string;
    isStaff?: boolean;
  };
  board: {
    id: string;
    name: string;
    slug: string;
  };
  replies: number;
  views: number;
  lastPost: {
    author: string;
    date: Date;
  };
  createdAt: Date;
  isPinned?: boolean;
  isLocked?: boolean;
  isSolved?: boolean;
  isHot?: boolean;
  hasPoll?: boolean;
  tags?: string[];
}

interface ForumBoard {
  id: string;
  name: string;
  slug: string;
  description?: string;
  topicCount: number;
  postCount: number;
  lastTopic?: ForumTopic;
  moderators?: string[];
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  boards: ForumBoard[];
  isExpanded?: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  isStaff?: boolean;
  isModerator?: boolean;
}

interface ForumStats {
  totalTopics: number;
  totalPosts: number;
  totalMembers: number;
  newestMember: string;
  onlineUsers: number;
  onlineGuests: number;
  mostOnline: number;
  mostOnlineDate: string;
}

export default function ForumHomePage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [stats, setStats] = useState<ForumStats>({
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

  // Mock veri - vBulletin/XenForo tarzı
  useEffect(() => {
    const mockCategories: ForumCategory[] = [
      {
        id: "1",
        name: "Genel",
        slug: "genel",
        description: "Forum hakkında duyurular ve genel tartışmalar",
        isExpanded: true,
        boards: [
          {
            id: "1",
            name: "Duyurular",
            slug: "duyurular",
            description: "Resmi duyurular ve güncellemeler",
            topicCount: 42,
            postCount: 386,
            moderators: ["Admin", "Moderatör1"]
          },
          {
            id: "2",
            name: "Forum Kuralları",
            slug: "kurallar",
            description: "Topluluk kuralları ve yönergeler",
            topicCount: 15,
            postCount: 128
          },
          {
            id: "3",
            name: "Öneriler & Şikayetler",
            slug: "oneriler",
            description: "Geri bildirim ve önerileriniz",
            topicCount: 89,
            postCount: 567
          }
        ]
      },
      {
        id: "2",
        name: "E-Ticaret Platformları",
        slug: "eticaret",
        isExpanded: true,
        boards: [
          {
            id: "4",
            name: "Trendyol",
            slug: "trendyol",
            topicCount: 1254,
            postCount: 8934
          },
          {
            id: "5",
            name: "Hepsiburada",
            slug: "hepsiburada",
            topicCount: 892,
            postCount: 6231
          },
          {
            id: "6",
            name: "Amazon FBA",
            slug: "amazon-fba",
            topicCount: 756,
            postCount: 5210
          },
          {
            id: "7",
            name: "Shopify",
            slug: "shopify",
            topicCount: 634,
            postCount: 4352
          }
        ]
      },
      {
        id: "3",
        name: "Strateji & Teknik",
        slug: "strateji",
        isExpanded: false,
        boards: [
          {
            id: "8",
            name: "Fiyatlandırma",
            slug: "fiyatlandirma",
            topicCount: 423,
            postCount: 3102
          },
          {
            id: "9",
            name: "Stok & Tedarik",
            slug: "stok",
            topicCount: 567,
            postCount: 4120
          },
          {
            id: "10",
            name: "Reklam & Pazarlama",
            slug: "pazarlama",
            topicCount: 734,
            postCount: 5680
          }
        ]
      },
      {
        id: "4",
        name: "Yardım & Destek",
        slug: "destek",
        isExpanded: false,
        boards: [
          {
            id: "11",
            name: "Yeni Başlayanlar",
            slug: "yeni-baslayanlar",
            topicCount: 1234,
            postCount: 8901
          },
          {
            id: "12",
            name: "Teknik Sorunlar",
            slug: "teknik",
            topicCount: 892,
            postCount: 6123
          }
        ]
      }
    ];

    const mockTopics: ForumTopic[] = [
      {
        id: "1",
        title: "Trendyol'da Fiyatlandırma Stratejileri - Detaylı Rehber",
        slug: "trendyol-fiyatlandirma-rehberi",
        author: { id: "101", name: "E-Ticaretçi", level: "Elite", isStaff: false },
        board: { id: "4", name: "Trendyol", slug: "trendyol" },
        replies: 45,
        views: 1250,
        lastPost: { author: "E-Ticaretçi", date: new Date(Date.now() - 1000 * 60 * 5) },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isPinned: true,
        isHot: true,
        tags: ["fiyatlandırma", "strateji"]
      },
      {
        id: "2",
        title: "Amazon'da Hangi Ürünler Satılır? 2024 Trend Analizi",
        slug: "amazon-trend-2024",
        author: { id: "102", name: "AmazonUzmanı", level: "Üye" },
        board: { id: "6", name: "Amazon FBA", slug: "amazon-fba" },
        replies: 32,
        views: 980,
        lastPost: { author: "Satıcı123", date: new Date(Date.now() - 1000 * 60 * 15) },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        isHot: true
      },
      {
        id: "3",
        title: "Hepsiburada Komisyon Oranları Güncellemesi",
        slug: "hepsiburada-komisyon-2024",
        author: { id: "103", name: "Admin", level: "Yönetici", isStaff: true },
        board: { id: "5", name: "Hepsiburada", slug: "hepsiburada" },
        replies: 78,
        views: 3200,
        lastPost: { author: "Admin", date: new Date(Date.now() - 1000 * 60 * 2) },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isPinned: true,
        isHot: true,
        hasPoll: true
      },
      {
        id: "4",
        title: "Shopify SEO Optimizasyonu İçin İpuçları",
        slug: "shopify-seo-ipuclari",
        author: { id: "104", name: "SEO_Master", level: "Veteran" },
        board: { id: "7", name: "Shopify", slug: "shopify" },
        replies: 23,
        views: 567,
        lastPost: { author: "YeniSatıcı", date: new Date(Date.now() - 1000 * 60 * 30) },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        isSolved: true
      },
      {
        id: "5",
        title: "Stok Yönetiminde Excel Alternatifleri",
        slug: "stok-excel-alternatifler",
        author: { id: "105", name: "Stokçu", level: "Üye" },
        board: { id: "9", name: "Stok & Tedarik", slug: "stok" },
        replies: 15,
        views: 345,
        lastPost: { author: "TedarikçiX", date: new Date(Date.now() - 1000 * 60 * 45) },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
        isLocked: true
      },
      {
        id: "6",
        title: "Yeni Başlayanlar İçin Tavsiyeler",
        slug: "yeni-baslayanlar-tavsiye",
        author: { id: "106", name: "DeneyimliSatıcı", level: "Elite" },
        board: { id: "11", name: "Yeni Başlayanlar", slug: "yeni-baslayanlar" },
        replies: 156,
        views: 5600,
        lastPost: { author: "DeneyimliSatıcı", date: new Date(Date.now() - 1000 * 60) },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        isHot: true,
        isPinned: true
      },
      {
        id: "7",
        title: "Google Ads Bütçe Optimizasyonu",
        slug: "google-ads-butce",
        author: { id: "107", name: "PazarlamaPro", level: "Veteran" },
        board: { id: "10", name: "Reklam & Pazarlama", slug: "pazarlama" },
        replies: 28,
        views: 890,
        lastPost: { author: "Reklamcı", date: new Date(Date.now() - 1000 * 60 * 20) },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
      }
    ];

    const mockOnlineUsers: OnlineUser[] = [
      { id: "1", name: "Admin", avatar: "A", status: "online", isStaff: true },
      { id: "2", name: "Moderatör1", avatar: "M", status: "online", isModerator: true },
      { id: "3", name: "E-Ticaretçi", avatar: "E", status: "online" },
      { id: "4", name: "AmazonUzmanı", avatar: "A", status: "online" },
      { id: "5", name: "DeneyimliSatıcı", avatar: "D", status: "away" },
      { id: "6", name: "SEO_Master", avatar: "S", status: "online" },
      { id: "7", name: "PazarlamaPro", avatar: "P", status: "busy" },
      { id: "8", name: "YeniSatıcı", avatar: "Y", status: "online" },
      { id: "9", name: "Stokçu", avatar: "S", status: "away" },
      { id: "10", name: "TedarikçiX", avatar: "T", status: "online" },
    ];

    const mockStats: ForumStats = {
      totalTopics: 8654,
      totalPosts: 52341,
      totalMembers: 12450,
      newestMember: "YeniSatıcı2024",
      onlineUsers: 156,
      onlineGuests: 423,
      mostOnline: 892,
      mostOnlineDate: "15 Mart 2024"
    };

    setCategories(mockCategories);
    setPopularTopics(mockTopics);
    setOnlineUsers(mockOnlineUsers);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const toggleCategory = (catId: string) => {
    setCategories(prev => prev.map(c => 
      c.id === catId ? { ...c, isExpanded: !c.isExpanded } : c
    ));
  };

  // vBulletin/XenForo tarzı klasik forum
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0a0a] pt-20 pb-12">
      {/* Üst Navigation Bar */}
      <div className="bg-slate-800 dark:bg-[#111] text-white border-b border-slate-700 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-6">
              <span className="text-sm text-slate-400">
                <span className="text-emerald-400 font-medium">{stats.onlineUsers + stats.onlineGuests}</span> çevrimiçi ({stats.onlineUsers} üye, {stats.onlineGuests} misafir)
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                <LogIn size={14} />
                Giriş Yap
              </Link>
              <Link href="/register" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                <UserPlus size={14} />
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ana Header */}
      <header className="bg-gradient-to-r from-cyan-700 to-teal-700 dark:from-cyan-800 dark:to-teal-800 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="font-bold text-2xl text-white">PAZARYÖNETİMİ</span>
                  <span className="block text-xs text-cyan-200">E-Ticaret Forumu</span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Forumda ara..."
                  className="pl-10 pr-4 py-2 w-72 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <Link 
                href="/forum/new-topic"
                className="px-5 py-2.5 bg-white text-cyan-700 font-semibold rounded-lg text-sm hover:bg-cyan-50 transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus size={18} />
                Yeni Konu
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-slate-900 dark:bg-[#0a0a0a] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-12 overflow-x-auto">
            <Link href="/" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <Home size={16} />
              Ana Sayfa
            </Link>
            <Link href="/forum" className="px-4 py-2 text-cyan-400 border-b-2 border-cyan-400 text-sm font-medium flex items-center gap-2">
              <MessageSquare size={16} />
              Forum
            </Link>
            <Link href="/community" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <Users size={16} />
              Topluluk
            </Link>
            <Link href="/community/leaderboard" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <Crown size={16} />
              Liderlik
            </Link>
            <Link href="/webinars" className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium flex items-center gap-2 transition-colors">
              <Calendar size={16} />
              Etkinlikler
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#111] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/" className="hover:text-cyan-600">Ana Sayfa</Link>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-white font-medium">Forum</span>
          </div>
        </div>
      </div>

      {/* Main Content - vBulletin Style 3 Column */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - Forum Tree */}
          <div className="lg:col-span-3 space-y-4">
            {/* Forum Kategorileri */}
            <div className="bg-white dark:bg-[#111] rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Folder size={16} className="text-cyan-600" />
                  Forum Bölümleri
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id}>
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{cat.name}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${cat.isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {cat.isExpanded && (
                        <div className="bg-slate-50/50 dark:bg-black/20">
                          {cat.boards.map(board => (
                            <Link
                              key={board.id}
                              href={`/forum/board/${board.slug}`}
                              className="block px-4 py-2.5 pl-8 text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors border-l-2 border-transparent hover:border-cyan-500"
                            >
                              <div className="flex items-center justify-between">
                                <span>{board.name}</span>
                                <span className="text-xs text-slate-400">({board.topicCount})</span>
                              </div>
                              {board.description && (
                                <p className="text-xs text-slate-400 mt-0.5">{board.description}</p>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Hızlı Linkler */}
            <div className="bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg p-4 shadow-lg">
              <h3 className="font-bold text-white mb-3 text-sm">Hızlı Erişim</h3>
              <div className="space-y-2">
                <Link href="/forum/new-topic" className="flex items-center gap-2 text-white/90 hover:text-white text-sm py-1.5">
                  <Plus size={14} /> Yeni Konu Aç
                </Link>
                <Link href="/community/leaderboard" className="flex items-center gap-2 text-white/90 hover:text-white text-sm py-1.5">
                  <Crown size={14} /> Liderlik Tablosu
                </Link>
                <Link href="/community" className="flex items-center gap-2 text-white/90 hover:text-white text-sm py-1.5">
                  <Activity size={14} /> Aktivite
                </Link>
              </div>
            </div>
          </div>

          {/* CENTER - Topic List (vBulletin Style Table) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Topic List Header */}
            <div className="bg-slate-800 dark:bg-[#1a1a1a] text-white rounded-t-lg px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <Flame size={18} className="text-orange-400" />
                Son Konular
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Sıralama:</span>
                <select className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none">
                  <option>Son Aktivite</option>
                  <option>En Yeni</option>
                  <option>En Çok Cevap</option>
                  <option>En Çok Görüntüleme</option>
                </select>
              </div>
            </div>

            {/* Topic Table */}
            <div className="bg-white dark:bg-[#111] rounded-b-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : popularTopics.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Henüz konu bulunmuyor.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {popularTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${topic.isPinned ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                    >
                      {/* Icon Column */}
                      <div className="shrink-0 pt-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          topic.isPinned ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          topic.isHot ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                          topic.isLocked ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                          topic.isSolved ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        }`}>
                          {topic.isPinned ? <Pin size={18} /> :
                           topic.isLocked ? <Lock size={18} /> :
                           topic.isSolved ? <CheckCircle size={18} /> :
                           topic.hasPoll ? <BarChart3 size={18} /> :
                           <MessageSquare size={18} />}
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {topic.isPinned && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">SABİT</span>
                          )}
                          {topic.isHot && (
                            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded">POPÜLER</span>
                          )}
                          <Link 
                            href={`/forum/board/${topic.board.slug}`}
                            className="text-xs text-cyan-600 hover:underline"
                          >
                            {topic.board.name}
                          </Link>
                        </div>
                        
                        <Link href={`/forum/topic/${topic.slug}`} className="group">
                          <h3 className={`font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors ${topic.isPinned ? 'text-base' : 'text-sm'}`}>
                            {topic.title}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            <Link href={`/forum/user/${topic.author.id}`} className="hover:text-cyan-600">
                              {topic.author.name}
                            </Link>
                            {topic.author.isStaff && <Shield size={10} className="text-cyan-500" />}
                          </span>
                          <span>•</span>
                          <span>{communityService.formatRelativeTime(topic.createdAt)}</span>
                          {topic.tags?.map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats Column */}
                      <div className="shrink-0 text-center text-sm">
                        <div className="font-bold text-slate-900 dark:text-white">{topic.replies}</div>
                        <div className="text-xs text-slate-400">cevap</div>
                      </div>

                      {/* Views Column */}
                      <div className="shrink-0 text-center text-sm hidden sm:block">
                        <div className="font-bold text-slate-900 dark:text-white">{topic.views.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">görüntü</div>
                      </div>

                      {/* Last Post Column */}
                      <div className="shrink-0 text-right text-xs hidden md:block w-32">
                        <div className="text-slate-600 dark:text-slate-400">
                          <span className="font-medium text-slate-900 dark:text-white">{topic.lastPost.author}</span>
                        </div>
                        <div className="text-slate-400">
                          {communityService.formatRelativeTime(topic.lastPost.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Sayfa 1 / 1
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed">
                    &laquo; Önceki
                  </button>
                  <button className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm font-medium">
                    1
                  </button>
                  <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 cursor-not-allowed">
                    Sonraki &raquo;
                  </button>
                </div>
              </div>
            </div>

            {/* Forum Legend */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">İkon Açıklamaları:</span>
              <span className="flex items-center gap-1"><Pin size={14} className="text-amber-500" /> Sabit</span>
              <span className="flex items-center gap-1"><Lock size={14} className="text-red-500" /> Kilitli</span>
              <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500" /> Çözüldü</span>
              <span className="flex items-center gap-1"><Flame size={14} className="text-orange-500" /> Popüler</span>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-3 space-y-4">
            {/* Online Users Box */}
            <div className="bg-white dark:bg-[#111] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 border-b border-emerald-100 dark:border-emerald-800">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Users size={16} />
                  Çevrimiçi Üyeler
                </h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Şu anda <strong className="text-emerald-600">{stats.onlineUsers}</strong> üye çevrimiçi
                </p>
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/forum/user/${user.id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        user.status === 'online' ? 'bg-emerald-500' :
                        user.status === 'away' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className={`${user.isStaff ? 'text-cyan-600 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                        {user.name}
                      </span>
                      {user.isStaff && <Shield size={10} className="text-cyan-500" />}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Forum Statistics */}
            <div className="bg-white dark:bg-[#111] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 size={16} className="text-cyan-600" />
                  Forum İstatistikleri
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Toplam Konu</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats.totalTopics.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Toplam Gönderi</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats.totalPosts.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Toplam Üye</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stats.totalMembers.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Son Üye: </span>
                    <Link href="#" className="text-cyan-600 hover:underline font-medium">
                      {stats.newestMember}
                    </Link>
                  </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div className="text-xs text-slate-500">
                    En çok çevrimiçi: <strong>{stats.mostOnline}</strong> ({stats.mostOnlineDate})
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Online */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
              <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                <Shield size={16} />
                Çevrimiçi Yetkililer
              </h4>
              <div className="space-y-2">
                {onlineUsers.filter(u => u.isStaff || u.isModerator).map(staff => (
                  <div key={staff.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{staff.name}</span>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {staff.isStaff ? '(Yönetici)' : '(Moderatör)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
