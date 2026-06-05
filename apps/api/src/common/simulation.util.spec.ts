import { isSimulationAllowed } from './simulation.util';

describe('simulation.util', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    delete process.env.ALLOW_SIMULATED_PAYMENTS;
  });

  it('allows simulation outside production', () => {
    process.env.NODE_ENV = 'development';
    expect(isSimulationAllowed('ALLOW_SIMULATED_PAYMENTS')).toBe(true);
  });

  it('blocks simulation in production without explicit flag', () => {
    process.env.NODE_ENV = 'production';
    expect(isSimulationAllowed('ALLOW_SIMULATED_PAYMENTS')).toBe(false);
  });

  it('allows simulation in production when flag is true', () => {
    process.env.NODE_ENV = 'production';
    process.env.ALLOW_SIMULATED_PAYMENTS = 'true';
    expect(isSimulationAllowed('ALLOW_SIMULATED_PAYMENTS')).toBe(true);
  });
});
