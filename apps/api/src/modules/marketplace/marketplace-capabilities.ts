const ORDER_SYNC_UNSUPPORTED = new Set<string>(['AMAZON']);

export function supportsOrderSync(platform: string): boolean {
  return !ORDER_SYNC_UNSUPPORTED.has(String(platform));
}

export function getOrderSyncSkipMessage(platform: string): string {
  if (platform === 'AMAZON') {
    return 'Amazon sipariş senkronizasyonu SP-API entegrasyonu gerektirir';
  }
  return `${platform} için sipariş senkronizasyonu desteklenmiyor`;
}
