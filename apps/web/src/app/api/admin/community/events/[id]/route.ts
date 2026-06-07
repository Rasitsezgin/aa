export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function requireSuperAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return session?.user?.type === 'SUPERADMIN';
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!requireSuperAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const event = await prisma.forumEvent.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.startAt !== undefined && { startAt: new Date(body.startAt) }),
        ...(body.endAt !== undefined && { endAt: body.endAt ? new Date(body.endAt) : null }),
        ...(body.isOnline !== undefined && { isOnline: body.isOnline }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.meetingUrl !== undefined && { meetingUrl: body.meetingUrl }),
        ...(body.maxAttendees !== undefined && {
          maxAttendees: body.maxAttendees ? Number(body.maxAttendees) : null,
        }),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Admin event update error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!requireSuperAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.forumEvent.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin event delete error:', error);
    return NextResponse.json({ error: 'Failed to cancel event' }, { status: 500 });
  }
}
