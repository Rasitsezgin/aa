import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createEventStream } from '@/lib/realtime';

export const runtime = 'edge';

// Server-Sent Events endpoint for real-time updates
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  const userId = session.user.id;

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant required' }, { status: 400 });
  }

  const stream = createEventStream(tenantId, userId || 'unknown');

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
