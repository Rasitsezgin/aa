import 'server-only';

import { prisma } from "@/lib/prisma";

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  readTimeMinutes: number;
}

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
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    content: item.content,
    excerpt: buildExcerpt(item.content),
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    readTimeMinutes: estimateReadTime(item.content),
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
  const posts = await prisma.cmsPage.findMany({
    where: { category: BLOG_CATEGORY, isActive: true },
    orderBy: [{ updatedAt: 'desc' }],
  });

  return posts.map(mapBlogPost);
}

export async function getPublicBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  const post = await prisma.cmsPage.findFirst({
    where: { slug, category: BLOG_CATEGORY, isActive: true },
  });

  return post ? mapBlogPost(post) : null;
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
}): Promise<BlogPostItem> {
  const slug = await ensureUniqueSlug(input.slug || input.title);

  const created = await prisma.cmsPage.create({
    data: {
      title: input.title.trim(),
      slug,
      content: input.content.trim(),
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
  },
): Promise<BlogPostItem> {
  const data: { title?: string; slug?: string; content?: string; isActive?: boolean } = {};

  if (typeof input.title === 'string') data.title = input.title.trim();
  if (typeof input.content === 'string') data.content = input.content.trim();
  if (typeof input.isActive === 'boolean') data.isActive = input.isActive;

  if (typeof input.slug === 'string' && input.slug.trim()) {
    data.slug = await ensureUniqueSlug(input.slug, id);
  }

  const updated = await prisma.cmsPage.update({
    where: { id },
    data,
  });

  return mapBlogPost(updated);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await prisma.cmsPage.delete({ where: { id } });
}
