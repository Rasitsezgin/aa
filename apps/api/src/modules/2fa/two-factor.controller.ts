import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';

class Enable2FADto {
  userId: string;
  token: string;
}

class Verify2FADto {
  userId: string;
  token: string;
}

@ApiTags('Two-Factor Authentication')
@Controller('2fa')
export class TwoFactorController {
  constructor(private twoFactorService: TwoFactorService) {}

  @Get('setup')
  @ApiOperation({ summary: '2FA kurulumu için QR kodu oluştur' })
  @ApiResponse({ status: 200, description: 'QR kod ve secret döndürür' })
  async setup(@Query('userId') userId: string) {
    return this.twoFactorService.generateSecret(userId);
  }

  @Post('enable')
  @ApiOperation({ summary: '2FA aktifleştir' })
  @ApiResponse({ status: 200, description: '2FA başarıyla aktifleştirildi' })
  async enable(@Body() dto: Enable2FADto) {
    return this.twoFactorService.enableTwoFactor(dto.userId, dto.token);
  }

  @Post('verify')
  @ApiOperation({ summary: '2FA token doğrula' })
  @ApiResponse({ status: 200, description: 'Doğrulama sonucu' })
  async verify(@Body() dto: Verify2FADto) {
    const isValid = await this.twoFactorService.verifyToken(
      dto.userId,
      dto.token,
    );
    return { valid: isValid };
  }

  @Post('disable')
  @ApiOperation({ summary: '2FA devre dışı bırak' })
  @ApiResponse({ status: 200, description: '2FA devre dışı bırakıldı' })
  async disable(@Body() dto: Enable2FADto) {
    return this.twoFactorService.disableTwoFactor(dto.userId, dto.token);
  }

  @Get('status')
  @ApiOperation({ summary: '2FA durumunu kontrol et' })
  @ApiResponse({ status: 200, description: '2FA durumu' })
  async status(@Query('userId') userId: string) {
    return this.twoFactorService.getStatus(userId);
  }
}
