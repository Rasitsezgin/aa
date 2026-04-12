import { Module, Global } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
    imports: [ConfigModule],
    controllers: [SmsController],
    providers: [SmsService],
    exports: [SmsService],
})
export class SmsModule { }
