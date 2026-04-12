import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SmsService } from './sms.service';

class SendSmsDto {
  phoneNumber!: string;
  message!: string;
}

class SendBulkSmsDto {
  phoneNumbers!: string[];
  message!: string;
}

@ApiTags('SMS')
@Controller('sms')
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send single SMS' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number or message' })
  async sendSms(
    @Body() dto: SendSmsDto,
  ): Promise<{ success: boolean; messageId?: string }> {
    const result = await this.smsService.sendSms(dto.phoneNumber, dto.message);
    return {
      success: result,
      messageId: result ? `sms_${Date.now()}` : undefined,
    };
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk SMS to multiple recipients' })
  @ApiResponse({ status: 200, description: 'Bulk SMS sent successfully' })
  async sendBulkSms(@Body() dto: SendBulkSmsDto): Promise<{
    success: boolean;
    total: number;
    sent: number;
    failed: number;
    results: Array<{ phoneNumber: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{
      phoneNumber: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const phoneNumber of dto.phoneNumbers) {
      try {
        const success = await this.smsService.sendSms(phoneNumber, dto.message);
        results.push({ phoneNumber, success });
      } catch (error) {
        results.push({
          phoneNumber,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      success: failed === 0,
      total: dto.phoneNumbers.length,
      sent,
      failed,
      results,
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get SMS sending history' })
  @ApiResponse({ status: 200, description: 'SMS history retrieved' })
  async getSmsHistory(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ): Promise<{
    items: Array<{
      id: string;
      phoneNumber: string;
      message: string;
      status: string;
      sentAt: Date;
    }>;
    total: number;
  }> {
    // In a real implementation, this would query the database
    return {
      items: [],
      total: 0,
    };
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get SMS provider balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved' })
  async getBalance(): Promise<{ balance: number; currency: string }> {
    return {
      balance: 1000,
      currency: 'TRY',
    };
  }
}
