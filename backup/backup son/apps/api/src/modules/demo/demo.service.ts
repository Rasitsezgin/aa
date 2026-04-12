import { Injectable, Logger } from '@nestjs/common';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class DemoService {
    private readonly logger = new Logger(DemoService.name);

    constructor(
        private readonly emailService: EmailService,
        private readonly smsService: SmsService
    ) { }

    async create(createDemoRequestDto: CreateDemoRequestDto) {
        this.logger.log(`New demo request from ${createDemoRequestDto.email}`);

        // 1. Send Admin Notification
        await this.sendAdminNotification(createDemoRequestDto);

        // 2. Send User Notification (Email)
        await this.sendUserEmailConfirmation(createDemoRequestDto);

        // 3. Send User Notification (SMS)
        await this.sendUserSmsConfirmation(createDemoRequestDto);

        return { success: true, message: 'Demo request received' };
    }

    private async sendAdminNotification(dto: CreateDemoRequestDto) {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@pazaryonetimi.com';
        const subject = `Yeni Demo Talebi: ${dto.company}`;
        const content = `
            <h1>Yeni Demo Talebi</h1>
            <p><strong>Ad Soyad:</strong> ${dto.firstName} ${dto.lastName}</p>
            <p><strong>Şirket:</strong> ${dto.company}</p>
            <p><strong>Email:</strong> ${dto.email}</p>
            <p><strong>Telefon:</strong> ${dto.phone}</p>
            <p><strong>Çalışan Sayısı:</strong> ${dto.employees}</p>
            <p><strong>Pazaryerleri:</strong> ${dto.marketplaces.join(', ')}</p>
            <p><strong>Mesaj:</strong> ${dto.message || '-'}</p>
        `;

        await this.emailService.sendSystemEmail(adminEmail, subject, content);
    }

    private async sendUserEmailConfirmation(dto: CreateDemoRequestDto) {
        const subject = 'Demo Talebiniz Alındı - PazarYönetimi';
        const content = `
            <h1>Merhaba ${dto.firstName},</h1>
            <p>PazarYönetimi demo talebiniz bize ulaştı. İlginiz için teşekkür ederiz.</p>
            <p>Ekiplerimiz talebinizi inceleyip en kısa sürede (${dto.phone}) numarasından veya bu e-posta adresinden sizinle iletişime geçecektir.</p>
            <br>
            <p>Saygılarımızla,</p>
            <p>PazarYönetimi Ekibi</p>
        `;

        await this.emailService.sendSystemEmail(dto.email, subject, content);
    }

    private async sendUserSmsConfirmation(dto: CreateDemoRequestDto) {
        const message = `Sn. ${dto.firstName} ${dto.lastName}, demo talebiniz alinmistir. Ekibimiz sizinle en kisa surede iletisime gececektir. PazarYonetimi`;
        await this.smsService.sendSms(dto.phone, message);
    }
}
