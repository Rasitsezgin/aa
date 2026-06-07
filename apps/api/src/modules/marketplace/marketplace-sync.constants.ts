/** Tam katalog: limit=0 tüm sayfaları çeker */
export const SYNC_FULL_CATALOG_LIMIT = 0;

export const SYNC_PAGE_SIZE = 100;

export const SYNC_MAX_API_PAGES = 100;

/** Scraping fallback üst sınırı */
export const SYNC_SCRAPE_FALLBACK_LIMIT = 200;

export function getHepsiburadaListingApiBase(): string {
  if (process.env.HEPSIBURADA_LISTING_API_URL) {
    return process.env.HEPSIBURADA_LISTING_API_URL.replace(/\/$/, '');
  }
  if (process.env.HEPSIBURADA_USE_SANDBOX === 'true') {
    return 'https://listing-external-sit.hepsiburada.com';
  }
  return 'https://listing-external.hepsiburada.com';
}

export function resolveSyncPageSize(limit: number): number {
  if (limit <= 0) return SYNC_PAGE_SIZE;
  return Math.min(SYNC_PAGE_SIZE, Math.max(10, limit));
}

export function resolveScrapeLimit(limit: number): number {
  if (limit <= 0) return SYNC_SCRAPE_FALLBACK_LIMIT;
  return limit;
}

export function isUnlimitedSync(limit: number): boolean {
  return limit <= 0;
}
