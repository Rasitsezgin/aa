import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TwoFactorService } from './2fa.service';
import { TwoFactorController } from './2fa.controller';

@Module({
  imports: [DatabaseModule],
  providers: [TwoFactorService],
  controllers: [TwoFactorController],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
