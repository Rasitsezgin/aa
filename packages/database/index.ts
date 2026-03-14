import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

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
  })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  (() => {
    globalForPrisma.prisma = createPrismaClient()
    return globalForPrisma.prisma
  })()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export * from '@prisma/client'
