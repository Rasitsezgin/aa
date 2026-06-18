"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/admin-api";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Plus,
  Settings,
  Users,
  Shield,
  MessageSquare,
  BarChart3,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Folder,
  Hash,
  Lock,
  Globe,
  Pin,
  Bell,
  Filter,
} from "lucide-react";

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  isPrivate: boolean;
  boardCount: number;
  topicCount: number;
}

interface ForumBoard {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: "CATEGORY" | "FORUM" | "LINK" | "QNA" | "POLL" | "ANNOUNCEMENT";
  categoryId?: string;
  parentId?: string;
  icon?: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  topicCount: number;
  postCount: number;
  lastTopicTitle?: string;
  lastPostAt?: string;
  moderators: string[];
}

export default function ForumAdminPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [boards, setBoards] = useState<ForumBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "boards" | "moderators" | "settings">("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    async function loadForum() {
      try {
        const data = await adminApi.getForumOverview();
        setCategories(data.categories ?? []);
        setBoards(data.boards ?? []);
      } catch {
        setCategories([]);
        setBoards([]);
      } finally {
        setLoading(false);
      }
    }
    void loadForum();
  }, []);

  const stats = {
    totalCategories: categories.length,
    totalBoards: boards.length,
    totalTopics: boards.reduce((acc, b) => acc + b.topicCount, 0),
    totalPosts: boards.reduce((acc, b) => acc + b.postCount, 0),
    activeUsers: 0, // Would come from API
    pendingReports: 0,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FORUM": return <MessageSquare className="w-4 h-4" />;
      case "QNA": return <CheckCircle className="w-4 h-4" />;
      case "POLL": return <BarChart3 className="w-4 h-4" />;
      case "ANNOUNCEMENT": return <Bell className="w-4 h-4" />;
      case "LINK": return <Globe className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg">
                <LayoutGrid className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                  Forum Yönetimi
                </h1>
                <p className="text-slate-500 text-sm">vBulletin/XenForo tarzı forum sistemi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Yeni Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.totalCategories}</p>
            <p className="text-sm text-slate-500">Kategori</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.totalBoards}</p>
            <p className="text-sm text-slate-500">Bölüm</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.totalTopics.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Konu</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Mesaj</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
            <p className="text-sm text-slate-500">Aktif Üye</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-red-600">{stats.pendingReports}</p>
            <p className="text-sm text-slate-500">Rapor</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-fit">
          {[
            { id: "overview", label: "Genel Bakış", icon: LayoutGrid },
            { id: "categories", label: "Kategoriler", icon: Folder },
            { id: "boards", label: "Bölümler", icon: Hash },
            { id: "moderators", label: "Moderatörler", icon: Shield },
            { id: "settings", label: "Ayarlar", icon: Settings },
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

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold">Forum Kategorileri</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" /> Kategori Ekle
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${cat.color}-100 text-${cat.color}-600`}>
                      <Folder className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium">{cat.name}</h3>
                      <p className="text-sm text-slate-500">{cat.description || `${cat.boardCount} bölüm, ${cat.topicCount} konu`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cat.isPrivate && <Lock className="w-4 h-4 text-slate-400" />}
                    <span className={`px-2 py-1 rounded-full text-xs ${cat.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {cat.isActive ? "Aktif" : "Pasif"}
                    </span>
                    <button className="p-2 hover:bg-slate-200 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boards Tab */}
        {activeTab === "boards" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold">Forum Bölümleri</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">
                  <Filter className="w-4 h-4" /> Filtrele
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" /> Bölüm Ekle
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {boards.map((board) => (
                <div key={board.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${board.color}-100 text-${board.color}-600`}>
                        {getTypeIcon(board.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{board.name}</h3>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                            {board.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{board.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                          <span>{board.topicCount.toLocaleString()} konu</span>
                          <span>{board.postCount.toLocaleString()} mesaj</span>
                          {board.lastTopicTitle && (
                            <span className="text-slate-400">
                              Son: {board.lastTopicTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-200 rounded-lg">
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(board)}
                        className="p-2 hover:bg-slate-200 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moderators Tab */}
        {activeTab === "moderators" && (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg">Moderatör Yönetimi</h3>
              <p className="text-slate-500 mt-2">Bölüm moderatörlerini buradan yönetebilirsiniz.</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Moderatör Ekle
              </button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold mb-4">Forum Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Forum Başlığı</label>
                <input type="text" defaultValue="Topluluk Forumu" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg" rows={3} defaultValue="Deneyimlerinizi paylaşın, sorular sorun..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sayfa Başına Konu</label>
                  <input type="number" defaultValue={25} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sayfa Başına Mesaj</label>
                  <input type="number" defaultValue={20} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
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
                <h2 className="text-xl font-bold">Yeni Forum Öğesi</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl text-left">
                    <Folder className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="font-medium">Kategori</p>
                    <p className="text-sm text-slate-500">Forum kategorisi oluştur</p>
                  </button>
                  <button className="p-4 border-2 border-slate-200 rounded-xl text-left hover:border-indigo-300">
                    <Hash className="w-6 h-6 text-slate-600 mb-2" />
                    <p className="font-medium">Bölüm</p>
                    <p className="text-sm text-slate-500">Tartışma bölümü oluştur</p>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
