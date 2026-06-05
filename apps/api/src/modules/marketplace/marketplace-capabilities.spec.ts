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

  it('does not support order sync for Amazon without SP-API', () => {
    expect(supportsOrderSync('AMAZON')).toBe(false);
    expect(getOrderSyncSkipMessage('AMAZON')).toContain('SP-API');
  });
});
