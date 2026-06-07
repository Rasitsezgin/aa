"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare, Users, Shield, Pin, Lock, CheckCircle,
  ChevronRight, Flame, Folder, ChevronDown, BarChart3, Activity, Crown, Plus, User,
} from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import {
  fetchForumBoards,
  fetchForumTopics,
  fetchForumStats,
  fetchOnlineUsers,
  formatRelativeTime,
  type ForumCategoryItem,
  type ForumStats,
  type ForumTopicItem,
  type OnlineUserItem,
} from "@/lib/forum-api";

const SORT_OPTIONS = [
  { value: "lastPost", label: "Son Aktivite" },
  { value: "new", label: "En Yeni" },
  { value: "popular", label: "En Çok Görüntüleme" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function ForumHomePage() {
  const [categories, setCategories] = useState<ForumCategoryItem[]>([]);
  const [topics, setTopics] = useState<ForumTopicItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserItem[]>([]);
  const [stats, setStats] = useState<ForumStats>({
    totalTopics: 0,
    totalPosts: 0,
    totalMembers: 0,
    newestMember: "—",
    onlineUsers: 0,
    onlineGuests: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("lastPost");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalCount: 0,
    totalPages: 1,
  });

  const loadPageData = useCallback(async (page = 1, sort: SortValue = sortBy) => {
    setLoading(true);
    setError(null);
    try {
      const [boards, topicData, statsData, online] = await Promise.all([
        fetchForumBoards(),
        fetchForumTopics(page, pagination.limit, sort),
        fetchForumStats(),
        fetchOnlineUsers(),
      ]);

      setCategories(boards);
      setTopics(topicData.topics);
      setPagination({
        page: topicData.pagination.page,
        limit: topicData.pagination.limit,
        totalCount: topicData.pagination.totalCount,
        totalPages: topicData.pagination.totalPages,
      });
      setStats(statsData);
      setOnlineUsers(online);
    } catch (err) {
      console.error("[forum] Veri yükleme hatası:", err);
      setError("Forum verileri yüklenemedi. Veritabanı bağlantısını kontrol edin.");
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, sortBy]);

  useEffect(() => {
    loadPageData(1, sortBy);
  }, [sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSortChange = (value: SortValue) => {
    setSortBy(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    loadPageData(page, sortBy);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return topics;
    return topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(query) ||
        topic.board.name.toLowerCase().includes(query) ||
        topic.author.name.toLowerCase().includes(query),
    );
  }, [topics, searchQuery]);

  const toggleCategory = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, isExpanded: !c.isExpanded } : c)),
    );
  };

  const pageNumbers = useMemo(() => {
    const { page, totalPages } = pagination;
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [pagination]);

  return (
    <ForumShell
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onlineCount={stats.onlineUsers + stats.onlineGuests}
    >
      <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/" className="hover:text-orange-600">Ana Sayfa</Link>
            <ChevronRight size={14} />
            <span className="text-slate-900 dark:text-white font-medium">Forum</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4 order-1">
            <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Folder size={16} className="text-orange-600" /> Forum Bölümleri
                </h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {loading && categories.length === 0 ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">Henüz forum bölümü yok.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id}>
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{cat.name}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${cat.isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      {cat.isExpanded && (
                        <div className="bg-slate-50/50 dark:bg-black/20">
                          {cat.boards.map((board) => (
                            <Link
                              key={board.id}
                              href={`/forum/board/${board.slug}`}
                              className="block px-4 py-3 pl-8 text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{board.name}</span>
                                <span className="text-xs text-slate-400">{board.topicCount} konu</span>
                              </div>
                              {board.lastTopic && (
                                <div className="mt-1.5 text-xs">
                                  <span className="text-slate-400">Son: </span>
                                  <span className="text-orange-600 dark:text-orange-400 truncate max-w-[180px] inline-block">
                                    {board.lastTopic.title}
                                  </span>
                                </div>
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

            <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg p-4 shadow-lg">
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

          <div className="lg:col-span-7 space-y-4 order-2 min-w-0">
            <div className="bg-slate-800 dark:bg-[#1a1a1a] text-white rounded-t-lg px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <Flame size={18} className="text-orange-400" /> Son Konular
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Sıralama:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortValue)}
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-b-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredTopics.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Henüz konu bulunmuyor.</p>
                  <Link href="/forum/new-topic" className="inline-block mt-4 text-orange-600 hover:underline text-sm font-medium">
                    İlk konuyu sen aç
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${topic.isPinned ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
                    >
                      <div className="shrink-0 pt-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          topic.isPinned ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" :
                          topic.isHot ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600" :
                          topic.isLocked ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                          topic.isSolved ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
                          "bg-slate-100 dark:bg-slate-800 text-slate-600"
                        }`}>
                          {topic.isPinned ? <Pin size={18} /> :
                           topic.isLocked ? <Lock size={18} /> :
                           topic.isSolved ? <CheckCircle size={18} /> :
                           topic.hasPoll ? <BarChart3 size={18} /> :
                           <MessageSquare size={18} />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {topic.isPinned && <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">SABİT</span>}
                          {topic.isHot && <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded">POPÜLER</span>}
                          <span className="text-xs text-orange-600">{topic.board.name}</span>
                        </div>
                        <Link href={`/forum/topic/${topic.slug}`} className="group block">
                          <h3 className={`font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors truncate ${topic.isPinned ? "text-base" : "text-sm"}`}>
                            {topic.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {topic.author.id ? (
                              <Link href={`/forum/user/${topic.author.id}`} className="hover:text-orange-600">{topic.author.name}</Link>
                            ) : (
                              <span>{topic.author.name}</span>
                            )}
                            {topic.author.isStaff && <Shield size={10} className="text-orange-500" />}
                          </span>
                          <span>•</span>
                          <span>{formatRelativeTime(topic.createdAt)}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-center text-sm">
                        <div className="font-bold text-slate-900 dark:text-white">{topic.replies}</div>
                        <div className="text-xs text-slate-400">cevap</div>
                      </div>
                      <div className="shrink-0 text-center text-sm hidden sm:block">
                        <div className="font-bold text-slate-900 dark:text-white">{topic.views.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">görüntü</div>
                      </div>
                      <div className="shrink-0 text-right text-xs hidden md:block w-32">
                        <div className="font-medium text-slate-900 dark:text-white">{topic.lastPost.author}</div>
                        <div className="text-slate-400">{formatRelativeTime(topic.lastPost.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="bg-slate-50 dark:bg-[#1a1a1a] px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-slate-500">
                    Toplam <strong>{pagination.totalCount}</strong> konu • Sayfa{" "}
                    <strong>{pagination.page}</strong> / <strong>{pagination.totalPages}</strong>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-sm disabled:opacity-50"
                    >
                      &laquo; İlk
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded text-sm disabled:opacity-50"
                    >
                      &lsaquo; Önceki
                    </button>
                    {pageNumbers.map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          page === pagination.page
                            ? "bg-orange-600 text-white"
                            : "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1.5 bg-white dark:bg-slate-700 border rounded text-sm disabled:opacity-50"
                    >
                      Sonraki &rsaquo;
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1.5 bg-white dark:bg-slate-700 border rounded text-sm disabled:opacity-50"
                    >
                      Son &raquo;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3 order-3">
            <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 border-b border-emerald-100 dark:border-emerald-800">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Users size={16} /> Çevrimiçi Üyeler
                </h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Şu anda <strong className="text-emerald-600">{stats.onlineUsers}</strong> üye çevrimiçi
                </p>
                {onlineUsers.length === 0 ? (
                  <p className="text-xs text-slate-400">Şu an aktif üye görünmüyor.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {onlineUsers.map((user) => (
                      <Link
                        key={user.id}
                        href={`/forum/user/${user.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                      >
                        <span className={`w-2 h-2 rounded-full ${user.status === "online" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className={user.isStaff ? "text-orange-600 font-medium" : "text-slate-700 dark:text-slate-300"}>
                          {user.name}
                        </span>
                        {user.isStaff && <Shield size={10} className="text-orange-500" />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="bg-slate-50 dark:bg-[#1a1a1a] px-3 py-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-orange-600" /> İstatistikler
                </h3>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalTopics.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Konu</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalPosts.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Gönderi</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-center">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalMembers.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">Üye</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-center border-t border-slate-200 dark:border-slate-800 pt-2">
                  Son üye: <span className="text-orange-600 font-medium">{stats.newestMember}</span>
                </div>
              </div>
            </div>

            {onlineUsers.some((u) => u.isStaff || u.isModerator) && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 rounded-lg border border-amber-200 dark:border-amber-800 p-3">
                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                  <Shield size={12} /> Yetkililer
                </h4>
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.filter((u) => u.isStaff || u.isModerator).map((staff) => (
                    <span key={staff.id} className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 dark:bg-white/10 rounded text-xs">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{staff.name}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400">
                        {staff.isStaff ? "(Admin)" : "(Mod)"}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ForumShell>
  );
}
