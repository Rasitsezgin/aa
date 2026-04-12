"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Plus,
  Users,
  Send,
  BarChart3,
  Eye,
  MousePointer,
  Ban,
  Edit2,
  Download,
  Upload,
  Search,
} from "lucide-react";

interface Newsletter {
  id: string;
  name: string;
  description?: string;
  fromName: string;
  fromEmail: string;
  subscriberCount: number;
  template: string;
  isActive: boolean;
}

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  isVerified: boolean;
  openCount: number;
  clickCount: number;
  subscribedAt: string;
}

interface Campaign {
  id: string;
  subject: string;
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openCount: number;
  clickCount: number;
}

export default function NewsletterPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "subscribers" | "campaigns">("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [, setShowCampaignModal] = useState(false);

  // Initialize mock data
  useState(() => {
    const mockNewsletters: Newsletter[] = [
      { id: "1", name: "Haftalık Bülten", fromName: "Pazaryönetimi", fromEmail: "info@pazaryonetimi.com", subscriberCount: 1250, template: "default", isActive: true },
    ];
    const mockSubscribers: Subscriber[] = [
      { id: "1", email: "user@example.com", name: "Kullanıcı", isActive: true, isVerified: true, openCount: 5, clickCount: 2, subscribedAt: "2024-01-15" },
    ];
    const mockCampaigns: Campaign[] = [
      { id: "1", subject: "Yeni Özellikler", status: "sent", sentAt: "2024-01-15", recipientCount: 1250, openCount: 600, clickCount: 200 },
    ];
    setNewsletters(mockNewsletters);
    setSubscribers(mockSubscribers);
    setCampaigns(mockCampaigns);
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalSubscribers: subscribers.length,
    activeSubscribers: subscribers.filter((s) => s.isActive).length,
    totalCampaigns: campaigns.length,
    avgOpenRate: campaigns.length > 0
      ? campaigns.reduce((acc, c) => acc + (c.openCount / c.recipientCount) * 100, 0) / campaigns.length
      : 0,
    avgClickRate: campaigns.length > 0
      ? campaigns.reduce((acc, c) => acc + (c.clickCount / c.recipientCount) * 100, 0) / campaigns.length
      : 0,
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
                  <Mail className="w-6 h-6 text-rose-600" />
                  Newsletter Yönetimi
                </h1>
                <p className="text-slate-500 text-sm">E-posta kampanyaları ve aboneler</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCampaignModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                <Send className="w-4 h-4" />
                Kampanya Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 mb-6 w-fit">
            {[
            { id: "overview", label: "Genel Bakış", icon: BarChart3 },
            { id: "subscribers", label: "Aboneler", icon: Users },
            { id: "campaigns", label: "Kampanyalar", icon: Mail },
          ].map((tab: { id: "overview" | "subscribers" | "campaigns"; label: string; icon: typeof Mail }) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-rose-100 text-rose-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-3xl font-bold">{stats.totalSubscribers.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Toplam Abone</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-3xl font-bold text-green-600">{stats.activeSubscribers.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Aktif Abone</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-3xl font-bold text-blue-600">{stats.avgOpenRate.toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Ort. Açılma Oranı</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-3xl font-bold text-purple-600">{stats.avgClickRate.toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Ort. Tıklama Oranı</p>
              </div>
            </div>

            {/* Newsletters */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-bold">Newsletter&apos;lar</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" /> Yeni
                </button>
              </div>
              <div className="divide-y divide-slate-200">
                {newsletters.map((newsletter) => (
                  <div key={newsletter.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        newsletter.isActive ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
                      }`}>
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{newsletter.name}</h3>
                        <p className="text-sm text-slate-500">
                          {newsletter.fromEmail} • {newsletter.subscriberCount} abone
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {newsletter.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aktif</span>
                      )}
                      <button className="p-2 hover:bg-slate-200 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Subscribers Tab */}
        {activeTab === "subscribers" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Abone ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                <Upload className="w-4 h-4" /> İçe Aktar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
                <Download className="w-4 h-4" /> Dışa Aktar
              </button>
            </div>
            <div className="divide-y divide-slate-200">
              {filteredSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium">
                      {subscriber.name?.charAt(0) || subscriber.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{subscriber.name || subscriber.email}</p>
                      <p className="text-sm text-slate-500">{subscriber.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-500">
                      <span className="mr-4">{subscriber.openCount} açma</span>
                      <span>{subscriber.clickCount} tıklama</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      subscriber.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {subscriber.isActive ? "Aktif" : "Pasif"}
                    </span>
                    <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-bold">E-posta Kampanyaları</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{campaign.subject}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === "sent" ? "bg-green-100 text-green-700" :
                      campaign.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {campaign.status === "sent" ? "Gönderildi" :
                       campaign.status === "scheduled" ? "Planlandı" : "Taslak"}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {campaign.recipientCount} alıcı
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {((campaign.openCount / campaign.recipientCount) * 100).toFixed(1)}% açılma
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="w-4 h-4" /> {((campaign.clickCount / campaign.recipientCount) * 100).toFixed(1)}% tıklama
                    </span>
                    {campaign.sentAt && (
                      <span>{new Date(campaign.sentAt).toLocaleString("tr-TR")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Newsletter Modal */}
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
                <h2 className="text-xl font-bold">Yeni Newsletter</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">İsim</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Haftalık Bülten" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gönderen Adı</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Pazaryonetimi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gönderen E-posta</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="newsletter@pazaryonetimi.com" />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg">
                  İptal
                </button>
                <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                  Oluştur
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
