export type ParsedTrendyolStore = {
  storeId: string;
  storeSlug: string;
  storeName: string;
};

function parseMagazaSlug(fullSlug: string): ParsedTrendyolStore | null {
  const slug = fullSlug.replace(/\/+$/, '').trim();
  if (!slug) return null;

  const parts = slug.split('-');
  const storeId = parts.pop();
  if (!storeId || !/^\d+$/.test(storeId)) return null;
  if (parts[parts.length - 1]?.toLowerCase() === 'm') parts.pop();

  const storeSlug = parts.join('-') || `magaza-${storeId}`;
  const storeName =
    storeSlug
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Trendyol Mağazası';

  return { storeId, storeSlug, storeName };
}

/**
 * Trendyol mağaza URL'lerini çözümler.
 * - /magaza/slug-m-12345
 * - /magaza/profil/slug-m-12345
 * - /sr?mid=12345
 */
export function parseTrendyolStoreUrl(urlString: string): ParsedTrendyolStore | null {
  try {
    const normalized = urlString.trim();
    if (!normalized.includes('trendyol.com')) return null;

    const url = new URL(
      normalized.startsWith('http') ? normalized : `https://${normalized}`,
    );

    const mid =
      url.searchParams.get('mid') ||
      url.searchParams.get('merchantId') ||
      url.searchParams.get('sellerId');

    if (mid && /^\d+$/.test(mid)) {
      return {
        storeId: mid,
        storeSlug: `magaza-${mid}`,
        storeName: 'Trendyol Mağazası',
      };
    }

    const magazaMatch = url.pathname.match(
      /\/magaza\/(?:profil\/)?([^/?]+)/i,
    );
    if (magazaMatch?.[1]) {
      const parsed = parseMagazaSlug(magazaMatch[1]);
      if (parsed) return parsed;
    }

    const slugInPath = url.pathname.match(/([a-z0-9]+(?:-[a-z0-9]+)*-m-\d+)/i);
    if (slugInPath?.[1]) {
      const parsed = parseMagazaSlug(slugInPath[1]);
      if (parsed) return parsed;
    }

    const boutiqueMatch = url.pathname.match(/\/butik\/(?:[^/]+\/)?(\d+)/i);
    if (boutiqueMatch?.[1]) {
      const storeId = boutiqueMatch[1];
      return {
        storeId,
        storeSlug: `butik-${storeId}`,
        storeName: 'Trendyol Mağazası',
      };
    }

    return null;
  } catch {
    return null;
  }
}
