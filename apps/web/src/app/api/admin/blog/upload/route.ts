export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import fs from 'fs/promises';
import path from 'path';

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'cover';
}

export async function POST(request: Request) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const slug = sanitizeSlug(String(formData.get('slug') || 'cover'));

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Dosya bulunamadı' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ message: 'Sadece PNG, JPG veya WEBP yüklenebilir' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'Dosya boyutu en fazla 3MB olabilir' }, { status: 400 });
    }

    const ext = EXT_BY_TYPE[file.type] || 'jpg';
    const filename = `${slug}-${Date.now()}.${ext}`;
    
    // In Docker standalone, process.cwd() is /app, so public is at /app/apps/web/public
    const isProd = process.env.NODE_ENV === 'production';
    const basePublicDir = isProd ? path.join(process.cwd(), 'apps', 'web', 'public') : path.join(process.cwd(), 'public');
    const uploadDir = path.join(basePublicDir, 'uploads', 'blog');
    
    const filePath = path.join(uploadDir, filename);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/blog/${filename}` });
  } catch (error) {
    console.error('[blog] upload failed:', error);
    return NextResponse.json({ message: 'Yükleme başarısız' }, { status: 500 });
  }
}
