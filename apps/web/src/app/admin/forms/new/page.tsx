"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function NewFormPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitButtonText, setSubmitButtonText] = useState("Gönder");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description,
          submitButtonText,
          isActive: true,
          fields: [
            { id: "name", type: "text", label: "Ad Soyad", required: true },
            { id: "email", type: "email", label: "E-posta", required: true },
            { id: "message", type: "textarea", label: "Mesaj", required: true },
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Form oluşturulamadı");
      }

      router.push("/admin/forms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/forms" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Yeni Form</h1>
          <p className="text-slate-500 text-sm">İletişim veya lead toplama formu oluşturun</p>
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
            placeholder="İletişim Formu"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Slug (URL)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-xl font-mono text-sm"
            placeholder="iletisim"
          />
          <p className="text-xs text-slate-500 mt-1">Public URL: /api/public/forms/{slug || "slug"}</p>
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

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Formu Oluştur
        </button>
      </form>
    </div>
  );
}
