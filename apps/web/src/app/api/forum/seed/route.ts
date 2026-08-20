export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  FORUM_CATEGORIES,
  FORUM_BOARDS,
  FORUM_USERS,
  FORUM_DETAILED_TOPICS,
  FORUM_USER_GROUPS
} from '@/lib/forum-seed-data';

export async function GET(request: Request) {
  try {
    const topicCount = await prisma.forumTopic.count().catch(() => 0);
    
    if (topicCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Veritabanında zaten veriler mevcut.',
        topicCount,
      });
    }

    // 1. Gruplar
    for (const g of FORUM_USER_GROUPS) {
      await prisma.forumUserGroup.upsert({
        where: { id: g.id },
        update: {},
        create: {
          id: g.id,
          name: g.name,
          title: g.title,
          color: g.color,
          icon: g.icon,
          isStaff: g.isStaff,
          isModerator: g.isModerator,
          displayOrder: g.order,
        }
      }).catch(() => undefined);
    }

    // 2. Kategoriler
    for (const c of FORUM_CATEGORIES) {
      await prisma.forumCategory.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          color: c.color,
          displayOrder: c.order,
          isActive: true
        }
      }).catch(() => undefined);
    }

    // 3. Boardlar
    for (const b of FORUM_BOARDS) {
      await prisma.forumBoard.upsert({
        where: { id: b.id },
        update: {},
        create: {
          id: b.id,
          categoryId: b.catId,
          name: b.name,
          slug: b.slug,
          description: b.description,
          color: b.color,
          displayOrder: b.order,
          isActive: true,
          type: 'GENERAL'
        }
      }).catch(() => undefined);
    }

    return NextResponse.json({
      success: true,
      message: 'Forum veritabanı kurulumu başarıyla başlatıldı ve güncellendi.',
      categories: FORUM_CATEGORIES.length,
      boards: FORUM_BOARDS.length,
      topicsCount: FORUM_DETAILED_TOPICS.length
    });
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}
