export type ParsedHepsiburadaStore = {
  storeSlug: string;
  storeName: string;
};

export function parseHepsiburadaStoreUrl(urlString: string): ParsedHepsiburadaStore | null {
  try {
    const normalized = urlString.trim();
    if (!normalized.includes('hepsiburada.com')) return null;

    const url = new URL(
      normalized.startsWith('http') ? normalized : `https://${normalized}`,
    );

    const magazaMatch = url.pathname.match(/\/magaza\/([^/?]+)/i);
    if (!magazaMatch?.[1]) return null;

    const storeSlug = magazaMatch[1];
    const storeName = storeSlug
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { storeSlug, storeName };
  } catch {
    return null;
  }
}

export function resolveHepsiburadaBrowseUrl(
  parsed: ParsedHepsiburadaStore,
  sourceUrl?: string,
): string {
  if (sourceUrl?.includes('hepsiburada.com')) {
    return sourceUrl;
  }
  return `https://www.hepsiburada.com/magaza/${parsed.storeSlug}`;
}
