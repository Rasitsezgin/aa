import {
  parseAnalysisUrl,
  requiresPremiumForAnalysis,
  isFreeAnalysisPlatform,
} from '@/lib/free-analysis-platforms';

describe('free-analysis-platforms', () => {
  it('parses Trendyol store URL', () => {
    const parsed = parseAnalysisUrl('https://www.trendyol.com/magaza/atn-m-107368');
    expect(parsed?.platform).toBe('TRENDYOL');
    expect(parsed?.isFree).toBe(true);
    expect(parsed?.storeId).toBe('107368');
  });

  it('parses Hepsiburada store URL', () => {
    const parsed = parseAnalysisUrl('https://www.hepsiburada.com/magaza/erogluoto');
    expect(parsed?.platform).toBe('HEPSIBURADA');
    expect(parsed?.isFree).toBe(true);
  });

  it('marks Amazon as premium', () => {
    const check = requiresPremiumForAnalysis('https://www.amazon.com.tr/s?me=ABC');
    expect(check.required).toBe(true);
    expect(check.platformLabel).toBe('Amazon');
  });

  it('isFreeAnalysisPlatform', () => {
    expect(isFreeAnalysisPlatform('TRENDYOL')).toBe(true);
    expect(isFreeAnalysisPlatform('AMAZON')).toBe(false);
  });
});
