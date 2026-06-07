'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2 } from 'lucide-react';

interface ArticlePreview {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  sectionName: string;
  viewCount: number;
}

export default function PopularHelpArticles({ limit = 5 }: { limit?: number }) {
  const [articles, setArticles] = useState<ArticlePreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/help/articles?limit=${limit}`)
      .then((res) => res.json())
      .then((data) => setArticles(data.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/destek/${article.slug}`}
          className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
              {article.title}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500">{article.sectionName}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{article.viewCount} görüntülenme</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
