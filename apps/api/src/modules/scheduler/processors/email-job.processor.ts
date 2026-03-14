import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

interface EmailJobData {
  tenantId: string;
  template: string;
  recipients: string[];
  data: Record<string, any>;
}

@Processor('emails')
export class EmailJobProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailJobProcessor.name);

  async process(job: Job<EmailJobData>): Promise<any> {
    this.logger.log(`E-posta işleniyor: ${job.data.template} - ${job.data.recipients.length} alıcı`);

    const { template, recipients, data } = job.data;

    try {
      // E-posta gönderimi simülasyonu
      // Gerçek uygulamada Nodemailer, SendGrid, AWS SES vb. kullanılır
      for (const recipient of recipients) {
        await this.sendEmail(recipient, template, data);
      }

      this.logger.log(`E-posta başarıyla gönderildi: ${recipients.join(', ')}`);

      return {
        sent: recipients.length,
        template,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`E-posta gönderme hatası: ${error.message}`);
      throw error;
    }
  }

  private async sendEmail(to: string, template: string, data: Record<string, any>): Promise<void> {
    // Simüle edilmiş e-posta gönderimi
    this.logger.debug(`E-posta gönderiliyor: ${to} - Template: ${template}`);

    // Gerçek uygulamada:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({
    //   from: 'noreply@pazaryonetimi.com',
    //   to,
    //   subject: this.getSubject(template),
    //   html: this.renderTemplate(template, data),
    // });

    // Simülasyon için kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
