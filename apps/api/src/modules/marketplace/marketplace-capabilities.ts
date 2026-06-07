const ORDER_SYNC_UNSUPPORTED = new Set<string>([
  'GITTIGIDIYOR',
  'WEBSITE',
  'OTHER',
]);

export interface OrderSyncCapabilityOptions {
  spApiReady?: boolean;
}

export function supportsOrderSync(
  platform: string,
  options?: OrderSyncCapabilityOptions,
): boolean {
  if (platform.startsWith('AMAZON')) {
    return options?.spApiReady === true;
  }

  return !ORDER_SYNC_UNSUPPORTED.has(String(platform));
}

export function getOrderSyncSkipMessage(platform: string): string {
  if (platform.startsWith('AMAZON')) {
    return 'Amazon sipariş senkronizasyonu için SP-API kimlik bilgileri eksik';
  }
  if (platform === 'GITTIGIDIYOR') {
    return 'GittiGidiyor platformu kapatıldı; sipariş sync kullanılamıyor';
  }
  return `${platform} için sipariş senkronizasyonu desteklenmiyor`;
}
