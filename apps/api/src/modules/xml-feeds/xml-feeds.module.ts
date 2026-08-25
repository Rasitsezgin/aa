import { Module } from '@nestjs/common';
import { XmlFeedsController } from './xml-feeds.controller';
import { XmlFeedsService } from './xml-feeds.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [XmlFeedsController],
  providers: [XmlFeedsService],
  exports: [XmlFeedsService],
})
export class XmlFeedsModule {}
