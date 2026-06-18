import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const categories = await prisma.forumCategory.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: { select: { boards: true } },
      boards: {
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: { select: { topics: true } },
          moderators: {
            include: {
              user: {
                include: {
                  user: { select: { firstName: true, lastName: true, email: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const formattedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    icon: cat.icon,
    color: cat.color ?? 'blue',
    displayOrder: cat.displayOrder,
    isActive: cat.isActive,
    isPrivate: cat.isPrivate,
    boardCount: cat._count.boards,
    topicCount: cat.boards.reduce((sum, b) => sum + b._count.topics, 0),
  }));

  const boards = categories.flatMap((cat) =>
    cat.boards.map((board) => ({
      id: board.id,
      name: board.name,
      slug: board.slug,
      description: board.description,
      type: board.type,
      categoryId: board.categoryId,
      parentId: board.parentId,
      icon: board.icon,
      color: board.color ?? 'blue',
      displayOrder: board.displayOrder,
      isActive: board.isActive,
      topicCount: board._count.topics,
      postCount: board.postCount ?? 0,
      lastTopicTitle: board.lastTopicTitle,
      lastPostAt: board.lastPostAt?.toISOString(),
      moderators: board.moderators.map((m) => {
        const u = m.user?.user;
        return `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() || u?.email || 'Moderatör';
      }),
    })),
  );

  return NextResponse.json({ categories: formattedCategories, boards });
}

export async function POST(req: NextRequest) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const body = (await req.json()) as {
    entity: 'category' | 'board';
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    categoryId?: string;
    type?: string;
  };

  const slug =
    body.slug ??
    body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  if (body.entity === 'category') {
    const category = await prisma.forumCategory.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        color: body.color ?? 'blue',
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  }

  const board = await prisma.forumBoard.create({
    data: {
      name: body.name,
      slug,
      description: body.description,
      categoryId: body.categoryId,
      type: (body.type as 'FORUM') ?? 'FORUM',
      color: body.color ?? 'blue',
    },
  });

  return NextResponse.json({ board }, { status: 201 });
}
