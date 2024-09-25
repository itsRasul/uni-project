import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './User.entity';
import { Repository } from 'typeorm';
import validator from 'validator';
import { createHash } from 'crypto';
import { updateUserNonSensitiveDataByAdminDto } from './dtos/UpdateUserNonSensitiveDataByAdmin.dto';
import { updateMeDto } from './dtos/UpdateMe.dto';
import { UpdateMyPasswordDto } from './dtos/updateMyPassword.dto';
import { UserRepository } from './user.repository';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidV4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { UserQueryStringDto } from './dtos/user-query-string.dto';

declare module 'express' {
  interface Request {
    user: User;
  }
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private userRepository: UserRepository,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async findById(userId: number) {
    return await this.userRepository.findById(userId);
  }

  async findOneByPhoneNumber(phoneNumber: string) {
    return await this.userRepository.findOneByPhoneNumber(phoneNumber);
  }

  async findByEmailOrCreate(email: string, firstName: string, lastName: string) {
    const userData = {
      email,
      firstName,
      lastName,
    };
    return this.userRepository.findByEmailOrCreate(email, userData);
  }

  async createUser(dto: Partial<User>) {
    return await this.userRepository.createUser(dto);
  }

  async isThereUserByPhoneNumber(phoneNumber: string): Promise<boolean> {
    return await this.userRepository.isThereUserByPhoneNumber(phoneNumber);
  }

  async phoneNumberVerified(user: User) {
    user.isPhoneNumberVerified = true;
    await this.userRepo.save(user);
  }

  async emailVerified(user: User) {
    user.isEmailVerified = true;
    await this.userRepo.save(user);
  }

  maskPhoneNumber(phoneNumber: string) {
    return phoneNumber.replace(/(\d{4})\d+(\d{2})/, '$1*****$2');
  }

  maskEmail(email: string) {
    const [username, domain] = email.split('@');
    const maskedUsername =
      username.slice(0, 2) + '*'.repeat(username.length - 4) + username.slice(-2);
    const maskedEmail = maskedUsername + '@' + domain;
    return maskedEmail;
  }

  formatCode(secretCode: string, userId: number) {
    return `${secretCode}:${userId}:${Date.now()}`;
  }

  encryptVerificationCode(formattedCode: string) {
    const keyHex = this.configService.get<string>('VERIFICATION_CODE_SECRET');
    const encrypted = CryptoJS.AES.encrypt(formattedCode, keyHex).toString();

    return encrypted;
  }

  async setVerificationSecretCode(user: User, secretCode: string) {
    const formattedCode = this.formatCode(secretCode, user.id);
    console.log({ formattedCode });
    const encrypted = this.encryptVerificationCode(formattedCode);
    user.verificationSecretCode = encrypted;
    await this.userRepo.save(user);
  }

  extractEmailAndPhoneNumber(emailOrPhoneNumber: string): {
    email: string | undefined;
    phoneNumber: string | undefined;
  } {
    const isEmail = validator.isEmail(emailOrPhoneNumber);
    const isPhoneNumber = validator.isMobilePhone(emailOrPhoneNumber, 'fa-IR');

    if (!isEmail && !isPhoneNumber) {
      throw new BadRequestException('Please enter a valid email or phone number');
    }

    const data = {
      email: null,
      phoneNumber: null,
    };

    if (isEmail) {
      data.email = emailOrPhoneNumber;
    } else if (isPhoneNumber) {
      data.phoneNumber = emailOrPhoneNumber;
    }

    return data;
  }

  async findOneByEmailOrPhoneNumber(email: string | undefined, phoneNumber: string | undefined) {
    return await this.userRepository.findOneByEmailOrPhoneNumber(email, phoneNumber);
  }

  checkEmailOrPhoneNumberVerified(user: User): {
    phoneNumber: string | null;
    email: string | null;
  } {
    if (!user.isPhoneNumberVerified && !user.isEmailVerified) {
      throw new ForbiddenException('Verify your mobile number or email first then try again');
    }

    const data = {
      phoneNumber: null,
      email: null,
    };

    if (user.isPhoneNumberVerified) {
      data.phoneNumber = user.phoneNumber;
      return data;
    } else if (user.isEmailVerified) {
      data.email = user.email;
      return data;
    }
  }

  hashResetPasswordToken(resetToken: string) {
    return createHash('sha256').update(resetToken).digest('hex');
  }

  async setResetPasswordToken(user: User, hashedResetPasswordToken: string) {
    user.resetPassword = {
      token: hashedResetPasswordToken,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes later
    };
    await this.userRepo.save(user);
  }

  async findOneByResetPasswordToken(hashedResetPasswordToken: string) {
    return await this.userRepository.findOneByResetPasswordToken(hashedResetPasswordToken);
  }

  async setNewPassword(user: User, newPassword: string) {
    const saltOrRounds = 12;
    user.password = await bcrypt.hash(newPassword, saltOrRounds);
    user.resetPassword.token = null;
    user.resetPassword.expires = null;
    return await this.userRepo.save(user);
  }

  async findAll(queryString: UserQueryStringDto) {
    return await this.userRepository.findAll(queryString);
  }

  async deleteUserById(userId: number) {
    const affected = await this.userRepository.deleteUserById(userId);
    return affected;
  }

  async updateUserByIdNonSensitiveData(userId: number, body: updateUserNonSensitiveDataByAdminDto) {
    const affected = await this.userRepository.updateUserByIdNonSensitiveData(userId, body);
    return affected;
  }

  async updateMe(user: User, body: updateMeDto) {
    const affected = await this.userRepository.updateMe(user, body);
    return affected;
  }

  async comparePassword(condidatePassword: string, hashedPassword: string | undefined) {
    if (!hashedPassword) {
      return false;
    }
    return await bcrypt.compare(condidatePassword, hashedPassword);
  }

  async updateMyPassword(user: User, body: UpdateMyPasswordDto) {
    const saltOrRounds = 12;
    user.password = await bcrypt.hash(body.newPassword, saltOrRounds);
    const result = await this.userRepo.save(user);
    return result;
  }

  userWithoutSensitiveData(user: User) {
    const {
      password,
      resetPassword,
      verificationSecretCode,
      refreshToken,
      ...userWithoutSensitiveData
    } = user;

    return userWithoutSensitiveData;
  }

  async save(user: User) {
    return await this.userRepo.save(user);
  }

  encryptSourceId(user: User) {
    const secret = this.configService.get<string>('GENERATE_LINK_SHARE_SECRET');
    const encryptedUserId = CryptoJS.AES.encrypt(user.id.toString(), secret).toString();
    const encodedURI = encodeURIComponent(encryptedUserId);

    return encodedURI;
  }

  decryptSourceId(sourceId: string) {
    const secret = this.configService.get<string>('GENERATE_LINK_SHARE_SECRET');
    const decodedURI = decodeURIComponent(sourceId);
    const decryptedUserId = CryptoJS.AES.decrypt(decodedURI, secret).toString(CryptoJS.enc.Utf8);

    return decryptedUserId;
  }

  async increaseCredit(inviteCode: string) {
    // const user = await this.userRepository.findByInviteCode(inviteCode);
    // return await this.userRepository.increaseCredit(user);
  }

  async generateInviteLink(user: User) {
    const domain = this.configService.get<string>('DOMAIN');
    // return `${domain}/api/v1/auth/signup?inviteCode=${user.inviteCode}`;
  }

  generateRefreshToken() {
    const refreshToken = uuidV4();
    const refreshTokenExipres =
      Date.now() + jwtConstants.refreshTokenExpiresDays * 24 * 60 * 60 * 1000; // 30 days
    const refreshTokenWithExpire = `${refreshToken}:${refreshTokenExipres}`;

    return refreshTokenWithExpire;
  }

  async saveRefreshToken(refreshToken: string, user: User) {
    user.refreshToken = user.refreshToken ?? [];
    // FIX
    if (user.refreshToken.length >= 5) {
      user.refreshToken.shift();
    }
    user.refreshToken.push(refreshToken);
    return await this.save(user);
  }

  validateRefreshToken(refreshToken: string): boolean {
    const [refreshTokenVal, refreshTokenExpires] = refreshToken.split(':');

    if (+refreshTokenExpires > Date.now()) {
      return true;
    }

    return false;
  }

  async count() {
    return await this.userRepo.count();
  }

  async findOneByRefreshToken(refreshToken: string) {
    const user = await this.userRepository.findOneByRefreshToken(refreshToken);
    return user;
  }

  async generateNewAccessTokenIfRefreshTokenValid(
    refreshToken: string,
    response: Response,
    request: Request,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('refresh token is not provided, please log in again');
    }
    const userRefreshToken = await this.findOneByRefreshToken(refreshToken);
    if (!userRefreshToken) {
      throw new UnauthorizedException('refresh token is not valid, please log in again');
    }
    const isRefreshTokenValid = this.validateRefreshToken(refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('refresh token is expired, please log in again');
    }
    // generate new access token
    const payload = { id: userRefreshToken.id };
    const token = await this.jwtService.signAsync(payload);
    // generate new refresh token
    const newRefreshToken = this.generateRefreshToken();
    const days = this.configService.get<number>('COOKIE_EXPIRES_DAYS_NUMBER');
    const cookieOptions = {
      expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000), // expires 30 days after from now
      httpOnly: true,
      secure: false, // DEV ENVIREMENT ONLY
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    response.cookie('token', token, cookieOptions);
    if (newRefreshToken) {
      response.cookie('refresh_token', newRefreshToken, cookieOptions);
    }
    request.user = userRefreshToken as User;
  }

  async getTotalUsersCount() {
    return await this.userRepo.count()
  }
}
