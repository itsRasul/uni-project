import { Injectable, Logger } from '@nestjs/common';
import * as kavenegar from 'kavenegar';
import { ISMSOptions } from '../interfaces/SMSOptions.interface';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import TemplateEnum from '../enums/template.enum';

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);

  private api: kavenegar.kavenegar.KavenegarInstance;
  constructor(
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.api = kavenegar.KavenegarApi({
      apikey: configService.get<string>('KAVENEGAR_API_KEY'),
    });
  }

  generateMessage(template: TemplateEnum, token: string) {
    let message: string;
    switch (template) {
      case TemplateEnum.VERIFY:
        message = `فروشگاه اینترنتی رستاشهر
        کد تایید شما: ${token}`;
        break;
      case TemplateEnum.RESET_PASSWORD:
        message = `فروشگاه اینترنتی رستاشهر
        کد تایید شما برای فراموشی رمز عبور: ${token}`;
        break;
    }
    return message;
  }

  async sendSMS(SMSOptions?: ISMSOptions) {
    // Sending sms for receptors with defining template and tokens
    const { receptor, template, token } = SMSOptions;
    const generatedMessage = this.generateMessage(template, token);
    const message = this.api.Send(
      {
        message: generatedMessage,
        sender: this.configService.get<string>('KAVENEGAR_SENDER_NUMBER'),
        // receptor: receptor,
        receptor: '09391653800',
      },
      function (response, status) {
        console.log({ response });
        console.log({ status });
        console.log({ generatedMessage });
      },
    );
    console.log({ SMSOptions });
  }
}
