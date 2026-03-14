import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AiAssistantService } from './ai-assistant.service';
import { AdminGuard } from '../../common/guards/admin.guard';

type AdminAssistantRequest = Request & {
  user: {
    id: string;
    tenantId: string;
  };
};

@Controller('admin/ai-assistant')
@UseGuards(AdminGuard)
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Post('chat')
  async chat(
    @Body() data: { message: string; history?: unknown[] },
    @Req() req: AdminAssistantRequest,
  ) {
    const userId = req.user.id;
    const tenantId = req.user.tenantId; // Admin kullanıcılarının da bir tenantId'si olduğu varsayılıyor

    return this.aiAssistantService.chat(
      userId,
      tenantId,
      data.message,
      data.history || [],
    );
  }
}
