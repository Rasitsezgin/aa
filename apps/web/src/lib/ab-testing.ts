// A/B Testing Framework
// For product descriptions, prices, images, and UI elements

import { prisma } from '@/lib/prisma';
import { cache } from './cache';
import { getFeatureFlag } from './feature-flags';

interface Experiment {
  id: string;
  tenantId: string;
  name: string;
  type: 'price' | 'content' | 'image' | 'ui';
  status: 'draft' | 'running' | 'paused' | 'completed';
  target: {
    productIds?: string[];
    categoryIds?: string[];
    platform?: string;
    allProducts?: boolean;
  };
  variants: Array<{
    id: string;
    name: string;
    weight: number; // 0-1, must sum to 1
    changes: Record<string, unknown>;
  }>;
  metrics: {
    primary: 'conversion' | 'revenue' | 'ctr' | 'engagement';
    secondary?: string[];
  };
  startDate?: Date;
  endDate?: Date;
  minSampleSize?: number;
  confidenceLevel?: number; // 0.95 default
}

interface ExperimentResult {
  experimentId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  revenue: number;
  ctr: number;
  confidence?: number;
  isWinner?: boolean;
}

// Assign user to variant
export async function assignVariant(
  experimentId: string,
  userId: string,
  tenantId: string
): Promise<string | null> {
  const cacheKey = `abtest:${experimentId}:${userId}`;
  
  // Check cache first
  const cached = await cache.get<string>(cacheKey);
  if (cached) return cached;

  // Get experiment
  const experiment = await getExperiment(experimentId, tenantId);
  if (!experiment || experiment.status !== 'running') return null;

  // Deterministic assignment based on userId
  const hash = hashString(`${experimentId}:${userId}`);
  
  // Weighted random selection
  let cumulativeWeight = 0;
  for (const variant of experiment.variants) {
    cumulativeWeight += variant.weight;
    if (hash <= cumulativeWeight) {
      await cache.set(cacheKey, variant.id, 86400); // 24 hours
      return variant.id;
    }
  }

  return experiment.variants[0]?.id || null;
}

// Get variant for product
export async function getProductVariant(
  productId: string,
  experimentId: string,
  userId: string,
  tenantId: string
): Promise<Record<string, unknown> | null> {
  const experiment = await getExperiment(experimentId, tenantId);
  if (!experiment) return null;

  // Check if product is in experiment
  if (!isProductInExperiment(productId, experiment)) return null;

  const variantId = await assignVariant(experimentId, userId, tenantId);
  if (!variantId) return null;

  const variant = experiment.variants.find(v => v.id === variantId);
  return variant?.changes || null;
}

// Track experiment event
export async function trackExperimentEvent(
  experimentId: string,
  variantId: string,
  event: 'impression' | 'conversion' | 'revenue',
  value?: number
): Promise<void> {
  const key = `abtest:stats:${experimentId}:${variantId}:${event}`;
  
  if (event === 'revenue' && value) {
    await cache.increment(`${key}:value`, value);
  }
  
  await cache.increment(`${key}:count`);
  await cache.increment(`abtest:stats:${experimentId}:${variantId}:total`);
}

// Get experiment results
export async function getExperimentResults(
  experimentId: string,
  tenantId: string
): Promise<ExperimentResult[]> {
  const experiment = await getExperiment(experimentId, tenantId);
  if (!experiment) return [];

  const results: ExperimentResult[] = [];

  for (const variant of experiment.variants) {
    const impressions = await getStat(experimentId, variant.id, 'impression');
    const conversions = await getStat(experimentId, variant.id, 'conversion');
    const revenue = await getStat(experimentId, variant.id, 'revenue', true);

    const ctr = impressions > 0 ? (conversions / impressions) * 100 : 0;
    const conversionRate = impressions > 0 ? (conversions / impressions) : 0;

    results.push({
      experimentId,
      variantId: variant.id,
      impressions,
      conversions,
      revenue,
      ctr,
    });
  }

  // Calculate statistical significance (simplified)
  if (results.length >= 2) {
    const control = results[0];
    const treatment = results[1];

    // Z-test for proportions (simplified)
    const p1 = control.conversions / control.impressions;
    const p2 = treatment.conversions / treatment.impressions;
    const se = Math.sqrt((p1 * (1 - p1) / control.impressions) + (p2 * (1 - p2) / treatment.impressions));
    const z = (p2 - p1) / (se || 1);
    
    // 95% confidence if |z| > 1.96
    treatment.confidence = Math.abs(z);
    treatment.isWinner = z > 1.96 && treatment.conversions > control.conversions;
  }

  return results;
}

// Create new experiment
export async function createExperiment(
  data: Omit<Experiment, 'id' | 'status'>
): Promise<Experiment> {
  const experiment = await prisma.experiment.create({
    data: {
      ...data,
      status: 'draft',
      variants: JSON.stringify(data.variants),
      target: JSON.stringify(data.target),
      metrics: JSON.stringify(data.metrics),
    },
  });

  return {
    ...experiment,
    variants: JSON.parse(experiment.variants as string),
    target: JSON.parse(experiment.target as string),
    metrics: JSON.parse(experiment.metrics as string),
  };
}

// Start experiment
export async function startExperiment(
  experimentId: string,
  tenantId: string
): Promise<void> {
  await prisma.experiment.update({
    where: { id: experimentId, tenantId },
    data: {
      status: 'running',
      startDate: new Date(),
    },
  });
}

// Stop experiment and declare winner
export async function stopExperiment(
  experimentId: string,
  tenantId: string,
  winnerVariantId?: string
): Promise<void> {
  const experiment = await getExperiment(experimentId, tenantId);
  if (!experiment) throw new Error('Experiment not found');

  // Apply winning variant changes to all products
  if (winnerVariantId) {
    const winner = experiment.variants.find(v => v.id === winnerVariantId);
    if (winner && experiment.target.productIds) {
      for (const productId of experiment.target.productIds) {
        await applyVariantChanges(productId, winner.changes, experiment.type);
      }
    }
  }

  await prisma.experiment.update({
    where: { id: experimentId, tenantId },
    data: {
      status: 'completed',
      endDate: new Date(),
    },
  });
}

// Helper functions
async function getExperiment(id: string, tenantId: string): Promise<Experiment | null> {
  const exp = await prisma.experiment.findFirst({
    where: { id, tenantId },
  });

  if (!exp) return null;

  return {
    ...exp,
    variants: JSON.parse(exp.variants as string),
    target: JSON.parse(exp.target as string),
    metrics: JSON.parse(exp.metrics as string),
  } as Experiment;
}

function isProductInExperiment(productId: string, experiment: Experiment): boolean {
  if (experiment.target.allProducts) return true;
  if (experiment.target.productIds?.includes(productId)) return true;
  return false;
}

async function getStat(
  experimentId: string,
  variantId: string,
  event: string,
  isValue: boolean = false
): Promise<number> {
  const key = `abtest:stats:${experimentId}:${variantId}:${event}:${isValue ? 'value' : 'count'}`;
  const value = await cache.get<number>(key);
  return value || 0;
}

async function applyVariantChanges(
  productId: string,
  changes: Record<string, unknown>,
  type: string
): Promise<void> {
  if (type === 'price') {
    await prisma.product.update({
      where: { id: productId },
      data: { price: changes.price as number },
    });
  } else if (type === 'content') {
    await prisma.product.update({
      where: { id: productId },
      data: {
        title: changes.title as string | undefined,
        description: changes.description as string | undefined,
      },
    });
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

// Predefined experiment templates
export const experimentTemplates = {
  priceTest: (basePrice: number): Experiment['variants'] => [
    {
      id: 'control',
      name: 'Orijinal Fiyat',
      weight: 0.5,
      changes: { price: basePrice },
    },
    {
      id: 'test_10_off',
      name: '%10 İndirim',
      weight: 0.5,
      changes: { price: basePrice * 0.9 },
    },
  ],
  
  descriptionTest: (original: string, test: string): Experiment['variants'] => [
    {
      id: 'control',
      name: 'Orijinal Açıklama',
      weight: 0.5,
      changes: { description: original },
    },
    {
      id: 'test',
      name: 'Yeni Açıklama',
      weight: 0.5,
      changes: { description: test },
    },
  ],
  
  imageTest: (images: string[]): Experiment['variants'] => 
    images.map((img, idx) => ({
      id: `variant_${idx}`,
      name: `Görsel ${idx + 1}`,
      weight: 1 / images.length,
      changes: { mainImage: img },
    })),
};

export type { Experiment, ExperimentResult };
