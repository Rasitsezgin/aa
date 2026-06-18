import 'server-only';

import { generateGeminiJsonResponse } from '@/lib/gemini-chat';

export interface BlogSuggestion {
  text: string;
  confidence: number;
}

const TYPE_PROMPTS: Record<string, string> = {
  improve:
    'Blog yazısını geliştirmek için 3 somut öneri ver. Her öneri uygulanabilir ve spesifik olsun.',
  expand:
    'Blog yazısını genişletmek için 3 bölüm veya paragraf önerisi ver.',
  summarize:
    'Blog yazısı için tek paragraflık profesyonel bir özet yaz.',
  tone:
    'Blog yazısının tonunu iyileştirmek için 3 farklı üslup önerisi ver.',
  titles:
    'SEO uyumlu 4 alternatif blog başlığı öner.',
  outlines:
    'Blog yazısı için detaylı bir içerik taslağı (madde madde) oluştur.',
  related:
    'Bu konuyla ilgili 3 ilgili blog konusu öner.',
  seo:
    'Blog yazısı için SEO analizi yap ve iyileştirme önerileri sun (✅/⚠️ işaretleri kullan).',
};

function fallbackSuggestions(type: string, title: string): BlogSuggestion[] {
  const map: Record<string, BlogSuggestion[]> = {
    improve: [
      { text: `${title} konusunu istatistikler ve örneklerle zenginleştirin.`, confidence: 0.85 },
      { text: 'Alt başlıklar (H2/H3) ekleyerek okunabilirliği artırın.', confidence: 0.88 },
      { text: 'Sonuç bölümünde okuyucuya net bir eylem çağrısı ekleyin.', confidence: 0.82 },
    ],
    titles: [
      { text: `${title}: 2026 Rehberi`, confidence: 0.92 },
      { text: `Nasıl ${title.toLowerCase()} yapılır?`, confidence: 0.89 },
      { text: `${title} için en iyi 10 strateji`, confidence: 0.9 },
    ],
    seo: [
      {
        text: 'SEO Analizi:\n\n✅ Başlık uygun\n⚠️ Meta açıklama eksik\n⚠️ Anahtar kelime yoğunluğu düşük\n\nÖneri: İlk paragrafta ana anahtar kelimeyi kullanın.',
        confidence: 0.9,
      },
    ],
  };
  return (
    map[type] ?? [
      { text: 'İçeriğinizi geliştirmek için daha fazla detay ve örnek ekleyin.', confidence: 0.85 },
    ]
  );
}

export async function generateBlogSuggestions(
  type: string,
  title: string,
  content: string,
  customPrompt?: string,
): Promise<{ suggestions: BlogSuggestion[]; model: string }> {
  const instruction = TYPE_PROMPTS[type] || 'Blog içeriği için yararlı öneriler ver.';
  const prompt = `Sen Türkçe blog editörü asistanısın.

Başlık: ${title}
İçerik özeti: ${content?.slice(0, 2000) || '(boş)'}
Görev: ${instruction}
${customPrompt ? `Ek talimat: ${customPrompt}` : ''}

Sadece şu JSON formatında yanıt ver:
{"suggestions":[{"text":"...","confidence":0.9}]}`;

  const gemini = await generateGeminiJsonResponse<{ suggestions: BlogSuggestion[] }>(prompt);
  if (gemini?.suggestions?.length) {
    return { suggestions: gemini.suggestions, model: 'gemini' };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Türkçe blog asistanısın. Sadece JSON döndür.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const parsed = JSON.parse(data.choices[0].message.content) as {
          suggestions: BlogSuggestion[];
        };
        if (parsed.suggestions?.length) {
          return { suggestions: parsed.suggestions, model: 'gpt-4o-mini' };
        }
      }
    } catch {
      // fallback
    }
  }

  return { suggestions: fallbackSuggestions(type, title), model: 'fallback' };
}

export async function generateBlogImage(
  prompt: string,
  style: string,
): Promise<{ imageUrl: string; model: string }> {
  const fullPrompt = `${style} style: ${prompt}. Professional e-commerce blog header image, high quality.`;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
      }),
    });
    if (response.ok) {
      const data = await response.json();
      const url = data.data?.[0]?.url;
      if (url) return { imageUrl: url, model: 'dall-e-3' };
    }
  }

  const seed = encodeURIComponent(`${style}-${prompt}`.slice(0, 40));
  return {
    imageUrl: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1024&h=768&fit=crop&q=80&auto=format&sig=${seed}`,
    model: 'unsplash-fallback',
  };
}
