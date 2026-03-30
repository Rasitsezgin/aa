"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  Copy,
  ExternalLink,
  Save,
  AlertCircle,
  Percent,
  Truck,
  Package,
  Zap,
} from "lucide-react";

interface OfferLead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  message?: string;
  createdAt: string;
  isContacted: boolean;
}

interface SpecialOffer {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: string;
  value?: number;
  code?: string;
  bgColor: string;
  showCountdown: boolean;
  endDate?: string;
  ctaText: string;
  ctaUrl: string;
  showEmailForm: boolean;
  location: string;
  isActive: boolean;
  status: string;
  viewCount: number;
  clickCount: number;
  emailCount: number;
  conversionCount: number;
  leads: OfferLead[];
  createdAt: string;
}

export default function SpecialOffersPage() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "expired">("active");
  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Initialize mock data
  useState(() => {
    const mockOffers: SpecialOffer[] = [
      { id: "1", title: "Yıllık Abonelik", type: "SUBSCRIPTION", bgColor: "from-purple-600 to-blue-600", showCountdown: false, ctaText: "Hemen Başvur", ctaUrl: "/subscribe", showEmailForm: true, location: "HEADER", isActive: true, status: "ACTIVE", viewCount: 1000, clickCount: 100, emailCount: 50, conversionCount: 20, leads: [], createdAt: "2024-01-15" },
    ];
    setOffers(mockOffers);
  });

  const filteredOffers = offers.filter((offer) => {
    if (activeTab === "active") return offer.isActive;
    if (activeTab === "draft") return !offer.isActive && offer.status === "DRAFT";
    if (activeTab === "expired") return offer.status === "EXPIRED";
    return true;
  });

  const totalStats = {
    views: offers.reduce((acc, o) => acc + o.viewCount, 0),
    clicks: offers.reduce((acc, o) => acc + o.clickCount, 0),
    emails: offers.reduce((acc, o) => acc + o.emailCount, 0),
    leads: offers.reduce((acc, o) => acc + o.leads.length, 0),
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm("Bu teklifi silmek istediğinizden emin misiniz?")) return;

    setIsDeleting(offerId);
    try {
      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Teklif silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDuplicate = async (offer: SpecialOffer) => {
    try {
      const response = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${offer.title} (Kopya)`,
          subtitle: offer.subtitle,
          description: offer.description,
          type: offer.type,
          value: offer.value,
          code: offer.code,
          bgColor: offer.bgColor,
          showCountdown: offer.showCountdown,
          ctaText: offer.ctaText,
          ctaUrl: offer.ctaUrl,
          showEmailForm: offer.showEmailForm,
          location: offer.location,
          isActive: false,
          status: "DRAFT",
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Teklif kopyalanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error duplicating offer:", error);
    }
  };

  const getOfferIcon = (type: string) => {
    switch (type) {
      case "DISCOUNT_PERCENT": return <Percent className="w-5 h-5" />;
      case "DISCOUNT_FIXED": return <Gift className="w-5 h-5" />;
      case "FREE_SHIPPING": return <Truck className="w-5 h-5" />;
      case "BUY_ONE_GET_ONE": return <Package className="w-5 h-5" />;
      case "FREE_TRIAL": return <Zap className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getOfferTypeLabel = (type: string) => {
    switch (type) {
      case "DISCOUNT_PERCENT": return "Yüzde İndirim";
      case "DISCOUNT_FIXED": return "Sabit İndirim";
      case "FREE_SHIPPING": return "Ücretsiz Kargo";
      case "BUY_ONE_GET_ONE": return "Al 1 Öde 1";
      case "FREE_TRIAL": return "Ücretsiz Deneme";
      case "BUNDLE_DEAL": return "Paket Fırsatı";
      default: return type;
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
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-pink-600" />
                Özel Teklifler
              </h1>
            </div>
            <Link
              href="/admin/offers/new"
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              <Plus className="w-4 h-4" />
              Yeni Teklif
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.views}</p>
                <p className="text-sm text-slate-500">Görüntülenme</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.clicks}</p>
                <p className="text-sm text-slate-500">Tıklama</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.emails}</p>
                <p className="text-sm text-slate-500">Email Toplama</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.leads}</p>
                <p className="text-sm text-slate-500">Toplam Lead</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["active", "draft", "expired"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab
                  ? "bg-pink-100 text-pink-700"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab === "active" && "Aktif"}
              {tab === "draft" && "Taslak"}
              {tab === "expired" && "Süresi Dolmuş"}
            </button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOffers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Preview */}
              <div className={`h-32 bg-gradient-to-r ${offer.bgColor} p-6 flex items-center justify-between relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 text-white">
                  <h3 className="text-xl font-bold">{offer.title}</h3>
                  {offer.subtitle && <p className="text-sm opacity-90">{offer.subtitle}</p>}
                  {offer.value && (
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                      {offer.type === "DISCOUNT_PERCENT" ? `%${offer.value} İndirim` : `₺${offer.value}`}
                    </span>
                  )}
                </div>
                <div className="relative z-10 text-white/80">{getOfferIcon(offer.type)}</div>
              </div>

              {/* Stats */}
              <div className="p-4 border-b border-slate-100">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{offer.viewCount}</p>
                    <p className="text-xs text-slate-500">Görüntülenme</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{offer.clickCount}</p>
                    <p className="text-xs text-slate-500">Tıklama</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{offer.emailCount}</p>
                    <p className="text-xs text-slate-500">Email</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-pink-600">{offer.leads.length}</p>
                    <p className="text-xs text-slate-500">Lead</p>
                  </div>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {offer.isActive ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        <CheckCircle className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">
                        <XCircle className="w-3 h-3" /> Pasif
                      </span>
                    )}
                    {offer.showCountdown && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                        <Clock className="w-3 h-3" /> Geri Sayım
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-500">{getOfferTypeLabel(offer.type)}</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/offers/${offer.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm"
                  >
                    <Edit2 className="w-4 h-4" /> Düzenle
                  </Link>
                  <Link
                    href={`/admin/offers/${offer.id}/leads`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-sm"
                  >
                    <Mail className="w-4 h-4" /> Leads ({offer.leads.length})
                  </Link>
                  <button
                    onClick={() => handleDuplicate(offer)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                    title="Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    disabled={isDeleting === offer.id}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                    title="Sil"
                  >
                    {isDeleting === offer.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Gift className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {activeTab === "active" && "Aktif teklif bulunmuyor."}
              {activeTab === "draft" && "Taslak teklif bulunmuyor."}
              {activeTab === "expired" && "Süresi dolmuş teklif bulunmuyor."}
            </p>
            <Link
              href="/admin/offers/new"
              className="text-pink-600 hover:underline mt-2 inline-block"
            >
              Yeni teklif oluştur
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
