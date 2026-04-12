"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  Download,
  Search,
  Filter,
  ExternalLink,
  Trash2,
} from "lucide-react";

interface OfferLead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  message?: string;
  createdAt: string;
  isNotified: boolean;
  isContacted: boolean;
  ipAddress?: string;
  referrer?: string;
}

interface Offer {
  id: string;
  title: string;
}

export default function OfferLeadsPage() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [leads, setLeads] = useState<OfferLead[]>([]);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "contacted">("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Initialize mock data
  useState(() => {
    const mockOffer: Offer = { id: "1", title: "Özel Teklif" };
    const mockLeads: OfferLead[] = [
      { id: "1", email: "user@example.com", name: "Kullanıcı", createdAt: "2024-01-15", isNotified: true, isContacted: false },
    ];
    setOffer(mockOffer);
    setLeads(mockLeads);
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "new") return matchesSearch && !lead.isContacted;
    if (filter === "contacted") return matchesSearch && lead.isContacted;
    return matchesSearch;
  });

  const handleMarkContacted = async (leadId: string, contacted: boolean) => {
    if (!offer) return;
    setIsUpdating(leadId);
    try {
      await fetch(`/api/admin/offers/${offer.id}/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isContacted: contacted }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error updating lead:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Bu lead'i silmek istediğinizden emin misiniz?") || !offer) return;

    try {
      await fetch(`/api/admin/offers/${offer.id}/leads/${leadId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Email", "İsim", "Telefon", "Mesaj", "Tarih", "İletişim Durumu"],
      ...filteredLeads.map((lead) => [
        lead.email,
        lead.name || "",
        lead.phone || "",
        lead.message || "",
        new Date(lead.createdAt).toLocaleString("tr-TR"),
        lead.isContacted ? "İletişime Geçildi" : "Yeni",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${offer?.title || "teklif"}-leads.csv`;
    a.click();
  };

  const newLeadsCount = leads.filter((l) => !l.isContacted).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/offers" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{offer?.title || "Teklif"} - Leads</h1>
                <p className="text-slate-500 text-sm">
                  {leads.length} toplam • {" "}
                  <span className="text-pink-600 font-medium">{newLeadsCount} yeni</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Download className="w-4 h-4" />
              CSV İndir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex gap-2">
            {["all", "new", "contacted"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === f
                    ? "bg-pink-100 text-pink-700"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f === "all" && "Tümü"}
                {f === "new" && `Yeni (${newLeadsCount})`}
                {f === "contacted" && "İletişime Geçildi"}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid gap-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Lead bulunmuyor.</p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{lead.email}</h3>
                        <p className="text-sm text-slate-500">
                          {new Date(lead.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      {!lead.isContacted && (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
                          Yeni
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {lead.name && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4" />
                          <span>{lead.name}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      {lead.referrer && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm truncate">{lead.referrer}</span>
                        </div>
                      )}
                    </div>

                    {lead.message && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">Mesaj</span>
                        </div>
                        <p className="text-slate-700">{lead.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleMarkContacted(lead.id, !lead.isContacted)}
                      disabled={isUpdating === lead.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        lead.isContacted
                          ? "bg-green-100 text-green-700"
                          : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                      }`}
                    >
                      {isUpdating === lead.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : lead.isContacted ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> İletişime Geçildi
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" /> İletişime Geç
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" /> Sil
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
