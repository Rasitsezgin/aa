import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  currentTenantId?: string; // Added for tenant context
  private pool: Pool | null = null;
  private logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    
    let adapter;
    let pool: Pool | null = null;

    if (connectionString) {
      try {
        pool = new Pool({ connectionString });
        adapter = new PrismaPg(pool as any);
      } catch (error) {
        this.logger.warn(`Failed to create database pool: ${error.message}`);
        pool = null;
      }
    }

    super({
      ...(adapter ? { adapter } : {}),
      log: ['error', 'warn'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      if (this.pool) {
        await this.pool.end();
      }
    } catch (error) {
      this.logger.error(`Error during disconnect: ${error.message}`);
    }
  }
}
