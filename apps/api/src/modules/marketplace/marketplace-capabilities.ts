const ORDER_SYNC_UNSUPPORTED = new Set<string>(['AMAZON']);

export interface OrderSyncCapabilityOptions {
  spApiReady?: boolean;
}

export function supportsOrderSync(
  platform: string,
  options?: OrderSyncCapabilityOptions,
): boolean {
  if (platform === 'AMAZON') {
    return options?.spApiReady === true;
  }

  return !ORDER_SYNC_UNSUPPORTED.has(String(platform));
}

export function getOrderSyncSkipMessage(platform: string): string {
  if (platform === 'AMAZON') {
    return 'Amazon sipariş senkronizasyonu için SP-API kimlik bilgileri eksik';
  }
  return `${platform} için sipariş senkronizasyonu desteklenmiyor`;
}
