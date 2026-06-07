export type BlogMeta = {
  coverImage?: string;
  tags?: string[];
  isFeatured?: boolean;
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
};

const META_PREFIX = '<!--blog-meta:';
const META_SUFFIX = '-->';

export const BLOG_CATEGORIES = [
  { id: 'pazaryeri', name: 'Pazaryeri', color: 'orange' },
  { id: 'eticaret', name: 'E-ticaret', color: 'blue' },
  { id: 'strateji', name: 'Strateji', color: 'violet' },
  { id: 'rehber', name: 'Rehber', color: 'emerald' },
  { id: 'haber', name: 'Haber', color: 'rose' },
] as const;

export function parseBlogContent(raw: string): { meta: BlogMeta; body: string } {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith(META_PREFIX)) {
    return { meta: {}, body: raw };
  }

  const end = trimmed.indexOf(META_SUFFIX);
  if (end < 0) {
    return { meta: {}, body: raw };
  }

  const jsonPart = trimmed.slice(META_PREFIX.length, end).trim();
  const body = trimmed.slice(end + META_SUFFIX.length).replace(/^\s*\n?/, '');

  try {
    const parsed = JSON.parse(jsonPart) as BlogMeta;
    return {
      meta: {
        coverImage: parsed.coverImage || undefined,
        tags: Array.isArray(parsed.tags) ? parsed.tags.filter(Boolean) : undefined,
        isFeatured: Boolean(parsed.isFeatured),
        category: parsed.category || undefined,
        metaTitle: parsed.metaTitle || undefined,
        metaDescription: parsed.metaDescription || undefined,
        metaKeywords: parsed.metaKeywords || undefined,
      },
      body,
    };
  } catch {
    return { meta: {}, body: raw };
  }
}

export function serializeBlogContent(meta: BlogMeta, body: string): string {
  const cleanMeta: BlogMeta = {};
  if (meta.coverImage) cleanMeta.coverImage = meta.coverImage;
  if (meta.tags?.length) cleanMeta.tags = meta.tags;
  if (meta.isFeatured) cleanMeta.isFeatured = true;
  if (meta.category) cleanMeta.category = meta.category;
  if (meta.metaTitle) cleanMeta.metaTitle = meta.metaTitle;
  if (meta.metaDescription) cleanMeta.metaDescription = meta.metaDescription;
  if (meta.metaKeywords) cleanMeta.metaKeywords = meta.metaKeywords;

  if (Object.keys(cleanMeta).length === 0) {
    return body.trim();
  }

  return `${META_PREFIX}${JSON.stringify(cleanMeta)}${META_SUFFIX}\n${body.trim()}`;
}

export function getCategoryLabel(categoryId?: string): string {
  return BLOG_CATEGORIES.find((c) => c.id === categoryId)?.name || 'Genel';
}
