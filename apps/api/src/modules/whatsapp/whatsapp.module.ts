import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappCommandService } from './whatsapp-command.service';
import { DatabaseModule } from '../../database/database.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ConfigModule, DatabaseModule, ReportsModule],
  providers: [WhatsappService, WhatsappCommandService],
  controllers: [WhatsappController],
  exports: [WhatsappService, WhatsappCommandService],
})
export class WhatsappModule {}
