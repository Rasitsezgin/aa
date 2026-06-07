export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const type = searchParams.get('type'); // webinar, meetup, workshop, all

    const session = await auth();
    let profileId: string | null = null;

    if (session?.user?.id) {
      const profile = await prisma.forumUserProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      profileId = profile?.id ?? null;
    }

    const now = new Date();

    let whereClause: any = {
      startAt: {
        gte: now,
      },
      status: {
        not: 'cancelled',
      },
    };

    if (type && type !== 'all') {
      whereClause.type = type;
    }

    const events = await prisma.forumEvent.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        startAt: 'asc',
      },
      include: {
        attendees: {
          where: { status: { not: 'cancelled' } },
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    const formattedEvents = events.map((event) => ({
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
      attendeeCount: event.attendees.length,
      maxAttendees: event.maxAttendees,
      status: event.status,
      isRegistered: profileId
        ? event.attendees.some((a) => a.userId === profileId)
        : false,
      // Formatlanmış tarih
      formattedDate: new Date(event.startAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      formattedTime: new Date(event.startAt).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Community events error:', error);
    return NextResponse.json([]);
  }
}
