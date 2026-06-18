/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../database/prisma.service';

type AdminRequest = Request & {
  body?: {
    adminUserId?: string;
  };
  adminUser?: {
    id: string;
    email: string | null;
    type: string;
    firstName: string | null;
    lastName: string | null;
  };
};

/**
 * Admin Auth Guard
 * Admin endpoint'lerine sadece SUPERADMIN ve ADMIN kullanıcılarının erişmesini sağlar.
 *
 * Kullanım:
 *   @UseGuards(AdminGuard)
 *   @Controller('admin')
 *   export class AdminController {}
 *
 * Header'da x-admin-id veya Authorization token beklenir.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();

    // Public endpoint'leri atla
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) return true;

    // Admin ID header'dan veya token'dan alınır
    const adminId =
      request.headers['x-admin-id'] ||
      request.body?.adminUserId ||
      this.extractAdminIdFromToken(request);

    if (!adminId) {
      throw new UnauthorizedException(
        'Admin kimlik bilgisi eksik. x-admin-id header veya geçerli bir token gerekli.',
      );
    }

    const normalizedAdminId = Array.isArray(adminId) ? adminId[0] : adminId;

    const user = await this.prisma.user.findUnique({
      where: { id: normalizedAdminId },
      select: {
        id: true,
        email: true,
        type: true,
        tenantId: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz admin kullanıcısı');
    }

    const isPlatformAdmin =
      user.type === 'SUPERADMIN' ||
      (user.type === 'ADMIN' && !user.tenantId);

    if (!isPlatformAdmin) {
      throw new ForbiddenException(
        'Bu işlem için platform yöneticisi yetkisi gerekli',
      );
    }

    // Request'e admin bilgisini ekle
    request.adminUser = user;
    return true;
  }

  private extractAdminIdFromToken(request: AdminRequest): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;

    const normalizedHeader = Array.isArray(authHeader)
      ? authHeader[0]
      : authHeader;

    // Bearer token formatı: "Bearer <token>"
    // Gerçek uygulamada JWT decode edilir
    const token = normalizedHeader.replace('Bearer ', '');
    if (token.startsWith('admin_')) {
      return token.replace('admin_', '');
    }
    return null;
  }
}

export const Public = () => SetMetadata('isPublic', true);
