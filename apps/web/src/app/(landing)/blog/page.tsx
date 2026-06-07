import BlogClient from '@/components/blog/BlogClient';
import { getAllBlogTags, getPublicBlogPosts } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const [posts, tags] = await Promise.all([
    getPublicBlogPosts(),
    getAllBlogTags(),
  ]);

  return <BlogClient posts={posts} tags={tags} />;
}
