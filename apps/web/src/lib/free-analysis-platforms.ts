import { parseTrendyolStoreUrl } from '@/lib/trendyol-store-url';
import { parseHepsiburadaStoreUrl } from '@/lib/hepsiburada-store-url';

export const FREE_ANALYSIS_PLATFORMS = ['TRENDYOL', 'HEPSIBURADA'] as const;
export type FreeAnalysisPlatform = (typeof FREE_ANALYSIS_PLATFORMS)[number];

const PREMIUM_HOST_RULES: Array<{
  test: (host: string, url: string) => boolean;
  platform: string;
  label: string;
}> = [
  { test: (h) => h.includes('amazon.'), platform: 'AMAZON', label: 'Amazon' },
  { test: (h) => h.includes('n11.com'), platform: 'N11', label: 'N11' },
  { test: (h) => h.includes('ciceksepeti.com'), platform: 'CICEKSEPETI', label: 'Çiçeksepeti' },
  { test: (h) => h.includes('etsy.com'), platform: 'ETSY', label: 'Etsy' },
  { test: (h) => h.includes('ebay.'), platform: 'EBAY', label: 'eBay' },
  { test: (h) => h.includes('shopify.com'), platform: 'SHOPIFY', label: 'Shopify' },
  { test: (h, u) => h.includes('tiktok.com') || u.includes('tiktok'), platform: 'TIKTOK', label: 'TikTok Shop' },
  { test: (h) => h.includes('facebook.com') || h.includes('fb.com'), platform: 'FACEBOOK', label: 'Facebook Marketplace' },
  { test: (h) => h.includes('instagram.com'), platform: 'INSTAGRAM', label: 'Instagram Shop' },
  { test: (h) => h.includes('pinterest.'), platform: 'PINTEREST', label: 'Pinterest' },
  { test: (h) => h.includes('walmart.com'), platform: 'WALMART', label: 'Walmart' },
];

export type ParsedAnalysisUrl = {
  platform: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  platformLabel: string;
  isFree: boolean;
};

function titleCaseSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function isFreeAnalysisPlatform(platform: string): boolean {
  return FREE_ANALYSIS_PLATFORMS.includes(platform as FreeAnalysisPlatform);
}

export function parseAnalysisUrl(urlString: string): ParsedAnalysisUrl | null {
  const trimmed = urlString.trim();
  if (!trimmed) return null;

  try {
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();

    if (host.includes('trendyol.com')) {
      const parsed = parseTrendyolStoreUrl(trimmed);
      if (!parsed?.storeId) return null;
      return {
        platform: 'TRENDYOL',
        storeId: parsed.storeId,
        storeSlug: parsed.storeSlug,
        storeName: parsed.storeName,
        platformLabel: 'Trendyol',
        isFree: true,
      };
    }

    if (host.includes('hepsiburada.com')) {
      const parsed = parseHepsiburadaStoreUrl(trimmed);
      if (!parsed?.storeSlug) return null;
      return {
        platform: 'HEPSIBURADA',
        storeId: parsed.storeSlug,
        storeSlug: parsed.storeSlug,
        storeName: parsed.storeName,
        platformLabel: 'Hepsiburada',
        isFree: true,
      };
    }

    for (const rule of PREMIUM_HOST_RULES) {
      if (rule.test(host, trimmed)) {
        const slugMatch = url.pathname.match(/\/([^/?]+)\/?$/);
        const storeSlug = slugMatch?.[1] || 'magaza';
        return {
          platform: rule.platform,
          storeId: storeSlug,
          storeSlug,
          storeName: titleCaseSlug(storeSlug.replace(/\.(html?|php)$/i, '')),
          platformLabel: rule.label,
          isFree: false,
        };
      }
    }

    return {
      platform: 'UNKNOWN',
      storeId: 'magaza',
      storeSlug: 'magaza',
      storeName: host.replace(/^www\./, ''),
      platformLabel: host.replace(/^www\./, ''),
      isFree: false,
    };
  } catch {
    return null;
  }
}

export function requiresPremiumForAnalysis(urlString: string): {
  required: boolean;
  platformLabel: string;
  platform: string;
} {
  const parsed = parseAnalysisUrl(urlString);
  if (!parsed) {
    return { required: true, platformLabel: 'Bu platform', platform: 'UNKNOWN' };
  }
  return {
    required: !parsed.isFree,
    platformLabel: parsed.platformLabel,
    platform: parsed.platform,
  };
}
