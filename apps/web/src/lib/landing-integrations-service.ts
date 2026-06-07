import 'server-only';

import fs from 'fs/promises';
import path from 'path';
import { integrations as defaultIntegrations, type Integration, type CategoryId } from '@/components/landing/integrations-data';

const DATA_PATH = path.join(process.cwd(), 'data', 'landing-integrations.json');

export type LandingIntegrationSeo = {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
};

export type LandingIntegrationRecord = Integration & LandingIntegrationSeo & {
  isPublished: boolean;
  sortOrder: number;
  updatedAt: string;
};

type CatalogFile = {
  items: LandingIntegrationRecord[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toRecord(item: Integration, index: number, existing?: Partial<LandingIntegrationRecord>): LandingIntegrationRecord {
  return {
    ...item,
    isPublished: existing?.isPublished ?? true,
    sortOrder: existing?.sortOrder ?? index,
    updatedAt: existing?.updatedAt ?? new Date().toISOString(),
  };
}

async function ensureCatalogFile(): Promise<CatalogFile> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as CatalogFile;
    if (Array.isArray(parsed.items) && parsed.items.length > 0) {
      return parsed;
    }
  } catch {
    // seed below
  }

  const seeded: CatalogFile = {
    items: defaultIntegrations.map((item, index) => toRecord(item, index)),
  };
  await writeCatalog(seeded);
  return seeded;
}

async function writeCatalog(catalog: CatalogFile) {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
}

function sortItems(items: LandingIntegrationRecord[]): LandingIntegrationRecord[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'));
}

export async function listAllLandingIntegrations(): Promise<LandingIntegrationRecord[]> {
  const catalog = await ensureCatalogFile();
  return sortItems(catalog.items);
}

function toPublicIntegration(record: LandingIntegrationRecord): Integration {
  const {
    isPublished: _p,
    sortOrder: _s,
    updatedAt: _u,
    metaTitle: _mt,
    metaDescription: _md,
    metaKeywords: _mk,
    ogImage: _og,
    noIndex: _ni,
    ...rest
  } = record;
  return rest;
}

export async function listPublishedLandingIntegrations(): Promise<Integration[]> {
  const items = await listAllLandingIntegrations();
  return items.filter((item) => item.isPublished).map(toPublicIntegration);
}

export async function getLandingIntegrationById(id: string): Promise<LandingIntegrationRecord | null> {
  const items = await listAllLandingIntegrations();
  return items.find((item) => item.id === id) ?? null;
}

function findPublishedBySlug(slug: string, items: LandingIntegrationRecord[]): LandingIntegrationRecord | null {
  return items.find(
    (item) => item.isPublished && (
      item.id === slug
      || slugify(item.name) === slug
      || item.documentation.replace('/docs/', '') === slug
    ),
  ) ?? null;
}

export async function getPublishedIntegrationDetailBySlug(slug: string): Promise<LandingIntegrationRecord | null> {
  const items = await listAllLandingIntegrations();
  return findPublishedBySlug(slug, items);
}

export async function getPublishedIntegrationBySlug(slug: string): Promise<Integration | null> {
  const match = await getPublishedIntegrationDetailBySlug(slug);
  if (!match) return null;
  return toPublicIntegration(match);
}

export function buildIntegrationDetailPath(integration: Pick<Integration, 'id'>): string {
  return `/entegrasyonlar/${integration.id}`;
}

export type LandingIntegrationInput = {
  id?: string;
  name: string;
  category: CategoryId;
  color: string;
  gradient: string;
  logo: string;
  desc: string;
  shortDesc: string;
  features: string[];
  stats: { users: string; syncTime: string; uptime: string };
  rating: number;
  reviews: number;
  isPopular: boolean;
  isNew: boolean;
  isPublished: boolean;
  documentation: string;
  setupTime: string;
  price: string;
  requirements: string[];
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
};

function normalizeInput(body: Partial<LandingIntegrationInput>): LandingIntegrationInput {
  const name = String(body.name || '').trim();
  if (!name) throw new Error('Pazaryeri adı zorunludur');

  const category = String(body.category || 'pazaryeri') as CategoryId;
  const features = Array.isArray(body.features)
    ? body.features.map(String).filter(Boolean)
    : String(body.features || '').split('\n').map((f) => f.trim()).filter(Boolean);

  const requirements = Array.isArray(body.requirements)
    ? body.requirements.map(String).filter(Boolean)
    : String(body.requirements || '').split('\n').map((r) => r.trim()).filter(Boolean);

  const id = String(body.id || slugify(name)).trim() || slugify(name);
  const metaKeywords = Array.isArray(body.metaKeywords)
    ? body.metaKeywords.map(String).filter(Boolean)
    : String(body.metaKeywords || '').split(',').map((k) => k.trim()).filter(Boolean);

  return {
    id,
    name,
    category,
    color: String(body.color || '#F27A1A'),
    gradient: String(body.gradient || 'from-orange-500 to-orange-600'),
    logo: String(body.logo || id.slice(0, 2).toUpperCase()),
    desc: String(body.desc || ''),
    shortDesc: String(body.shortDesc || ''),
    features,
    stats: {
      users: String(body.stats?.users || '0'),
      syncTime: String(body.stats?.syncTime || '< 5 dk'),
      uptime: String(body.stats?.uptime || '99.9%'),
    },
    rating: Number(body.rating ?? 4.5),
    reviews: Number(body.reviews ?? 0),
    isPopular: Boolean(body.isPopular),
    isNew: Boolean(body.isNew),
    isPublished: body.isPublished !== false,
    documentation: String(body.documentation || `/docs/${id}`),
    setupTime: String(body.setupTime || '5 dakika'),
    price: String(body.price || 'Ücretsiz'),
    requirements,
    sortOrder: Number(body.sortOrder ?? 0),
    metaTitle: String(body.metaTitle || '').trim() || undefined,
    metaDescription: String(body.metaDescription || '').trim() || undefined,
    metaKeywords: metaKeywords.length ? metaKeywords : undefined,
    ogImage: String(body.ogImage || '').trim() || undefined,
    noIndex: Boolean(body.noIndex),
  };
}

export async function createLandingIntegration(body: Partial<LandingIntegrationInput>): Promise<LandingIntegrationRecord> {
  const input = normalizeInput(body);
  const catalog = await ensureCatalogFile();

  if (catalog.items.some((item) => item.id === input.id)) {
    throw new Error('Bu kimlikte bir pazaryeri zaten var');
  }

  const maxOrder = catalog.items.reduce((max, item) => Math.max(max, item.sortOrder), -1);
  const record: LandingIntegrationRecord = {
    ...input,
    sortOrder: input.sortOrder ?? maxOrder + 1,
    updatedAt: new Date().toISOString(),
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    metaKeywords: input.metaKeywords,
    ogImage: input.ogImage,
    noIndex: input.noIndex,
  };

  catalog.items.push(record);
  await writeCatalog(catalog);
  return record;
}

export async function updateLandingIntegration(
  id: string,
  body: Partial<LandingIntegrationInput>,
): Promise<LandingIntegrationRecord> {
  const catalog = await ensureCatalogFile();
  const index = catalog.items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Pazaryeri bulunamadı');

  const current = catalog.items[index];
  const merged = normalizeInput({ ...current, ...body, id: current.id });
  const record: LandingIntegrationRecord = {
    ...merged,
    updatedAt: new Date().toISOString(),
    metaTitle: merged.metaTitle,
    metaDescription: merged.metaDescription,
    metaKeywords: merged.metaKeywords,
    ogImage: merged.ogImage,
    noIndex: merged.noIndex,
  };

  catalog.items[index] = record;
  await writeCatalog(catalog);
  return record;
}

export async function deleteLandingIntegration(id: string): Promise<void> {
  const catalog = await ensureCatalogFile();
  const next = catalog.items.filter((item) => item.id !== id);
  if (next.length === catalog.items.length) {
    throw new Error('Pazaryeri bulunamadı');
  }
  await writeCatalog({ items: next });
}

export async function resetLandingIntegrationsToDefaults(): Promise<LandingIntegrationRecord[]> {
  const seeded = defaultIntegrations.map((item, index) => toRecord(item, index));
  await writeCatalog({ items: seeded });
  return seeded;
}
