import 'server-only';

import { prisma } from '@/lib/prisma';
import { type BlogMeta, getCategoryLabel, parseBlogContent, serializeBlogContent } from '@/lib/blog-meta';
import type { BlogPostItem } from '@/lib/blog-types';

export type { BlogPostItem };

const BLOG_CATEGORY = 'blog';

function stripMarkdown(input: string): string {
  return input
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[[^\]]+\]\([^\)]+\)/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugifyTitle(value: string): string {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  return normalized || `blog-${Date.now()}`;
}

export function buildExcerpt(content: string, maxLength: number = 180): string {
  const plain = stripMarkdown(content);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

function estimateReadTime(content: string): number {
  const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function mapBlogPost(item: {
  id: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): BlogPostItem {
  const { meta, body } = parseBlogContent(item.content);

  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    content: body,
    excerpt: meta.metaDescription || buildExcerpt(body),
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    readTimeMinutes: estimateReadTime(body),
    coverImage: meta.coverImage,
    tags: meta.tags || [],
    isFeatured: Boolean(meta.isFeatured),
    category: meta.category || 'rehber',
    categoryLabel: getCategoryLabel(meta.category),
    metaTitle: meta.metaTitle,
    metaDescription: meta.metaDescription,
    metaKeywords: meta.metaKeywords,
  };
}

function buildMetaFromInput(input: {
  coverImage?: string;
  tags?: string[] | string;
  isFeatured?: boolean;
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}): BlogMeta {
  const tags = Array.isArray(input.tags)
    ? input.tags.map(String).filter(Boolean)
    : String(input.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

  return {
    coverImage: input.coverImage?.trim() || undefined,
    tags: tags.length ? tags : undefined,
    isFeatured: Boolean(input.isFeatured),
    category: input.category?.trim() || undefined,
    metaTitle: input.metaTitle?.trim() || undefined,
    metaDescription: input.metaDescription?.trim() || undefined,
    metaKeywords: input.metaKeywords?.trim() || undefined,
  };
}

export async function getAdminBlogPosts(): Promise<BlogPostItem[]> {
  const posts = await prisma.cmsPage.findMany({
    where: { category: BLOG_CATEGORY },
    orderBy: [{ updatedAt: 'desc' }],
  });

  return posts.map(mapBlogPost);
}

export async function getPublicBlogPosts(): Promise<BlogPostItem[]> {
  try {
    const posts = await prisma.cmsPage.findMany({
      where: { category: BLOG_CATEGORY, isActive: true },
      orderBy: [{ updatedAt: 'desc' }],
    });

    return posts.map(mapBlogPost);
  } catch (error) {
    console.error('[blog] Public posts could not be loaded:', error);
    return [];
  }
}

export async function getPublicBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  try {
    const post = await prisma.cmsPage.findFirst({
      where: { slug, category: BLOG_CATEGORY, isActive: true },
    });

    return post ? mapBlogPost(post) : null;
  } catch (error) {
    console.error('[blog] Post could not be loaded:', error);
    return null;
  }
}

export async function getRelatedBlogPosts(
  slug: string,
  tags: string[] = [],
  limit: number = 3,
): Promise<BlogPostItem[]> {
  const posts = await getPublicBlogPosts();
  const others = posts.filter((p) => p.slug !== slug);

  if (tags.length > 0) {
    const scored = others
      .map((post) => ({
        post,
        score: post.tags.filter((t) => tags.includes(t)).length,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || Date.parse(b.post.updatedAt) - Date.parse(a.post.updatedAt));

    if (scored.length >= limit) {
      return scored.slice(0, limit).map((item) => item.post);
    }

    const picked = scored.map((item) => item.post);
    const rest = others
      .filter((p) => !picked.some((x) => x.id === p.id))
      .slice(0, limit - picked.length);
    return [...picked, ...rest];
  }

  return others.slice(0, limit);
}

export async function getAllBlogTags(): Promise<string[]> {
  const posts = await getPublicBlogPosts();
  const tagSet = new Set<string>();
  for (const post of posts) {
    post.tags.forEach((tag) => tagSet.add(tag));
  }
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'tr'));
}

export async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  const base = slugifyTitle(slug);
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.cmsPage.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

export async function createBlogPost(input: {
  title: string;
  slug?: string;
  content: string;
  isActive?: boolean;
  coverImage?: string;
  tags?: string[] | string;
  isFeatured?: boolean;
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}): Promise<BlogPostItem> {
  const slug = await ensureUniqueSlug(input.slug || input.title);
  const meta = buildMetaFromInput(input);
  const storedContent = serializeBlogContent(meta, input.content.trim());

  const created = await prisma.cmsPage.create({
    data: {
      title: input.title.trim(),
      slug,
      content: storedContent,
      category: BLOG_CATEGORY,
      isActive: input.isActive ?? false,
    },
  });

  return mapBlogPost(created);
}

export async function updateBlogPost(
  id: string,
  input: {
    title?: string;
    slug?: string;
    content?: string;
    isActive?: boolean;
    coverImage?: string;
    tags?: string[] | string;
    isFeatured?: boolean;
    category?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  },
): Promise<BlogPostItem> {
  const existing = await prisma.cmsPage.findUnique({ where: { id } });
  if (!existing) throw new Error('Blog yazısı bulunamadı');

  const { meta: currentMeta, body: currentBody } = parseBlogContent(existing.content);
  const data: { title?: string; slug?: string; content?: string; isActive?: boolean } = {};

  if (typeof input.title === 'string') data.title = input.title.trim();
  if (typeof input.isActive === 'boolean') data.isActive = input.isActive;

  if (typeof input.slug === 'string' && input.slug.trim()) {
    data.slug = await ensureUniqueSlug(input.slug, id);
  }

  const nextBody = typeof input.content === 'string' ? input.content.trim() : currentBody;
  const nextMeta: BlogMeta = {
    ...currentMeta,
    ...buildMetaFromInput({
      coverImage: input.coverImage !== undefined ? input.coverImage : currentMeta.coverImage,
      tags: input.tags !== undefined ? input.tags : currentMeta.tags,
      isFeatured: input.isFeatured !== undefined ? input.isFeatured : currentMeta.isFeatured,
      category: input.category !== undefined ? input.category : currentMeta.category,
      metaTitle: input.metaTitle !== undefined ? input.metaTitle : currentMeta.metaTitle,
      metaDescription: input.metaDescription !== undefined ? input.metaDescription : currentMeta.metaDescription,
      metaKeywords: input.metaKeywords !== undefined ? input.metaKeywords : currentMeta.metaKeywords,
    }),
  };

  data.content = serializeBlogContent(nextMeta, nextBody);

  const updated = await prisma.cmsPage.update({
    where: { id },
    data,
  });

  return mapBlogPost(updated);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await prisma.cmsPage.delete({ where: { id } });
}
