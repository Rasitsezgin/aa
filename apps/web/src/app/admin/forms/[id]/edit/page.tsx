"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("Gönder");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/forms");
        if (res.ok) {
          const data = await res.json();
          const form = (data.forms || data).find((f: { id: string }) => f.id === formId);
          if (form) {
            setName(form.name);
            setSlug(form.slug);
            setDescription(form.description || "");
            setSubmitButtonText(form.submitButtonText || "Gönder");
            setIsActive(form.isActive ?? true);
          } else {
            setError("Form bulunamadı");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          submitButtonText,
          isActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Form güncellenemedi");
      }

      router.push("/admin/forms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/forms" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Formu Düzenle</h1>
          <p className="text-slate-500 text-sm">{name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border rounded-2xl p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="text-sm font-medium">Form Adı</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Slug (URL)</label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-xl"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Gönder Butonu Metni</label>
          <input
            value={submitButtonText}
            onChange={(e) => setSubmitButtonText(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-xl"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Form aktif</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet
        </button>
      </form>
    </div>
  );
}
