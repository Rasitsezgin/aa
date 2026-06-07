import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteBlogPost, updateBlogPost } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

    const post = await updateBlogPost(id, body);
    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blog guncellenemedi.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteBlogPost(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blog silinemedi.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
