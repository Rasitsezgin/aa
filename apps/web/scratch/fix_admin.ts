import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@pazaryonetimi.com';
  const password = 'ChangeMe123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  // Find or create a tenant first
  let tenant = await prisma.tenant.findFirst({
    where: { slug: 'pazaryonetimi' }
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'PazarYönetimi',
        slug: 'pazaryonetimi',
        plan: 'PRO',
        isOnboarded: true
      }
    });
    console.log('Created Tenant:', tenant.slug);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      type: 'SUPERADMIN', // Giving superadmin access
      status: 'active'
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Yönetici',
      type: 'SUPERADMIN',
      tenantId: tenant.id,
      status: 'active'
    }
  });

  console.log('Admin user updated/created:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
