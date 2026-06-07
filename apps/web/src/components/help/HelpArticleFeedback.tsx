'use client';

import { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

export default function HelpArticleFeedback({ slug }: { slug: string }) {
  const [submitted, setSubmitted] = useState<'helpful' | 'not_helpful' | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (wasHelpful: boolean) => {
    if (submitted || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/help/articles/${slug}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wasHelpful }),
      });
      if (res.ok) setSubmitted(wasHelpful ? 'helpful' : 'not_helpful');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-sm text-slate-500 mt-10 pt-6 border-t border-slate-200 dark:border-white/10">
        Geri bildiriminiz için teşekkürler!
      </p>
    );
  }

  return (
    <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Bu makale faydalı oldu mu?</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-400 hover:text-green-600 text-sm disabled:opacity-50"
        >
          <ThumbsUp className="w-4 h-4" /> Evet
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-600 text-sm disabled:opacity-50"
        >
          <ThumbsDown className="w-4 h-4" /> Hayır
        </button>
      </div>
    </div>
  );
}
