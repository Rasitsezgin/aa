import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendSms(phoneNumber: string, message: string): Promise<boolean> {
    const cleanPhone = phoneNumber.replace(/\s/g, '').replace(/^0/, '');
    
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new BadRequestException('Geçersiz telefon numarası');
    }

    const smsProvider = this.configService.get('SMS_PROVIDER');
    
    if (smsProvider === 'netgsm') {
      return this.sendNetgsm(cleanPhone, message);
    }

    if (smsProvider === 'twilio') {
      return this.sendTwilio(cleanPhone, message);
    }

    // Default: Log only (development mode)
    this.logger.log(`[SMS] Development mode - SMS to ${cleanPhone}: ${message.substring(0, 50)}...`);
    return true;
  }

  private async sendNetgsm(phone: string, message: string): Promise<boolean> {
    try {
      const username = this.configService.get('NETGSM_USERNAME');
      const password = this.configService.get('NETGSM_PASSWORD');
      const header = this.configService.get('NETGSM_HEADER', 'Pazaryonetimi');

      if (!username || !password) {
        this.logger.error('Netgsm credentials not configured');
        return false;
      }

      const response = await axios.post(
        'https://api.netgsm.com.tr/sms/send/get',
        {
          usercode: username,
          password: password,
          msgheader: header,
          gsmno: phone,
          message: message,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const result = response.data;
      // Netgsm returns "00" for success
      const success = result.startsWith('00');
      
      if (!success) {
        this.logger.error(`Netgsm error: ${result}`);
      }
      
      return success;
    } catch (error) {
      this.logger.error(`Netgsm send failed: ${(error as Error).message}`);
      return false;
    }
  }

  private async sendTwilio(phone: string, message: string): Promise<boolean> {
    try {
      const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
      const fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');

      if (!accountSid || !authToken || !fromNumber) {
        this.logger.error('Twilio credentials not configured');
        return false;
      }

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          To: `+90${phone}`,
          From: fromNumber,
          Body: message,
        },
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
        }
      );

      return response.status === 201;
    } catch (error) {
      this.logger.error(`Twilio send failed: ${(error as Error).message}`);
      return false;
    }
  }

  async getBalance(): Promise<{ provider: string; balance: number }> {
    const smsProvider = this.configService.get('SMS_PROVIDER');
    
    if (smsProvider === 'netgsm') {
      try {
        const username = this.configService.get('NETGSM_USERNAME');
        const password = this.configService.get('NETGSM_PASSWORD');

        const response = await axios.post(
          'https://api.netgsm.com.tr/balance/get',
          {
            usercode: username,
            password: password,
          }
        );

        return { provider: 'netgsm', balance: parseFloat(response.data) || 0 };
      } catch (error) {
        this.logger.error(`Netgsm balance check failed: ${(error as Error).message}`);
        return { provider: 'netgsm', balance: 0 };
      }
    }

    return { provider: smsProvider || 'none', balance: 0 };
  }
}
