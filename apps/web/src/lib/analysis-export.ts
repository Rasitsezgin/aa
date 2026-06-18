export type ExportableAnalysis = {
  url: string;
  platform?: string;
  seoScore: number;
  analyzedAt?: string;
  metrics?: Record<string, unknown>;
  products?: Array<{
    name: string;
    price: number;
    rating?: number;
    reviews?: number;
    stockStatus?: boolean;
    imageUrl?: string;
  }>;
  keywords?: string[];
  dataSources?: Record<string, unknown>;
  confidence?: { score?: number };
};

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function buildTextReport(data: ExportableAnalysis): string {
  const lines = [
    'PAZARYONETIMI — MAĞAZA ANALİZ RAPORU',
    '=====================================',
    `URL: ${data.url}`,
    `Platform: ${data.platform || '—'}`,
    `SEO Skoru: ${data.seoScore}/100`,
    `Analiz Zamanı: ${data.analyzedAt ? new Date(data.analyzedAt).toLocaleString('tr-TR') : '—'}`,
    '',
    '--- Mağaza Metrikleri ---',
  ];

  const m = data.metrics || {};
  for (const [key, value] of Object.entries(m)) {
    if (value !== undefined && value !== null && value !== '') {
      lines.push(`${key}: ${value}`);
    }
  }

  if (data.keywords?.length) {
    lines.push('', '--- Anahtar Kelimeler ---', data.keywords.join(', '));
  }

  lines.push('', '--- Ürünler (örnek) ---');
  for (const p of (data.products || []).slice(0, 20)) {
    lines.push(
      `• ${p.name} | ${p.price} TL | ★${p.rating ?? '—'} | ${p.stockStatus === false ? 'Tükendi' : 'Stokta'}`,
    );
  }

  if (data.confidence?.score !== undefined) {
    lines.push('', `Güven Skoru: %${data.confidence.score}`);
  }

  lines.push('', '— Gerçek platform verisi + hesaplanan SEO metrikleri —');
  return lines.join('\n');
}

export function downloadTextReport(data: ExportableAnalysis) {
  const slug = (data.metrics?.storeName as string) || 'magaza';
  const safe = String(slug).replace(/[^\w\-ğüşıöçĞÜŞİÖÇ]/gi, '_').slice(0, 40);
  downloadBlob(`analiz-${safe}.txt`, buildTextReport(data), 'text/plain;charset=utf-8');
}

export function downloadJsonReport(data: ExportableAnalysis) {
  const slug = (data.metrics?.storeName as string) || 'magaza';
  const safe = String(slug).replace(/[^\w\-ğüşıöçĞÜŞİÖÇ]/gi, '_').slice(0, 40);
  downloadBlob(
    `analiz-${safe}.json`,
    JSON.stringify(data, null, 2),
    'application/json',
  );
}

export function downloadCsvReport(data: ExportableAnalysis) {
  const headers = ['name', 'price', 'rating', 'reviews', 'stockStatus', 'imageUrl'];
  const rows = (data.products || []).map((p) =>
    headers
      .map((h) => {
        const val = p[h as keyof typeof p];
        const str = val === undefined || val === null ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(','),
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const slug = (data.metrics?.storeName as string) || 'magaza';
  const safe = String(slug).replace(/[^\w\-ğüşıöçĞÜŞİÖÇ]/gi, '_').slice(0, 40);
  downloadBlob(`urunler-${safe}.csv`, csv, 'text/csv;charset=utf-8');
}

export async function shareAnalysisUrl(url: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'Mağaza Analizi', url });
      return true;
    } catch {
      return false;
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return true;
  }
  return false;
}
