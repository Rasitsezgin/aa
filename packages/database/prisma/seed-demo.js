const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Helper to load simple .env file manually since dotenv might not be available
function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const eqIndex = trimmed.indexOf('=');
            if (eqIndex === -1) return;
            const key = trimmed.substring(0, eqIndex).trim();
            const value = trimmed.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
            if (key && !process.env[key]) {
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@pazaryonetimi.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const USER_EMAIL = process.env.SEED_USER_EMAIL || 'operator@pazaryonetimi.com';
const TENANT_SLUG = process.env.SEED_TENANT_SLUG || 'pazaryonetimi';
const TENANT_DOMAIN = process.env.SEED_TENANT_DOMAIN || 'app.pazaryonetimi.com';

if (!ADMIN_PASSWORD) {
    console.error('SEED_ADMIN_PASSWORD environment variable is required');
    process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial users (JS version) with dynamic DB URL...');

    // 1. Create or find a default Tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: TENANT_SLUG },
        update: {},
        create: {
            name: 'PazarYönetimi',
            slug: TENANT_SLUG,
            domain: TENANT_DOMAIN,
            isOnboarded: true,
            plan: 'FREE'
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
            type: 'ADMIN',
            tenantId: tenant.id,
        },
        create: {
            email: ADMIN_EMAIL,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Yönetici',
            type: 'ADMIN',
            tenantId: tenant.id,
        },
    });

    console.log(`Admin User Created: ${admin.email}`);

    // 4. Create regular User
    const user = await prisma.user.upsert({
        where: { email: USER_EMAIL },
        update: {
            password: hashedPassword,
            type: 'USER',
            tenantId: tenant.id,
        },
        create: {
            email: USER_EMAIL,
            password: hashedPassword,
            firstName: 'Operatör',
            lastName: 'Kullanıcı',
            type: 'USER',
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
    });
