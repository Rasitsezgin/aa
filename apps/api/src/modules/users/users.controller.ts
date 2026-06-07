import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordSelfDto } from './dto/change-password-self.dto';

interface AuthRequest extends Request {
  user: {
    id: string;
    tenantId: string;
    email: string;
  };
}

/**
 * Kullanıcı self-service API — profil ve şifre yönetimi.
 * Tüm endpoint'ler JWT ile korunur; userId body'den alınmaz.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /users/me */
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.usersService.getProfile(req.user.id, req.user.tenantId);
  }

  /** PATCH /users/me */
  @Patch('me')
  updateMe(@Req() req: AuthRequest, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, req.user.tenantId, body);
  }

  /** POST /users/me/password */
  @Post('me/password')
  changePassword(@Req() req: AuthRequest, @Body() body: ChangePasswordSelfDto) {
    return this.usersService.changePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }
}
