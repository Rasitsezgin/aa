/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
// @ts-ignore - otplib types
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TwoFactorService {
  private readonly authenticator: TOTP;

  constructor(private prisma: PrismaService) {
    this.authenticator = new TOTP({
      crypto: NobleCryptoPlugin as any,
      base32: ScureBase32Plugin as any,
    });
    
    // Config
    (this.authenticator as any).options = {
      digits: 6,
      step: 30,
      window: 1,
    };
  }

  /**
   * 2FA için yeni secret oluştur
   */
  async generateSecret(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA zaten aktif');
    }

    const secret = this.authenticator.generateSecret();
    const appName = 'PazarYonetimi';
    const otpauthUrl = String(
      (this.authenticator as any).generateURI({ issuer: appName, label: String(user.email), secret }),
    );

    // Secret'ı geçici olarak kaydet (henüz aktif değil)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    // QR kod oluştur
    const qrCodeDataUrl = await QRCode.toDataURL(String(otpauthUrl));

    return {
      secret,
      otpauthUrl,
      qrCode: qrCodeDataUrl,
    };
  }

  /**
   * 2FA'yı doğrula ve aktif et
   */
  async enableTwoFactor(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA zaten aktif');
    }
    if (!user.twoFactorSecret) {
      throw new BadRequestException('Önce QR kodu oluşturun');
    }

    const isValid = (this.authenticator as any).verifySync({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Geçersiz doğrulama kodu');
    }

    // 2FA'yı aktif et
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    // Yedek kodları oluştur
    const backupCodes = this.generateBackupCodes();

    return {
      success: true,
      message: '2FA başarıyla aktifleştirildi',
      backupCodes,
    };
  }

  /**
   * 2FA token doğrula (login sırasında)
   */
  async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    return (this.authenticator as any).verifySync({
      token,
      secret: user.twoFactorSecret,
    });
  }

  /**
   * 2FA'yı devre dışı bırak
   */
  async disableTwoFactor(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA zaten devre dışı');
    }

    // Token doğrula
    const isValid = (this.authenticator as any).verifySync({
      token,
      secret: user.twoFactorSecret!,
    });

    if (!isValid) {
      throw new BadRequestException('Geçersiz doğrulama kodu');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { success: true, message: '2FA devre dışı bırakıldı' };
  }

  /**
   * 2FA durumunu kontrol et
   */
  async getStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    return {
      enabled: user?.twoFactorEnabled || false,
    };
  }

  /**
   * Yedek kod oluştur
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }
}
