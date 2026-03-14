import { Controller, Post, Body, Headers, UseGuards, Sse, MessageEvent } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { CanAccessModuleGuard } from '../../../common/guards/module-access.guard';
import { RequireModule } from '../../../common/decorators/require-module.decorator';
import { Observable } from 'rxjs';

class CopilotChatDto {
    message: string;
    context?: string;
    history?: { role: string; content: string }[];
    intent?: string;
}

class CopilotQuickActionDto {
    action: string;
    params?: Record<string, any>;
}

@Controller('ai/copilot')
@UseGuards(CanAccessModuleGuard)
export class CopilotController {
    constructor(private readonly copilotService: CopilotService) {}

    @Post('chat')
    @RequireModule('AI_CONTENT')
    async chat(
        @Headers('x-tenant-id') tenantId: string,
        @Body() dto: CopilotChatDto,
    ) {
        return this.copilotService.chat(tenantId, dto.message, dto.history || [], dto.context);
    }

    @Post('quick-action')
    @RequireModule('AI_CONTENT')
    async quickAction(
        @Headers('x-tenant-id') tenantId: string,
        @Body() dto: CopilotQuickActionDto,
    ) {
        return this.copilotService.executeQuickAction(tenantId, dto.action, dto.params || {});
    }

    @Post('suggestions')
    @RequireModule('AI_CONTENT')
    async getSuggestions(
        @Headers('x-tenant-id') tenantId: string,
        @Body() body: { currentPage?: string; context?: string },
    ) {
        return this.copilotService.getContextualSuggestions(tenantId, body.currentPage, body.context);
    }

    @Post('daily-briefing')
    @RequireModule('AI_INSIGHTS')
    async getDailyBriefing(@Headers('x-tenant-id') tenantId: string) {
        return this.copilotService.getDailyBriefing(tenantId);
    }
}
