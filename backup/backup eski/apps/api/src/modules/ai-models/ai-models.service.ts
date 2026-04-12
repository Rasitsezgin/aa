import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AiModel, Prisma } from '@prisma/client';

@Injectable()
export class AiModelsService {
  constructor(private prisma: PrismaService) {}

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
    // TODO: Gerçek encryption implement et
    // Şimdilik base64 encoding (production'da proper encryption kullan)
    return Buffer.from(key).toString('base64');
  }

  async decryptApiKey(encryptedKey: string): Promise<string> {
    // TODO: Gerçek decryption implement et
    return Buffer.from(encryptedKey, 'base64').toString('utf-8');
  }
}
