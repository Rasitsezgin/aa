import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getJsonSetting, setJsonSetting } from '@/lib/admin-settings-store';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
  let files: string[] = [];
  try {
    files = await fs.readdir(uploadDir);
  } catch {
    files = [];
  }

  const media = files
    .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
    .map((filename) => ({
      id: filename,
      name: filename,
      url: `/uploads/blog/${filename}`,
      type: 'image' as const,
      size: 0,
      folder: 'blog',
      createdAt: new Date().toISOString(),
    }));

  const folders = await getJsonSetting('blog_media_folders', [
    { id: 'blog', name: 'Blog Görselleri', itemCount: media.length },
  ]);

  return NextResponse.json({ media, folders });
}

export async function POST(req: NextRequest) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = await req.json();
  if (body.folderName) {
    const folders = await getJsonSetting<any[]>('blog_media_folders', []);
    folders.push({
      id: body.folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: body.folderName,
      itemCount: 0,
    });
    await setJsonSetting('blog_media_folders', folders, 'blog');
  }

  return NextResponse.json({ success: true });
}
