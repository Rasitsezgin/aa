import { Module } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { DashboardSystemController } from './dashboard.controller';
import { DashboardSystemService } from './dashboard-system.service';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { SimulationService } from './simulation.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ModulesController, AnnouncementsController, DashboardSystemController, SystemController],
  providers: [ModulesService, AnnouncementsService, DashboardSystemService, SystemService, AnomalyDetectionService, SimulationService],
  exports: [ModulesService, AnnouncementsService, DashboardSystemService, SystemService, AnomalyDetectionService, SimulationService],
})
export class SystemModule { }
