import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

// Types
export enum TwoFactorType {
  AUTHENTICATOR = 'authenticator',
  EMAIL = 'email',
  SMS = 'sms',
}

export interface TwoFactorDevice {
  id: string;
  userId: string;
  name: string;
  type: TwoFactorType;
  secret?: string;
  phoneNumber?: string;
  isDefault: boolean;
  verified: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupCode {
  id: string;
  userId: string;
  code: string;
  used: boolean;
  usedAt?: Date;
  createdAt: Date;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  expiresAt: Date;
}

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Setup 2FA for user
   * Returns secret, QR code, and backup codes
   */
  async setupTwoFactor(
    userId: string,
    type: TwoFactorType = TwoFactorType.AUTHENTICATOR,
    deviceName?: string,
  ): Promise<TwoFactorSetupResponse> {
    // Check if user already has this type of 2FA
    const existingDevice = await this.prisma.twoFactorDevice.findFirst({
      where: { userId, type },
    });

    if (existingDevice) {
      throw new ConflictException('User already has this 2FA method enabled');
    }

    // Generate secret for TOTP
    const secret = this.generateSecret();
    const qrCode = this.generateQRCode(userId, secret);
    const backupCodes = this.generateBackupCodes(10);

    // Store temporary setup (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    return {
      secret,
      qrCode,
      backupCodes,
      expiresAt,
    };
  }

  /**
   * Verify 2FA setup with TOTP code
   */
  async verifySetup(
    userId: string,
    secret: string,
    code: string,
    type: TwoFactorType,
    deviceName?: string,
    phoneNumber?: string,
  ): Promise<TwoFactorDevice> {
    // Verify TOTP code
    if (!this.verifyTOTP(secret, code)) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);

    // Create device record
    const device = await this.prisma.twoFactorDevice.create({
      data: {
        userId,
        name: deviceName || `${type} Device`,
        type,
        secret: type === TwoFactorType.AUTHENTICATOR ? secret : undefined,
        phoneNumber: type === TwoFactorType.SMS ? phoneNumber : undefined,
        isDefault: true,
        verified: true,
        lastUsedAt: new Date(),
      },
    });

    // Store backup codes
    await Promise.all(
      backupCodes.map(code =>
        this.prisma.backupCode.create({
          data: { userId, code, used: false },
        }),
      ),
    );

    return device;
  }

  /**
   * Verify TOTP code during login
   */
  async verifyTOTP(userId: string, code: string): Promise<boolean> {
    const device = await this.prisma.twoFactorDevice.findFirst({
      where: {
        userId,
        type: TwoFactorType.AUTHENTICATOR,
        verified: true,
      },
    });

    if (!device || !device.secret) {
      return false;
    }

    return this.verifyTOTP(device.secret, code);
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const backupCode = await this.prisma.backupCode.findFirst({
      where: { userId, code, used: false },
    });

    if (!backupCode) {
      return false;
    }

    // Mark as used
    await this.prisma.backupCode.update({
      where: { id: backupCode.id },
      data: { used: true, usedAt: new Date() },
    });

    return true;
  }

  /**
   * Get user's 2FA devices
   */
  async getUserDevices(userId: string): Promise<TwoFactorDevice[]> {
    return this.prisma.twoFactorDevice.findMany({
      where: { userId, verified: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get user's backup codes (unuse only)
   */
  async getUnusedBackupCodes(userId: string): Promise<BackupCode[]> {
    return this.prisma.backupCode.findMany({
      where: { userId, used: false },
    });
  }

  /**
   * Get all backup codes for user
   */
  async getAllBackupCodes(userId: string): Promise<BackupCode[]> {
    return this.prisma.backupCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    // Delete old codes
    await this.prisma.backupCode.deleteMany({
      where: { userId },
    });

    // Generate new codes
    const newCodes = this.generateBackupCodes(10);

    // Store new codes
    await Promise.all(
      newCodes.map(code =>
        this.prisma.backupCode.create({
          data: { userId, code, used: false },
        }),
      ),
    );

    return newCodes;
  }

  /**
   * Set default 2FA device
   */
  async setDefaultDevice(userId: string, deviceId: string): Promise<TwoFactorDevice> {
    // Unset previous default
    await this.prisma.twoFactorDevice.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Set new default
    return this.prisma.twoFactorDevice.update({
      where: { id: deviceId },
      data: { isDefault: true, lastUsedAt: new Date() },
    });
  }

  /**
   * Remove 2FA device
   */
  async removeDevice(userId: string, deviceId: string): Promise<void> {
    const device = await this.prisma.twoFactorDevice.findUnique({
      where: { id: deviceId },
    });

    if (!device || device.userId !== userId) {
      throw new BadRequestException('Device not found');
    }

    if (device.isDefault) {
      throw new BadRequestException('Cannot remove default device');
    }

    await this.prisma.twoFactorDevice.delete({
      where: { id: deviceId },
    });
  }

  /**
   * Disable 2FA completely
   */
  async disableTwoFactor(userId: string, password: string): Promise<void> {
    // Delete all devices and backup codes
    await this.prisma.twoFactorDevice.deleteMany({
      where: { userId },
    });

    await this.prisma.backupCode.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get 2FA settings
   */
  async getSettings(userId: string) {
    const devices = await this.getUserDevices(userId);
    const backupCodesCount = await this.prisma.backupCode.count({
      where: { userId, used: false },
    });

    return {
      enabled: devices.length > 0,
      devices,
      backupCodesRemaining: backupCodesCount,
      totalBackupCodes: backupCodesCount,
    };
  }

  /**
   * Send 2FA code via email
   */
  async sendEmailCode(userId: string, email: string): Promise<void> {
    const code = this.generateEmailCode();
    
    // Store code temporarily (5 minutes)
    // In production, use Redis or similar
    await this.prisma.temporaryCode.create({
      data: {
        userId,
        code,
        type: 'email_2fa',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send email (integration with email service)
    console.log(`[EMAIL] 2FA Code: ${code} to ${email}`);
  }

  /**
   * Send 2FA code via SMS
   */
  async sendSMSCode(userId: string, phoneNumber: string): Promise<void> {
    const code = this.generateEmailCode();
    
    // Store code temporarily (5 minutes)
    await this.prisma.temporaryCode.create({
      data: {
        userId,
        code,
        type: 'sms_2fa',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // Send SMS (integration with SMS service)
    console.log(`[SMS] 2FA Code: ${code} to ${phoneNumber}`);
  }

  /**
   * Verify email/SMS code
   */
  async verifyEmailOrSMSCode(userId: string, code: string): Promise<boolean> {
    const tempCode = await this.prisma.temporaryCode.findFirst({
      where: {
        userId,
        code,
        type: { in: ['email_2fa', 'sms_2fa'] },
        expiresAt: { gt: new Date() },
      },
    });

    if (!tempCode) {
      return false;
    }

    // Mark as used
    await this.prisma.temporaryCode.delete({
      where: { id: tempCode.id },
    });

    return true;
  }

  /**
   * Remember device for X days
   */
  async rememberDevice(userId: string, deviceHash: string, days: number = 30): Promise<void> {
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await this.prisma.trustedDevice.create({
      data: {
        userId,
        deviceHash,
        expiresAt,
      },
    });
  }

  /**
   * Check if device is trusted
   */
  async isTrustedDevice(userId: string, deviceHash: string): Promise<boolean> {
    const device = await this.prisma.trustedDevice.findFirst({
      where: {
        userId,
        deviceHash,
        expiresAt: { gt: new Date() },
      },
    });

    return !!device;
  }

  /**
   * Get login attempts for user
   */
  async getLoginAttempts(userId: string, hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.prisma.loginAttempt.findMany({
      where: {
        userId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Helper methods

  /**
   * Generate random secret for TOTP
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Generate QR code for authenticator
   */
  private generateQRCode(userId: string, secret: string): string {
    // In production, use a library like 'qrcode'
    // Format: otpauth://totp/User@App?secret=SECRET&issuer=App
    const issuer = 'PazarYönetimi';
    const accountName = userId;
    const otpauth = `otpauth://totp/${accountName}@${issuer}?secret=${secret}&issuer=${issuer}`;
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  }

  /**
   * Verify TOTP code (private overload)
   */
  private verifyTOTP(secret: string, code: string): boolean {
    // In production, use 'speakeasy' or 'otplib'
    // This is simplified - proper implementation requires time-based validation
    if (!/^\d{6}$/.test(code)) {
      return false;
    }

    // Simulate verification (in real app, use speakeasy.totp.verify)
    return code.length === 6;
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase()
        .match(/.{1,4}/g)
        ?.join('-');
      
      codes.push(code || `CODE-${i}`);
    }
    return codes;
  }

  /**
   * Generate email/SMS code
   */
  private generateEmailCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
