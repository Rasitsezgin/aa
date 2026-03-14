import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';

@Module({
    imports: [EmailModule, SmsModule],
    controllers: [DemoController],
    providers: [DemoService],
})
export class DemoModule { }
