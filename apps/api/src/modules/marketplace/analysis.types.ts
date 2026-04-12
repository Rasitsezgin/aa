export type AnalysisMetricSource =
  | 'api'
  | 'scraped'
  | 'api_or_scraped'
  | 'calculated'
  | 'estimated'
  | 'not_available'
  | 'scraped_or_unknown';

export interface AnalysisConfidence {
  score: number;
  breakdown: {
    total: number;
    real: number;
    calculated: number;
    estimated: number;
    unavailable: number;
  };
}

export interface AnalysisDataSources {
  overall: AnalysisMetricSource | 'scraped+calculated';
  seoScore: AnalysisMetricSource;
  products: AnalysisMetricSource;
  metrics: Record<string, AnalysisMetricSource>;
  reasons?: Record<string, string>;
  evidence?: Record<string, string | number | boolean | null>;
}

export interface MarketplaceAnalysisResponse {
  platform: string;
  storeId: string;
  storeName: string;
  seoScore: number;
  dataSources: AnalysisDataSources;
  confidence: AnalysisConfidence;
  metrics: Record<string, unknown>;
  products: Array<Record<string, unknown>>;
  recommendations: string[];
  timestamp: Date;
}

export function computeConfidenceFromSources(
  sources: Record<string, AnalysisMetricSource>,
): AnalysisConfidence {
  const values = Object.values(sources);
  const total = values.length;

  const real = values.filter(
    (s) => s === 'api' || s === 'scraped' || s === 'api_or_scraped',
  ).length;
  const calculated = values.filter((s) => s === 'calculated').length;
  const estimated = values.filter(
    (s) => s === 'estimated' || s === 'scraped_or_unknown',
  ).length;
  const unavailable = values.filter((s) => s === 'not_available').length;

  const weightedScoreRaw =
    total === 0
      ? 0
      : ((real * 1 + calculated * 0.7 + estimated * 0.35 + unavailable * 0) /
          total) *
        100;

  return {
    score: Math.round(weightedScoreRaw),
    breakdown: {
      total,
      real,
      calculated,
      estimated,
      unavailable,
    },
  };
}
