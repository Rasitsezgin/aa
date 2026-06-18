'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';

interface FormResponse {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, unknown>;
  submittedAt: string;
  ipAddress?: string;
}

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params.id as string;
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [formName, setFormName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/forms/responses');
        if (res.ok) {
          const data = await res.json();
          const list: FormResponse[] = data.responses || data || [];
          const filtered = list.filter((r) => r.formId === formId);
          setResponses(filtered);
          if (filtered[0]?.formName) setFormName(filtered[0].formName);
        }
        const formsRes = await fetch('/api/admin/forms');
        if (formsRes.ok) {
          const forms = await formsRes.json();
          const form = (forms.forms || forms).find((f: { id: string }) => f.id === formId);
          if (form?.name) setFormName(form.name);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/admin/forms"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Formlara Dön
          </Link>
          <h1 className="text-2xl font-bold">{formName || 'Form'} — Yanıtlar</h1>
          <p className="text-slate-500 mt-1">{responses.length} yanıt</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {responses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Bu forma henüz yanıt gelmemiş.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-500">
                    {new Date(response.submittedAt).toLocaleString('tr-TR')}
                  </span>
                  {response.ipAddress && (
                    <span className="text-xs text-slate-400">IP: {response.ipAddress}</span>
                  )}
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(response.data || {}).map(([key, value]) => (
                    <div key={key} className="border border-slate-100 rounded-lg p-3">
                      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{key}</dt>
                      <dd className="mt-1 text-slate-900 break-words">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
