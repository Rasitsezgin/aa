import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [DatabaseModule],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
