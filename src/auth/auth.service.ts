import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Request, Response } from 'express';
import { User } from '../user/User.entity';
import { SMSService } from 'src/notification/services/SMS.service';
import { EmailService } from 'src/notification/services/email.service';
import { SignupDto } from './dtos/signup.dto';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import { v4 as uuidV4 } from 'uuid';
import { UserRepository } from 'src/user/user.repository';
import { jwtConstants } from './constants';
import axios from 'axios';
import TemplateEnum from 'src/notification/enums/template.enum';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private smsService: SMSService,
    private emailService: EmailService,
    private configService: ConfigService,
    private cartService: CartService,
  ) {}

  async signup(
    email: string,
    phoneNumber: string,
    firstName: string,
    lastName: string,
    password: string,
  ) {
    const user = await this.usersService.createUser({
      email,
      phoneNumber,
      firstName,
      lastName,
      password,
    });

    // generate new token
    const token = await this.signToken(user);

    // generate new refreshToken
    const refreshToken = this.usersService.generateRefreshToken();
    await this.usersService.saveRefreshToken(refreshToken, user);

    await this.cartService.createCart(user);

    return {
      user,
      token,
      refreshToken,
    };
  }

  async login(
    email: string | undefined,
    phoneNumber: string | undefined,
    pass: string,
  ): Promise<{ user: User; token: string; refreshToken: string }> {
    const user = await this.usersService.findOneByEmailOrPhoneNumber(email, phoneNumber);
    const isMatchPassword = await this.usersService.comparePassword(pass, user.password);

    if (!isMatchPassword) {
      throw new UnauthorizedException('The password is incorrect');
    }

    const token = await this.signToken(user);

    const refreshToken = this.usersService.generateRefreshToken();
    await this.usersService.saveRefreshToken(refreshToken, user);

    return {
      user,
      token,
      refreshToken,
    };
  }

  setTokenToCookie(res: Response, token: string, refreshToken: string) {
    const days = this.configService.get<number>('COOKIE_EXPIRES_DAYS_NUMBER');
    const cookieOptions: CookieOptions = {
      expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000), // expires 30 days after from now
      httpOnly: true,
      secure: false, // DEV ENVIREMENT ONLY
      path: '/',
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('token', token, cookieOptions);
    res.cookie('refresh_token', refreshToken, cookieOptions);

    return true;
  }

  async signToken(user: User) {
    const payload = { id: user.id };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }

  async generateSecretCode(user: User, length: number = 6) {
    const random_bytes = randomBytes(Math.ceil(length / 2));
    const random_number = parseInt(random_bytes.toString('hex'), 16) % 1000000; // the count of zeros should be equal to length
    const formatted_number = String(random_number).padStart(6, '0');
    return formatted_number;
  }

  decryptVerificationCode(
    verificationSecretCode: string,
  ): [secretCode: string, userId: string, timestamp: string] {
    const keyHex = this.configService.get<string>('VERIFICATION_CODE_SECRET');
    const decrypted = CryptoJS.AES.decrypt(verificationSecretCode, keyHex).toString(
      CryptoJS.enc.Utf8,
    );
    return decrypted.split(':') as [secretCode: string, userId: string, timestamp: string];
  }

  verificationCodeNotBeExpired(timestampExpires: string) {
    const now = Date.now();
    const second = 50;
    if (now - Number(timestampExpires) > second * 1000) {
      throw new BadRequestException('verification code has expired');
    }

    return false;
  }

  async sendVerificationCodeViaSMS(user: User): Promise<void> {
    const [code, userId, timestampExpires] = this.decryptVerificationCode(
      user.verificationSecretCode,
    );
    this.verificationCodeNotBeExpired(timestampExpires);
    console.log({ code });
    await this.smsService.sendSMS({
      receptor: user.phoneNumber,
      template: TemplateEnum.VERIFY,
      token: code,
    });
  }

  async sendVerificationCodeViaEmail(user: User): Promise<void> {
    const [code, userId, timestampExpires] = this.decryptVerificationCode(
      user.verificationSecretCode,
    );
    this.verificationCodeNotBeExpired(timestampExpires);
    console.log({ code });
    await this.emailService.sendVerificationCode(user, code);
  }

  generateResetPasswordToken(length: number = 6) {
    const bytes = randomBytes(Math.ceil(length / 2));
    const randomNumber = parseInt(bytes.toString('hex').slice(0, length), 16);
    return randomNumber.toString().padStart(length, '0');
  }

  async sendResetPasswordTokenViaEmail(user: User, code: string): Promise<void> {
    await this.emailService.sendResetPasswordToken(user, code);
  }

  async sendResetPasswordTokenViaSMS(user: User, code: string): Promise<void> {
    await this.smsService.sendSMS({
      receptor: user.phoneNumber,
      template: TemplateEnum.VERIFY,
      token: code,
    });
  }

  async verifyCode(user: User, token: string): Promise<boolean> {
    const [code, userId, timestampExpires] = this.decryptVerificationCode(
      user.verificationSecretCode,
    );

    if (token !== code) {
      throw new BadRequestException('the entered code is incorrect');
    }

    if (user.id !== Number(userId)) {
      throw new BadRequestException('the entered code is incorrect');
    }

    this.verificationCodeNotBeExpired(timestampExpires);

    return true;
  }

  async getNewAccessToken(refreshToken: string): Promise<string> {
    try {
      const response = await axios.post('https://accounts.google.com/o/oauth2/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to refresh the access token.');
    }
  }

  async getProfile(token: string) {
    try {
      return axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
      );
    } catch (error) {
      console.error('Failed to revoke the token:', error);
    }
  }

  async isTokenExpired(token: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
      );

      const expiresIn = response.data.expires_in;

      if (!expiresIn || expiresIn <= 0) {
        return true;
      }
    } catch (error) {
      return true;
    }
  }

  async revokeGoogleToken(token: string) {
    try {
      await axios.get(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
    } catch (error) {
      console.error('Failed to revoke the token:', error);
    }
  }

  extractTokenFromHeader(request: Request): [string, string] {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? token : undefined;
    const refreshToken = request.headers['refresh-token'];

    console.log({ accessToken });
    console.log({ refreshToken });

    return [accessToken, refreshToken as string];
  }
}
