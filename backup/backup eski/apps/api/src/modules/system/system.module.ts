import { Module } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ModulesController, AnnouncementsController],
  providers: [ModulesService, AnnouncementsService],
  exports: [ModulesService, AnnouncementsService],
})
export class SystemModule {}
