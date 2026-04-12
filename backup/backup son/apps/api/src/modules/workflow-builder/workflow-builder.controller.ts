import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards, Query } from '@nestjs/common';
import { WorkflowBuilderService } from './workflow-builder.service';
import { CanAccessModuleGuard } from '../../common/guards/module-access.guard';
import { RequireModule } from '../../common/decorators/require-module.decorator';

class CreateWorkflowDto {
    name: string;
    description?: string;
    nodes: any[];
    edges: any[];
    isActive?: boolean;
}

class UpdateWorkflowDto {
    name?: string;
    description?: string;
    nodes?: any[];
    edges?: any[];
    isActive?: boolean;
}

@Controller('workflows')
@UseGuards(CanAccessModuleGuard)
export class WorkflowBuilderController {
    constructor(private readonly service: WorkflowBuilderService) {}

    @Get()
    @RequireModule('INTEGRATIONS')
    async list(@Headers('x-tenant-id') tenantId: string) {
        return this.service.listWorkflows(tenantId);
    }

    @Get(':id')
    @RequireModule('INTEGRATIONS')
    async get(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
        return this.service.getWorkflow(tenantId, id);
    }

    @Post()
    @RequireModule('INTEGRATIONS')
    async create(@Headers('x-tenant-id') tenantId: string, @Body() dto: CreateWorkflowDto) {
        return this.service.createWorkflow(tenantId, dto);
    }

    @Put(':id')
    @RequireModule('INTEGRATIONS')
    async update(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
        return this.service.updateWorkflow(tenantId, id, dto);
    }

    @Delete(':id')
    @RequireModule('INTEGRATIONS')
    async remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
        return this.service.deleteWorkflow(tenantId, id);
    }

    @Post(':id/execute')
    @RequireModule('INTEGRATIONS')
    async execute(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
        return this.service.executeWorkflow(tenantId, id);
    }

    @Get('templates/list')
    @RequireModule('INTEGRATIONS')
    async templates() {
        return this.service.getTemplates();
    }

    @Get(':id/logs')
    @RequireModule('INTEGRATIONS')
    async logs(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Query('limit') limit?: string) {
        return this.service.getExecutionLogs(tenantId, id, parseInt(limit || '20'));
    }
}
