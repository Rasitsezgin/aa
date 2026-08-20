"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, Plus, X, Bold, Italic, Link as LinkIcon, List, ListOrdered,
  Quote, Code, Image as ImageIcon, Smile, Paperclip, Eye, HelpCircle, Hash,
  ChevronDown, Send, Save, MessageSquare, Loader2, LogIn,
} from "lucide-react";
import ForumShell from "@/components/forum/ForumShell";
import { createForumTopic, fetchForumBoards } from "@/lib/forum-api";

interface BoardOption {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryName: string;
}

const DEFAULT_BOARD_OPTIONS: BoardOption[] = [
  { id: "b5", name: "Trendyol Satıcı Paneli & Buybox", slug: "trendyol-panel", categoryName: "Türkiye Pazaryerleri" },
  { id: "b6", name: "Trendyol Komisyon & Fiyatlandırma", slug: "trendyol-fiyat", categoryName: "Türkiye Pazaryerleri" },
  { id: "b7", name: "Hepsiburada & HepsiPartner", slug: "hepsiburada-pazar", categoryName: "Türkiye Pazaryerleri" },
  { id: "b8", name: "N11, Çiçeksepeti & PttAVM", slug: "n11-ciceksepeti", categoryName: "Türkiye Pazaryerleri" },
  { id: "b9", name: "Amazon Türkiye & SP-API", slug: "amazon-fba-tr", categoryName: "Global Pazaryerleri & E-İhracat" },
  { id: "b10", name: "Amazon Global (US, EU, UK)", slug: "amazon-global", categoryName: "Global Pazaryerleri & E-İhracat" },
  { id: "b11", name: "Etsy & Vintage / Handmade", slug: "etsy-magaza", categoryName: "Global Pazaryerleri & E-İhracat" },
  { id: "b12", name: "Mikro İhracat & ETGB Gümrük", slug: "mikro-ihracat", categoryName: "Global Pazaryerleri & E-İhracat" },
  { id: "b13", name: "Dinamik Fiyatlandırma & Repricer", slug: "fiyat-strateji", categoryName: "Operasyon, Fiyat & Stok" },
  { id: "b14", name: "Envanter & Çoklu Depo Yönetimi", slug: "stok-yonetim", categoryName: "Operasyon, Fiyat & Stok" },
  { id: "b15", name: "Kargo, Lojistik & İade Yönetimi", slug: "kargo-lojistik", categoryName: "Operasyon, Fiyat & Stok" },
  { id: "b16", name: "Tedarik Zinciri & XML Dropshipping", slug: "tedarik-zincir", categoryName: "Operasyon, Fiyat & Stok" },
  { id: "b17", name: "Google Ads & Merchant Center", slug: "google-ads", categoryName: "Dijital Pazarlama & SEO" },
  { id: "b18", name: "Meta Reklamları", slug: "meta-ads", categoryName: "Dijital Pazarlama & SEO" },
  { id: "b19", name: "TikTok Shop & Influencer", slug: "tiktok-shop", categoryName: "Dijital Pazarlama & SEO" },
  { id: "b20", name: "E-Ticaret SEO & Ürün Açıklamaları", slug: "seo-icerik", categoryName: "Dijital Pazarlama & SEO" },
  { id: "b21", name: "Pazaryonetimi REST API & Webhook", slug: "api-entegrasyon", categoryName: "Teknik, Yazılım & ERP" },
  { id: "b22", name: "ERP & Muhasebe Entegrasyonu", slug: "erp-muhasebe", categoryName: "Teknik, Yazılım & ERP" },
  { id: "b23", name: "E-Ticaret Altyapıları & AI Araçları", slug: "eticaret-yazilim", categoryName: "Teknik, Yazılım & ERP" },
  { id: "b24", name: "E-Ticaret Vergi, E-Fatura & KDV", slug: "vergi-muhasebe", categoryName: "Mali & Hukuki Mevzuat" },
  { id: "b25", name: "KVKK, Marka Tescili & Haklar", slug: "kvkk-hukuk", categoryName: "Mali & Hukuki Mevzuat" },
];

export default function NewTopicPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBoardParam = searchParams.get("board");
  const { data: session, status } = useSession();

  const [boards, setBoards] = useState<BoardOption[]>(DEFAULT_BOARD_OPTIONS);
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<BoardOption | null>(
    DEFAULT_BOARD_OPTIONS.find(b => b.id === preselectedBoardParam || b.slug === preselectedBoardParam) || DEFAULT_BOARD_OPTIONS[0]
  );
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [topicType, setTopicType] = useState<"normal" | "poll" | "question">("normal");
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    fetchForumBoards()
      .then((categories) => {
        if (categories && categories.length > 0) {
          const flat = categories.flatMap((category) =>
            category.boards.map((board) => ({
              id: board.id,
              name: board.name,
              slug: board.slug,
              description: board.description,
              categoryName: category.name,
            })),
          );
          setBoards(flat);
          if (preselectedBoardParam) {
            const found = flat.find(b => b.id === preselectedBoardParam || b.slug === preselectedBoardParam);
            if (found) setSelectedBoard(found);
          }
        }
      })
      .catch((error) => {
        console.error("[forum/new-topic] Board yükleme hatası:", error);
      });
  }, [preselectedBoardParam]);

  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value) && tags.length < 5) {
      setTags([...tags, value]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (isDraft = false) => {
    if (isDraft) return;
    if (!selectedBoard) {
      setSubmitError("Lütfen bir forum bölümü seçin.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const created = await createForumTopic({
        title,
        content,
        boardId: selectedBoard.id,
        type: topicType,
        tags,
      });
      router.push(`/forum/topic/${created.slug}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Konu oluşturulamadı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <ForumShell>
        <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      </ForumShell>
    );
  }

  if (status === "unauthenticated") {
    return (
      <ForumShell>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <MessageSquare className="w-14 h-14 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Giriş gerekli</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Konu açmak için Pazaryönetimi hesabınızla giriş yapmalısınız.
          </p>
          <Link
            href="/login?callbackUrl=/forum/new-topic"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-500"
          >
            <LogIn size={18} /> Giriş Yap
          </Link>
        </div>
      </ForumShell>
    );
  }

  return (
    <ForumShell>
      <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-20 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link href="/forum" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                  <Plus className="w-5 h-5 text-orange-600 shrink-0" />
                  Yeni Konu Aç
                </h1>
                <p className="text-sm text-slate-500 truncate">{session?.user?.name || session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Eye className="w-4 h-4" />
                {isPreview ? "Düzenle" : "Önizle"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={!title.trim() || !content.trim() || !selectedBoard || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-500 disabled:opacity-50 font-bold"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Gönder
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {submitError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bölüm *</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBoardDropdown(!showBoardDropdown)}
                  disabled={isLoadingBoards}
                  className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-300 text-left"
                >
                  {selectedBoard ? (
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedBoard.name}</span>
                      <span className="text-slate-500 text-sm ml-2">({selectedBoard.categoryName})</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">{isLoadingBoards ? "Bölümler yükleniyor..." : "Bölüm seçin..."}</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showBoardDropdown ? "rotate-180" : ""}`} />
                </button>
                {showBoardDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                    {boards.map((board) => (
                      <button
                        key={board.id}
                        type="button"
                        onClick={() => {
                          setSelectedBoard(board);
                          setShowBoardDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/10 border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">{board.name}</p>
                        <p className="text-sm text-slate-500">{board.categoryName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Konu Başlığı *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Açıklayıcı bir başlık yazın..."
                className="w-full px-4 py-3 text-lg border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 bg-transparent"
                maxLength={100}
              />
              <p className="text-xs text-slate-400 mt-1 text-right">{title.length}/100</p>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Konu Tipi</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { id: "normal", label: "Normal", icon: MessageSquare },
                  { id: "question", label: "Soru", icon: HelpCircle },
                  { id: "poll", label: "Anket", icon: Hash },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setTopicType(type.id as typeof topicType)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                      topicType === type.id
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                        : "border-slate-200 dark:border-slate-700 hover:border-orange-300"
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {!isPreview ? (
              <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="flex items-center gap-1 p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto">
                  {[Bold, Italic, LinkIcon, List, ListOrdered, Quote, Code, ImageIcon, Smile, Paperclip].map((Icon, index) => (
                    <button key={index} type="button" className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg" title="Yakında">
                      <Icon className="w-4 h-4 text-slate-500" />
                    </button>
                  ))}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Mesajınızı buraya yazın..."
                  className="w-full h-80 p-4 resize-none border-0 focus:ring-0 bg-transparent text-slate-900 dark:text-white"
                />
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
                  <span>En az 10 karakter</span>
                  <span>{content.length} karakter</span>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-xl font-black mb-4 text-slate-900 dark:text-white">{title || "(Başlıksız)"}</h2>
                <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
                  {content || <span className="text-slate-400 italic">İçerik yok...</span>}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Etiketler</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 rounded-full text-sm">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-orange-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Etiket ekle..."
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-transparent"
                />
                <button type="button" onClick={addTag} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl p-4 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" /> Topluluk Kuralları
              </h3>
              <ul className="space-y-2 text-sm text-orange-50">
                <li>• Benzer konuları aramadan yeni başlık açmayın</li>
                <li>• Açıklayıcı ve net başlıklar kullanın</li>
                <li>• Saygılı ve yapıcı olun</li>
                <li>• Spam ve reklam yapmayın</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ForumShell>
  );
}
