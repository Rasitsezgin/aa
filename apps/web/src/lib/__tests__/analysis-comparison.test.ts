import { compareStoreSnapshots, snapshotFromAnalysis } from '@/lib/analysis-comparison';

describe('analysis-comparison', () => {
  const base = {
    metrics: {
      storeName: 'A',
      rating: 4.2,
      followers: 1000,
      totalProducts: 100,
      avgProductPrice: 150,
      totalReviews: 500,
      titleOptimization: 70,
      imageOptimization: 80,
    },
    seoScore: 72,
  };

  it('snapshotFromAnalysis', () => {
    const snap = snapshotFromAnalysis(base);
    expect(snap?.storeName).toBe('A');
    expect(snap?.seoScore).toBe(72);
  });

  it('compareStoreSnapshots highlights better side', () => {
    const a = snapshotFromAnalysis(base)!;
    const b = snapshotFromAnalysis({
      ...base,
      seoScore: 80,
      metrics: { ...base.metrics, rating: 3.5, followers: 500 },
    })!;
    const rows = compareStoreSnapshots(a, b);
    const seoRow = rows.find((r) => r.label === 'SEO Skoru');
    expect(seoRow?.better).toBe('compare');
    const followerRow = rows.find((r) => r.label === 'Takipçi');
    expect(followerRow?.better).toBe('current');
  });
});
