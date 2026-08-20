import { Module } from '@nestjs/common';
import { AiBlogGeneratorService } from './ai-blog-generator.service';
import { AiBlogGeneratorCron } from './ai-blog-generator.cron';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [AiBlogGeneratorService, AiBlogGeneratorCron],
  exports: [AiBlogGeneratorService],
})
export class AiBlogGeneratorModule {}
