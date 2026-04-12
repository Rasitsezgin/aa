"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  MessageSquare,
  Heart,
  Award,
  Star,
  Clock,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Shield,
  CheckCircle,
  Mail,
  MoreHorizontal,
  Edit2,
  MessageCircle,
  FileText,
  ThumbsUp,
  Eye,
  Flag,
  Ban,
  UserPlus,
  UserMinus,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  coverImage?: string;
  title?: string;
  isStaff: boolean;
  isOnline: boolean;
  joinedAt: string;
  lastSeenAt: string;
  location?: string;
  website?: string;
  about?: string;
  signature?: string;
  
  // Stats
  postCount: number;
  topicCount: number;
  reputation: number;
  thanksReceived: number;
  thanksGiven: number;
  helpfulCount: number;
  
  // Ranks
  primaryGroup: {
    name: string;
    color: string;
    icon?: string;
  };
  badges: {
    id: string;
    name: string;
    icon: string;
    color: string;
    earnedAt: string;
  }[];
  
  // Activity
  recentTopics: {
    id: string;
    title: string;
    boardName: string;
    createdAt: string;
    replyCount: number;
  }[];
  recentPosts: {
    id: string;
    topicTitle: string;
    boardName: string;
    excerpt: string;
    createdAt: string;
    reactionCount: number;
  }[];
}

export default function ForumUserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "posts" | "reputation" | "badges">("overview");
  const [isFollowing, setIsFollowing] = useState(false);

  // Initialize mock data
  useState(() => {
    const mockUser: UserProfile = {
      id: "1",
      name: "Örnek Kullanıcı",
      username: "ornekuser",
      isStaff: false,
      isOnline: true,
      joinedAt: "2024-01-01",
      lastSeenAt: "şimdi",
      postCount: 150,
      topicCount: 25,
      reputation: 500,
      thanksReceived: 50,
      thanksGiven: 30,
      helpfulCount: 20,
      primaryGroup: { name: "Üye", color: "#6366f1" },
      badges: [
        { id: "1", name: "Yeni Üye", icon: "star", color: "#22c55e", earnedAt: "2024-01-01" },
      ],
      recentTopics: [],
      recentPosts: [],
    };
    setUser(mockUser);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {!user ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
              <div className="w-48 h-4 bg-slate-200 rounded mb-2"></div>
              <div className="w-32 h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
      {/* Cover Image */}
      <div className={`h-48 md:h-64 bg-gradient-to-r from-indigo-600 to-purple-600 relative ${user.coverImage ? "bg-cover bg-center" : ""}`}
        style={user.coverImage ? { backgroundImage: `url(${user.coverImage})` } : {}}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative -mt-20 md:-mt-24">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-lg border-4 border-white ${
                user.isStaff ? "bg-gradient-to-br from-red-500 to-orange-500" : "bg-gradient-to-br from-indigo-500 to-purple-600"
              }`}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              {user.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: `${user.primaryGroup.color}20`, color: user.primaryGroup.color }}
                    >
                      {user.primaryGroup.name}
                    </span>
                    {user.isStaff && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1">
                        <Shield className="w-4 h-4" /> Yetkili
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 mt-1">@{user.username}</p>
                  {user.title && <p className="text-indigo-600 font-medium mt-1">{user.title}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                      isFollowing
                        ? "bg-slate-200 text-slate-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isFollowing ? (
                      <><UserMinus className="w-4 h-4" /> Takibi Bırak</>
                    ) : (
                      <><UserPlus className="w-4 h-4" /> Takip Et</>
                    )}
                  </button>
                  <Link
                    href={`/forum/messages/new?to=${user.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                  >
                    <Mail className="w-4 h-4" /> Mesaj
                  </Link>
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bio */}
              {user.about && (
                <p className="text-slate-600 mt-4 max-w-2xl">{user.about}</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {user.joinedAt} tarihinde katıldı
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Son görülme: {user.lastSeenAt}
                </span>
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {user.location}
                  </span>
                )}
                {user.website && (
                  <Link href={user.website} className="flex items-center gap-1 text-indigo-600 hover:underline">
                    <LinkIcon className="w-4 h-4" /> Website
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{user.postCount.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Mesaj</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{user.topicCount.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Konu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">+{user.reputation}</p>
              <p className="text-sm text-slate-500">İtibar</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{user.thanksReceived}</p>
              <p className="text-sm text-slate-500">Teşekkür</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{user.badges.length}</p>
              <p className="text-sm text-slate-500">Rozet</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-fit">
          {[
            { id: "overview", label: "Genel Bakış", icon: User },
            { id: "topics", label: "Konular", icon: FileText },
            { id: "posts", label: "Mesajlar", icon: MessageSquare },
            { id: "reputation", label: "İtibar", icon: Star },
            { id: "badges", label: "Rozetler", icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Son Aktivite</h3>
                  <div className="space-y-4">
                    {user.recentPosts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium text-slate-900">{post.topicTitle}</span> konusuna cevap yazdı
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{post.createdAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Topics */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Son Konular</h3>
                  <div className="space-y-3">
                    {user.recentTopics.slice(0, 5).map((topic) => (
                      <Link 
                        key={topic.id} 
                        href={`/forum/topic/${topic.id}`}
                        className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{topic.title}</p>
                            <p className="text-sm text-slate-500">{topic.boardName} • {topic.createdAt}</p>
                          </div>
                          <span className="flex items-center gap-1 text-sm text-slate-400">
                            <MessageCircle className="w-4 h-4" /> {topic.replyCount}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "topics" && (
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-bold">Tüm Konular ({user.topicCount})</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {user.recentTopics.map((topic) => (
                    <Link 
                      key={topic.id}
                      href={`/forum/topic/${topic.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{topic.title}</p>
                        <p className="text-sm text-slate-500">{topic.boardName} • {topic.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> 124</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {topic.replyCount}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "posts" && (
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="font-bold">Tüm Mesajlar ({user.postCount})</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {user.recentPosts.map((post) => (
                    <div key={post.id} className="p-4 hover:bg-slate-50">
                      <p className="text-sm text-slate-500 mb-2">
                        <span className="font-medium text-indigo-600">{post.topicTitle}</span> konusunda
                      </p>
                      <p className="text-slate-700 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{post.createdAt}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.reactionCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reputation" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">İtibar Geçmişi</h3>
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">İtibar geçmişi burada görüntülenecek</p>
                </div>
              </div>
            )}

            {activeTab === "badges" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4">Rozetler ({user.badges.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {user.badges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      title={`${badge.name} - Kazanılma: ${badge.earnedAt}`}
                    >
                      <div 
                        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                      >
                        <Award className="w-8 h-8" />
                      </div>
                      <p className="font-medium text-sm">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Badges Preview */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-3">Rozetler</h3>
              <div className="flex flex-wrap gap-2">
                {user.badges.slice(0, 6).map((badge) => (
                  <div 
                    key={badge.id}
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                    title={badge.name}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                ))}
                {user.badges.length > 6 && (
                  <Link 
                    href="#badges"
                    onClick={() => setActiveTab("badges")}
                    className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold"
                  >
                    +{user.badges.length - 6}
                  </Link>
                )}
              </div>
            </div>

            {/* Signature */}
            {user.signature && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-bold text-slate-800 mb-2">İmza</h3>
                <p className="text-sm text-slate-500 italic">{user.signature}</p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-3">İşlemler</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">
                  <Flag className="w-4 h-4" /> Rapor Et
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">
                  <Ban className="w-4 h-4" /> Engelle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
