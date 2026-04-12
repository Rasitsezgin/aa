import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  EmailService,
  EmailCampaign,
  EmailTemplate,
  EmailAnalytics,
} from './email.service';
import { Public } from '../auth/public.decorator';

class CreateCampaignDto {
  name!: string;
  subject!: string;
  templateId!: string;
  segmentId?: string;
  recipientEmails?: string[];
  scheduledAt?: Date;
}

class SendEmailDto {
  to!: string;
  subject!: string;
  html!: string;
  text?: string;
}

class CreateTemplateDto {
  name!: string;
  subject!: string;
  htmlContent!: string;
  type!: string;
}

@ApiTags('Email')
@Controller('email')
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(): Promise<EmailTemplate[]> {
    return this.emailService.getTemplates();
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create new email template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Body() dto: CreateTemplateDto): Promise<EmailTemplate> {
    return this.emailService.createTemplate(dto);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all email campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async getCampaigns(): Promise<EmailCampaign[]> {
    return this.emailService.getCampaigns();
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create new email campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  async createCampaign(@Body() dto: CreateCampaignDto): Promise<EmailCampaign> {
    return this.emailService.createCampaign(dto);
  }

  @Post('campaigns/:id/send')
  @ApiOperation({ summary: 'Send email campaign immediately' })
  @ApiResponse({ status: 200, description: 'Campaign sent successfully' })
  async sendCampaign(
    @Param('id') id: string,
  ): Promise<{ success: boolean; sentCount: number }> {
    return this.emailService.sendCampaign(id);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send single email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(
    @Body() dto: SendEmailDto,
  ): Promise<{ success: boolean; messageId?: string }> {
    const result = await this.emailService.sendEmail(
      dto.to,
      dto.subject,
      dto.html,
      dto.text,
    );
    return { success: result };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get email analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(
    @Query('period') period: string = '30d',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<EmailAnalytics> {
    return this.emailService.getAnalytics(period, startDate, endDate);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Delete email campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  async deleteCampaign(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.emailService.deleteCampaign(id);
  }

  @Patch('campaigns/:id/pause')
  @ApiOperation({ summary: 'Pause email campaign' })
  @ApiResponse({ status: 200, description: 'Campaign paused successfully' })
  async pauseCampaign(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.emailService.pauseCampaign(id);
  }

  @Patch('campaigns/:id/resume')
  @ApiOperation({ summary: 'Resume email campaign' })
  @ApiResponse({ status: 200, description: 'Campaign resumed successfully' })
  async resumeCampaign(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.emailService.resumeCampaign(id);
  }
}
