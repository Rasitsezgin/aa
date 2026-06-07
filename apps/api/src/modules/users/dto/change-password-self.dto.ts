import { IsString, MaxLength, MinLength } from 'class-validator';

/** Oturum açmış kullanıcının şifre değiştirme DTO */
export class ChangePasswordSelfDto {
  @IsString()
  @MinLength(1, { message: 'Mevcut şifre zorunludur' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Yeni şifre en az 8 karakter olmalıdır' })
  @MaxLength(128)
  newPassword: string;
}
