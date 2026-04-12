"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreHorizontal,
  Filter,
  Search,
  User,
  MessageSquare,
  Ban,
  Trash2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

interface ModerationReport {
  id: string;
  type: "post" | "topic" | "user";
  reason: "spam" | "offensive" | "harassment" | "off_topic" | "duplicate" | "other";
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  
  reporter: {
    id: string;
    name: string;
    avatar?: string;
  };
  
  reportedUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  
  post?: {
    id: string;
    content: string;
    excerpt: string;
    topicTitle: string;
  };
  
  topic?: {
    id: string;
    title: string;
  };
  
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  moderatorNote?: string;
  actionTaken?: "warning" | "ban" | "delete" | "dismiss" | "edit";
}

interface UserModerationLog {
  id: string;
  userId: string;
  userName: string;
  action: "warning" | "ban" | "unban" | "mute" | "delete_content";
  reason: string;
  moderatorId: string;
  moderatorName: string;
  duration?: string; // for bans
  createdAt: string;
}

export default function ForumModerationPage() {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [moderationLogs, setModerationLogs] = useState<UserModerationLog[]>([]);
  const [activeTab, setActiveTab] = useState<"reports" | "logs" | "banned">("reports");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  useEffect(() => {
    const mockReports: ModerationReport[] = [
      { id: "1", type: "post", reason: "spam", description: "Spam içerik", status: "pending", reporter: { id: "1", name: "Kullanıcı" }, createdAt: "2024-01-15" },
    ];
    const mockLogs: UserModerationLog[] = [
      { id: "1", userId: "1", userName: "Kullanıcı1", action: "warning", reason: "Kural ihlali", moderatorId: "2", moderatorName: "Admin", createdAt: "2024-01-15" },
    ];
    setReports(mockReports);
    setModerationLogs(mockLogs);
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesSearch = 
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportedUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: reports.filter((r) => r.status === "pending").length,
    investigating: reports.filter((r) => r.status === "investigating").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: "Spam",
      offensive: "Hakaret/Ayrımcılık",
      harassment: "Taciz",
      off_topic: "Konu Dışı",
      duplicate: "Tekrar",
      other: "Diğer",
    };
    return labels[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Bekliyor</span>;
      case "investigating":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">İnceleniyor</span>;
      case "resolved":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Çözüldü</span>;
      case "dismissed":
        return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Reddedildi</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/forum" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  Moderasyon Merkezi
                </h1>
                <p className="text-slate-500 text-sm">Rapor yönetimi ve kullanıcı disiplini</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-slate-500">Bekleyen</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
            <p className="text-sm text-slate-500">İnceleniyor</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-sm text-slate-500">Çözüldü</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-slate-600">{stats.dismissed}</p>
            <p className="text-sm text-slate-500">Reddedildi</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-fit">
          {[
            { id: "reports", label: "Raporlar", icon: Flag },
            { id: "logs", label: "İşlem Geçmişi", icon: Clock },
            { id: "banned", label: "Yasaklılar", icon: Ban },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-red-100 text-red-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rapor ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekliyor</option>
                <option value="investigating">İnceleniyor</option>
                <option value="resolved">Çözüldü</option>
                <option value="dismissed">Reddedildi</option>
              </select>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-200">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Flag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Rapor bulunmuyor.</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div 
                      key={report.id} 
                      className="p-4 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {report.reporter.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{report.reporter.name}</span>
                              <span className="text-slate-400">→</span>
                              {report.reportedUser && (
                                <Link 
                                  href={`/forum/user/${report.reportedUser.id}`}
                                  className="text-red-600 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {report.reportedUser.name}
                                </Link>
                              )}
                              {report.post && (
                                <span className="text-slate-500">mesajı</span>
                              )}
                              {report.topic && (
                                <Link 
                                  href={`/forum/topic/${report.topic.id}`}
                                  className="text-indigo-600 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {report.topic.title}
                                </Link>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                {getReasonLabel(report.reason)}
                              </span>
                              {getStatusBadge(report.status)}
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{report.description}</p>
                            {report.post && (
                              <div className="mt-2 p-3 bg-slate-100 rounded-lg text-sm text-slate-700">
                                {report.post.excerpt}
                              </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2">{report.createdAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 hover:bg-slate-200 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-bold">Moderasyon İşlem Geçmişi</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {moderationLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.action === "ban" ? "bg-red-100 text-red-600" :
                      log.action === "warning" ? "bg-yellow-100 text-yellow-600" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {log.action === "ban" ? <Ban className="w-5 h-5" /> :
                       log.action === "warning" ? <AlertTriangle className="w-5 h-5" /> :
                       <Shield className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        <Link href={`/forum/user/${log.userId}`} className="hover:text-indigo-600">
                          {log.userName}
                        </Link>
                        <span className="text-slate-500"> kullanıcısına </span>
                        <span className={
                          log.action === "ban" ? "text-red-600" :
                          log.action === "warning" ? "text-yellow-600" :
                          "text-slate-600"
                        }>
                          {log.action === "ban" && "yasaklama"}
                          {log.action === "warning" && "uyarı"}
                          {log.action === "unban" && "yasak kaldırma"}
                          {log.action === "mute" && "susturma"}
                          {log.action === "delete_content" && "içerik silme"}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500">{log.reason}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {log.moderatorName} tarafından • {log.createdAt}
                        {log.duration && <span className="ml-2">({log.duration})</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Banned Users Tab */}
        {activeTab === "banned" && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Ban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg">Yasaklı Kullanıcılar</h3>
            <p className="text-slate-500 mt-2">Aktif yasaklama bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold">Rapor Detayı</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Reporter Info */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedReport.reporter.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">Raporlayan: {selectedReport.reporter.name}</p>
                    <p className="text-sm text-slate-500">{selectedReport.createdAt}</p>
                  </div>
                </div>

                {/* Reported Content */}
                {selectedReport.reportedUser && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Raporlanan Kullanıcı</label>
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedReport.reportedUser.name.charAt(0)}
                      </div>
                      <Link href={`/forum/user/${selectedReport.reportedUser.id}`} className="font-medium text-red-700 hover:underline">
                        {selectedReport.reportedUser.name}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Post Content */}
                {selectedReport.post && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Raporlanan İçerik</label>
                    <div className="p-4 bg-slate-100 rounded-lg">
                      <p className="font-medium text-sm mb-2">Konu: {selectedReport.post.topicTitle}</p>
                      <p className="text-slate-700">{selectedReport.post.content}</p>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rapor Nedeni</label>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    {getReasonLabel(selectedReport.reason)}
                  </span>
                  <p className="mt-2 text-slate-700">{selectedReport.description}</p>
                </div>

                {/* Moderator Note */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Moderatör Notu</label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    rows={3}
                    placeholder="İşlem notu ekleyin..."
                    defaultValue={selectedReport.moderatorNote || ""}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {selectedReport.status === "pending" || selectedReport.status === "investigating" ? (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium">
                        <AlertTriangle className="w-4 h-4" /> Uyar
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                        <Ban className="w-4 h-4" /> Yasakla
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium">
                        <Trash2 className="w-4 h-4" /> Sil
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium">
                        <Check className="w-4 h-4" /> Reddet
                      </button>
                    </>
                  ) : (
                    <div className="w-full p-4 bg-slate-100 rounded-lg text-center">
                      <p className="text-slate-500">Bu rapor {selectedReport.status === "resolved" ? "çözüldü" : "reddedildi"}.</p>
                      {selectedReport.actionTaken && (
                        <p className="text-sm text-slate-600 mt-1">
                          İşlem: {selectedReport.actionTaken}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
