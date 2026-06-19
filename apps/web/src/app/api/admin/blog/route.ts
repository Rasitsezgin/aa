import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { createBlogPost, getAdminBlogPosts } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const posts = await getAdminBlogPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const body = (await request.json()) as {
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
    };

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ message: 'Baslik ve icerik zorunludur.' }, { status: 400 });
    }

    const post = await createBlogPost({
      title: body.title,
      slug: body.slug,
      content: body.content,
      isActive: body.isActive,
      coverImage: body.coverImage,
      tags: body.tags,
      isFeatured: body.isFeatured,
      category: body.category,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      metaKeywords: body.metaKeywords,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blog kaydedilemedi.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
