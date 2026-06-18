import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.systemSettings.findUnique({ where: { key } });
  if (!row?.value) return fallback;
  return row.value as T;
}

export async function setJsonSetting(key: string, value: unknown, category = 'admin') {
  await prisma.systemSettings.upsert({
    where: { key },
    update: { value: value as object },
    create: {
      key,
      value: value as object,
      category,
      description: `Admin setting: ${key}`,
      isPublic: false,
    },
  });
}

export async function getStringSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.systemSettings.findMany({
    where: { key: { in: keys } },
  });
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = typeof row.value === 'string' ? row.value : String(row.value ?? '');
  }
  return map;
}
