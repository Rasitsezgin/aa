import { Module } from '@nestjs/common';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';
import { AiModule } from '../ai.module';
import { DatabaseModule } from '../../../database/database.module';

@Module({
    imports: [AiModule, DatabaseModule],
    controllers: [CopilotController],
    providers: [CopilotService],
    exports: [CopilotService],
})
export class CopilotModule {}
