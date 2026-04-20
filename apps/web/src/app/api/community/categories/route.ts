import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.forumCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        boards: {
          where: {
            isActive: true,
          },
          select: {
            _count: {
              select: {
                topics: true,
              },
            },
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon || 'MessageSquare',
      color: cat.color || 'blue',
      topicCount: cat.boards.reduce((sum, board) => sum + board._count.topics, 0),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Community categories error:', error);
    
    // Fallback categories
    return NextResponse.json([
      { id: '1', name: 'Fiyatlandırma', slug: 'fiyatlandirma', icon: 'TrendingUp', color: 'emerald', topicCount: 234 },
      { id: '2', name: 'Entegrasyon', slug: 'entegrasyon', icon: 'Zap', color: 'blue', topicCount: 189 },
      { id: '3', name: 'Strateji', slug: 'strateji', icon: 'Lightbulb', color: 'amber', topicCount: 156 },
      { id: '4', name: 'Eğitim', slug: 'egitim', icon: 'BookOpen', color: 'purple', topicCount: 312 },
      { id: '5', name: 'Pazaryeri', slug: 'pazaryeri', icon: 'Globe', color: 'pink', topicCount: 278 },
      { id: '6', name: 'Teknik Destek', slug: 'teknik-destek', icon: 'HelpCircle', color: 'red', topicCount: 145 },
    ]);
  }
}
