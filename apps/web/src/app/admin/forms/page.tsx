"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  Mail,
  LayoutTemplate,
} from "lucide-react";

interface Form {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  submitButtonText: string;
  responseCount: number;
  createdAt: string;
}

export default function FormBuilderPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForms() {
      try {
        const res = await fetch('/api/admin/forms');
        const data = await res.json();
        setForms(data.forms ?? []);
      } catch {
        setForms([]);
      } finally {
        setLoading(false);
      }
    }
    void loadForms();
  }, []);

  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (formId: string) => {
    if (!confirm("Bu formu silmek istediğinizden emin misiniz?")) return;

    setIsDeleting(formId);
    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setForms((prev) => prev.filter((f) => f.id !== formId));
      } else {
        alert("Form silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <LayoutTemplate className="w-6 h-6 text-orange-600" />
                Form Oluşturucu
              </h1>
            </div>
            <Link
              href="/admin/forms/new"
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              Yeni Form
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{forms.length}</p>
                <p className="text-sm text-slate-500">Toplam Form</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{forms.filter((f) => f.isActive).length}</p>
                <p className="text-sm text-slate-500">Aktif Form</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {forms.reduce((acc, f) => acc + f.responseCount, 0)}
                </p>
                <p className="text-sm text-slate-500">Toplam Yanıt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Form ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredForms.length === 0 ? (
            <div className="text-center py-12">
              <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Henüz form bulunmuyor.</p>
              <Link
                href="/admin/forms/new"
                className="text-orange-600 hover:underline mt-2 inline-block"
              >
                Yeni form oluştur
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LayoutTemplate className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{form.name}</h3>
                    <p className="text-sm text-slate-500">
                      /{form.slug} • {form.responseCount} yanıt • {" "}
                      {new Date(form.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        form.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {form.isActive ? "Aktif" : "Pasif"}
                    </span>
                    <Link
                      href={`/admin/forms/${form.id}/responses`}
                      className="p-2 hover:bg-slate-100 rounded-lg text-blue-600"
                      title="Yanıtları gör"
                    >
                      <Mail className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/admin/forms/${form.id}/edit`}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                      title="Düzenle"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(form.id)}
                      disabled={isDeleting === form.id}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      title="Sil"
                    >
                      {isDeleting === form.id ? (
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
