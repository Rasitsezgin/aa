export const dynamic = "force-dynamic";

import { checkAnalyzeRateLimit } from '@/lib/analysis-rate-limit';
import { generateGeminiJsonResponse } from '@/lib/gemini-chat';

interface StoreDataMetrics {
    storeName?: string;
    rating?: number;
    followers?: number;
    totalProducts?: number;
    totalReviews?: number;
    avgProductPrice?: number;
    titleOptimization?: number;
    imageOptimization?: number;
    priceCompetitiveness?: number;
    stockHealth?: number;
    responseTime?: string;
}

interface AdvisorRequest {
    domain: string;
    score: number;
    url: string;
    storeData?: {
        metrics?: StoreDataMetrics;
        products?: unknown[];
    };
}

interface AIResult {
    message: string;
    suggestions: string[];
    confidence?: number;
}

interface AdvisorResponse {
    message: string;
    suggestions: string[];
    aiModel: string;
    confidence: number;
    insights?: Record<string, unknown>;
}

// AI Model providers
async function callOpenAI(apiKey: string, prompt: string): Promise<AIResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: 'Sen Pazaryonetimi AI Danışmanısın. E-ticaret mağazalarını analiz eder ve öneriler sunarsın. Türkçe yanıt ver.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

async function callGemini(_apiKey: string, prompt: string): Promise<AIResult> {
    const result = await generateGeminiJsonResponse<AIResult>(prompt);
    if (!result?.message) {
        throw new Error('Invalid response format');
    }
    return result;
}

async function callAnthropic(apiKey: string, prompt: string): Promise<AIResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    throw new Error('Invalid response format');
}

function getDefaultResponse(data: AdvisorRequest): AdvisorResponse {
    const { domain, score, storeData } = data;
    const storeName = storeData?.metrics?.storeName || domain;
    const m = storeData?.metrics;
    const weak: string[] = [];
    if ((m?.titleOptimization ?? 100) < 70) weak.push(`başlık optimizasyonu (%${m?.titleOptimization})`);
    if ((m?.imageOptimization ?? 100) < 80) weak.push(`görsel kapsamı (%${m?.imageOptimization})`);
    if ((m?.priceCompetitiveness ?? 100) < 90) weak.push(`fiyat verisi (%${m?.priceCompetitiveness})`);
    if ((m?.stockHealth ?? 100) < 100) weak.push(`stok sağlığı (%${m?.stockHealth})`);

    const weakText = weak.length > 0 ? ` Zayıf alanlar: ${weak.join(', ')}.` : '';
    const ratingText = m?.rating ? ` Mağaza puanı: ${m.rating}/5.` : '';
    const productText = m?.totalProducts ? ` ${m.totalProducts} ürün listelendi.` : '';

    let message = '';
    let suggestions: string[] = [];

    if (score < 40) {
        message = `🚨 ${storeName} SEO skoru kritik (%${score}).${ratingText}${productText}${weakText}`;
        suggestions = weak.length > 0
            ? weak.map((w) => `${w.charAt(0).toUpperCase() + w.slice(1)} — ürün listesindeki örnek verilere göre iyileştirin`)
            : ['Ürün başlıklarına anahtar kelime ekleyin', 'Eksik görselleri tamamlayın', 'Sıfır fiyatlı ürünleri güncelleyin'];
    } else if (score < 60) {
        message = `⚠️ ${storeName} orta düzey SEO skoru (%${score}).${ratingText}${weakText}`;
        suggestions = [
            m?.titleOptimization && m.titleOptimization < 70 ? `Başlık skorunu %${m.titleOptimization} → %75+ hedefleyin` : 'Başlık uzunluklarını 50–100 karakter aralığına çekin',
            m?.imageOptimization && m.imageOptimization < 80 ? `Görsel skorunu %${m.imageOptimization} artırın` : 'Tüm ürünlere kaliteli görsel ekleyin',
            'Örneklenen ürünlerdeki düşük puanlı listelemeleri önceliklendirin',
        ];
    } else if (score < 80) {
        message = `📊 ${storeName} iyi SEO performansı (%${score}).${ratingText}${weakText || ' Temel metrikler güçlü.'}`;
        suggestions = [
            'En düşük puanlı 5 ürünü başlık ve görsel açısından güncelleyin',
            'Anahtar kelime listesindeki yüksek frekanslı terimleri yeni ürünlerde kullanın',
            'Stokta olmayan ürünleri yeniden listeleyin',
        ];
    } else {
        message = `🎉 ${storeName} güçlü SEO skoru (%${score}).${ratingText}${productText}`;
        suggestions = [
            'Mevcut başlık ve görsel performansını koruyun',
            'Yeni ürünlerde aynı başlık kalıbını uygulayın',
            'Düşük yorumlu ürünlerde müşteri geri bildirimi toplayın',
        ];
    }

    return {
        message,
        suggestions: suggestions.filter(Boolean).slice(0, 5),
        aiModel: 'Pazaryonetimi AI',
        confidence: 0.85,
        insights: {
            scoreCategory: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'average' : 'critical',
            weakMetrics: weak,
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        const rate = await checkAnalyzeRateLimit(request);
        if (!rate.allowed) {
            return NextResponse.json(
                { error: 'RATE_LIMIT', message: 'Çok fazla istek. Lütfen bekleyin.' },
                { status: 429 },
            );
        }

        const body: AdvisorRequest = await request.json();
        const { domain, score, url, storeData } = body;

        // API anahtarlarını kontrol et
        const openaiKey = process.env.OPENAI_API_KEY;
        const geminiKey = getGeminiApiKey();
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        const prompt = `
E-ticaret mağaza analizi yapıyorsun. Aşağıdaki GERÇEK zamanlı verilere göre bir danışmanlık mesajı ve öneriler hazırla:

Mağaza Bilgileri:
- Domain: ${domain}
- URL: ${url}
- Genel SEO Skoru: ${score}/100

${storeData ? `Detaylı Metrikler:
- Mağaza Adı: ${storeData.metrics?.storeName || 'Bilinmiyor'}
- Mağaza Puanı: ${storeData.metrics?.rating || 'Bilinmiyor'}
- Takipçi Sayısı: ${storeData.metrics?.followers || 'Bilinmiyor'}
- Toplam Değerlendirme: ${storeData.metrics?.totalReviews ?? 'Bilinmiyor'}
- Toplam Ürün Sayısı: ${storeData.metrics?.totalProducts || 'Bilinmiyor'}
- Başlık Optimizasyonu: %${storeData.metrics?.titleOptimization || 'Bilinmiyor'}
- Görsel Optimizasyonu: %${storeData.metrics?.imageOptimization || 'Bilinmiyor'}
- Fiyat Rekabetçiliği: %${storeData.metrics?.priceCompetitiveness || 'Bilinmiyor'}
- Stok Sağlığı: %${storeData.metrics?.stockHealth || 'Bilinmiyor'}
- Ortalama Ürün Fiyatı: ${storeData.metrics?.avgProductPrice ?? 'Bilinmiyor'} TL
- Yanıt Süresi: ${storeData.metrics?.responseTime || 'Bilinmiyor'}` : ''}

Lütfen aşağıdaki formatta JSON yanıt ver:
{
    "message": "2-3 cümlelik gerçek verilere dayalı danışman mesajı (Emoji kullan, profesyonel ama samimi bir dil kullan, Türkçe)",
    "suggestions": ["Öneri 1 (somut)", "Öneri 2 (somut)", "Öneri 3 (somut)", "Öneri 4 (somut)", "Öneri 5 (somut)"],
    "confidence": 0.9
}

Notlar:
- Mesajda mutlaka gerçek sayılardan birine (puan, takipçi veya skor gibi) atıfta bulun.
- Öneriler "Başlıkları optimize et" gibi genel değil, "Ürün başlıklarındaki anahtar kelime sayısını %20 artır" gibi daha somut olsun.
- Skor 50'nin altındaysa "kritik", 50-80 arasıysa "geliştirilmeli", 80+ ise "başarılı" tonu kullan.
`;

        let result: AIResult | null = null;
        let usedModel = 'Pazaryonetimi AI';

        // AI model sırasıyla dene
        if (geminiKey) {
            try {
                result = await callGemini(geminiKey, prompt);
                usedModel = 'Gemini 1.5 Pro';
            } catch (e) {
                console.error('Gemini API error:', e);
            }
        }

        if (!result && openaiKey) {
            try {
                result = await callOpenAI(openaiKey, prompt);
                usedModel = 'GPT-4 Turbo';
            } catch (e) {
                console.error('OpenAI API error:', e);
            }
        }

        if (!result && anthropicKey) {
            try {
                result = await callAnthropic(anthropicKey, prompt);
                usedModel = 'Claude 3 Opus';
            } catch (e) {
                console.error('Anthropic API error:', e);
            }
        }

        // Hiçbir AI çalışmazsa default yanıt
        if (!result) {
            result = getDefaultResponse(body);
        }

        return NextResponse.json({
            message: result.message,
            suggestions: result.suggestions || [],
            aiModel: usedModel,
            confidence: result.confidence || 0.85,
            insights: null
        });
    } catch (error) {
        console.error('Advisor API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate advisor message' },
            { status: 500 }
        );
    }
}
