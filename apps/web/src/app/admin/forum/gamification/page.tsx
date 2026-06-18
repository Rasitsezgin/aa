"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Gift,
  Star,
  Zap,
  Flame,
  Crown,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Search,
  Filter,
  ChevronRight,
  Sparkles,
  Medal,
} from "lucide-react";

interface LevelReward {
  id: string;
  level: number;
  title: string;
  description?: string;
  xpRequired: number;
  icon?: string;
  color: string;
  badgeId?: string;
}

interface DailyQuest {
  id: string;
  title: string;
  description?: string;
  type: "daily" | "weekly" | "special";
  action: string;
  targetCount: number;
  xpReward: number;
  isActive: boolean;
  participants: number;
  completions: number;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rank: number;
  score: number;
  previousRank?: number;
  xpEarned: number;
}

export default function ForumGamificationPage() {
  const [levelRewards, setLevelRewards] = useState<LevelReward[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"levels" | "quests" | "leaderboard" | "activity">("levels");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGamification() {
      try {
        const res = await fetch("/api/admin/forum/gamification");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setLevelRewards(
          (data.levelRewards ?? []).map((l: Record<string, unknown>) => ({
            id: String(l.id ?? ""),
            level: Number(l.level ?? 0),
            title: String(l.title ?? l.name ?? ""),
            description: l.description as string | undefined,
            xpRequired: Number(l.xpRequired ?? 0),
            icon: l.icon as string | undefined,
            color: String(l.color ?? "#8b5cf6"),
            badgeId: l.badgeId as string | undefined,
          }))
        );
        setDailyQuests(
          (data.dailyQuests ?? []).map((q: Record<string, unknown>) => ({
            id: String(q.id ?? ""),
            title: String(q.title ?? ""),
            description: q.description as string | undefined,
            type: (q.type as DailyQuest["type"]) ?? "daily",
            action: String(q.action ?? ""),
            targetCount: Number(q.targetCount ?? 0),
            xpReward: Number(q.xpReward ?? 0),
            isActive: q.isActive !== false,
            participants: Number(q.participants ?? 0),
            completions: Number(q.completions ?? 0),
          }))
        );
        setLeaderboard(
          (data.leaderboard ?? []).map((e: Record<string, unknown>) => ({
            id: String(e.id ?? ""),
            userId: String(e.userId ?? e.id ?? ""),
            userName: String(e.userName ?? e.name ?? "Kullanıcı"),
            userAvatar: e.userAvatar as string | undefined,
            rank: Number(e.rank ?? 0),
            score: Number(e.score ?? 0),
            previousRank: e.previousRank as number | undefined,
            xpEarned: Number(e.xpEarned ?? e.xp ?? e.score ?? 0),
          }))
        );
      } catch {
        setLevelRewards([]);
        setDailyQuests([]);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }
    void loadGamification();
  }, []);

  const stats = {
    totalLevels: levelRewards.length,
    activeQuests: dailyQuests.filter((q) => q.isActive).length,
    totalParticipants: dailyQuests.reduce((acc, q) => acc + q.participants, 0),
    totalCompletions: dailyQuests.reduce((acc, q) => acc + q.completions, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/forum" className="p-2 hover:bg-white/20 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Gamification Yönetimi
                </h1>
                <p className="text-purple-100 text-sm">Seviyeler, görevler ve liderlik tabloları</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
            >
              <Plus className="w-4 h-4" /> Yeni Ekle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
        ) : (
        <>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLevels}</p>
                <p className="text-sm text-slate-500">Seviye</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeQuests}</p>
                <p className="text-sm text-slate-500">Aktif Görev</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Katılımcı</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCompletions.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Tamamlama</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-fit">
          {[
            { id: "levels", label: "Seviyeler", icon: Crown },
            { id: "quests", label: "Günlük Görevler", icon: Target },
            { id: "leaderboard", label: "Liderlik Tablosu", icon: Trophy },
            { id: "activity", label: "Aktivite", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-purple-100 text-purple-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Levels Tab */}
        {activeTab === "levels" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <Medal className="w-5 h-5 text-purple-600" />
                Seviye Ödülleri
              </h2>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm">
                <Plus className="w-4 h-4" /> Seviye Ekle
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {levelRewards.map((level) => (
                <div key={level.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: `${level.color}20`, color: level.color }}
                  >
                    {level.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{level.title}</h3>
                      {level.badgeId && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          <Award className="w-3 h-3 inline mr-1" /> Rozet
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{level.description}</p>
                    <p className="text-sm text-purple-600 mt-1">
                      {level.xpRequired.toLocaleString()} XP gerekli
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quests Tab */}
        {activeTab === "quests" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Günlük Görevler
              </h2>
              <div className="flex gap-2">
                <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
                  <option>Tümü</option>
                  <option>Günlük</option>
                  <option>Haftalık</option>
                  <option>Özel</option>
                </select>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm">
                  <Plus className="w-4 h-4" /> Görev Ekle
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {dailyQuests.map((quest) => (
                <div key={quest.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      quest.type === "daily" ? "bg-blue-100 text-blue-600" :
                      quest.type === "weekly" ? "bg-purple-100 text-purple-600" :
                      "bg-pink-100 text-pink-600"
                    }`}>
                      {quest.type === "daily" ? <Flame className="w-6 h-6" /> :
                       quest.type === "weekly" ? <CalendarIcon className="w-6 h-6" /> :
                       <Star className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{quest.title}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          quest.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {quest.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{quest.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="text-slate-600">
                          {quest.action}: {quest.targetCount}
                        </span>
                        <span className="text-purple-600 font-medium">
                          <Zap className="w-3 h-3 inline mr-1" /> {quest.xpReward} XP
                        </span>
                        <span className="text-slate-400">
                          {quest.participants} katılımcı • {quest.completions} tamamlama
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Haftanın Liderleri
                  </h2>
                  <div className="flex gap-2">
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
                      <option>Haftalık</option>
                      <option>Aylık</option>
                      <option>Tüm Zamanlar</option>
                    </select>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
                      <option>XP</option>
                      <option>Mesaj</option>
                      <option>İtibar</option>
                      <option>Teşekkür</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-200">
                {leaderboard.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                      entry.rank === 2 ? "bg-slate-200 text-slate-700" :
                      entry.rank === 3 ? "bg-orange-100 text-orange-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {entry.rank <= 3 ? (
                        <Medal className="w-5 h-5" />
                      ) : (
                        entry.rank
                      )}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {entry.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{entry.userName}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{entry.score.toLocaleString()} puan</span>
                        {entry.previousRank && (
                          <span className={`${
                            entry.previousRank > entry.rank ? "text-green-600" : "text-red-600"
                          }`}>
                            {entry.previousRank > entry.rank ? "↑" : "↓"} 
                            {Math.abs(entry.previousRank - entry.rank)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-purple-600 font-medium">+{entry.xpEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">🏆 Bu Haftanın Birincisi</h3>
                {leaderboard[0] && (
                  <div className="text-center py-4">
                    <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-2xl font-bold text-yellow-600 mb-3">
                      {leaderboard[0].userName.charAt(0)}
                    </div>
                    <p className="font-bold text-xl">{leaderboard[0].userName}</p>
                    <p className="text-yellow-100">{leaderboard[0].score.toLocaleString()} puan</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        <Gift className="w-4 h-4 inline mr-1" /> +500 XP Bonus
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-bold text-slate-800 mb-3">Ödül Ayarları</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">1. için XP</span>
                    <input type="number" defaultValue={500} className="w-20 px-2 py-1 border rounded text-right" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">2. için XP</span>
                    <input type="number" defaultValue={300} className="w-20 px-2 py-1 border rounded text-right" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">3. için XP</span>
                    <input type="number" defaultValue={200} className="w-20 px-2 py-1 border rounded text-right" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Rozet ver</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                  <Save className="w-4 h-4 inline mr-2" /> Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg">Aktivite Akışı</h3>
              <p className="text-slate-500 mt-2">Kullanıcı aktiviteleri burada görüntülenecek.</p>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

// Helper component for calendar icon
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
