export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function requireSuperAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return session?.user?.type === 'SUPERADMIN';
}

export async function GET() {
  const session = await auth();
  if (!requireSuperAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const events = await prisma.forumEvent.findMany({
      orderBy: { startAt: 'desc' },
      include: {
        _count: { select: { attendees: true } },
      },
    });

    return NextResponse.json(
      events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        startAt: event.startAt,
        endAt: event.endAt,
        timezone: event.timezone,
        isOnline: event.isOnline,
        location: event.location,
        meetingUrl: event.meetingUrl,
        maxAttendees: event.maxAttendees,
        status: event.status,
        attendeeCount: event._count.attendees,
        organizerId: event.organizerId,
      })),
    );
  } catch (error) {
    console.error('Admin events list error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!requireSuperAdmin(session) || !session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      type = 'webinar',
      startAt,
      endAt,
      isOnline = true,
      location,
      meetingUrl,
      maxAttendees,
    } = body;

    if (!title?.trim() || !startAt) {
      return NextResponse.json({ error: 'Başlık ve başlangıç tarihi zorunlu' }, { status: 400 });
    }

    const event = await prisma.forumEvent.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        type,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        isOnline: Boolean(isOnline),
        location: location?.trim() || null,
        meetingUrl: meetingUrl?.trim() || null,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        organizerId: session.user.id,
        status: 'upcoming',
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Admin event create error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
