"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  MousePointer,
  Share2,
  ThumbsUp,
  MessageSquare,
  Search,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgReadTime: number;
    bounceRate: number;
    totalPosts: number;
    newSubscribers: number;
    socialShares: number;
  };
  topPosts: {
    id: string;
    title: string;
    views: number;
    readTime: number;
    likes: number;
    comments: number;
    trend: "up" | "down" | "stable";
    trendValue: number;
  }[];
  trafficSources: {
    source: string;
    views: number;
    percentage: number;
  }[];
  devices: {
    device: string;
    views: number;
    percentage: number;
  }[];
  countries: {
    country: string;
    views: number;
    flag: string;
  }[];
  dailyStats: {
    date: string;
    views: number;
    visitors: number;
  }[];
}

export default function BlogAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    overview: {
      totalViews: 12500,
      uniqueVisitors: 8400,
      avgReadTime: 185,
      bounceRate: 42,
      totalPosts: 48,
      newSubscribers: 156,
      socialShares: 89,
    },
    topPosts: [],
    trafficSources: [
      { source: "Google", views: 8400, percentage: 67 },
      { source: "Direkt", views: 2500, percentage: 20 },
      { source: "Sosyal", views: 1500, percentage: 12 },
      { source: "Diğer", views: 100, percentage: 1 },
    ],
    devices: [
      { device: "Desktop", views: 7500, percentage: 60 },
      { device: "Mobile", views: 4500, percentage: 36 },
      { device: "Tablet", views: 500, percentage: 4 },
    ],
    countries: [
      { country: "Türkiye", views: 10000, flag: "🇹🇷" },
      { country: "Almanya", views: 1500, flag: "🇩🇪" },
      { country: "ABD", views: 800, flag: "🇺🇸" },
    ],
    dailyStats: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      views: 1500 + Math.floor(Math.random() * 500),
      visitors: 1000 + Math.floor(Math.random() * 300),
    })).reverse(),
  });
  const [dateRange, setDateRange] = useState("7days");
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "audience" | "engagement">("overview");

  const overviewCards = [
    {
      title: "Toplam Görüntülenme",
      value: data.overview.totalViews.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: Eye,
      color: "blue",
    },
    {
      title: "Benzersiz Ziyaretçi",
      value: data.overview.uniqueVisitors.toLocaleString(),
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "emerald",
    },
    {
      title: "Ortalama Okuma Süresi",
      value: `${Math.floor(data.overview.avgReadTime / 60)}:${String(data.overview.avgReadTime % 60).padStart(2, "0")}`,
      change: "+15.3%",
      trend: "up",
      icon: Clock,
      color: "purple",
    },
    {
      title: "Hemen Çıkma Oranı",
      value: `${data.overview.bounceRate}%`,
      change: "-5.1%",
      trend: "up", // lower bounce rate is good
      icon: Target,
      color: "orange",
    },
  ];

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
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Blog Analitikleri
                </h1>
                <p className="text-slate-500 text-sm">Detaylı içerik performans analizi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="7days">Son 7 Gün</option>
                <option value="30days">Son 30 Gün</option>
                <option value="90days">Son 90 Gün</option>
                <option value="year">Bu Yıl</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
                <Download className="w-4 h-4" />
                Rapor İndir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-fit">
          {[
            { id: "overview", label: "Genel Bakış" },
            { id: "posts", label: "Yazılar" },
            { id: "audience", label: "Kitle" },
            { id: "engagement", label: "Etkileşim" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {overviewCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl border border-slate-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{card.title}</p>
                      <p className="text-2xl font-bold mt-1">{card.value}</p>
                    </div>
                    <div className={`p-3 bg-${card.color}-100 rounded-xl`}>
                      <card.icon className={`w-5 h-5 text-${card.color}-600`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4">
                    {card.trend === "up" ? (
                      <ArrowUpRight className={`w-4 h-4 text-green-600`} />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${card.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {card.change}
                    </span>
                    <span className="text-sm text-slate-400">vs geçen dönem</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Daily Traffic Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold mb-4">Günlük Trafik</h3>
                <div className="h-64 flex items-end gap-2">
                  {data.dailyStats.map((stat, index) => {
                    const maxViews = Math.max(...data.dailyStats.map((s) => s.views));
                    const height = (stat.views / maxViews) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md transition-all hover:from-blue-600 hover:to-blue-400"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${stat.date}: ${stat.views} görüntülenme`}
                        />
                        <span className="text-xs text-slate-400">
                          {new Date(stat.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold mb-4">Trafik Kaynakları</h3>
                <div className="space-y-4">
                  {data.trafficSources.map((source, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">{source.source}</span>
                        <span className="font-medium">{source.views.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-bold">En İyi Yazılar</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {data.topPosts.map((post, index) => (
                  <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                    <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{post.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {post.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTime}dk
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {post.comments}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.trend === "up" ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <TrendingUp className="w-4 h-4" /> +{post.trendValue}%
                        </span>
                      ) : post.trend === "down" ? (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <TrendingDown className="w-4 h-4" /> {post.trendValue}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">→ 0%</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold mb-6">Yazı Performansları</h3>
            {/* Detailed post analytics table */}
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === "audience" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Devices */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold mb-4">Cihaz Dağılımı</h3>
              <div className="space-y-4">
                {data.devices.map((device, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      {device.device === "Desktop" && <Monitor className="w-5 h-5 text-slate-600" />}
                      {device.device === "Mobile" && <Smartphone className="w-5 h-5 text-slate-600" />}
                      {device.device === "Tablet" && <Tablet className="w-5 h-5 text-slate-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-700">{device.device}</span>
                        <span className="font-medium">{device.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{device.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Countries */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-bold mb-4">Ülkeler</h3>
              <div className="space-y-3">
                {data.countries.slice(0, 10).map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <span className="text-slate-700">{country.country}</span>
                    </div>
                    <span className="font-medium">{country.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === "engagement" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-pink-600" />
              </div>
              <p className="text-3xl font-bold">{data.overview.totalPosts * 42}</p>
              <p className="text-slate-500">Toplam Beğeni</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-3xl font-bold">{data.overview.socialShares}</p>
              <p className="text-slate-500">Sosyal Paylaşım</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold">{data.overview.newSubscribers}</p>
              <p className="text-slate-500">Yeni Abone</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
