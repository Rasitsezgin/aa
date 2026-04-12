import { Module } from '@nestjs/common';
import { PricingOptimizationService } from './pricing-optimization.service';
import { PricingOptimizationController } from './pricing-optimization.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [PricingOptimizationService],
  controllers: [PricingOptimizationController],
  exports: [PricingOptimizationService],
})
export class PricingOptimizationModule {}
