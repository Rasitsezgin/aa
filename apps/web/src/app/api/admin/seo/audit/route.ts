export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { getAllSeoPages } from '@/lib/seo/seo-admin-service';

export async function POST() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const pages = await getAllSeoPages();
  const issues = pages.flatMap((page) => {
    const list: Array<{ path: string; severity: string; message: string }> = [];
    if (!page.description) list.push({ path: page.path, severity: 'high', message: 'Meta açıklama eksik' });
    if (page.title.length > 65) list.push({ path: page.path, severity: 'medium', message: 'Başlık çok uzun' });
    if (page.description.length > 165) list.push({ path: page.path, severity: 'medium', message: 'Açıklama çok uzun' });
    if (page.seoScore < 70) list.push({ path: page.path, severity: 'medium', message: `Düşük SEO skoru (${page.seoScore})` });
    return list;
  });

  return NextResponse.json({
    auditedAt: new Date().toISOString(),
    totalIssues: issues.length,
    issues: issues.slice(0, 100),
  });
}
