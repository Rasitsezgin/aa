import { NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { buildExcerpt, slugifyTitle } from '@/lib/blog-service';

export const dynamic = 'force-dynamic';

type AiDraft = {
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string;
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
  const prompt = `\n${topic} konusunda son derece detayli, insansi, akici ve uzman bir Turkce blog yazisi uret.
Hedef kitle: ${audience}
Ton: ${tone}
Anahtar kelimeler: ${keywords.join(', ') || 'e-ticaret, pazaryeri yonetimi'}

Gereksinimler:
1. Icerik gercekten kapsamli ve doyurucu olmali. Cok kisa yazma, konunun derinliklerine in (en az 800-1000 kelime).
2. Markdown formatini (basliklar, alt basliklar, listeler, kalin yazi, alintilar vb.) cok estetik, zengin ve okunabilir sekilde kullan. Okuyucuyu sikmayacak paragraflar olustur.
3. SEO icin baslik, aciklama, keywordler ve etiketleri (tags) eksiksiz hazirla.

Lutfen SADECE asagidaki JSON formatinda donus yap, JSON disinda hicbir metin veya isaret ekleme:
{
  "title": "Cekici ve SEO uyumlu blog basligi",
  "excerpt": "Blogun listeleme sayfalarinda gorunecek 120-160 karakterlik kisa ozeti",
  "content": "Markdown formatinda yazilmis, detayli, insansi ve gorsel olarak zenginlestirilmis blog icerigi...",
  "metaTitle": "Arama motorlari (Google) icin SEO odakli baslik (maks 60 karakter)",
  "metaDescription": "Arama motorlari icin SEO odakli meta aciklamasi (maks 160 karakter)",
  "metaKeywords": "virgulle ayrilmis, virgulle ayrilmis 5-8 anahtar kelime",
  "tags": "virgulle ayrilmis kategori/etiket isimleri (ornegin: Trendyol,Satis,KOBI)"
}`;

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
      const metaTitle = typeof parsed.metaTitle === 'string' ? parsed.metaTitle.trim() : '';
      const metaDescription = typeof parsed.metaDescription === 'string' ? parsed.metaDescription.trim() : '';
      const metaKeywords = typeof parsed.metaKeywords === 'string' ? parsed.metaKeywords.trim() : '';
      const tags = typeof parsed.tags === 'string' ? parsed.tags.trim() : '';

      if (!title || !content) return null;

      return {
        title,
        excerpt: excerpt || buildExcerpt(content, 170),
        content,
        slug: slugifyTitle(title),
        metaTitle,
        metaDescription,
        metaKeywords,
        tags,
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
