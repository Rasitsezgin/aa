import 'server-only';

import { prisma } from '@/lib/prisma';
import { slugifyTitle } from '@/lib/blog-service';

export function markdownToHelpHtml(content: string): string {
  return content
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`;
      if (block.match(/^\d+\./m)) {
        const items = block.split('\n').filter((l) => /^\d+\./.test(l));
        return `<ol>${items.map((i) => `<li>${i.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;
      }
      if (block.startsWith('- ')) {
        const items = block.split('\n').filter((l) => l.startsWith('- '));
        return `<ul>${items.map((i) => `<li>${i.slice(2)}</li>`).join('')}</ul>`;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

export async function listHelpSections() {
  return prisma.forumHelpSection.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    select: { id: true, name: true, slug: true },
  }).catch(() => []);
}

export async function listAdminHelpArticles() {
  return prisma.forumHelpArticle.findMany({
    orderBy: [{ updatedAt: 'desc' }],
    take: 200,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      status: true,
      isPinned: true,
      isFeatured: true,
      viewCount: true,
      helpfulCount: true,
      updatedAt: true,
      publishedAt: true,
      section: { select: { name: true } },
    },
  }).catch(() => []);
}

export async function getAdminHelpArticle(id: string) {
  return prisma.forumHelpArticle.findUnique({
    where: { id },
    include: { section: { select: { id: true, name: true, slug: true } } },
  });
}

export async function createHelpArticle(input: {
  title: string;
  slug?: string;
  sectionId: string;
  summary?: string;
  content: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPinned?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  authorId?: string;
}) {
  const title = input.title.trim();
  const content = input.content.trim();
  if (!title || !content) throw new Error('Başlık ve içerik zorunlu');

  let slug = input.slug?.trim() || slugifyTitle(title);
  const existing = await prisma.forumHelpArticle.findUnique({ where: { slug }, select: { id: true } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const status = input.status || 'DRAFT';
  const html = markdownToHelpHtml(content);

  return prisma.forumHelpArticle.create({
    data: {
      slug,
      title,
      sectionId: input.sectionId,
      summary: input.summary?.trim() || null,
      content,
      contentHtml: html,
      status,
      authorId: input.authorId || 'admin',
      isPinned: input.isPinned ?? false,
      isFeatured: input.isFeatured ?? false,
      keywords: input.keywords ?? [],
      metaTitle: input.metaTitle?.trim() || null,
      metaDescription: input.metaDescription?.trim() || null,
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  });
}

export async function updateHelpArticle(
  id: string,
  input: Partial<{
    title: string;
    slug: string;
    sectionId: string;
    summary: string;
    content: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PENDING_REVIEW' | 'OUTDATED';
    isPinned: boolean;
    isFeatured: boolean;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  }>,
) {
  const current = await prisma.forumHelpArticle.findUnique({ where: { id } });
  if (!current) throw new Error('Makale bulunamadı');

  const data: Record<string, unknown> = { lastEditorId: 'admin' };

  if (input.title !== undefined) data.title = input.title.trim();
  if (input.slug !== undefined) data.slug = input.slug.trim();
  if (input.sectionId !== undefined) data.sectionId = input.sectionId;
  if (input.summary !== undefined) data.summary = input.summary.trim() || null;
  if (input.content !== undefined) {
    data.content = input.content.trim();
    data.contentHtml = markdownToHelpHtml(input.content.trim());
  }
  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === 'PUBLISHED' && !current.publishedAt) {
      data.publishedAt = new Date();
    }
  }
  if (input.isPinned !== undefined) data.isPinned = input.isPinned;
  if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
  if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle.trim() || null;
  if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription.trim() || null;
  if (input.keywords !== undefined) data.keywords = input.keywords;

  return prisma.forumHelpArticle.update({ where: { id }, data });
}

export async function deleteHelpArticle(id: string) {
  return prisma.forumHelpArticle.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });
}
