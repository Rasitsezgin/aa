export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { resolveReport } from '@/lib/forum-moderation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.type !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action as 'warning' | 'ban' | 'delete' | 'dismiss';

    if (!['warning', 'ban', 'delete', 'dismiss'].includes(action)) {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }

    const result = await resolveReport({
      reportId: id,
      moderatorUserId: session.user.id,
      action,
      moderatorNote: body.moderatorNote,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Resolve report error:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}
