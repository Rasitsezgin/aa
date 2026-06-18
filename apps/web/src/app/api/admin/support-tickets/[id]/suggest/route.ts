import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@pazaryonetimi/database';
import { requirePlatformAdmin } from '@/lib/admin-auth';

function buildSuggestion(subject: string, lastMessage: string, priority: string): string {
  const greeting = 'Merhaba,\n\n';
  const body = lastMessage
    ? `Talebinizi inceledik. "${subject}" konusundaki mesajınız için teşekkür ederiz.\n\nSorununuzu çözmek için şu adımları öneriyoruz:\n1. İlgili modül ayarlarını kontrol edin\n2. Sorun devam ederse ekran görüntüsü ile birlikte bize yazın\n\n`
    : `"${subject}" konulu destek talebiniz alınmıştır.\n\nEkibimiz en kısa sürede size dönüş yapacaktır.\n\n`;
  const priorityNote =
    priority === 'URGENT' || priority === 'HIGH'
      ? 'Talebiniz öncelikli olarak işleme alınmıştır.\n\n'
      : '';
  const closing = 'Saygılarımızla,\nPazaryönetimi Destek Ekibi';
  return greeting + priorityNote + body + closing;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requirePlatformAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
  }

  const lastMsg = ticket.messages[0]?.content || '';
  const suggestion = buildSuggestion(ticket.subject, lastMsg, ticket.priority);

  return NextResponse.json({ suggestion });
}
