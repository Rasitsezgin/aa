import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../apps/api/.env' });

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing users...');
    const users = await prisma.user.findMany({
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
    console.log('Users works!', users.length);

    console.log('Testing customers...');
    const customers = await prisma.order.groupBy({
      by: ['customerEmail'],
      _sum: { totalAmount: true },
      _count: { id: true },
      _max: { orderDate: true },
      where: { customerEmail: { not: null } },
      orderBy: { _max: { orderDate: 'desc' } },
      skip: 0,
      take: 1,
    });
    console.log('Customers works!', customers.length);
  } catch(e) {
    console.error('Error occurred:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
