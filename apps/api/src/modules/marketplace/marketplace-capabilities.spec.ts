import {
  getOrderSyncSkipMessage,
  supportsOrderSync,
} from './marketplace-capabilities';

describe('marketplace-capabilities', () => {
  it('supports order sync for TR marketplaces', () => {
    expect(supportsOrderSync('TRENDYOL')).toBe(true);
    expect(supportsOrderSync('HEPSIBURADA')).toBe(true);
    expect(supportsOrderSync('N11')).toBe(true);
    expect(supportsOrderSync('CICEKSEPETI')).toBe(true);
  });

  it('supports Amazon order sync only when SP-API is ready', () => {
    expect(supportsOrderSync('AMAZON')).toBe(false);
    expect(supportsOrderSync('AMAZON', { spApiReady: false })).toBe(false);
    expect(supportsOrderSync('AMAZON', { spApiReady: true })).toBe(true);
    expect(getOrderSyncSkipMessage('AMAZON')).toContain('SP-API');
  });
});
