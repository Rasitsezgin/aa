"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare, Users, Shield, Pin, Lock, CheckCircle,
  ChevronRight, Flame, Folder, ChevronDown, BarChart3, Activity, Crown, Plus, User,
  Sparkles, Filter, TrendingUp, HelpCircle, ArrowRight, ExternalLink, Zap,
} from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import ForumAmaScheduleWidget from "@/components/forum/ForumAmaScheduleWidget";
import ForumB2BHubWidget from "@/components/forum/ForumB2BHubWidget";
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


// Fallback Kategoriler (DB boş veya ilk yüklemede sıfır hata garantisi)
const FALLBACK_CATEGORIES: ForumCategoryItem[] = [
  {
    id: "c1",
    name: "Genel & Duyurular",
    slug: "genel",
    description: "Platform duyuruları, topluluk kuralları ve tanışma alanı.",
    isExpanded: true,
    boards: [
      { id: "b1", name: "Duyurular & Güncellemeler", slug: "duyurular", topicCount: 8, postCount: 24 },
      { id: "b2", name: "Forum Kuralları & Rehberler", slug: "kurallar", topicCount: 5, postCount: 16 },
      { id: "b3", name: "Tanışma & Topluluk", slug: "tanisma", topicCount: 12, postCount: 38 },
      { id: "b4", name: "Öneriler & İstekler", slug: "oneriler", topicCount: 9, postCount: 27 },
    ],
  },
  {
    id: "c2",
    name: "Türkiye Pazaryerleri",
    slug: "turkiye-pazaryerleri",
    description: "Trendyol, Hepsiburada, Amazon TR, N11, Çiçeksepeti operasyonları.",
    isExpanded: true,
    boards: [
      { id: "b5", name: "Trendyol Satıcı Paneli & Buybox", slug: "trendyol-panel", topicCount: 18, postCount: 64 },
      { id: "b6", name: "Trendyol Komisyon & Fiyatlandırma", slug: "trendyol-fiyat", topicCount: 14, postCount: 52 },
      { id: "b7", name: "Hepsiburada & HepsiPartner", slug: "hepsiburada-pazar", topicCount: 11, postCount: 40 },
      { id: "b8", name: "N11, Çiçeksepeti & PttAVM", slug: "n11-ciceksepeti", topicCount: 9, postCount: 31 },
    ],
  },
  {
    id: "c3",
    name: "Global Pazaryerleri & E-İhracat",
    slug: "global-ve-e-ihracat",
    description: "Amazon US/EU FBA, Etsy, Mikro İhracat (ETGB) ve yurtdışı pazarlar.",
    isExpanded: false,
    boards: [
      { id: "b9", name: "Amazon Türkiye & SP-API", slug: "amazon-fba-tr", topicCount: 10, postCount: 35 },
      { id: "b10", name: "Amazon Global (US, EU, UK)", slug: "amazon-global", topicCount: 16, postCount: 58 },
      { id: "b11", name: "Etsy & Vintage / Handmade", slug: "etsy-magaza", topicCount: 13, postCount: 44 },
      { id: "b12", name: "Mikro İhracat & ETGB Gümrük", slug: "mikro-ihracat", topicCount: 12, postCount: 42 },
    ],
  },
  {
    id: "c4",
    name: "Operasyon, Fiyat & Stok",
    slug: "operasyon-ve-stok",
    description: "Dinamik repricer, çoklu depo, kargo lojistiği ve XML tedarik.",
    isExpanded: false,
    boards: [
      { id: "b13", name: "Dinamik Fiyatlandırma & Repricer", slug: "fiyat-strateji", topicCount: 11, postCount: 39 },
      { id: "b14", name: "Envanter & Çoklu Depo Yönetimi", slug: "stok-yonetim", topicCount: 10, postCount: 36 },
      { id: "b15", name: "Kargo, Lojistik & İade Yönetimi", slug: "kargo-lojistik", topicCount: 15, postCount: 55 },
      { id: "b16", name: "Tedarik Zinciri & XML Dropshipping", slug: "tedarik-zincir", topicCount: 9, postCount: 33 },
    ],
  },
  {
    id: "c5",
    name: "Dijital Pazarlama & SEO",
    slug: "pazarlama-ve-seo",
    description: "Google PMax, Meta katalog, TikTok Shop ve pazaryeri içi SEO.",
    isExpanded: false,
    boards: [
      { id: "b17", name: "Google Ads & Merchant Center", slug: "google-ads", topicCount: 12, postCount: 41 },
      { id: "b18", name: "Meta (Facebook & IG) Reklamları", slug: "meta-ads", topicCount: 11, postCount: 38 },
      { id: "b19", name: "TikTok Shop & Influencer Satışları", slug: "tiktok-shop", topicCount: 10, postCount: 34 },
      { id: "b20", name: "E-Ticaret SEO & Ürün Açıklamaları", slug: "seo-icerik", topicCount: 13, postCount: 47 },
    ],
  },
  {
    id: "c6",
    name: "Teknik, Yazılım & ERP",
    slug: "teknik-ve-yazilim",
    description: "Pazaryonetimi REST API, Webhook ve Logo / Mikro ERP köprüleri.",
    isExpanded: false,
    boards: [
      { id: "b21", name: "Pazaryonetimi REST API & Webhook", slug: "api-entegrasyon", topicCount: 8, postCount: 29 },
      { id: "b22", name: "ERP & Muhasebe Entegrasyonu", slug: "erp-muhasebe", topicCount: 9, postCount: 32 },
      { id: "b23", name: "E-Ticaret Altyapıları & AI Araçları", slug: "eticaret-yazilim", topicCount: 11, postCount: 39 },
    ],
  },
  {
    id: "c7",
    name: "Mali & Hukuki Mevzuat",
    slug: "mali-ve-hukuki",
    description: "Genç Girişimci istisnası, e-Fatura, marka tescili ve KVKK.",
    isExpanded: false,
    boards: [
      { id: "b24", name: "E-Ticaret Vergi, E-Fatura & KDV", slug: "vergi-muhasebe", topicCount: 14, postCount: 49 },
      { id: "b25", name: "KVKK, Marka Tescili & Tüketici Hakları", slug: "kvkk-hukuk", topicCount: 10, postCount: 37 },
    ],
  },
];

// Fallback Konular
const FALLBACK_TOPICS: ForumTopicItem[] = [
  {
    id: "topic-1",
    title: "Trendyol 2024 - 2025 Komisyon Oranları, Baremler ve Kargo Fiyatlandırması Kılavuzu",
    slug: "trendyol-2024-2025-komisyon-oranlari-baremler-ve-kargo-fiyatlandirmasi-kilavuzu",
    author: { id: "u_trendyol_pro", name: "Burak Özkan (Trendyol Pro)", level: "Platin Satıcı", isStaff: false },
    board: { id: "b6", name: "Trendyol Komisyon & Fiyatlandırma", slug: "trendyol-fiyat" },
    replies: 42,
    views: 16840,
    lastPost: { author: "Kemal Tekin (SMMM)", date: new Date(Date.now() - 3600000).toISOString() },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isPinned: true,
    isHot: true,
    tags: ["trendyol", "komisyon", "barem", "kargo"],
  },
  {
    id: "topic-2",
    title: "Trendyol Buybox Algoritması Nasıl Çalışır? 1. Sıraya Çıkma Taktikleri",
    slug: "trendyol-buybox-algoritmasi-nasil-calisir-1-siraya-cikma-taktikleri",
    author: { id: "u_mod_ahmet", name: "Ahmet Yılmaz", level: "Elmas Satıcı", isStaff: true },
    board: { id: "b5", name: "Trendyol Satıcı Paneli & Buybox", slug: "trendyol-panel" },
    replies: 38,
    views: 8420,
    lastPost: { author: "Burak Özkan (Trendyol Pro)", date: new Date(Date.now() - 7200000).toISOString() },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isPinned: true,
    isSolved: true,
    tags: ["buybox", "trendyol", "algoritma"],
  },
  {
    id: "topic-3",
    title: "Amazon FBA ABD (Amazon.com) Başlangıç Rehberi: Şirket Kurulumundan İlk Sevkiyata",
    slug: "amazon-fba-abd-amazon-com-baslangic-rehberi-sirket-kurulumundan-ilk-sevkiyata",
    author: { id: "u_amazon_fba_lead", name: "Can Gümüş (FBA Lead)", level: "Elmas Satıcı", isStaff: false },
    board: { id: "b10", name: "Amazon Global (US, EU, UK)", slug: "amazon-global" },
    replies: 56,
    views: 19540,
    lastPost: { author: "Can Gümüş (FBA Lead)", date: new Date(Date.now() - 14400000).toISOString() },
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    isPinned: true,
    isHot: true,
    tags: ["amazonfba", "amerika", "llc", "e-ihracat"],
  },
  {
    id: "topic-5",
    title: "E-Ticarette Genç Girişimci İstisnası, Şahıs Şirketi ve Vergi Tevkifatı (2024-2026 Rehberi)",
    slug: "e-ticarette-genc-girisimci-istisnasi-sahis-sirketi-ve-vergi-tevkifati-2024-2026-rehberi",
    author: { id: "u_mali_musavir", name: "Kemal Tekin (SMMM)", level: "Elmas Satıcı", isStaff: false },
    board: { id: "b24", name: "E-Ticaret Vergi, E-Fatura & KDV", slug: "vergi-muhasebe" },
    replies: 64,
    views: 15200,
    lastPost: { author: "Ayşe Koç", date: new Date(Date.now() - 18000000).toISOString() },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isPinned: true,
    isSolved: true,
    tags: ["vergi", "gencgirisimci", "muhasebe", "e-fatura"],
  },
  {
    id: "topic-6",
    title: "Etsy'de Mağaza Suspend Edilmeden Satış Yapma ve Star Seller Olma Yolları",
    slug: "etsy-de-magaza-suspend-edilmeden-satis-yapma-ve-star-seller-olma-yollari",
    author: { id: "u_etsy_zeynep", name: "Zeynep Kaya (Etsy Star)", level: "Gümüş Satıcı", isStaff: false },
    board: { id: "b11", name: "Etsy & Vintage / Handmade", slug: "etsy-magaza" },
    replies: 29,
    views: 8670,
    lastPost: { author: "Zeynep Kaya (Etsy Star)", date: new Date(Date.now() - 25000000).toISOString() },
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    isSolved: true,
    tags: ["etsy", "starseller", "suspend"],
  },
  {
    id: "topic-7",
    title: "Dinamik Fiyatlandırma & Otomatik Repricer ile Rakipleri Gece Geçme Stratejileri",
    slug: "dinamik-fiyatlandirma-otomatik-repricer-ile-rakipleri-gece-gecme-stratejileri",
    author: { id: "u_dev_emre", name: "Emre Yıldız (API & Entegrasyon)", level: "Platin Satıcı", isStaff: false },
    board: { id: "b13", name: "Dinamik Fiyatlandırma & Repricer", slug: "fiyat-strateji" },
    replies: 33,
    views: 9180,
    lastPost: { author: "Burak Özkan (Trendyol Pro)", date: new Date(Date.now() - 32000000).toISOString() },
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    tags: ["repricer", "fiyat-stratejisi", "otomasyon"],
  },
  {
    id: "topic-9",
    title: "Mikro İhracat (ETGB) ile KDV İadesi Nasıl Alınır? Adım Adım Süreç",
    slug: "mikro-ihracat-etgb-ile-kdv-iadesi-nasil-alinir-adim-adim-surec",
    author: { id: "u_mali_musavir", name: "Kemal Tekin (SMMM)", level: "Elmas Satıcı", isStaff: false },
    board: { id: "b12", name: "Mikro İhracat & ETGB Gümrük", slug: "mikro-ihracat" },
    replies: 47,
    views: 11910,
    lastPost: { author: "Can Gümüş (FBA Lead)", date: new Date(Date.now() - 40000000).toISOString() },
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    isPinned: true,
    tags: ["mikro-ihracat", "etgb", "kdv-iadesi"],
  },
];

const SORT_OPTIONS = [
  { value: "lastPost", label: "Son Aktivite" },
  { value: "new", label: "En Yeni" },
  { value: "popular", label: "En Çok Görüntüleme" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];
type FilterTab = "all" | "pinned" | "popular" | "solved" | "polls";

export default function ForumHomePage() {
  const [categories, setCategories] = useState<ForumCategoryItem[]>(FALLBACK_CATEGORIES);
  const [topics, setTopics] = useState<ForumTopicItem[]>(FALLBACK_TOPICS);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [stats, setStats] = useState<ForumStats>({
    totalTopics: 55,
    totalPosts: 184,
    totalMembers: 1240,
    newestMember: "Tolga Arslan",
    onlineUsers: 48,
    onlineGuests: 112,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("lastPost");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalCount: 55,
    totalPages: 3,
  });

  const loadPageData = useCallback(async (page = 1, sort: SortValue = sortBy) => {
    setLoading(true);
    try {
      const [boards, topicData, statsData, online] = await Promise.all([
        fetchForumBoards().catch(() => null),
        fetchForumTopics(page, pagination.limit, sort).catch(() => null),
        fetchForumStats().catch(() => null),
        fetchOnlineUsers().catch(() => null),
      ]);

      if (boards && boards.length > 0) {
        setCategories(boards);
      }
      if (topicData && topicData.topics && topicData.topics.length > 0) {
        setTopics(topicData.topics);
        setPagination({
          page: topicData.pagination.page,
          limit: topicData.pagination.limit,
          totalCount: topicData.pagination.totalCount,
          totalPages: topicData.pagination.totalPages,
        });
      }
      if (statsData && statsData.totalTopics > 0) {
        setStats(statsData);
      }
      if (online && online.length > 0) {
        setOnlineUsers(online);
      }
    } catch (err) {
      console.error("[forum] Veri yükleme hatası:", err);
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

  const toggleCategory = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, isExpanded: !c.isExpanded } : c)),
    );
  };

  const filteredTopics = useMemo(() => {
    let result = topics;

    // Tab Filtresi
    if (activeTab === "pinned") {
      result = result.filter((t) => t.isPinned);
    } else if (activeTab === "popular") {
      result = result.filter((t) => t.isHot || t.views > 5000);
    } else if (activeTab === "solved") {
      result = result.filter((t) => t.isSolved);
    } else if (activeTab === "polls") {
      result = result.filter((t) => t.hasPoll);
    }

    // Arama Filtresi
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.board.name.toLowerCase().includes(query) ||
          t.author.name.toLowerCase().includes(query) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query))),
      );
    }

    return result;
  }, [topics, searchQuery, activeTab]);

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
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* SOL PANEL: Kategoriler ve Bölümler (lg:col-span-3) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-4 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Folder size={16} className="text-orange-400" /> Forum Bölümleri
              </h2>
              <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                24 Bölüm
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[600px] overflow-y-auto scrollbar-thin">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left"
                  >
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      {cat.name}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-slate-400 transition-transform duration-200 ${
                        cat.isExpanded ? "rotate-180 text-orange-500" : ""
                      }`}
                    />
                  </button>

                  {cat.isExpanded && (
                    <div className="bg-slate-50/60 dark:bg-slate-950/40 pb-1.5">
                      {cat.boards.map((board) => (
                        <Link
                          key={board.id}
                          href={`/forum/board/${board.slug}`}
                          className="group block px-4 py-2 pl-6 text-xs text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all border-l-2 border-transparent hover:border-orange-500"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium truncate group-hover:translate-x-0.5 transition-transform">
                              {board.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono shrink-0">
                              {board.topicCount}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hızlı Kısayollar Kartı */}
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-5 text-white shadow-md shadow-orange-500/10">
            <h3 className="font-extrabold text-sm mb-1 flex items-center gap-2">
              <Zap size={16} /> Satıcı Kısayolları
            </h3>
            <p className="text-xs text-orange-100 mb-3">
              Hesaplayıcılar ve topluluk rehberleri.
            </p>
            <div className="space-y-1.5 text-xs font-medium">
              <Link
                href="/forum/topic/trendyol-2024-2025-komisyon-oranlari-baremler-ve-kargo-fiyatlandirmasi-kilavuzu"
                className="flex items-center justify-between p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-white"
              >
                <span>Komisyon & Barem Tablosu</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/forum/topic/dinamik-fiyatlandirma-otomatik-repricer-ile-rakipleri-gece-gecme-stratejileri"
                className="flex items-center justify-between p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-white"
              >
                <span>Dinamik Repricer Rehberi</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/forum/topic/mikro-ihracat-etgb-ile-kdv-iadesi-nasil-alinir-adim-adim-surec"
                className="flex items-center justify-between p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-white"
              >
                <span>ETGB KDV İade Dilekçesi</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </aside>

        {/* ORTA PANEL: Konu Akışı ve Filtreler (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Filtre Sekmeleri & Sıralama Barı */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Tümü
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pinned")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 shrink-0 ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 shrink-0 ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 shrink-0 ${
                  activeTab === "solved"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <CheckCircle size={12} /> Çözülenler
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("b2b")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 shrink-0 ${
                  activeTab === "b2b"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>🤝 B2B & Toplu Alım</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-xs text-slate-400">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortValue)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* B2B Hub Kartı (activeTab === 'b2b' veya her zaman inceleme için) */}
          {activeTab === 'b2b' && (
            <div className="mb-4">
              <ForumB2BHubWidget />
            </div>
          )}

          {/* Konu Listesi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTopics.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <MessageSquare size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Aramanıza uygun konu bulunamadı.</p>
                <p className="text-xs text-slate-400 mt-1">Farklı bir anahtar kelime deneyebilir veya ilk konuyu açabilirsiniz.</p>
                <Link
                  href="/forum/new-topic"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-xs"
                >
                  <Plus size={14} /> Yeni Konu Başlat
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
                  {/* Sol İkon / Durum Rozeti */}
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

                  {/* Orta Alan: Başlık, Yazar, Board */}
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
                      <Link
                        href={`/forum/board/${topic.board.slug}`}
                        className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                      >
                        {topic.board.name}
                      </Link>
                    </div>

                    <Link href={`/forum/topic/${topic.slug}`} className="block">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                        {topic.title}
                      </h3>
                    </Link>

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {topic.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                        <User size={11} />
                        {topic.author.name}
                        {topic.author.isStaff && <Shield size={10} className="text-orange-500" />}
                      </span>
                      <span>•</span>
                      <span>{formatRelativeTime(topic.createdAt)}</span>
                      <span>•</span>
                      <span className="text-slate-500">Son yanıt: {topic.lastPost.author}</span>
                    </div>
                  </div>

                  {/* Sağ Alan: Sayaçlar */}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-xs flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Toplam <strong>{pagination.totalCount}</strong> konu • Sayfa <strong>{pagination.page}</strong> /{" "}
                <strong>{pagination.totalPages}</strong>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg disabled:opacity-40 transition-colors font-medium"
                >
                  Önceki
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-7 h-7 rounded-lg font-bold transition-colors ${
                      p === pagination.page
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg disabled:opacity-40 transition-colors font-medium"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SAĞ PANEL: İstatistikler & Topluluk Liderleri (lg:col-span-3) */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Haftalık Canlı Uzmana Sor (AMA) Widget */}
          <ForumAmaScheduleWidget />

          {/* Gamification / SaaS İndirim Kuponu Kazanma Kartı */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-indigo-500/30 p-4 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🎁</span>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-indigo-300">
                Topluluk Ödül Kulübü
              </h3>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Soruları yanıtla, en iyi çözüm rozetlerini topla ve Pazaryonetimi SaaS aboneliğinde <strong className="text-indigo-400 font-bold">%20 İndirim</strong> veya <strong className="text-amber-400 font-bold">1 Ay Ücretsiz Repricer</strong> kazan!
            </p>
            <div className="space-y-1.5 text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-indigo-500/20">
              <div className="flex justify-between text-slate-300">
                <span>🎯 500 XP:</span>
                <span className="font-bold text-indigo-400">%10 İndirim Kuponu</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>🏆 1.000 XP:</span>
                <span className="font-bold text-emerald-400">%20 İndirim Kuponu</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>👑 2.500 XP:</span>
                <span className="font-bold text-amber-400">1 Ay Full Ücretsiz</span>
              </div>
            </div>
          </div>

          {/* Topluluk Canlı Sayaçları */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-orange-500" /> Forum İstatistikleri
            </h3>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="block font-black text-lg text-slate-900 dark:text-white">
                  {stats.totalTopics.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Konu Başlığı
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="block font-black text-lg text-slate-900 dark:text-white">
                  {stats.totalPosts.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Toplam Mesaj
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                <span className="block font-black text-lg text-slate-900 dark:text-white">
                  {stats.totalMembers.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Kayıtlı Satıcı
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
                <span className="block font-black text-lg text-emerald-600 dark:text-emerald-400">
                  {stats.onlineUsers + stats.onlineGuests}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">
                  Canlı Üye
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5 flex items-center justify-between">
              <span>Son katılan satıcı:</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">{stats.newestMember}</span>
            </div>
          </div>

          {/* Çevrimiçi Uzmanlar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Crown size={14} className="text-amber-500" /> Öne Çıkan Satıcılar
            </h3>

            <div className="space-y-2.5">
              {[
                { name: "Pazaryonetimi Yönetim", role: "Sistem Yöneticisi", rep: "5.2k", isStaff: true },
                { name: "Burak Özkan", role: "Trendyol Platin", rep: "2.9k" },
                { name: "Can Gümüş", role: "Amazon FBA Lead", rep: "3.4k" },
                { name: "Kemal Tekin (SMMM)", role: "Mali Müşavir", rep: "4.1k" },
                { name: "Av. Melike Şen", role: "Hukuk Müşaviri", rep: "3.3k" },
              ].map((u) => (
                <div key={u.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                      {u.name.slice(0, 1)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        {u.name}
                        {u.isStaff && <Shield size={10} className="text-orange-500" />}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{u.role}</span>
                    </div>
                  </div>
                  <span className="font-bold text-orange-600 dark:text-orange-400 text-[11px]">
                    +{u.rep} XP
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/community/leaderboard"
              className="mt-3 block text-center py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Tüm Liderlik Tablosunu Gör &rarr;
            </Link>
          </div>
        </aside>
      </div>
    </ForumShell>
  );
}

