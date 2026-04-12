"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Eye,
  User,
  Clock,
  Filter,
  Search,
  Sparkles,
  Bot,
  Shield,
  BarChart3,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  RefreshCw,
  Check,
  X,
  Send,
  Ban,
  UserX,
  Flag,
} from "lucide-react";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  postTitle: string;
  postSlug: string;
  status: "PENDING" | "APPROVED" | "SPAM" | "DELETED" | "FLAGGED";
  createdAt: string;
  ipAddress: string;
  isAiModerated: boolean;
  aiToxicityScore?: number;
  aiSentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  parentId?: string;
  replies: Comment[];
}

export default function CommentModerationPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showAiOnly, setShowAiOnly] = useState(false);

  // Initialize mock data
  useState(() => {
    const mockComments: Comment[] = [
      { id: "1", content: "Örnek yorum", authorName: "Kullanıcı", authorEmail: "user@example.com", postTitle: "Blog Yazısı", postSlug: "blog-yazisi", status: "PENDING", createdAt: "2024-01-15", ipAddress: "127.0.0.1", isAiModerated: false, replies: [] },
    ];
    setComments(mockComments);
  });

  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const matchesSearch =
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.postTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || comment.status === selectedStatus;
      const matchesAi = !showAiOnly || comment.isAiModerated;
      
      return matchesSearch && matchesStatus && matchesAi;
    });
  }, [comments, searchTerm, selectedStatus, showAiOnly]);

  const stats = useMemo(() => ({
    total: comments.length,
    pending: comments.filter((c) => c.status === "PENDING").length,
    approved: comments.filter((c) => c.status === "APPROVED").length,
    spam: comments.filter((c) => c.status === "SPAM").length,
    flagged: comments.filter((c) => c.status === "FLAGGED").length,
    aiModerated: comments.filter((c) => c.isAiModerated).length,
    toxic: comments.filter((c) => (c.aiToxicityScore || 0) > 0.7).length,
  }), [comments]);

  const handleAction = async (commentId: string, action: string) => {
    setIsProcessing(commentId);
    try {
      await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleBulkAction = async (action: string) => {
    // Implement bulk action
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Onaylı</span>;
      case "PENDING":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Beklemede</span>;
      case "SPAM":
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Spam</span>;
      case "FLAGGED":
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">İşaretlendi</span>;
      case "DELETED":
        return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Silindi</span>;
      default:
        return null;
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "POSITIVE": return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case "NEGATIVE": return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default: return <span className="w-4 h-4 rounded-full bg-slate-300" />;
    }
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
                  <MessageSquare className="w-6 h-6 text-emerald-600" />
                  Yorum Moderasyonu
                </h1>
                <p className="text-slate-500 text-sm">AI destekli yorum yönetimi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkAction("run-ai-moderation")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                <Bot className="w-4 h-4" />
                AI Tarama Çalıştır
              </button>
              <Link
                href="/admin/blog/comments/settings"
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Filter className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-slate-500">Toplam</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-slate-500">Beklemede</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-slate-500">Onaylı</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-red-600">{stats.spam}</p>
            <p className="text-sm text-slate-500">Spam</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-orange-600">{stats.flagged}</p>
            <p className="text-sm text-slate-500">İşaretlendi</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-purple-600">{stats.aiModerated}</p>
            <p className="text-sm text-slate-500">AI İşlemli</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Yorum, yazar veya yazı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="PENDING">Beklemede</option>
            <option value="APPROVED">Onaylı</option>
            <option value="SPAM">Spam</option>
            <option value="FLAGGED">İşaretlendi</option>
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={showAiOnly}
              onChange={(e) => setShowAiOnly(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Sadece AI İşlemli</span>
          </label>
        </div>

        {/* Comments List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Yorum bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredComments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    comment.status === "PENDING" ? "bg-yellow-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{comment.authorName}</span>
                            <span className="text-slate-400">{comment.authorEmail}</span>
                            {getStatusBadge(comment.status)}
                            {comment.isAiModerated && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1">
                                <Bot className="w-3 h-3" /> AI
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            <Link href={`/blog/${comment.postSlug}`} className="hover:underline">
                              {comment.postTitle}
                            </Link>
                            {" "}•{" "}
                            {new Date(comment.createdAt).toLocaleString("tr-TR")}
                          </p>
                        </div>

                        {/* AI Scores */}
                        {comment.isAiModerated && (
                          <div className="flex items-center gap-3 text-sm">
                            {comment.aiToxicityScore !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">Toxicity:</span>
                                <span
                                  className={`font-medium ${
                                    comment.aiToxicityScore > 0.7
                                      ? "text-red-600"
                                      : comment.aiToxicityScore > 0.4
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {(comment.aiToxicityScore * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                            {comment.aiSentiment && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">Duygu:</span>
                                {getSentimentIcon(comment.aiSentiment)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-slate-700 mt-2">{comment.content}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {comment.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleAction(comment.id, "approve")}
                              disabled={isProcessing === comment.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                            >
                              <CheckCircle className="w-4 h-4" /> Onayla
                            </button>
                            <button
                              onClick={() => handleAction(comment.id, "spam")}
                              disabled={isProcessing === comment.id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                            >
                              <Shield className="w-4 h-4" /> Spam
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedComment(comment)}
                          className="flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                        >
                          <Eye className="w-4 h-4" /> Detay
                        </button>
                        <button
                          onClick={() => handleAction(comment.id, "delete")}
                          disabled={isProcessing === comment.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          <Trash2 className="w-4 h-4" /> Sil
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment Detail Modal */}
      <AnimatePresence>
        {selectedComment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedComment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold">Yorum Detayı</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedComment.authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{selectedComment.authorName}</p>
                    <p className="text-sm text-slate-500">{selectedComment.authorEmail}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-700">{selectedComment.content}</p>
                </div>

                {selectedComment.isAiModerated && (
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <h3 className="font-medium text-purple-900 flex items-center gap-2 mb-3">
                      <Bot className="w-5 h-5" />
                      AI Moderasyon Analizi
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Toxicity Skoru</p>
                        <p className="text-lg font-bold text-purple-700">
                          {((selectedComment.aiToxicityScore || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Duygu Analizi</p>
                        <p className="text-lg font-bold text-purple-700">
                          {selectedComment.aiSentiment || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleAction(selectedComment.id, "approve");
                      setSelectedComment(null);
                    }}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => {
                      handleAction(selectedComment.id, "spam");
                      setSelectedComment(null);
                    }}
                    className="flex-1 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Spam İşaretle
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
