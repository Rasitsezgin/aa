import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { MarketIntelligenceController } from '../src/modules/market-intelligence/market-intelligence.controller';
import { MarketIntelligenceService } from '../src/modules/market-intelligence/market-intelligence.service';
import { PricingEngineService } from '../src/modules/market-intelligence/pricing-engine.service';
import { ForecastingService } from '../src/modules/market-intelligence/forecasting.service';

describe('Market Intelligence Smoke (e2e)', () => {
  let app: INestApplication;

  const marketIntelligenceServiceMock = {
    createCompetitor: jest.fn().mockResolvedValue({ id: 'comp-1' }),
    getCompetitors: jest.fn().mockResolvedValue([]),
    addCompetitorProduct: jest.fn().mockResolvedValue({ id: 'cp-1' }),
    mapCompetitorProduct: jest.fn().mockResolvedValue({ id: 'cp-1', productId: 'p-1' }),
    getPriceHistory: jest.fn().mockResolvedValue([]),
    createForecast: jest.fn().mockResolvedValue({ id: 'f-1' }),
    getForecasts: jest.fn().mockResolvedValue([]),
    getPricingAnalysis: jest.fn().mockResolvedValue({ overallScore: 80, products: [] }),
    getCompetitorPrices: jest.fn().mockResolvedValue({ productId: 'p-1', competitors: [] }),
    getCompetitorGap: jest.fn().mockResolvedValue({ productId: 'p-1', gap: { gapPercent: 0 } }),
    getCompetitorRecommendations: jest.fn().mockResolvedValue({ productId: 'p-1', actions: [] }),
    getCompetitorAlerts: jest.fn().mockResolvedValue({ alertCount: 0, alerts: [] }),
    generateCompetitorSummaryReport: jest.fn().mockResolvedValue({ success: true, reportId: 'r-1' }),
    applyPriceRecommendation: jest.fn().mockResolvedValue({ success: true }),
    runCompetitorSnapshot: jest.fn().mockResolvedValue({ scannedCompetitors: 1, scannedProducts: 3 }),
    deleteCompetitor: jest.fn().mockResolvedValue({ success: true, deletedProducts: 2 }),
    deleteCompetitorProduct: jest.fn().mockResolvedValue({ success: true }),
    createExperiment: jest.fn().mockResolvedValue({ id: 'exp-1', status: 'active' }),
    getExperiments: jest.fn().mockResolvedValue([]),
    evaluateExperiment: jest.fn().mockResolvedValue({ experimentId: 'exp-1', winner: 'test', significance: 0.95 }),
    stopExperiment: jest.fn().mockResolvedValue({ success: true, winner: 'test' }),
    autoDiscoverCompetitors: jest.fn().mockResolvedValue({ discovered: 2, competitors: [] }),
  };

  const pricingEngineServiceMock = {
    calculateOptimalPrice: jest.fn().mockResolvedValue({ suggestedPrice: 100, appliedRules: [], reasoning: [] }),
    getRules: jest.fn().mockResolvedValue([]),
    createRule: jest.fn().mockResolvedValue({ id: 'rule-1', name: 'Test Rule' }),
    updateRule: jest.fn().mockResolvedValue({ id: 'rule-1' }),
    deleteRule: jest.fn().mockResolvedValue({ success: true }),
    bulkReprice: jest.fn().mockResolvedValue({ total: 10, applied: 5, results: [] }),
  };

  const forecastingServiceMock = {
    generateProductForecast: jest.fn().mockResolvedValue({ success: true, productId: 'p-1' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MarketIntelligenceController],
      providers: [
        { provide: MarketIntelligenceService, useValue: marketIntelligenceServiceMock },
        { provide: PricingEngineService, useValue: pricingEngineServiceMock },
        { provide: ForecastingService, useValue: forecastingServiceMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /market-intelligence/competitors smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/competitors')
      .send({ tenantId: 'tenant-1', name: 'Rakip A', platform: 'TRENDYOL' })
      .expect(201);
  });

  it('GET /market-intelligence/pricing-analysis smoke', async () => {
    await request(app.getHttpServer())
      .get('/market-intelligence/pricing-analysis?tenantId=tenant-1')
      .expect(200);
  });

  it('GET /market-intelligence/competitor-prices/:productId smoke', async () => {
    await request(app.getHttpServer())
      .get('/market-intelligence/competitor-prices/p-1?tenantId=tenant-1')
      .expect(200);
  });

  it('GET /market-intelligence/competitor-gap/:productId smoke', async () => {
    await request(app.getHttpServer())
      .get('/market-intelligence/competitor-gap/p-1?tenantId=tenant-1')
      .expect(200);
  });

  it('GET /market-intelligence/competitor-recommendations/:productId smoke', async () => {
    await request(app.getHttpServer())
      .get('/market-intelligence/competitor-recommendations/p-1?tenantId=tenant-1')
      .expect(200);
  });

  it('GET /market-intelligence/competitor-alerts smoke', async () => {
    await request(app.getHttpServer())
      .get('/market-intelligence/competitor-alerts?tenantId=tenant-1&priceGapPercent=5')
      .expect(200);
  });

  it('POST /market-intelligence/competitor-summary-report smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/competitor-summary-report')
      .send({ tenantId: 'tenant-1', days: 7 })
      .expect(201);
  });

  it('POST /market-intelligence/snapshot smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/snapshot')
      .send({ tenantId: 'tenant-1', platform: 'TRENDYOL', limitPerStore: 5 })
      .expect(201);
  });

  // Pricing Rules
  it('GET /market-intelligence/pricing-rules smoke', async () => {
    await request(app.getHttpServer())
      .get('/market-intelligence/pricing-rules?tenantId=tenant-1')
      .expect(200);
  });

  it('POST /market-intelligence/pricing-rules smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/pricing-rules')
      .send({ tenantId: 'tenant-1', name: 'Undercut', type: 'competitor', action: { type: 'undercut', value: 1 } })
      .expect(201);
  });

  it('POST /market-intelligence/bulk-reprice smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/bulk-reprice')
      .send({ tenantId: 'tenant-1' })
      .expect(201);
  });

  // Competitor Delete
  it('DELETE /market-intelligence/competitors/:id smoke', async () => {
    await request(app.getHttpServer())
      .delete('/market-intelligence/competitors/comp-1?tenantId=tenant-1')
      .expect(200);
  });

  it('DELETE /market-intelligence/competitor-products/:id smoke', async () => {
    await request(app.getHttpServer())
      .delete('/market-intelligence/competitor-products/cp-1?tenantId=tenant-1')
      .expect(200);
  });

  // Experiments
  it('POST /market-intelligence/experiments smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/experiments')
      .send({ tenantId: 'tenant-1', productId: 'p-1', testPrice: 95 })
      .expect(201);
  });

  it('GET /market-intelligence/experiments smoke', async () => {
    await request(app.getHttpServer())
      .get('/market-intelligence/experiments?tenantId=tenant-1')
      .expect(200);
  });

  it('POST /market-intelligence/experiments/:id/evaluate smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/experiments/exp-1/evaluate')
      .send({ tenantId: 'tenant-1' })
      .expect(201);
  });

  it('POST /market-intelligence/experiments/:id/stop smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/experiments/exp-1/stop')
      .send({ tenantId: 'tenant-1' })
      .expect(201);
  });

  // Auto-Discovery
  it('POST /market-intelligence/auto-discover smoke', async () => {
    await request(app.getHttpServer())
      .post('/market-intelligence/auto-discover')
      .send({ tenantId: 'tenant-1' })
      .expect(201);
  });
});
