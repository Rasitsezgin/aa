"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Search,
  Plus,
  Bell,
  User,
  Shield,
  Award,
  Heart,
  ThumbsUp,
  MessageCircle,
  ChevronRight,
  Pin,
  Lock,
  Eye,
  Hash,
  Flame,
  Sparkles,
  CheckCircle,
} from "lucide-react";

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  boards: ForumBoard[];
}

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
    author: string;
    authorAvatar?: string;
    postedAt: string;
  };
  isNew?: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "away" | "busy";
  isStaff?: boolean;
}

interface ForumStats {
  totalTopics: number;
  totalPosts: number;
  totalMembers: number;
  newestMember: string;
  onlineUsers: number;
  onlineGuests: number;
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

  // Initialize mock data
  useState(() => {
    // Mock categories
    const mockCategories: ForumCategory[] = [
      {
        id: "1",
        name: "Genel",
        slug: "general",
        color: "blue",
        boards: [
          {
            id: "1",
            name: "Duyurular",
            slug: "announcements",
            type: "NORMAL",
            color: "red",
            topicCount: 156,
            postCount: 1200,
            isNew: false,
          },
        ],
      },
    ];
    setCategories(mockCategories);

    // Mock online users
    const mockOnlineUsers: OnlineUser[] = [
      { id: "1", name: "Admin", status: "online", isStaff: true },
      { id: "2", name: "User1", status: "online" },
    ];
    setOnlineUsers(mockOnlineUsers);

    // Mock stats
    setStats({
      totalTopics: 1234,
      totalPosts: 5678,
      totalMembers: 890,
      newestMember: "YeniUye123",
      onlineUsers: 42,
      onlineGuests: 15,
    });
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Forum</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/forum" className="px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium">
                  Ana Sayfa
                </Link>
                <Link href="/forum/trending" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Trend
                </Link>
                <Link href="/forum/members" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Users className="w-4 h-4" /> Üyeler
                </Link>
                <Link href="/forum/badges" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Award className="w-4 h-4" /> Rozetler
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Forumda ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                href="/forum/new-topic"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Yeni Konu
              </Link>
              <Link href="/profile" className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                U
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Topluluğumuza Hoş Geldiniz!</h1>
                  <p className="text-indigo-100">
                    Deneyimlerinizi paylaşın, sorular sorun, diğer üyelerle bağlantı kurun.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Link href="/forum/new-topic" className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50">
                      Konu Aç
                    </Link>
                    <Link href="/forum/rules" className="px-4 py-2 bg-indigo-500/50 text-white rounded-lg text-sm font-medium hover:bg-indigo-500">
                      Kurallar
                    </Link>
                  </div>
                </div>
                <div className="hidden sm:block p-3 bg-white/10 rounded-xl">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Forum Categories */}
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className={`px-4 py-3 bg-${category.color}-50 border-b border-${category.color}-100`}>
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <Hash className={`w-5 h-5 text-${category.color}-600`} />
                    {category.name}
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {category.boards.map((board) => (
                    <Link
                      key={board.id}
                      href={`/forum/board/${board.slug}`}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${board.color}-100 text-${board.color}-600 flex-shrink-0`}>
                        {board.type === "QNA" ? <MessageCircle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{board.name}</h3>
                          {board.isNew && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Yeni</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{board.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>{board.topicCount.toLocaleString()} konu</span>
                          <span>{board.postCount.toLocaleString()} mesaj</span>
                        </div>
                      </div>
                      {board.lastTopic && (
                        <div className="hidden sm:block text-right min-w-[200px]">
                          <p className="text-sm font-medium text-slate-700 truncate">{board.lastTopic.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {board.lastTopic.author} • {board.lastTopic.postedAt}
                          </p>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Recent Topics */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Son Konular
                </h2>
                <Link href="/forum/recent" className="text-sm text-indigo-600 hover:underline">
                  Tümünü Gör
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Link key={i} href={`/forum/topic/sample-topic-${i}`} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      U{i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Pin className="w-3 h-3 text-red-500" />
                        <h4 className="font-medium text-slate-900 truncate">Örnek Konu Başlığı #{i}</h4>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        <span className="text-indigo-600">Kullanıcı{i}</span> tarafından açıldı • 2 saat önce
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> 124</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> 8</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Widget */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-4">İstatistikler</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Konular</span>
                  <span className="font-medium">{stats.totalTopics.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Mesajlar</span>
                  <span className="font-medium">{stats.totalPosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Üyeler</span>
                  <span className="font-medium">{stats.totalMembers.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Son üye: <span className="text-indigo-600 font-medium">{stats.newestMember}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Online Users */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Çevrimiçi ({stats.onlineUsers})
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {onlineUsers.slice(0, 8).map((user) => (
                  <Link
                    key={user.id}
                    href={`/forum/user/${user.id}`}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.isStaff
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    title={user.status}
                  >
                    {user.name}
                  </Link>
                ))}
                {onlineUsers.length > 8 && (
                  <span className="px-2 py-1 text-xs text-slate-500">
                    +{onlineUsers.length - 8} daha
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {stats.onlineUsers} üye, {stats.onlineGuests} misafir çevrimiçi
              </p>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-3">Popüler Etiketler</h3>
              <div className="flex flex-wrap gap-2">
                {["E-Ticaret", "Pazaryeri", "Trendyol", "Amazon", "SEO", "Reklam", "Sosyal Medya", "İpucu"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/forum/tag/${tag.toLowerCase()}`}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Haftanın Aktifleri
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {i}
                    </span>
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Kullanıcı_{i}</p>
                      <p className="text-xs text-slate-500">{50 - i * 10} mesaj</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
              <h3 className="font-bold mb-3">Hızlı Bağlantılar</h3>
              <div className="space-y-2">
                <Link href="/forum/unread" className="flex items-center gap-2 text-sm text-indigo-100 hover:text-white">
                  <MessageCircle className="w-4 h-4" /> Okunmamış Mesajlar
                </Link>
                <Link href="/forum/mark-all-read" className="flex items-center gap-2 text-sm text-indigo-100 hover:text-white">
                  <CheckCircle className="w-4 h-4" /> Tümünü Okundu İşaretle
                </Link>
                <Link href="/forum/subscriptions" className="flex items-center gap-2 text-sm text-indigo-100 hover:text-white">
                  <Bell className="w-4 h-4" /> Aboneliklerim
                </Link>
                <Link href="/forum/drafts" className="flex items-center gap-2 text-sm text-indigo-100 hover:text-white">
                  <MessageSquare className="w-4 h-4" /> Taslaklarım
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
