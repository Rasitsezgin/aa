import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Readiness probe for orchestration platforms
export async function GET() {
  const checks: Record<string, boolean> = {
    database: false,
  };

  let ready = true;

  // Database readiness
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
    ready = false;
  }

  // Add more readiness checks here (message queues, external APIs, etc.)

  if (ready) {
    return NextResponse.json(
      {
        ready: true,
        checks,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      ready: false,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: 503 }
  );
}
