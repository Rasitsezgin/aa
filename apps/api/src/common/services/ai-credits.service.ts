import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const PLAN_LIMITS: Record<string, number> = {
  FREE: 50,
  PRO: 200,
  ENTERPRISE: 1000,
};

@Injectable()
export class AiCreditsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCredits(tenantId: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return { used: 0, limit: 10000, remaining: 10000 };
    }

    const [tenant, settings] = await Promise.all([
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { plan: true },
      }),
      this.prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { config: true },
      }),
    ]);

    const config = (settings?.config as Record<string, unknown>) || {};
    const stored = config.aiCredits as { used?: number; limit?: number } | undefined;
    const limit = stored?.limit ?? PLAN_LIMITS[tenant?.plan || 'FREE'] ?? 200;
    const used = stored?.used ?? 0;

    return { used, limit, remaining: Math.max(0, limit - used) };
  }

  async consume(tenantId: string, amount = 1) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return { used: 0, limit: 10000, remaining: 10000 };
    }

    const credits = await this.getCredits(tenantId);
    if (credits.remaining < amount) {
      throw new HttpException(
        {
          error: 'AI kredi limiti doldu',
          code: 'AI_CREDITS_EXHAUSTED',
          credits,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
      select: { id: true, config: true },
    });

    const config = (settings?.config as Record<string, unknown>) || {};
    const stored = (config.aiCredits as { used?: number; limit?: number }) || {};
    const nextUsed = (stored.used ?? credits.used) + amount;
    const nextConfig = {
      ...config,
      aiCredits: {
        used: nextUsed,
        limit: stored.limit ?? credits.limit,
      },
    };

    if (settings) {
      await this.prisma.tenantSettings.update({
        where: { tenantId },
        data: { config: nextConfig },
      });
    } else {
      await this.prisma.tenantSettings.create({
        data: { tenantId, config: nextConfig },
      });
    }

    return {
      used: nextUsed,
      limit: stored.limit ?? credits.limit,
      remaining: Math.max(0, (stored.limit ?? credits.limit) - nextUsed),
    };
  }
}
