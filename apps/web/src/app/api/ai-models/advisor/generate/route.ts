export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

interface StoreDataMetrics {
    storeName?: string;
    rating?: number;
    followers?: number;
    totalProducts?: number;
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

async function callGemini(apiKey: string, prompt: string): Promise<AIResult> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
            }
        }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSON bloğunu çıkar
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    throw new Error('Invalid response format');
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

    let message = '';
    let suggestions: string[] = [];

    if (score < 40) {
        message = `🚨 ${storeName} mağazasının performansı kritik seviyede (%${score}). Acil optimizasyon gerekiyor! Özellikle ürün başlıkları, görsel kalitesi ve müşteri deneyimi üzerinde çalışmanızı öneriyorum. Bu iyileştirmeler satışlarınızı %50'ye kadar artırabilir.`;
        suggestions = [
            'Ürün başlıklarını SEO uyumlu hale getir - Anahtar kelimeleri başlıklara ekle',
            'Yüksek çözünürlüklü ve WebP formatında görseller kullan',
            'Müşteri yorumlarına 24 saat içinde yanıt ver',
            'Fiyat rekabetçiliğini analiz et ve dinamik fiyatlandırma stratejisi oluştur',
            'Stok takibini otomatikleştir, "stokta yok" durumunu minimize et',
            'Ürün açıklamalarını zenginleştir ve detaylandır'
        ];
    } else if (score < 60) {
        message = `⚠️ ${storeName} ortalama altı performans gösteriyor (%${score}). Birkaç kritik iyileştirme ile skor %80'in üzerine çıkarılabilir. SEO optimizasyonu ve müşteri deneyimi iyileştirmeleri öncelikli olmalı.`;
        suggestions = [
            'Anahtar kelime optimizasyonu yap - Ürün başlıklarını ve açıklamalarını güncelle',
            'Görsel kalitesini artır - Profesyonel ürün fotoğrafları kullan',
            'Müşteri yorumlarına hızlı ve profesyonel yanıtlar ver',
            'Kampanya ve indirim stratejisi oluştur',
            'Ürün kategori yapısını optimize et'
        ];
    } else if (score < 80) {
        message = `📊 ${storeName} iyi performans gösteriyor (%${score}). Birkaç ince ayar ile satışlarınızı %30 artırabilirsiniz. Özellikle müşteri deneyimi ve görsel optimizasyonu üzerinde çalışmanızı öneriyorum.`;
        suggestions = [
            'Ürün açıklamalarını AI ile zenginleştir',
            'Mobil deneyimi optimize et',
            'Çapraz satış ve ürün öneri sistemlerini aktifleştir',
            'Müşteri sadakat programı başlat'
        ];
    } else {
        message = `🎉 Tebrikler! ${storeName} mükemmel performans gösteriyor (%${score}). Premium özelliklerle ve çoklu pazaryeri entegrasyonu ile daha da büyüyebilirsiniz. Şu anki başarınızı sürdürmek için düzenli analiz yapmayı unutmayın.`;
        suggestions = [
            'Reklam stratejisi ile görünürlüğü daha da artır',
            'Yeni ürün kategorileri ve pazar alanları keşfet',
            'VIP müşteri programı oluştur',
            'Çoklu pazaryeri entegrasyonu yap (Amazon, Hepsiburada)',
            'Uluslararası pazarlara açıl'
        ];
    }

    return {
        message,
        suggestions,
        aiModel: 'Pazaryonetimi AI',
        confidence: 0.85,
        insights: {
            scoreCategory: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'average' : 'critical',
            priorityAreas: score < 60 ? ['SEO', 'Görseller', 'Fiyatlandırma'] : ['Büyüme', 'Sadakat'],
            estimatedImprovementPotential: Math.min(100 - score, 40)
        }
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: AdvisorRequest = await request.json();
        const { domain, score, url, storeData } = body;

        // API anahtarlarını kontrol et
        const openaiKey = process.env.OPENAI_API_KEY;
        const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
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
- Toplam Ürün Sayısı: ${storeData.metrics?.totalProducts || 'Bilinmiyor'}
- Başlık Optimizasyonu: %${storeData.metrics?.titleOptimization || 'Bilinmiyor'}
- Görsel Optimizasyonu: %${storeData.metrics?.imageOptimization || 'Bilinmiyor'}
- Fiyat Rekabetçiliği: %${storeData.metrics?.priceCompetitiveness || 'Bilinmiyor'}
- Stok Sağlığı: %${storeData.metrics?.stockHealth || 'Bilinmiyor'}
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
