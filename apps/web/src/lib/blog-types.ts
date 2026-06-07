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
  coverImage?: string;
  tags: string[];
  isFeatured: boolean;
  category: string;
  categoryLabel: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}
