export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedForumProfile } from '@/lib/forum-server';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const authResult = await getAuthenticatedForumProfile();
    if (!authResult) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    const { eventId } = await params;

    const event = await prisma.forumEvent.findUnique({
      where: { id: eventId },
      include: {
        attendees: {
          where: { userId: authResult.profile.id, status: { not: 'cancelled' } },
          select: { id: true },
        },
        _count: { select: { attendees: true } },
      },
    });

    if (!event || event.status === 'cancelled') {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    if (new Date(event.startAt) < new Date() && event.status === 'ended') {
      return NextResponse.json({ error: 'Bu etkinlik sona erdi' }, { status: 400 });
    }

    if (event.attendees.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        attendeeCount: event._count.attendees,
      });
    }

    if (event.maxAttendees && event._count.attendees >= event.maxAttendees) {
      return NextResponse.json({ error: 'Kontenjan dolu' }, { status: 400 });
    }

    await prisma.forumEventAttendee.create({
      data: {
        eventId: event.id,
        userId: authResult.profile.id,
        status: 'registered',
      },
    });

    const attendeeCount = event._count.attendees + 1;

    return NextResponse.json({
      success: true,
      alreadyRegistered: false,
      attendeeCount,
    });
  } catch (error) {
    console.error('Event join error:', error);
    return NextResponse.json({ error: 'Katılım kaydedilemedi' }, { status: 500 });
  }
}
