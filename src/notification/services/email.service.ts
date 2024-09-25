import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import * as htmlToText from 'html-to-text';
import { Transporter, createTransport } from 'nodemailer';
import { User } from 'src/user/User.entity';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      // @ts-ignore
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<string>('EMAIL_PORT'),
      auth: {
        user: this.configService.get<string>('EMAIL_AUTH_USER'),
        pass: this.configService.get<string>('EMAIL_AUTH_PASSWORD'),
      },
    });
  }

  async send(template: string, subject: string, user: User, code?: string) {
    const html = await ejs.renderFile(`${__dirname}/../../../views/email/${template}.ejs`, {
      title: subject,
      firstName: user.firstName,
      code,
    });

    const info = await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_FROM'), // sender address
      to: user.email,
      subject,
      text: htmlToText.convert(html),
      html,
    });

    console.log({ code });

    return info;
  }

  async sendVerificationCode(user: User, code: string) {
    return await this.send('verifyEmail', 'کد تایید ایمیل', user, code);
  }

  async sendResetPasswordToken(user: User, code: string) {
    return await this.send('resetPassword', 'رمز عبور خود را فراموش کرده اید؟', user, code);
  }
}
