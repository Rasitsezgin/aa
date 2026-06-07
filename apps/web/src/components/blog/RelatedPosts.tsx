import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import type { BlogPostItem } from '@/lib/blog-types';

type RelatedPostsProps = {
  posts: BlogPostItem[];
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-white/10">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">İlgili yazılar</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/50 p-5 hover:border-orange-300/60 transition-all"
          >
            {post.coverImage && (
              <div className="h-32 rounded-xl overflow-hidden mb-4">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <p className="text-[10px] font-black uppercase tracking-wider text-orange-600 mb-2">{post.categoryLabel}</p>
            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-600 transition-colors">
              {post.title}
            </h3>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><Calendar size={12} /> {formatDate(post.updatedAt)}</span>
              <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readTimeMinutes} dk</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-600">
              Oku <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
