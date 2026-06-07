/**
 * Provider + Tenant bazlı API rate limit politikası.
 * Trendyol/HB gibi platformların dakikalık limitlerine takılmamak için
 * sliding-window sayaç tutar.
 */
export class ProviderRateLimitPolicy {
  private readonly windows = new Map<
    string,
    { timestamps: number[]; windowMs: number; maxCalls: number }
  >();

  /** Provider için limit konfigürasyonu (dakika başına max çağrı) */
  private readonly providerLimits: Record<string, number> = {
    trendyol: 60,
    hepsiburada: 50,
    n11: 40,
    'amazon-tr': 30,
    shopify: 80,
    'yurtici-kargo': 100,
    logo: 30,
    default: 30,
  };

  private key(tenantId: string, providerId: string): string {
    return `${tenantId}:${providerId}`;
  }

  private getLimit(providerId: string): number {
    return this.providerLimits[providerId] ?? this.providerLimits.default;
  }

  /** API çağrısı yapılabilir mi? */
  canCall(tenantId: string, providerId: string): boolean {
    const k = this.key(tenantId, providerId);
    const windowMs = 60_000;
    const maxCalls = this.getLimit(providerId);
    const now = Date.now();

    let bucket = this.windows.get(k);
    if (!bucket) {
      bucket = { timestamps: [], windowMs, maxCalls };
      this.windows.set(k, bucket);
    }

    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
    return bucket.timestamps.length < maxCalls;
  }

  /** Çağrı kaydı */
  recordCall(tenantId: string, providerId: string): void {
    const k = this.key(tenantId, providerId);
    const bucket = this.windows.get(k) ?? {
      timestamps: [],
      windowMs: 60_000,
      maxCalls: this.getLimit(providerId),
    };
    bucket.timestamps.push(Date.now());
    this.windows.set(k, bucket);
  }

  /** Kalan kota */
  remainingQuota(tenantId: string, providerId: string): number {
    const k = this.key(tenantId, providerId);
    const bucket = this.windows.get(k);
    if (!bucket) return this.getLimit(providerId);
    const now = Date.now();
    const active = bucket.timestamps.filter((t) => now - t < bucket.windowMs);
    return Math.max(0, bucket.maxCalls - active.length);
  }
}
