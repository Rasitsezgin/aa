import { Module } from '@nestjs/common';
import { WorkflowBuilderController } from './workflow-builder.controller';
import { WorkflowBuilderService } from './workflow-builder.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [WorkflowBuilderController],
    providers: [WorkflowBuilderService],
    exports: [WorkflowBuilderService],
})
export class WorkflowBuilderModule {}
