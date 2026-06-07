import 'server-only';

import { createRequire } from 'node:module';
import { join } from 'node:path';
import type { PrismaClient } from '@pazaryonetimi/database';

const require = createRequire(join(process.cwd(), 'package.json'));

function loadDatabasePrisma(): PrismaClient {
  const database = require('@pazaryonetimi/database') as typeof import('@pazaryonetimi/database');
  return database.prisma;
}

let prismaInstance: PrismaClient | undefined;

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!prismaInstance) {
      prismaInstance = loadDatabasePrisma();
    }
    return (prismaInstance as Record<string | symbol, unknown>)[prop];
  },
});
