import { createRequire } from 'node:module'
import type { PrismaClient } from './generated/client'

let requirePath = __filename;
if (requirePath.startsWith('/ROOT/')) {
  // In Next.js standalone, process.cwd() is /app/apps/web
  // We need to point back to the monorepo root
  const rootDir = process.cwd().includes('apps') ? process.cwd() + '/../../' : process.cwd() + '/';
  requirePath = requirePath.replace('/ROOT/', rootDir);
}

const nodeRequire = createRequire(requirePath)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = (): PrismaClient => {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL is required in production')
    }
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres'
  }

  // Load Prisma runtime via Node require so Turbopack does not bundle generated/client.
  const { PrismaClient: PrismaClientConstructor } = nodeRequire('./generated/client') as {
    PrismaClient: new (args?: object) => PrismaClient
  }
  const { Pool } = nodeRequire('pg') as typeof import('pg')
  const { PrismaPg } = nodeRequire('@prisma/adapter-pg') as typeof import('@prisma/adapter-pg')

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool as any)

  return new PrismaClientConstructor({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  } as any)
}

// Lazy initialization - only create client when first accessed
let prismaClient: PrismaClient | undefined

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!prismaClient) {
      if (isBuildPhase) {
        // Never initialize real DB client during `next build`.
        // This avoids pulling in 'pg' + '@prisma/adapter-pg' (and their native bindings)
        // during Turbopack page-data collection for API routes.
        // Any accidental DB access at build time will throw a clear error.
        prismaClient = new Proxy({} as PrismaClient, {
          get() {
            throw new Error(
              'Prisma client accessed during production build. ' +
              'This indicates a top-level or build-time database call in a module imported by a route. ' +
              'Move all prisma usage behind request handlers or dynamic functions.'
            )
          },
        })
      } else {
        prismaClient = globalForPrisma.prisma ?? createPrismaClient()
        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prismaClient
        }
      }
    }
    return (prismaClient as any)[prop]
  },
})

export * from './generated/client'
