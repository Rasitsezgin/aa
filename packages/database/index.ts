import { PrismaClient } from './generated/client'

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

  // Lazy-require pg and adapter ONLY when actually creating the client.
  // This prevents Turbopack/Next.js build from loading them during static page-data collection
  // for routes that transitively import this package (e.g. /api/admin/blog/[id]).
  // Top-level import of 'pg' + '@prisma/adapter-pg' was causing "Cannot read properties of undefined (reading 'bind')".
  const nodeRequire = (typeof require !== 'undefined' ? require : (globalThis as any).require) as NodeRequire;
  const { Pool } = nodeRequire('pg');
  const { PrismaPg } = nodeRequire('@prisma/adapter-pg');

  let adapter
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    adapter = new PrismaPg(pool as any)
  } catch (error: any) {
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    console.error('Failed to create database adapter:', error.message)
  }

  return new PrismaClient({
    ...(adapter ? { adapter } : {}),
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
