/** Senkronizasyon sonuç özeti */
export interface SyncResultDto<T> {
  success: boolean;
  tenantId: string;
  providerId: string;
  syncType: string;
  total: number;
  created: number;
  updated: number;
  failed: number;
  items: T[];
  errors?: string[];
  durationMs?: number;
}
