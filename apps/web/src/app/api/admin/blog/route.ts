import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createBlogPost, getAdminBlogPosts } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const posts = await getAdminBlogPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

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
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blog kaydedilemedi.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
