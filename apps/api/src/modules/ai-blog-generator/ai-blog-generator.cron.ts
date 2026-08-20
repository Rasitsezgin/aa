import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AiBlogGeneratorService } from './ai-blog-generator.service';

@Injectable()
export class AiBlogGeneratorCron {
  private readonly logger = new Logger(AiBlogGeneratorCron.name);

  constructor(private readonly aiBlogGeneratorService: AiBlogGeneratorService) {}

  // Run at 02:00 AM every day
  @Cron('0 2 * * *', {
    name: 'generate_daily_blogs',
    timeZone: 'Europe/Istanbul',
  })
  async handleDailyBlogGeneration() {
    this.logger.log('Cron triggered: generate_daily_blogs');
    await this.aiBlogGeneratorService.generateDailyBlogs();
  }
}
