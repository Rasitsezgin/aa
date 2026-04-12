import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { DatabaseModule } from '../../database/database.module';
import { ScrapingModule } from '../scraping/scraping.module';

@Module({
    imports: [DatabaseModule, ScrapingModule],
    providers: [MarketplaceService],
    controllers: [MarketplaceController],
    exports: [MarketplaceService],
})
export class MarketplaceModule { }
