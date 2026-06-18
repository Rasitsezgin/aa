"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Plus,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Eye,
  MousePointer,
  Heart,
  MessageCircle,
  RefreshCw,
  Settings,
  Edit2,
  Trash2,
  MoreHorizontal,
  Calendar,
  Check,
  X,
  Zap,
  Bot,
  Sparkles,
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: "TWITTER" | "FACEBOOK" | "LINKEDIN" | "INSTAGRAM" | "PINTEREST";
  accountName: string;
  followerCount: number;
  isActive: boolean;
  autoShare: boolean;
}

interface SocialShare {
  id: string;
  postTitle: string;
  platform: string;
  message: string;
  imageUrl?: string;
  scheduledAt?: string;
  publishedAt?: string;
  status: "draft" | "scheduled" | "published" | "failed";
  impressions: number;
  clicks: number;
  likes: number;
  shares: number;
  comments: number;
}

export default function SocialSharingPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [shares, setShares] = useState<SocialShare[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "scheduled">("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSocial() {
      try {
        const res = await fetch("/api/admin/blog/social");
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setAccounts(data.accounts ?? []);
        setShares(data.shares ?? []);
      } catch {
        setAccounts([]);
        setShares([]);
      } finally {
        setLoading(false);
      }
    }
    void loadSocial();
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "TWITTER": return <Twitter className="w-5 h-5" />;
      case "FACEBOOK": return <Facebook className="w-5 h-5" />;
      case "LINKEDIN": return <Linkedin className="w-5 h-5" />;
      case "INSTAGRAM": return <Instagram className="w-5 h-5" />;
      case "PINTEREST": return <Share2 className="w-5 h-5" />;
      default: return <Share2 className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "TWITTER": return "bg-sky-500 text-white";
      case "FACEBOOK": return "bg-blue-600 text-white";
      case "LINKEDIN": return "bg-blue-700 text-white";
      case "INSTAGRAM": return "bg-gradient-to-br from-purple-600 to-pink-500 text-white";
      case "PINTEREST": return "bg-red-600 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const stats = {
    totalShares: shares.length,
    published: shares.filter((s) => s.status === "published").length,
    scheduled: shares.filter((s) => s.status === "scheduled").length,
    totalEngagement: shares.reduce((acc, s) => acc + s.likes + s.shares + s.comments, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Share2 className="w-6 h-6 text-sky-600" />
                  Sosyal Paylaşım
                </h1>
                <p className="text-slate-500 text-sm">Otomatik sosyal medya yönetimi</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              <Plus className="w-4 h-4" />
              Paylaşım Planla
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
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.totalShares}</p>
            <p className="text-sm text-slate-500">Toplam Paylaşım</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            <p className="text-sm text-slate-500">Yayında</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            <p className="text-sm text-slate-500">Planlandı</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-pink-600">{stats.totalEngagement.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Etkileşim</p>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-bold">Bağlı Hesaplar</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getPlatformColor(account.platform)}`}>
                    {getPlatformIcon(account.platform)}
                  </div>
                  <div>
                    <h3 className="font-medium">{account.accountName}</h3>
                    <p className="text-sm text-slate-500">{account.followerCount.toLocaleString()} takipçi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={account.autoShare} className="rounded" />
                    <span>Oto. paylaş</span>
                  </label>
                  {account.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Bağlı</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Bağlantı kesildi</span>
                  )}
                  <button className="p-2 hover:bg-slate-200 rounded-lg">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Shares */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold">Planlanmış Paylaşımlar</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-slate-100 rounded-lg hover:bg-slate-200">Tümü</button>
              <button className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg">Yayında</button>
              <button className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg">Planlandı</button>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {shares.map((share) => (
              <div key={share.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPlatformColor(share.platform)}`}>
                      {getPlatformIcon(share.platform)}
                    </div>
                    <div>
                      <h3 className="font-medium">{share.postTitle}</h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{share.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        {share.status === "scheduled" && share.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(share.scheduledAt).toLocaleString("tr-TR")}
                          </span>
                        )}
                        {share.status === "published" && share.publishedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {new Date(share.publishedAt).toLocaleString("tr-TR")}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          share.status === "published" ? "bg-green-100 text-green-700" :
                          share.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                          share.status === "failed" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {share.status === "published" && "Yayında"}
                          {share.status === "scheduled" && "Planlandı"}
                          {share.status === "draft" && "Taslak"}
                          {share.status === "failed" && "Başarısız"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {share.status === "published" && (
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {share.impressions.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="w-4 h-4" /> {share.clicks}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {share.likes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>

      {/* Create Share Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold">Sosyal Paylaşım Planla</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Blog Yazısı</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                    <option>Yazı seçin...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platformlar</label>
                  <div className="flex flex-wrap gap-2">
                    {["Twitter", "Facebook", "LinkedIn", "Instagram"].map((platform) => (
                      <label key={platform} className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mesaj</label>
                  <textarea
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg resize-none"
                    rows={4}
                    placeholder="Paylaşım mesajı..."
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-400">0/280 karakter</span>
                    <button className="text-xs text-purple-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI ile oluştur
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tarih & Saat</label>
                  <input type="datetime-local" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <div>
                      <span className="text-sm font-medium text-purple-900 flex items-center gap-1">
                        <Zap className="w-4 h-4" /> Akıllı Zamanlama
                      </span>
                      <p className="text-xs text-purple-700">En yüksek etkileşim saatini otomatik seç</p>
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg"
                >
                  İptal
                </button>
                <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                  Planla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
