"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Sparkles,
  Target,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Zap,
  FileText,
  Type,
  Search,
  Image,
  BarChart3,
  TrendingUp,
  Wand2,
  Edit2,
  Eye,
  Check,
  X,
  ChevronRight,
  Gauge,
  Award,
  Trophy,
} from "lucide-react";

interface QualityReport {
  postId: string;
  postTitle: string;
  overallScore: number;
  readabilityScore: number;
  seoScore: number;
  engagementScore: number;
  originalityScore: number;
  completenessScore: number;
  issues: {
    type: "error" | "warning" | "info";
    category: string;
    message: string;
    suggestion: string;
  }[];
  suggestions: {
    category: string;
    priority: "high" | "medium" | "low";
    action: string;
    autoFixable: boolean;
  }[];
  aiAnalysis: string;
  lastChecked: string;
}

export default function ContentQualityPage() {
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<QualityReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [filterScore, setFilterScore] = useState<string>("all");

  // Initialize mock data
  useState(() => {
    const mockReports: QualityReport[] = [
      { postId: "1", postTitle: "Blog Yazısı", overallScore: 85, readabilityScore: 90, seoScore: 80, engagementScore: 85, originalityScore: 95, completenessScore: 80, issues: [], suggestions: [], aiAnalysis: "Kaliteli içerik", lastChecked: "2024-01-15" },
    ];
    setReports(mockReports);
  });

  const filteredReports = reports.filter((report) => {
    if (filterScore === "excellent") return report.overallScore >= 90;
    if (filterScore === "good") return report.overallScore >= 70 && report.overallScore < 90;
    if (filterScore === "needswork") return report.overallScore < 70;
    return true;
  });

  const stats = {
    total: reports.length,
    excellent: reports.filter((r) => r.overallScore >= 90).length,
    good: reports.filter((r) => r.overallScore >= 70 && r.overallScore < 90).length,
    needsWork: reports.filter((r) => r.overallScore < 70).length,
    avgScore: reports.length > 0
      ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length)
      : 0,
  };

  const runAnalysis = async (postId: string) => {
    setIsAnalyzing(postId);
    // API call to run AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAnalyzing(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Mükemmel";
    if (score >= 70) return "İyi";
    if (score >= 50) return "Geliştirilmeli";
    return "Zayıf";
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
                  <Gauge className="w-6 h-6 text-amber-600" />
                  İçerik Kalite Analizi
                </h1>
                <p className="text-slate-500 text-sm">AI destekli içerik değerlendirme</p>
              </div>
            </div>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <Sparkles className="w-4 h-4" />
              Tümünü Analiz Et
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-slate-500">Analiz Edildi</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-green-600">{stats.excellent}</p>
            <p className="text-sm text-slate-500">Mükemmel</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-yellow-600">{stats.good}</p>
            <p className="text-sm text-slate-500">İyi</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-red-600">{stats.needsWork}</p>
            <p className="text-sm text-slate-500">Geliştirilmeli</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-amber-600">{stats.avgScore}</p>
            <p className="text-sm text-slate-500">Ort. Puan</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg"
          >
            <option value="all">Tüm Puanlar</option>
            <option value="excellent">Mükemmel (90+)</option>
            <option value="good">İyi (70-89)</option>
            <option value="needswork">Geliştirilmeli (&lt;70)</option>
          </select>
        </div>

        {/* Reports Grid */}
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <motion.div
              key={report.postId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{report.postTitle}</h3>
                  <p className="text-sm text-slate-500">
                    Son kontrol: {new Date(report.lastChecked).toLocaleString("tr-TR")}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold text-lg ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-5 gap-4 mb-4">
                {[
                  { label: "Okunabilirlik", score: report.readabilityScore, icon: FileText },
                  { label: "SEO", score: report.seoScore, icon: Search },
                  { label: "Etkileşim", score: report.engagementScore, icon: BarChart3 },
                  { label: "Özgünlük", score: report.originalityScore, icon: Sparkles },
                  { label: "Tamamlanmışlık", score: report.completenessScore, icon: CheckCircle },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      item.score >= 90 ? "bg-green-100 text-green-600" :
                      item.score >= 70 ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="font-bold">{item.score}</p>
                  </div>
                ))}
              </div>

              {/* Issues Preview */}
              {report.issues.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">{report.issues.filter((i) => i.type === "error").length} hata</span>
                  <span className="text-slate-300">|</span>
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600">{report.issues.filter((i) => i.type === "warning").length} uyarı</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    runAnalysis(report.postId);
                  }}
                  disabled={isAnalyzing === report.postId}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm"
                >
                  {isAnalyzing === report.postId ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Yeniden Analiz
                </button>
                <Link
                  href={`/admin/blog/${report.postId}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 text-sm"
                >
                  <Edit2 className="w-4 h-4" /> Düzenle
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
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
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{selectedReport.postTitle}</h2>
                  <div className={`px-4 py-2 rounded-full font-bold text-xl ${getScoreColor(selectedReport.overallScore)}`}>
                    {selectedReport.overallScore} - {getScoreLabel(selectedReport.overallScore)}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* AI Analysis */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    AI Analizi
                  </h3>
                  <p className="text-purple-800">{selectedReport.aiAnalysis}</p>
                </div>

                {/* Score Details */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: "Okunabilirlik", score: selectedReport.readabilityScore },
                    { label: "SEO", score: selectedReport.seoScore },
                    { label: "Etkileşim", score: selectedReport.engagementScore },
                    { label: "Özgünlük", score: selectedReport.originalityScore },
                    { label: "Tamamlanmışlık", score: selectedReport.completenessScore },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">{item.label}</p>
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                        item.score >= 90 ? "bg-green-100 text-green-600" :
                        item.score >= 70 ? "bg-yellow-100 text-yellow-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {item.score}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Issues */}
                {selectedReport.issues.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3">Tespit Edilen Sorunlar</h3>
                    <div className="space-y-2">
                      {selectedReport.issues.map((issue, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg flex items-start gap-3 ${
                            issue.type === "error" ? "bg-red-50 border border-red-100" :
                            issue.type === "warning" ? "bg-yellow-50 border border-yellow-100" :
                            "bg-blue-50 border border-blue-100"
                          }`}
                        >
                          {issue.type === "error" && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                          {issue.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                          {issue.type === "info" && <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                          <div>
                            <p className={`font-medium ${
                              issue.type === "error" ? "text-red-900" :
                              issue.type === "warning" ? "text-yellow-900" :
                              "text-blue-900"
                            }`}>
                              {issue.message}
                            </p>
                            <p className="text-sm mt-1 text-slate-600">
                              <span className="font-medium">Öneri:</span> {issue.suggestion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auto-fix Suggestions */}
                {selectedReport.suggestions.filter((s) => s.autoFixable).length > 0 && (
                  <div>
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      Otomatik Düzeltme Önerileri
                    </h3>
                    <div className="space-y-2">
                      {selectedReport.suggestions
                        .filter((s) => s.autoFixable)
                        .map((suggestion, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100"
                          >
                            <div>
                              <p className="font-medium text-green-900">{suggestion.action}</p>
                              <p className="text-sm text-green-700">{suggestion.category}</p>
                            </div>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                              Uygula
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg"
                >
                  Kapat
                </button>
                <Link
                  href={`/admin/blog/${selectedReport.postId}/edit`}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Yazıyı Düzenle
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
