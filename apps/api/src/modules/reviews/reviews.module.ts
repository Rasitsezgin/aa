import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { DatabaseModule } from '../../database/database.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';

@Module({
  imports: [DatabaseModule, MarketplaceModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
