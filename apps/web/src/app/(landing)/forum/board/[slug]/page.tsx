"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft, MessageSquare, Pin, Flame, Loader2, Plus,
  CheckCircle, Folder, User, Shield, Sparkles, ArrowRight,
  TrendingUp, BarChart3, HelpCircle, Lock
} from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import { formatRelativeTime } from "@/lib/forum-api";

interface BoardTopic {
  id: string;
  title: string;
  slug: string;
  replies: number;
  views: number;
  isPinned?: boolean;
  isHot?: boolean;
  isSolved?: boolean;
  isLocked?: boolean;
  author: { name: string; avatar: string; isStaff?: boolean; title?: string };
  lastPost?: { author?: string; date: string };
  createdAt: string;
  tags?: Array<{ name: string; slug: string; color?: string }>;
}

interface BoardApiResponse {
  board: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    category?: { name: string; slug?: string };
    topicCount?: number;
    postCount?: number;
  };
  topics: BoardTopic[];
  pagination: { page: number; totalPages: number; totalCount: number };
}

// Fallback Board Verisi
const FALLBACK_BOARD_DATA: Record<string, BoardApiResponse> = {
  "trendyol-panel": {
    board: {
      id: "b5",
      name: "Trendyol Satıcı Paneli & Buybox",
      slug: "trendyol-panel",
      description: "Trendyol mağaza yönetimi, Buybox kazanma stratejileri, ürün listeleme ve satıcı paneli optimizasyonları.",
      category: { name: "Türkiye Pazaryerleri", slug: "turkiye-pazaryerleri" },
      topicCount: 18,
      postCount: 64,
    },
    topics: [
      {
        id: "topic-2",
        title: "Trendyol Buybox Algoritması Nasıl Çalışır? 1. Sıraya Çıkma Taktikleri",
        slug: "trendyol-buybox-algoritmasi-nasil-calisir-1-siraya-cikma-taktikleri",
        replies: 38,
        views: 8420,
        isPinned: true,
        isSolved: true,
        isHot: true,
        author: { name: "Ahmet Yılmaz", avatar: "A", isStaff: true, title: "Moderatör" },
        lastPost: { author: "Burak Özkan", date: new Date(Date.now() - 3600000).toISOString() },
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        tags: [{ name: "buybox", slug: "buybox" }, { name: "trendyol", slug: "trendyol" }],
      },
      {
        id: "topic-26",
        title: "Trendyol Flaş İndirimler ve Süper Fırsat Kampanyalarına Katılma Şartları",
        slug: "trendyol-flas-indirimler-ve-super-firsat-kampanyalarina-katilma-sartlari",
        replies: 24,
        views: 5120,
        isSolved: true,
        author: { name: "Burak Özkan", avatar: "B", title: "Platin Satıcı" },
        lastPost: { author: "Ahmet Yılmaz", date: new Date(Date.now() - 14400000).toISOString() },
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        tags: [{ name: "kampanya", slug: "kampanya" }, { name: "flas-indirim", slug: "flas-indirim" }],
      },
    ],
    pagination: { page: 1, totalPages: 1, totalCount: 2 },
  },
};

type FilterTab = "all" | "pinned" | "popular" | "solved";

export default function ForumBoardPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const [data, setData] = useState<BoardApiResponse | null>(FALLBACK_BOARD_DATA[slug] || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/forum/board/${slug}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json && json.board) {
            setData(json);
          }
        }
      } catch (err) {
        console.error("Board yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const currentBoard = data?.board || {
    id: `board-${slug}`,
    name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    slug: slug,
    description: "Bu bölümdeki güncel tartışmalar, deneyim paylaşımları ve satıcı rehberleri.",
    category: { name: "Forum Bölümleri" },
    topicCount: data?.topics?.length || 0,
    postCount: 0,
  };

  const topicsList = data?.topics || [];

  const filteredTopics = useMemo(() => {
    let result = topicsList;

    if (activeTab === "pinned") {
      result = result.filter((t) => t.isPinned);
    } else if (activeTab === "popular") {
      result = result.filter((t) => t.isHot || t.views > 3000);
    } else if (activeTab === "solved") {
      result = result.filter((t) => t.isSolved);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.author.name.toLowerCase().includes(query) ||
          (t.tags && t.tags.some((tag: any) => {
            const tagName = typeof tag === 'string' ? tag : tag?.name || '';
            return tagName.toLowerCase().includes(query);
          }))
      );
    }

    return result;
  }, [topicsList, activeTab, searchQuery]);

  return (
    <ForumShell
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/forum" className="hover:text-orange-600 dark:hover:text-orange-400 font-medium">
            Forum Ana Sayfa
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {currentBoard.category?.name || "Bölümler"}
          </span>
          <span>/</span>
          <span className="text-orange-600 dark:text-orange-400 font-bold truncate">
            {currentBoard.name}
          </span>
        </div>

        {/* Board Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
              <Folder size={13} />
              <span>{currentBoard.category?.name || "Kategori"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {currentBoard.name}
            </h1>
            {currentBoard.description && (
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentBoard.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
              <span>{currentBoard.topicCount ?? topicsList.length} Konu Başlığı</span>
              <span>•</span>
              <span>Topluluk Çözümleri & Rehberler</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/forum/new-topic?board=${currentBoard.id || slug}`}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-lg shadow-orange-500/25"
            >
              <Plus size={18} /> Bu Bölümde Konu Aç
            </Link>
          </div>
        </div>

        {/* Main Grid: 8 Cols Topics + 4 Cols Sidebar */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Sol/Orta Alan: Konular Listesi */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter Pills Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Tümü ({topicsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pinned")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 ${
                    activeTab === "pinned"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Pin size={12} /> Sabitler
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("popular")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 ${
                    activeTab === "popular"
                      ? "bg-orange-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Flame size={12} /> Popüler
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("solved")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 ${
                    activeTab === "solved"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <CheckCircle size={12} /> Çözülenler
                </button>
              </div>

              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {filteredTopics.length} sonuç
              </span>
            </div>

            {/* Topics Card List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTopics.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <MessageSquare size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    Bu kriterde konu bulunmuyor.
                  </p>
                  <Link
                    href={`/forum/new-topic?board=${currentBoard.id || slug}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-xs"
                  >
                    <Plus size={14} /> İlk Konuyu Aç
                  </Link>
                </div>
              ) : (
                filteredTopics.map((topic) => (
                  <article
                    key={topic.id}
                    className={`p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-3.5 group relative ${
                      topic.isPinned ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                    }`}
                  >
                    <div className="shrink-0 pt-0.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          topic.isPinned
                            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                            : topic.isSolved
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                            : topic.isHot
                            ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {topic.isPinned ? (
                          <Pin size={16} />
                        ) : topic.isSolved ? (
                          <CheckCircle size={16} />
                        ) : topic.isHot ? (
                          <Flame size={16} />
                        ) : (
                          <MessageSquare size={16} />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {topic.isPinned && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded-md tracking-wider">
                            SABİT
                          </span>
                        )}
                        {topic.isSolved && (
                          <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-extrabold rounded-md tracking-wider">
                            ÇÖZÜLDÜ
                          </span>
                        )}
                        {topic.isHot && (
                          <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[9px] font-extrabold rounded-md tracking-wider">
                            POPÜLER
                          </span>
                        )}
                      </div>

                      <Link href={`/forum/topic/${topic.slug}`} className="block">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                          {topic.title}
                        </h3>
                      </Link>

                      {topic.tags && topic.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {topic.tags.slice(0, 3).map((tag: any, idx: number) => {
                            const tagName = typeof tag === 'string' ? tag : tag?.name || '';
                            const tagKey = typeof tag === 'string' ? tag : tag?.slug || tag?.name || idx;
                            return (
                              <span
                                key={tagKey}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400"
                              >
                                #{tagName}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                          <User size={11} />
                          {topic.author.name}
                          {topic.author.isStaff && <Shield size={10} className="text-orange-500" />}
                        </span>
                        <span>•</span>
                        <span>{formatRelativeTime(topic.createdAt)}</span>
                        {topic.lastPost?.author && (
                          <>
                            <span>•</span>
                            <span>Son: {topic.lastPost.author}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3 self-center text-center">
                      <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 min-w-[50px]">
                        <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                          {topic.replies}
                        </span>
                        <span className="block text-[9px] text-slate-400 font-medium uppercase">
                          Yanıt
                        </span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 min-w-[50px] hidden sm:block">
                        <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">
                          {topic.views > 999 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views}
                        </span>
                        <span className="block text-[9px] text-slate-400 font-medium uppercase">
                          Görüntü
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Sağ Alan: Bölüm Rehberi & İpuçları */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-orange-500" /> Bölüm Kuralları & İpuçları
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Başlığınızda sorununuzu ve pazar yerini net belirtin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Ekran görüntüsü eklerken müşteri bilgilerini gizleyin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Sorununuz çözüldüğünde en faydalı cevabı &quot;En İyi Cevap&quot; işaretleyin.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-md shadow-orange-500/10">
              <h3 className="font-extrabold text-sm mb-1">
                Pazaryonetimi ile Otomatikleştirin
              </h3>
              <p className="text-xs text-orange-100 mb-3 leading-relaxed">
                Stok senkronizasyonu, komisyon hesabı ve Buybox takibini yapay zeka ile otomatik yönetin.
              </p>
              <Link
                href="/features"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-orange-700 font-bold rounded-xl text-xs hover:bg-orange-50 transition-colors shadow-xs"
              >
                <span>Özellikleri Keşfet</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </ForumShell>
  );
}
