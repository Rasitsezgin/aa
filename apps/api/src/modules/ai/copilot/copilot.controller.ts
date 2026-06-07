import { Controller, Post, Body, Headers } from '@nestjs/common';
import { CopilotService } from './copilot.service';

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
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Post('chat')
  async chat(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CopilotChatDto,
  ) {
    return this.copilotService.chat(
      tenantId,
      dto.message,
      dto.history || [],
      dto.context,
    );
  }

  @Post('quick-action')
  async quickAction(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CopilotQuickActionDto,
  ) {
    return this.copilotService.executeQuickAction(
      tenantId,
      dto.action,
      dto.params || {},
    );
  }

  @Post('suggestions')
  async getSuggestions(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { currentPage?: string; context?: string },
  ) {
    return this.copilotService.getContextualSuggestions(
      tenantId,
      body.currentPage,
      body.context,
    );
  }

  @Post('daily-briefing')
  async getDailyBriefing(@Headers('x-tenant-id') tenantId: string) {
    return this.copilotService.getDailyBriefing(tenantId);
  }
}
