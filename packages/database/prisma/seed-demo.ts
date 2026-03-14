import { PrismaClient, UserType } from '@pazaryonetimi/database';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

const prisma = new PrismaClient({
  ...(pool ? { adapter: new PrismaPg(pool as any) } : {}),
});

async function main() {
  console.log('Seeding initial users...');

  const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@pazaryonetimi.com';
  const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
  const USER_EMAIL = process.env.SEED_USER_EMAIL || 'operator@pazaryonetimi.com';
  const TENANT_SLUG = process.env.SEED_TENANT_SLUG || 'pazaryonetimi';
  const TENANT_DOMAIN = process.env.SEED_TENANT_DOMAIN || 'app.pazaryonetimi.com';

  if (!ADMIN_PASSWORD) {
    console.error('SEED_ADMIN_PASSWORD environment variable is required');
    process.exit(1);
  }

  // 1. Create or find a default Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: TENANT_SLUG },
    update: {},
    create: {
      name: 'PazarYönetimi',
      slug: TENANT_SLUG,
      domain: TENANT_DOMAIN,
      isOnboarded: true,
    },
  });

  console.log(`Using Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // 3. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password: hashedPassword,
      type: UserType.ADMIN,
      tenantId: tenant.id,
    },
    create: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Yönetici',
      type: UserType.ADMIN,
      tenantId: tenant.id,
    },
  });

  console.log(`Admin User Created: ${admin.email}`);

  // 4. Create regular User
  const user = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {
      password: hashedPassword,
      type: UserType.USER,
      tenantId: tenant.id,
    },
    create: {
      email: USER_EMAIL,
      password: hashedPassword,
      firstName: 'Operatör',
      lastName: 'Kullanıcı',
      type: UserType.USER,
      tenantId: tenant.id,
    },
  });

  console.log(`User Created: ${user.email}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (pool) {
      await pool.end();
    }
  });
