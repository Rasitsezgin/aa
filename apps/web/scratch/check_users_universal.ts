import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  let prisma;
  
  if (process.env.DATABASE_URL?.startsWith('postgresql')) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({
      adapter: new PrismaPg(pool as any),
    });
  } else {
    prisma = new PrismaClient();
  }

  const users = await prisma.user.findMany({
    select: {
      email: true,
      type: true,
    }
  });
  console.log('Current Users:', JSON.stringify(users, null, 2));
}

main()
  .catch(console.error);
