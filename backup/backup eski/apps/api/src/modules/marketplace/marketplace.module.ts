import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [MarketplaceService],
    controllers: [MarketplaceController],
    exports: [MarketplaceService],
})
export class MarketplaceModule { }
