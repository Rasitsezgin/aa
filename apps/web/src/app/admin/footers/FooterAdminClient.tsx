"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  LayoutTemplate,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface FooterLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  isExternal: boolean;
  isActive: boolean;
}

interface FooterColumn {
  id: string;
  title: string;
  isActive: boolean;
  links: FooterLink[];
}

interface FooterBottomBar {
  id: string;
  copyright?: string;
  showCopyright: boolean;
  showSocial: boolean;
  showPaymentIcons: boolean;
}

interface Footer {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  isDefault: boolean;
  bgColor?: string;
  textColor?: string;
  tagline?: string;
  columns: FooterColumn[];
  bottomBar?: FooterBottomBar;
  createdAt: string;
}

export default function FooterAdminClient({ footers }: { footers: Footer[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFooter, setExpandedFooter] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredFooters = footers.filter(
    (footer) =>
      footer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      footer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (footerId: string) => {
    if (!confirm("Bu footer'ı silmek istediğinizden emin misiniz?")) return;

    setIsDeleting(footerId);
    try {
      const response = await fetch(`/api/admin/footers/${footerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Footer silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting footer:", error);
      alert("Footer silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (footerId: string) => {
    try {
      const response = await fetch(`/api/admin/footers/${footerId}/set-default`, {
        method: "POST",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Varsayılan footer ayarlanırken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error setting default footer:", error);
      alert("Varsayılan footer ayarlanırken bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6" />
            Footer Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Footer içeriklerini ve bağlantılarını yönetin</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Link>
          <Link
            href="/admin/footers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Footer
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Footer ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Footer List */}
      <div className="space-y-4">
        {filteredFooters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Henüz footer bulunmuyor.</p>
            <Link href="/admin/footers/new" className="text-blue-600 hover:underline mt-2 inline-block">
              Yeni footer oluştur
            </Link>
          </div>
        ) : (
          filteredFooters.map((footer) => (
            <motion.div
              key={footer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{footer.name}</h3>
                    {footer.isDefault && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {footer.location} • {footer.columns.length} kolon • {footer.bgColor || "Varsayılan arka plan"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${footer.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {footer.isActive ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    onClick={() => setExpandedFooter(expandedFooter === footer.id ? null : footer.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    {expandedFooter === footer.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <Link href={`/admin/footers/${footer.id}/edit`} className="p-2 hover:bg-slate-100 rounded-lg text-blue-600">
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleSetDefault(footer.id)} disabled={footer.isDefault} className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50" title="Varsayılan yap">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(footer.id)} disabled={isDeleting === footer.id} className="p-2 hover:bg-slate-100 rounded-lg text-red-600">
                    {isDeleting === footer.id ? <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedFooter === footer.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="border-t border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold text-slate-500 mb-3">Kolonlar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {footer.columns.map((column) => (
                        <div key={column.id} className="bg-white p-3 rounded-lg border border-slate-200">
                          <h5 className="font-medium mb-2">{column.title}</h5>
                          <ul className="space-y-1">
                            {column.links.slice(0, 5).map((link) => (
                              <li key={link.id} className="text-sm text-slate-500 truncate">{link.label}</li>
                            ))}
                            {column.links.length > 5 && (
                              <li className="text-xs text-slate-400">+{column.links.length - 5} daha</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {footer.bottomBar && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                          Alt Bar: {footer.bottomBar.showCopyright && "Copyright "}
                          {footer.bottomBar.showSocial && "• Sosyal Medya "}
                          {footer.bottomBar.showPaymentIcons && "• Ödeme İkonları"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
