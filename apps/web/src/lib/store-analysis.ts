import 'server-only';

import { cache, CACHE_TTL } from '@/lib/cache';
import {
  memoryCacheGet,
  memoryCacheSet,
  ANALYSIS_CACHE_TTL_SEC,
} from '@/lib/analysis-memory-store';
import { runTrendyolAnalysis } from '@/lib/trendyol-analyze';
import { runHepsiburadaAnalysis } from '@/lib/hepsiburada-analyze';
import { parseAnalysisUrl } from '@/lib/free-analysis-platforms';
import type { TrendyolAnalyzeResponse } from '@/lib/trendyol-analyze';

export type StoreAnalysisResult = TrendyolAnalyzeResponse & {
  cached?: boolean;
  analyzedAt?: string;
};

function analysisCacheKey(platform: string, url: string): string {
  return `analysis:v1:${platform.toLowerCase()}:${url.trim().toLowerCase()}`;
}

export async function getCachedStoreAnalysis(
  platform: string,
  url: string,
): Promise<StoreAnalysisResult | null> {
  const key = analysisCacheKey(platform, url);
  const fromRedis = await cache.get<StoreAnalysisResult>(key);
  if (fromRedis) return { ...fromRedis, cached: true };
  const fromMemory = memoryCacheGet<StoreAnalysisResult>(key);
  if (fromMemory) return { ...fromMemory, cached: true };
  return null;
}

export async function setCachedStoreAnalysis(
  platform: string,
  url: string,
  data: StoreAnalysisResult,
): Promise<void> {
  const key = analysisCacheKey(platform, url);
  const payload = { ...data, analyzedAt: new Date().toISOString() };
  memoryCacheSet(key, payload, ANALYSIS_CACHE_TTL_SEC);
  await cache.set(key, payload, CACHE_TTL.STANDARD);
}

/**
 * Unified store analysis entry — Trendyol & Hepsiburada only.
 * Production scrape: set SCRAPE_HEADLESS=true and ensure Chrome/Chromium on server.
 */
export async function runStoreAnalysis(
  url: string,
  storeIdFallback?: string,
  options?: { skipCache?: boolean },
): Promise<StoreAnalysisResult> {
  const parsed = parseAnalysisUrl(url);
  if (!parsed?.isFree) {
    throw new Error('PREMIUM_REQUIRED');
  }

  if (!options?.skipCache) {
    const cached = await getCachedStoreAnalysis(parsed.platform, url);
    if (cached) return cached;
  }

  let result: StoreAnalysisResult;
  if (parsed.platform === 'TRENDYOL') {
    result = await runTrendyolAnalysis(url, storeIdFallback || parsed.storeId);
  } else if (parsed.platform === 'HEPSIBURADA') {
    result = await runHepsiburadaAnalysis(url, storeIdFallback || parsed.storeId);
  } else {
    throw new Error('PREMIUM_REQUIRED');
  }

  result.analyzedAt = new Date().toISOString();
  await setCachedStoreAnalysis(parsed.platform, url, result);
  return result;
}
