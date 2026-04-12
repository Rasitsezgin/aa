import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { getPublicBlogPosts } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const posts = await getPublicBlogPosts();

  return (
    <section className="min-h-screen pt-28 pb-20 bg-white dark:bg-[#03060f]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100/70 text-blue-700 text-xs font-black uppercase tracking-widest mb-4">
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            E-ticaret bilgi merkezi
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
            Pazaryeri operasyonlarinizi buyutmek icin pratik rehberler, stratejiler ve saha deneyimleri.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300">
            Henuz yayinlanmis bir blog yazisi bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 hover:border-blue-400/60 transition-all"
              >
                <div className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Yazi</div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-4">{post.excerpt}</p>

                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Calendar size={13} /> {formatDate(post.updatedAt)}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={13} /> {post.readTimeMinutes} dk</span>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600">
                  Yaziyi oku <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
