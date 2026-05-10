import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool as any),
});

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@pazaryonetimi.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  console.log('Using Email:', email);
  console.log('Using Password:', password);

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
      type: 'SUPERADMIN',
      status: 'active',
      tenantId: tenant.id
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
  .finally(async () => {
      await prisma.$disconnect();
      await pool.end();
  });
