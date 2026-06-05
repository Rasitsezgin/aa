import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiModel, Prisma } from '@pazaryonetimi/database';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

@Injectable()
export class AiModelsService {
  constructor(private prisma: PrismaService) {}

  private static readonly ENC_PREFIX = 'enc:v1:';

  async createModel(data: Prisma.AiModelCreateInput): Promise<AiModel> {
    return this.prisma.aiModel.create({
      data: {
        ...data,
        apiKey: data.apiKey ? await this.encryptApiKey(data.apiKey) : null,
      },
    });
  }

  async findAllActive(): Promise<AiModel[]> {
    return this.prisma.aiModel.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<AiModel | null> {
    return this.prisma.aiModel.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<AiModel | null> {
    return this.prisma.aiModel.findUnique({
      where: { slug },
    });
  }

  async updateModel(
    id: string,
    data: Prisma.AiModelUpdateInput,
  ): Promise<AiModel> {
    if (data.apiKey) {
      data.apiKey = await this.encryptApiKey(data.apiKey as string);
    }
    return this.prisma.aiModel.update({
      where: { id },
      data,
    });
  }

  async deleteModel(id: string): Promise<AiModel> {
    return this.prisma.aiModel.delete({
      where: { id },
    });
  }

  async toggleActive(id: string): Promise<AiModel> {
    const model = await this.prisma.aiModel.findUnique({ where: { id } });
    return this.prisma.aiModel.update({
      where: { id },
      data: { isActive: !model?.isActive },
    });
  }

  async incrementUsage(id: string, tokens: number = 1): Promise<AiModel> {
    return this.prisma.aiModel.update({
      where: { id },
      data: {
        tokensUsed: { increment: tokens },
        callsCount: { increment: 1 },
      },
    });
  }

  private async encryptApiKey(key: string): Promise<string> {
    const secret = process.env.AI_MODEL_ENCRYPTION_KEY;
    if (!secret) {
      // Backward compatible fallback when env is not configured.
      return Buffer.from(key).toString('base64');
    }

    const iv = randomBytes(12);
    const encryptionKey = createHash('sha256').update(secret).digest();
    const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
    const encrypted = Buffer.concat([
      cipher.update(key, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return `${AiModelsService.ENC_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  async decryptApiKey(encryptedKey: string): Promise<string> {
    if (encryptedKey.startsWith(AiModelsService.ENC_PREFIX)) {
      const secret = process.env.AI_MODEL_ENCRYPTION_KEY;
      if (!secret) {
        throw new Error('AI_MODEL_ENCRYPTION_KEY tanımlı değil');
      }

      const payload = encryptedKey.slice(AiModelsService.ENC_PREFIX.length);
      const [ivB64, tagB64, dataB64] = payload.split(':');
      if (!ivB64 || !tagB64 || !dataB64) {
        throw new Error('Geçersiz şifreli anahtar formatı');
      }

      const encryptionKey = createHash('sha256').update(secret).digest();
      const decipher = createDecipheriv(
        'aes-256-gcm',
        encryptionKey,
        Buffer.from(ivB64, 'base64'),
      );
      decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataB64, 'base64')),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    }

    // Legacy support for older base64-only stored keys.
    return Buffer.from(encryptedKey, 'base64').toString('utf-8');
  }
}
