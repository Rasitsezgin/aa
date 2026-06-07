import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { Prisma } from '@pazaryonetimi/database';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  /** Oturum açmış kullanıcının profil bilgilerini getirir */
  async getProfile(userId: string, tenantId: string) {
    const [user, tenant, settings] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          image: true,
          type: true,
          twoFactorEnabled: true,
          password: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          plan: true,
          taxNumber: true,
          taxOffice: true,
          address: true,
          createdAt: true,
        },
      }),
      this.prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { config: true },
      }),
    ]);

    if (!user || !tenant) {
      throw new NotFoundException('Kullanıcı veya tenant bulunamadı');
    }

    const config = (settings?.config as Record<string, unknown>) ?? {};

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      phone: user.phone,
      image: user.image,
      type: user.type,
      twoFactorEnabled: user.twoFactorEnabled,
      hasPassword: Boolean(user.password),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      tenant: {
        id: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        taxNumber: tenant.taxNumber,
        taxOffice: tenant.taxOffice,
        address: tenant.address,
        createdAt: tenant.createdAt.toISOString(),
      },
      language: String(config.language ?? 'tr'),
    };
  }

  /** Profil ve şirket bilgilerini günceller */
  async updateProfile(userId: string, tenantId: string, dto: UpdateProfileDto) {
    const updates: Promise<unknown>[] = [
      this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
      }),
      this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          name: dto.company,
          taxNumber: dto.taxNumber,
          taxOffice: dto.taxOffice,
          address: dto.address,
        },
      }),
    ];

    if (dto.language) {
      const existing = await this.prisma.tenantSettings.findUnique({
        where: { tenantId },
        select: { config: true },
      });
      const config = (existing?.config as Record<string, unknown>) ?? {};
      updates.push(
        this.prisma.tenantSettings.upsert({
          where: { tenantId },
          create: {
            tenantId,
            config: { ...config, language: dto.language } as Prisma.InputJsonValue,
          },
          update: {
            config: { ...config, language: dto.language } as Prisma.InputJsonValue,
          },
        }),
      );
    }

    await Promise.all(updates);
    return this.getProfile(userId, tenantId);
  }

  /** JWT kullanıcısı için güvenli şifre değiştirme */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    await this.authService.changePassword(userId, currentPassword, newPassword);
    return { success: true, message: 'Şifre başarıyla değiştirildi' };
  }
}
