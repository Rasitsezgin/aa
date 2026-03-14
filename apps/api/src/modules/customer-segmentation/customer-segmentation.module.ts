import { Module } from '@nestjs/common';
import { CustomerSegmentationService } from './customer-segmentation.service';
import { CustomerSegmentationController } from './customer-segmentation.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CustomerSegmentationService],
  controllers: [CustomerSegmentationController],
  exports: [CustomerSegmentationService],
})
export class CustomerSegmentationModule {}
