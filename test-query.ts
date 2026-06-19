import { PrismaClient } from '@pazaryonetimi/database';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing users...');
    await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          type: true,
          createdAt: true,
          tenantId: true,
          tenant: { select: { name: true } },
          twoFactorEnabled: true,
          status: true,
        },
        take: 1
    });
    console.log('Users works!');

    console.log('Testing customers...');
    await prisma.order.groupBy({
      by: ['customerEmail'],
      _sum: { totalAmount: true },
      _count: { id: true },
      _max: { orderDate: true },
      where: { customerEmail: { not: null } },
      orderBy: { _max: { orderDate: 'desc' } },
      skip: 0,
      take: 1,
    });
    console.log('Customers works!');
  } catch(e) {
    console.error('Error occurred:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
