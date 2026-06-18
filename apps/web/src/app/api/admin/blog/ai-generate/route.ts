import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { buildExcerpt, slugifyTitle } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

type AiDraft = {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  source: 'ai' | 'fallback';
};

function getApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
  const normalized = raw.trim();
  if (!normalized) return 'http://localhost:3001';
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized.replace(/\/$/, '');
  if (normalized.startsWith('/')) return normalized.replace(/\/$/, '');
  return `https://${normalized}`.replace(/\/$/, '');
}

function extractJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.trim().replace(/```json|```/g, '');
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function fallbackDraft(topic: string, audience: string, tone: string, keywords: string[]): AiDraft {
  const title = `${topic}: ${audience} icin pratik rehber`;
  const keywordLine = keywords.length > 0 ? keywords.join(', ') : `${topic}, e-ticaret, pazaryeri`;
  const content = `## Giris\n${audience} icin hazirlanan bu rehberde ${topic.toLowerCase()} konusuna odaklaniyoruz.\n\n## Neden onemli?\n${topic} dogru uygulandiginda operasyon maliyetlerini dusurur ve donusumu artirir.\n\n## Uygulama adimlari\n1. Mevcut veriyi toplayin ve baz metrikleri olusturun.\n2. Kucuk bir pilot urun grubu secin.\n3. Haftalik performans takibiyle sureci optimize edin.\n\n## Kontrol listesi\n- KPI takibi\n- Stok ve fiyat senkronu\n- Icerik optimizasyonu\n\n## Sonuc\nBu adimlar ${tone.toLowerCase()} bir yaklasimla uygulanirsa 30 gun icinde olculebilir sonuc alabilirsiniz.\n\nAnahtar kelimeler: ${keywordLine}`;

  return {
    title,
    slug: slugifyTitle(title),
    excerpt: buildExcerpt(content, 170),
    content,
    source: 'fallback',
  };
}

async function requestAiDraft(topic: string, audience: string, tone: string, keywords: string[]): Promise<AiDraft | null> {
  const base = getApiBaseUrl();
  const prompt = `\n${topic} konusunda bir Turkce blog yazisi uret.\nHedef kitle: ${audience}\nTon: ${tone}\nAnahtar kelimeler: ${keywords.join(', ') || 'e-ticaret, pazaryeri yonetimi'}\n\nSadece asagidaki JSON formatinda don:\n{\n  "title": "...",\n  "excerpt": "120-170 karakter",\n  "content": "Markdown formatinda en az 700 kelime blog icerigi"\n}`;

  const candidates = [
    `${base}/ai/copilot/chat`,
    `${base}/api/ai/copilot/chat`,
    `${base}/api/v1/ai/copilot/chat`,
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'default',
        },
        body: JSON.stringify({ message: prompt, context: 'Admin blog yazari' }),
      });

      if (!response.ok) {
        if (response.status === 404) continue;
        return null;
      }

      const payload = (await response.json()) as { message?: string };
      const parsed = extractJson(payload.message || '');
      if (!parsed) return null;

      const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
      const excerpt = typeof parsed.excerpt === 'string' ? parsed.excerpt.trim() : '';
      const content = typeof parsed.content === 'string' ? parsed.content.trim() : '';

      if (!title || !content) return null;

      return {
        title,
        excerpt: excerpt || buildExcerpt(content, 170),
        content,
        slug: slugifyTitle(title),
        source: 'ai',
      };
    } catch {
      continue;
    }
  }

  return null;
}

export async function POST(request: Request) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = (await request.json()) as {
    topic?: string;
    audience?: string;
    tone?: string;
    keywords?: string;
  };

  const topic = body.topic?.trim() || '';
  if (!topic) {
    return NextResponse.json({ message: 'Konu zorunludur.' }, { status: 400 });
  }

  const audience = (body.audience || 'Turkiye e-ticaret saticilari').trim();
  const tone = (body.tone || 'Profesyonel').trim();
  const keywords = (body.keywords || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  const aiDraft = await requestAiDraft(topic, audience, tone, keywords);
  if (aiDraft) return NextResponse.json(aiDraft);

  return NextResponse.json(fallbackDraft(topic, audience, tone, keywords));
}
