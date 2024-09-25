import { Module } from '@nestjs/common';
import { SMSService } from './services/SMS.service';
import { EmailService } from './services/email.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [],
  controllers: [],
  providers: [SMSService, EmailService],
  exports: [SMSService, EmailService],
})
export class NotificationModule {}
