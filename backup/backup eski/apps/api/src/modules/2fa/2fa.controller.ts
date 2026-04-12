import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService, TwoFactorType } from './2fa.service';

// DTOs
export class SetupTwoFactorDto {
  type: TwoFactorType;
  deviceName?: string;
  phoneNumber?: string;
}

export class VerifyTwoFactorDto {
  secret: string;
  code: string;
  type: TwoFactorType;
  deviceName?: string;
  phoneNumber?: string;
}

export class VerifyCodeDto {
  code: string;
}

export class SendCodeDto {
  type: 'email' | 'sms';
  destination: string;
}

export class RememberDeviceDto {
  deviceHash: string;
  days?: number;
}

@ApiTags('2FA / Two-Factor Authentication')
@Controller('api/2fa')
export class TwoFactorController {
  constructor(private twoFactorService: TwoFactorService) {}

  /**
   * Initiate 2FA setup
   */
  @Post('setup')
  @ApiOperation({ summary: 'Start 2FA setup process' })
  @ApiResponse({
    status: 200,
    description: 'Setup initiated',
    schema: {
      example: {
        secret: 'JBSWY3DPEBLW64TMMQ======',
        qrCode: 'https://api.qrserver.com/v1/...',
        backupCodes: ['XXXX-XXXX-1', 'XXXX-XXXX-2'],
        expiresAt: '2025-03-01T10:10:00Z',
      },
    },
  })
  async setupTwoFactor(
    @Request() req: any,
    @Body() dto: SetupTwoFactorDto,
  ) {
    return this.twoFactorService.setupTwoFactor(
      req.user.id,
      dto.type,
      dto.deviceName,
    );
  }

  /**
   * Verify 2FA setup
   */
  @Post('verify-setup')
  @ApiOperation({ summary: 'Verify 2FA setup with code' })
  @ApiResponse({
    status: 200,
    description: 'Setup verified successfully',
  })
  async verifySetup(
    @Request() req: any,
    @Body() dto: VerifyTwoFactorDto,
  ) {
    return this.twoFactorService.verifySetup(
      req.user.id,
      dto.secret,
      dto.code,
      dto.type,
      dto.deviceName,
      dto.phoneNumber,
    );
  }

  /**
   * Verify TOTP code
   */
  @Post('verify-totp')
  @ApiOperation({ summary: 'Verify TOTP code' })
  @ApiResponse({
    status: 200,
    description: 'TOTP code verified',
  })
  async verifyTOTP(@Request() req: any, @Body() dto: VerifyCodeDto) {
    const isValid = await this.twoFactorService.verifyTOTP(req.user.id, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid TOTP code');
    }

    return { success: true };
  }

  /**
   * Verify backup code
   */
  @Post('verify-backup-code')
  @ApiOperation({ summary: 'Verify backup code' })
  @ApiResponse({
    status: 200,
    description: 'Backup code verified and marked as used',
  })
  async verifyBackupCode(@Request() req: any, @Body() dto: VerifyCodeDto) {
    const isValid = await this.twoFactorService.verifyBackupCode(
      req.user.id,
      dto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid backup code');
    }

    return { success: true };
  }

  /**
   * Get user's 2FA devices
   */
  @Get('devices')
  @ApiOperation({ summary: 'Get list of user 2FA devices' })
  @ApiResponse({
    status: 200,
    description: 'List of devices',
  })
  async getDevices(@Request() req: any) {
    return this.twoFactorService.getUserDevices(req.user.id);
  }

  /**
   * Get backup codes
   */
  @Get('backup-codes')
  @ApiOperation({ summary: 'Get unused backup codes' })
  @ApiResponse({
    status: 200,
    description: 'List of backup codes',
  })
  async getBackupCodes(@Request() req: any) {
    return this.twoFactorService.getUnusedBackupCodes(req.user.id);
  }

  /**
   * Regenerate backup codes
   */
  @Post('regenerate-backup-codes')
  @ApiOperation({ summary: 'Generate new backup codes' })
  @ApiResponse({
    status: 200,
    description: 'New backup codes generated',
  })
  async regenerateBackupCodes(@Request() req: any) {
    const codes = await this.twoFactorService.regenerateBackupCodes(req.user.id);
    return { backupCodes: codes };
  }

  /**
   * Set default device
   */
  @Put('devices/:deviceId/default')
  @ApiOperation({ summary: 'Set device as default' })
  @ApiResponse({
    status: 200,
    description: 'Device set as default',
  })
  async setDefaultDevice(@Request() req: any, @Param('deviceId') deviceId: string) {
    return this.twoFactorService.setDefaultDevice(req.user.id, deviceId);
  }

  /**
   * Remove device
   */
  @Delete('devices/:deviceId')
  @ApiOperation({ summary: 'Remove 2FA device' })
  @ApiResponse({
    status: 200,
    description: 'Device removed',
  })
  async removeDevice(@Request() req: any, @Param('deviceId') deviceId: string) {
    await this.twoFactorService.removeDevice(req.user.id, deviceId);
    return { success: true };
  }

  /**
   * Disable 2FA
   */
  @Post('disable')
  @ApiOperation({ summary: 'Disable 2FA for user' })
  @ApiResponse({
    status: 200,
    description: '2FA disabled',
  })
  async disableTwoFactor(@Request() req: any, @Body() dto: any) {
    await this.twoFactorService.disableTwoFactor(req.user.id, dto.password);
    return { success: true };
  }

  /**
   * Get 2FA settings
   */
  @Get('settings')
  @ApiOperation({ summary: 'Get 2FA settings' })
  @ApiResponse({
    status: 200,
    description: '2FA settings',
  })
  async getSettings(@Request() req: any) {
    return this.twoFactorService.getSettings(req.user.id);
  }

  /**
   * Send email code
   */
  @Post('send-email-code')
  @ApiOperation({ summary: 'Send 2FA code via email' })
  @ApiResponse({
    status: 200,
    description: 'Email sent',
  })
  async sendEmailCode(@Request() req: any, @Body() dto: SendCodeDto) {
    await this.twoFactorService.sendEmailCode(req.user.id, dto.destination);
    return { success: true, message: 'Code sent to email' };
  }

  /**
   * Send SMS code
   */
  @Post('send-sms-code')
  @ApiOperation({ summary: 'Send 2FA code via SMS' })
  @ApiResponse({
    status: 200,
    description: 'SMS sent',
  })
  async sendSMSCode(@Request() req: any, @Body() dto: SendCodeDto) {
    await this.twoFactorService.sendSMSCode(req.user.id, dto.destination);
    return { success: true, message: 'Code sent via SMS' };
  }

  /**
   * Verify email/SMS code
   */
  @Post('verify-email-sms-code')
  @ApiOperation({ summary: 'Verify email or SMS code' })
  @ApiResponse({
    status: 200,
    description: 'Code verified',
  })
  async verifyEmailOrSMSCode(@Request() req: any, @Body() dto: VerifyCodeDto) {
    const isValid = await this.twoFactorService.verifyEmailOrSMSCode(
      req.user.id,
      dto.code,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or expired code');
    }

    return { success: true };
  }

  /**
   * Remember device
   */
  @Post('remember-device')
  @ApiOperation({ summary: 'Remember this device (skip 2FA for X days)' })
  @ApiResponse({
    status: 200,
    description: 'Device remembered',
  })
  async rememberDevice(@Request() req: any, @Body() dto: RememberDeviceDto) {
    await this.twoFactorService.rememberDevice(
      req.user.id,
      dto.deviceHash,
      dto.days || 30,
    );
    return { success: true };
  }

  /**
   * Check if device is trusted
   */
  @Post('is-trusted-device')
  @ApiOperation({ summary: 'Check if device is trusted' })
  @ApiResponse({
    status: 200,
    description: 'Device trust status',
  })
  async isTrustedDevice(@Request() req: any, @Body() dto: any) {
    const isTrusted = await this.twoFactorService.isTrustedDevice(
      req.user.id,
      dto.deviceHash,
    );
    return { trusted: isTrusted };
  }

  /**
   * Get login attempts
   */
  @Get('login-attempts')
  @ApiOperation({ summary: 'Get recent login attempts' })
  @ApiResponse({
    status: 200,
    description: 'List of login attempts',
  })
  async getLoginAttempts(@Request() req: any) {
    return this.twoFactorService.getLoginAttempts(req.user.id);
  }

  /**
   * Get login attempts (last 24h)
   */
  @Get('login-attempts/:hours')
  @ApiOperation({ summary: 'Get login attempts for specific time period' })
  @ApiResponse({
    status: 200,
    description: 'List of login attempts',
  })
  async getLoginAttemptsForPeriod(@Request() req: any, @Param('hours') hours: number) {
    return this.twoFactorService.getLoginAttempts(req.user.id, hours);
  }
}
