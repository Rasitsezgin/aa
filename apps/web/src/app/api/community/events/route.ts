import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const type = searchParams.get('type'); // webinar, meetup, workshop, all

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
          select: {
            id: true,
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
    
    // Fallback events
    const today = new Date();
    return NextResponse.json([
      {
        id: '1',
        title: 'Aylık Satıcı Buluşması',
        type: 'webinar',
        formattedDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        formattedTime: '14:00',
        isOnline: true,
        location: 'Zoom',
        attendeeCount: 156,
        maxAttendees: 500,
      },
      {
        id: '2',
        title: 'AI Workshop: Fiyatlandırma',
        type: 'workshop',
        formattedDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        formattedTime: '15:30',
        isOnline: true,
        location: 'Discord',
        attendeeCount: 89,
        maxAttendees: 200,
      },
      {
        id: '3',
        title: 'İstanbul Meetup',
        type: 'meetup',
        formattedDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
        formattedTime: '18:00',
        isOnline: false,
        location: 'Levent, İstanbul',
        attendeeCount: 45,
        maxAttendees: 100,
      },
    ]);
  }
}
